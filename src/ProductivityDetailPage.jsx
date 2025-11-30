import React from 'react';
import { THEME } from '../../config';
import { formatCurrency } from '../../api';
import { PageHeader, Footer } from '../common';

export default function ProductivityDetailPage({ data, contents, onBack }) {
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
