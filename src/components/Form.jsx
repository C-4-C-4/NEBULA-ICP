import { useState, useEffect, useRef } from 'react';

export default function Form() {
  const formRef = useRef(null); 
  const [status, setStatus] = useState('idle'); 
  const [result, setResult] = useState(null);
  const [authCode, setAuthCode] = useState(null);
  const [siteStatus, setSiteStatus] = useState('active'); 
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState("INITIALIZING...");
  const [toast, setToast] = useState(null);
  const [preSelectedCode, setPreSelectedCode] = useState(null);
  
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('selected_code');
    if (code) setPreSelectedCode(code);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const LOG_STEPS = [
    { pct: 10, text: "CONNECTING TO D1 DATABASE..." },
    { pct: 30, text: "CHECKING BLACKLIST & RATE..." },
    { pct: 50, text: "ANALYZING CONTENT DATA..." },
    { pct: 70, text: "REQUESTING SNAPSHOT RENDER..." },
    { pct: 85, text: "GENERATING UNIQUE ICP_CODE..." },
    { pct: 95, text: "WRITING TO IMMUTABLE LEDGER..." },
    { pct: 100, text: "COMPLETED." }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const logo = formData.get('logo');
    const desc = formData.get('desc');

    if (!logo.trim() || !desc.trim()) {
        setShowWarning(true);
    } else {
        processSubmission(formData);
    }
  };

  const confirmWarning = () => {
    setShowWarning(false);
    if (formRef.current) {
        const formData = new FormData(formRef.current);
        processSubmission(formData);
    }
  };

  const processSubmission = async (formData) => {
    setStatus('processing');
    setProgress(0);
    setResult(null);
    setAuthCode(null);
    setToast(null);

    const apiRequest = fetch('/api/submit', { method: 'POST', body: formData })
      .then(res => res.json())
      .catch(() => ({ success: false, error: 'NETWORK_ERROR' }));

    const DURATION = 3000; 
    const INTERVAL = 30;
    const STEP = 100 / (DURATION / INTERVAL);

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += STEP;
      const visualProgress = Math.min(currentProgress, 99); 
      setProgress(visualProgress);
      const currentLog = LOG_STEPS.find(step => visualProgress < step.pct);
      if (currentLog) setLogText(currentLog.text);
    }, INTERVAL);

    await new Promise(r => setTimeout(r, DURATION));
    clearInterval(timer);

    const data = await apiRequest;
    
    if(data.success) {
      setProgress(100);
      setLogText("DONE.");
      setResult(data.code);
      setAuthCode(data.auth);
      setSiteStatus(data.status); 
      setStatus('finished');
    } else {
      let errorMsg = "SYSTEM ERROR // 提交失败";
      
      if (data.error === 'DUPLICATE_DOMAIN') {
          errorMsg = "DOMAIN EXISTS // 域名已收录";
      } else if (data.error === 'CODE_TAKEN') {
          errorMsg = "NUMBER TAKEN // 号码已被抢注";
      } else if (data.error === 'RATE_LIMIT_EXCEEDED') {
          errorMsg = "RATE LIMIT // 提交过快 (6次/小时)";
      } else if (data.error === 'BLACKLISTED') {
          errorMsg = "ACCESS DENIED // 网站在黑名单中。解除请联系: slxz3238@gmail.com";
      }

      setToast({ type: 'error', msg: errorMsg });
      setStatus('idle');
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ type: 'success', msg: 'COPIED TO CLIPBOARD' });
  };

  const inputStyle = "w-full bg-white border border-echo-dark px-2 py-1.5 font-mono text-sm focus:outline-none focus:shadow-hard focus:border-echo-orange transition-all placeholder-gray-300";
  const labelStyle = "block text-[10px] font-bold mb-0.5 uppercase tracking-wider text-echo-orange";

  if (status === 'finished' && result) {
    const icpLink = `https://icp.996icu.eu.org/?keyword=${result}`;
    const htmlCode = `<a href="${icpLink}" target="_blank">星云ICP备${result}号</a>`;

    return (
      <div className="bg-white border-2 border-echo-dark p-6 shadow-hard text-center min-h-[450px] flex flex-col justify-center items-center relative animate-fade-in">
        
        {siteStatus === 'pending' ? (
            <>
                <h3 className="text-3xl font-black text-gray-500 mb-2">UNDER REVIEW</h3>
                <div className="text-sm font-bold text-echo-orange mb-6 bg-echo-orange/10 px-2 py-1 border border-echo-orange">
                    待人工审核 (资料不全)
                </div>
            </>
        ) : (
            <>
                <h3 className="text-4xl font-black text-echo-orange mb-2">APPROVED</h3>
                <div className="text-sm font-bold text-gray-400 mb-6">ICP LICENSE GRANTED</div>
            </>
        )}
        
        <div className="inline-block bg-echo-dark text-white text-3xl font-mono px-6 py-2 -rotate-2 border-2 border-dashed border-white shadow-lg mb-6">
          ICP-{result}
        </div>

        <div className="w-full bg-red-50 border-2 border-red-500 p-4 mb-6 relative text-left">
            <div className="text-[10px] text-red-500 font-bold mb-1 uppercase flex items-center gap-1">
                <span className="animate-pulse">●</span> PRIVATE KEY (SAVE IT!)
            </div>
            <div className="text-2xl font-black font-mono text-echo-dark tracking-widest bg-white border border-red-200 p-2 text-center select-all">
                {authCode}
            </div>
        </div>
        
        <div className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-left mb-6 relative group">
            <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Embed HTML Code:</div>
            <code className="block text-xs font-mono text-echo-dark break-all bg-white p-2 border border-gray-200 select-all">
                {htmlCode}
            </code>
            <button onClick={() => copyText(htmlCode)} className="absolute top-2 right-2 bg-echo-dark text-white text-[10px] px-2 py-1 hover:bg-echo-orange font-bold">COPY</button>
        </div>

        <button onClick={() => { setStatus('idle'); setResult(null); }} className="text-xs text-gray-500 hover:text-echo-orange underline font-bold">
            [ SUBMIT ANOTHER ONE ]
        </button>

        {toast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 text-xs font-bold shadow-lg animate-fade-in-up">
                {toast.msg}
            </div>
        )}
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="bg-echo-dark border-2 border-echo-orange p-6 shadow-hard relative min-h-[400px] flex flex-col justify-between font-mono">
        <div className="flex justify-between items-end border-b border-gray-700 pb-2 mb-4">
            <span className="text-echo-orange font-bold text-lg animate-pulse">/// SYSTEM PROCESSING</span>
            <span className="text-xs text-gray-500">PID: {Math.floor(Math.random() * 9999)}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="text-4xl font-black text-white mb-2">
                {Math.round(progress)}<span className="text-echo-orange text-2xl">%</span>
            </div>
            <div className="w-full h-4 bg-gray-800 border border-gray-600 relative overflow-hidden">
                <div className="h-full bg-echo-orange transition-all duration-100 ease-linear relative" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                </div>
            </div>
            <div className="text-xs text-green-500 mt-2 font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                &gt; {logText}
            </div>
        </div>
        <div className="mt-8 pt-2 border-t border-gray-700 text-[10px] text-gray-500 flex justify-between uppercase">
            <span>Core: Active</span>
            <span>Mem: Allocating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-echo-dark p-5 shadow-hard relative max-w-2xl mx-auto min-h-[400px]">
      <div className="flex justify-between items-end mb-4 border-b-2 border-echo-orange pb-1">
        <h2 className="text-lg font-black">// 申请收录 (APPLICATION)</h2>
        {preSelectedCode ? (
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">LOCKED:</span>
                <span className="bg-echo-orange text-white px-2 text-xs font-bold">{preSelectedCode}</span>
                <a href="/select" className="text-[10px] underline hover:text-echo-orange">CHANGE</a>
            </div>
        ) : (
            <a href="/select" className="text-[10px] font-bold bg-black text-white px-2 py-0.5 hover:bg-echo-orange transition-colors">[ SELECT NUMBER // 选号 ]</a>
        )}
      </div>

      <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-3">
        {preSelectedCode && <input type="hidden" name="custom_code" value={preSelectedCode} />}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyle}>DOMAIN (域名)</label>
            <input name="domain" required placeholder="example.com" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>SITE NAME (网站名称)</label>
            <input name="title" required placeholder="Project Zero" className={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyle}>OWNER (站长)</label>
            <input name="owner" required placeholder="你的昵称" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>EMAIL (邮箱)</label>
            <input name="email" type="email" placeholder="hi@nebula.cc" className={inputStyle} />
          </div>
        </div>

        <div>
           <label className={labelStyle}>LOGO URL (小图标, 留空则自动获取)</label>
           <input name="logo" placeholder="https://..." className={inputStyle} />
        </div>
        
        <div>
          <label className={labelStyle}>DESCRIPTION (简述)</label>
          <textarea name="desc" rows="3" placeholder="关于该实体的简要描述..." className={inputStyle}></textarea>
        </div>

        <button className="w-full bg-echo-dark text-white font-bold py-3 text-sm mt-4 border-2 border-transparent hover:bg-echo-orange hover:shadow-hard transition-all">
          {preSelectedCode ? `CONFIRM WITH ${preSelectedCode}` : "CONFIRM // 确认提交"}
        </button>
      </form>
      
      {/* 
         === 警告弹窗 (Warning Modal) === 
         修改：增加了 animate-alert-in 实现快速回弹动画
      */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-echo-orange p-6 w-[90%] max-w-sm shadow-[8px_8px_0_0_#E85D22] relative animate-alert-in">
            <h3 className="text-xl font-black text-echo-orange mb-4 tracking-tighter">MISSING DATA // 信息缺失</h3>
            <p className="text-sm font-bold text-gray-700 mb-6 leading-relaxed">
                检测到 <span className="font-mono">Logo</span> 或 <span className="font-mono">简介</span> 为空。<br/>
                这将触发 <span className="text-red-600 bg-red-100 px-1 border border-red-200">人工审核</span> 流程，可能导致收录延迟。
            </p>
            <div className="flex gap-3">
                <button 
                    type="button"
                    onClick={() => setShowWarning(false)} 
                    className="flex-1 border-2 border-black py-3 font-black hover:bg-gray-100 text-xs transition-colors"
                >
                    BACK // 返回填写
                </button>
                <button 
                    type="button"
                    onClick={confirmWarning} 
                    className="flex-1 bg-black text-white py-3 font-black hover:bg-echo-orange border-2 border-transparent hover:text-black transition-colors text-xs"
                >
                    CONTINUE // 继续提交
                </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-2 font-bold text-sm tracking-wide animate-bounce-in text-center min-w-[320px] max-w-[90%] ${toast.type === 'error' ? 'bg-echo-dark text-white border-red-500' : 'bg-echo-dark text-white border-green-500'}`}>
             <div className="text-xl mb-1">{toast.type === 'error' ? '⚠️ ERROR' : '✅ SUCCESS'}</div>
             <div className="break-words">{toast.msg}</div>
          </div>
      )}
      
      {/* 增加了 animate-alert-in 的定义 */}
      <style>{`
        .animate-bounce-in{animation:bounceIn 0.3s cubic-bezier(0.18,0.89,0.32,1.28)}
        .animate-fade-in-up{animation:fadeInUp 0.3s ease-out}
        
        /* 新增：警告框的弹出动画 (快速放大+回弹) */
        .animate-alert-in{animation:alertIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)}
        
        @keyframes bounceIn{from{transform:translate(-50%,-40%) scale(0.9);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
        @keyframes fadeInUp{from{transform:translate(-50%,10px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
        @keyframes alertIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}