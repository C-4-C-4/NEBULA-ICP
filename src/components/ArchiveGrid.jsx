import { useState, useEffect } from 'react';

export default function ArchiveGrid({ initialSites }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayList, setDisplayList] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // 弹窗相关状态
  const [selectedSite, setSelectedSite] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const MAX_ITEMS = 16;

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const processData = (term, mode = 'filter') => {
    if (mode === 'shuffle') setIsShuffling(true);

    let filtered = initialSites;
    if (term && term.trim()) {
      const lower = term.toLowerCase();
      filtered = initialSites.filter(site => 
        site.domain.toLowerCase().includes(lower) || 
        site.icp_code.includes(lower) ||
        site.title.toLowerCase().includes(lower)
      );
    }

    let finalResult = mode === 'shuffle' ? shuffleArray(filtered) : filtered;
    const sliced = finalResult.slice(0, MAX_ITEMS);

    if (mode === 'shuffle') {
        setTimeout(() => {
            setDisplayList(sliced);
            setIsShuffling(false);
        }, 300);
    } else {
        setDisplayList(sliced);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
        setSearchTerm(query);
        processData(query, 'filter');
        const target = initialSites.find(s => s.icp_code === query || s.domain === query);
        if (target) setSelectedSite(target);
    } else {
        processData('', 'shuffle');
    }
  }, []);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
        const val = e.detail;
        setSearchTerm(val);
        processData(val, 'filter');
    };
    window.addEventListener('SEARCH_UPDATE', handleGlobalSearch);
    return () => window.removeEventListener('SEARCH_UPDATE', handleGlobalSearch);
  }, []);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleLogoError = (e, domain) => {
    const img = e.target;
    if (img.src.includes('favicon.im')) {
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } else {
        img.src = `https://ui-avatars.com/api/?name=${domain}&background=000&color=fff&size=128`;
        img.onerror = null;
    }
  };

  const handleClose = () => {
    setIsClosing(true); 
    setTimeout(() => {
        setSelectedSite(null);
        setIsClosing(false);
        window.history.replaceState(null, '', '/archives');
    }, 280); 
  };

  return (
    <div className="w-full">
      
      <div className="flex justify-end mb-6">
         <button 
            onClick={() => processData(searchTerm, 'shuffle')}
            disabled={isShuffling}
            className="bg-black text-white px-6 py-2 font-bold border-2 border-transparent hover:bg-echo-orange hover:shadow-hard hover:text-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm group"
         >
            {isShuffling ? (
                <span className="animate-spin">/</span>
            ) : (
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            )}
            <span>RANDOMIZE_VIEW</span>
         </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
            {displayList.map((site) => (
                <div 
                    key={site.id} 
                    onClick={() => setSelectedSite(site)}
                    className="bg-white border-2 border-echo-dark shadow-hard hover:shadow-[8px_8px_0_0_#E85D22] transition-all duration-300 group flex flex-col h-full animate-fade-in-up cursor-pointer relative top-0 hover:-top-1"
                >
                    <div className="bg-echo-gray border-b-2 border-echo-dark px-3 py-1 flex justify-between items-center text-[10px] font-bold text-gray-500">
                        <span>#{site.id} / {site.owner || 'UNK'}</span>
                        <span>{new Date(site.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="w-full h-36 bg-gray-200 overflow-hidden border-b-2 border-echo-dark relative">
                        <img 
                             src={`https://s0.wp.com/mshots/v1/https%3A%2F%2F${site.domain}?w=800&quality=90`}
                             className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-all" 
                             loading="lazy"
                             alt="Site Snapshot" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 bg-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold">LOADING...</span>
                        </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 relative">
                                <img 
                                     src={`https://favicon.im/${site.domain}?larger=true`}
                                     className="w-10 h-10 border-2 border-echo-dark bg-white object-contain p-0.5 shadow-[2px_2px_0_0_#000]" 
                                     alt="Logo" 
                                     onError={(e) => handleLogoError(e, site.domain)}
                                />
                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black uppercase truncate leading-tight" title={site.title}>
                                    {site.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-echo-dark text-white text-[10px] px-1 font-bold">ICP {site.icp_code}</span>
                                </div>
                            </div>
                        </div>
                        
                        <a 
                            href={`https://${site.domain}`} 
                            target="_blank" 
                            onClick={stopPropagation}
                            className="text-echo-orange text-xs font-bold hover:underline mb-2 truncate block pl-1"
                        >
                            {site.domain} ↗
                        </a>
                        
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 border-l-2 border-gray-200 pl-2">
                            {site.description}
                        </p>
                    </div>
                </div>
            ))}
      </div>

      {displayList.length === 0 && !isShuffling && (
         <div className="text-center py-20 opacity-50 border-2 border-dashed border-gray-300 mt-4">
            <p className="text-xl font-bold">NO MATCHING RECORDS</p>
         </div>
      )}

      {/* === 档案风格弹窗 (Paper Style) === */}
      {selectedSite && (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={handleClose}
        >
            {/* 卡片容器 */}
            <div 
                className={`bg-[#F0F0EB] w-full max-w-4xl border-2 border-black shadow-[10px_10px_0_0_rgba(0,0,0,0.8)] relative flex flex-col max-h-[95vh] overflow-hidden ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
                onClick={stopPropagation}
            >
                {/* 顶部操作栏 (删除了 ID 显示) */}
                <div className="absolute top-0 right-0 p-4 z-50 flex items-center gap-4">
                    <button 
                        onClick={handleClose}
                        className="bg-white border-2 border-black w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                    >
                        <span className="text-lg font-black">X</span>
                    </button>
                </div>

                {/* 核心内容区 */}
                <div className="flex-1 overflow-y-auto w-full flex flex-col md:flex-row p-8 gap-8">
                    
                    {/* 左侧：照片区 (修改点：图片居中，object-contain) */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <div className="aspect-square w-full border-2 border-black bg-white p-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] relative">
                            {/* 图片容器 */}
                            <div className="w-full h-full bg-gray-100 overflow-hidden relative group flex items-center justify-center">
                                <img 
                                    src={`https://s0.wp.com/mshots/v1/https%3A%2F%2F${selectedSite.domain}?w=800&quality=90`}
                                    // 核心修改：改为 object-contain (包含)，并增加 p-2 留白
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 p-2" 
                                    alt="Snapshot"
                                />
                                {/* Logo 覆盖在右下角 */}
                                <div className="absolute bottom-2 right-2 w-10 h-10 bg-white border border-black rounded-full flex items-center justify-center shadow-sm z-10">
                                    <img 
                                        src={`https://favicon.im/${selectedSite.domain}?larger=true`}
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => handleLogoError(e, selectedSite.domain)}
                                    />
                                </div>
                            </div>
                            {/* 装饰性回形针 */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-8 border-2 border-gray-400 rounded-full bg-[#F0F0EB] z-10"></div>
                        </div>
                        
                        {/* 移动端访问按钮 */}
                        <a href={`https://${selectedSite.domain}`} target="_blank" className="md:hidden w-full bg-black text-white text-center py-3 font-bold border-2 border-transparent hover:bg-echo-orange hover:text-black transition-all">
                            VISIT SITE →
                        </a>
                    </div>

                    {/* 右侧：档案信息区 */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        
                        {/* 标题头 */}
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-2 tracking-tight leading-none">
                                {selectedSite.title}
                            </h2>
                            <div className="inline-block bg-black text-white px-3 py-1 font-mono text-sm font-bold">
                                {selectedSite.domain}
                            </div>
                        </div>

                        {/* 数据网格 (2x2) */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white border border-black p-3 shadow-[3px_3px_0_0_#ddd]">
                                <div className="text-[10px] font-bold text-gray-400 mb-1">OWNER (站长)</div>
                                <div className="text-lg font-bold text-[#E85D22] truncate">{selectedSite.owner}</div>
                            </div>
                            <div className="bg-white border border-black p-3 shadow-[3px_3px_0_0_#ddd]">
                                <div className="text-[10px] font-bold text-gray-400 mb-1">ICP LICENSE</div>
                                <div className="text-lg font-bold text-[#1A1A1A] font-mono truncate">{selectedSite.icp_code}</div>
                            </div>
                            <div className="bg-white border border-black p-3 shadow-[3px_3px_0_0_#ddd]">
                                <div className="text-[10px] font-bold text-gray-400 mb-1">REG DATE</div>
                                <div className="text-sm font-bold text-[#1A1A1A]">{new Date(selectedSite.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="bg-white border border-black p-3 shadow-[3px_3px_0_0_#ddd]">
                                <div className="text-[10px] font-bold text-gray-400 mb-1">CONTACT</div>
                                <div className="text-sm font-bold text-[#1A1A1A] truncate" title={selectedSite.email}>{selectedSite.email}</div>
                            </div>
                        </div>

                        {/* 描述区域 */}
                        <div className="flex-grow mb-8">
                            <div className="border-l-4 border-[#E85D22] pl-4 py-1">
                                <p className="text-base text-gray-700 font-medium leading-relaxed italic">
                                    “{selectedSite.description || '暂无详细介绍...'}”
                                </p>
                            </div>
                        </div>

                        {/* 底部虚线 & 大按钮 */}
                        <div className="mt-auto border-t-2 border-dashed border-gray-400 pt-6 flex justify-between items-center gap-4">
                            <div className="hidden md:block text-xs font-bold text-gray-400 font-mono">
                                SECURITY_LEVEL: <span className="text-green-600">SAFE</span>
                            </div>
                            <a 
                                href={`https://${selectedSite.domain}`} 
                                target="_blank"
                                className="hidden md:flex bg-black text-white px-8 py-3 font-bold text-sm border-2 border-transparent hover:bg-[#E85D22] hover:text-black hover:shadow-[4px_4px_0_0_#000] transition-all items-center gap-2 group"
                            >
                                ACCESS TERMINAL
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-out { animation: fadeOut 0.2s ease-in forwards; }
        .animate-zoom-out { animation: zoomOut 0.2s ease-in forwards; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes zoomOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
      `}</style>
    </div>
  );
}