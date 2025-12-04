import { useState, useEffect } from 'react';

export default function UserEdit() {
  const [step, setStep] = useState('login'); // login | edit
  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [toast, setToast] = useState(null);

  // 自动关闭 Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // === 逻辑 1: 验证身份 (Domain + ICP + AuthCode) ===
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/user/verify', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setSiteData(data.data);
        setStep('edit');
        setToast({ type: 'success', msg: 'ACCESS GRANTED // 验证通过' });
      } else {
        setToast({ type: 'error', msg: 'ACCESS DENIED // 校验码错误' });
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'NETWORK ERROR' });
    }
    setLoading(false);
  };

  // === 逻辑 2: 提交修改 ===
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    // 补全身份信息用于后端二次校验
    formData.append('domain', siteData.domain);
    formData.append('icp', siteData.icp_code);
    formData.append('auth_code', siteData.auth_code); // 传递校验码

    // 重新生成快照链接
    const fullUrl = `https://${siteData.domain}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const snapshot = `https://s0.wordpress.com/mshots/v1/${encodedUrl}?w=800&quality=90`;
    formData.append('snapshot_url', snapshot);

    try {
      const res = await fetch('/api/user/update', { method: 'POST', body: formData });
      if (res.ok) {
        setToast({ type: 'success', msg: 'UPDATE SUCCESSFUL // 修改完成' });
        setTimeout(() => window.location.href = '/archives', 1500);
      } else {
        setToast({ type: 'error', msg: 'UPDATE FAILED' });
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
      
      {/* 步骤 1: 身份验证表单 */}
      {step === 'login' && (
        <div className="bg-white border-2 border-echo-dark p-8 shadow-hard relative animate-fade-in-up">
          <div className="mb-6 border-b-2 border-black pb-2">
            <h2 className="text-2xl font-black text-echo-dark">MODIFY RECORD</h2>
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
            {/* 校验码输入 */}
            <div>
              <label className={labelStyle}>VERIFICATION CODE (8位校验码)</label>
              <input name="auth_code" required placeholder="XXXXXXXX" className={inputStyle} />
            </div>

            <button disabled={loading} className="w-full bg-black text-white font-bold py-3 mt-4 hover:bg-echo-orange hover:text-black border-2 border-transparent transition-all disabled:opacity-50">
              {loading ? "VERIFYING..." : "VERIFY & EDIT // 验证身份"}
            </button>
          </form>
        </div>
      )}

      {/* 步骤 2: 修改资料表单 */}
      {step === 'edit' && siteData && (
        <div className="bg-white border-2 border-echo-dark p-8 shadow-hard relative animate-fade-in-up">
          <div className="mb-6 border-b-2 border-echo-orange pb-2 flex justify-between items-end">
            <div>
                <h2 className="text-xl font-black text-echo-dark">EDITING MODE</h2>
                <p className="text-xs font-mono text-gray-400">{siteData.domain}</p>
            </div>
            <div className="bg-echo-orange text-white px-2 text-xs font-bold">UNLOCKED</div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* 只读信息 */}
            <div className="grid grid-cols-2 gap-4 bg-gray-100 p-2 border border-gray-300 text-gray-500 text-xs select-none">
                <div>ICP: {siteData.icp_code}</div>
                <div>AUTH: {siteData.auth_code}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelStyle}>SITE NAME</label>
                    <input name="title" defaultValue={siteData.title} className={inputStyle} />
                </div>
                <div>
                    <label className={labelStyle}>OWNER</label>
                    <input name="owner" defaultValue={siteData.owner} className={inputStyle} />
                </div>
            </div>

            <div>
                <label className={labelStyle}>LOGO URL</label>
                <input name="logo" defaultValue={siteData.logo_url} className={inputStyle} />
            </div>

            <div>
                <label className={labelStyle}>DESCRIPTION</label>
                <textarea name="desc" rows="3" defaultValue={siteData.description} className={inputStyle}></textarea>
            </div>

            <button disabled={loading} className="w-full bg-echo-dark text-white font-bold py-3 mt-2 hover:bg-echo-orange hover:shadow-hard transition-all disabled:opacity-50">
              {loading ? "SAVING..." : "SAVE CHANGES // 保存修改"}
            </button>
            
            <button type="button" onClick={() => setStep('login')} className="w-full text-xs text-gray-400 hover:text-red-500 underline mt-2">
                CANCEL & EXIT
            </button>
          </form>
        </div>
      )}

      {/* Toast 提示 */}
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