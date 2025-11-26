import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Youtube, Instagram, Music2, TrendingUp, DollarSign, Video, ChevronDown, Plus, Sparkles, ArrowLeft, Target, Zap, PieChart as PieIcon, MessageCircle, Send, Loader2 } from 'lucide-react';

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
  const [userData, setUserData] = useState(null);

  // 샘플 데이터
  const sampleData = {
    userName: '새롬',
    period: '2024년 11월',
    channels: [
      { name: '로미네', platform: 'youtube', videos: 12, uploads: 12, revenue: 250000, color: '#FF6B9D' },
      { name: '히든셀럽', platform: 'youtube', videos: 8, uploads: 8, revenue: 150000, color: '#9B6BFF' },
      { name: '쇼핑채널', platform: 'youtube', videos: 4, uploads: 4, revenue: 45000, color: '#6BC5FF' },
    ],
    platforms: [
      { name: 'YouTube', uploads: 24, revenue: 445000, color: '#FF6B9D' },
      { name: 'TikTok', uploads: 18, revenue: 35000, color: '#6BC5FF' },
      { name: 'Instagram', uploads: 20, revenue: 25000, color: '#9B6BFF' },
    ],
    originalContents: 10,
    totalUploads: 62,
    activePlatforms: 3,
    monthlyData: [
      { month: '7월', revenue: 380000, contents: 8, uploads: 45, pes: 10.2 },
      { month: '8월', revenue: 420000, contents: 9, uploads: 52, pes: 12.1 },
      { month: '9월', revenue: 395000, contents: 8, uploads: 48, pes: 11.5 },
      { month: '10월', revenue: 450000, contents: 10, uploads: 58, pes: 13.8 },
      { month: '11월', revenue: 505000, contents: 10, uploads: 62, pes: 14.2 },
    ],
  };

  const handleLogin = () => {
    setUserData(sampleData);
    setCurrentPage('dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F8 0%, #F5F0FF 50%, #F0F8FF 100%)',
    }}>
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      {currentPage === 'dashboard' && userData && (
        <MainDashboard 
          data={userData} 
          onNavigate={setCurrentPage} 
        />
      )}
      {currentPage === 'productivity' && userData && (
        <ProductivityReport 
          data={userData} 
          onNavigate={setCurrentPage} 
        />
      )}
    </div>
  );
}

// ============================================
// 로그인 페이지
// ============================================
function LoginPage({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          maxWidth: '400px',
          width: '100%',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FF6B9D 0%, #9B6BFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Sparkles size={40} color="white" />
          </div>
          
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2D3A', margin: '0 0 12px 0' }}>
            크리에이터 대시보드
          </h1>
          <p style={{ color: '#8E8E9A', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            내 채널 성과와 생산성을<br />한눈에 확인하세요
          </p>
          
          <button 
            onClick={onLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '16px 24px',
              background: 'white',
              border: '2px solid #E8E8E8',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2D2D3A',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6B9D';
              e.currentTarget.style.background = '#FFF5F8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E8E8';
              e.currentTarget.style.background = 'white';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
          
          <p style={{ color: '#B0B0B8', fontSize: '12px', marginTop: '24px' }}>
            내 데이터는 내 Google Drive에만 저장됩니다
          </p>
        </div>
      </div>
      
      {/* 로그인 페이지 하단 광고 */}
           <Footer pageKey="login" />
    </div>
  );
}

// ============================================
// 1페이지: 메인 대시보드
// ============================================
function MainDashboard({ data, onNavigate }) {
  const [selectedPeriod] = useState('이번 달');
  
  const totalRevenue = data.platforms.reduce((sum, p) => sum + p.revenue, 0);
  const totalUploads = data.platforms.reduce((sum, p) => sum + p.uploads, 0);
  const crr = totalRevenue / data.originalContents;
  const mui = totalUploads / data.originalContents;
  const pes = (crr * mui / 10000).toFixed(1);
  const pesChange = '+12%';

  const formatCurrency = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만원';
    return num.toLocaleString() + '원';
  };

  const PlatformIcon = ({ platform }) => {
    switch(platform) {
      case 'youtube': return <Youtube size={18} />;
      case 'instagram': return <Instagram size={18} />;
      case 'tiktok': return <Music2 size={18} />;
      default: return <Video size={18} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#2D2D3A',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Sparkles size={28} color="#FF6B9D" />
              크리에이터 대시보드
            </h1>
            <p style={{ color: '#8E8E9A', margin: '8px 0 0 0', fontSize: '14px' }}>
              안녕하세요, {data.userName}님! 오늘도 화이팅 💪
            </p>
          </div>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'white',
            border: '2px solid #EEE',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#2D2D3A',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {selectedPeriod}
            <ChevronDown size={16} />
          </button>
        </div>

        {/* 요약 카드 3개 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {/* 업로드 카드 */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#FFF0F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Video size={24} color="#FF6B9D" />
            </div>
            <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 6px 0' }}>이번 달 업로드</p>
            <p style={{ color: '#2D2D3A', fontSize: '28px', fontWeight: '700', margin: 0 }}>{totalUploads}개</p>
          </div>

          {/* 생산성 카드 (클릭 가능) */}
          <div 
            onClick={() => onNavigate('productivity')}
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #9B6BFF 100%)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(255,107,157,0.3)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,157,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,157,0.3)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
            }} />
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Target size={24} color="white" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 6px 0' }}>총 생산성</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>{pes}점</p>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'white',
                fontWeight: '600',
              }}>
                {pesChange} ↗
              </span>
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '11px', 
              margin: '12px 0 0 0',
            }}>
              클릭해서 상세 분석 보기 →
            </p>
          </div>

          {/* 수익 카드 */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#F0F8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <DollarSign size={24} color="#6BC5FF" />
            </div>
            <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 6px 0' }}>예상 수익</p>
            <p style={{ color: '#2D2D3A', fontSize: '28px', fontWeight: '700', margin: 0 }}>{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* 하단 섹션 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {/* 채널별 성과 */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: 0 }}>
                📺 채널별 성과
              </h2>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#FF6B9D',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '500',
                color: 'white',
                cursor: 'pointer',
              }}>
                <Plus size={14} />
                채널 추가
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.channels.map((channel, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#FAFAFA',
                  borderRadius: '14px',
                  gap: '14px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: channel.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: channel.color,
                    flexShrink: 0,
                  }}>
                    <PlatformIcon platform={channel.platform} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', color: '#2D2D3A', margin: '0 0 4px 0', fontSize: '14px' }}>
                      {channel.name}
                    </p>
                    <p style={{ color: '#8E8E9A', margin: 0, fontSize: '12px' }}>
                      영상 {channel.videos}개
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: '700', color: channel.color, margin: 0, fontSize: '16px' }}>
                      {formatCurrency(channel.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 플랫폼별 수익 */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: '0 0 20px 0' }}>
              💰 플랫폼별 수익
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.platforms}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="revenue"
                    >
                      {data.platforms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ flex: 1, minWidth: '150px' }}>
                {data.platforms.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < data.platforms.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: item.color,
                        flexShrink: 0,
                      }} />
                      <span style={{ color: '#2D2D3A', fontSize: '14px' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#2D2D3A', fontSize: '14px' }}>
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 월별 추이 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: '0 0 20px 0' }}>
            📈 월별 수익 추이
          </h2>
          
          <div style={{ height: '200px' }}>
            <ResponsiveContainer>
              <BarChart data={data.monthlyData} barSize={32}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8E8E9A', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8E8E9A', fontSize: 12 }}
                  tickFormatter={(value) => (value / 10000) + '만'}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '수익']}
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B9D" />
                    <stop offset="100%" stopColor="#9B6BFF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 대시보드 하단 광고 */}
            <Footer pageKey="login" />
    </div>
  );
}

// ============================================
// 2페이지: 생산성 리포트
// ============================================
function ProductivityReport({ data, onNavigate }) {
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const totalRevenue = data.platforms.reduce((sum, p) => sum + p.revenue, 0);
  const totalUploads = data.platforms.reduce((sum, p) => sum + p.uploads, 0);
  
  const C = data.originalContents;
  const U = totalUploads;
  const P = data.activePlatforms;
  const R = totalRevenue;

  const CRR = R / C;
  const MUI = U / C;
  const PUR = (U / (C * P)) * 100;
  const RPU = R / U;
  const PES = ((R / C) * (U / C) / 10000).toFixed(1);

  const platformRPU = data.platforms.map(p => ({
    ...p,
    rpu: p.revenue / p.uploads,
  })).sort((a, b) => b.rpu - a.rpu);

  const bestPlatform = platformRPU[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAiResponse({
        diagnosis: `${data.userName}님, 콘텐츠 퀄리티가 정말 좋아요! 영상 하나당 ${Math.round(CRR/10000)}만원이나 벌고 계시잖아요. 플랫폼 활용률이 ${PUR.toFixed(0)}%로 거의 최대치를 뽑고 계세요. 이 페이스 유지하면서 생산량만 늘리면 수익도 함께 늘어날 거예요!`,
        recommendation: `편집 외주를 통해 월 생산량을 15개로 늘려보세요. 현재 효율이라면 수익이 75만원까지 올라갈 수 있어요!`,
      });
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const sendChatMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    setTimeout(() => {
      let aiReply = `좋은 질문이에요! 현재 생산성 점수 ${PES}점을 기준으로 보면, 가장 중요한 건 '같은 노력으로 더 많은 수익'을 만드는 거예요.`;
      
      if (userMessage.includes('틱톡') || userMessage.includes('TikTok')) {
        aiReply = `틱톡은 현재 업로드당 ${Math.round(platformRPU.find(p => p.name === 'TikTok')?.rpu || 0).toLocaleString()}원 정도예요. 수익은 유튜브보다 낮지만, 노출과 팔로워 확보에는 최고죠! 틱톡에서 바이럴 되면 유튜브 구독자도 함께 늘어나요.`;
      } else if (userMessage.includes('유튜브') || userMessage.includes('YouTube')) {
        aiReply = `유튜브가 역시 수익 효율이 가장 좋아요! 업로드당 ${Math.round(platformRPU.find(p => p.name === 'YouTube')?.rpu || 0).toLocaleString()}원으로 다른 플랫폼의 몇 배예요. Shorts도 함께 활용하시면 좋아요!`;
      } else if (userMessage.includes('외주') || userMessage.includes('편집')) {
        aiReply = `현재 생산성이 좋으니까, 편집 외주 맡기면 거의 2배 생산이 가능해요. 영상당 5-10만원 외주비가 들어도 충분히 수익이 나는 구조예요!`;
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
      setIsChatLoading(false);
    }, 1000);
  };

  const formatCurrency = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만원';
    return Math.round(num).toLocaleString() + '원';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <button 
            onClick={() => onNavigate('dashboard')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} color="#2D2D3A" />
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2D2D3A',
              margin: 0,
            }}>
              🎯 생산성 리포트
            </h1>
            <p style={{ color: '#8E8E9A', margin: '4px 0 0 0', fontSize: '14px' }}>
              {data.period} 분석 결과
            </p>
          </div>
        </div>

        {/* AI 진단 박스 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '28px',
          marginBottom: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }} />
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '16px',
            }}>
              <Sparkles size={24} />
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {data.userName}님을 위한 AI 진단
              </h2>
            </div>
            
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>분석 중...</span>
              </div>
            ) : (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: 1.7, 
                  margin: '0 0 20px 0',
                  opacity: 0.95,
                }}>
                  {aiResponse?.diagnosis}
                </p>
                
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <Zap size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>추천 액션</p>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                      {aiResponse?.recommendation}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 생산 흐름 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: '0 0 20px 0' }}>
            📦 이번 달 생산 흐름
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px 24px',
              background: '#FF6B9D10',
              borderRadius: '16px',
              minWidth: '100px',
            }}>
              <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 8px 0' }}>원본 영상</p>
              <p style={{ color: '#FF6B9D', fontSize: '24px', fontWeight: '700', margin: 0 }}>{C}개</p>
            </div>
            
            <span style={{ fontSize: '24px', color: '#DDD' }}>→</span>
            
            <div style={{
              textAlign: 'center',
              padding: '20px 24px',
              background: '#9B6BFF10',
              borderRadius: '16px',
              minWidth: '100px',
            }}>
              <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 8px 0' }}>총 업로드</p>
              <p style={{ color: '#9B6BFF', fontSize: '24px', fontWeight: '700', margin: 0 }}>{U}회</p>
            </div>
            
            <span style={{ fontSize: '24px', color: '#DDD' }}>→</span>
            
            <div style={{
              textAlign: 'center',
              padding: '20px 24px',
              background: '#6BC5FF10',
              borderRadius: '16px',
              minWidth: '100px',
            }}>
              <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 8px 0' }}>총 수익</p>
              <p style={{ color: '#6BC5FF', fontSize: '24px', fontWeight: '700', margin: 0 }}>{formatCurrency(R)}</p>
            </div>
          </div>
        </div>

        {/* 지표 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {[
            { label: '콘텐츠당 수익', value: formatCurrency(CRR), sub: 'CRR', color: '#FF6B9D', Icon: DollarSign },
            { label: '멀티유즈 지수', value: MUI.toFixed(1) + '배', sub: 'MUI', color: '#9B6BFF', Icon: Zap },
            { label: '플랫폼 활용률', value: PUR.toFixed(0) + '%', sub: 'PUR', color: '#6BC5FF', Icon: PieIcon },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <span style={{
                  background: item.color + '20',
                  color: item.color,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  {item.sub}
                </span>
                <item.Icon size={20} color={item.color} />
              </div>
              <p style={{ color: '#8E8E9A', fontSize: '13px', margin: '0 0 6px 0' }}>{item.label}</p>
              <p style={{ color: '#2D2D3A', fontSize: '24px', fontWeight: '700', margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 플랫폼별 효율 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: '0 0 20px 0' }}>
            📊 플랫폼별 효율 비교
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {platformRPU.map((platform, i) => {
              const maxRPU = platformRPU[0].rpu;
              const widthPercent = (platform.rpu / maxRPU) * 100;
              
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ 
                    width: '80px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#2D2D3A',
                    flexShrink: 0,
                  }}>
                    {platform.name}
                  </span>
                  <div style={{ 
                    flex: 1, 
                    height: '32px', 
                    background: '#F5F5F5', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    minWidth: '100px',
                  }}>
                    <div style={{
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${platform.color}, ${platform.color}99)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '12px',
                      minWidth: 'fit-content',
                    }}>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {formatCurrency(platform.rpu)}/업로드
                      </span>
                    </div>
                  </div>
                  {i === 0 && (
                    <span style={{
                      background: '#FFD700',
                      color: '#000',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      ⭐ 최고
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 채팅 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <MessageCircle size={20} color="#9B6BFF" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2D3A', margin: 0 }}>
              AI에게 더 물어보기
            </h3>
          </div>
          
          <div style={{
            minHeight: '120px',
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '16px',
            background: '#FAFAFA',
            borderRadius: '14px',
          }}>
            {chatMessages.length === 0 ? (
              <p style={{ color: '#B0B0B8', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>
                생산성에 대해 궁금한 점을 물어보세요!<br />
                예: "틱톡 수익을 높이려면?"
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B9D, #9B6BFF)' : 'white',
                      color: msg.role === 'user' ? 'white' : '#2D2D3A',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div style={{ display: 'flex', gap: '4px', padding: '12px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DDD', animation: 'pulse 1s infinite' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DDD', animation: 'pulse 1s infinite 0.2s' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DDD', animation: 'pulse 1s infinite 0.4s' }} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="질문을 입력하세요..."
              style={{
                flex: 1,
                padding: '14px 18px',
                border: '2px solid #EEE',
                borderRadius: '14px',
                fontSize: '14px',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#9B6BFF'}
              onBlur={(e) => e.target.style.borderColor = '#EEE'}
            />
            <button
              onClick={sendChatMessage}
              disabled={isChatLoading}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF6B9D, #9B6BFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isChatLoading ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={20} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* 생산성 리포트 하단 광고 */}
            <Footer pageKey="login" />
    </div>
  );
}
