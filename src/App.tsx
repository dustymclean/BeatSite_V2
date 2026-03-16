import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Wand2, 
  Music, 
  Type as TypeIcon, 
  Sparkles, 
  RotateCcw,
  ExternalLink,
  Info,
  Mic,
  MicOff,
  Zap,
  Image as ImageIcon,
  Palette,
  Code,
  Copy,
  Check,
  X,
  Upload,
  Layout
} from 'lucide-react';
import { AudioVisualizer } from './components/AudioVisualizer';
import { PreviewFrame } from './components/PreviewFrame';
import { generateWebsite, GenerationParams } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOODS = [
  { id: 'energetic', label: 'Energetic', icon: Sparkles, color: 'text-yellow-500' },
  { id: 'happy', label: 'Happy', icon: Sparkles, color: 'text-emerald-500' },
  { id: 'relaxed', label: 'Relaxed', icon: Music, color: 'text-blue-400' },
  { id: 'melancholic', label: 'Melancholic', icon: Music, color: 'text-indigo-400' },
  { id: 'aggressive', label: 'Aggressive', icon: Zap, color: 'text-red-500' },
];

const GENRES = [
  { id: 'electronic', label: 'Electronic' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'rock', label: 'Rock' },
  { id: 'classical', label: 'Classical' },
  { id: 'hip-hop', label: 'Hip-Hop' },
  { id: 'indie', label: 'Indie' },
];

const STYLES = [
  { id: 'minimalist', label: 'Minimalist', icon: Layout },
  { id: 'futuristic', label: 'Futuristic', icon: Zap },
  { id: 'retro', label: 'Retro', icon: RotateCcw },
  { id: 'organic', label: 'Organic', icon: Sparkles },
  { id: 'corporate', label: 'Corporate', icon: Info },
];

export default function App() {
  const [description, setDescription] = useState('');
  const [selectedMood, setSelectedMood] = useState('energetic');
  const [selectedGenre, setSelectedGenre] = useState('electronic');
  const [selectedStyle, setSelectedStyle] = useState('futuristic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [audioStats, setAudioStats] = useState({ bpm: 120, energy: 0.5 });
  const [audioData, setAudioData] = useState<{ energy: number; frequencies: number[]; isBeat: boolean } | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleBeat = useCallback((bpm: number, energy: number) => {
    setAudioStats({ bpm, energy });
  }, []);

  const handleAudioData = useCallback((data: { energy: number; frequencies: number[]; isBeat: boolean }) => {
    setAudioData(data);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setIsAnalyzing(true);
    }
  };

  const handleGenerate = async () => {
    if (!description) return;
    
    setIsGenerating(true);
    setGeneratedCode(null);
    setExplanation("");
    
    try {
      const params: GenerationParams = {
        description,
        bpm: audioStats.bpm,
        energy: audioStats.energy,
        mood: selectedMood,
        genre: selectedGenre,
        style: selectedStyle,
        imageContext: imagePreview || undefined
      };
      
      const result = await generateWebsite(params);
      if (result && result.code) {
        setGeneratedCode(result.code);
        setExplanation(result.explanation);
      } else {
        console.error("AI returned empty result");
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-emerald-500/30 font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-12 h-screen max-h-[1000px]">
        
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Cpu className="text-emerald-500" size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight uppercase italic font-mono">BeatSite<span className="text-emerald-500">_v2</span></h1>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Synthesize web interfaces from semantic intent, rhythmic frequency, and visual aesthetics.
            </p>
          </header>

          <section className="space-y-6">
            {/* Audio Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <Music size={12} />
                  Rhythm Analysis
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => audioInputRef.current?.click()}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      audioFile 
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20" 
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                    )}
                  >
                    <Upload size={12} />
                    {audioFile ? audioFile.name.slice(0, 10) + "..." : "Upload MP3"}
                  </button>
                  <button 
                    onClick={() => {
                      setIsAnalyzing(!isAnalyzing);
                      if (audioFile) setAudioFile(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      isAnalyzing && !audioFile
                        ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                    )}
                  >
                    {isAnalyzing && !audioFile ? <MicOff size={12} /> : <Mic size={12} />}
                    {isAnalyzing && !audioFile ? "Stop Mic" : "Start Mic"}
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  onChange={handleAudioUpload} 
                  accept="audio/*" 
                  className="hidden" 
                />
              </div>
              <AudioVisualizer 
                isActive={isAnalyzing} 
                audioFile={audioFile}
                onBeat={handleBeat} 
                onData={handleAudioData}
              />
            </div>

            {/* Style Preset Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Palette size={12} />
                Visual Style Preset
              </label>
              <div className="grid grid-cols-5 gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all group",
                      selectedStyle === style.id 
                        ? "bg-zinc-800 border-emerald-500/50 text-white" 
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                    title={style.label}
                  >
                    <style.icon size={16} className={cn(selectedStyle === style.id ? "text-emerald-500" : "group-hover:text-zinc-300")} />
                    <span className="text-[8px] uppercase tracking-tighter font-bold">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Sparkles size={12} />
                Atmospheric Mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all group",
                      selectedMood === mood.id 
                        ? "bg-zinc-800 border-emerald-500/50 text-white" 
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                    title={mood.label}
                  >
                    <mood.icon size={16} className={cn(selectedMood === mood.id ? mood.color : "group-hover:text-zinc-300")} />
                    <span className="text-[8px] uppercase tracking-tighter font-bold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Music size={12} />
                Music Genre
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                      selectedGenre === genre.id 
                        ? "bg-zinc-800 border-emerald-500/50 text-white" 
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Transfer */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <ImageIcon size={12} />
                Visual Style Transfer
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden",
                  imagePreview ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                )}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <Check size={20} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-white uppercase">Style Loaded</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/80 transition-colors z-20"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="text-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Upload Album Art</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Description Input Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <TypeIcon size={12} />
                Semantic Intent
              </label>
              <div className="relative group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your website (e.g., 'A minimalist portfolio for a cyberpunk photographer')..."
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                    onClick={() => setDescription('')}
                    className="p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                    title="Clear"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description}
              className={cn(
                "w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-[0.15em] text-sm transition-all relative overflow-hidden group",
                isGenerating || !description
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]"
              )}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  Synthesizing...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate Machine
                </>
              )}
              
              {!isGenerating && description && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none" />
              )}
            </button>
          </section>

          {/* Explanation / Info */}
          <AnimatePresence>
            {explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                  <Info size={12} />
                  Synthesis Logic
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  "{explanation}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-auto pt-8 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono flex justify-between items-center">
            <span>SYSTEM STATUS: OPTIMAL</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                DOCS <ExternalLink size={10} />
              </a>
              <span>V2.0.1</span>
            </div>
          </footer>
        </div>

        {/* Right Column: Preview */}
        <div className="relative flex flex-col h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {generatedCode ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Synthesized Output
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowCode(!showCode)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase hover:text-white hover:border-zinc-700 transition-all"
                    >
                      <Code size={14} />
                      {showCode ? "Hide Code" : "View Code"}
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase hover:bg-emerald-500/20 transition-all"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Export Code"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <PreviewFrame code={generatedCode} audioData={audioData} />
                  
                  {/* Code Overlay */}
                  <AnimatePresence>
                    {showCode && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute inset-0 z-20 bg-zinc-950/95 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
                      >
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                          <span className="text-xs font-mono text-zinc-400">GeneratedSite.tsx</span>
                          <button onClick={() => setShowCode(false)} className="text-zinc-500 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                        <pre className="flex-1 p-6 overflow-auto text-xs font-mono text-emerald-500/80 custom-scrollbar">
                          <code>{generatedCode}</code>
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative p-8 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-700">
                    <Sparkles size={48} />
                  </div>
                </div>
                <div className="mt-8 text-center space-y-2">
                  <h3 className="text-zinc-400 font-medium">Awaiting Input Signal</h3>
                  <p className="text-zinc-600 text-sm max-w-[280px]">
                    Configure your semantic intent, audio frequency, and visual style to begin synthesis.
                  </p>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
