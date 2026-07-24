"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, UploadCloud, Activity, Play, Pause, Sparkles } from "lucide-react";

export default function VoiceRecorder({ onAudioReady, onRecordingStateChange }: { onAudioReady: (base64Audio: string | null) => void, onRecordingStateChange?: (recording: boolean) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // 🔥 DÜZELTME BURADA YAPILDI
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const applyHackerVoiceEffect = async (inputBlob: Blob): Promise<Blob> => {
    try {
      const arrayBuffer = await inputBlob.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = 1.35;

      const biquadFilter = offlineCtx.createBiquadFilter();
      biquadFilter.type = "bandpass";
      biquadFilter.frequency.value = 1500;
      biquadFilter.Q.value = 1.0;

      source.connect(biquadFilter);
      biquadFilter.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();

      const numOfChan = renderedBuffer.numberOfChannels;
      const length = renderedBuffer.length * numOfChan * 2 + 44;
      const out = new DataView(new ArrayBuffer(length));
      let channels = [];
      let sampleRate = renderedBuffer.sampleRate;
      let offset = 0;
      let pos = 0;

      function writeString(str: string) {
        for (let i = 0; i < str.length; i++) {
          out.setUint8(pos++, str.charCodeAt(i));
        }
      }

      writeString('RIFF');
      out.setUint32(pos, length - 8, true); pos += 4;
      writeString('WAVE');
      writeString('fmt ');
      out.setUint32(pos, 16, true); pos += 4;
      out.setUint16(pos, 1, true); pos += 2;
      out.setUint16(pos, numOfChan, true); pos += 2;
      out.setUint32(pos, sampleRate, true); pos += 4;
      out.setUint32(pos, sampleRate * 2 * numOfChan, true); pos += 4;
      out.setUint16(pos, numOfChan * 2, true); pos += 2;
      out.setUint16(pos, 16, true); pos += 2;
      writeString('data');
      out.setUint32(pos, length - pos - 4, true); pos += 4;

      for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
        channels.push(renderedBuffer.getChannelData(i));
      }

      while (offset < renderedBuffer.length) {
        for (let i = 0; i < numOfChan; i++) {
          let sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          out.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }

      return new Blob([out.buffer], { type: 'audio/wav' });
    } catch (e) {
      console.error("Hacker ses filtresi uygulanamadı:", e);
      return inputBlob;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const hackedBlob = await applyHackerVoiceEffect(rawBlob);

        const previewUrl = URL.createObjectURL(hackedBlob);
        setAudioPreviewUrl(previewUrl);

        const reader = new FileReader();
        reader.readAsDataURL(hackedBlob);
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
    setAudioPreviewUrl(null);
    setIsPlayingPreview(false);
    onAudioReady(null);
  };

  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((err) => {
        console.error("Önizleme oynatılamadı:", err);
      });
    }
  };

  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlayingPreview(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioPreviewUrl]);

  return (
    <div className="bg-black/40 border border-purple-500/20 p-4 rounded-2xl relative overflow-hidden">
      {audioPreviewUrl && <audio ref={previewAudioRef} src={audioPreviewUrl} preload="metadata" />}

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center hover:bg-purple-500/30 transition-all cursor-pointer shrink-0"
              title="Hacker Sesiyle Önizle"
            >
              {isPlayingPreview ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            
            <div className="flex flex-col">
              <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                <UploadCloud size={14} /> Fısıltı Kodlandı!
              </span>
              <span className="text-[10px] text-purple-400 flex items-center gap-1">
                <Sparkles size={11} /> Kimliğin tamamen gizlendi, dinleyebilirsin
              </span>
            </div>
          </div>

          <button type="button" onClick={resetRecording} className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer shrink-0" title="Sil / Yeniden Kaydet">
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