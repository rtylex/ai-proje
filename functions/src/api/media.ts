import { Router } from 'express';
import type { AuthedRequest } from '../lib/auth';
import { SignedUrlBody, ViewUrlBody } from '../lib/validation';
import { getSignedPutUrl, getSignedGetUrl } from '../lib/r2';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function extFromMime(mime: 'image/jpeg' | 'image/png') {
  return mime === 'image/png' ? 'png' : 'jpg';
}

router.post('/signed-url', async (req: AuthedRequest, res) => {
  const parsed = SignedUrlBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  const { type, imageId: imageIdRaw, mime } = parsed.data;
  const uid = req.user!.uid;
  const ext = extFromMime(mime);
  const ttl = parseInt(process.env.SIGNED_URL_TTL_SECONDS || '600', 10);

  try {
    if (type === 'original') {
      const imageId = imageIdRaw ?? uuidv4();
      const key = `users/${uid}/images/${imageId}/original.${ext}`;
      const uploadUrl = await getSignedPutUrl(key, mime, ttl);
      return res.json({ uploadUrl, key, imageId });
    } else {
      if (!imageIdRaw) return res.status(400).json({ error: 'imageId_required' });
      const versionId = uuidv4();
      const key = `users/${uid}/images/${imageIdRaw}/versions/${versionId}.${ext}`;
      const uploadUrl = await getSignedPutUrl(key, mime, ttl);
      return res.json({ uploadUrl, key, versionId });
    }
  } catch (e: any) {
    return res.status(500).json({ error: 'r2_error', message: e?.message || String(e) });
  }
});

router.post('/view-url', async (req: AuthedRequest, res) => {
  const parsed = ViewUrlBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  const { key } = parsed.data;
  try {
    const ttl = parseInt(process.env.SIGNED_URL_TTL_SECONDS || '600', 10);
    const url = await getSignedGetUrl(key, ttl);
    return res.json({ url, expiresIn: ttl });
  } catch (e: any) {
    return res.status(500).json({ error: 'r2_error', message: e?.message || String(e) });
  }
});

export default router;

