import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useState } from 'react';
import { transcribeAudio } from '../api/client';

export type VoiceStatus = 'idle' | 'recording' | 'transcribing';

// Encapsulates the press-to-talk flow: record with expo-audio, upload the clip
// to the backend for transcription, and hand the text back to the caller.
export function useVoiceSearch(onTranscribed: (text: string) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      setError('Microphone permission is needed for voice search.');
      return;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus('recording');
  }

  async function stopAndTranscribe() {
    if (status !== 'recording') return;
    setStatus('transcribing');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording captured.');
      const text = await transcribeAudio(uri, 'audio/m4a');
      if (text) onTranscribed(text);
      else setError("Didn't catch that. Try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not transcribe audio.');
    } finally {
      setStatus('idle');
    }
  }

  function toggle() {
    if (status === 'recording') stopAndTranscribe();
    else if (status === 'idle') start();
  }

  return { status, error, toggle };
}
