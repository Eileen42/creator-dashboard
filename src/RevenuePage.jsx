import React, { useState, useEffect } from 'react';
import { Trash2, Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { THEME } from '../../config';
import { callBackend, formatCurrency, formatDate } from '../../api';
import { PageHeader, Footer } from '../common';

export default function RevenuePage({ revenues, expenses, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [tab, setTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  
  const platforms = platformsAndChannels?.platforms || [];
  const channels = platformsAndChannels?.channels || [];

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear, spreadsheetId]);

  const loadDashboardData = async () => {
    const result = await callBackend('getRevenueDashboard', { spreadsheetId, year: selectedYear });
    if (result.success) setDashboardData(result);
  };

  const tabStyle = (active, color) => ({
    padding: '12px 20px', border: 'none', borderRadius: '12px',
    background: active ? THEME.bgSecondary : 'transparent',
    color: active ? color : THEME.textSecondary,
    fontWeight: '600', cursor: 'pointer', fontSize: '14px',
    boxShadow: active ? THEME.shadow : 'none', transition: 'all 0.2s'
  });

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <PageHeader title="수익/지출 관리" onBack={onBack} />

      <div style={{ padding: '0 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: THEME.bgTertiary, borderRadius: '14px', padding: '4px', gap: '4px' }}>
            <button onClick={() => setTab('dashboard')} style={tabStyle(tab === 'dashboard', THEME.accent1)}>📊 대시보드</button>
            <button onClick={() => setTab('revenue')} style={tabStyle(tab === 'revenue', THEME.accent4)}>💰 수익 입력</button>
            <button onClick={() => setTab('expense')} style={tabStyle(tab === 'expense', THEME.danger)}>💸 지출 입력</button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color={THEME.textMuted} />
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontWeight: '600' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>
        </div>
      </div>

      {tab === 'dashboard' && <DashboardTab data={dashboardData} year={selectedYear} />}
      {tab === 'revenue' && <RevenueInputTab revenues={revenues.filter(r => r.year == selectedYear)} spreadsheetId={spreadsheetId} onReload={() => { onReload(); loadDashboardData(); }} platforms={platforms} channels={channels} year={selectedYear} />}
      {tab === 'expense' && <ExpenseInputTab expenses={expenses.filter(e => e.year == selectedYear)} spreadsheetId={spreadsheetId} onReload={() => { onReload(); loadDashboardData(); }} year={selectedYear} />}

      <Footer />
    </div>
  );
}

function DashboardTab({ data, year }) {
  if (!data) return <div style={{ padding: '48px 24px', textAlign: 'center', color: THEME.textMuted }}>로딩 중...</div>;

  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const cellStyle = { padding: '10px 8px', textAlign: 'right', fontSize: '13px', borderBottom: `1px solid ${THEME.bgTertiary}`, whiteSpace: 'nowrap' };
  const headerCellStyle = { ...cellStyle, background: THEME.bgTertiary, fontWeight: '600', color: THEME.textSecondary, textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 };
  const labelCellStyle = { ...cellStyle, textAlign: 'left', fontWeight: '600', color: THEME.textPrimary, background: THEME.bgPrimary, position: 'sticky', left: 0, zIndex: 1 };

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SummaryCard icon={<TrendingUp size={24} />} label="총 매출합계" value={formatCurrency(data.yearlyRevenue)} color={THEME.accent1} />
        <SummaryCard icon={<TrendingDown size={24} />} label="총 지출합계" value={formatCurrency(data.yearlyExpense)} color={THEME.danger} />
        <SummaryCard icon={<DollarSign size={24} />} label="연간 순수익" value={formatCurrency(data.yearlyNetRevenue)} color={data.yearlyNetRevenue >= 0 ? THEME.accent4 : THEME.danger} />
      </div>

      <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.bgTertiary}` }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: THEME.textPrimary }}>📈 월별 추이</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead><tr><th style={{ ...headerCellStyle, textAlign: 'left', minWidth: '120px' }}>항목</th>{months.map(m => <th key={m} style={{ ...headerCellStyle, minWidth: '80px' }}>{m}월</th>)}</tr></thead>
            <tbody>
              <tr><td style={{ ...labelCellStyle, background: `${THEME.accent1}10` }}>💰 총 매출합계</td>{months.map(m => <td key={m} style={{ ...cellStyle, color: THEME.accent1, fontWeight: '600' }}>{formatCurrency(data.monthlyTotals[m] || 0)}</td>)}</tr>
              <tr><td style={{ ...labelCellStyle, background: `${THEME.accent4}10` }}>📊 월별 순수익</td>{months.map(m => { const net = data.netRevenueByMonth[m] || 0; return <td key={m} style={{ ...cellStyle, color: net >= 0 ? THEME.accent4 : THEME.danger, fontWeight: '600' }}>{formatCurrency(net)}</td>; })}</tr>
              <tr><td style={{ ...labelCellStyle, background: `${THEME.danger}10` }}>💸 월별 인건비</td>{months.map(m => <td key={m} style={{ ...cellStyle, color: THEME.danger }}>{formatCurrency(data.expenseByMonth[m] || 0)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.bgTertiary}` }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: THEME.textPrimary }}>💰 플랫폼/채널별 수익</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead><tr><th style={{ ...headerCellStyle, textAlign: 'left', minWidth: '80px' }}>플랫폼</th><th style={{ ...headerCellStyle, textAlign: 'left', minWidth: '100px' }}>채널</th>{months.map(m => <th key={m} style={{ ...headerCellStyle, minWidth: '80px' }}>{m}월</th>)}</tr></thead>
            <tbody>
              {data.platforms.map((platform) => {
                const platformChannels = data.channelsByPlatform[platform] || [];
                const platformTotal = data.platformTotals[platform] || {};
                return (
                  <React.Fragment key={platform}>
                    {platformChannels.map((channel, cIdx) => {
                      const channelData = data.revenueData[platform]?.[channel] || {};
                      return (
                        <tr key={`${platform}-${channel}`}>
                          {cIdx === 0 && <td rowSpan={platformChannels.length + 1} style={{ ...labelCellStyle, verticalAlign: 'top', background: `${THEME.accent1}05` }}>{platform}</td>}
                          <td style={{ ...cellStyle, textAlign: 'left', color: THEME.textSecondary }}>{channel}</td>
                          {months.map(m => <td key={m} style={{ ...cellStyle, color: channelData[m] ? THEME.textPrimary : THEME.textMuted }}>{channelData[m] ? formatCurrency(channelData[m]) : '-'}</td>)}
                        </tr>
                      );
                    })}
                    {platformChannels.length > 0 && (
                      <tr style={{ background: `${THEME.accent1}08` }}>
                        <td style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color: THEME.accent1 }}>TOTAL</td>
                        {months.map(m => <td key={m} style={{ ...cellStyle, fontWeight: '600', color: THEME.accent1 }}>{platformTotal[m] ? formatCurrency(platformTotal[m]) : '-'}</td>)}
                      </tr>
                    )}
                    {platformChannels.length === 0 && (
                      <tr><td style={{ ...labelCellStyle, background: `${THEME.accent1}05` }}>{platform}</td><td style={{ ...cellStyle, textAlign: 'left', color: THEME.textMuted }}>-</td>{months.map(m => <td key={m} style={{ ...cellStyle, color: THEME.textMuted }}>-</td>)}</tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueInputTab({ revenues, spreadsheetId, onReload, platforms, channels, year }) {
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState({ month: new Date().getMonth() + 1, platform: '', channelName: '', amount: '' });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const months = [...Array(12)].map((_, i) => i + 1);

  const handleSave = async (data) => {
    if (!data.platform || !data.amount) return;
    setIsLoading(true);
    await callBackend('saveRevenue', { spreadsheetId, revenueData: { ...data, year, amount: Number(data.amount) } });
    await onReload();
    setNewRow({ month: new Date().getMonth() + 1, platform: '', channelName: '', amount: '' });
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    setIsLoading(true);
    await callBackend('deleteRevenue', { spreadsheetId, revenueId: id });
    await onReload();
    setIsLoading(false);
  };

  const startEdit = (id, field, value) => { setEditingCell({ id, field }); setEditValue(value); };
  const finishEdit = async () => {
    if (!editingCell) return;
    setIsLoading(true);
    const item = revenues.find(r => r.id === editingCell.id);
    if (item) {
      const updated = { ...item, [editingCell.field]: editingCell.field === 'amount' ? Number(editValue) : editValue };
      await callBackend('saveRevenue', { spreadsheetId, revenueData: updated });
    }
    await onReload();
    setEditingCell(null); setEditValue('');
    setIsLoading(false);
  };

  const cellStyle = { padding: '10px 12px', borderBottom: `1px solid ${THEME.bgTertiary}`, fontSize: '14px', color: THEME.textPrimary };
  const headerCellStyle = { ...cellStyle, background: THEME.bgTertiary, fontWeight: '600', color: THEME.textSecondary, fontSize: '13px', position: 'sticky', top: 0, zIndex: 1 };
  const inputStyle = { width: '100%', border: 'none', background: 'transparent', fontSize: '14px', color: THEME.textPrimary, outline: 'none', padding: 0 };

  const totalByMonth = {};
  months.forEach(m => { totalByMonth[m] = revenues.filter(r => r.month == m).reduce((sum, r) => sum + (Number(r.amount) || 0), 0); });

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '8px' }}>
        {months.map(m => (
          <div key={m} style={{ background: THEME.bgSecondary, borderRadius: '10px', padding: '12px 16px', minWidth: '80px', textAlign: 'center', boxShadow: THEME.shadow, border: m === new Date().getMonth() + 1 ? `2px solid ${THEME.accent1}` : 'none' }}>
            <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>{m}월</div>
            <div style={{ color: totalByMonth[m] > 0 ? THEME.accent1 : THEME.textMuted, fontWeight: '600', fontSize: '13px' }}>{totalByMonth[m] > 0 ? formatCurrency(totalByMonth[m]) : '-'}</div>
          </div>
        ))}
      </div>

      <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead><tr><th style={{ ...headerCellStyle, width: '80px' }}>월</th><th style={{ ...headerCellStyle, width: '140px' }}>플랫폼</th><th style={{ ...headerCellStyle, width: '160px' }}>채널명</th><th style={{ ...headerCellStyle, width: '140px', textAlign: 'right' }}>금액</th><th style={{ ...headerCellStyle, width: '60px' }}></th></tr></thead>
            <tbody>
              {revenues.sort((a, b) => a.month - b.month || a.platform.localeCompare(b.platform)).map((r) => (
                <tr key={r.id} style={{ transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = THEME.bgPrimary} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}>{r.month}월</td>
                  <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => startEdit(r.id, 'platform', r.platform)}>
                    {editingCell?.id === r.id && editingCell?.field === 'platform' ? <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={finishEdit} autoFocus style={{ ...inputStyle, cursor: 'pointer' }}>{platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select> : r.platform}
                  </td>
                  <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => startEdit(r.id, 'channelName', r.channelName)}>
                    {editingCell?.id === r.id && editingCell?.field === 'channelName' ? <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={finishEdit} onKeyPress={(e) => e.key === 'Enter' && finishEdit()} autoFocus style={inputStyle} /> : (r.channelName || '-')}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', cursor: 'pointer', color: THEME.accent1, fontWeight: '600' }} onClick={() => startEdit(r.id, 'amount', r.amount)}>
                    {editingCell?.id === r.id && editingCell?.field === 'amount' ? <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={finishEdit} onKeyPress={(e) => e.key === 'Enter' && finishEdit()} autoFocus style={{ ...inputStyle, textAlign: 'right' }} /> : formatCurrency(r.amount)}
                  </td>
                  <td style={cellStyle}><button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.5 }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}><Trash2 size={16} color={THEME.danger} /></button></td>
                </tr>
              ))}
              <tr style={{ background: `${THEME.accent4}08` }}>
                <td style={cellStyle}><select value={newRow.month} onChange={(e) => setNewRow({ ...newRow, month: Number(e.target.value) })} style={{ ...inputStyle, cursor: 'pointer', color: THEME.textSecondary }}>{months.map(m => <option key={m} value={m}>{m}월</option>)}</select></td>
                <td style={cellStyle}><select value={newRow.platform} onChange={(e) => setNewRow({ ...newRow, platform: e.target.value, channelName: '' })} style={{ ...inputStyle, cursor: 'pointer', color: newRow.platform ? THEME.textPrimary : THEME.textMuted }}><option value="">플랫폼 선택</option>{platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></td>
                <td style={cellStyle}><select value={newRow.channelName} onChange={(e) => setNewRow({ ...newRow, channelName: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', color: newRow.channelName ? THEME.textPrimary : THEME.textMuted }}><option value="">채널 선택</option>{channels.filter(c => c.platform === newRow.platform).map(c => <option key={c.id} value={c.channelName}>{c.channelName}</option>)}</select></td>
                <td style={cellStyle}><input type="number" placeholder="금액 입력" value={newRow.amount} onChange={(e) => setNewRow({ ...newRow, amount: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleSave(newRow)} style={{ ...inputStyle, textAlign: 'right', color: THEME.textMuted }} /></td>
                <td style={cellStyle}><button onClick={() => handleSave(newRow)} disabled={isLoading || !newRow.platform || !newRow.amount} style={{ background: THEME.accent4, border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', opacity: (!newRow.platform || !newRow.amount) ? 0.3 : 1 }}><Plus size={16} color="white" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExpenseInputTab({ expenses, spreadsheetId, onReload, year }) {
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState({ date: formatDate(new Date()), name: '', category: '', quantity: 1, unitPrice: '', memo: '' });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const months = [...Array(12)].map((_, i) => i + 1);

  const filteredExpenses = filterMonth === 'all' ? expenses : expenses.filter(e => e.month == filterMonth);
  const totalByMonth = {};
  months.forEach(m => { totalByMonth[m] = expenses.filter(e => e.month == m).reduce((sum, e) => sum + (Number(e.amount) || 0), 0); });
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleSave = async (data) => {
    if (!data.category || !data.unitPrice) return;
    setIsLoading(true);
    await callBackend('saveExpense', { spreadsheetId, expenseData: { ...data, quantity: Number(data.quantity) || 1, unitPrice: Number(data.unitPrice) } });
    await onReload();
    setNewRow({ date: formatDate(new Date()), name: '', category: '', quantity: 1, unitPrice: '', memo: '' });
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    setIsLoading(true);
    await callBackend('deleteExpense', { spreadsheetId, expenseId: id });
    await onReload();
    setIsLoading(false);
  };

  const startEdit = (id, field, value) => { setEditingCell({ id, field }); setEditValue(field === 'date' ? formatDate(value) : value); };
  const finishEdit = async () => {
    if (!editingCell) return;
    setIsLoading(true);
    const item = expenses.find(e => e.id === editingCell.id);
    if (item) {
      let newValue = editValue;
      if (['quantity', 'unitPrice'].includes(editingCell.field)) newValue = Number(editValue);
      const updated = { ...item, [editingCell.field]: newValue };
      await callBackend('saveExpense', { spreadsheetId, expenseData: updated });
    }
    await onReload();
    setEditingCell(null); setEditValue('');
    setIsLoading(false);
  };

  const cellStyle = { padding: '10px 12px', borderBottom: `1px solid ${THEME.bgTertiary}`, fontSize: '14px', color: THEME.textPrimary };
  const headerCellStyle = { ...cellStyle, background: THEME.bgTertiary, fontWeight: '600', color: THEME.textSecondary, fontSize: '13px', position: 'sticky', top: 0, zIndex: 1 };
  const inputStyle = { width: '100%', border: 'none', background: 'transparent', fontSize: '14px', color: THEME.textPrimary, outline: 'none', padding: 0 };

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '8px', alignItems: 'center' }}>
        <button onClick={() => setFilterMonth('all')} style={{ background: filterMonth === 'all' ? THEME.danger : THEME.bgSecondary, color: filterMonth === 'all' ? 'white' : THEME.textSecondary, border: 'none', borderRadius: '10px', padding: '12px 16px', minWidth: '80px', textAlign: 'center', boxShadow: THEME.shadow, cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>전체</button>
        {months.map(m => (
          <button key={m} onClick={() => setFilterMonth(m)} style={{ background: filterMonth === m ? THEME.danger : THEME.bgSecondary, color: filterMonth === m ? 'white' : (totalByMonth[m] > 0 ? THEME.textPrimary : THEME.textMuted), border: 'none', borderRadius: '10px', padding: '12px 16px', minWidth: '80px', textAlign: 'center', boxShadow: THEME.shadow, cursor: 'pointer' }}>
            <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{m}월</div>
            <div style={{ fontWeight: '600', fontSize: '12px' }}>{totalByMonth[m] > 0 ? formatCurrency(totalByMonth[m]) : '-'}</div>
          </button>
        ))}
      </div>

      <div style={{ background: `${THEME.danger}10`, borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: THEME.textSecondary, fontSize: '14px' }}>{filterMonth === 'all' ? `${year}년 전체` : `${year}년 ${filterMonth}월`} 지출 합계</span>
        <span style={{ color: THEME.danger, fontSize: '24px', fontWeight: '700' }}>{formatCurrency(filteredTotal)}</span>
      </div>

      <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead><tr><th style={{ ...headerCellStyle, width: '120px' }}>지출일자</th><th style={{ ...headerCellStyle, width: '100px' }}>담당자</th><th style={{ ...headerCellStyle, width: '150px' }}>지출항목</th><th style={{ ...headerCellStyle, width: '70px', textAlign: 'center' }}>수량</th><th style={{ ...headerCellStyle, width: '110px', textAlign: 'right' }}>단가</th><th style={{ ...headerCellStyle, width: '120px', textAlign: 'right' }}>금액</th><th style={{ ...headerCellStyle, width: '150px' }}>비고</th><th style={{ ...headerCellStyle, width: '50px' }}></th></tr></thead>
            <tbody>
              {filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((e) => (
                <tr key={e.id} style={{ transition: 'background 0.15s' }} onMouseOver={(ev) => ev.currentTarget.style.background = THEME.bgPrimary} onMouseOut={(ev) => ev.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => startEdit(e.id, 'date', e.date)}>{editingCell?.id === e.id && editingCell?.field === 'date' ? <input type="date" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} autoFocus style={inputStyle} /> : formatDate(e.date)}</td>
                  <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => startEdit(e.id, 'name', e.name)}>{editingCell?.id === e.id && editingCell?.field === 'name' ? <input type="text" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit()} autoFocus style={inputStyle} /> : (e.name || '-')}</td>
                  <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => startEdit(e.id, 'category', e.category)}>{editingCell?.id === e.id && editingCell?.field === 'category' ? <input type="text" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit()} autoFocus style={inputStyle} /> : e.category}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', cursor: 'pointer' }} onClick={() => startEdit(e.id, 'quantity', e.quantity)}>{editingCell?.id === e.id && editingCell?.field === 'quantity' ? <input type="number" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit()} autoFocus style={{ ...inputStyle, textAlign: 'center' }} /> : e.quantity}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', cursor: 'pointer' }} onClick={() => startEdit(e.id, 'unitPrice', e.unitPrice)}>{editingCell?.id === e.id && editingCell?.field === 'unitPrice' ? <input type="number" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit()} autoFocus style={{ ...inputStyle, textAlign: 'right' }} /> : formatCurrency(e.unitPrice)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', color: THEME.danger, fontWeight: '600' }}>{formatCurrency(e.amount)}</td>
                  <td style={{ ...cellStyle, cursor: 'pointer', color: THEME.textMuted, fontSize: '13px' }} onClick={() => startEdit(e.id, 'memo', e.memo)}>{editingCell?.id === e.id && editingCell?.field === 'memo' ? <input type="text" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={finishEdit} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit()} autoFocus style={inputStyle} /> : (e.memo || '-')}</td>
                  <td style={cellStyle}><button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.5 }} onMouseOver={(ev) => ev.currentTarget.style.opacity = 1} onMouseOut={(ev) => ev.currentTarget.style.opacity = 0.5}><Trash2 size={16} color={THEME.danger} /></button></td>
                </tr>
              ))}
              <tr style={{ background: `${THEME.danger}08` }}>
                <td style={cellStyle}><input type="date" value={newRow.date} onChange={(e) => setNewRow({ ...newRow, date: e.target.value })} style={{ ...inputStyle, color: THEME.textSecondary }} /></td>
                <td style={cellStyle}><input type="text" placeholder="담당자" value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} style={{ ...inputStyle, color: THEME.textMuted }} /></td>
                <td style={cellStyle}><input type="text" placeholder="지출항목" value={newRow.category} onChange={(e) => setNewRow({ ...newRow, category: e.target.value })} style={{ ...inputStyle, color: THEME.textMuted }} /></td>
                <td style={cellStyle}><input type="number" placeholder="1" value={newRow.quantity} onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })} style={{ ...inputStyle, textAlign: 'center', color: THEME.textMuted }} /></td>
                <td style={cellStyle}><input type="number" placeholder="단가" value={newRow.unitPrice} onChange={(e) => setNewRow({ ...newRow, unitPrice: e.target.value })} style={{ ...inputStyle, textAlign: 'right', color: THEME.textMuted }} /></td>
                <td style={{ ...cellStyle, textAlign: 'right', color: THEME.textMuted }}>{formatCurrency((Number(newRow.quantity) || 1) * (Number(newRow.unitPrice) || 0))}</td>
                <td style={cellStyle}><input type="text" placeholder="비고" value={newRow.memo} onChange={(e) => setNewRow({ ...newRow, memo: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleSave(newRow)} style={{ ...inputStyle, color: THEME.textMuted }} /></td>
                <td style={cellStyle}><button onClick={() => handleSave(newRow)} disabled={isLoading || !newRow.category || !newRow.unitPrice} style={{ background: THEME.danger, border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', opacity: (!newRow.category || !newRow.unitPrice) ? 0.3 : 1 }}><Plus size={16} color="white" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '20px', boxShadow: THEME.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        <span style={{ color: THEME.textSecondary, fontSize: '14px' }}>{label}</span>
      </div>
      <div style={{ color, fontSize: '24px', fontWeight: '700' }}>{value}</div>
    </div>
  );
}
