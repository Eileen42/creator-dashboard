import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Filter, ChevronDown } from 'lucide-react';
import { THEME } from '../../config';
import { callBackend, formatCurrency } from '../../api';
import { PageHeader, Footer } from '../common';

export default function RevenuePage({ revenues, expenses, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [tab, setTab] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  
  // 새 행 입력용 상태
  const [newRevenue, setNewRevenue] = useState({ year: selectedYear, month: new Date().getMonth() + 1, platform: '', channelName: '', amount: '' });
  const [newExpense, setNewExpense] = useState({ year: selectedYear, month: new Date().getMonth() + 1, name: '', category: '', quantity: 1, unitPrice: '' });
  
  // 수정 중인 셀
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [editValue, setEditValue] = useState('');

  const platforms = platformsAndChannels?.platforms || [];
  const channels = platformsAndChannels?.channels || [];

  // 필터링된 데이터
  const filteredRevenues = revenues.filter(r => {
    if (r.year != selectedYear) return false;
    if (filterMonth !== 'all' && r.month != filterMonth) return false;
    if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (e.year != selectedYear) return false;
    if (filterMonth !== 'all' && e.month != filterMonth) return false;
    return true;
  });

  // 합계 계산
  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 수익 저장
  const handleSaveRevenue = async (data) => {
    if (!data.platform || !data.amount) return;
    setIsLoading(true);
    await callBackend('saveRevenue', { spreadsheetId, revenueData: { ...data, amount: Number(data.amount) } });
    await onReload();
    setNewRevenue({ year: selectedYear, month: new Date().getMonth() + 1, platform: '', channelName: '', amount: '' });
    setIsLoading(false);
  };

  // 수익 삭제
  const handleDeleteRevenue = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    setIsLoading(true);
    await callBackend('deleteRevenue', { spreadsheetId, revenueId: id });
    await onReload();
    setIsLoading(false);
  };

  // 지출 저장
  const handleSaveExpense = async (data) => {
    if (!data.category || !data.unitPrice) return;
    setIsLoading(true);
    await callBackend('saveExpense', { spreadsheetId, expenseData: { ...data, quantity: Number(data.quantity), unitPrice: Number(data.unitPrice) } });
    await onReload();
    setNewExpense({ year: selectedYear, month: new Date().getMonth() + 1, name: '', category: '', quantity: 1, unitPrice: '' });
    setIsLoading(false);
  };

  // 지출 삭제
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    setIsLoading(true);
    await callBackend('deleteExpense', { spreadsheetId, expenseId: id });
    await onReload();
    setIsLoading(false);
  };

  // 셀 수정 시작
  const startEdit = (id, field, value) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  // 셀 수정 완료
  const finishEdit = async (type) => {
    if (!editingCell) return;
    
    setIsLoading(true);
    if (type === 'revenue') {
      const item = revenues.find(r => r.id === editingCell.id);
      if (item) {
        const updated = { ...item, [editingCell.field]: editingCell.field === 'amount' ? Number(editValue) : editValue };
        await callBackend('saveRevenue', { spreadsheetId, revenueData: updated });
      }
    } else {
      const item = expenses.find(e => e.id === editingCell.id);
      if (item) {
        const updated = { ...item, [editingCell.field]: ['quantity', 'unitPrice'].includes(editingCell.field) ? Number(editValue) : editValue };
        await callBackend('saveExpense', { spreadsheetId, expenseData: updated });
      }
    }
    await onReload();
    setEditingCell(null);
    setEditValue('');
    setIsLoading(false);
  };

  // 공통 셀 스타일
  const cellStyle = { 
    padding: '10px 12px', 
    borderBottom: `1px solid ${THEME.bgTertiary}`,
    fontSize: '14px',
    color: THEME.textPrimary
  };

  const headerCellStyle = {
    ...cellStyle,
    background: THEME.bgTertiary,
    fontWeight: '600',
    color: THEME.textSecondary,
    fontSize: '13px',
    position: 'sticky',
    top: 0,
    zIndex: 1
  };

  const editableCellStyle = {
    ...cellStyle,
    cursor: 'pointer',
    transition: 'background 0.15s',
  };

  const inputCellStyle = {
    width: '100%',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: THEME.textPrimary,
    outline: 'none',
    padding: 0
  };

  const selectCellStyle = {
    ...inputCellStyle,
    cursor: 'pointer'
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader title="수익/지출 관리" onBack={onBack} />

      {/* 탭 + 필터 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 탭 */}
          <div style={{ display: 'flex', background: THEME.bgTertiary, borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setTab('revenue')} style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: tab === 'revenue' ? THEME.bgSecondary : 'transparent', color: tab === 'revenue' ? THEME.accent1 : THEME.textSecondary, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>💰 수익</button>
            <button onClick={() => setTab('expense')} style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: tab === 'expense' ? THEME.bgSecondary : 'transparent', color: tab === 'expense' ? THEME.danger : THEME.textSecondary, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>💸 지출</button>
          </div>

          {/* 필터 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
            <Filter size={16} color={THEME.textMuted} />
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
              <option value="all">전체 월</option>
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}
            </select>
            {tab === 'revenue' && (
              <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} style={{ background: THEME.bgSecondary, border: `1px solid ${THEME.bgTertiary}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
                <option value="all">전체 플랫폼</option>
                {platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 합계 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ background: tab === 'revenue' ? `${THEME.accent1}10` : `${THEME.danger}10`, borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: THEME.textSecondary, fontSize: '14px' }}>
            {filterMonth === 'all' ? `${selectedYear}년 전체` : `${selectedYear}년 ${filterMonth}월`} 
            {filterPlatform !== 'all' && tab === 'revenue' ? ` · ${filterPlatform}` : ''}
          </span>
          <span style={{ color: tab === 'revenue' ? THEME.accent1 : THEME.danger, fontSize: '24px', fontWeight: '700' }}>
            {formatCurrency(tab === 'revenue' ? totalRevenue : totalExpense)}
          </span>
        </div>
      </div>

      {/* 수익 테이블 */}
      {tab === 'revenue' && (
        <div style={{ padding: '0 24px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ ...headerCellStyle, width: '80px' }}>년도</th>
                    <th style={{ ...headerCellStyle, width: '70px' }}>월</th>
                    <th style={{ ...headerCellStyle, width: '120px' }}>플랫폼</th>
                    <th style={{ ...headerCellStyle, width: '150px' }}>채널명</th>
                    <th style={{ ...headerCellStyle, width: '140px', textAlign: 'right' }}>금액</th>
                    <th style={{ ...headerCellStyle, width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevenues.map((r) => (
                    <tr key={r.id} style={{ transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = THEME.bgPrimary} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={cellStyle}>{r.year}</td>
                      <td style={cellStyle}>{r.month}월</td>
                      <td 
                        style={editableCellStyle}
                        onClick={() => startEdit(r.id, 'platform', r.platform)}
                      >
                        {editingCell?.id === r.id && editingCell?.field === 'platform' ? (
                          <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => finishEdit('revenue')} autoFocus style={selectCellStyle}>
                            {platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                          </select>
                        ) : r.platform}
                      </td>
                      <td 
                        style={editableCellStyle}
                        onClick={() => startEdit(r.id, 'channelName', r.channelName)}
                      >
                        {editingCell?.id === r.id && editingCell?.field === 'channelName' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => finishEdit('revenue')} onKeyPress={(e) => e.key === 'Enter' && finishEdit('revenue')} autoFocus style={inputCellStyle} />
                        ) : (r.channelName || '-')}
                      </td>
                      <td 
                        style={{ ...editableCellStyle, textAlign: 'right', color: THEME.accent1, fontWeight: '600' }}
                        onClick={() => startEdit(r.id, 'amount', r.amount)}
                      >
                        {editingCell?.id === r.id && editingCell?.field === 'amount' ? (
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => finishEdit('revenue')} onKeyPress={(e) => e.key === 'Enter' && finishEdit('revenue')} autoFocus style={{ ...inputCellStyle, textAlign: 'right' }} />
                        ) : formatCurrency(r.amount)}
                      </td>
                      <td style={cellStyle}>
                        <button onClick={() => handleDeleteRevenue(r.id)} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.5 }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}>
                          <Trash2 size={16} color={THEME.danger} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* 새 행 입력 */}
                  <tr style={{ background: `${THEME.accent1}05` }}>
                    <td style={cellStyle}>
                      <select value={newRevenue.year} onChange={(e) => setNewRevenue({ ...newRevenue, year: Number(e.target.value) })} style={{ ...selectCellStyle, color: THEME.textMuted }}>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select value={newRevenue.month} onChange={(e) => setNewRevenue({ ...newRevenue, month: Number(e.target.value) })} style={{ ...selectCellStyle, color: THEME.textMuted }}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select value={newRevenue.platform} onChange={(e) => setNewRevenue({ ...newRevenue, platform: e.target.value })} style={{ ...selectCellStyle, color: newRevenue.platform ? THEME.textPrimary : THEME.textMuted }}>
                        <option value="">플랫폼 선택</option>
                        {platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select value={newRevenue.channelName} onChange={(e) => setNewRevenue({ ...newRevenue, channelName: e.target.value })} style={{ ...selectCellStyle, color: newRevenue.channelName ? THEME.textPrimary : THEME.textMuted }}>
                        <option value="">채널 선택</option>
                        {channels.filter(c => c.platform === newRevenue.platform).map(c => <option key={c.id} value={c.channelName}>{c.channelName}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <input type="number" placeholder="금액" value={newRevenue.amount} onChange={(e) => setNewRevenue({ ...newRevenue, amount: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleSaveRevenue(newRevenue)} style={{ ...inputCellStyle, textAlign: 'right', color: THEME.textMuted }} />
                    </td>
                    <td style={cellStyle}>
                      <button onClick={() => handleSaveRevenue(newRevenue)} disabled={isLoading || !newRevenue.platform || !newRevenue.amount} style={{ background: THEME.accent1, border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', opacity: (!newRevenue.platform || !newRevenue.amount) ? 0.3 : 1 }}>
                        <Plus size={16} color="white" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 지출 테이블 */}
      {tab === 'expense' && (
        <div style={{ padding: '0 24px' }}>
          <div style={{ background: THEME.bgSecondary, borderRadius: '16px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ ...headerCellStyle, width: '80px' }}>년도</th>
                    <th style={{ ...headerCellStyle, width: '70px' }}>월</th>
                    <th style={{ ...headerCellStyle, width: '120px' }}>담당자</th>
                    <th style={{ ...headerCellStyle, width: '150px' }}>지출항목</th>
                    <th style={{ ...headerCellStyle, width: '70px', textAlign: 'center' }}>수량</th>
                    <th style={{ ...headerCellStyle, width: '110px', textAlign: 'right' }}>단가</th>
                    <th style={{ ...headerCellStyle, width: '120px', textAlign: 'right' }}>금액</th>
                    <th style={{ ...headerCellStyle, width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} style={{ transition: 'background 0.15s' }} onMouseOver={(ev) => ev.currentTarget.style.background = THEME.bgPrimary} onMouseOut={(ev) => ev.currentTarget.style.background = 'transparent'}>
                      <td style={cellStyle}>{e.year}</td>
                      <td style={cellStyle}>{e.month}월</td>
                      <td 
                        style={editableCellStyle}
                        onClick={() => startEdit(e.id, 'name', e.name)}
                      >
                        {editingCell?.id === e.id && editingCell?.field === 'name' ? (
                          <input type="text" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={() => finishEdit('expense')} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit('expense')} autoFocus style={inputCellStyle} />
                        ) : (e.name || '-')}
                      </td>
                      <td 
                        style={editableCellStyle}
                        onClick={() => startEdit(e.id, 'category', e.category)}
                      >
                        {editingCell?.id === e.id && editingCell?.field === 'category' ? (
                          <input type="text" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={() => finishEdit('expense')} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit('expense')} autoFocus style={inputCellStyle} />
                        ) : e.category}
                      </td>
                      <td 
                        style={{ ...editableCellStyle, textAlign: 'center' }}
                        onClick={() => startEdit(e.id, 'quantity', e.quantity)}
                      >
                        {editingCell?.id === e.id && editingCell?.field === 'quantity' ? (
                          <input type="number" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={() => finishEdit('expense')} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit('expense')} autoFocus style={{ ...inputCellStyle, textAlign: 'center' }} />
                        ) : e.quantity}
                      </td>
                      <td 
                        style={{ ...editableCellStyle, textAlign: 'right' }}
                        onClick={() => startEdit(e.id, 'unitPrice', e.unitPrice)}
                      >
                        {editingCell?.id === e.id && editingCell?.field === 'unitPrice' ? (
                          <input type="number" value={editValue} onChange={(ev) => setEditValue(ev.target.value)} onBlur={() => finishEdit('expense')} onKeyPress={(ev) => ev.key === 'Enter' && finishEdit('expense')} autoFocus style={{ ...inputCellStyle, textAlign: 'right' }} />
                        ) : formatCurrency(e.unitPrice)}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right', color: THEME.danger, fontWeight: '600' }}>
                        {formatCurrency(e.amount)}
                      </td>
                      <td style={cellStyle}>
                        <button onClick={() => handleDeleteExpense(e.id)} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.5 }} onMouseOver={(ev) => ev.currentTarget.style.opacity = 1} onMouseOut={(ev) => ev.currentTarget.style.opacity = 0.5}>
                          <Trash2 size={16} color={THEME.danger} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* 새 행 입력 */}
                  <tr style={{ background: `${THEME.danger}05` }}>
                    <td style={cellStyle}>
                      <select value={newExpense.year} onChange={(e) => setNewExpense({ ...newExpense, year: Number(e.target.value) })} style={{ ...selectCellStyle, color: THEME.textMuted }}>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select value={newExpense.month} onChange={(e) => setNewExpense({ ...newExpense, month: Number(e.target.value) })} style={{ ...selectCellStyle, color: THEME.textMuted }}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <input type="text" placeholder="담당자" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputCellStyle, color: THEME.textMuted }} />
                    </td>
                    <td style={cellStyle}>
                      <input type="text" placeholder="지출항목" value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={{ ...inputCellStyle, color: THEME.textMuted }} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" placeholder="수량" value={newExpense.quantity} onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })} style={{ ...inputCellStyle, textAlign: 'center', color: THEME.textMuted }} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" placeholder="단가" value={newExpense.unitPrice} onChange={(e) => setNewExpense({ ...newExpense, unitPrice: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleSaveExpense(newExpense)} style={{ ...inputCellStyle, textAlign: 'right', color: THEME.textMuted }} />
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right', color: THEME.textMuted }}>
                      {formatCurrency((Number(newExpense.quantity) || 0) * (Number(newExpense.unitPrice) || 0))}
                    </td>
                    <td style={cellStyle}>
                      <button onClick={() => handleSaveExpense(newExpense)} disabled={isLoading || !newExpense.category || !newExpense.unitPrice} style={{ background: THEME.danger, border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', opacity: (!newExpense.category || !newExpense.unitPrice) ? 0.3 : 1 }}>
                        <Plus size={16} color="white" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
