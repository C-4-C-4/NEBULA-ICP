import { useState, useEffect, useMemo } from 'react';

export default function AdminPanel({ sites }) {
  const [list, setList] = useState(sites);
  const [editingId, setEditingId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedIds, setSelectedIds] = useState(new Set()); 
  
  // 筛选状态
  const [filterStatus, setFilterStatus] = useState('all'); 

  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 
  const [loadingId, setLoadingId] = useState(null); 

  // === 辅助逻辑 ===

  const filteredList = useMemo(() => {
    let temp = list;
    if (filterStatus !== 'all') {
        temp = list.filter(site => site.status === filterStatus);
    }
    if (!searchTerm) return temp;
    const lowerTerm = searchTerm.toLowerCase();
    return temp.filter(site => 
      site.domain.toLowerCase().includes(lowerTerm) || 
      site.icp_code.includes(lowerTerm)
    );
  }, [list, searchTerm, filterStatus]);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredList.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredList.map(s => s.id)));
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, msg) => setToast({ type, msg });

  // === API 操作逻辑 ===

  const handleAction = async (formData) => {
    try {
      const res = await fetch('/api/admin/action', { method: 'POST', body: formData });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      title: "TERMINATE SESSION?",
      onConfirm: async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.reload();
      }
    });
  };

  const handleApprove = (id) => {
    const fd = new FormData();
    fd.append('action', 'approve');
    fd.append('id', id);
    setLoadingId(id);
    handleAction(fd).then(() => {
        showToast('success', 'STATUS: ACTIVE');
        setTimeout(() => window.location.reload(), 500);
    });
  };

  const handleReject = (id) => {
    setConfirmModal({
      title: `REJECT & BLACKLIST #${id}?`,
      onConfirm: async () => {
        const fd = new FormData();
        fd.append('action', 'reject');
        fd.append('id', id);
        setLoadingId(id);
        await handleAction(fd);
        window.location.reload();
      }
    });
  };

  const handleSave = (id) => {
    setConfirmModal({
      title: `UPDATE RECORD #${id}?`,
      onConfirm: async () => {
        const domain = document.getElementById(`e-domain-${id}`).value;
        const title = document.getElementById(`e-title-${id}`).value;
        const owner = document.getElementById(`e-owner-${id}`).value;
        const icp = document.getElementById(`e-icp-${id}`).value;
        const logo = document.getElementById(`e-logo-${id}`).value;
        const snapshot = document.getElementById(`e-snapshot-${id}`).value;
        const authCode = document.getElementById(`e-auth-${id}`).value;

        const fd = new FormData();
        fd.append('action', 'update');
        fd.append('id', id);
        fd.append('domain', domain);
        fd.append('title', title);
        fd.append('owner', owner);
        fd.append('icp', icp);
        fd.append('logo', logo);
        fd.append('snapshot', snapshot);
        fd.append('auth_code', authCode);
        
        setLoadingId(id);
        const success = await handleAction(fd);
        if (success) {
            showToast('success', 'UPDATED');
            setTimeout(() => window.location.reload(), 500);
        } else {
            showToast('error', 'FAILED');
            setLoadingId(null);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleBatchAction = (actionType) => {
    if (selectedIds.size === 0) return;
    
    setConfirmModal({
      title: `${actionType.toUpperCase()} ${selectedIds.size} ITEMS?`,
      onConfirm: async () => {
        setConfirmModal(null); 
        showToast('success', 'PROCESSING BATCH...');
        const promises = Array.from(selectedIds).map(id => {
            const fd = new FormData();
            if (actionType === 'delete') {
                fd.append('action', 'delete');
                fd.append('id', id);
            } else if (actionType === 'toggle_hide') {
                const item = list.find(s => s.id === id);
                fd.append('action', 'toggle_hide');
                fd.append('id', id);
                fd.append('current_val', item.is_hidden);
            }
            return handleAction(fd);
        });
        await Promise.all(promises);
        window.location.reload();
      }
    });
  };

  const handleSingleDelete = (id) => {
    setConfirmModal({
      title: `DELETE #${id}?`,
      onConfirm: async () => {
        const fd = new FormData();
        fd.append('action', 'delete');
        fd.append('id', id);
        setLoadingId(id);
        await handleAction(fd);
        window.location.reload();
      }
    });
  };

  const handleSingleToggle = async (id, currentVal) => {
    const fd = new FormData();
    fd.append('action', 'toggle_hide');
    fd.append('id', id);
    fd.append('current_val', currentVal);
    setLoadingId(id);
    await handleAction(fd);
    window.location.reload();
  };

  const btnAnim = "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_currentColor] active:translate-y-0 active:shadow-none";

  return (
    <div className="bg-black text-green-500 font-mono min-h-screen border-t-8 border-echo-orange p-4 relative pb-24">
      
      {/* === 顶部栏 === */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-4 border-b border-green-800 pb-4 gap-6 sticky top-0 bg-black/95 backdrop-blur z-30 pt-2 shadow-xl">
        <div className="flex flex-col w-full lg:w-auto">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">ROOT_CONSOLE</h1>
          <div className="text-xs text-green-600">SYSTEM.ADMIN // V4.6</div>
        </div>

        <div className="flex-1 w-full lg:max-w-xl relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-green-700 font-bold">
                &gt;_
            </div>
            <input 
                type="text" 
                placeholder="SEARCH DOMAIN OR ICP..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border-2 border-green-800 py-3 pl-10 pr-4 text-white focus:outline-none focus:border-echo-orange focus:shadow-[0_0_15px_rgba(232,93,34,0.3)] transition-all uppercase placeholder-green-900 rounded-sm"
            />
        </div>

        <div className="hidden lg:flex gap-4 text-xs font-bold whitespace-nowrap items-center">
            <button 
                onClick={handleLogout} 
                className={`border border-red-600 text-red-500 px-4 py-2 bg-red-900/10 hover:bg-red-900 hover:text-white ${btnAnim}`}
            >
                [ LOGOUT ]
            </button>
        </div>
      </div>

      {/* === 筛选 Tab === */}
      <div className="flex gap-3 mb-6 text-sm font-bold flex-wrap">
          {['all', 'pending', 'active', 'rejected'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 border-2 uppercase ${btnAnim} ${
                    filterStatus === status 
                    ? 'bg-echo-orange border-echo-orange text-black shadow-[2px_2px_0_0_#fff]' 
                    : 'border-green-800 text-green-700 hover:text-white hover:border-green-500 bg-black'
                }`}
              >
                  {status}
                  {status === 'pending' && list.filter(s => s.status === 'pending').length > 0 && (
                      <span className="ml-2 bg-red-600 text-white px-1.5 rounded-sm text-[10px]">
                          {list.filter(s => s.status === 'pending').length}
                      </span>
                  )}
              </button>
          ))}
      </div>

      {/* === 卡片网格 === */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {filteredList.map(site => (
          <div key={site.id} className={`
            relative border-2 transition-all duration-300 flex flex-col justify-between h-full min-h-[320px] group rounded-sm
            ${loadingId === site.id ? 'opacity-50 pointer-events-none grayscale' : ''}
            ${editingId === site.id ? 'border-echo-orange bg-echo-orange/5 shadow-[0_0_20px_rgba(232,93,34,0.1)]' : 'border-green-900 bg-green-900/5 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]'}
            ${site.status === 'rejected' ? 'border-red-900 bg-red-900/5 grayscale hover:grayscale-0' : ''}
            ${site.status === 'pending' ? 'border-yellow-600 bg-yellow-900/10' : ''}
          `}>
            
            {loadingId === site.id && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <span className="text-echo-orange animate-spin text-3xl font-black">/</span>
              </div>
            )}

            <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={selectedIds.has(site.id)} onChange={() => toggleSelect(site.id)} className="w-5 h-5 accent-echo-orange border-2 border-black cursor-pointer shadow-sm" />
            </div>

            {/* === 编辑模式 === */}
            {editingId === site.id ? (
              <div className="p-3 flex flex-col gap-2 h-full text-xs overflow-y-auto">
                <div className="text-[10px] text-echo-orange font-bold mb-1 pl-6">EDITING...</div>
                <input id={`e-domain-${site.id}`} defaultValue={site.domain} placeholder="Domain" className="bg-black border border-green-600 text-white px-2 py-1 w-full focus:border-echo-orange focus:outline-none" />
                <input id={`e-title-${site.id}`} defaultValue={site.title} placeholder="Title" className="bg-black border border-green-600 text-gray-300 px-2 py-1 w-full focus:border-echo-orange focus:outline-none" />
                <div className="flex gap-2">
                    <input id={`e-owner-${site.id}`} defaultValue={site.owner} placeholder="Owner" className="bg-black border border-green-600 text-gray-300 px-2 py-1 w-1/2 focus:border-echo-orange focus:outline-none" />
                    <input id={`e-icp-${site.id}`} defaultValue={site.icp_code} placeholder="ICP" className="bg-black border border-green-600 text-gray-300 px-2 py-1 w-1/2 focus:border-echo-orange focus:outline-none" />
                </div>
                <div className="space-y-1 pt-1">
                    <input id={`e-logo-${site.id}`} defaultValue={site.logo_url} placeholder="Logo URL" className="bg-black border border-green-800 text-gray-400 px-2 py-1 w-full focus:border-echo-orange focus:outline-none text-[10px]" />
                    <input id={`e-snapshot-${site.id}`} defaultValue={site.snapshot_url} placeholder="Snapshot URL" className="bg-black border border-green-800 text-gray-400 px-2 py-1 w-full focus:border-echo-orange focus:outline-none text-[10px]" />
                    <div>
                        <label className="text-[10px] text-red-500 block mb-0.5">AUTH KEY</label>
                        <input id={`e-auth-${site.id}`} defaultValue={site.auth_code} className="bg-black border border-red-900 text-red-400 px-2 py-1 w-full focus:border-red-500 focus:outline-none text-[10px] font-mono" />
                    </div>
                </div>
                <div className="mt-auto flex gap-2 pt-2">
                    <button onClick={() => handleSave(site.id)} className={`flex-1 bg-echo-orange text-black font-bold py-1.5 hover:bg-white ${btnAnim}`}>SAVE</button>
                    <button onClick={() => setEditingId(null)} className={`flex-1 border border-green-600 text-green-600 font-bold py-1.5 hover:bg-green-900 hover:text-white ${btnAnim}`}>CANCEL</button>
                </div>
              </div>
            ) : (
              /* === 展示模式 === */
              <>
                <div className="p-2 pl-8 border-b border-green-900/50 bg-black/20 flex justify-between items-center h-10">
                    <div className="text-[10px] text-green-700 font-bold">#{site.id}</div>
                    
                    {site.status === 'rejected' ? (
                        <span className="text-[10px] bg-black text-red-500 px-1 font-bold border border-red-900 animate-pulse">BLACKLISTED</span>
                    ) : site.status === 'pending' ? (
                        <span className="text-[10px] bg-yellow-900 text-yellow-200 px-1 font-bold">REVIEWING</span>
                    ) : site.is_hidden === 1 ? (
                        <span className="text-[10px] bg-red-900 text-red-200 px-1 font-bold">HIDDEN</span>
                    ) : (
                        <span className="text-[10px] bg-green-900 text-green-200 px-1 font-bold">VISIBLE</span>
                    )}
                </div>

                <div className="h-24 w-full bg-green-900/10 relative overflow-hidden border-b border-green-900/30 group-hover:opacity-100 opacity-80 transition-opacity">
                    <img src={site.snapshot_url} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all" onError={(e) => e.target.style.display = 'none'} />
                    
                    <div className="absolute bottom-2 right-2">
                        <img src={site.logo_url} className="w-8 h-8 rounded-full border border-green-500 bg-white object-contain p-0.5" 
                             onError={(e) => {
                                 if (!e.target.src.includes('favicon.im')) e.target.src = `https://favicon.im/${site.domain}?larger=true`;
                                 else e.target.style.display = 'none';
                             }} 
                        />
                    </div>

                    {/* === 核心修改：隐藏时的锁头遮罩 === */}
                    {site.is_hidden === 1 && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-10 border-b border-red-900/50">
                            <div className="bg-black border border-red-600 p-2 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 flex-grow flex flex-col justify-center">
                    <div className="text-white font-bold text-sm truncate mb-0.5" title={site.domain}>{site.domain}</div>
                    <div className="text-xs text-gray-500 mb-2 truncate" title={site.title}>{site.title || "No Title"}</div>
                    
                    {site.status === 'pending' && (
                        <div className="text-[10px] text-yellow-500 border border-yellow-800 p-1 mb-2 bg-yellow-900/10">
                            MISSING: {(!site.logo_url || site.logo_url.includes('iowen')) ? 'LOGO' : ''} {(!site.description) ? 'DESC' : ''}
                        </div>
                    )}

                    <div className="flex justify-between text-[10px] text-green-600/80 mt-auto border-t border-green-900/30 pt-2">
                        <span className="text-green-400 truncate max-w-[45%]">{site.owner}</span>
                        <span className="text-green-500 font-mono">{site.icp_code}</span>
                    </div>
                </div>

                <div className="p-2 border-t border-green-900/50 flex justify-between bg-green-900/10 gap-2">
                    {site.status === 'pending' ? (
                        <>
                            <button onClick={() => handleApprove(site.id)} className={`text-[10px] flex-1 bg-green-800 text-white border border-green-600 ${btnAnim} hover:bg-green-500`}>✓ PASS</button>
                            <button onClick={() => handleReject(site.id)} className={`text-[10px] flex-1 bg-red-900 text-white border border-red-700 ${btnAnim} hover:bg-red-600`}>✕ REJECT</button>
                        </>
                    ) : site.status === 'rejected' ? (
                        <>
                            <button onClick={() => handleApprove(site.id)} className={`text-[10px] flex-1 bg-green-900 text-green-300 border border-green-700 ${btnAnim} hover:bg-green-600 hover:text-white`}>
                                ⟳ UNBAN
                            </button>
                            <button onClick={() => handleSingleDelete(site.id)} className={`text-[10px] text-red-500 font-bold px-3 border border-red-900 ${btnAnim} hover:bg-red-900 hover:text-white`}>
                                DEL
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleSingleToggle(site.id, site.is_hidden)} className={`text-[10px] text-green-400 px-2 ${btnAnim} hover:text-white`}>
                                {site.is_hidden ? '[SHOW]' : '[HIDE]'}
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingId(site.id)} className={`text-[10px] text-echo-orange px-2 ${btnAnim} hover:text-white`}>
                                    EDIT
                                </button>
                                <button onClick={() => handleSingleDelete(site.id)} className={`text-[10px] text-red-600 font-bold px-2 ${btnAnim} hover:text-red-300`}>
                                    DEL
                                </button>
                            </div>
                        </>
                    )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-black border-2 border-echo-orange p-6 w-[90%] max-w-sm shadow-[8px_8px_0_0_#E85D22] relative">
            <div className="text-echo-orange text-4xl mb-4 font-black">!</div>
            <h3 className="text-white text-lg font-bold mb-6 font-mono leading-tight">{confirmModal.title}</h3>
            <div className="flex gap-4">
              <button onClick={confirmModal.onConfirm} className={`flex-1 bg-echo-orange text-black font-bold py-3 hover:bg-white text-sm ${btnAnim}`}>CONFIRM</button>
              <button onClick={() => setConfirmModal(null)} className={`flex-1 border-2 border-green-700 text-green-500 font-bold py-3 hover:bg-green-900 text-sm ${btnAnim}`}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 border-l-4 shadow-lg font-bold text-sm tracking-wider animate-slide-in ${toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' : 'bg-red-900/90 border-red-500 text-white'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-400' : 'bg-red-500'} animate-pulse`}></div>
             {toast.msg}
          </div>
        </div>
      )}
      
      <style>{`.animate-fade-in{animation:fadeIn 0.2s ease-out}.animate-slide-in{animation:slideIn 0.3s cubic-bezier(0.16,1,0.3,1)}.animate-slide-up{animation:slideUp 0.3s ease-out}@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@keyframes slideIn{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes slideUp{from{transform:translate(-50%, 100%);opacity:0}to{transform:translate(-50%, 0);opacity:1}}`}</style>
    </div>
  );
}