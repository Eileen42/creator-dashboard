import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, Instagram, Music2, TrendingUp, DollarSign, Video, Plus, ArrowLeft, Target, MessageCircle, Send, Loader2, Pencil, Save, X, Eye, EyeOff, Trash2, Users, LogOut, Settings, ChevronRight, Wallet, FileText, UserCheck, BarChart3, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// ============================================
// 설정값
// ============================================
const CONFIG = {
  GOOGLE_CLIENT_ID: '590021584308-rfnvvdjmntukh5roq0dlp6hibf470njs.apps.googleusercontent.com',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwOI1R6gMMVb2TCSiifB67eClO-dWaj14A7Vh8skFfUq0tIqeiUVo7Wwy3KHSF7PFhjUg/exec'
};

// ============================================
// 테마 색상
// ============================================
const THEME = {
  bgPrimary: '#F8F9FC',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#EEF1F6',
  textPrimary: '#1A1D26',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent1: '#6366F1',
  accent2: '#8B5CF6',
  accent3: '#06B6D4',
  accent4: '#10B981',
  accent5: '#F59E0B',
  danger: '#EF4444',
  youtube: '#FF0000',
  tiktok: '#000000',
  instagram: '#E1306C',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
  shadowHover: '0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)',
};

// ============================================
// API 함수
// ============================================
async function callBackend(action, params = {}) {
  const url = new URL(CONFIG.APPS_SCRIPT_URL);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => {
    if (typeof params[key] === 'object') {
      url.searchParams.append(key, JSON.stringify(params[key]));
    } else {
      url.searchParams.append(key, params[key]);
    }
  });
  
  try {
    const response = await fetch(url.toString());
    return await response.json();
  } catch (error) {
    console.error('Backend error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 숫자 포맷
// ============================================
function formatNumber(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
  if (num >= 10000) return (num / 10000).toFixed(0) + '만';
  return num?.toLocaleString() || '0';
}

function formatCurrency(num) {
  return '₩' + (num?.toLocaleString() || '0');
}

// ============================================
// 메인 앱
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  // 데이터
  const [dashboardData, setDashboardData] = useState(null);
  const [channels, setChannels] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [contents, setContents] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [platformsAndChannels, setPlatformsAndChannels] = useState({ platforms: [], channels: [], brands: [], editors: [] });
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Google 로그인
  const handleGoogleLogin = useCallback(async (response) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const savedUserName = localStorage.getItem('dashboardUserName');
      const userData = {
        userId: payload.sub,
        email: payload.email,
        name: savedUserName || payload.name,
        profileImage: payload.picture
      };
      const result = await callBackend('init', userData);
      if (result.success) {
        setUser(userData);
        setSpreadsheetId(result.spreadsheetId);
        localStorage.setItem('dashboardUser', JSON.stringify(userData));
        localStorage.setItem('dashboardSpreadsheetId', result.spreadsheetId);
        await loadAllData(result.spreadsheetId);
        setCurrentPage('dashboard');
      } else {
        setError('로그인 처리 중 오류: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 데이터 로드
  const loadAllData = async (ssId) => {
    const [dashRes, chRes, revRes, expRes, cntRes, flRes, pcRes] = await Promise.all([
      callBackend('getDashboardSummary', { spreadsheetId: ssId, year: currentYear, month: currentMonth }),
      callBackend('getChannels', { spreadsheetId: ssId }),
      callBackend('getRevenues', { spreadsheetId: ssId, year: currentYear }),
      callBackend('getExpenses', { spreadsheetId: ssId, year: currentYear }),
      callBackend('getContents', { spreadsheetId: ssId, year: currentYear }),
      callBackend('getFreelancers', { spreadsheetId: ssId }),
      callBackend('getPlatformsAndChannels', { spreadsheetId: ssId })
    ]);
    if (dashRes.success) setDashboardData(dashRes);
    if (chRes.success) setChannels(chRes.channels || []);
    if (revRes.success) setRevenues(revRes.revenues || []);
    if (expRes.success) setExpenses(expRes.expenses || []);
    if (cntRes.success) setContents(cntRes.contents || []);
    if (flRes.success) setFreelancers(flRes.freelancers || []);
    if (pcRes.success) setPlatformsAndChannels(pcRes);
  };

  const updateUserName = (newName) => {
    setUser(prev => ({ ...prev, name: newName }));
    localStorage.setItem('dashboardUserName', newName);
  };

  // 초기화
  useEffect(() => {
    const savedUser = localStorage.getItem('dashboardUser');
    const savedSpreadsheetId = localStorage.getItem('dashboardSpreadsheetId');
    const savedUserName = localStorage.getItem('dashboardUserName');
    
    if (savedUser && savedSpreadsheetId) {
      const parsedUser = JSON.parse(savedUser);
      if (savedUserName) parsedUser.name = savedUserName;
      setUser(parsedUser);
      setSpreadsheetId(savedSpreadsheetId);
      setCurrentPage('dashboard');
      loadAllData(savedSpreadsheetId);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setTimeout(() => setGoogleLoaded(true), 100);
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  const handleLogout = () => {
    setUser(null);
    setSpreadsheetId(null);
    setDashboardData(null);
    localStorage.removeItem('dashboardUser');
    localStorage.removeItem('dashboardSpreadsheetId');
    setCurrentPage('login');
  };

  // 페이지 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage isLoading={isLoading} error={error} googleLoaded={googleLoaded} onGoogleLogin={handleGoogleLogin} />;
      case 'dashboard':
        return <DashboardPage data={dashboardData} user={user} onNavigate={setCurrentPage} onLogout={handleLogout} onUpdateUserName={updateUserName} />;
      case 'mypage':
        return <MyPage onNavigate={setCurrentPage} onBack={() => setCurrentPage('dashboard')} />;
      case 'channels':
        return <ChannelsPage channels={channels} spreadsheetId={spreadsheetId} onReload={() => loadAllData(spreadsheetId)} onBack={() => setCurrentPage('mypage')} platformsAndChannels={platformsAndChannels} />;
      case 'revenue':
        return <RevenuePage revenues={revenues} expenses={expenses} spreadsheetId={spreadsheetId} onReload={() => loadAllData(spreadsheetId)} onBack={() => setCurrentPage('mypage')} platformsAndChannels={platformsAndChannels} />;
      case 'contents':
        return <ContentsPage contents={contents} spreadsheetId={spreadsheetId} onReload={() => loadAllData(spreadsheetId)} onBack={() => setCurrentPage('mypage')} platformsAndChannels={platformsAndChannels} />;
      case 'freelancers':
        return <FreelancersPage freelancers={freelancers} spreadsheetId={spreadsheetId} onReload={() => loadAllData(spreadsheetId)} onBack={() => setCurrentPage('mypage')} platformsAndChannels={platformsAndChannels} />;
      case 'revenueDetail':
        return <RevenueDetailPage data={dashboardData} revenues={revenues} expenses={expenses} onBack={() => setCurrentPage('dashboard')} />;
      case 'productivityDetail':
        return <ProductivityDetailPage data={dashboardData} contents={contents} onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <LoginPage isLoading={isLoading} error={error} googleLoaded={googleLoaded} onGoogleLogin={handleGoogleLogin} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: THEME.bgPrimary, fontFamily: "'Pretendard', -apple-system, sans-serif" }}>
      {renderPage()}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input, select, button { font-family: inherit; }
        input:focus, select:focus { outline: none; border-color: ${THEME.accent1}; }
      `}</style>
    </div>
  );
}

// ============================================
// 로그인 페이지
// ============================================
function LoginPage({ isLoading, error, googleLoaded, onGoogleLogin }) {
  const [buttonRendered, setButtonRendered] = useState(false);

  useEffect(() => {
    if (googleLoaded && window.google && !isLoading && !buttonRendered) {
      try {
        window.google.accounts.id.initialize({ client_id: CONFIG.GOOGLE_CLIENT_ID, callback: onGoogleLogin });
        const btn = document.getElementById('google-login-button');
        if (btn) {
          btn.innerHTML = '';
          window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: 280 });
          setButtonRendered(true);
        }
      } catch (err) { console.error(err); }
    }
  }, [googleLoaded, isLoading, buttonRendered, onGoogleLogin]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: `linear-gradient(135deg, ${THEME.bgPrimary} 0%, ${THEME.bgTertiary} 100%)` }}>
      <div style={{ background: THEME.bgSecondary, borderRadius: '24px', padding: '48px 40px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: THEME.shadow }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
          <span style={{ fontSize: '32px' }}>📊</span>
        </div>
        <h1 style={{ color: THEME.textPrimary, fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>크리에이터 대시보드</h1>
        <p style={{ color: THEME.textSecondary, fontSize: '15px', marginBottom: '36px' }}>멀티 플랫폼 채널을 한눈에 관리하세요</p>
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px', marginBottom: '24px', color: '#DC2626', fontSize: '14px' }}>⚠️ {error}</div>}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', color: THEME.textSecondary }}>
            <Loader2 size={24} color={THEME.accent1} style={{ animation: 'spin 1s linear infinite' }} /><span>로그인 중...</span>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <div id="google-login-button" style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }} />
            {!googleLoaded && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: THEME.textMuted }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Google 로그인 로딩 중...</div>}
          </div>
        )}
        <div style={{ background: THEME.bgTertiary, borderRadius: '12px', padding: '16px' }}>
          <p style={{ color: THEME.textSecondary, fontSize: '13px', margin: 0 }}>🔒 로그인하면 <strong>본인의 Google Drive</strong>에 데이터가 안전하게 저장됩니다</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 메인 대시보드
// ============================================
function DashboardPage({ data, user, onNavigate, onLogout, onUpdateUserName }) {
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color={THEME.accent1} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const handleNameSave = () => {
    if (editName.trim()) {
      onUpdateUserName(editName.trim());
      setShowNameEdit(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.profileImage && <img src={user.profileImage} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />}
          <div>
            {showNameEdit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ background: THEME.bgTertiary, border: `1px solid ${THEME.accent1}`, borderRadius: '8px', padding: '6px 10px', fontSize: '14px', width: '120px' }} autoFocus onKeyPress={(e) => e.key === 'Enter' && handleNameSave()} />
                <button onClick={handleNameSave} style={{ background: THEME.accent4, border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>저장</button>
                <button onClick={() => setShowNameEdit(false)} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>취소</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '16px' }}>{user?.name}님 👋</span>
                <button onClick={() => { setEditName(user?.name || ''); setShowNameEdit(true); }} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: THEME.textMuted }}><Pencil size={14} /></button>
              </div>
            )}
            <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{data.year}년 {data.month}월</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onNavigate('mypage')} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={16} />마이페이지</button>
          <button onClick={onLogout} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer' }}><LogOut size={18} color={THEME.textSecondary} /></button>
        </div>
      </div>

      {/* 이번 달 수익 카드 (클릭 가능) */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div onClick={() => onNavigate('revenueDetail')} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, borderRadius: '20px', padding: '24px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>💰 이번 달 순수익</span>
            <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
          </div>
          <div style={{ color: 'white', fontSize: '32px', fontWeight: '700' }}>{formatCurrency(data.monthlyNetRevenue)}</div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>수익 {formatCurrency(data.monthlyRevenue)}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>지출 {formatCurrency(data.monthlyExpense)}</span>
          </div>
        </div>
      </div>

      {/* 생산성 카드 (클릭 가능) */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div onClick={() => onNavigate('productivityDetail')} style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', cursor: 'pointer', boxShadow: THEME.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: THEME.textSecondary, fontSize: '14px' }}>📊 생산성 지표</span>
            <ChevronRight size={20} color={THEME.textMuted} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>원본 콘텐츠당 수익</div>
              <div style={{ color: THEME.accent1, fontSize: '20px', fontWeight: '700' }}>{formatCurrency(data.revenuePerContent)}</div>
            </div>
            <div>
              <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>업로드당 수익</div>
              <div style={{ color: THEME.accent2, fontSize: '20px', fontWeight: '700' }}>{formatCurrency(data.revenuePerUpload)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 요약 카드들 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <SummaryCard icon={<Video size={20} />} label="원본 콘텐츠" value={data.originalContents} unit="개" color={THEME.accent3} />
          <SummaryCard icon={<TrendingUp size={20} />} label="총 업로드" value={data.totalUploads} unit="개" color={THEME.accent4} />
          <SummaryCard icon={<FileText size={20} />} label="이번 달" value={data.monthlyContents} unit="개" color={THEME.accent5} />
        </div>
      </div>

      {/* 플랫폼별 수익 */}
      {Object.keys(data.revenueByPlatform || {}).length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '16px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
            <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📱 플랫폼별 수익 (연간)</h3>
            {Object.entries(data.revenueByPlatform).map(([platform, amount], idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < Object.keys(data.revenueByPlatform).length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none' }}>
                <span style={{ color: THEME.textPrimary, fontWeight: '500' }}>{platform}</span>
                <span style={{ color: THEME.accent1, fontWeight: '600' }}>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 데이터 없을 때 안내 */}
      {data.totalRevenue === 0 && data.totalContents === 0 && (
        <div style={{ padding: '0 24px', marginBottom: '16px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '40px 20px', textAlign: 'center', boxShadow: THEME.shadow }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <div style={{ color: THEME.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>데이터를 입력해보세요!</div>
            <div style={{ color: THEME.textSecondary, fontSize: '14px', marginBottom: '20px' }}>마이페이지에서 수익, 콘텐츠 정보를 관리할 수 있어요</div>
            <button onClick={() => onNavigate('mypage')} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '14px 28px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />시작하기
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ============================================
// 마이페이지 (관리 허브)
// ============================================
function MyPage({ onNavigate, onBack }) {
  const menuItems = [
    { id: 'channels', icon: <Users size={24} />, label: '채널 관리', desc: '브랜드별 채널 정보 관리', color: THEME.accent1 },
    { id: 'revenue', icon: <Wallet size={24} />, label: '수익/지출 관리', desc: '월별 수익과 지출 기록', color: THEME.accent4 },
    { id: 'contents', icon: <FileText size={24} />, label: '콘텐츠 제작 관리', desc: '제작 현황 및 일정 관리', color: THEME.accent2 },
    { id: 'freelancers', icon: <UserCheck size={24} />, label: '외주 관리', desc: '편집자 정보 및 비용 관리', color: THEME.accent5 },
  ];

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: THEME.bgSecondary, border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', boxShadow: THEME.shadow }}><ArrowLeft size={20} color={THEME.textSecondary} /></button>
        <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>마이페이지</h1>
      </div>

      <div style={{ padding: '0 24px' }}>
        {menuItems.map((item, idx) => (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '20px', marginBottom: '12px', cursor: 'pointer', boxShadow: THEME.shadow, display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{item.desc}</div>
            </div>
            <ChevronRight size={20} color={THEME.textMuted} />
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

// ============================================
// 채널 관리 페이지
// ============================================
function ChannelsPage({ channels, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const brandList = channels.reduce((acc, ch) => {
    if (ch.brand && !acc.find(b => b.name === ch.brand)) acc.push({ name: ch.brand, color: ch.brandColor });
    return acc;
  }, []);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveChannel', { spreadsheetId, channelData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteChannel', { spreadsheetId, channelId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="채널 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />
      
      {channels.length === 0 ? (
        <EmptyState icon="📺" title="등록된 채널이 없습니다" desc="새 채널을 추가해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {channels.map((ch) => (
            <div key={ch.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: ch.brandColor || THEME.accent1, color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{ch.brand}</div>
                  <div>
                    <div style={{ color: THEME.textPrimary, fontWeight: '600' }}>{ch.channelName}</div>
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{ch.platform}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(ch); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(ch.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ChannelModal brandList={brandList} editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platforms={platformsAndChannels.platforms} />
      )}

      <Footer />
    </div>
  );
}

// ============================================
// 수익/지출 관리 페이지
// ============================================
function RevenuePage({ revenues, expenses, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [tab, setTab] = useState('revenue');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const filteredRevenues = revenues.filter(r => r.year == selectedYear);
  const filteredExpenses = expenses.filter(e => e.year == selectedYear);

  const handleSaveRevenue = async (data) => {
    setIsLoading(true);
    await callBackend('saveRevenue', { spreadsheetId, revenueData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleSaveExpense = async (data) => {
    setIsLoading(true);
    await callBackend('saveExpense', { spreadsheetId, expenseData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDeleteRevenue = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteRevenue', { spreadsheetId, revenueId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteExpense', { spreadsheetId, expenseId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="수익/지출 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />

      {/* 연도 선택 */}
      <div style={{ padding: '0 24px 16px' }}>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
      </div>

      {/* 탭 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: THEME.bgTertiary, borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setTab('revenue')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: tab === 'revenue' ? THEME.bgSecondary : 'transparent', color: tab === 'revenue' ? THEME.accent1 : THEME.textSecondary, fontWeight: '600', cursor: 'pointer', boxShadow: tab === 'revenue' ? THEME.shadow : 'none' }}>💰 수익</button>
          <button onClick={() => setTab('expense')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: tab === 'expense' ? THEME.bgSecondary : 'transparent', color: tab === 'expense' ? THEME.danger : THEME.textSecondary, fontWeight: '600', cursor: 'pointer', boxShadow: tab === 'expense' ? THEME.shadow : 'none' }}>💸 지출</button>
        </div>
      </div>

      {tab === 'revenue' ? (
        filteredRevenues.length === 0 ? (
          <EmptyState icon="💰" title="등록된 수익이 없습니다" desc="수익을 입력해보세요" />
        ) : (
          <div style={{ padding: '0 24px' }}>
            {filteredRevenues.map((r) => (
              <div key={r.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: THEME.textPrimary, fontWeight: '600' }}>{r.platform} - {r.channelName}</div>
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{r.year}년 {r.month}월</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: THEME.accent1, fontWeight: '700', fontSize: '18px' }}>{formatCurrency(r.amount)}</span>
                    <button onClick={() => { setEditItem(r); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                    <button onClick={() => handleDeleteRevenue(r.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredExpenses.length === 0 ? (
          <EmptyState icon="💸" title="등록된 지출이 없습니다" desc="지출을 입력해보세요" />
        ) : (
          <div style={{ padding: '0 24px' }}>
            {filteredExpenses.map((e) => (
              <div key={e.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: THEME.textPrimary, fontWeight: '600' }}>{e.category}</div>
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{e.year}년 {e.month}월 · {e.name || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: THEME.danger, fontWeight: '700', fontSize: '18px' }}>{formatCurrency(e.amount)}</span>
                    <button onClick={() => { setEditItem(e); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                    <button onClick={() => handleDeleteExpense(e.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showModal && (
        tab === 'revenue' ? (
          <RevenueModal editData={editItem} onSave={handleSaveRevenue} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platformsAndChannels={platformsAndChannels} />
        ) : (
          <ExpenseModal editData={editItem} onSave={handleSaveExpense} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} />
        )
      )}

      <Footer />
    </div>
  );
}

// ============================================
// 콘텐츠 제작 관리 페이지
// ============================================
function ContentsPage({ contents, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusColors = {
    '기획중': THEME.textMuted,
    '제작중': THEME.accent5,
    '편집중': THEME.accent3,
    '검수중': THEME.accent2,
    '완료': THEME.accent4,
    '업로드완료': THEME.accent1,
  };

  const filteredContents = filterStatus === 'all' ? contents : contents.filter(c => c.status === filterStatus);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveContent', { spreadsheetId, contentData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteContent', { spreadsheetId, contentId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="콘텐츠 제작 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />

      {/* 상태 필터 */}
      <div style={{ padding: '0 24px 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', '기획중', '제작중', '편집중', '검수중', '완료', '업로드완료'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', background: filterStatus === status ? THEME.accent1 : THEME.bgSecondary, color: filterStatus === status ? 'white' : THEME.textSecondary, fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: THEME.shadow }}>
              {status === 'all' ? '전체' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredContents.length === 0 ? (
        <EmptyState icon="📝" title="콘텐츠가 없습니다" desc="새 콘텐츠를 등록해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {filteredContents.map((c) => (
            <div key={c.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: `${statusColors[c.status] || THEME.textMuted}20`, color: statusColors[c.status] || THEME.textMuted, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{c.status}</span>
                    <span style={{ color: THEME.textSecondary, fontSize: '12px' }}>{c.brand} · {c.mainPlatform}</span>
                  </div>
                  <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '15px' }}>{c.title || c.topic || '(제목 없음)'}</div>
                  {c.uploadYear && <div style={{ color: THEME.textMuted, fontSize: '12px', marginTop: '4px' }}>업로드: {c.uploadYear}.{c.uploadMonth}.{c.uploadDay}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(c); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContentModal editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platformsAndChannels={platformsAndChannels} />
      )}

      <Footer />
    </div>
  );
}

// ============================================
// 외주 관리 페이지
// ============================================
function FreelancersPage({ freelancers, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveFreelancer', { spreadsheetId, freelancerData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteFreelancer', { spreadsheetId, freelancerId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="외주 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />

      {freelancers.length === 0 ? (
        <EmptyState icon="👥" title="등록된 편집자가 없습니다" desc="외주 편집자를 추가해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {freelancers.map((f) => (
            <div key={f.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{f.name}</div>
                  <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{f.assignedChannel} · {f.editProgram}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <span style={{ color: THEME.accent1, fontSize: '13px' }}>건당 {formatCurrency(f.pricePerVideo)}</span>
                    <span style={{ color: THEME.accent4, fontSize: '13px' }}>완료 {f.completedCount}건</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(f); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(f.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FreelancerModal editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platformsAndChannels={platformsAndChannels} />
      )}

      <Footer />
    </div>
  );
}

// ============================================
// 수익 상세 대시보드
// ============================================
function RevenueDetailPage({ data, revenues, expenses, onBack }) {
  if (!data) return null;

  const monthlyData = [];
  for (let m = 1; m <= 12; m++) {
    const rev = revenues.filter(r => r.year == data.year && r.month == m).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const exp = expenses.filter(e => e.year == data.year && e.month == m).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    monthlyData.push({ month: m, revenue: rev, expense: exp, net: rev - exp });
  }

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="수익 상세" onBack={onBack} />

      {/* 연간 요약 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, borderRadius: '20px', padding: '24px', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{data.year}년 연간 순수익</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>{formatCurrency(data.netRevenue)}</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '12px', opacity: 0.7 }}>총 수익</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(data.totalRevenue)}</div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.7 }}>총 지출</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(data.totalExpense)}</div></div>
          </div>
        </div>
      </div>

      {/* 월별 테이블 */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📊 월별 수익/지출</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.bgTertiary}` }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', color: THEME.textSecondary }}>월</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>수익</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>지출</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>순수익</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} style={{ borderBottom: `1px solid ${THEME.bgTertiary}` }}>
                    <td style={{ padding: '12px 8px', color: THEME.textPrimary, fontWeight: '500' }}>{row.month}월</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: THEME.accent1 }}>{formatCurrency(row.revenue)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: THEME.danger }}>{formatCurrency(row.expense)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: row.net >= 0 ? THEME.accent4 : THEME.danger, fontWeight: '600' }}>{formatCurrency(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ============================================
// 생산성 상세 대시보드
// ============================================
function ProductivityDetailPage({ data, contents, onBack }) {
  if (!data) return null;

  const statusCounts = data.contentsByStatus || {};

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="생산성 상세" onBack={onBack} />

      {/* 생산성 요약 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '24px', boxShadow: THEME.shadow }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: `${THEME.accent1}10`, borderRadius: '16px' }}>
              <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px' }}>원본 콘텐츠당 수익</div>
              <div style={{ color: THEME.accent1, fontSize: '28px', fontWeight: '700' }}>{formatCurrency(data.revenuePerContent)}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: `${THEME.accent2}10`, borderRadius: '16px' }}>
              <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px' }}>업로드당 수익</div>
              <div style={{ color: THEME.accent2, fontSize: '28px', fontWeight: '700' }}>{formatCurrency(data.revenuePerUpload)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 현황 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: THEME.shadow }}>
            <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px' }}>원본 콘텐츠</div>
            <div style={{ color: THEME.textPrimary, fontSize: '24px', fontWeight: '700' }}>{data.originalContents}</div>
          </div>
          <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: THEME.shadow }}>
            <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px' }}>총 업로드</div>
            <div style={{ color: THEME.textPrimary, fontSize: '24px', fontWeight: '700' }}>{data.totalUploads}</div>
          </div>
          <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: THEME.shadow }}>
            <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px' }}>재활용 비율</div>
            <div style={{ color: THEME.accent4, fontSize: '24px', fontWeight: '700' }}>{data.originalContents > 0 ? ((data.totalUploads / data.originalContents)).toFixed(1) : 0}x</div>
          </div>
        </div>
      </div>

      {/* 상태별 현황 */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📋 상태별 현황</h3>
          {Object.entries(statusCounts).map(([status, count], idx) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < Object.keys(statusCounts).length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none' }}>
              <span style={{ color: THEME.textPrimary }}>{status}</span>
              <span style={{ color: THEME.accent1, fontWeight: '600' }}>{count}개</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ============================================
// 공통 컴포넌트들
// ============================================
function PageHeader({ title, onBack, onAdd }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: THEME.bgSecondary, border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', boxShadow: THEME.shadow }}><ArrowLeft size={20} color={THEME.textSecondary} /></button>
        <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>{title}</h1>
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={18} />추가</button>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '48px 24px', textAlign: 'center', boxShadow: THEME.shadow }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <div style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{title}</div>
        <div style={{ color: THEME.textSecondary, fontSize: '14px' }}>{desc}</div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '18px', boxShadow: THEME.shadow }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color }}>{icon}</div>
      <div style={{ color: THEME.textSecondary, fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: THEME.textPrimary, fontSize: '20px', fontWeight: '700' }}>{value}<span style={{ fontSize: '14px', fontWeight: '500', color: THEME.textSecondary }}> {unit}</span></div>
    </div>
  );
}

function Footer() {
  return <div style={{ textAlign: 'center', padding: '16px 24px 32px', color: THEME.textMuted, fontSize: '12px' }}>Made with 💜 for Creators</div>;
}

// ============================================
// 모달 컴포넌트들
// ============================================
const inputStyle = { background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', width: '100%', color: '#1A1D26' };
const labelStyle = { color: '#6B7280', fontSize: '13px', marginBottom: '6px', display: 'block', fontWeight: '500' };

function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#1A1D26', fontSize: '20px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChannelModal({ brandList, editData, onSave, onClose, isLoading, platforms }) {
  const [form, setForm] = useState(editData || { brand: '', brandColor: THEME.accent1, platform: '유튜브', channelName: '', accountId: '', password: '', channelUrl: '' });
  const [isNewBrand, setIsNewBrand] = useState(!editData && brandList.length === 0);
  const colorOptions = [THEME.accent1, THEME.accent2, THEME.accent3, THEME.accent4, THEME.accent5, '#EC4899'];

  const handleBrandSelect = (name) => {
    const existing = brandList.find(b => b.name === name);
    setForm({ ...form, brand: name, brandColor: existing?.color || THEME.accent1 });
  };

  const handleSubmit = () => {
    if (!form.brand || !form.channelName) { alert('브랜드명과 채널명은 필수입니다.'); return; }
    onSave(form);
  };

  return (
    <ModalWrapper title={editData ? '채널 수정' : '새 채널 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>브랜드 *</label>
          {!isNewBrand && brandList.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={form.brand} onChange={(e) => handleBrandSelect(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="">브랜드 선택</option>
                {brandList.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <button onClick={() => setIsNewBrand(true)} style={{ background: `${THEME.accent2}15`, border: 'none', borderRadius: '10px', padding: '12px 16px', color: THEME.accent2, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ 새 브랜드</button>
            </div>
          ) : (
            <div>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="새 브랜드 이름" style={inputStyle} />
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                {colorOptions.map(c => <button key={c} onClick={() => setForm({ ...form, brandColor: c })} style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, border: form.brandColor === c ? '3px solid #1A1D26' : 'none', cursor: 'pointer' }} />)}
              </div>
              {brandList.length > 0 && <button onClick={() => setIsNewBrand(false)} style={{ marginTop: '10px', background: 'none', border: 'none', color: THEME.accent1, fontSize: '13px', cursor: 'pointer' }}>← 기존 브랜드 선택</button>}
            </div>
          )}
        </div>
        <div><label style={labelStyle}>플랫폼 *</label><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} style={inputStyle}>{(platforms || []).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
        <div><label style={labelStyle}>채널명 *</label><input value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })} placeholder="채널 이름" style={inputStyle} /></div>
        <div><label style={labelStyle}>계정아이디</label><input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="@username" style={inputStyle} /></div>
        <div><label style={labelStyle}>비밀번호</label><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="비밀번호" style={inputStyle} /></div>
        <div><label style={labelStyle}>채널 URL</label><input value={form.channelUrl} onChange={(e) => setForm({ ...form, channelUrl: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}

function RevenueModal({ editData, onSave, onClose, isLoading, platformsAndChannels }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [form, setForm] = useState(editData || { year: currentYear, month: currentMonth, platform: '', channelName: '', amount: '' });

  const handleSubmit = () => {
    if (!form.platform || !form.amount) { alert('플랫폼과 금액은 필수입니다.'); return; }
    onSave({ ...form, amount: Number(form.amount) });
  };

  return (
    <ModalWrapper title={editData ? '수익 수정' : '수익 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>년도</label><select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} style={inputStyle}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}</select></div>
          <div><label style={labelStyle}>월</label><select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} style={inputStyle}>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}</select></div>
        </div>
        <div><label style={labelStyle}>플랫폼 *</label><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} style={inputStyle}><option value="">선택하세요</option>{(platformsAndChannels.platforms || []).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
        <div><label style={labelStyle}>채널명</label><select value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })} style={inputStyle}><option value="">선택하세요</option>{(platformsAndChannels.channels || []).filter(c => c.platform === form.platform).map(c => <option key={c.id} value={c.channelName}>{c.channelName}</option>)}</select></div>
        <div><label style={labelStyle}>금액 (원) *</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}

function ExpenseModal({ editData, onSave, onClose, isLoading }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [form, setForm] = useState(editData || { year: currentYear, month: currentMonth, name: '', category: '', quantity: 1, unitPrice: '' });

  const handleSubmit = () => {
    if (!form.category || !form.unitPrice) { alert('지출항목과 단가는 필수입니다.'); return; }
    onSave({ ...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) });
  };

  return (
    <ModalWrapper title={editData ? '지출 수정' : '지출 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>년도</label><select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} style={inputStyle}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}</select></div>
          <div><label style={labelStyle}>월</label><select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} style={inputStyle}>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}</select></div>
        </div>
        <div><label style={labelStyle}>담당자/대상</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 홍길동, 장비구매" style={inputStyle} /></div>
        <div><label style={labelStyle}>지출항목 *</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="예: 편집 외주비, 구독료" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>수량</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>단가 (원) *</label><input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0" style={inputStyle} /></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.danger} 0%, #DC2626 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}

function ContentModal({ editData, onSave, onClose, isLoading, platformsAndChannels }) {
  const [form, setForm] = useState(editData || {
    brand: '', mainPlatform: '', distributePlatforms: '', status: '기획중', editor: '',
    uploadYear: new Date().getFullYear(), uploadMonth: new Date().getMonth() + 1, uploadDay: '',
    priority: '', topic: '', title: '', deliveryDate: '', scriptLink: '', referenceLink: '', editCompleteDate: '', memo: ''
  });

  const handleSubmit = () => {
    if (!form.brand || !form.mainPlatform) { alert('브랜드와 메인플랫폼은 필수입니다.'); return; }
    onSave(form);
  };

  return (
    <ModalWrapper title={editData ? '콘텐츠 수정' : '새 콘텐츠 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>브랜드 *</label><select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels.brands || []).map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label style={labelStyle}>메인플랫폼 *</label><select value={form.mainPlatform} onChange={(e) => setForm({ ...form, mainPlatform: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels.platforms || []).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div><label style={labelStyle}>배포플랫폼 (쉼표 구분)</label><input value={form.distributePlatforms} onChange={(e) => setForm({ ...form, distributePlatforms: e.target.value })} placeholder="유튜브, 틱톡, 인스타" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>상태</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>{['기획중', '제작중', '편집중', '검수중', '완료', '업로드완료'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>편집자</label><select value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels.editors || []).map(e => <option key={e} value={e}>{e}</option>)}</select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>년</label><select value={form.uploadYear} onChange={(e) => setForm({ ...form, uploadYear: Number(e.target.value) })} style={inputStyle}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          <div><label style={labelStyle}>월</label><select value={form.uploadMonth} onChange={(e) => setForm({ ...form, uploadMonth: Number(e.target.value) })} style={inputStyle}>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
          <div><label style={labelStyle}>일</label><input type="number" value={form.uploadDay} onChange={(e) => setForm({ ...form, uploadDay: e.target.value })} placeholder="일" style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>주제</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="콘텐츠 주제" style={inputStyle} /></div>
        <div><label style={labelStyle}>제목</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="영상 제목" style={inputStyle} /></div>
        <div><label style={labelStyle}>비고</label><input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="메모" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}

function FreelancerModal({ editData, onSave, onClose, isLoading, platformsAndChannels }) {
  const [form, setForm] = useState(editData || { name: '', contact: '', assignedChannel: '', weeklyAssigned: 0, completedCount: 0, pricePerVideo: '', editProgram: '', memo: '' });

  const handleSubmit = () => {
    if (!form.name) { alert('편집자명은 필수입니다.'); return; }
    onSave({ ...form, pricePerVideo: Number(form.pricePerVideo) || 0 });
  };

  return (
    <ModalWrapper title={editData ? '편집자 수정' : '편집자 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div><label style={labelStyle}>편집자명 *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="이름" style={inputStyle} /></div>
        <div><label style={labelStyle}>연락처</label><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="010-0000-0000" style={inputStyle} /></div>
        <div><label style={labelStyle}>전담채널</label><input value={form.assignedChannel} onChange={(e) => setForm({ ...form, assignedChannel: e.target.value })} placeholder="담당 채널" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>이번주 할당</label><input type="number" value={form.weeklyAssigned} onChange={(e) => setForm({ ...form, weeklyAssigned: Number(e.target.value) })} style={inputStyle} /></div>
          <div><label style={labelStyle}>완료 건수</label><input type="number" value={form.completedCount} onChange={(e) => setForm({ ...form, completedCount: Number(e.target.value) })} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>건당 비용 (원)</label><input type="number" value={form.pricePerVideo} onChange={(e) => setForm({ ...form, pricePerVideo: e.target.value })} placeholder="10000" style={inputStyle} /></div>
        <div><label style={labelStyle}>편집 프로그램</label><input value={form.editProgram} onChange={(e) => setForm({ ...form, editProgram: e.target.value })} placeholder="프리미어, 파이널컷 등" style={inputStyle} /></div>
        <div><label style={labelStyle}>비고</label><input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="메모" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}
