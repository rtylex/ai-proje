import { Router } from 'express';
import type { AuthedRequest } from '../lib/auth';
import { CreateImageBody } from '../lib/validation';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();

router.post('/', async (req: AuthedRequest, res) => {
  const db = getFirestore();
  const parsed = CreateImageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  const { key, size, mimeType, resolution } = parsed.data;
  const uid = req.user!.uid;

  // Expect: users/{uid}/images/{imageId}/original.(jpg|png)
  const regex = new RegExp(`^users/${uid}/images/([^/]+)/original\\.(?:jpg|png)$`);
  const m = key.match(regex);
  if (!m) return res.status(400).json({ error: 'invalid_key_for_user' });
  const imageId = m[1];

  const createdAt = Math.floor(Date.now() / 1000);
  const docRef = db.collection('users').doc(uid).collection('images').doc(imageId);
  await docRef.set({
    imageId,
    userId: uid,
    originalUrl: key,
    createdAt,
    size,
    mimeType,
    resolution
  }, { merge: true });

  return res.status(201).json({ imageId, originalUrl: key });
});

router.get('/', async (req: AuthedRequest, res) => {
  const db = getFirestore();
  const uid = req.user!.uid;
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10) || 20, 50);
  const cursor = req.query.cursor ? parseInt(String(req.query.cursor), 10) : undefined;

  let q = db.collection('users').doc(uid).collection('images').orderBy('createdAt', 'desc').limit(limit);
  if (!Number.isNaN(cursor) && cursor) {
    q = q.startAfter(cursor);
  }
  const snap = await q.get();
  const items = snap.docs.map(d => ({ imageId: d.get('imageId'), createdAt: d.get('createdAt') }));
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;
  return res.json({ items, nextCursor });
});

router.get('/:imageId/versions', async (req: AuthedRequest, res) => {
  const db = getFirestore();
  const uid = req.user!.uid;
  const { imageId } = req.params;
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10) || 20, 50);
  const cursor = req.query.cursor ? parseInt(String(req.query.cursor), 10) : undefined;

  let q = db.collection('users').doc(uid).collection('images').doc(imageId).collection('versions').orderBy('createdAt', 'desc').limit(limit);
  if (!Number.isNaN(cursor) && cursor) {
    q = q.startAfter(cursor);
  }
  const snap = await q.get();
  const items = snap.docs.map(d => ({
    versionId: d.get('versionId'),
    createdAt: d.get('createdAt'),
    editedUrl: d.get('editedUrl') || null,
    outputMime: d.get('outputMime') || null,
  }));
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;
  return res.json({ items, nextCursor });
});

export default router;
