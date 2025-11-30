import React, { useState, useEffect, useCallback } from 'react';
import { THEME } from './config';
import { callBackend } from './api';

// 페이지 컴포넌트들
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import MyPage from './components/pages/MyPage';
import ChannelsPage from './components/pages/ChannelsPage';
import RevenuePage from './components/pages/RevenuePage';
import ContentsPage from './components/pages/ContentsPage';
import FreelancersPage from './components/pages/FreelancersPage';

// 상세 페이지 컴포넌트들
import RevenueDetailPage from './components/details/RevenueDetailPage';
import ProductivityDetailPage from './components/details/ProductivityDetailPage';

export default function App() {
  // ============================================
  // 상태 관리
  // ============================================
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  // 데이터 상태
  const [dashboardData, setDashboardData] = useState(null);
  const [channels, setChannels] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [contents, setContents] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [platformsAndChannels, setPlatformsAndChannels] = useState({ platforms: [], channels: [], brands: [], editors: [] });
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // ============================================
  // Google 로그인 처리
  // ============================================
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

  // ============================================
  // 데이터 로드
  // ============================================
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

  // ============================================
  // 초기화
  // ============================================
  useEffect(() => {
    // 저장된 로그인 정보 확인
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

    // Google 로그인 스크립트 로드
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

  // ============================================
  // 페이지 라우팅
  // ============================================
  const renderPage = () => {
    const commonProps = {
      spreadsheetId,
      onReload: () => loadAllData(spreadsheetId),
      platformsAndChannels
    };

    switch (currentPage) {
      case 'login':
        return <LoginPage isLoading={isLoading} error={error} googleLoaded={googleLoaded} onGoogleLogin={handleGoogleLogin} />;
      
      case 'dashboard':
        return <DashboardPage data={dashboardData} user={user} onNavigate={setCurrentPage} onLogout={handleLogout} onUpdateUserName={updateUserName} />;
      
      case 'mypage':
        return <MyPage onNavigate={setCurrentPage} onBack={() => setCurrentPage('dashboard')} />;
      
      case 'channels':
        return <ChannelsPage channels={channels} onBack={() => setCurrentPage('mypage')} {...commonProps} />;
      
      case 'revenue':
        return <RevenuePage revenues={revenues} expenses={expenses} onBack={() => setCurrentPage('mypage')} {...commonProps} />;
      
      case 'contents':
        return <ContentsPage contents={contents} onBack={() => setCurrentPage('mypage')} {...commonProps} />;
      
      case 'freelancers':
        return <FreelancersPage freelancers={freelancers} onBack={() => setCurrentPage('mypage')} {...commonProps} />;
      
      // 상세 페이지들
      case 'revenueDetail':
        return <RevenueDetailPage data={dashboardData} revenues={revenues} expenses={expenses} onBack={() => setCurrentPage('dashboard')} />;
      
      case 'productivityDetail':
        return <ProductivityDetailPage data={dashboardData} contents={contents} onBack={() => setCurrentPage('dashboard')} />;
      
      default:
        return <LoginPage isLoading={isLoading} error={error} googleLoaded={googleLoaded} onGoogleLogin={handleGoogleLogin} />;
    }
  };

  // ============================================
  // 렌더링
  // ============================================
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
