import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '8388608'),
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'audio/mpeg',
      'application/pdf',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// 上传文件
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // 如果是图片，生成缩略图
    let thumbnail: string | undefined;
    if (req.file.mimetype.startsWith('image/')) {
      const thumbnailName = `thumb_${req.file.filename}`;
      await sharp(req.file.path)
        .resize(400, 400, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(path.join(req.file.destination, thumbnailName));
      thumbnail = `/uploads/${thumbnailName}`;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      file: {
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
        thumbnail: thumbnail ? `/uploads/${path.basename(thumbnail)}` : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;