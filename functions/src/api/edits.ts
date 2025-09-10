import { Router } from 'express';
import type { AuthedRequest } from '../lib/auth';
import { BackgroundEditBody } from '../lib/validation';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from 'firebase-admin/firestore';
import { replaceBackground, generateText } from '../lib/gemini';

const router = Router();

router.post('/background', async (req: AuthedRequest, res) => {
  const db = getFirestore();
  const parsed = BackgroundEditBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  const { imageId, prompt, outputMime } = parsed.data;
  const uid = req.user!.uid;

  // Idempotency: if a processing job already exists for this user+image, return it instead of creating a new one
  try {
    const existing = await db.collection('jobs')
      .where('userId', '==', uid)
      .where('imageId', '==', imageId)
      .where('status', '==', 'processing')
      .limit(1)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return res.status(202).json({ jobId: doc.get('jobId'), status: 'processing', existing: true });
    }
  } catch (e) {
    // If the check fails, continue to create a new job (best-effort)
  }

  const jobId = uuidv4();
  const createdAt = Math.floor(Date.now() / 1000);
  
  // Create job record
  await db.collection('jobs').doc(jobId).set({
    jobId,
    userId: uid,
    imageId,
    prompt,
    status: 'processing',
    createdAt
  });

  // Start background processing (fire and forget)
  processBackgroundEdit(jobId, uid, imageId, prompt, outputMime).catch(error => {
    console.error('Background processing failed:', error);
  });

  return res.status(202).json({ jobId, status: 'processing' });
});

router.get('/status', async (req: AuthedRequest, res) => {
  const db = getFirestore();
  const jobId = String(req.query.jobId || '');
  if (!jobId) return res.status(400).json({ error: 'jobId_required' });
  const snap = await db.collection('jobs').doc(jobId).get();
  if (!snap.exists) return res.status(404).json({ error: 'not_found' });
  const data = snap.data() || {};
  if (data.status === 'done') {
    return res.json({ status: 'done', versionId: data.versionId, editedUrl: data.editedUrl });
  }
  if (data.status === 'failed') {
    return res.json({ status: 'failed', error: data.error || 'unknown' });
  }
  return res.json({ status: 'processing' });
});

// Simple text generation endpoint for testing with text-only models
router.post('/text', async (req: AuthedRequest, res) => {
  const prompt = String((req.body && (req.body.prompt ?? '')) || '').trim();
  if (!prompt) return res.status(400).json({ error: 'prompt_required' });
  try {
    const result = await generateText(prompt);
    if (!result.ok) return res.status(400).json({ error: result.error || 'generation_failed' });
    return res.json({ ok: true, text: result.text });
  } catch (error: any) {
    console.error('Text generation error:', error);
    return res.status(500).json({ error: 'server_error' });
  }
});

async function processBackgroundEdit(jobId: string, userId: string, imageId: string, prompt: string, outputMime?: 'image/jpeg' | 'image/png') {
  const db = getFirestore();
  try {
    // Get original image info from Firestore
    const imageDoc = await db.collection('users').doc(userId).collection('images').doc(imageId).get();
    if (!imageDoc.exists) {
      throw new Error('Image not found');
    }
    
    const imageData = imageDoc.data();
    const originalKey = imageData?.originalUrl;
    
    if (!originalKey) {
      throw new Error('Original image key not found');
    }

    // Process with Gemini
    const result = await replaceBackground(originalKey, prompt, { outputMime });
    
    if (!result.ok) {
      // Update job as failed
      await db.collection('jobs').doc(jobId).update({
        status: 'failed',
        error: result.error || 'processing_failed',
        updatedAt: Math.floor(Date.now() / 1000)
      });
      return;
    }

    // Create version record
    const versionId = uuidv4();
    const versionCreatedAt = Math.floor(Date.now() / 1000);
    
    await db.collection('users').doc(userId).collection('images').doc(imageId)
      .collection('versions').doc(versionId).set({
        versionId,
        imageId,
        userId,
        editedUrl: result.editedKey,
        editType: 'backgroundChange',
        prompt,
        createdAt: versionCreatedAt,
        outputMime: outputMime || null
      });

    // Update job as completed
    await db.collection('jobs').doc(jobId).update({
      status: 'done',
      versionId,
      editedUrl: result.editedKey,
      updatedAt: Math.floor(Date.now() / 1000)
    });

  } catch (error: any) {
    console.error('Background edit processing error:', error);
    // Update job as failed
    await db.collection('jobs').doc(jobId).update({
      status: 'failed',
      error: error?.message || 'unknown_error',
      updatedAt: Math.floor(Date.now() / 1000)
    });
  }
}

export default router;
