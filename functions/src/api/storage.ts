import express, { Router } from 'express';
import { storeFileLocally, getFileLocally } from '../lib/r2';

const router = Router();

// Preflight for CORS (optional explicit handling)
router.options('/upload', (_req, res) => {
  res.sendStatus(204);
});

// Handle local file uploads (mock signed URL) using raw body parser
const rawBody = express.raw({ type: '*/*', limit: '25mb' });
router.put('/upload', rawBody, async (req, res) => {
  const key = req.query.key as string;
  const contentType = req.query.contentType as string;
  
  if (!key || !contentType) {
    return res.status(400).json({ error: 'missing_parameters' });
  }

  try {
    const buffer: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    await storeFileLocally(key, buffer);
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: 'storage_error', message: error?.message });
  }
});

// Handle local file downloads (mock signed URL)
router.get('/download', async (req, res) => {
  const key = req.query.key as string;
  
  if (!key) {
    return res.status(400).json({ error: 'missing_key' });
  }

  try {
    const buffer = await getFileLocally(key);
    const ext = key.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const filename = key.split('/').pop() || `image.${ext || 'jpg'}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(404).json({ error: 'file_not_found', message: error?.message });
  }
});

export default router;
