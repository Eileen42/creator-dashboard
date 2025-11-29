import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Youtube, Instagram, Music2, TrendingUp, DollarSign, Video, Plus, ArrowLeft, Target, Zap, MessageCircle, Send, Loader2, Pencil, Save, X, Eye, EyeOff, Trash2, Users, LogOut } from 'lucide-react';

// ============================================
// 설정값
// ============================================
const CONFIG = {
  GOOGLE_CLIENT_ID: '590021584308-rfnvvdjmntukh5roq0dlp6hibf470njs.apps.googleusercontent.com',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyFXqPYbKSe4MqMBlwYOmopmvIf67Iimic8LyzlaFYaf3vjcvXrlkOMV_AI32NkZzReLA/exec'
};

// ============================================
// 테마 색상 (밝고 중성적인 컬러)
// ============================================
const THEME = {
  // 배경
  bgPrimary: '#F8F9FC',      // 메인 배경 - 밝은 회색빛 화이트
  bgSecondary: '#FFFFFF',     // 카드 배경 - 순수 화이트
  bgTertiary: '#EEF1F6',      // 섹션 배경 - 연한 회색
  
  // 텍스트
  textPrimary: '#1A1D26',     // 메인 텍스트 - 진한 차콜
  textSecondary: '#6B7280',   // 보조 텍스트 - 중간 회색
  textMuted: '#9CA3AF',       // 흐린 텍스트 - 연한 회색
  
  // 액센트 (중성적이면서 세련된)
  accent1: '#6366F1',         // 인디고 - 메인 액센트
  accent2: '#8B5CF6',         // 바이올렛 - 보조 액센트
  accent3: '#06B6D4',         // 시안 - 포인트
  accent4: '#10B981',         // 에메랄드 - 성공/긍정
  accent5: '#F59E0B',         // 앰버 - 경고/주목
  
  // 플랫폼 컬러
  youtube: '#FF0000',
  tiktok: '#000000',
  instagram: '#E1306C',
  
  // 그림자
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
// 광고 배너 컴포넌트
// ============================================
function AdBanner({ pageKey }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [pageKey]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 24px',
    }}>
      <div style={{
        margin: '16px 0',
        textAlign: 'center',
        minHeight: '60px',
        background: THEME.bgTertiary,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <ins className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '60px',
          }}
          data-ad-client="ca-pub-4907584103511840"
          data-ad-slot="3606948375"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

// ============================================
// 푸터 컴포넌트
// ============================================
function Footer({ pageKey }) {
  return (
    <>
      <AdBanner pageKey={pageKey} />
      <div style={{
        textAlign: 'center',
        padding: '16px 24px 32px',
        color: THEME.textMuted,
        fontSize: '12px',
      }}>
        Made with 💜 for Creators
      </div>
    </>
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
      // JWT 디코딩
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        profileImage: payload.picture
      };

      // 백엔드에 사용자 초기화 요청
      const result = await callBackend('init', userData);
      
      if (result.success) {
        setUser(userData);
        setSpreadsheetId(result.spreadsheetId);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('dashboardUser', JSON.stringify(userData));
        localStorage.setItem('dashboardSpreadsheetId', result.spreadsheetId);
        
        // 채널 데이터 로드
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

  // Google Identity Services 초기화
  useEffect(() => {
    // 이미 로그인된 사용자 확인
    const savedUser = localStorage.getItem('dashboardUser');
    const savedSpreadsheetId = localStorage.getItem('dashboardSpreadsheetId');
    
    if (savedUser && savedSpreadsheetId) {
      setUser(JSON.parse(savedUser));
      setSpreadsheetId(savedSpreadsheetId);
      setCurrentPage('dashboard');
      loadChannels(savedSpreadsheetId);
    }

    // Google 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 약간의 지연
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
    setCurrentPage('login');
  };

  // 대시보드 데이터 계산
  const getDashboardData = () => {
    const brands = [...new Set(channels.map(ch => ch.brand))];
    const platformCounts = {
      YouTube: channels.filter(ch => ch.platform === 'YouTube').length,
      TikTok: channels.filter(ch => ch.platform === 'TikTok').length,
      Instagram: channels.filter(ch => ch.platform === 'Instagram').length,
    };
    
    return {
      userName: user?.name || '사용자',
      period: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
      channels: brands.map((brand, idx) => {
        const brandChannels = channels.filter(ch => ch.brand === brand);
        const colors = [THEME.accent1, THEME.accent2, THEME.accent3, THEME.accent4, THEME.accent5];
        return {
          name: brand,
          platform: 'youtube',
          videos: brandChannels.length * 4,
          uploads: brandChannels.length * 4,
          revenue: brandChannels.length * 50000,
          color: brandChannels[0]?.brandColor || colors[idx % colors.length]
        };
      }),
      platforms: [
        { name: 'YouTube', uploads: platformCounts.YouTube * 8, revenue: platformCounts.YouTube * 150000, color: THEME.youtube },
        { name: 'TikTok', uploads: platformCounts.TikTok * 6, revenue: platformCounts.TikTok * 20000, color: THEME.tiktok },
        { name: 'Instagram', uploads: platformCounts.Instagram * 10, revenue: platformCounts.Instagram * 15000, color: THEME.instagram },
      ],
      originalContents: channels.length * 2 || 10,
      totalUploads: channels.length * 8 || 62,
      activePlatforms: Object.values(platformCounts).filter(c => c > 0).length || 3,
      monthlyData: [
        { month: '7월', revenue: 380000, contents: 8, uploads: 45, pes: 10.2 },
        { month: '8월', revenue: 420000, contents: 9, uploads: 52, pes: 12.1 },
        { month: '9월', revenue: 395000, contents: 8, uploads: 48, pes: 11.5 },
        { month: '10월', revenue: 450000, contents: 10, uploads: 55, pes: 13.2 },
        { month: '11월', revenue: 505000, contents: channels.length * 2 || 10, uploads: channels.length * 8 || 62, pes: 14.1 },
      ],
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
          />
        );
      case 'productivity':
        return (
          <ProductivityPage 
            data={getDashboardData()} 
            onBack={() => setCurrentPage('dashboard')} 
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
        
        * {
          box-sizing: border-box;
        }
        
        input, select, button {
          font-family: inherit;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: ${THEME.accent1};
        }
      `}</style>
    </div>
  );
}

// ============================================
// 로그인 페이지
// ============================================
function LoginPage({ isLoading, error, googleLoaded, onGoogleLogin }) {
  const [buttonRendered, setButtonRendered] = useState(false);

  // Google 버튼 렌더링 (컴포넌트 내부에서 처리)
  useEffect(() => {
    if (googleLoaded && window.google && !isLoading && !buttonRendered) {
      try {
        // Google Identity Services 초기화
        window.google.accounts.id.initialize({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          callback: onGoogleLogin,
        });
        
        // 버튼 컨테이너가 실제로 존재하는지 확인
        const buttonContainer = document.getElementById('google-login-button');
        if (buttonContainer && !buttonContainer.hasChildNodes()) {
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
        setError('Google 로그인 버튼을 생성할 수 없습니다. 페이지를 새로고침 해주세요.');
      }
    }
  }, [googleLoaded, isLoading, buttonRendered, onGoogleLogin]);

  // Google 로딩 상태 확인
  useEffect(() => {
    if (googleLoaded && !window.google) {
      setError('Google 로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }
  }, [googleLoaded]);

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
        {/* 로고 */}
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

        {/* 타이틀 */}
        <h1 style={{
          color: THEME.textPrimary,
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '8px',
          letterSpacing: '-0.5px',
        }}>
          크리에이터 대시보드
        </h1>
        
        <p style={{
          color: THEME.textSecondary,
          fontSize: '15px',
          marginBottom: '36px',
          lineHeight: '1.6',
        }}>
          멀티 플랫폼 채널을 한눈에 관리하세요
        </p>

        {/* 에러 메시지 */}
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

        {/* 로그인 버튼 영역 */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            color: THEME.textSecondary,
          }}>
            <Loader2 
              size={24} 
              color={THEME.accent1}
              style={{ animation: 'spin 1s linear infinite' }} 
            />
            <span>로그인 중...</span>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            {/* Google 로그인 버튼 컨테이너 */}
            <div 
              id="google-login-button" 
              style={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: '44px',
              }}
            />
            
            {/* Google 로딩 중 표시 */}
            {!googleLoaded && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                color: THEME.textMuted,
                fontSize: '14px',
              }}>
                <Loader2 
                  size={18} 
                  style={{ animation: 'spin 1s linear infinite' }} 
                />
                Google 로그인 로딩 중...
              </div>
            )}
          </div>
        )}

        {/* 안내 문구 */}
        <div style={{
          background: THEME.bgTertiary,
          borderRadius: '12px',
          padding: '16px',
          marginTop: '8px',
        }}>
          <p style={{
            color: THEME.textSecondary,
            fontSize: '13px',
            lineHeight: '1.6',
            margin: 0,
          }}>
            🔒 로그인하면 <strong>본인의 Google Drive</strong>에<br/>
            데이터가 안전하게 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 대시보드 페이지
// ============================================
function DashboardPage({ data, user, onNavigate, onLogout }) {
  const totalRevenue = data.platforms.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.profileImage && (
            <img 
              src={user.profileImage} 
              alt="프로필"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: `2px solid ${THEME.bgTertiary}`,
              }}
            />
          )}
          <div>
            <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '16px' }}>
              {data.userName}님 👋
            </div>
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
          <button
            onClick={onLogout}
            style={{
              background: THEME.bgTertiary,
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              color: THEME.textSecondary,
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* 요약 카드들 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <SummaryCard 
            icon={<Video size={20} />}
            label="원본 콘텐츠"
            value={data.originalContents}
            unit="개"
            color={THEME.accent1}
          />
          <SummaryCard 
            icon={<TrendingUp size={20} />}
            label="총 업로드"
            value={data.totalUploads}
            unit="개"
            color={THEME.accent3}
          />
          <SummaryCard 
            icon={<DollarSign size={20} />}
            label="이번 달 수익"
            value={`₩${totalRevenue.toLocaleString()}`}
            color={THEME.accent2}
          />
          <SummaryCard 
            icon={<Target size={20} />}
            label="활성 플랫폼"
            value={data.activePlatforms}
            unit="개"
            color={THEME.accent4}
          />
        </div>
      </div>

      {/* 월별 수익 차트 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: THEME.bgSecondary,
          borderRadius: '20px',
          padding: '20px',
          boxShadow: THEME.shadow,
        }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            📈 월별 수익 추이
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <XAxis dataKey="month" tick={{ fill: THEME.textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: THEME.textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/10000}만`} />
                <Tooltip 
                  formatter={(value) => [`₩${value.toLocaleString()}`, '수익']}
                  contentStyle={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '8px' }}
                  labelStyle={{ color: THEME.textPrimary }}
                />
                <Bar dataKey="revenue" fill={THEME.accent1} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 플랫폼별 현황 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: THEME.bgSecondary,
          borderRadius: '20px',
          padding: '20px',
          boxShadow: THEME.shadow,
        }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            🎯 플랫폼별 현황
          </h3>
          {data.platforms.map((platform, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: index < data.platforms.length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${platform.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
              }}>
                {platform.name === 'YouTube' && <Youtube size={22} color={platform.color} />}
                {platform.name === 'TikTok' && <Music2 size={22} color={platform.color} />}
                {platform.name === 'Instagram' && <Instagram size={22} color={platform.color} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: THEME.textPrimary, fontWeight: '500', fontSize: '15px' }}>{platform.name}</div>
                <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{platform.uploads}개 업로드</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '15px' }}>
                  ₩{platform.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 버튼 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <ActionButton 
            icon={<Zap size={22} />}
            label="생산성 분석"
            color={THEME.accent1}
            onClick={() => onNavigate('productivity')}
          />
          <ActionButton 
            icon={<MessageCircle size={22} />}
            label="AI 어시스턴트"
            color={THEME.accent2}
            onClick={() => onNavigate('ai')}
          />
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
    <div style={{
      background: THEME.bgSecondary,
      borderRadius: '16px',
      padding: '18px',
      boxShadow: THEME.shadow,
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        color: color,
      }}>
        {icon}
      </div>
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
      style={{
        background: THEME.bgSecondary,
        border: `1px solid ${THEME.bgTertiary}`,
        borderRadius: '16px',
        padding: '24px 20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        boxShadow: THEME.shadow,
        transition: 'all 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = THEME.shadowHover;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = THEME.shadow;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ 
        color: color,
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
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

  const brands = [...new Set(channels.map(ch => ch.brand))];

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
        setTimeout(() => {
          setVisiblePasswords(p => ({ ...p, [channelId]: false }));
        }, 3000);
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
    setEditedChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, [field]: value } : ch
    ));
  };

  const hasPhone = channels.some(ch => ch.phone);
  const hasIP = channels.some(ch => ch.ip);
  const hasMemo = channels.some(ch => ch.memo);

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
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: THEME.bgSecondary,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              color: THEME.textSecondary,
              cursor: 'pointer',
              boxShadow: THEME.shadow,
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>채널 관리</h1>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          style={{
            background: isEditing 
              ? `linear-gradient(135deg, ${THEME.accent4} 0%, #059669 100%)` 
              : THEME.bgSecondary,
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            color: isEditing ? 'white' : THEME.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: THEME.shadow,
          }}
        >
          {isLoading ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isEditing ? (
            <><Save size={18} /> 저장</>
          ) : (
            <><Pencil size={18} /> 편집</>
          )}
        </button>
      </div>

      {/* 통계 카드 */}
      <div style={{ padding: '0 24px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
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
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            style={{
              background: THEME.bgSecondary,
              border: `1px solid ${THEME.bgTertiary}`,
              borderRadius: '10px',
              padding: '10px 14px',
              color: THEME.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="all">모든 브랜드</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            style={{
              background: THEME.bgSecondary,
              border: `1px solid ${THEME.bgTertiary}`,
              borderRadius: '10px',
              padding: '10px 14px',
              color: THEME.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="all">모든 플랫폼</option>
            <option value="YouTube">YouTube</option>
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
          </select>
          {isEditing && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`,
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={18} /> 새 채널
            </button>
          )}
        </div>
      </div>

      {/* 채널 테이블 */}
      <div style={{ padding: '0 24px', overflowX: 'auto' }}>
        <div style={{
          background: THEME.bgSecondary,
          borderRadius: '16px',
          boxShadow: THEME.shadow,
          overflow: 'hidden',
          minWidth: '700px',
        }}>
          {/* 테이블 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `100px 90px 130px 110px 110px 160px 160px ${hasPhone ? '120px ' : ''}${hasIP ? '100px ' : ''}${hasMemo ? '120px ' : ''}${isEditing ? '50px' : ''}`,
            gap: '8px',
            padding: '14px 20px',
            background: THEME.bgTertiary,
            borderBottom: `1px solid ${THEME.bgTertiary}`,
          }}>
            {['브랜드', '플랫폼', '채널명', '아이디', '비밀번호', '이메일', 'URL'].map(header => (
              <div key={header} style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>{header}</div>
            ))}
            {hasPhone && <div style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>폰번호</div>}
            {hasIP && <div style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>IP</div>}
            {hasMemo && <div style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>메모</div>}
            {isEditing && <div></div>}
          </div>

          {/* 테이블 바디 */}
          {filteredChannels.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: THEME.textSecondary,
            }}>
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
              <div
                key={channel.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `100px 90px 130px 110px 110px 160px 160px ${hasPhone ? '120px ' : ''}${hasIP ? '100px ' : ''}${hasMemo ? '120px ' : ''}${isEditing ? '50px' : ''}`,
                  gap: '8px',
                  padding: '14px 20px',
                  borderBottom: index < filteredChannels.length - 1 ? `1px solid ${THEME.bgTertiary}` : 'none',
                  alignItems: 'center',
                }}
              >
                {/* 브랜드 */}
                <div>
                  <span style={{
                    background: channel.brandColor || THEME.accent1,
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {channel.brand}
                  </span>
                </div>

                {/* 플랫폼 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {channel.platform === 'YouTube' && <Youtube size={16} color={THEME.youtube} />}
                  {channel.platform === 'TikTok' && <Music2 size={16} />}
                  {channel.platform === 'Instagram' && <Instagram size={16} color={THEME.instagram} />}
                  <span style={{ color: THEME.textSecondary, fontSize: '12px' }}>
                    {channel.platform?.substring(0, 3)}
                  </span>
                </div>

                {/* 채널명 */}
                {isEditing ? (
                  <input
                    value={channel.channelName || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'channelName', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: THEME.textPrimary, fontSize: '13px', fontWeight: '500' }}>{channel.channelName}</div>
                )}

                {/* 아이디 */}
                {isEditing ? (
                  <input
                    value={channel.accountId || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'accountId', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{channel.accountId}</div>
                )}

                {/* 비밀번호 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={channel.password || ''}
                      onChange={(e) => handleFieldChange(channel.id, 'password', e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <>
                      <span style={{ color: THEME.textSecondary, fontSize: '13px' }}>
                        {visiblePasswords[channel.id] ? channel.password : '••••••••'}
                      </span>
                      {channel.password && (
                        <button
                          onClick={() => togglePassword(channel.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: THEME.textMuted,
                          }}
                        >
                          {visiblePasswords[channel.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* 이메일 */}
                {isEditing ? (
                  <input
                    value={channel.email || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'email', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: THEME.textSecondary, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {channel.email}
                  </div>
                )}

                {/* URL */}
                {isEditing ? (
                  <input
                    value={channel.channelUrl || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'channelUrl', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {channel.channelUrl && (
                      <a 
                        href={channel.channelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: THEME.accent1, fontSize: '13px', textDecoration: 'none' }}
                      >
                        {channel.channelUrl.replace('https://', '').substring(0, 18)}...
                      </a>
                    )}
                  </div>
                )}

                {/* 폰번호 */}
                {hasPhone && (
                  isEditing ? (
                    <input
                      value={channel.phone || ''}
                      onChange={(e) => handleFieldChange(channel.id, 'phone', e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{channel.phone}</div>
                  )
                )}

                {/* IP */}
                {hasIP && (
                  isEditing ? (
                    <input
                      value={channel.ip || ''}
                      onChange={(e) => handleFieldChange(channel.id, 'ip', e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{channel.ip}</div>
                  )
                )}

                {/* 메모 */}
                {hasMemo && (
                  isEditing ? (
                    <input
                      value={channel.memo || ''}
                      onChange={(e) => handleFieldChange(channel.id, 'memo', e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{channel.memo}</div>
                  )
                )}

                {/* 삭제 버튼 */}
                {isEditing && (
                  <button
                    onClick={() => handleDelete(channel.id)}
                    style={{
                      background: '#FEF2F2',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#DC2626',
                    }}
                  >
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
          brands={brands}
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
    <div style={{
      background: THEME.bgSecondary,
      border: `1px solid ${THEME.bgTertiary}`,
      borderRadius: '12px',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      whiteSpace: 'nowrap',
      boxShadow: THEME.shadow,
    }}>
      <span style={{ color: THEME.textSecondary, fontSize: '13px' }}>{label}</span>
      <span style={{ color: color, fontSize: '18px', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

// ============================================
// 새 채널 추가 모달
// ============================================
function AddChannelModal({ brands, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    brand: '',
    brandColor: THEME.accent1,
    platform: 'YouTube',
    channelName: '',
    accountId: '',
    password: '',
    email: '',
    channelUrl: '',
    phone: '',
    ip: '',
    memo: '',
  });
  const [isNewBrand, setIsNewBrand] = useState(brands.length === 0);

  const colorOptions = [THEME.accent1, THEME.accent2, THEME.accent3, THEME.accent4, THEME.accent5, '#EC4899'];

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}>
      <div style={{
        background: THEME.bgSecondary,
        borderRadius: '24px',
        padding: '28px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}>
          <h2 style={{ color: THEME.textPrimary, fontSize: '20px', fontWeight: '700' }}>새 채널 추가</h2>
          <button
            onClick={onClose}
            style={{
              background: THEME.bgTertiary,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              color: THEME.textSecondary,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 브랜드 선택 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              브랜드 *
            </label>
            {!isNewBrand && brands.length > 0 ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">브랜드 선택</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsNewBrand(true)}
                  style={{
                    background: `${THEME.accent2}15`,
                    border: `1px solid ${THEME.accent2}40`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: THEME.accent2,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + 새 브랜드
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="새 브랜드 이름"
                  style={inputStyle}
                />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, brandColor: color })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: color,
                        border: formData.brandColor === color ? '3px solid ' + THEME.textPrimary : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                      }}
                    />
                  ))}
                </div>
                {brands.length > 0 && (
                  <button
                    onClick={() => setIsNewBrand(false)}
                    style={{
                      marginTop: '12px',
                      background: 'none',
                      border: 'none',
                      color: THEME.accent1,
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    ← 기존 브랜드 선택
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 플랫폼 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              플랫폼 *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              style={inputStyle}
            >
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          {/* 채널명 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              채널명 *
            </label>
            <input
              type="text"
              value={formData.channelName}
              onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
              placeholder="채널 이름"
              style={inputStyle}
            />
          </div>

          {/* 아이디 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              아이디
            </label>
            <input
              type="text"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              placeholder="@username"
              style={inputStyle}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              비밀번호
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="비밀번호"
              style={inputStyle}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              style={inputStyle}
            />
          </div>

          {/* 채널 URL */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              채널 URL
            </label>
            <input
              type="url"
              value={formData.channelUrl}
              onChange={(e) => setFormData({ ...formData, channelUrl: e.target.value })}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {/* 메모 */}
          <div>
            <label style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
              메모
            </label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="메모"
              style={inputStyle}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '28px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: THEME.bgTertiary,
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: THEME.textSecondary,
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`,
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 생산성 분석 페이지
// ============================================
function ProductivityPage({ data, onBack }) {
  const latestMonth = data.monthlyData[data.monthlyData.length - 1];
  const prevMonth = data.monthlyData[data.monthlyData.length - 2];
  
  const revenueGrowth = prevMonth ? ((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1) : 0;
  const pesGrowth = prevMonth ? ((latestMonth.pes - prevMonth.pes) / prevMonth.pes * 100).toFixed(1) : 0;

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: THEME.bgSecondary,
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            color: THEME.textSecondary,
            cursor: 'pointer',
            boxShadow: THEME.shadow,
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>생산성 분석</h1>
      </div>

      {/* PES 점수 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: `linear-gradient(135deg, ${THEME.accent1}15 0%, ${THEME.accent2}15 100%)`,
          borderRadius: '20px',
          padding: '28px',
          border: `1px solid ${THEME.accent1}30`,
          textAlign: 'center',
        }}>
          <div style={{ color: THEME.textSecondary, fontSize: '15px', marginBottom: '12px' }}>
            이번 달 PES (생산성 효율 점수)
          </div>
          <div style={{ 
            color: THEME.accent1, 
            fontSize: '56px', 
            fontWeight: '700',
            lineHeight: 1,
          }}>
            {latestMonth.pes}
          </div>
          <div style={{
            color: pesGrowth >= 0 ? THEME.accent4 : '#DC2626',
            fontSize: '15px',
            marginTop: '12px',
            fontWeight: '600',
          }}>
            {pesGrowth >= 0 ? '↑' : '↓'} 전월 대비 {Math.abs(pesGrowth)}%
          </div>
        </div>
      </div>

      {/* 상세 지표 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <div style={{
            background: THEME.bgSecondary,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: THEME.shadow,
          }}>
            <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '10px' }}>원본 → 업로드 비율</div>
            <div style={{ color: THEME.textPrimary, fontSize: '28px', fontWeight: '700' }}>
              1 : {(latestMonth.uploads / latestMonth.contents).toFixed(1)}
            </div>
          </div>
          <div style={{
            background: THEME.bgSecondary,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: THEME.shadow,
          }}>
            <div style={{ color: THEME.textSecondary, fontSize: '13px', marginBottom: '10px' }}>콘텐츠당 평균 수익</div>
            <div style={{ color: THEME.textPrimary, fontSize: '28px', fontWeight: '700' }}>
              ₩{Math.round(latestMonth.revenue / latestMonth.contents).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* PES 추이 차트 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: THEME.bgSecondary,
          borderRadius: '20px',
          padding: '20px',
          boxShadow: THEME.shadow,
        }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            📊 PES 추이
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <XAxis dataKey="month" tick={{ fill: THEME.textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: THEME.textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [value, 'PES']}
                  contentStyle={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '8px' }}
                  labelStyle={{ color: THEME.textPrimary }}
                />
                <Bar dataKey="pes" fill={THEME.accent3} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Footer pageKey="productivity" />
    </div>
  );
}

// ============================================
// AI 어시스턴트 페이지
// ============================================
function AIPage({ onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 크리에이터 대시보드 AI 어시스턴트예요. 채널 관리, 콘텐츠 전략, 수익 분석에 대해 물어보세요! 🚀' }
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
        '데이터를 보면 이번 달 생산성이 좋아지고 있어요. 현재 전략을 유지하시면 좋을 것 같아요! 👏',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '800px',
      margin: '0 auto',
      background: THEME.bgPrimary,
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: THEME.bgSecondary,
        borderBottom: `1px solid ${THEME.bgTertiary}`,
      }}>
        <button
          onClick={onBack}
          style={{
            background: THEME.bgTertiary,
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            color: THEME.textSecondary,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: THEME.textPrimary, fontSize: '18px', fontWeight: '700' }}>AI 어시스턴트</h1>
          <p style={{ color: THEME.textSecondary, fontSize: '13px' }}>크리에이터 전략 상담</p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' 
                ? `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)` 
                : THEME.bgSecondary,
              color: msg.role === 'user' ? 'white' : THEME.textPrimary,
              fontSize: '15px',
              lineHeight: '1.6',
              boxShadow: THEME.shadow,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              background: THEME.bgSecondary,
              color: THEME.textMuted,
              boxShadow: THEME.shadow,
            }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '16px 24px 24px',
        background: THEME.bgSecondary,
        borderTop: `1px solid ${THEME.bgTertiary}`,
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="질문을 입력하세요..."
            style={{
              flex: 1,
              background: THEME.bgTertiary,
              border: 'none',
              borderRadius: '14px',
              padding: '16px 20px',
              color: THEME.textPrimary,
              fontSize: '15px',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`,
              border: 'none',
              borderRadius: '14px',
              padding: '16px',
              color: 'white',
              cursor: 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.5 : 1,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
