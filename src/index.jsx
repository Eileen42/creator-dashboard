import React from 'react';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { THEME } from '../config';

// ============================================
// 페이지 헤더
// ============================================
export function PageHeader({ title, onBack, onAdd, addLabel = '추가' }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: THEME.bgSecondary, border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', boxShadow: THEME.shadow }}>
          <ArrowLeft size={20} color={THEME.textSecondary} />
        </button>
        <h1 style={{ color: THEME.textPrimary, fontSize: '22px', fontWeight: '700' }}>{title}</h1>
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} />{addLabel}
        </button>
      )}
    </div>
  );
}

// ============================================
// 빈 상태
// ============================================
export function EmptyState({ icon, title, desc }) {
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

// ============================================
// 요약 카드
// ============================================
export function SummaryCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '18px', boxShadow: THEME.shadow }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color }}>{icon}</div>
      <div style={{ color: THEME.textSecondary, fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: THEME.textPrimary, fontSize: '20px', fontWeight: '700' }}>{value}<span style={{ fontSize: '14px', fontWeight: '500', color: THEME.textSecondary }}> {unit}</span></div>
    </div>
  );
}

// ============================================
// 푸터
// ============================================
export function Footer() {
  return <div style={{ textAlign: 'center', padding: '16px 24px 32px', color: THEME.textMuted, fontSize: '12px' }}>Made with 💜 for Creators</div>;
}

// ============================================
// 모달 래퍼
// ============================================
export function ModalWrapper({ title, onClose, children }) {
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

// ============================================
// 로딩 스피너
// ============================================
export function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color={THEME.accent1} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// ============================================
// 공통 스타일
// ============================================
export const inputStyle = { 
  background: '#F3F4F6', 
  border: '1px solid #E5E7EB', 
  borderRadius: '10px', 
  padding: '12px 14px', 
  fontSize: '14px', 
  width: '100%', 
  color: '#1A1D26' 
};

export const labelStyle = { 
  color: '#6B7280', 
  fontSize: '13px', 
  marginBottom: '6px', 
  display: 'block', 
  fontWeight: '500' 
};
