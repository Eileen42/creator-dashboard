import React, { useState } from 'react';
import { Video, TrendingUp, FileText, Plus, Pencil, LogOut, Settings, ChevronRight } from 'lucide-react';
import { THEME } from './config';
import { formatCurrency } from './api';
import { Footer, SummaryCard, LoadingSpinner } from './common';

export default function DashboardPage({ data, user, onNavigate, onLogout, onUpdateUserName }) {
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  if (!data) return <LoadingSpinner />;

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

      {/* 이번 달 수익 카드 */}
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

      {/* 생산성 카드 */}
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

      {/* 데이터 없을 때 */}
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
