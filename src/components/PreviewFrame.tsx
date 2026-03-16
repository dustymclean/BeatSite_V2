import React, { useMemo } from 'react';

interface PreviewFrameProps {
  code: string;
  audioData?: { energy: number; frequencies: number[]; isBeat: boolean };
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ code, audioData }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Pass audio data to iframe
  React.useEffect(() => {
    if (iframeRef.current && audioData) {
      iframeRef.current.contentWindow?.postMessage({ type: 'AUDIO_DATA', data: audioData }, '*');
    }
  }, [audioData]);

  // We wrap the generated code in a full HTML document that includes Tailwind and React
  const srcDoc = useMemo(() => {
    // Clean up the code string to ensure it can be injected safely
    const cleanCode = code.replace(/```(jsx|tsx|javascript|typescript)?/g, '').replace(/```/g, '');

    // Strip imports and exports to make it a valid script for Babel standalone
    let processedCode = cleanCode;
    
    // Remove all import statements
    processedCode = processedCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    // Remove export default keywords but keep the component name
    processedCode = processedCode.replace(/export\s+default\s+function\s+GeneratedSite/, 'function GeneratedSite');
    processedCode = processedCode.replace(/export\s+default\s+GeneratedSite/, '');
    
    // Remove other export keywords
    processedCode = processedCode.replace(/export\s+const/g, 'const');
    processedCode = processedCode.replace(/export\s+function/g, 'function');
    processedCode = processedCode.replace(/export\s+class/g, 'class');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; font-family: 'Inter', sans-serif; background: #000; color: #fff; overflow-x: hidden; }
            * { box-sizing: border-box; }
            #root { min-height: 100vh; }
            .error-overlay {
              position: fixed; inset: 0; background: rgba(0,0,0,0.9);
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              padding: 2rem; text-align: center; font-family: monospace; color: #ef4444; z-index: 9999;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            // Expose React hooks globally
            const { 
              useState, useEffect, useMemo, useCallback, useRef, 
              useContext, useReducer, useLayoutEffect, useId 
            } = React;

            // Mock lucide-react for the preview
            const LucideIcons = {
              ArrowRight: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
              Zap: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.89 14 3v9.11L20 9.11 10 21v-9.11L4 14.89Z"/></svg>,
              Music: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
              Layout: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
              Globe: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
              Mail: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
              Phone: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
              MapPin: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
              ChevronRight: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
              Star: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              Heart: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
              Sparkles: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>,
              Cpu: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
              Volume2: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
              Activity: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
              Layers: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>,
              Settings: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
            };

            // Expose icons globally
            Object.assign(window, LucideIcons);
            window.Lucide = LucideIcons;

            // Expose motion globally for the preview
            const { motion, AnimatePresence } = FramerMotion;
            window.motion = motion;
            window.AnimatePresence = AnimatePresence;

            // Custom hook for beat synchronization
            const useBeat = () => {
              const [audioData, setAudioData] = React.useState({ energy: 0, frequencies: [], isBeat: false });
              
              React.useEffect(() => {
                const handleMessage = (event) => {
                  if (event.data.type === 'AUDIO_DATA') {
                    setAudioData(event.data.data);
                  }
                };
                window.addEventListener('message', handleMessage);
                return () => window.removeEventListener('message', handleMessage);
              }, []);
              
              return audioData;
            };

            try {
              ${processedCode}

              const root = ReactDOM.createRoot(document.getElementById('root'));
              
              // Fallback to find GeneratedSite if it's not global
              const ComponentToRender = typeof GeneratedSite !== 'undefined' ? GeneratedSite : null;

              if (ComponentToRender) {
                root.render(<ComponentToRender useBeat={useBeat} />);
              } else {
                throw new Error('Component "GeneratedSite" not found in generated code. Make sure the AI named the component correctly.');
              }
            } catch (err) {
              console.error('Preview Error:', err);
              document.getElementById('root').innerHTML = \`
                <div class="error-overlay">
                  <h2 style="margin-bottom: 1rem; font-size: 1.5rem">Synthesis Error</h2>
                  <p style="font-size: 0.9rem; opacity: 0.8; max-width: 80%">\${err.message}</p>
                  <p style="font-size: 0.7rem; margin-top: 2rem; opacity: 0.5">Check the browser console for a full trace.</p>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;
  }, [code]);

  return (
    <div className="w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2 z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Live Preview Output</span>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        className="w-full h-full pt-8"
        title="Generated Website Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
};
