import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IncomingMessage } from 'node:http';
import { applyCors, rateLimit, sendError, timeoutSignal } from '../lib/http';
import { transcribeAudio } from '../lib/elevenlabs';

// We need the raw audio bytes, so disable Vercel's body parser.
export const config = { api: { bodyParser: false } };

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) {
        reject(new Error('Audio too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks as unknown as Uint8Array[])));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  if (!rateLimit(req, 15)) return sendError(res, 429, 'Too many requests, slow down.');

  const apiKey = process.env.ELEVENLABS_API_KEY;

  // Dev fallback: no key → return a canned transcript so the flow works locally.
  if (!apiKey) {
    return res.status(200).json({ text: 'chicken curry' });
  }

  let audio: Buffer;
  try {
    audio = await readRawBody(req);
  } catch {
    return sendError(res, 413, 'Audio too large.');
  }
  if (!audio.length) return sendError(res, 400, 'No audio provided.');

  const mimeType = (req.headers['content-type'] as string) || 'audio/m4a';

  try {
    const { signal, clear } = timeoutSignal(15_000);
    try {
      const text = await transcribeAudio(audio, mimeType, apiKey, signal);
      return res.status(200).json({ text });
    } finally {
      clear();
    }
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) return sendError(res, 502, 'Transcription auth failed.');
    console.error('transcribe failed:', err);
    return sendError(res, 502, 'Could not transcribe audio. Please try again.');
  }
}
