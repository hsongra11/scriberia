'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { AudioRecorder } from './audio-recorder';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction, 
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

interface AudioTranscriptionProps {
  onSave?: (transcription: string) => void;
  className?: string;
}

export function AudioTranscription({ onSave, className = '' }: AudioTranscriptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');

  // Save audio recording and trigger transcription
  const handleSaveRecording = async (blob: Blob, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', new File([blob], 'recording.wav', { type: blob.type }));
      
      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }
      
      setTranscription(data.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle saving the transcription
  const handleSaveTranscription = () => {
    if (onSave && transcription) {
      onSave(transcription);
      setIsOpen(false);
      toast.success('Transcription saved successfully');
    }
  };

  // Reset the component state
  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          title="Transcribe audio"
        >
          <Mic className="h-4 w-4 mr-2" />
          Record & Transcribe
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Audio Transcription</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="py-4 flex flex-col gap-4">
          {!audioBlob ? (
            <AudioRecorder onSave={handleSaveRecording} />
          ) : (
            <>
              <div className="flex justify-center">
                <audio src={audioUrl || ''} controls className="w-full" />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">Transcription</div>
                {isTranscribing ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Transcribing audio...</span>
                  </div>
                ) : (
                  <Textarea 
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Transcription will appear here..."
                    className="min-h-[120px]"
                  />
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Record Again
                </Button>
                <Button onClick={handleSaveTranscription} disabled={!transcription || isTranscribing}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Transcription
                </Button>
              </div>
            </>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSaveTranscription} disabled={!transcription || isTranscribing}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 