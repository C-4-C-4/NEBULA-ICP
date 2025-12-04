import { useState, useEffect } from 'react';

export default function UserDelete() {
  const [step, setStep] = useState('login'); // login | confirm
  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // === 逻辑 1: 验证身份 (复用 verify 接口) ===
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      // 复用之前的 verify 接口查询信息
      const res = await fetch('/api/user/verify', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setSiteData(data.data);
        setStep('confirm');
        setToast({ type: 'success', msg: 'IDENTITY VERIFIED // 身份确认' });
      } else {
        setToast({ type: 'error', msg: 'ACCESS DENIED // 信息不匹配' });
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'NETWORK ERROR' });
    }
    setLoading(false);
  };

  // === 逻辑 2: 执行删除 ===
  const handleDelete = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('domain', siteData.domain);
    formData.append('icp', siteData.icp_code);
    formData.append('auth_code', siteData.auth_code);

    try {
      const res = await fetch('/api/user/delete', { method: 'POST', body: formData });
      if (res.ok) {
        setToast({ type: 'success', msg: 'RECORD DELETED // 已注销' });
        // 成功后跳转回首页
        setTimeout(() => window.location.href = '/', 1500);
      } else {
        setToast({ type: 'error', msg: 'DELETE FAILED' });
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'NETWORK ERROR' });
    }
    setLoading(false);
  };

  const inputStyle = "w-full bg-white border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:shadow-hard focus:border-echo-orange transition-all placeholder-gray-300";
  const labelStyle = "block text-xs font-bold mb-1 uppercase tracking-wider text-echo-orange";

  return (
    <div className="w-full max-w-lg mx-auto">
      
      {/* 步骤 1: 身份验证 */}
      {step === 'login' && (
        <div className="bg-white border-2 border-echo-dark p-8 shadow-hard relative animate-fade-in-up">
          <div className="mb-6 border-b-2 border-black pb-2">
            <h2 className="text-2xl font-black text-echo-dark">DEREGISTER</h2>
            <p className="text-xs text-gray-500 font-bold">VERIFICATION REQUIRED</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className={labelStyle}>DOMAIN (域名)</label>
              <input name="domain" required placeholder="example.com" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>ICP CODE (备案号)</label>
              <input name="icp" required placeholder="2025xxxx" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>VERIFICATION CODE (8位校验码)</label>
              <input name="auth_code" required placeholder="XXXXXXXX" className={inputStyle} />
            </div>

            <button disabled={loading} className="w-full bg-black text-white font-bold py-3 mt-4 hover:bg-red-600 hover:text-white border-2 border-transparent transition-all disabled:opacity-50">
              {loading ? "VERIFYING..." : "VERIFY IDENTITY // 验证身份"}
            </button>
          </form>
        </div>
      )}

      {/* 步骤 2: 确认删除警告 */}
      {step === 'confirm' && siteData && (
        <div className="bg-white border-2 border-red-600 p-8 shadow-[8px_8px_0_0_#DC2626] relative animate-bounce-in">
          
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-2xl font-black text-red-600 mb-1">WARNING</h2>
            <p className="text-xs font-bold text-gray-500">THIS ACTION IS IRREVERSIBLE</p>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 mb-6 text-sm">
            <p className="font-bold mb-2">TARGET:</p>
            <ul className="list-disc pl-4 space-y-1 font-mono text-xs">
                <li>DOMAIN: <span className="font-bold">{siteData.domain}</span></li>
                <li>ICP: <span className="font-bold">{siteData.icp_code}</span></li>
                <li>OWNER: <span className="font-bold">{siteData.owner}</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <button 
                onClick={handleDelete} 
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3 border-2 border-transparent hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50"
            >
                {loading ? "DELETING..." : "CONFIRM DELETION // 确认注销"}
            </button>
            
            <button 
                onClick={() => setStep('login')} 
                className="w-full border-2 border-black text-black font-bold py-2 hover:bg-gray-100 text-xs"
            >
                CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
          <div className={`
            fixed top-20 left-1/2 -translate-x-1/2 z-50 
            px-6 py-3 shadow-hard border-2 font-bold text-sm animate-bounce-in text-center min-w-[300px]
            ${toast.type === 'error' ? 'bg-echo-dark text-white border-red-500' : 'bg-echo-dark text-white border-green-500'}
          `}>
             {toast.msg}
          </div>
      )}

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
        .animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
}