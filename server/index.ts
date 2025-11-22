import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { db } from './db';
import { admins, sections, images, packages, reviews } from './schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Client } from "basic-ftp";


const app = express();
const PORT = Number(process.env.PORT) || 3001;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
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
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'http://localhost:5173',      // ✅ Add this
  'http://127.0.0.1:5173',      // ✅ Add this
  'https://5331a89b-2c98-4155-a4a8-1440e1123b0a-00-18h3kkx7t2kx3.pike.replit.dev',
  process.env.FRONTEND_URL,
  'https://shootingzonehyderabad.com/public/',
  'https://shootingzonehyderabad.com/',
  


  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'photography-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

declare module 'express-session' {
  interface SessionData {
    adminId?: number;
  }
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const [admin] = await db.select().from(admins).where(eq(admins.username, username));

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.adminId = admin.id;
    res.json({ message: 'Login successful', admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session.adminId) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/api/sections', async (req, res) => {
  try {
    const { published } = req.query;
    let query = db.select().from(sections);
    
    if (published === 'true') {
      query = query.where(eq(sections.isPublished, true)) as any;
    }
    
    const allSections = await query;
    res.json(allSections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

app.get('/api/sections/:id', async (req, res) => {
  try {
    const [section] = await db.select().from(sections).where(eq(sections.id, parseInt(req.params.id)));
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

app.put('/api/sections/:id', requireAuth, async (req, res) => {
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
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

app.post('/api/sections', requireAuth, async (req, res) => {
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
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const { published } = req.query;
    let query = db.select().from(images);
    
    if (published === 'true') {
      query = query.where(eq(images.isPublished, true)) as any;
    }
    
    const allImages = await query;
    res.json(allImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.post('/api/images/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { imageKey, sectionId, altText } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    const [newImage] = await db
      .insert(images)
      .values({
        imageKey,
        sectionId: sectionId ? parseInt(sectionId) : null,
        imagePath,
        altText: altText || '',
        isPublished: false,
      })
      .returning();

    res.json(newImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});


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
app.post('/api/images/replace-ftp', uploads.single('image'), async (req, res) => {
  const client = new Client();
  client.ftp.verbose = true; // Enable logging for debugging
  
  let tempFilePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    tempFilePath = req.file.path;
    const { imageKey, imagePath, imageId } = req.body;

    if (!imageKey || !imagePath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: imageKey or imagePath' 
      });
    }

    console.log('Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      port: Number(process.env.FTP_PORT!),
      secure: process.env.FTP_SECURE === "true"
    });    
    console.log('Connected successfully');

    // Navigate to public_html directory
    await client.cd('public_html');
    console.log('Changed to public_html directory');

    // Extract the filename from imagePath
    // Example: if imagePath is "https://yoursite.com/uploads/image123.jpg"
    // we want to upload to public_html/uploads/image123.jpg
    const urlPath = new URL(imagePath).pathname; // Gets "/uploads/image123.jpg"
    const remotePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
    
    // Get directory path and filename
    const remoteDir = path.dirname(remotePath);
    const remoteFileName = path.basename(remotePath);

    console.log('Remote path:', remotePath);
    console.log('Remote directory:', remoteDir);
    console.log('Remote filename:', remoteFileName);

    // Navigate to the target directory (create if doesn't exist)
    if (remoteDir && remoteDir !== '.') {
      const dirs = remoteDir.split('/');
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
    console.log('Uploading file...');
    await client.uploadFrom(tempFilePath, remoteFileName);
    console.log('File uploaded successfully');

    // Close FTP connection
    client.close();

    // Delete temporary file
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        console.error('Failed to delete temp file:', err);
      }
    });
    console.log('Temporary file deleted');

    res.json({ 
      success: true, 
      message: 'Image replaced successfully',
      imagePath: imagePath,
      imageKey: imageKey
    });

  } catch (error) {
    console.error('Error replacing image:', error);
    
    // Close FTP connection if still open
    client.close();

    // Clean up temporary file
    if (tempFilePath) {
      try {
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            console.error('Failed to delete temp file:', err);
          }
        });
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to replace image',
      error: error 
    });
  }
});


app.put('/api/images/:id', requireAuth, async (req, res) => {
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
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

app.delete('/api/images/:id', requireAuth, async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    const [image] = await db.select().from(images).where(eq(images.id, imageId));
    
    if (image) {
      const filePath = path.join(process.cwd(), 'public', image.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await db.delete(images).where(eq(images.id, imageId));
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});
// packages
app.get('/api/packages', async (req, res) => {
  const data = await db.select().from(packages).orderBy(packages.order);
  res.json(data);
});

app.post('/api/packages', requireAuth, async (req, res) => {
  const [record] = await db.insert(packages).values(req.body).returning();
  res.json(record);
});

app.put('/api/packages/:id', requireAuth, async (req, res) => {
  const [record] = await db.update(packages)
    .set(req.body)
    .where(eq(packages.id, parseInt(req.params.id)))
    .returning();
  res.json(record);
});

app.delete('/api/packages/:id', requireAuth, async (req, res) => {
  await db.delete(packages).where(eq(packages.id, parseInt(req.params.id)));
  res.json({ success: true });
});
// reviews
app.get('/api/reviews', async (req, res) => {
  const data = await db.select().from(reviews);
  res.json(data);
});

app.post('/api/reviews', requireAuth, async (req, res) => {
  const [record] = await db.insert(reviews).values(req.body).returning();
  res.json(record);
});

app.put('/api/reviews/:id', requireAuth, async (req, res) => {
  const [record] = await db.update(reviews)
    .set(req.body)
    .where(eq(reviews.id, parseInt(req.params.id)))
    .returning();
  res.json(record);
});

app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  await db.delete(reviews).where(eq(reviews.id, parseInt(req.params.id)));
  res.json({ success: true });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
