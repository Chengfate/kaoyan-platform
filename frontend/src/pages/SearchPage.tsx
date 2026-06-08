import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { schools } from '../api';
import type { School } from '../types';
import { GridSkeleton } from '../components/common/LoadingSkeleton';

const PROVINCES = ['北京', '上海', '天津', '重庆', '江苏', '浙江', '广东', '湖北', '四川', '陕西', '湖南', '福建', '山东', '辽宁', '安徽', '河南', '河北', '江西', '黑龙江', '吉林', '山西', '广西', '云南', '贵州', '甘肃', '内蒙古', '新疆', '海南', '宁夏', '青海', '西藏'];
const TIERS = ['985', '211', '双一流', '普通一本', '科研院所', '普通'];
const CATEGORIES = ['综合', '理工', '师范', '医药', '农林', '财经', '政法', '语言', '艺术', '体育', '民族', '军事'];

const TIER_COLORS: Record<string, string> = {
  '985': 'bg-red-50 text-red-700 border-red-200',
  '211': 'bg-orange-50 text-orange-700 border-orange-200',
  '双一流': 'bg-blue-50 text-blue-700 border-blue-200',
  '普通一本': 'bg-green-50 text-green-700 border-green-200',
  '科研院所': 'bg-purple-50 text-purple-700 border-purple-200',
  '普通': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [province, setProvince] = useState<string[]>(searchParams.get('province')?.split(',').filter(Boolean) || []);
  const [tier, setTier] = useState<string[]>(searchParams.get('tier')?.split(',').filter(Boolean) || []);
  const [category, setCategory] = useState<string[]>(searchParams.get('category')?.split(',').filter(Boolean) || []);

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = (p = 1) => {
    setLoading(true);
    setError('');
    const params: Record<string, string | number> = { page: p, page_size: 20 };
    if (keyword) params.keyword = keyword;
    if (province.length) params.province = province.join(',');
    if (tier.length) params.tier = tier.join(',');
    if (category.length) params.category = category.join(',');

    const sp = new URLSearchParams();
    if (keyword) sp.set('keyword', keyword);
    if (province.length) sp.set('province', province.join(','));
    if (tier.length) sp.set('tier', tier.join(','));
    if (category.length) sp.set('category', category.join(','));
    setSearchParams(sp, { replace: true });

    schools.list(params).then(res => {
      if (res.data.success) {
        setData(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.total_pages || 0);
        setPage(p);
      }
    }).catch(() => {
      setError('加载失败，请检查网络后重试');
    }).finally(() => setLoading(false));
  };

  const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearAll = () => {
    setProvince([]); setTier([]); setCategory([]); setKeyword('');
    fetchData(1);
  };

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}>{label}</button>
  );

  const hasFilters = province.length > 0 || tier.length > 0 || category.length > 0;

  const handleSearch = () => fetchData(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">院校专业查询</h1>

      {/* Search Bar */}
      <div className="flex gap-3">
        <input
          type="text" placeholder="输入院校名称搜索..." value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button onClick={handleSearch}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          搜索
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-gray-500 flex-shrink-0 w-12">省份</span>
          <div className="flex flex-wrap gap-1.5">
            {PROVINCES.map(p => <Chip key={p} label={p} active={province.includes(p)} onClick={() => toggle(province, p, setProvince)} />)}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-gray-500 flex-shrink-0 w-12">层次</span>
          <div className="flex flex-wrap gap-1.5">
            {TIERS.map(t => <Chip key={t} label={t} active={tier.includes(t)} onClick={() => toggle(tier, t, setTier)} />)}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-gray-500 flex-shrink-0 w-12">类别</span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => <Chip key={c} label={c} active={category.includes(c)} onClick={() => toggle(category, c, setCategory)} />)}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">共 <span className="font-semibold text-gray-700">{total}</span> 所院校</p>
          {hasFilters && (
            <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-600">清除全部筛选</button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData(page)} className="text-red-500 hover:text-red-700 font-medium">重试</button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <GridSkeleton count={6} />
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(s => (
            <Link key={s.id} to={`/schools/${s.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{s.province} {s.city || ''}</span>
                    {s.is_self_rated === 1 && <span className="text-xs text-orange-500 font-medium">自主划线</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ml-2 flex-shrink-0 ${TIER_COLORS[s.tier] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{s.tier}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="bg-gray-50 px-2 py-0.5 rounded">{s.category}</span>
                <span>{s.major_count} 个专业</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>未找到匹配的院校，请尝试其他筛选条件</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1">
          <button
            onClick={() => fetchData(page - 1)}
            disabled={page <= 1}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← 上一页
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            // Show pages around current
            let pageNum: number;
            if (totalPages <= 10) {
              pageNum = i + 1;
            } else if (page <= 6) {
              pageNum = i + 1;
            } else if (page >= totalPages - 4) {
              pageNum = totalPages - 9 + i;
            } else {
              pageNum = page - 5 + i;
            }
            return (
              <button key={pageNum} onClick={() => fetchData(pageNum)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === page ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>{pageNum}</button>
            );
          })}
          <button
            onClick={() => fetchData(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
}
