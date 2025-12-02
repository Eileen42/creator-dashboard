import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { THEME } from './config';
import { callBackend } from './api';
import { PageHeader, Footer, EmptyState, ModalWrapper, inputStyle, labelStyle } from './common';

export default function ContentsPage({ contents, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusColors = {
    '기획중': THEME.textMuted,
    '제작중': THEME.accent5,
    '편집중': THEME.accent3,
    '검수중': THEME.accent2,
    '완료': THEME.accent4,
    '업로드완료': THEME.accent1,
  };

  const filteredContents = filterStatus === 'all' ? contents : contents.filter(c => c.status === filterStatus);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveContent', { spreadsheetId, contentData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteContent', { spreadsheetId, contentId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="콘텐츠 제작 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />

      {/* 상태 필터 */}
      <div style={{ padding: '0 24px 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', '기획중', '제작중', '편집중', '검수중', '완료', '업로드완료'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', background: filterStatus === status ? THEME.accent1 : THEME.bgSecondary, color: filterStatus === status ? 'white' : THEME.textSecondary, fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: THEME.shadow }}>
              {status === 'all' ? '전체' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredContents.length === 0 ? (
        <EmptyState icon="📝" title="콘텐츠가 없습니다" desc="새 콘텐츠를 등록해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {filteredContents.map((c) => (
            <div key={c.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: `${statusColors[c.status] || THEME.textMuted}20`, color: statusColors[c.status] || THEME.textMuted, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{c.status}</span>
                    <span style={{ color: THEME.textSecondary, fontSize: '12px' }}>{c.brand} · {c.mainPlatform}</span>
                  </div>
                  <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '15px' }}>{c.title || c.topic || '(제목 없음)'}</div>
                  {c.uploadYear && <div style={{ color: THEME.textMuted, fontSize: '12px', marginTop: '4px' }}>업로드: {c.uploadYear}.{c.uploadMonth}.{c.uploadDay}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(c); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContentModal editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platformsAndChannels={platformsAndChannels} />
      )}

      <Footer />
    </div>
  );
}

function ContentModal({ editData, onSave, onClose, isLoading, platformsAndChannels }) {
  const [form, setForm] = useState(editData || {
    brand: '', mainPlatform: '', distributePlatforms: '', status: '기획중', editor: '',
    uploadYear: new Date().getFullYear(), uploadMonth: new Date().getMonth() + 1, uploadDay: '',
    priority: '', topic: '', title: '', deliveryDate: '', scriptLink: '', referenceLink: '', editCompleteDate: '', memo: ''
  });

  const handleSubmit = () => {
    if (!form.brand || !form.mainPlatform) { alert('브랜드와 메인플랫폼은 필수입니다.'); return; }
    onSave(form);
  };

  return (
    <ModalWrapper title={editData ? '콘텐츠 수정' : '새 콘텐츠 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>브랜드 *</label><select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels?.brands || []).map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label style={labelStyle}>메인플랫폼 *</label><select value={form.mainPlatform} onChange={(e) => setForm({ ...form, mainPlatform: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels?.platforms || []).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div><label style={labelStyle}>배포플랫폼 (쉼표 구분)</label><input value={form.distributePlatforms} onChange={(e) => setForm({ ...form, distributePlatforms: e.target.value })} placeholder="유튜브, 틱톡, 인스타" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>상태</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>{['기획중', '제작중', '편집중', '검수중', '완료', '업로드완료'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>편집자</label><select value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} style={inputStyle}><option value="">선택</option>{(platformsAndChannels?.editors || []).map(e => <option key={e} value={e}>{e}</option>)}</select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>년</label><select value={form.uploadYear} onChange={(e) => setForm({ ...form, uploadYear: Number(e.target.value) })} style={inputStyle}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          <div><label style={labelStyle}>월</label><select value={form.uploadMonth} onChange={(e) => setForm({ ...form, uploadMonth: Number(e.target.value) })} style={inputStyle}>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
          <div><label style={labelStyle}>일</label><input type="number" value={form.uploadDay} onChange={(e) => setForm({ ...form, uploadDay: e.target.value })} placeholder="일" style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>주제</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="콘텐츠 주제" style={inputStyle} /></div>
        <div><label style={labelStyle}>제목</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="영상 제목" style={inputStyle} /></div>
        <div><label style={labelStyle}>비고</label><input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="메모" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}
