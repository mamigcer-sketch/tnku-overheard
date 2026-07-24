"use client";

import { useState, useRef } from "react";
import { Mic, Square, Trash2, UploadCloud, Activity } from "lucide-react";

export default function VoiceRecorder({ onAudioReady, onRecordingStateChange }: { onAudioReady: (base64Audio: string | null) => void, onRecordingStateChange?: (recording: boolean) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // 🔥 Blob'u Base64 string'e çeviriyoruz (Vercel & sunucu dostu)
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setHasAudio(true);
          onAudioReady(base64data);
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (onRecordingStateChange) onRecordingStateChange(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 14) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      alert("Kral, ses kaydedebilmek için mikrofon izni vermen gerekiyor!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (onRecordingStateChange) onRecordingStateChange(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setHasAudio(false);
    setRecordingTime(0);
    onAudioReady(null);
  };

  return (
    <div className="bg-black/40 border border-purple-500/20 p-4 rounded-2xl relative overflow-hidden">
      {!hasAudio ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-2 text-red-400">
                <Activity size={18} className="animate-pulse" />
                <span className="font-mono font-bold text-xs">{recordingTime}s / 15s (Kayıt Devam Ediyor...)</span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs font-medium">Anonim sesli fısıltı bırak (İsteğe bağlı)...</span>
            )}
          </div>
          
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isRecording 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
            }`}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <UploadCloud size={18} />
            <span className="text-xs font-bold">Sesli Fısıltı Hazır! (Gönderilmeye Hazır)</span>
          </div>
          <button type="button" onClick={resetRecording} className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      {isRecording && (
        <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${(recordingTime / 15) * 100}%` }} />
      )}
    </div>
  );
}