import express from "express";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { db } from "./db";
import { admins, sections, images, packages, reviews } from "./schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { Client } from "basic-ftp";
import nodemailer from "nodemailer";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

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
  "https://photoshoot-backend-n9au.onrender.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://localhost:5173", // ✅ Add this
  "http://127.0.0.1:5173", // ✅ Add this
  "https://5331a89b-2c98-4155-a4a8-1440e1123b0a-00-18h3kkx7t2kx3.pike.replit.dev",
  process.env.FRONTEND_URL,
  process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "photography-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

const requireAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

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

    req.session.adminId = admin.id;
    res.json({
      message: "Login successful",
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

app.get("/api/auth/check", (req, res) => {
  if (req.session.adminId) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

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

app.put("/api/sections/:id", requireAuth, async (req, res) => {
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

app.post("/api/sections", requireAuth, async (req, res) => {
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
  requireAuth,
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
      // attach error message manually
      (req as any).fileValidationError = "Only image files are allowed!";
      return cb(null, false);
    }
    cb(null, true);
  },
});

// FTP Configuration

// API endpoint to replace image via FTP
app.post(
  "/api/images/replace-ftp",
  uploads.single("image"),
  async (req, res) => {
    const client = new Client();
    client.ftp.verbose = true; // Enable logging for debugging

    let tempFilePath = null;

    try {
      // Check if file was uploaded
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

      // Navigate to public_html directory
      await client.cd("public_html");
      console.log("Changed to public_html directory");

      // Extract the filename from imagePath
      // Example: if imagePath is "https://yoursite.com/uploads/image123.jpg"
      // we want to upload to public_html/uploads/image123.jpg
      const urlPath = new URL(imagePath).pathname; // Gets "/uploads/image123.jpg"
      const remotePath = urlPath.startsWith("/")
        ? urlPath.substring(1)
        : urlPath;

      // Get directory path and filename
      const remoteDir = path.dirname(remotePath);
      const remoteFileName = path.basename(remotePath);

      console.log("Remote path:", remotePath);
      console.log("Remote directory:", remoteDir);
      console.log("Remote filename:", remoteFileName);

      // Navigate to the target directory (create if doesn't exist)
      if (remoteDir && remoteDir !== ".") {
        const dirs = remoteDir.split("/");
        for (const dir of dirs) {
          if (dir) {
            try {
              await client.cd(dir);
            } catch (err) {
              // Directory doesn't exist, create it
              await client.ensureDir(dir);
            }
          }
        }
      }

      // Upload the file (this will overwrite if exists)
      console.log("Uploading file...");
      await client.uploadFrom(tempFilePath, remoteFileName);
      console.log("File uploaded successfully");

      // Close FTP connection
      client.close();

      // Delete temporary file
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
    } catch (error) {
      console.error("Error replacing image:", error);

      // Close FTP connection if still open
      client.close();

      // Clean up temporary file
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

app.put("/api/images/:id", requireAuth, async (req, res) => {
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

app.delete("/api/images/:id", requireAuth, async (req, res) => {
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
// packages
app.get("/api/packages", async (req, res) => {
  const data = await db.select().from(packages).orderBy(packages.order);
  res.json(data);
});

app.post("/api/packages", requireAuth, async (req, res) => {
  const [record] = await db.insert(packages).values(req.body).returning();
  res.json(record);
});

app.put("/api/packages/:id", requireAuth, async (req, res) => {
  const [record] = await db
    .update(packages)
    .set(req.body)
    .where(eq(packages.id, parseInt(req.params.id)))
    .returning();
  res.json(record);
});

app.delete("/api/packages/:id", requireAuth, async (req, res) => {
  await db.delete(packages).where(eq(packages.id, parseInt(req.params.id)));
  res.json({ success: true });
});
// reviews
app.get("/api/reviews", async (req, res) => {
  const data = await db.select().from(reviews);
  res.json(data);
});

app.post("/api/reviews", requireAuth, async (req, res) => {
  const [record] = await db.insert(reviews).values(req.body).returning();
  res.json(record);
});

app.put("/api/reviews/:id", requireAuth, async (req, res) => {
  const [record] = await db
    .update(reviews)
    .set(req.body)
    .where(eq(reviews.id, parseInt(req.params.id)))
    .returning();
  res.json(record);
});

app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
  await db.delete(reviews).where(eq(reviews.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// PRE-REGISTRATION EMAIL API
app.post("/api/pre-register", async (req, res) => {
  try {
    const data = req.body;

    if (!data.firstName || !data.email || !data.phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-row {
      display: table;
      width: 100%;
      margin-bottom: 12px;
    }
    .info-label {
      display: table-cell;
      width: 40%;
      font-size: 14px;
      color: #666666;
      padding: 8px 0;
    }
    .info-value {
      display: table-cell;
      width: 60%;
      font-size: 14px;
      color: #333333;
      font-weight: 500;
      padding: 8px 0;
    }
    .special-requests {
      background-color: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .special-requests p {
      margin: 0;
      font-size: 14px;
      color: #333333;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #999999;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #e0e7ff;
      color: #667eea;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📸 New Pre-Registration</h1>
      <p>You have received a new booking inquiry</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Client Information</div>
        <div class="info-row">
          <div class="info-label">Full Name</div>
          <div class="info-value">${data.firstName} ${data.lastName || ""}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email</div>
          <div class="info-value">${data.email}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.phone}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <div class="info-label">Photoshoot Type</div>
          <div class="info-value">
            ${data.photoshootType}
            <div class="badge">${data.photoshootType}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">Preferred Date</div>
          <div class="info-value">${data.preferredDate || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Preferred Time</div>
          <div class="info-value">${data.preferredTime || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Participants</div>
          <div class="info-value">${data.participants || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Location Type</div>
          <div class="info-value">${data.locationType || "Not specified"}</div>
        </div>
      </div>

      ${
        data.specialRequests
          ? `
      <div class="section">
        <div class="section-title">Special Requests</div>
        <div class="special-requests">
          <p>${data.specialRequests}</p>
        </div>
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>This is an automated notification from Shooting Zone</p>
      <p style="margin-top: 8px;">Please respond to the client within 24 hours</p>
    </div>
  </div>
</body>
</html>
`;

    // Send email
    await transporter.sendMail({
      from: `"Shooting Zone" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Pre-Registration from ${data.firstName}`,
      html: htmlContent,
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

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 20px;
        }
        .email-wrapper {
          max-width: 640px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 60px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(100px, -100px);
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .header-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: inline-block;
        }
        .header h1 {
          color: #ffffff;
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.8px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.95);
          font-size: 15px;
          font-weight: 500;
        }
        .content {
          padding: 50px 40px;
          background-color: #ffffff;
        }
        .sender-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          border: 2px solid #e0f2fe;
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 35px;
        }
        .sender-name {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 16px;
          letter-spacing: -0.3px;
        }
    
        /* 🔥 FIX: Email and phone in separate lines */
        .sender-contact {
          display: block;
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 6px 0;
          font-size: 15px;
          color: #334155;
        }
    
        .contact-icon {
          color: #2563eb;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .contact-value {
          word-break: break-word;
          line-height: 1.5;
          color: #1e293b;
          font-weight: 500;
        }
        .section {
          margin-bottom: 35px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #2563eb;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-divider {
          flex-grow: 1;
          height: 2px;
          background: linear-gradient(90deg, #2563eb 0%, #e0f2fe 100%);
          border-radius: 1px;
        }
        .subject-field {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
          border: 2px solid #fcd34d;
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 20px;
        }
        .subject-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #92400e;
          margin-bottom: 8px;
        }
        .subject-value {
          font-size: 16px;
          color: #1e293b;
          font-weight: 600;
          line-height: 1.5;
          word-break: break-word;
        }
        .message-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 5px solid #2563eb;
          border-radius: 8px;
          padding: 24px;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
        .message-box p {
          color: #334155;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-weight: 400;
        }
        .cta-note {
          background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
          border: 2px solid #0ea5e9;
          border-radius: 10px;
          padding: 18px 22px;
          margin-top: 25px;
          font-size: 14px;
          color: #0c4a6e;
        }
        .cta-highlight {
          color: #0369a1;
          font-weight: 700;
        }
        .footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e2e8f0;
          padding: 35px 40px;
          text-align: center;
        }
        .footer-text {
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 400;
        }
        .footer-brand {
          color: #2563eb;
          font-weight: 700;
        }
        .footer-timestamp {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 16px;
          font-weight: 500;
        }
        @media (max-width: 480px) {
          .email-wrapper { border-radius: 8px; }
          .header { padding: 40px 24px; }
          .header-icon { font-size: 40px; }
          .header h1 { font-size: 28px; }
          .content { padding: 30px 24px; }
          .sender-card { padding: 20px; }
          .sender-name { font-size: 20px; }
          .footer { padding: 25px 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="header-content">
            <div class="header-icon">💬</div>
            <h1>New Message</h1>
            <p>You have received a new inquiry</p>
          </div>
        </div>
    
        <div class="content">
          <div class="sender-card">
            <div class="sender-name">${data.name}</div>
            <div class="sender-contact">
              <div class="contact-item">
                <span class="contact-icon">✉</span>
                <span class="contact-value">${data.email}</span>
              </div>
              ${data.phone ? `
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span class="contact-value">${data.phone}</span>
              </div>` : ''}
            </div>
          </div>
    
          ${data.subject ? `
          <div class="section">
            <div class="section-title">
              <span>Subject</span>
              <div class="section-divider"></div>
            </div>
            <div class="subject-field">
              <div class="subject-label">Message Topic</div>
              <div class="subject-value">${data.subject}</div>
            </div>
          </div>` : ''}
    
          <div class="section">
            <div class="section-title">
              <span>Message</span>
              <div class="section-divider"></div>
            </div>
            <div class="message-box">
              <p>${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          </div>
    
          <div class="cta-note">
            <span class="cta-highlight">Action Required:</span> Please respond within 24 hours.
          </div>
        </div>
    
        <div class="footer">
          <p class="footer-text">
            This is an automated notification from <span class="footer-brand">Shooting Zone</span><br>
            Do not reply directly.
          </p>
          <p class="footer-timestamp">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
    

    await transporter.sendMail({
      from: `"Shooting Zone Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${data.subject}`,
      html: htmlContent,
    });

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Contact form email error:", error);
    res.status(500).json({ error: "Email failed" });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});
