const STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

// Transcribe an audio clip with ElevenLabs Speech-to-Text ("Scribe").
export async function transcribeAudio(
  audio: Buffer,
  mimeType: string,
  apiKey: string,
  signal: AbortSignal
): Promise<string> {
  const form = new FormData();
  form.append('model_id', 'scribe_v1');
  form.append('file', new Blob([new Uint8Array(audio)], { type: mimeType || 'audio/m4a' }), 'audio.m4a');

  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`ElevenLabs ${res.status}: ${body.slice(0, 200)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? '').trim();
}
