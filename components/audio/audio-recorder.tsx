'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Pause, Play, Trash2, Save } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onSave?: (audioBlob: Blob, audioUrl: string) => void;
  className?: string;
}

export function AudioRecorder({ onSave, className = '' }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getAudioBlob,
    getAudioUrl,
    clearRecording,
  } = useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Update audio URL when recording is stopped
  useEffect(() => {
    if (!isRecording && getAudioUrl()) {
      setAudioUrl(getAudioUrl());
    }
  }, [isRecording, getAudioUrl]);

  // Handle recording start
  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  // Handle recording stop
  const handleStopRecording = () => {
    stopRecording();
    toast.success('Recording stopped');
  };

  // Handle recording pause/resume
  const handlePauseResumeRecording = () => {
    if (isPaused) {
      resumeRecording();
      toast.success('Recording resumed');
    } else {
      pauseRecording();
      toast.success('Recording paused');
    }
  };

  // Handle recording clear
  const handleClearRecording = () => {
    clearRecording();
    setAudioUrl(null);
    toast.success('Recording cleared');
  };

  // Handle recording save
  const handleSaveRecording = () => {
    const blob = getAudioBlob();
    const url = getAudioUrl();
    
    if (blob && url && onSave) {
      onSave(blob, url);
      toast.success('Recording saved');
    } else {
      toast.error('No recording to save');
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Recording timer */}
      <div className="text-center font-mono text-lg">
        {formatTime(recordingTime)}
      </div>

      {/* Audio player (if recording is available) */}
      {audioUrl && !isRecording && (
        <audio controls src={audioUrl} className="w-full" />
      )}

      {/* Recording controls */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !audioUrl && (
          <Button
            onClick={handleStartRecording}
            variant="outline"
            size="icon"
            title="Start recording"
          >
            <Mic className="size-4" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={handleStopRecording}
              variant="outline"
              size="icon"
              title="Stop recording"
            >
              <Square className="size-4" />
            </Button>

            <Button
              onClick={handlePauseResumeRecording}
              variant="outline"
              size="icon"
              title={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </Button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <Button
              onClick={handleClearRecording}
              variant="outline"
              size="icon"
              title="Clear recording"
            >
              <Trash2 className="size-4" />
            </Button>

            <Button
              onClick={handleSaveRecording}
              variant="outline"
              size="icon"
              title="Save recording"
            >
              <Save className="size-4" />
            </Button>

            <Button
              onClick={handleStartRecording}
              variant="outline"
              size="icon"
              title="Record new"
            >
              <Mic className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 