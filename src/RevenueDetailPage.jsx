import React from 'react';
import { THEME } from '../../config';
import { formatCurrency } from '../../api';
import { PageHeader, Footer } from '../common';

export default function RevenueDetailPage({ data, revenues, expenses, onBack }) {
  if (!data) return null;

  const monthlyData = [];
  for (let m = 1; m <= 12; m++) {
    const rev = revenues.filter(r => r.year == data.year && r.month == m).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const exp = expenses.filter(e => e.year == data.year && e.month == m).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    monthlyData.push({ month: m, revenue: rev, expense: exp, net: rev - exp });
  }

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="수익 상세" onBack={onBack} />

      {/* 연간 요약 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, borderRadius: '20px', padding: '24px', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{data.year}년 연간 순수익</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>{formatCurrency(data.netRevenue)}</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '12px', opacity: 0.7 }}>총 수익</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(data.totalRevenue)}</div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.7 }}>총 지출</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(data.totalExpense)}</div></div>
          </div>
        </div>
      </div>

      {/* 월별 테이블 */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ background: THEME.bgSecondary, borderRadius: '20px', padding: '20px', boxShadow: THEME.shadow }}>
          <h3 style={{ color: THEME.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📊 월별 수익/지출</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.bgTertiary}` }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', color: THEME.textSecondary }}>월</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>수익</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>지출</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', color: THEME.textSecondary }}>순수익</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} style={{ borderBottom: `1px solid ${THEME.bgTertiary}` }}>
                    <td style={{ padding: '12px 8px', color: THEME.textPrimary, fontWeight: '500' }}>{row.month}월</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: THEME.accent1 }}>{formatCurrency(row.revenue)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: THEME.danger }}>{formatCurrency(row.expense)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: row.net >= 0 ? THEME.accent4 : THEME.danger, fontWeight: '600' }}>{formatCurrency(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
