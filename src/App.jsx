import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Youtube, Instagram, Music2, TrendingUp, DollarSign, Video, Plus, ArrowLeft, Target, Zap, MessageCircle, Send, Loader2, Pencil, Save, X, Eye, EyeOff, Trash2, Users, LogOut, Settings } from 'lucide-react';

// ============================================
// 설정값
// ============================================
const CONFIG = {
  GOOGLE_CLIENT_ID: '590021584308-rfnvvdjmntukh5roq0dlp6hibf470njs.apps.googleusercontent.com',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwHI6f0hVspBA8vftjOvNhnrYBXJA1fJIF9R3SdvACN7v82xEV-YwyUGhEgfktMbxOSeg/exec'
};

// ============================================
// 테마 색상 (밝고 중성적인 컬러)
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
  youtube: '#FF0000',
  tiktok: '#000000',
  instagram: '#E1306C',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
  shadowHover: '0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)',
};

// ============================================
// API 함수들
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
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 푸터 컴포넌트
// ============================================
function Footer({ pageKey }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '16px 24px 32px',
      color: THEME.textMuted,
      fontSize: '12px',
    }}>
      Made with 💜 for Creators
    </div>
  );
}

// ============================================
// 메인 앱 컴포넌트
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Google 로그인 콜백
  const handleGoogleLogin = useCallback(async (response) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // 저장된 사용자 이름 확인 (수정된 이름이 있으면 사용)
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
        
        await loadChannels(result.spreadsheetId);
        
        setCurrentPage('dashboard');
      } else {
        setError('로그인 처리 중 오류: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 이름 업데이트 함수
  const updateUserName = (newName) => {
    setUser(prev => ({ ...prev, name: newName }));
    localStorage.setItem('dashboardUserName', newName);
    
    // 저장된 user 객체도 업데이트
    const savedUser = JSON.parse(localStorage.getItem('dashboardUser') || '{}');
    savedUser.name = newName;
    localStorage.setItem('dashboardUser', JSON.stringify(savedUser));
  };

  // Google Identity Services 초기화
  useEffect(() => {
    const savedUser = localStorage.getItem('dashboardUser');
    const savedSpreadsheetId = localStorage.getItem('dashboardSpreadsheetId');
    const savedUserName = localStorage.getItem('dashboardUserName');
    
    if (savedUser && savedSpreadsheetId) {
      const parsedUser = JSON.parse(savedUser);
      // 저장된 커스텀 이름이 있으면 적용
      if (savedUserName) {
        parsedUser.name = savedUserName;
      }
      setUser(parsedUser);
      setSpreadsheetId(savedSpreadsheetId);
      setCurrentPage('dashboard');
      loadChannels(savedSpreadsheetId);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setTimeout(() => {
        setGoogleLoaded(true);
      }, 100);
    };
    
    script.onerror = () => {
      setError('Google 로그인 서비스를 불러오지 못했습니다.');
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 채널 데이터 로드
  const loadChannels = async (ssId) => {
    try {
      const result = await callBackend('getChannels', { spreadsheetId: ssId });
      if (result.success) {
        setChannels(result.channels || []);
      }
    } catch (err) {
      console.error('Load channels error:', err);
    }
  };

  // 채널 저장
  const saveChannel = async (channelData) => {
    setIsLoading(true);
    try {
      const result = await callBackend('saveChannel', {
        spreadsheetId: spreadsheetId,
        userId: user.userId,
        channelData: channelData
      });
      
      if (result.success) {
        await loadChannels(spreadsheetId);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // 채널 삭제
  const deleteChannel = async (channelId) => {
    setIsLoading(true);
    try {
      const result = await callBackend('deleteChannel', {
        spreadsheetId: spreadsheetId,
        userId: user.userId,
        channelId: channelId
      });
      
      if (result.success) {
        await loadChannels(spreadsheetId);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setUser(null);
    setSpreadsheetId(null);
    setChannels([]);
    localStorage.removeItem('dashboardUser');
    localStorage.removeItem('dashboardSpreadsheetId');
    // 이름은 유지 (다음 로그인 시 사용)
    setCurrentPage('login');
  };

  // 대시보드 데이터 계산 (실제 채널 데이터 기반)
  const getDashboardData = () => {
    const brands = [...new Set(channels.map(ch => ch.brand).filter(Boolean))];
    
    const platformCounts = {
      YouTube: channels.filter(ch => ch.platform === 'YouTube').length,
      TikTok: channels.filter(ch => ch.platform === 'TikTok').length,
      Instagram: channels.filter(ch => ch.platform === 'Instagram').length,
    };
    
    return {
      userName: user?.name || '사용자',
      period: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
      totalBrands: brands.length,
      totalChannels: channels.length,
      activePlatforms: Object.values(platformCounts).filter(c => c > 0).length,
      platforms: [
        { name: 'YouTube', count: platformCounts.YouTube, color: THEME.youtube },
        { name: 'TikTok', count: platformCounts.TikTok, color: THEME.tiktok },
        { name: 'Instagram', count: platformCounts.Instagram, color: THEME.instagram },
      ].filter(p => p.count > 0),
      brandStats: brands.map(brand => {
        const brandChannels = channels.filter(ch => ch.brand === brand);
        return {
          name: brand,
          color: brandChannels[0]?.brandColor || THEME.accent1,
          channelCount: brandChannels.length,
          platforms: [...new Set(brandChannels.map(ch => ch.platform))]
        };
      }),
    };
  };

  // 페이지 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage 
            isLoading={isLoading} 
            error={error} 
            googleLoaded={googleLoaded}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage 
            data={getDashboardData()} 
            user={user}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onUpdateUserName={updateUserName}
          />
        );
      case 'channels':
        return (
          <ChannelsPage 
            channels={channels}
            onSaveChannel={saveChannel}
            onDeleteChannel={deleteChannel}
            onBack={() => setCurrentPage('dashboard')}
            isLoading={isLoading}
          />
        );
      case 'ai':
        return <AIPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <LoginPage 
            isLoading={isLoading} 
            error={error}
            googleLoaded={googleLoaded}
            onGoogleLogin={handleGoogleLogin}
          />
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.bgPrimary,
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {renderPage()}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
        window.google.accounts.id.initialize({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          callback: onGoogleLogin,
        });
        
        const buttonContainer = document.getElementById('google-login-button');
        if (buttonContainer) {
          buttonContainer.innerHTML = '';
          window.google.accounts.id.renderButton(
            buttonContainer,
            { 
              theme: 'outline',
              size: 'large',
              width: 280,
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'center',
            }
          );
          setButtonRendered(true);
        }
      } catch (err) {
        console.error('Google button render error:', err);
      }
    }
  }, [googleLoaded, isLoading, buttonRendered, onGoogleLogin]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: `linear-gradient(135deg, ${THEME.bgPrimary} 0%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        background: THEME.bgSecondary,
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: '420px',
        width: '100%',
        boxShadow: THEME.shadow,
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
        }}>
          <span style={{ fontSize: '32px' }}>📊</span>
        </div>

        <h1 style={{
          color: THEME.textPrimary,
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '8px',
        }}>
          크리에이터 대시보드
        </h1>
        
        <p style={{
          color: THEME.textSecondary,
          fontSize: '15px',
          marginBottom: '36px',
        }}>
          멀티 플랫폼 채널을 한눈에 관리하세요
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            color: '#DC2626',
            fontSize: '14px',
            textAlign: 'left',
          }}>
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            color: THEME.textSecondary,
          }}>
            <Loader2 size={24} color={THEME.accent1} style={{ animation: 'spin 1s linear infinite' }} />
            <span>로그인 중...</span>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <div id="google-login-button" style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }} />
            {!googleLoaded && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: THEME.textMuted, fontSize: '14px' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Google 로그인 로딩 중...
              </div>
            )}
          </div>
        )}

        <div style={{ background: THEME.bgTertiary, borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <p style={{ color: THEME.textSecondary, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            🔒 로그인하면 <strong>본인의 Google Drive</strong>에<br/>데이터가 안전하게 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 대시보드 페이지
// ============================================
function DashboardPage({ data, user, onNavigate, onLogout, onUpdateUserName }) {
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState(data.userName);

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
          {user?.profileImage && (
            <img src={user.profileImage} alt="프로필" style={{ width: '40px', height: '40px', borderRadius: '12px', border: `2px solid ${THEME.bgTertiary}` }} />
          )}
          <div>
            {showNameEdit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    background: THEME.bgTertiary,
                    border: `1px solid ${THEME.accent1}`,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '14px',
                    color: THEME.textPrimary,
                    width: '120px',
                  }}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                />
                <button onClick={handleNameSave} style={{ background: THEME.accent4, border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                  저장
                </button>
                <button onClick={() => setShowNameEdit(false)} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '6px', padding: '6px 10px', color: THEME.textSecondary, cursor: 'pointer', fontSize: '12px' }}>
                  취소
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '16px' }}>
                  {data.userName}님 👋
                </div>
                <button
                  onClick={() => { setEditName(data.userName); setShowNameEdit(true); }}
                  style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: THEME.textMuted }}
                  title="이름 수정"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{data.period}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onNavigate('channels')}
            style={{
              background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`,
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Users size={16} />
            채널 관리
          </button>
          <button onClick={onLogout} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '12px', padding: '10px', color: THEME.textSecondary, cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* 요약 카드들 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <SummaryCard icon={<Target size={20} />} label="브랜드" value={data.totalBrands} unit="개" color={THEME.accent1} />
          <SummaryCard icon={<Users size={20} />} label="채널" value={data.totalChannels} unit="개" color={THEME.accent2} />
          <SummaryCard icon={<TrendingUp size={20} />} label="플랫폼" value={data.activePlatforms} unit="개" color={THEME.accent3} />
        </div>
      </div>

      {/* 브랜드별 현황 */}
      {data.brandStats.length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
            <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>🎯 브랜드별 현황</h3>
            {data.brandStats.map((brand, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: index < data.brandStats.length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: brand.color, marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: THEME.textPrimary, fontWeight: '500', fontSize: '15px' }}>{brand.name}</div>
                  <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{brand.platforms.join(', ')}</div>
                </div>
                <div style={{ background: `${brand.color}15`, color: brand.color, padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                  {brand.channelCount}개 채널
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 플랫폼별 현황 */}
      {data.platforms.length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
            <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📱 플랫폼별 채널 수</h3>
            {data.platforms.map((platform, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: index < data.platforms.length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${platform.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px' }}>
                  {platform.name === 'YouTube' && <Youtube size={22} color={platform.color} />}
                  {platform.name === 'TikTok' && <Music2 size={22} color={platform.color} />}
                  {platform.name === 'Instagram' && <Instagram size={22} color={platform.color} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: THEME.textPrimary, fontWeight: '500', fontSize: '15px' }}>{platform.name}</div>
                </div>
                <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '18px' }}>{platform.count}개</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 채널이 없을 때 안내 */}
      {data.totalChannels === 0 && (
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '40px 20px', boxShadow: THEME.shadow, textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <div style={{ color: THEME.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>채널을 등록해보세요!</div>
            <div style={{ color: THEME.textSecondary, fontSize: '14px', marginBottom: '20px' }}>브랜드와 플랫폼별 채널을 관리할 수 있어요</div>
            <button
              onClick={() => onNavigate('channels')}
              style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '14px 28px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
            >
              <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              첫 채널 등록하기
            </button>
          </div>
        </div>
      )}

      {/* 빠른 액션 버튼 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <ActionButton icon={<Users size={22} />} label="채널 관리" color={THEME.accent1} onClick={() => onNavigate('channels')} />
          <ActionButton icon={<MessageCircle size={22} />} label="AI 어시스턴트" color={THEME.accent2} onClick={() => onNavigate('ai')} />
        </div>
      </div>

      <Footer pageKey="dashboard" />
    </div>
  );
}

// ============================================
// 요약 카드 컴포넌트
// ============================================
function SummaryCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '18px', boxShadow: THEME.shadow }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: color }}>{icon}</div>
      <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>
        {value}{unit && <span style={{ fontSize: '14px', fontWeight: '500', color: THEME.textSecondary }}> {unit}</span>}
      </div>
    </div>
  );
}

// ============================================
// 액션 버튼 컴포넌트
// ============================================
function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '16px', padding: '24px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', boxShadow: THEME.shadow, transition: 'all 0.2s ease' }}
      onMouseOver={(e) => { e.currentTarget.style.boxShadow = THEME.shadowHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.boxShadow = THEME.shadow; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ color: color, width: '48px', height: '48px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ color: THEME.textPrimary, fontSize: '14px', fontWeight: '600' }}>{label}</div>
    </button>
  );
}

// ============================================
// 채널 관리 페이지
// ============================================
function ChannelsPage({ channels, onSaveChannel, onDeleteChannel, onBack, isLoading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChannels, setEditedChannels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    setEditedChannels([...channels]);
  }, [channels]);

  // 브랜드 목록 (컬러 정보 포함)
  const brandList = channels.reduce((acc, ch) => {
    if (ch.brand && !acc.find(b => b.name === ch.brand)) {
      acc.push({ name: ch.brand, color: ch.brandColor });
    }
    return acc;
  }, []);

  const brands = brandList.map(b => b.name);

  const filteredChannels = editedChannels.filter(ch => {
    if (filterBrand !== 'all' && ch.brand !== filterBrand) return false;
    if (filterPlatform !== 'all' && ch.platform !== filterPlatform) return false;
    return true;
  });

  const stats = {
    totalBrands: brands.length,
    totalChannels: channels.length,
    youtube: channels.filter(ch => ch.platform === 'YouTube').length,
    tiktok: channels.filter(ch => ch.platform === 'TikTok').length,
    instagram: channels.filter(ch => ch.platform === 'Instagram').length,
  };

  const togglePassword = (channelId) => {
    setVisiblePasswords(prev => {
      const newState = { ...prev, [channelId]: !prev[channelId] };
      if (newState[channelId]) {
        setTimeout(() => { setVisiblePasswords(p => ({ ...p, [channelId]: false })); }, 3000);
      }
      return newState;
    });
  };

  const handleSave = async () => {
    for (const channel of editedChannels) {
      const original = channels.find(ch => ch.id === channel.id);
      if (JSON.stringify(original) !== JSON.stringify(channel)) {
        await onSaveChannel(channel);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async (channelId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await onDeleteChannel(channelId);
    }
  };

  const handleAddChannel = async (newChannel) => {
    await onSaveChannel(newChannel);
    setShowAddModal(false);
  };

  const handleFieldChange = (channelId, field, value) => {
    setEditedChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, [field]: value } : ch));
  };

  const inputStyle = {
    background: THEME.bgTertiary,
    border: `1px solid ${THEME.bgTertiary}`,
    borderRadius: '8px',
    padding: '8px 10px',
    color: THEME.textPrimary,
    fontSize: '13px',
    width: '100%',
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: THEME.bgSecondary, border: 'none', borderRadius: '10px', padding: '10px', color: THEME.textSecondary, cursor: 'pointer', boxShadow: THEME.shadow }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>채널 관리</h1>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          style={{
            background: isEditing ? `linear-gradient(135deg, ${THEME.accent4} 0%, #059669 100%)` : THEME.bgSecondary,
            border: 'none', borderRadius: '12px', padding: '10px 20px',
            color: isEditing ? 'white' : THEME.textPrimary,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', boxShadow: THEME.shadow
          }}
        >
          {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : isEditing ? <><Save size={18} /> 저장</> : <><Pencil size={18} /> 편집</>}
        </button>
      </div>

      {/* 통계 카드 */}
      <div style={{ padding: '0 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          <StatBadge label="브랜드" value={stats.totalBrands} color={THEME.accent2} />
          <StatBadge label="채널" value={stats.totalChannels} color={THEME.accent3} />
          <StatBadge label="YouTube" value={stats.youtube} color={THEME.youtube} />
          <StatBadge label="TikTok" value={stats.tiktok} color={THEME.tiktok} />
          <StatBadge label="Instagram" value={stats.instagram} color={THEME.instagram} />
        </div>
      </div>

      {/* 필터 */}
      <div style={{ padding: '0 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '10px', padding: '10px 14px', color: THEME.textPrimary, fontSize: '14px', cursor: 'pointer' }}>
            <option value="all">모든 브랜드</option>
            {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '10px', padding: '10px 14px', color: THEME.textPrimary, fontSize: '14px', cursor: 'pointer' }}>
            <option value="all">모든 플랫폼</option>
            <option value="YouTube">YouTube</option>
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
          </select>
          {isEditing && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '10px', padding: '10px 18px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
            >
              <Plus size={18} /> 새 채널
            </button>
          )}
        </div>
      </div>

      {/* 채널 테이블 */}
      <div style={{ padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden', minWidth: '600px' }}>
          {/* 테이블 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: `100px 90px 140px 120px 120px 180px ${isEditing ? '50px' : ''}`, gap: '8px', padding: '14px 20px', background: THEME.bgTertiary, borderBottom: `1px solid ${THEME.bgTertiary}` }}>
            {['브랜드', '플랫폼', '채널명', '계정아이디', '비밀번호', 'URL'].map(header => (
              <div key={header} style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>{header}</div>
            ))}
            {isEditing && <div></div>}
          </div>

          {/* 테이블 바디 */}
          {filteredChannels.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: THEME.textSecondary }}>
              {channels.length === 0 ? (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>등록된 채널이 없습니다</div>
                  <div style={{ fontSize: '14px', color: THEME.textMuted }}>편집 모드에서 새 채널을 추가하세요</div>
                </div>
              ) : '필터 조건에 맞는 채널이 없습니다.'}
            </div>
          ) : (
            filteredChannels.map((channel, index) => (
              <div key={channel.id} style={{ display: 'grid', gridTemplateColumns: `100px 90px 140px 120px 120px 180px ${isEditing ? '50px' : ''}`, gap: '8px', padding: '14px 20px', borderBottom: index < filteredChannels.length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none', alignItems: 'center' }}>
                {/* 브랜드 */}
                <div>
                  <span style={{ background: channel.brandColor || THEME.accent1, color: 'white', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{channel.brand}</span>
                </div>

                {/* 플랫폼 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {channel.platform === 'YouTube' && <Youtube size={16} color={THEME.youtube} />}
                  {channel.platform === 'TikTok' && <Music2 size={16} />}
                  {channel.platform === 'Instagram' && <Instagram size={16} color={THEME.instagram} />}
                  <span style={{ color: THEME.textSecondary, fontSize: '12px' }}>{channel.platform?.substring(0, 3)}</span>
                </div>

                {/* 채널명 */}
                {isEditing ? (
                  <input value={channel.channelName || ''} onChange={(e) => handleFieldChange(channel.id, 'channelName', e.target.value)} style={inputStyle} />
                ) : (
                  <div style={{ color: THEME.textPrimary, fontSize: '13px', fontWeight: '500' }}>{channel.channelName}</div>
                )}

                {/* 계정아이디 */}
                {isEditing ? (
                  <input value={channel.accountId || ''} onChange={(e) => handleFieldChange(channel.id, 'accountId', e.target.value)} style={inputStyle} />
                ) : (
                  <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{channel.accountId}</div>
                )}

                {/* 비밀번호 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEditing ? (
                    <input type="text" value={channel.password || ''} onChange={(e) => handleFieldChange(channel.id, 'password', e.target.value)} style={inputStyle} />
                  ) : (
                    <>
                      <span style={{ color: THEME.textSecondary, fontSize: '13px' }}>{visiblePasswords[channel.id] ? channel.password : '••••••••'}</span>
                      {channel.password && (
                        <button onClick={() => togglePassword(channel.id)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: THEME.textMuted }}>
                          {visiblePasswords[channel.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* URL */}
                {isEditing ? (
                  <input value={channel.channelUrl || ''} onChange={(e) => handleFieldChange(channel.id, 'channelUrl', e.target.value)} style={inputStyle} />
                ) : (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {channel.channelUrl && (
                      <a href={channel.channelUrl} target="_blank" rel="noopener noreferrer" style={{ color: THEME.accent1, fontSize: '13px', textDecoration: 'none' }}>
                        {channel.channelUrl.replace('https://', '').substring(0, 20)}...
                      </a>
                    )}
                  </div>
                )}

                {/* 삭제 버튼 */}
                {isEditing && (
                  <button onClick={() => handleDelete(channel.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#DC2626' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 새 채널 추가 모달 */}
      {showAddModal && (
        <AddChannelModal
          brandList={brandList}
          onAdd={handleAddChannel}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <Footer pageKey="channels" />
    </div>
  );
}

// ============================================
// 통계 배지 컴포넌트
// ============================================
function StatBadge({ label, value, color }) {
  return (
    <div style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap', boxShadow: THEME.shadow }}>
      <span style={{ color: THEME.textSecondary, fontSize: '13px' }}>{label}</span>
      <span style={{ color: color, fontSize: '18px', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

// ============================================
// 새 채널 추가 모달 (이메일 필드 삭제, 브랜드 컬러 자동 매칭)
// ============================================
function AddChannelModal({ brandList, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    brand: '',
    brandColor: THEME.accent1,
    platform: 'YouTube',
    channelName: '',
    accountId: '',
    password: '',
    channelUrl: '',
  });
  const [isNewBrand, setIsNewBrand] = useState(brandList.length === 0);

  const colorOptions = [THEME.accent1, THEME.accent2, THEME.accent3, THEME.accent4, THEME.accent5, '#EC4899'];

  // 기존 브랜드 선택 시 컬러 자동 적용
  const handleBrandSelect = (brandName) => {
    const existingBrand = brandList.find(b => b.name === brandName);
    setFormData({ 
      ...formData, 
      brand: brandName,
      brandColor: existingBrand?.color || THEME.accent1
    });
  };

  const handleSubmit = () => {
    if (!formData.brand || !formData.channelName) {
      alert('브랜드명과 채널명은 필수입니다.');
      return;
    }
    onAdd(formData);
  };

  const inputStyle = {
    background: THEME.bgTertiary,
    border: `1px solid ${THEME.bgTertiary}`,
    borderRadius: '10px',
    padding: '12px 14px',
    color: THEME.textPrimary,
    fontSize: '14px',
    width: '100%',
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
      <div style={{ background: THEME.bgSecondary, borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ color: THEME.textPrimary, fontSize: '20px', fontWeight: '700' }}>새 채널 추가</h2>
          <button onClick={onClose} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: THEME.textSecondary }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 브랜드 선택 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>브랜드 *</label>
            {!isNewBrand && brandList.length > 0 ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={formData.brand}
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">브랜드 선택</option>
                  {brandList.map(brand => <option key={brand.name} value={brand.name}>{brand.name}</option>)}
                </select>
                <button onClick={() => setIsNewBrand(true)} style={{ background: `${THEME.accent2}15`, border: `1px solid ${THEME.accent2}40`, borderRadius: '10px', padding: '12px 16px', color: THEME.accent2, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + 새 브랜드
                </button>
              </div>
            ) : (
              <div>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="새 브랜드 이름" style={inputStyle} />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <button key={color} onClick={() => setFormData({ ...formData, brandColor: color })} style={{ width: '36px', height: '36px', borderRadius: '10px', background: color, border: formData.brandColor === color ? '3px solid ' + THEME.textPrimary : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
                {brandList.length > 0 && (
                  <button onClick={() => setIsNewBrand(false)} style={{ marginTop: '12px', background: 'none', border: 'none', color: THEME.accent1, fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                    ← 기존 브랜드 선택
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 플랫폼 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>플랫폼 *</label>
            <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} style={inputStyle}>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          {/* 채널명 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>채널명 *</label>
            <input type="text" value={formData.channelName} onChange={(e) => setFormData({ ...formData, channelName: e.target.value })} placeholder="채널 이름" style={inputStyle} />
          </div>

          {/* 계정아이디 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>계정아이디</label>
            <input type="text" value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} placeholder="@username 또는 로그인 아이디" style={inputStyle} />
          </div>

          {/* 비밀번호 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>비밀번호</label>
            <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="비밀번호" style={inputStyle} />
          </div>

          {/* 채널 URL */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>채널 URL</label>
            <input type="url" value={formData.channelUrl} onChange={(e) => setFormData({ ...formData, channelUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <button onClick={onClose} style={{ flex: 1, background: THEME.bgTertiary, border: 'none', borderRadius: '12px', padding: '16px', color: THEME.textSecondary, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            취소
          </button>
          <button onClick={handleSubmit} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// AI 어시스턴트 페이지
// ============================================
function AIPage({ onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 크리에이터 대시보드 AI 어시스턴트예요. 채널 관리, 콘텐츠 전략에 대해 물어보세요! 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        '좋은 질문이에요! 멀티 플랫폼 운영 시 각 플랫폼의 알고리즘 특성을 이해하는 것이 중요해요. 💡',
        '수익 극대화를 위해서는 콘텐츠 재활용 전략을 추천드려요. 하나의 원본으로 여러 포맷을 만들어보세요! 📈',
        '채널 성장을 위해서는 일관된 업로드 스케줄과 시청자 참여가 핵심이에요. ✨',
      ];
      setMessages(prev => [...prev, { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', background: THEME.bgPrimary }}>
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', background: THEME.bgSecondary, borderBottom: `1px solid ${THEME.bgTertiary}` }}>
        <button onClick={onBack} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '10px', padding: '10px', color: THEME.textSecondary, cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: THEME.textPrimary, fontSize: '18px', fontWeight: '700' }}>AI 어시스턴트</h1>
          <p style={{ color: THEME.textSecondary, fontSize: '13px' }}>크리에이터 전략 상담</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
            <div style={{ maxWidth: '80%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)` : THEME.bgSecondary, color: msg.role === 'user' ? 'white' : THEME.textPrimary, fontSize: '15px', lineHeight: '1.6', boxShadow: THEME.shadow }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 4px', background: THEME.bgSecondary, color: THEME.textMuted, boxShadow: THEME.shadow }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px 24px', background: THEME.bgSecondary, borderTop: `1px solid ${THEME.bgTertiary}` }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="질문을 입력하세요..." style={{ flex: 1, background: THEME.bgTertiary, border: 'none', borderRadius: '14px', padding: '16px 20px', color: THEME.textPrimary, fontSize: '15px' }} />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '14px', padding: '16px', color: 'white', cursor: 'pointer', opacity: (isLoading || !input.trim()) ? 0.5 : 1, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
