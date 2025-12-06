import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useTetris } from './hooks/useTetris';
import BoardDisplay from './components/BoardDisplay';
import DocsModal from './components/DocsModal';
import { GameStatus, AppMode, PlayerState, NetworkMessage, PlayerProfile } from './types';
import { drawBoardToHiddenCanvas, createEmptyBoard, getRandomTetromino } from './utils/gameUtils';
import { pcmToAudio, createPcmBlob } from './utils/audioUtils';

// --- Helper Component: Login Screen ---
const LoginScreen = ({ onLogin, onShowDocs }: { onLogin: (name: string, ip: string) => void, onShowDocs: () => void }) => {
  const [name, setName] = useState('');
  // Default to localhost for easy testing, user can change for LAN
  const [ip, setIp] = useState('ws://localhost:8080'); 

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fadeIn p-4 w-full max-w-md mx-auto">
      <div className="bg-slate-900/90 border border-cyan-500/50 p-8 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full backdrop-blur-sm">
        <h2 className="text-3xl font-pixel text-center text-cyan-400 mb-8 tracking-wider">NEON LAN</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-widest">CALLSIGN</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PLAYER_ONE"
              className="w-full bg-black border-2 border-slate-700 focus:border-cyan-500 rounded p-3 text-white font-mono text-lg outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-widest">SERVER ADDRESS</label>
            <input 
              type="text" 
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="ws://192.168.1.X:8080"
              className="w-full bg-black border-2 border-slate-700 focus:border-purple-500 rounded p-3 text-white font-mono text-lg outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && ip.trim() && onLogin(name, ip)}
            />
          </div>

          <button 
            onClick={() => name.trim() && ip.trim() && onLogin(name, ip)}
            disabled={!name.trim() || !ip.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded transition-all font-pixel text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          >
            CONNECT TO SERVER
          </button>
          
          <div className="pt-4 border-t border-slate-700 flex justify-center">
            <button 
              onClick={onShowDocs}
              className="text-slate-400 hover:text-cyan-300 text-sm font-mono flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">?</span> LAN SETUP GUIDE
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 text-slate-500 text-xs font-mono">NEON_NET CLIENT v4.0 [LAN MODE]</div>
    </div>
  );
};

// --- Helper Component: Matchmaking Screen ---
const MatchmakingScreen = ({ onCancel, serverStatus }: { onCancel: () => void, serverStatus: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto p-6 bg-slate-900/50 rounded-xl border border-slate-700">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-t-cyan-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="text-2xl font-mono text-white mb-2">NETWORK STATUS</h2>
      <p className={`font-mono text-sm mb-8 ${serverStatus.includes('CONNECTED') ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`}>
        {serverStatus}
      </p>
      
      <div className="bg-black/40 p-4 rounded text-left border border-cyan-500/30 mb-8 w-full">
          <p className="text-cyan-400 font-mono text-sm mb-2 font-bold">WAITING FOR CHALLENGER...</p>
          <ul className="text-slate-300 font-mono text-xs space-y-2 list-disc list-inside">
              <li>Ensure the server (server.js) is running.</li>
              <li>Share your IP Address with player 2.</li>
              <li>Player 2 connects to <span className="text-white bg-slate-800 px-1">ws://YOUR_IP:8080</span></li>
          </ul>
      </div>
      
      <button 
        onClick={onCancel}
        className="px-6 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded font-mono text-sm transition-colors"
      >
        CANCEL & DISCONNECT
      </button>
    </div>
  );
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LOGIN);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<PlayerProfile | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [serverStatus, setServerStatus] = useState('CONNECTING TO SERVER...');

  // Local Game Hook
  const player = useTetris(false);
  
  // Remote Opponent State
  const [opponentState, setOpponentState] = useState<PlayerState>({
      board: createEmptyBoard(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      nextPiece: getRandomTetromino(),
      activePiece: null
  });

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [geminiSpeaking, setGeminiSpeaking] = useState(false);
  
  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextAudioTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // --- Network Logic (WebSocket) ---
  useEffect(() => {
    return () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
    };
  }, []);

  const initializeNetwork = (profile: PlayerProfile, ip: string) => {
      setServerStatus('ATTEMPTING HANDSHAKE...');
      
      try {
          const ws = new WebSocket(ip);
          socketRef.current = ws;

          ws.onopen = () => {
              setServerStatus('CONNECTED. WAITING FOR OPPONENT...');
              // Announce Presence
              const joinMsg: NetworkMessage = { type: 'JOIN', player: profile };
              ws.send(JSON.stringify(joinMsg));
          };

          ws.onclose = () => {
              setServerStatus('DISCONNECTED FROM SERVER');
              if (appMode === AppMode.GAME) {
                  alert('Connection to server lost.');
                  handleLogout();
              }
          };

          ws.onerror = (err) => {
              setServerStatus('CONNECTION ERROR');
              console.error("WebSocket error:", err);
          };

          ws.onmessage = (event) => {
              try {
                  const msg = JSON.parse(event.data) as NetworkMessage;
                  
                  if (msg.type === 'JOIN') {
                      if (msg.player.id === profile.id) return;

                      // Send ACK
                      const ackMsg: NetworkMessage = { type: 'ACK', player: profile, targetId: msg.player.id };
                      ws.send(JSON.stringify(ackMsg));
                      
                      setOpponentProfile(msg.player);
                      startGame(true); 
                  } 
                  else if (msg.type === 'ACK') {
                      if (msg.targetId === profile.id) {
                          setOpponentProfile(msg.player);
                          startGame(true); 
                      }
                  }
                  else if (msg.type === 'START_GAME') {
                     setAppMode(AppMode.GAME);
                     player.resetGame(msg.seed);
                  }
                  else if (msg.type === 'STATE_UPDATE') {
                      if (msg.playerId !== profile.id) {
                          setOpponentState(msg.state);
                      }
                  }
                  else if (msg.type === 'PLAYER_DISCONNECT') {
                      if (opponentProfile && msg.playerId === opponentProfile.id) {
                          alert("Opponent disconnected!");
                          setAppMode(AppMode.MATCHING);
                          setOpponentProfile(null);
                          setOpponentState({ ...opponentState, gameOver: true });
                          setServerStatus('OPPONENT LEFT. WAITING...');
                      }
                  }
              } catch (e) {
                  console.error("Failed to parse message", e);
              }
          };

      } catch (e) {
          alert("Invalid WebSocket URL or Connection Failed");
          setAppMode(AppMode.LOGIN);
      }
  };

  const startGame = (initiator: boolean) => {
      setAppMode(AppMode.GAME);
      const seed = Date.now();
      
      if (initiator) {
         player.resetGame(seed);
         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const msg: NetworkMessage = { type: 'START_GAME', seed };
            socketRef.current.send(JSON.stringify(msg));
         }
      }
  };

  // Broadcast My State
  useEffect(() => {
      if (appMode === AppMode.GAME && socketRef.current && socketRef.current.readyState === WebSocket.OPEN && playerProfile) {
          const msg: NetworkMessage = { 
              type: 'STATE_UPDATE', 
              state: player.state, 
              playerId: playerProfile.id 
          };
          socketRef.current.send(JSON.stringify(msg));
      }
  }, [player.state, appMode, playerProfile]);

  // --- Input & Game Loop ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appMode !== AppMode.GAME || player.status !== GameStatus.PLAYING) return;
      
      switch (e.key) {
        case 'ArrowLeft': player.move({ x: -1, y: 0 }); break;
        case 'ArrowRight': player.move({ x: 1, y: 0 }); break;
        case 'ArrowDown': player.move({ x: 0, y: 1 }); break;
        case 'ArrowUp': player.rotate(); break;
        case ' ': player.drop(); break; 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, appMode]);

  const handleLogin = (name: string, ip: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const profile = { id, name: name.toUpperCase() };
    setPlayerProfile(profile);
    setAppMode(AppMode.MATCHING);
    initializeNetwork(profile, ip);
  };
  
  const handleLogout = () => {
      if (socketRef.current && playerProfile) {
          if (socketRef.current.readyState === WebSocket.OPEN) {
             socketRef.current.send(JSON.stringify({ type: 'PLAYER_DISCONNECT', playerId: playerProfile.id }));
          }
          socketRef.current.close();
          socketRef.current = null;
      }
      setAppMode(AppMode.LOGIN);
      setPlayerProfile(null);
      setOpponentProfile(null);
      setIsLiveConnected(false); 
  };

  // --- Gemini Live Logic ---
  const connectToGemini = async () => {
    if (!process.env.API_KEY) {
      alert("API Key not found in environment.");
      return;
    }
    
    setIsLiveConnecting(true);
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    let stream: MediaStream | null = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        console.warn("Microphone access denied.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are an energetic e-sports commentator for a Tetris match between ${playerProfile?.name || 'Player'} (Hero) and ${opponentProfile?.name || 'Opponent'} (Rival).
        - Focus on the Hero's board mostly (left side).
        - Hype up line clears.
        - Get nervous when the stack is high.
        - Comment on the Opponent's score if they are winning.
        - Keep it short, punchy and exciting!`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
      },
      callbacks: {
        onopen: () => {
          setIsLiveConnected(true);
          setIsLiveConnecting(false);
          
          if (stream && ctx) {
             const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
             const source = inputCtx.createMediaStreamSource(stream);
             const processor = inputCtx.createScriptProcessor(4096, 1, 1);
             processor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const blob = createPcmBlob(inputData);
                 if (sessionPromiseRef.current) {
                     sessionPromiseRef.current.then(session => {
                         session.sendRealtimeInput({ media: blob });
                     });
                 }
             };
             source.connect(processor);
             processor.connect(inputCtx.destination);
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && ctx) {
                setGeminiSpeaking(true);
                const buffer = await pcmToAudio(audioData, ctx);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                const now = ctx.currentTime;
                if (nextAudioTimeRef.current < now) nextAudioTimeRef.current = now;
                source.start(nextAudioTimeRef.current);
                nextAudioTimeRef.current += buffer.duration;
                
                audioQueueRef.current.add(source);
                source.onended = () => {
                    audioQueueRef.current.delete(source);
                    if (audioQueueRef.current.size === 0) setGeminiSpeaking(false);
                };
            }
        },
        onclose: () => {
            setIsLiveConnected(false);
            setIsLiveConnecting(false);
        },
        onerror: (err: any) => {
            console.error(err);
            setIsLiveConnected(false);
            setIsLiveConnecting(false);
        }
      }
    };

    sessionPromiseRef.current = ai.live.connect(config);
  };

  useEffect(() => {
    if (!isLiveConnected || player.status !== GameStatus.PLAYING) return;
    const intervalId = setInterval(async () => {
        drawBoardToHiddenCanvas(player.state.board, player.state.activePiece, videoCanvasRef.current);
        const base64Data = videoCanvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64Data } });
        }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isLiveConnected, player.state.board, player.state.activePiece, player.status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black z-0 pointer-events-none" />
      
      {/* Docs Modal */}
      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}

      {/* Header - Always visible but styled differently in Game */}
      <header className={`z-10 w-full max-w-6xl flex justify-between items-center p-6 ${appMode !== AppMode.GAME ? 'absolute top-0' : ''}`}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowDocs(true)}>
            <h1 className="text-3xl md:text-4xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                NEON TETRIS
            </h1>
            <span className="hidden md:inline bg-white/10 px-2 py-1 rounded text-xs font-mono text-cyan-300 border border-cyan-500/30">LAN MULTIPLAYER</span>
        </div>
        
        {appMode === AppMode.GAME && (
            <div className="flex gap-4">
                 {!isLiveConnected ? (
                     <button 
                        onClick={connectToGemini}
                        disabled={isLiveConnecting}
                        className={`px-4 py-2 text-sm md:text-base md:px-6 md:py-2 rounded-full font-bold transition-all border ${isLiveConnecting ? 'bg-gray-600 border-gray-500' : 'bg-black/50 hover:bg-cyan-900/50 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}
                     >
                        {isLiveConnecting ? 'CONNECTING...' : 'AI COMMENTARY'}
                     </button>
                 ) : (
                     <div className={`flex items-center gap-3 px-6 py-2 rounded-full border bg-black/50 ${geminiSpeaking ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'border-red-500'}`}>
                        <div className={`w-3 h-3 rounded-full ${geminiSpeaking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-white font-mono text-xs md:text-sm">LIVE</span>
                     </div>
                 )}
            </div>
        )}
      </header>

      {/* Content Switcher */}
      <main className="z-10 w-full flex flex-col items-center justify-center p-4">
        
        {appMode === AppMode.LOGIN && (
          <LoginScreen onLogin={handleLogin} onShowDocs={() => setShowDocs(true)} />
        )}

        {appMode === AppMode.MATCHING && (
          <MatchmakingScreen onCancel={handleLogout} serverStatus={serverStatus} />
        )}

        {appMode === AppMode.GAME && playerProfile && (
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-center w-full max-w-6xl animate-fadeIn">
              
              {/* Player 1 (You) */}
              <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
                        <span className="text-cyan-400 font-bold tracking-widest uppercase">{playerProfile.name}</span>
                     </div>
                     <span className="text-xs text-slate-500 font-mono">YOU</span>
                  </div>
                  <BoardDisplay 
                    playerState={player.state} 
                    title={playerProfile.name}
                    isActive={player.status === GameStatus.PLAYING} 
                  />
                  <div className="mt-4 text-slate-400 text-xs font-mono text-center hidden md:block">
                      ← → MOVE | ↑ ROTATE | ↓ SOFT | SPACE HARD
                  </div>
              </div>

              {/* VS Divider / Actions */}
              <div className="flex flex-col items-center justify-center md:pt-32">
                 <div className="text-4xl md:text-6xl font-pixel text-white/20 italic transform -skew-x-12 mb-4">VS</div>
                 
                 {/* Mobile Game Controls */}
                 <div className="md:hidden grid grid-cols-3 gap-2 w-48 mb-6">
                    <button className="bg-slate-800 p-4 rounded" onClick={() => player.move({x:-1,y:0})}>←</button>
                    <button className="bg-slate-800 p-4 rounded" onClick={() => player.rotate()}>↻</button>
                    <button className="bg-slate-800 p-4 rounded" onClick={() => player.move({x:1,y:0})}>→</button>
                    <button className="bg-slate-800 p-4 rounded col-span-3" onClick={() => player.drop()}>DROP</button>
                 </div>

                 <div className="flex flex-col gap-3">
                    {player.status === GameStatus.GAME_OVER && (
                        <div className="px-6 py-2 bg-slate-800 text-white rounded text-center mb-4">
                           Wait for rematch...
                        </div>
                    )}
                    
                    {player.status === GameStatus.GAME_OVER && (
                        <button 
                            onClick={() => startGame(true)}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-pixel text-white text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                        >
                            RESTART FOR BOTH
                        </button>
                    )}

                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 border border-slate-600 text-slate-400 rounded text-xs font-mono hover:bg-slate-800 transition-colors"
                    >
                        DISCONNECT
                    </button>
                 </div>
              </div>

              {/* Player 2 (Opponent) */}
              <div className="flex flex-col items-center opacity-90 md:scale-95">
                  <div className="flex items-center justify-between w-full mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]" />
                        <span className="text-red-400 font-bold tracking-widest uppercase">{opponentProfile?.name || 'WAITING...'}</span>
                     </div>
                     <span className="text-xs text-slate-500 font-mono">OPPONENT</span>
                  </div>
                  <BoardDisplay 
                    playerState={opponentState} 
                    title={opponentProfile?.name || 'OPPONENT'}
                    isActive={!opponentState.gameOver} 
                    isOpponent={true}
                  />
                   <div className="mt-6 text-slate-600 text-xs font-mono text-center hidden md:block">
                      STATUS: {opponentProfile ? 'CONNECTED' : 'WAITING'}
                  </div>
              </div>

            </div>
        )}

      </main>
    </div>
  );
}