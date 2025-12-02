import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { CONFIG, THEME } from './config';
import { callBackend } from './api';;

export default function LoginPage({ isLoading, error, googleLoaded, onGoogleLogin }) {
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
        
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px', marginBottom: '24px', color: '#DC2626', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}
        
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', color: THEME.textSecondary }}>
            <Loader2 size={24} color={THEME.accent1} style={{ animation: 'spin 1s linear infinite' }} />
            <span>로그인 중...</span>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <div id="google-login-button" style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }} />
            {!googleLoaded && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: THEME.textMuted }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Google 로그인 로딩 중...
              </div>
            )}
          </div>
        )}
        
        <div style={{ background: THEME.bgTertiary, borderRadius: '12px', padding: '16px' }}>
          <p style={{ color: THEME.textSecondary, fontSize: '13px', margin: 0 }}>
            🔒 로그인하면 <strong>본인의 Google Drive</strong>에 데이터가 안전하게 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
