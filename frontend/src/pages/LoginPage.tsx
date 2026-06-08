import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { auth } from '../api';

const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

const GRADES = ['大一', '大二', '大三', '大四', '大五', '已毕业'];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') !== 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [province, setProvince] = useState('');
  const [undergraduateSchool, setUndergraduateSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [majorName, setMajorName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [smsVerified, setSmsVerified] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSendSms = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setSmsSending(true);
    setError('');
    try {
      const res = await auth.sendSms(phone);
      if (res.data.success) {
        setDemoCode(res.data.data.code);
        setSmsCountdown(60);
        const timer = setInterval(() => {
          setSmsCountdown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.data.error || '验证码发送失败');
      }
    } catch {
      setError('验证码发送失败，请重试');
    }
    setSmsSending(false);
  };

  const handleVerifySms = async () => {
    if (!smsCode) { setError('请输入验证码'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await auth.verifySms(phone, smsCode);
      if (res.data.success) {
        setSmsVerified(true);
        setDemoCode('');
      } else {
        setError(res.data.error || '验证码错误');
      }
    } catch {
      setError('验证码验证失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!username || !password) { setError('请输入用户名和密码'); return; }
    if (isRegister) {
      if (password.length < 6) { setError('密码长度不能少于6位'); return; }
      if (!phone) { setError('请输入手机号'); return; }
      if (!smsVerified) { setError('请先验证手机号'); return; }
    }
    setLoading(true);
    setError('');

    if (isRegister) {
      try {
        const res = await auth.register({
          username, password, email: email || undefined,
          phone, province: province || undefined,
          undergraduate_school: undergraduateSchool || undefined,
          grade: grade || undefined,
          major_name: majorName || undefined,
          notes: notes || undefined,
        });
        if (res.data.success) {
          await login(username, password);
          navigate('/');
        } else {
          setError(res.data.error || '注册失败');
        }
      } catch { setError('注册失败，请重试'); }
    } else {
      const success = await login(username, password);
      if (success) navigate('/');
      else setError('用户名或密码错误');
    }
    setLoading(false);
  };

  const switchMode = (register: boolean) => {
    setIsRegister(register);
    setError('');
    setSmsVerified(false);
    setDemoCode('');
    setSmsCode('');
    navigate(register ? '/login' : '/login?mode=login', { replace: true });
  };

  return (
    <div className="max-w-lg mx-auto mt-8 mb-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {isRegister ? '注册账号' : '登录'}
        </h1>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              用户名 <span className="text-red-400">*</span>
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="请输入用户名"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              密码 <span className="text-red-400">*</span>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={isRegister ? '至少6位密码' : '请输入密码'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>

          {isRegister && (
            <>
              {/* Phone + SMS verification */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  手机号 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setSmsVerified(false); }}
                    placeholder="请输入手机号" maxLength={11}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                  <button onClick={handleSendSms} disabled={smsSending || smsCountdown > 0 || smsVerified}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      smsVerified
                        ? 'bg-green-100 text-green-600 cursor-not-allowed'
                        : smsCountdown > 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}>
                    {smsVerified ? '已验证' : smsCountdown > 0 ? `${smsCountdown}s` : smsSending ? '发送中' : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* SMS code input */}
              {demoCode && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    演示模式 — 验证码：<span className="font-bold text-lg tracking-widest">{demoCode}</span>
                  </p>
                </div>
              )}
              {!smsVerified && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">验证码</label>
                  <div className="flex gap-2">
                    <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)}
                      placeholder="请输入验证码" maxLength={6}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                    <button onClick={handleVerifySms} disabled={loading || !smsCode}
                      className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors whitespace-nowrap">
                      验证
                    </button>
                  </div>
                </div>
              )}

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">所在省份</label>
                <select value={province} onChange={e => setProvince(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                  <option value="">请选择省份</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Undergraduate school */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">本科学校</label>
                <input type="text" value={undergraduateSchool} onChange={e => setUndergraduateSchool(e.target.value)}
                  placeholder="请输入本科院校名称"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
              </div>

              {/* Grade + Major in one row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">年级</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                    <option value="">请选择年级</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">专业</label>
                  <input type="text" value={majorName} onChange={e => setMajorName(e.target.value)}
                    placeholder="所学专业"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">邮箱（选填）</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="选填，用于找回密码"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">备注</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="如：目标院校、考研方向、特殊需求等，以便提供更精准的择校服务"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none" />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 p-2.5 rounded-lg">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button onClick={() => switchMode(!isRegister)}
            className="text-blue-500 hover:text-blue-600 font-medium ml-1">
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
          <p>注册即享完整功能：院校查询、分数线对比、智能择校推荐、报录比分析</p>
          <p className="mt-1 text-blue-400">请填写真实信息以便获得更精准的择校建议</p>
        </div>
      </div>
    </div>
  );
}
