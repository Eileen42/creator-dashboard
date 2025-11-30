import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Plus, Trash2 } from 'lucide-react';
import { THEME } from '../../config';
import { callBackend, formatCurrency } from '../../api';

export default function RevenuePage({ spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [tab, setTab] = useState('revenue');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState({});
  const [expenseData, setExpenseData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const platforms = platformsAndChannels?.platforms || [];
  const channels = platformsAndChannels?.channels || [];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // 플랫폼별 채널 그룹화
  const channelsByPlatform = {};
  platforms.forEach(p => {
    channelsByPlatform[p.name] = channels.filter(c => c.platform === p.name);
  });

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [selectedYear, spreadsheetId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // 수익 데이터 로드
    const revRes = await callBackend('getRevenues', { spreadsheetId, year: selectedYear });
    if (revRes.success) {
      // { platform: { channel: { month: amount } } } 형태로 변환
      const grouped = {};
      (revRes.revenues || []).forEach(r => {
        if (!grouped[r.platform]) grouped[r.platform] = {};
        if (!grouped[r.platform][r.channelName]) grouped[r.platform][r.channelName] = {};
        grouped[r.platform][r.channelName][r.month] = { id: r.id, amount: r.amount };
      });
      setRevenueData(grouped);
    }

    // 지출 데이터 로드
    const expRes = await callBackend('getExpenses', { spreadsheetId, year: selectedYear });
    if (expRes.success) {
      setExpenseData(expRes.expenses || []);
    }

    setIsLoading(false);
  };

  // 탭 스타일
  const tabStyle = (active) => ({
    padding: '14px 28px',
    border: 'none',
    background: active ? THEME.bgSecondary : 'transparent',
    color: active ? THEME.accent1 : THEME.textMuted,
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ minHeight: '100vh', background: THEME.bgPrimary }}>
      {/* 헤더 */}
      <div style={{ 
        background: THEME.bgSecondary, 
        padding: '16px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        borderBottom: `1px solid ${THEME.bgTertiary}`
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <ChevronLeft size={24} color={THEME.textPrimary} />
        </button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: THEME.textPrimary }}>
          수익/지출 관리
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color={THEME.textMuted} />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              background: THEME.bgTertiary,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '15px',
              fontWeight: '600',
              color: THEME.textPrimary,
              cursor: 'pointer'
            }}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ padding: '0 24px', background: THEME.bgPrimary }}>
        <div style={{ display: 'flex', gap: '4px', paddingTop: '16px' }}>
          <button onClick={() => setTab('revenue')} style={tabStyle(tab === 'revenue')}>
            💰 수익
          </button>
          <button onClick={() => setTab('expense')} style={tabStyle(tab === 'expense')}>
            💸 지출
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ background: THEME.bgSecondary, minHeight: 'calc(100vh - 180px)', padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: THEME.textMuted }}>로딩 중...</div>
        ) : tab === 'revenue' ? (
          <RevenueTable
            platforms={platforms}
            channelsByPlatform={channelsByPlatform}
            revenueData={revenueData}
            months={months}
            year={selectedYear}
            spreadsheetId={spreadsheetId}
            onReload={loadData}
          />
        ) : (
          <ExpenseTable
            expenseData={expenseData}
            months={months}
            year={selectedYear}
            spreadsheetId={spreadsheetId}
            onReload={loadData}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// 수익 테이블 (스프레드시트 스타일)
// ============================================
function RevenueTable({ platforms, channelsByPlatform, revenueData, months, year, spreadsheetId, onReload }) {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 셀 클릭 → 편집 시작
  const startEdit = (platform, channel, month, currentAmount) => {
    setEditingCell({ platform, channel, month });
    setEditValue(currentAmount || '');
  };

  // 편집 완료 → 저장
  const finishEdit = async () => {
    if (!editingCell) return;

    const { platform, channel, month } = editingCell;
    const amount = Number(editValue) || 0;

    // 기존 데이터 찾기
    const existing = revenueData[platform]?.[channel]?.[month];

    if (amount > 0) {
      await callBackend('saveRevenue', {
        spreadsheetId,
        revenueData: {
          id: existing?.id,
          year,
          month,
          platform,
          channelName: channel,
          amount
        }
      });
    } else if (existing?.id) {
      // 금액이 0이면 삭제
      await callBackend('deleteRevenue', { spreadsheetId, revenueId: existing.id });
    }

    setEditingCell(null);
    setEditValue('');
    onReload();
  };

  // 플랫폼별 월별 합계 계산
  const getPlatformTotal = (platform, month) => {
    const platformData = revenueData[platform] || {};
    return Object.values(platformData).reduce((sum, channelData) => {
      return sum + (channelData[month]?.amount || 0);
    }, 0);
  };

  // 전체 월별 합계
  const getMonthTotal = (month) => {
    return platforms.reduce((sum, p) => sum + getPlatformTotal(p.name, month), 0);
  };

  // 스타일
  const thStyle = {
    padding: '12px 8px',
    background: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontSize: '13px',
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '13px',
    textAlign: 'right'
  };

  const inputStyle = {
    width: '100%',
    border: 'none',
    background: '#fff3cd',
    padding: '6px 8px',
    fontSize: '13px',
    textAlign: 'right',
    outline: 'none',
    borderRadius: '4px'
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '50px', textAlign: 'center' }}>연번</th>
            <th style={{ ...thStyle, width: '80px' }}>KRW</th>
            <th style={{ ...thStyle, width: '100px' }}>종류</th>
            <th style={{ ...thStyle, width: '120px' }}>채널명</th>
            {months.map(m => (
              <th key={m} style={{ ...thStyle, width: '90px' }}>{m}월</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform, pIdx) => {
            const platformChannels = channelsByPlatform[platform.name] || [];
            
            return (
              <React.Fragment key={platform.name}>
                {/* 채널 행들 */}
                {platformChannels.map((channel, cIdx) => {
                  const channelData = revenueData[platform.name]?.[channel.channelName] || {};
                  
                  return (
                    <tr key={`${platform.name}-${channel.channelName}`} style={{ background: cIdx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#868e96' }}>{cIdx + 1}</td>
                      {cIdx === 0 ? (
                        <td rowSpan={platformChannels.length + 1} style={{ ...tdStyle, textAlign: 'center', background: '#f1f3f4', fontWeight: '600', verticalAlign: 'top', paddingTop: '16px' }}>
                          {/* 아이콘 또는 라벨 */}
                        </td>
                      ) : null}
                      {cIdx === 0 ? (
                        <td rowSpan={platformChannels.length + 1} style={{ ...tdStyle, textAlign: 'center', background: '#f1f3f4', fontWeight: '600', verticalAlign: 'top', paddingTop: '16px' }}>
                          {platform.name}
                        </td>
                      ) : null}
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '500' }}>{channel.channelName}</td>
                      {months.map(m => {
                        const isEditing = editingCell?.platform === platform.name && editingCell?.channel === channel.channelName && editingCell?.month === m;
                        const amount = channelData[m]?.amount || 0;

                        return (
                          <td
                            key={m}
                            style={{ ...tdStyle, cursor: 'pointer', background: isEditing ? '#fff3cd' : undefined }}
                            onClick={() => !isEditing && startEdit(platform.name, channel.channelName, m, amount)}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={finishEdit}
                                onKeyPress={(e) => e.key === 'Enter' && finishEdit()}
                                autoFocus
                                style={inputStyle}
                              />
                            ) : (
                              <span style={{ color: amount > 0 ? '#212529' : '#ced4da' }}>
                                {amount > 0 ? amount.toLocaleString() : '0'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* TOTAL 행 */}
                {platformChannels.length > 0 && (
                  <tr style={{ background: '#e7f5ff' }}>
                    <td style={{ ...tdStyle, textAlign: 'center' }}></td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: '#1971c2' }}>TOTAL</td>
                    {months.map(m => (
                      <td key={m} style={{ ...tdStyle, fontWeight: '700', color: '#1971c2' }}>
                        {getPlatformTotal(platform.name, m).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                )}

                {/* 채널이 없는 플랫폼 */}
                {platformChannels.length === 0 && (
                  <tr style={{ background: '#fafafa' }}>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#868e96' }}>-</td>
                    <td style={{ ...tdStyle, textAlign: 'center', background: '#f1f3f4' }}></td>
                    <td style={{ ...tdStyle, textAlign: 'center', background: '#f1f3f4', fontWeight: '600' }}>{platform.name}</td>
                    <td style={{ ...tdStyle, textAlign: 'left', color: '#868e96' }}>채널 없음</td>
                    {months.map(m => (
                      <td key={m} style={{ ...tdStyle, color: '#ced4da' }}>-</td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {/* 전체 합계 행 */}
          <tr style={{ background: '#d3f9d8' }}>
            <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#2f9e44' }}>
              📊 총 매출 합계
            </td>
            {months.map(m => (
              <td key={m} style={{ ...tdStyle, fontWeight: '700', fontSize: '14px', color: '#2f9e44' }}>
                {getMonthTotal(m).toLocaleString()}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// 지출 테이블 (일별 입력 → 월별 합산)
// ============================================
function ExpenseTable({ expenseData, months, year, spreadsheetId, onReload }) {
  const [newExpense, setNewExpense] = useState({ name: '', category: '', quantity: 1, unitPrice: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 지출 항목별로 그룹화 (이름+항목 기준)
  const groupedExpenses = {};
  expenseData.forEach(exp => {
    const key = `${exp.name || '기타'}-${exp.category}`;
    if (!groupedExpenses[key]) {
      groupedExpenses[key] = {
        name: exp.name || '기타',
        category: exp.category,
        quantity: exp.quantity,
        unitPrice: exp.unitPrice,
        monthlyTotals: {},
        items: []
      };
      months.forEach(m => groupedExpenses[key].monthlyTotals[m] = 0);
    }
    groupedExpenses[key].items.push(exp);
    if (exp.month) {
      groupedExpenses[key].monthlyTotals[exp.month] += (exp.amount || 0);
    }
  });

  const expenseRows = Object.values(groupedExpenses);

  // 월별 전체 합계
  const getMonthTotal = (month) => {
    return expenseRows.reduce((sum, row) => sum + (row.monthlyTotals[month] || 0), 0);
  };

  // 새 지출 추가
  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.unitPrice) return;

    await callBackend('saveExpense', {
      spreadsheetId,
      expenseData: {
        date: selectedDate,
        name: newExpense.name,
        category: newExpense.category,
        quantity: Number(newExpense.quantity) || 1,
        unitPrice: Number(newExpense.unitPrice)
      }
    });

    setNewExpense({ name: '', category: '', quantity: 1, unitPrice: '' });
    setShowAddModal(false);
    onReload();
  };

  // 지출 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await callBackend('deleteExpense', { spreadsheetId, expenseId: id });
    onReload();
  };

  // 스타일
  const thStyle = {
    padding: '12px 8px',
    background: '#fff0f0',
    borderBottom: '2px solid #ffc9c9',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c92a2a',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const tdStyle = {
    padding: '10px 8px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '13px',
    textAlign: 'right'
  };

  return (
    <div>
      {/* 추가 버튼 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: THEME.textMuted }}>
          일별로 지출을 입력하면 월별로 자동 합산됩니다.
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fa5252',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> 지출 추가
        </button>
      </div>

      {/* 지출 추가 모달 */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>💸 지출 추가</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>지출일자</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>담당자(이름)</label>
              <input
                type="text"
                placeholder="예: 김편집"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>지출항목 *</label>
              <input
                type="text"
                placeholder="예: 영상편집비"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>수량</label>
                <input
                  type="number"
                  value={newExpense.quantity}
                  onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>단가 *</label>
                <input
                  type="number"
                  placeholder="20000"
                  value={newExpense.unitPrice}
                  onChange={(e) => setNewExpense({ ...newExpense, unitPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ color: '#868e96', fontSize: '13px' }}>합계 금액: </span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#fa5252' }}>
                {formatCurrency((Number(newExpense.quantity) || 1) * (Number(newExpense.unitPrice) || 0))}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: '12px', border: '1px solid #dee2e6', borderRadius: '8px', background: 'white', fontSize: '14px', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.category || !newExpense.unitPrice}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                  background: (!newExpense.category || !newExpense.unitPrice) ? '#ced4da' : '#fa5252',
                  color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '50px' }}>연번</th>
              <th style={{ ...thStyle, width: '100px' }}>이름</th>
              <th style={{ ...thStyle, width: '120px' }}>지출</th>
              <th style={{ ...thStyle, width: '60px' }}>수량</th>
              <th style={{ ...thStyle, width: '80px' }}>단가</th>
              {months.map(m => (
                <th key={m} style={{ ...thStyle, width: '90px' }}>{m}월</th>
              ))}
              <th style={{ ...thStyle, width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {expenseRows.length === 0 ? (
              <tr>
                <td colSpan={17} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#868e96' }}>
                  등록된 지출이 없습니다. 위의 "지출 추가" 버튼을 눌러 추가해주세요.
                </td>
              </tr>
            ) : (
              expenseRows.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#868e96' }}>{idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>{row.name}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '500' }}>{row.category}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{row.quantity}</td>
                  <td style={{ ...tdStyle }}>{row.unitPrice?.toLocaleString()}</td>
                  {months.map(m => (
                    <td key={m} style={{ ...tdStyle, color: row.monthlyTotals[m] > 0 ? '#212529' : '#ced4da' }}>
                      {row.monthlyTotals[m] > 0 ? row.monthlyTotals[m].toLocaleString() : '0'}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      onClick={() => row.items[0]?.id && handleDelete(row.items[0].id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                    >
                      <Trash2 size={16} color="#fa5252" />
                    </button>
                  </td>
                </tr>
              ))
            )}

            {/* TOTAL 행 */}
            <tr style={{ background: '#ffe3e3' }}>
              <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#c92a2a' }}>
                💸 TOTAL
              </td>
              {months.map(m => (
                <td key={m} style={{ ...tdStyle, fontWeight: '700', fontSize: '14px', color: '#c92a2a' }}>
                  {getMonthTotal(m).toLocaleString()}
                </td>
              ))}
              <td style={tdStyle}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 상세 내역 (일별) */}
      {expenseData.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: THEME.textPrimary }}>
            📋 일별 상세 내역
          </h3>
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #e9ecef' }}>일자</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #e9ecef' }}>담당자</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #e9ecef' }}>지출항목</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', borderBottom: '1px solid #e9ecef' }}>금액</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '13px', borderBottom: '1px solid #e9ecef' }}></th>
                </tr>
              </thead>
              <tbody>
                {expenseData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map((exp, idx) => (
                  <tr key={exp.id || idx}>
                    <td style={{ padding: '10px', fontSize: '13px', borderBottom: '1px solid #f1f3f4' }}>
                      {exp.date ? new Date(exp.date).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td style={{ padding: '10px', fontSize: '13px', borderBottom: '1px solid #f1f3f4' }}>{exp.name || '-'}</td>
                    <td style={{ padding: '10px', fontSize: '13px', borderBottom: '1px solid #f1f3f4' }}>{exp.category}</td>
                    <td style={{ padding: '10px', fontSize: '13px', textAlign: 'right', fontWeight: '500', color: '#fa5252', borderBottom: '1px solid #f1f3f4' }}>
                      {formatCurrency(exp.amount)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f3f4' }}>
                      <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                        <Trash2 size={14} color="#fa5252" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
