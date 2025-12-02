import React from 'react';
import { Users, Wallet, FileText, UserCheck, ChevronRight } from 'lucide-react';
import { THEME } from './config';
import { Footer, PageHeader } from './common';
import { callBackend } from './api';

export default function MyPage({ onNavigate, onBack }) {
  const menuItems = [
    { id: 'channels', icon: <Users size={24} />, label: '채널 관리', desc: '브랜드별 채널 정보 관리', color: THEME.accent1 },
    { id: 'revenue', icon: <Wallet size={24} />, label: '수익/지출 관리', desc: '월별 수익과 지출 기록', color: THEME.accent4 },
    { id: 'contents', icon: <FileText size={24} />, label: '콘텐츠 제작 관리', desc: '제작 현황 및 일정 관리', color: THEME.accent2 },
    { id: 'freelancers', icon: <UserCheck size={24} />, label: '외주 관리', desc: '편집자 정보 및 비용 관리', color: THEME.accent5 },
  ];

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="마이페이지" onBack={onBack} />

      <div style={{ padding: '0 24px' }}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onNavigate(item.id)} 
            style={{ 
              background: THEME.bgSecondary, 
              borderRadius: '16px', 
              padding: '20px', 
              marginBottom: '12px', 
              cursor: 'pointer', 
              boxShadow: THEME.shadow, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              transition: 'transform 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              {item.icon}
            </div>
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
