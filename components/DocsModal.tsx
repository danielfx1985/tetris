import React from 'react';

interface DocsModalProps {
  onClose: () => void;
}

const DocsModal: React.FC<DocsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(6,182,212,0.3)]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-2xl font-pixel text-cyan-400">SYSTEM MANUAL v4.0</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-red-500/20 rounded px-3 py-1 font-mono transition-colors"
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-300 font-mono space-y-6">
          
          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-cyan-500">01.</span> HOW TO SET UP LAN SERVER
            </h3>
            <div className="bg-black/30 p-4 rounded border border-slate-700 text-sm">
                <ol className="list-decimal list-inside space-y-3">
                  <li>Ensure <strong>Node.js</strong> is installed on the host computer.</li>
                  <li>In the project directory, run: <br/><code className="bg-slate-800 text-green-400 px-1">npm install ws</code></li>
                  <li>Start the relay server: <br/><code className="bg-slate-800 text-green-400 px-1">node server.js</code></li>
                  <li>Find your local IP Address (e.g., <code className="text-purple-400">192.168.1.5</code>) using <code>ipconfig</code> or <code>ifconfig</code>.</li>
                  <li><strong>Host:</strong> Connect to <code className="text-cyan-400">ws://localhost:8080</code></li>
                  <li><strong>Guest:</strong> Connect to <code className="text-cyan-400">ws://YOUR_IP:8080</code></li>
                </ol>
            </div>
          </section>

          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-purple-500">02.</span> GAMEPLAY CONTROLS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>MOVE LEFT</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">←</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>MOVE RIGHT</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">→</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>ROTATE</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">↑</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>SOFT DROP</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">↓</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded col-span-2 flex justify-between items-center">
                <span>HARD DROP (INSTANT)</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">SPACE</kbd>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-green-500">03.</span> AI COMMENTARY (GEMINI LIVE)
            </h3>
            <p className="text-sm mb-3">
              This system features a Neural Uplink powered by <strong>Google Gemini</strong> to provide real-time e-sports commentary.
            </p>
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded">
              <p className="text-green-300 text-xs mb-2 uppercase font-bold tracking-wider">How to Activate:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-100">
                <li>Ensure you have a valid API Key in the environment.</li>
                <li>Click the <strong>"ENABLE AI COMMENTARY"</strong> button in the header.</li>
                <li>The AI will watch your game video stream and react to your moves, line clears, and mistakes verbally.</li>
                <li>Microphone access is optional but allows you to talk back to the commentator.</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;