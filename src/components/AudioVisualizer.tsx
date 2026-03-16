import React, { useEffect, useRef, useState } from 'react';
import { Activity, Music, Zap } from 'lucide-react';

interface AudioVisualizerProps {
  onBeat: (bpm: number, energy: number) => void;
  onData?: (data: { energy: number; frequencies: number[]; isBeat: boolean }) => void;
  isActive: boolean;
  audioFile?: File | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onBeat, onData, isActive, audioFile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const [stats, setStats] = useState({ bpm: 0, energy: 0 });

  useEffect(() => {
    if (!isActive && !audioFile) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    const initAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        let source: AudioBufferSourceNode | MediaStreamAudioSourceNode;

        if (audioFile) {
          const arrayBuffer = await audioFile.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const bufferSource = audioContext.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.loop = true;
          bufferSource.connect(analyser);
          analyser.connect(audioContext.destination);
          bufferSource.start(0);
          source = bufferSource;
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const streamSource = audioContext.createMediaStreamSource(stream);
          streamSource.connect(analyser);
          source = streamSource;
        }

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let lastBeatTime = 0;
        let beatCount = 0;
        let startTime = Date.now();

        const draw = () => {
          if (!canvasRef.current || !analyserRef.current) return;
          animationRef.current = requestAnimationFrame(draw);

          analyserRef.current.getByteFrequencyData(dataArray);

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;
          let totalEnergy = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            totalEnergy += dataArray[i];

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#3b82f6');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }

          const currentEnergy = totalEnergy / (bufferLength * 255);
          let isBeat = false;
          
          // Simple beat detection logic
          if (currentEnergy > 0.6 && Date.now() - lastBeatTime > 300) {
            lastBeatTime = Date.now();
            beatCount++;
            const elapsed = (Date.now() - startTime) / 1000;
            const currentBpm = Math.round((beatCount / elapsed) * 60);
            isBeat = true;
            
            if (currentBpm > 40 && currentBpm < 220) {
              setStats({ bpm: currentBpm, energy: currentEnergy });
              onBeat(currentBpm, currentEnergy);
            }
          }

          if (onData) {
            onData({
              energy: currentEnergy,
              frequencies: Array.from(dataArray),
              isBeat
            });
          }
        };

        draw();
      } catch (err) {
        console.error("Error initializing audio:", err);
      }
    };

    initAudio();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, audioFile, onBeat, onData]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-mono">
          <Activity size={14} className="text-emerald-500" />
          <span>Frequency Monitor</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <Music size={14} className="text-blue-500" />
            <span className="text-white font-mono text-sm">{stats.bpm || '--'} BPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-white font-mono text-sm">{Math.round(stats.energy * 100) || '--'}% PWR</span>
          </div>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={80} 
        className="w-full h-20 bg-black/40 rounded-lg border border-white/5"
      />
      
      {(!isActive && !audioFile) && (
        <div className="text-center py-2 text-zinc-500 text-xs italic">
          Audio analysis inactive. Toggle microphone or upload a file to start.
        </div>
      )}
    </div>
  );
};
