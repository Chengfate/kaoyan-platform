import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { recommendations, majors, auth } from '../api';
import type { Major, Recommendation } from '../types';

const REGIONS = ['北京', '上海', '广东', '江苏', '浙江', '湖北', '陕西', '四川', '天津', '山东', '湖南', '辽宁', '重庆', '黑龙江', '安徽', '福建', '吉林', '河北', '河南', '山西'];
const TIERS = ['985', '211', '双一流', '普通一本'];
const TIER_LABELS: Record<string, string> = { '985': '985', '211': '211', '双一流': '双一流', '普通一本': '普一' };
const TIER_STYLE: Record<string, string> = { '985': 'bg-red-100 text-red-700', '211': 'bg-orange-100 text-orange-700', '双一流': 'bg-blue-100 text-blue-700' };

export default function RecommendPage() {
  const { user, token, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'total' | 'admit'>('total');
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const [undergrad, setUndergrad] = useState('');
  const [gpa, setGpa] = useState('');
  const [targetMajorId, setTargetMajorId] = useState<number | null>(null);
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [targetTiers, setTargetTiers] = useState<string[]>([]);
  const [selfAssessment, setSelfAssessment] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    majors.list({ page_size: 500 }).then(res => {
      if (res.data.success) setAllMajors(res.data.data);
    }).catch(() => { /* non-critical */ });
  }, []);

  useEffect(() => {
    if (!user?.profile) return;
    const p = user.profile;
    setUndergrad(p.undergraduate || '');
    setGpa(p.gpa != null ? String(p.gpa) : '');
    setTargetMajorId(p.target_major_id);
    try { setTargetRegions(p.target_region ? JSON.parse(p.target_region) : []); } catch { setTargetRegions([]); }
    try { setTargetTiers(p.target_tier ? JSON.parse(p.target_tier) : []); } catch { setTargetTiers([]); }
    setSelfAssessment(p.self_assessment || '');
  }, [user?.profile]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    recommendations.list().then(res => {
      if (res.data.success) setResults(res.data.data);
    }).catch(() => {
      setError('加载历史推荐失败');
    }).finally(() => setLoading(false));
  }, [token]);

  const saveProfile = async () => {
    if (!targetMajorId) { setFormMsg('请选择意向专业'); return; }
    setSaving(true); setFormMsg('');
    try {
      await auth.updateProfile({
        undergraduate: undergrad,
        gpa: gpa ? parseFloat(gpa) : null,
        target_major_id: targetMajorId,
        target_region: targetRegions,
        target_tier: targetTiers,
        self_assessment: selfAssessment,
      });
      await fetchUser();
      setShowForm(false);
    } catch { setFormMsg('保存失败'); }
    finally { setSaving(false); }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await recommendations.generate();
      if (res.data.success) setResults(res.data.data);
    } finally { setGenerating(false); }
  };

  const estScore = () => {
    if (!user?.profile?.gpa) return null;
    const g = user.profile.gpa;
    return Math.round(g <= 5 ? 280 + (g / 4.0) * 120 : g * 3.6);
  };

  const majorName = allMajors.find(m => m.id === targetMajorId)?.name || '';
  const factorList = [
    { key: 'school_strength', label: '院校实力', color: 'bg-blue-500' },
    { key: 'major_match', label: '专业匹配', color: 'bg-green-500' },
    { key: 'admit_probability', label: '上岸概率', color: 'bg-orange-500' },
    { key: 'region_match', label: '地域匹配', color: 'bg-purple-500' },
    { key: 'career_prospect', label: '就业前景', color: 'bg-pink-500' },
  ];

  // Sort & filter results
  const displayed = results.filter(r => !tierFilter || r.school_tier === tierFilter).sort((a, b) => {
    if (sortField === 'admit') {
      const af = a.factors || {};
      const bf = b.factors || {};
      return (bf.admit_probability || 0) - (af.admit_probability || 0);
    }
    return (b.total_score || 0) - (a.total_score || 0);
  });

  const tierCounts = results.reduce((acc: Record<string, number>, r) => {
    acc[r.school_tier] = (acc[r.school_tier] || 0) + 1;
    return acc;
  }, {});

  if (!token) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-10">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">智能择校推荐</h1>
          <p className="text-gray-500 mb-6">基于五因子加权模型，根据你的个人背景智能匹配最合适的院校和专业</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">注册/登录</button>
            <button onClick={() => navigate('/search')} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50">浏览院校</button>
          </div>
          <div className="mt-8 grid grid-cols-5 gap-3 text-xs text-gray-400">
            {factorList.map(f => (<div key={f.key} className="bg-gray-50 rounded-lg py-2">{f.label}</div>))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">🎯 智能择校推荐</h1>
        <p className="mt-2 text-blue-100 text-sm">
          {user?.profile?.target_major_id
            ? `意向专业：${majorName} | GPA: ${user.profile.gpa || '未设置'} | 目标地区: ${targetRegions.length ? targetRegions.join('、') : '不限'} | 预估考研分: ${estScore() || '-'}`
            : '请先完善个人资料，系统将基于五因子加权模型为你智能推荐'}
        </p>
      </div>

      {/* Profile + Generate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">个人资料</h2>
          <button onClick={() => { setShowForm(!showForm); setFormMsg(''); }}
            className="text-sm text-blue-500 hover:text-blue-600">
            {showForm ? '收起' : user?.profile ? '修改资料' : '填写资料'}
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 mb-6 p-5 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">本科院校</label>
                <input value={undergrad} onChange={e => setUndergrad(e.target.value)} placeholder="如：某某大学"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">GPA / 加权平均分 <span className="text-xs text-gray-400">(4.0或百分制)</span></label>
                <input type="number" value={gpa} onChange={e => setGpa(e.target.value)} min="0" max="100" step="0.1"
                  placeholder="如 3.5 (4分制) 或 85 (百分制)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                {gpa && <p className="text-xs text-blue-500 mt-1">预估考研分: ~{estScore()} 分</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">意向专业 <span className="text-red-400">*</span></label>
              <select value={targetMajorId || ''} onChange={e => setTargetMajorId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">请选择专业</option>
                {allMajors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code}) — {m.discipline}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">意向地区 <span className="text-xs text-gray-400">(可多选，不选则不限制)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => setTargetRegions(prev => prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r])}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      targetRegions.includes(r) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">目标层次</label>
              <div className="flex gap-2">
                {TIERS.map(t => (
                  <button key={t} onClick={() => setTargetTiers(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t])}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      targetTiers.includes(t) ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-300'
                    }`}>{TIER_LABELS[t]}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">自我评估 <span className="text-xs text-gray-400">(选填)</span></label>
              <textarea value={selfAssessment} onChange={e => setSelfAssessment(e.target.value)} rows={2}
                placeholder="描述你的优势、劣势、目标等..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {formMsg && <p className="text-sm text-red-500">{formMsg}</p>}
            <button onClick={saveProfile} disabled={saving}
              className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50">
              {saving ? '保存中...' : '保存资料'}
            </button>
          </div>
        )}

        {user?.profile?.target_major_id && !showForm && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-center">
            {[
              { label: '意向专业', value: majorName },
              { label: 'GPA', value: user.profile.gpa || '-' },
              { label: '目标地区', value: targetRegions.length ? targetRegions.join('/') : '不限' },
              { label: '目标层次', value: targetTiers.length ? targetTiers.join('/') : '不限' },
              { label: '预估考研分', value: estScore() ? `${estScore()}分` : '-' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5 truncate">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        <button onClick={generate} disabled={generating || !user?.profile?.target_major_id}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all">
          {generating ? '⏳ 正在分析中...' : '🚀 开始智能分析'}
        </button>
        {!user?.profile?.target_major_id && (
          <p className="text-center text-xs text-gray-400 mt-2">请先点击"填写资料"并选择意向专业</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-medium">关闭</button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载历史推荐中...
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              推荐结果 ({results.length} 个)
              <span className="text-xs text-gray-400 font-normal ml-2">覆盖{Object.keys(tierCounts).length}个层次</span>
            </h2>
            <div className="flex gap-2 text-sm">
              <select value={sortField} onChange={e => setSortField(e.target.value as any)}
                className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600">
                <option value="total">按综合分</option>
                <option value="admit">按上岸概率</option>
              </select>
              <select value={tierFilter || ''} onChange={e => setTierFilter(e.target.value || null)}
                className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600">
                <option value="">全部层次</option>
                {Object.entries(tierCounts).map(([t, c]) => (
                  <option key={t} value={t}>{t} ({c})</option>
                ))}
              </select>
            </div>
          </div>

          {displayed.map((r, idx) => {
            const expanded = expandedResult === idx;
            const f = r.factors || {};
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedResult(expanded ? null : idx)}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {r.rank || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{r.school_name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TIER_STYLE[r.school_tier] || 'bg-gray-100 text-gray-600'}`}>{r.school_tier}</span>
                      <span className="text-xs text-gray-400">{r.school_province}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{r.major_name} ({r.major_code}) {r.department ? `— ${r.department}` : ''}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-blue-600">{r.total_score || 0}</div>
                    <div className="text-xs text-gray-400">匹配度</div>
                  </div>
                  <div className="text-gray-300 text-sm flex-shrink-0">{expanded ? '▴' : '▾'}</div>
                </div>
                <div className="px-5 pb-3 flex gap-1" style={{ height: 6 }}>
                  {factorList.map(fi => (
                    <div key={fi.key} className={`${fi.color} rounded-full h-full`} style={{ width: `${Math.max(2, ((f[fi.key] || 0) / 100) * 20)}%` }} title={`${fi.label}: ${f[fi.key] || 0}`} />
                  ))}
                </div>
                {expanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">五因子评分明细</h4>
                        <div className="space-y-2">
                          {factorList.map(fi => (
                            <div key={fi.key}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-500">{fi.label} <span className="text-gray-300">× {fi.key === 'school_strength' || fi.key === 'major_match' ? '25%' : fi.key === 'admit_probability' ? '30%' : '10%'}</span></span>
                                <span className="font-medium text-gray-700">{f[fi.key] || 0}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${fi.color}`} style={{ width: `${f[fi.key] || 0}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button onClick={() => navigate(`/schools/${r.school_id}`)}
                          className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50">
                          查看院校详情 →
                        </button>
                        <div className={`p-3 rounded-lg text-xs ${
                          (f.admit_probability || 0) >= 70 ? 'bg-green-50 text-green-700' :
                          (f.admit_probability || 0) >= 45 ? 'bg-yellow-50 text-yellow-700' :
                          (f.admit_probability || 0) >= 25 ? 'bg-orange-50 text-orange-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {(f.admit_probability || 0) >= 70 ? '💪 上岸希望较大，可作冲刺目标' :
                           (f.admit_probability || 0) >= 45 ? '📊 难度适中，建议作为主攻目标' :
                           (f.admit_probability || 0) >= 25 ? '⚠️ 竞争激烈，建议作为保底选择' :
                           '🔴 难度极高，建议谨慎考虑'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !loading && !error && user?.profile?.target_major_id && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <div className="text-5xl mb-4">🚀</div>
          <p className="font-medium text-gray-500">还没有推荐结果</p>
          <p className="text-sm mt-1">完善个人资料后点击"开始智能分析"生成个性化推荐</p>
        </div>
      )}
    </div>
  );
}
