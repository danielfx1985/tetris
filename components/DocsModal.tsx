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
          <h2 className="text-2xl font-pixel text-cyan-400">系统操作手册 v4.0</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-red-500/20 rounded px-3 py-1 font-mono transition-colors"
          >
            [关闭]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-300 font-mono space-y-6">
          
          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-cyan-500">01.</span> 如何搭建局域网 (LAN) 服务器
            </h3>
            <div className="bg-black/30 p-4 rounded border border-slate-700 text-sm">
                <ol className="list-decimal list-inside space-y-3">
                  <li>确保主机电脑已安装 <strong>Node.js</strong> 环境。</li>
                  <li>在项目根目录下，运行安装命令：<br/><code className="bg-slate-800 text-green-400 px-1">npm install ws</code></li>
                  <li>启动中继服务器：<br/><code className="bg-slate-800 text-green-400 px-1">node server.js</code></li>
                  <li>查看主机的局域网 IP 地址 (例如：<code className="text-purple-400">192.168.1.5</code>)，Windows 使用 <code>ipconfig</code>，Mac/Linux 使用 <code>ifconfig</code>。</li>
                  <li><strong>主机 (房主):</strong> 连接地址输入 <code className="text-cyan-400">ws://localhost:8080</code></li>
                  <li><strong>客机 (挑战者):</strong> 连接地址输入 <code className="text-cyan-400">ws://主机IP地址:8080</code></li>
                </ol>
            </div>
          </section>

          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-purple-500">02.</span> 游戏操作指南
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>向左移动</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">←</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>向右移动</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">→</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>旋转方块</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">↑</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                <span>加速下落 (软降)</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">↓</kbd>
              </div>
              <div className="bg-slate-800 p-3 rounded col-span-2 flex justify-between items-center">
                <span>直接落底 (硬降)</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-white border-b-2 border-slate-600">SPACE (空格)</kbd>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-green-500">03.</span> AI 实时解说 (GEMINI LIVE)
            </h3>
            <p className="text-sm mb-3">
              本系统集成了 **Google Gemini** 神经网络，提供实时的电子竞技风格语音解说。
            </p>
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded">
              <p className="text-green-300 text-xs mb-2 uppercase font-bold tracking-wider">启用方法：</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-100">
                <li>确保环境变量中已配置有效的 API Key。</li>
                <li>进入游戏后，点击顶部的 <strong>"AI COMMENTARY"</strong> 按钮。</li>
                <li>AI 将实时观看您的游戏画面，并对操作、消行和失误进行语音解说。</li>
                <li>麦克风权限为可选，开启后您可以直接与解说员对话。</li>
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
            知悉并关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;