'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  getAudioBlob: () => Blob | null;
  getAudioUrl: () => string | null;
  clearRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    audioUrl: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recorderState.audioUrl) {
        URL.revokeObjectURL(recorderState.audioUrl);
      }
      if (recorderState.mediaRecorder && recorderState.isRecording) {
        recorderState.mediaRecorder.stop();
      }
    };
  }, [recorderState]);

  // Start recording function
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecorderState((prevState) => ({
          ...prevState,
          isRecording: false,
          isPaused: false,
          audioChunks,
          audioBlob,
          audioUrl,
        }));

        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
      });

      // Start recording
      mediaRecorder.start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecorderState((prevState) => ({
          ...prevState,
          recordingTime: prevState.recordingTime + 1,
        }));
      }, 1000);

      setRecorderState({
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        mediaRecorder,
        audioChunks,
        audioBlob: null,
        audioUrl: null,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (recorderState.mediaRecorder && recorderState.isRecording) {
      recorderState.mediaRecorder.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recorderState]);

  // Pause recording function
  const pauseRecording = useCallback(() => {
    if (recorderState.mediaRecorder && recorderState.isRecording && !recorderState.isPaused) {
      recorderState.mediaRecorder.pause();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setRecorderState((prevState) => ({
        ...prevState,
        isPaused: true,
      }));
    }
  }, [recorderState]);

  // Resume recording function
  const resumeRecording = useCallback(() => {
    if (recorderState.mediaRecorder && recorderState.isRecording && recorderState.isPaused) {
      recorderState.mediaRecorder.resume();
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setRecorderState((prevState) => ({
          ...prevState,
          recordingTime: prevState.recordingTime + 1,
        }));
      }, 1000);
      
      setRecorderState((prevState) => ({
        ...prevState,
        isPaused: false,
      }));
    }
  }, [recorderState]);

  // Get audio blob
  const getAudioBlob = useCallback(() => {
    return recorderState.audioBlob;
  }, [recorderState.audioBlob]);

  // Get audio URL
  const getAudioUrl = useCallback(() => {
    return recorderState.audioUrl;
  }, [recorderState.audioUrl]);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (recorderState.audioUrl) {
      URL.revokeObjectURL(recorderState.audioUrl);
    }
    
    setRecorderState((prevState) => ({
      ...prevState,
      recordingTime: 0,
      audioChunks: [],
      audioBlob: null,
      audioUrl: null,
    }));
  }, [recorderState.audioUrl]);

  return {
    isRecording: recorderState.isRecording,
    isPaused: recorderState.isPaused,
    recordingTime: recorderState.recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getAudioBlob,
    getAudioUrl,
    clearRecording,
  };
} 