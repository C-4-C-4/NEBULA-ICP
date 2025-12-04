import { useState, useEffect } from 'react';

export default function NumberSelector() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // 获取号码
  const fetchCodes = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/numbers?q=${q}`);
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // 搜索防抖
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    // 简单的搜索逻辑
    fetchCodes(val);
  };

  // 选中号码 -> 跳转回首页填表
  const selectCode = (code) => {
    window.location.href = `/?selected_code=${code}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
        
        {/* 搜索栏 */}
        <div className="mb-8 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-echo-orange font-bold">
                QUERY //
            </div>
            <input 
                type="text" 
                value={search}
                onChange={handleSearch}
                placeholder="SEARCH NUMBER (e.g. 888)..." 
                className="w-full bg-white border-4 border-black py-4 pl-24 pr-4 text-xl font-bold font-mono focus:outline-none focus:shadow-hard transition-all placeholder-gray-300 text-echo-dark"
                autoFocus
            />
            <button 
                onClick={() => fetchCodes('')} 
                className="absolute right-2 top-2 bottom-2 bg-gray-100 px-4 font-bold border-2 border-transparent hover:border-black hover:bg-white text-xs"
            >
                REFRESH POOL
            </button>
        </div>

        {/* 号码网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading ? (
                // Loading 骨架
                Array(12).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse border-2 border-transparent"></div>
                ))
            ) : codes.length > 0 ? (
                codes.map(code => (
                    <button 
                        key={code}
                        onClick={() => selectCode(code)}
                        className="group relative bg-white border-2 border-black p-3 hover:bg-echo-dark hover:text-echo-orange hover:-translate-y-1 hover:shadow-hard transition-all text-center"
                    >
                        <div className="font-mono text-lg font-black tracking-widest">{code}</div>
                        <div className="text-[10px] text-gray-400 group-hover:text-echo-orange/50 font-bold mt-1">AVAILABLE</div>
                        {/* 装饰角标 */}
                        <div className="absolute top-0 right-0 w-2 h-2 bg-echo-orange opacity-0 group-hover:opacity-100"></div>
                    </button>
                ))
            ) : (
                <div className="col-span-full text-center py-10 border-2 border-dashed border-gray-300 text-gray-400 font-bold">
                    NO NUMBERS MATCHING "{search}"
                </div>
            )}
        </div>
    </div>
  );
}