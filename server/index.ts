import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { db } from "./db";
import {
  admins,
  sections,
  images,
  packages,
  reviews,
  menupackages,
} from "./schema";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { Client } from "basic-ftp";
import nodemailer from "nodemailer";
import {
  contactHtmlContent,
  preRegisterHtmlContent,
} from "./types/emailTemplate";

const app = express();
const PORT = Number(process.env.PORT) || 3000; //don't change port

// JWT Secret - MUST be set in .env file
const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables!");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const allowedOrigins = [
  "https://shootingzonehyderabad.com",
  "https://www.shootingzonehyderabad.com",
  "https://photoshoot-backend-n9au.onrender.com",
  "https://app.powerfolio.in",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // console.log("CORS origin received:", origin);
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    cors(corsOptions)(req, res, () => {
      res.sendStatus(204);
    });
  } else {
    next();
  }
});

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

// Extend Express Request type to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: number;
      username?: string;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header
 */
const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any as {
      adminId: number;
      username: string;
    };

    req.adminId = decoded.adminId;
    req.username = decoded.username;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// ========================================
// AUTH ROUTES
// ========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
      },
      JWT_SECRET!,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: "Logout successful" });
});

app.get("/api/auth/check", authenticateToken, (req, res) => {
  // If middleware passes, user is authenticated
  res.json({
    authenticated: true,
    adminId: req.adminId,
    username: req.username,
  });
});

// ========================================
// SECTIONS ROUTES
// ========================================

app.get("/api/sections", async (req, res) => {
  try {
    const { published } = req.query;
    let query = db.select().from(sections);

    if (published === "true") {
      query = query.where(eq(sections.isPublished, true)) as any;
    }

    const allSections = await query;
    res.json(allSections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

app.get("/api/sections/:id", async (req, res) => {
  try {
    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, parseInt(req.params.id)));

    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ error: "Failed to fetch section" });
  }
});

app.put("/api/sections/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, content, isPublished } = req.body;
    const sectionId = parseInt(req.params.id);

    const [updatedSection] = await db
      .update(sections)
      .set({
        title,
        description,
        content,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(sections.id, sectionId))
      .returning();

    res.json(updatedSection);
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ error: "Failed to update section" });
  }
});

app.post("/api/sections", authenticateToken, async (req, res) => {
  try {
    const { page, sectionKey, title, description, content } = req.body;

    const [newSection] = await db
      .insert(sections)
      .values({
        page,
        sectionKey,
        title,
        description,
        content,
        isPublished: false,
      })
      .returning();

    res.json(newSection);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
});

// ========================================
// IMAGES ROUTES
// ========================================

app.get("/api/images", async (req, res) => {
  try {
    const { published } = req.query;
    let query = db.select().from(images);

    if (published === "true") {
      query = query.where(eq(images.isPublished, true)) as any;
    }

    const allImages = await query;
    res.json(allImages);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.post(
  "/api/images/upload",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { imageKey, sectionId, altText } = req.body;
      const imagePath = `/uploads/${req.file.filename}`;

      const [newImage] = await db
        .insert(images)
        .values({
          imageKey,
          sectionId: sectionId ? parseInt(sectionId) : null,
          imagePath,
          altText: altText || "",
          isPublished: false,
        })
        .returning();

      res.json(newImage);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

const uploads = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      (req as any).fileValidationError = "Only image files are allowed!";
      return cb(null, false);
    }
    cb(null, true);
  },
});

app.post(
  "/api/images/replace-ftp",
  uploads.single("image"),
  async (req, res) => {
    const client = new Client();
    client.ftp.verbose = true;

    let tempFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      tempFilePath = req.file.path;
      const { imageKey, imagePath, imageId } = req.body;

      if (!imageKey || !imagePath) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: imageKey or imagePath",
        });
      }

      console.log("Connecting to FTP server...");
      await client.access({
        host: process.env.FTP_HOST!,
        user: process.env.FTP_USER!,
        password: process.env.FTP_PASSWORD!,
        port: Number(process.env.FTP_PORT!),
        secure: process.env.FTP_SECURE === "true",
      });
      console.log("Connected successfully");

      // Print current directory BEFORE any cd()
      const currentDir = await client.pwd();
      console.log("Current FTP working directory:", currentDir);

      // await client.cd("public_html");
      // console.log("Changed to public_html directory");

      // List files/folders inside the current directory
      const rootContents = await client.list();
      console.log("Root directory contents:");
      for (const item of rootContents) {
        console.log(" -", item.name, item.isDirectory ? "[DIR]" : "[FILE]");
      }

      // Step 2: cd domains
      await client.cd("domains");
      // Step 3: cd shootingzonehyderabad.com
      await client.cd("shootingzonehyderabad.com");
      // Step 4: cd public_html
      await client.cd("public_html");
    

      const urlPath = new URL(imagePath).pathname;
      const remotePath = urlPath.startsWith("/")
        ? urlPath.substring(1)
        : urlPath;

      const remoteDir = path.dirname(remotePath);
      const remoteFileName = path.basename(remotePath);

      console.log("Remote path:", remotePath);
      console.log("Remote directory:", remoteDir);
      console.log("Remote filename:", remoteFileName);

      if (remoteDir && remoteDir !== ".") {
        const dirs = remoteDir.split("/");
        for (const dir of dirs) {
          if (dir) {
            try {
              await client.cd(dir);
            } catch (err) {
              await client.ensureDir(dir);
            }
          }
        }
      }

      console.log("Uploading file...");
      await client.uploadFrom(tempFilePath, remoteFileName);
      console.log("File uploaded successfully");

      client.close();

      fs.unlink(tempFilePath, (err) => {
        if (err) {
          console.error("Failed to delete temp file:", err);
        }
      });
      console.log("Temporary file deleted");

      res.json({
        success: true,
        message: "Image replaced successfully",
        imagePath: imagePath,
        imageKey: imageKey,
      });
      console.log("Image replaced successfully");
    } catch (error) {
      console.error("Error replacing image:", error);

      client.close();

      if (tempFilePath) {
        try {
          fs.unlink(tempFilePath, (err) => {
            if (err) {
              console.error("Failed to delete temp file:", err);
            }
          });
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to replace image",
        error: error,
      });
    }
  }
);

app.put("/api/images/:id", authenticateToken, async (req, res) => {
  try {
    const { altText, isPublished, order } = req.body;
    const imageId = parseInt(req.params.id);

    const [updatedImage] = await db
      .update(images)
      .set({
        altText,
        isPublished,
        order,
        updatedAt: new Date(),
      })
      .where(eq(images.id, imageId))
      .returning();

    res.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: "Failed to update image" });
  }
});

app.delete("/api/images/:id", authenticateToken, async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId));

    if (image) {
      const filePath = path.join(process.cwd(), "public", image.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.delete(images).where(eq(images.id, imageId));
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// ========================================
// PACKAGES ROUTES
// ========================================

app.get("/api/packages", async (req, res) => {
  const data = await db.select().from(packages).orderBy(asc(packages.id));
  res.json(data);
});

app.post("/api/packages", authenticateToken, async (req, res) => {
  const [record] = await db.insert(packages).values(req.body).returning();
  res.json(record);
});

app.put("/api/packages/:id", authenticateToken, async (req, res) => {
  console.log("Updating package ID:", req.params.id, "with data:", req.body);

  const fixedBody = {
    ...req.body,
    createdAt: req.body.createdAt ? new Date(req.body.createdAt) : undefined,
    updatedAt: req.body.updatedAt ? new Date(req.body.updatedAt) : new Date(),
  };

  const [record] = await db
    .update(packages)
    .set(fixedBody)
    .where(eq(packages.id, parseInt(req.params.id)))
    .returning();

  res.json(record);
});

app.delete("/api/packages/:id", authenticateToken, async (req, res) => {
  await db.delete(packages).where(eq(packages.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// ========================================
// MENU PACKAGES ROUTES
// ========================================

app.get("/api/menupackages", async (req, res) => {
  try {
    const { category, published } = req.query;
    console.log("Query params:", req.query);
    let query = db.select().from(menupackages).orderBy(asc(menupackages.id));

    if (typeof category === "string") {
      query = query.where(eq(menupackages.category, category)) as any;
    }
    if (published === "true") {
      query = query.where(eq(menupackages.isPublished, true)) as any;
    }

    const data = await query;
    res.json(data);
  } catch (error) {
    console.error("Error fetching menupackages:", error);
    res.status(500).json({ error: "Failed to fetch menupackages" });
  }
});

app.post("/api/menupackages", authenticateToken, async (req, res) => {
  try {
    const [record] = await db.insert(menupackages).values(req.body).returning();
    res.json(record);
  } catch (error) {
    console.error("Error creating menupackage:", error);
    res.status(500).json({ error: "Failed to create menupackage" });
  }
});

app.put("/api/menupackages/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const safeData = { ...req.body };
    delete safeData.createdAt;
    delete safeData.updatedAt;

    console.log("Updating menupackage ID:", id, "with data:", safeData);

    const [record] = await db
      .update(menupackages)
      .set({
        ...safeData,
        updatedAt: new Date(), // always regenerate on backend
      })
      .where(eq(menupackages.id, id))
      .returning();

    res.json(record);
  } catch (error) {
    console.error("Error updating menupackage:", error);
    res.status(500).json({ error: "Failed to update menupackage" });
  }
});

app.delete("/api/menupackages/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(menupackages).where(eq(menupackages.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting menupackage:", error);
    res.status(500).json({ error: "Failed to delete menupackage" });
  }
});

// ========================================
// REVIEWS ROUTES
// ========================================

app.get("/api/reviews", async (req, res) => {
  const data = await db.select().from(reviews).orderBy(asc(reviews.id));
  res.json(data);
});

app.post("/api/reviews", authenticateToken, async (req, res) => {
  const [record] = await db.insert(reviews).values(req.body).returning();
  res.json(record);
});

app.put("/api/reviews/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Remove timestamps from request body
    const safeData = { ...req.body };
    delete safeData.createdAt;
    delete safeData.updatedAt;

    const [record] = await db
      .update(reviews)
      .set({
        ...safeData,
        updatedAt: new Date(), // always update timestamp on backend
      })
      .where(eq(reviews.id, id))
      .returning();

    res.json(record);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

app.delete("/api/reviews/:id", authenticateToken, async (req, res) => {
  await db.delete(reviews).where(eq(reviews.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// ========================================
// PUBLIC EMAIL ROUTES (NO AUTH REQUIRED)
// ========================================

app.post("/api/pre-register", async (req, res) => {
  try {
    const data = req.body;

    if (!data.firstName || !data.email || !data.phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Shooting Zone" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Pre-Registration from ${data.firstName}`,
      html: preRegisterHtmlContent(data),
    });

    res.json({ success: true, message: "Pre-registration email sent" });
  } catch (error) {
    console.error("Pre-register email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Shooting Zone Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${data.subject}`,
      html: contactHtmlContent(data),
    });

    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form email error:", error);
    res.status(500).json({ error: "Email failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`JWT authentication enabled`);
});
