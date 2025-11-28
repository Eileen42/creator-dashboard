import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Youtube, Instagram, Music2, TrendingUp, DollarSign, Video, ChevronDown, Plus, Sparkles, ArrowLeft, Target, Zap, PieChart as PieIcon, MessageCircle, Send, Loader2, Settings, Pencil, Save, X, Eye, EyeOff, Trash2, Filter, Users, LogOut } from 'lucide-react';

// ============================================
// 설정값
// ============================================
const CONFIG = {
  GOOGLE_CLIENT_ID: '590021584308-rfnvvdjmntukh5roq0dlp6hibf470njs.apps.googleusercontent.com',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxhcspmRxcjafWfTsmPC6Tw_-vRTVq_uF_FfTvPpNKEAkItgdDMXEe2Q-ptC1547bDMmg/exec'
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
// 광고 배너 컴포넌트 (재사용)
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
        background: '#FAFAFA',
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
// 푸터 컴포넌트 (재사용)
// ============================================
function Footer({ pageKey }) {
  return (
    <>
      <AdBanner pageKey={pageKey} />
      <div style={{
        textAlign: 'center',
        padding: '16px 24px 32px',
        color: '#B0B0B8',
        fontSize: '12px',
      }}>
        Made with 💕 for Creators
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

  // Google Identity Services 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
      }
    };

    // 로컬 스토리지에서 사용자 정보 복원
    const savedUser = localStorage.getItem('dashboardUser');
    const savedSpreadsheetId = localStorage.getItem('dashboardSpreadsheetId');
    if (savedUser && savedSpreadsheetId) {
      setUser(JSON.parse(savedUser));
      setSpreadsheetId(savedSpreadsheetId);
      setCurrentPage('dashboard');
      loadChannels(savedSpreadsheetId);
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Google 로그인 처리
  const handleGoogleLogin = async (response) => {
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
        setError('로그인 처리 중 오류가 발생했습니다: ' + result.error);
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 채널 데이터 로드
  const loadChannels = async (ssId) => {
    const result = await callBackend('getChannels', { spreadsheetId: ssId });
    if (result.success) {
      setChannels(result.channels || []);
    }
  };

  // 채널 저장
  const saveChannel = async (channelData) => {
    setIsLoading(true);
    const result = await callBackend('saveChannel', {
      spreadsheetId: spreadsheetId,
      userId: user.userId,
      channelData: channelData
    });
    
    if (result.success) {
      await loadChannels(spreadsheetId);
    }
    setIsLoading(false);
    return result;
  };

  // 채널 삭제
  const deleteChannel = async (channelId) => {
    setIsLoading(true);
    const result = await callBackend('deleteChannel', {
      spreadsheetId: spreadsheetId,
      userId: user.userId,
      channelId: channelId
    });
    
    if (result.success) {
      await loadChannels(spreadsheetId);
    }
    setIsLoading(false);
    return result;
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

  // 샘플 대시보드 데이터 (채널 데이터 기반으로 계산)
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
        const colors = ['#FF6B9D', '#9B6BFF', '#6BC5FF', '#4CAF50', '#FF9800'];
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
        { name: 'YouTube', uploads: platformCounts.YouTube * 8, revenue: platformCounts.YouTube * 150000, color: '#FF6B9D' },
        { name: 'TikTok', uploads: platformCounts.TikTok * 6, revenue: platformCounts.TikTok * 20000, color: '#6BC5FF' },
        { name: 'Instagram', uploads: platformCounts.Instagram * 10, revenue: platformCounts.Instagram * 15000, color: '#9B6BFF' },
      ],
      originalContents: channels.length * 2,
      totalUploads: channels.length * 8,
      activePlatforms: Object.values(platformCounts).filter(c => c > 0).length,
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
        return <LoginPage onLogin={handleGoogleLogin} isLoading={isLoading} error={error} />;
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
        return <ProductivityPage data={getDashboardData()} onBack={() => setCurrentPage('dashboard')} />;
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
        return <LoginPage onLogin={handleGoogleLogin} isLoading={isLoading} error={error} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F0F1E 100%)',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {renderPage()}
    </div>
  );
}

// ============================================
// 로그인 페이지
// ============================================
function LoginPage({ onLogin, isLoading, error }) {
  useEffect(() => {
    // Google 로그인 버튼 렌더링
    if (window.google && !isLoading) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { 
          theme: 'filled_blue',
          size: 'large',
          width: 280,
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    }
  }, [isLoading]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
        }}>
          📊
        </div>
        <h1 style={{
          color: 'white',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
        }}>
          크리에이터 대시보드
        </h1>
        <p style={{
          color: '#B0B0B8',
          fontSize: '14px',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}>
          멀티 플랫폼 채널을 한눈에 관리하세요
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 107, 157, 0.2)',
            border: '1px solid rgba(255, 107, 157, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '24px',
            color: '#FF6B9D',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            color: 'white',
          }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>로그인 중...</span>
          </div>
        ) : (
          <div id="google-login-button" style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }} />
        )}

        <p style={{
          color: '#6B6B75',
          fontSize: '12px',
          marginTop: '24px',
          lineHeight: '1.6',
        }}>
          로그인하면 Google Drive에<br/>
          개인 데이터가 안전하게 저장됩니다
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// 대시보드 페이지
// ============================================
function DashboardPage({ data, user, onNavigate, onLogout }) {
  const totalRevenue = data.platforms.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div style={{ paddingBottom: '20px' }}>
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
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
          )}
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>
              {data.userName}님의 대시보드
            </div>
            <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{data.period}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onNavigate('channels')}
            style={{
              background: 'linear-gradient(135deg, #9B6BFF 0%, #6B4BCC 100%)',
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
            }}
          >
            <Users size={16} />
            채널 관리
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              color: '#B0B0B8',
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
            color="#FF6B9D"
          />
          <SummaryCard 
            icon={<TrendingUp size={20} />}
            label="총 업로드"
            value={data.totalUploads}
            unit="개"
            color="#6BC5FF"
          />
          <SummaryCard 
            icon={<DollarSign size={20} />}
            label="이번 달 수익"
            value={`₩${totalRevenue.toLocaleString()}`}
            color="#9B6BFF"
          />
          <SummaryCard 
            icon={<Target size={20} />}
            label="활성 플랫폼"
            value={data.activePlatforms}
            unit="개"
            color="#4CAF50"
          />
        </div>
      </div>

      {/* 월별 수익 차트 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            📈 월별 수익 추이
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <XAxis dataKey="month" tick={{ fill: '#B0B0B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#B0B0B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/10000}만`} />
                <Tooltip 
                  formatter={(value) => [`₩${value.toLocaleString()}`, '수익']}
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B9D" />
                    <stop offset="100%" stopColor="#9B6BFF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 플랫폼별 현황 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            🎯 플랫폼별 현황
          </h3>
          {data.platforms.map((platform, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < data.platforms.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `${platform.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
              }}>
                {platform.name === 'YouTube' && <Youtube size={20} color={platform.color} />}
                {platform.name === 'TikTok' && <Music2 size={20} color={platform.color} />}
                {platform.name === 'Instagram' && <Instagram size={20} color={platform.color} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>{platform.name}</div>
                <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{platform.uploads}개 업로드</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
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
            icon={<Zap size={20} />}
            label="생산성 분석"
            color="#FF6B9D"
            onClick={() => onNavigate('productivity')}
          />
          <ActionButton 
            icon={<MessageCircle size={20} />}
            label="AI 어시스턴트"
            color="#9B6BFF"
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
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        color: color,
      }}>
        {icon}
      </div>
      <div style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
        {value}{unit && <span style={{ fontSize: '14px', fontWeight: '400' }}>{unit}</span>}
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
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div style={{ color: color }}>{icon}</div>
      <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{label}</div>
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

  // 브랜드 목록 추출
  const brands = [...new Set(channels.map(ch => ch.brand))];

  // 필터링된 채널
  const filteredChannels = editedChannels.filter(ch => {
    if (filterBrand !== 'all' && ch.brand !== filterBrand) return false;
    if (filterPlatform !== 'all' && ch.platform !== filterPlatform) return false;
    return true;
  });

  // 통계
  const stats = {
    totalBrands: brands.length,
    totalChannels: channels.length,
    youtube: channels.filter(ch => ch.platform === 'YouTube').length,
    tiktok: channels.filter(ch => ch.platform === 'TikTok').length,
    instagram: channels.filter(ch => ch.platform === 'Instagram').length,
  };

  // 비밀번호 토글
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

  // 저장
  const handleSave = async () => {
    for (const channel of editedChannels) {
      const original = channels.find(ch => ch.id === channel.id);
      if (JSON.stringify(original) !== JSON.stringify(channel)) {
        await onSaveChannel(channel);
      }
    }
    setIsEditing(false);
  };

  // 삭제
  const handleDelete = async (channelId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await onDeleteChannel(channelId);
    }
  };

  // 새 채널 추가
  const handleAddChannel = async (newChannel) => {
    await onSaveChannel(newChannel);
    setShowAddModal(false);
  };

  // 편집 중 값 변경
  const handleFieldChange = (channelId, field, value) => {
    setEditedChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, [field]: value } : ch
    ));
  };

  // 동적 컬럼 결정
  const hasPhone = channels.some(ch => ch.phone);
  const hasIP = channels.some(ch => ch.ip);
  const hasMemo = channels.some(ch => ch.memo);

  return (
    <div style={{ paddingBottom: '20px' }}>
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
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>채널 관리</h1>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          style={{
            background: isEditing ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 
           isEditing ? <><Save size={16} /> 저장</> : <><Pencil size={16} /> 편집</>}
        </button>
      </div>

      {/* 통계 카드 */}
      <div style={{ padding: '0 24px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          <StatBadge label="브랜드" value={stats.totalBrands} color="#9B6BFF" />
          <StatBadge label="채널" value={stats.totalChannels} color="#6BC5FF" />
          <StatBadge label="YouTube" value={stats.youtube} color="#FF0000" />
          <StatBadge label="TikTok" value={stats.tiktok} color="#000000" />
          <StatBadge label="Instagram" value={stats.instagram} color="#E1306C" />
        </div>
      </div>

      {/* 필터 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '13px',
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
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '13px',
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
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} /> 새 채널
            </button>
          )}
        </div>
      </div>

      {/* 채널 테이블 */}
      <div style={{ padding: '0 24px', overflowX: 'auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          minWidth: '600px',
        }}>
          {/* 테이블 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `100px 80px 120px 100px 100px 150px 150px ${hasPhone ? '110px ' : ''}${hasIP ? '100px ' : ''}${hasMemo ? '100px ' : ''}${isEditing ? '50px' : ''}`,
            gap: '8px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>브랜드</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>플랫폼</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>채널명</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>아이디</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>비밀번호</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>이메일</div>
            <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>URL</div>
            {hasPhone && <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>폰번호</div>}
            {hasIP && <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>IP</div>}
            {hasMemo && <div style={{ color: '#B0B0B8', fontSize: '12px', fontWeight: '600' }}>메모</div>}
            {isEditing && <div></div>}
          </div>

          {/* 테이블 바디 */}
          {filteredChannels.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#B0B0B8',
            }}>
              {channels.length === 0 ? '등록된 채널이 없습니다. 편집 모드에서 새 채널을 추가하세요.' : '필터 조건에 맞는 채널이 없습니다.'}
            </div>
          ) : (
            filteredChannels.map((channel, index) => (
              <div
                key={channel.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `100px 80px 120px 100px 100px 150px 150px ${hasPhone ? '110px ' : ''}${hasIP ? '100px ' : ''}${hasMemo ? '100px ' : ''}${isEditing ? '50px' : ''}`,
                  gap: '8px',
                  padding: '12px 16px',
                  borderBottom: index < filteredChannels.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  alignItems: 'center',
                }}
              >
                {/* 브랜드 */}
                <div>
                  <span style={{
                    background: channel.brandColor || '#9B6BFF',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                  }}>
                    {channel.brand}
                  </span>
                </div>

                {/* 플랫폼 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {channel.platform === 'YouTube' && <Youtube size={14} color="#FF0000" />}
                  {channel.platform === 'TikTok' && <Music2 size={14} color="#000000" />}
                  {channel.platform === 'Instagram' && <Instagram size={14} color="#E1306C" />}
                  <span style={{ color: 'white', fontSize: '12px' }}>{channel.platform?.substring(0, 2)}</span>
                </div>

                {/* 채널명 */}
                {isEditing ? (
                  <input
                    value={channel.channelName || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'channelName', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: 'white', fontSize: '12px' }}>{channel.channelName}</div>
                )}

                {/* 아이디 */}
                {isEditing ? (
                  <input
                    value={channel.accountId || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'accountId', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{channel.accountId}</div>
                )}

                {/* 비밀번호 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={channel.password || ''}
                      onChange={(e) => handleFieldChange(channel.id, 'password', e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <>
                      <span style={{ color: '#B0B0B8', fontSize: '12px' }}>
                        {visiblePasswords[channel.id] ? channel.password : '••••••••'}
                      </span>
                      {channel.password && (
                        <button
                          onClick={() => togglePassword(channel.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            color: '#6B6B75',
                          }}
                        >
                          {visiblePasswords[channel.id] ? <EyeOff size={12} /> : <Eye size={12} />}
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
                  <div style={{ color: '#B0B0B8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.email}</div>
                )}

                {/* URL */}
                {isEditing ? (
                  <input
                    value={channel.channelUrl || ''}
                    onChange={(e) => handleFieldChange(channel.id, 'channelUrl', e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ color: '#6BC5FF', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {channel.channelUrl && (
                      <a href={channel.channelUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6BC5FF', textDecoration: 'none' }}>
                        {channel.channelUrl.substring(0, 20)}...
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
                    <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{channel.phone}</div>
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
                    <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{channel.ip}</div>
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
                    <div style={{ color: '#B0B0B8', fontSize: '12px' }}>{channel.memo}</div>
                  )
                )}

                {/* 삭제 버튼 */}
                {isEditing && (
                  <button
                    onClick={() => handleDelete(channel.id)}
                    style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      color: '#FF6B6B',
                    }}
                  >
                    <Trash2 size={14} />
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 인풋 스타일
const inputStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '6px',
  padding: '6px 8px',
  color: 'white',
  fontSize: '12px',
  width: '100%',
};

// ============================================
// 통계 배지 컴포넌트
// ============================================
function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: `${color}20`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#B0B0B8', fontSize: '12px' }}>{label}</span>
      <span style={{ color: color, fontSize: '16px', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

// ============================================
// 새 채널 추가 모달
// ============================================
function AddChannelModal({ brands, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    brand: '',
    brandColor: '#FF6B9D',
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
  const [isNewBrand, setIsNewBrand] = useState(false);

  const colorOptions = ['#FF6B9D', '#9B6BFF', '#6BC5FF', '#4CAF50', '#FF9800', '#E91E63'];

  const handleSubmit = () => {
    if (!formData.brand || !formData.channelName) {
      alert('브랜드명과 채널명은 필수입니다.');
      return;
    }
    onAdd(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1A1A2E',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>새 채널 추가</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#B0B0B8',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 브랜드 선택 */}
          <div>
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
              브랜드 *
            </label>
            {!isNewBrand && brands.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  style={{
                    ...inputStyle,
                    flex: 1,
                  }}
                >
                  <option value="">브랜드 선택</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsNewBrand(true)}
                  style={{
                    background: 'rgba(155, 107, 255, 0.2)',
                    border: '1px solid rgba(155, 107, 255, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#9B6BFF',
                    fontSize: '12px',
                    cursor: 'pointer',
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
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, brandColor: color })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: color,
                        border: formData.brandColor === color ? '3px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
                {brands.length > 0 && (
                  <button
                    onClick={() => setIsNewBrand(false)}
                    style={{
                      marginTop: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#6BC5FF',
                      fontSize: '12px',
                      cursor: 'pointer',
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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

          {/* 폰번호 */}
          <div>
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
              폰번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-0000-0000"
              style={inputStyle}
            />
          </div>

          {/* 메모 */}
          <div>
            <label style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
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
          marginTop: '24px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#B0B0B8',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
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
    <div style={{ paddingBottom: '20px' }}>
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
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>생산성 분석</h1>
      </div>

      {/* PES 점수 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(155, 107, 255, 0.2) 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 107, 157, 0.3)',
          textAlign: 'center',
        }}>
          <div style={{ color: '#B0B0B8', fontSize: '14px', marginBottom: '8px' }}>
            이번 달 PES (생산성 효율 점수)
          </div>
          <div style={{ color: 'white', fontSize: '48px', fontWeight: '700' }}>
            {latestMonth.pes}
          </div>
          <div style={{
            color: pesGrowth >= 0 ? '#4CAF50' : '#FF6B6B',
            fontSize: '14px',
            marginTop: '8px',
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
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '8px' }}>원본 → 업로드 비율</div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
              1 : {(latestMonth.uploads / latestMonth.contents).toFixed(1)}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ color: '#B0B0B8', fontSize: '12px', marginBottom: '8px' }}>콘텐츠당 평균 수익</div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
              ₩{Math.round(latestMonth.revenue / latestMonth.contents).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* PES 추이 차트 */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            📊 PES 추이
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <XAxis dataKey="month" tick={{ fill: '#B0B0B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#B0B0B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [value, 'PES']}
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="pes" fill="url(#pesGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="pesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6BC5FF" />
                    <stop offset="100%" stopColor="#9B6BFF" />
                  </linearGradient>
                </defs>
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
    { role: 'assistant', content: '안녕하세요! 크리에이터 대시보드 AI 어시스턴트예요. 채널 관리, 콘텐츠 전략, 수익 분석에 대해 물어보세요!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // 간단한 응답 (실제로는 AI API 연동 가능)
    setTimeout(() => {
      const responses = [
        '좋은 질문이에요! 멀티 플랫폼 운영 시 각 플랫폼의 알고리즘 특성을 이해하는 것이 중요해요.',
        '수익 극대화를 위해서는 콘텐츠 재활용 전략을 추천드려요. 하나의 원본으로 여러 포맷을 만들어보세요!',
        '채널 성장을 위해서는 일관된 업로드 스케줄과 시청자 참여가 핵심이에요.',
        '데이터를 보면 이번 달 생산성이 좋아지고 있어요. 현재 전략을 유지하시면 좋을 것 같아요!',
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
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>AI 어시스턴트</h1>
          <p style={{ color: '#B0B0B8', fontSize: '12px' }}>크리에이터 전략 상담</p>
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
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #FF6B9D 0%, #9B6BFF 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.5',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: 'rgba(255,255,255,0.1)',
              color: '#B0B0B8',
            }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
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
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #9B6BFF 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: 'white',
              cursor: 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.5 : 1,
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
