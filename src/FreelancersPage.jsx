import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { THEME } from './config';
import { callBackend, formatCurrency } from './api';
import { PageHeader, Footer, EmptyState, ModalWrapper, inputStyle, labelStyle } from './common';

export default function FreelancersPage({ freelancers, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveFreelancer', { spreadsheetId, freelancerData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteFreelancer', { spreadsheetId, freelancerId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="외주 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />

      {freelancers.length === 0 ? (
        <EmptyState icon="👥" title="등록된 편집자가 없습니다" desc="외주 편집자를 추가해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {freelancers.map((f) => (
            <div key={f.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: THEME.textPrimary, fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{f.name}</div>
                  <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{f.assignedChannel} · {f.editProgram}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <span style={{ color: THEME.accent1, fontSize: '13px' }}>건당 {formatCurrency(f.pricePerVideo)}</span>
                    <span style={{ color: THEME.accent4, fontSize: '13px' }}>완료 {f.completedCount}건</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(f); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(f.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FreelancerModal editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platformsAndChannels={platformsAndChannels} />
      )}

      <Footer />
    </div>
  );
}

function FreelancerModal({ editData, onSave, onClose, isLoading }) {
  const [form, setForm] = useState(editData || { name: '', contact: '', assignedChannel: '', weeklyAssigned: 0, completedCount: 0, pricePerVideo: '', editProgram: '', memo: '' });

  const handleSubmit = () => {
    if (!form.name) { alert('편집자명은 필수입니다.'); return; }
    onSave({ ...form, pricePerVideo: Number(form.pricePerVideo) || 0 });
  };

  return (
    <ModalWrapper title={editData ? '편집자 수정' : '편집자 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div><label style={labelStyle}>편집자명 *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="이름" style={inputStyle} /></div>
        <div><label style={labelStyle}>연락처</label><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="010-0000-0000" style={inputStyle} /></div>
        <div><label style={labelStyle}>전담채널</label><input value={form.assignedChannel} onChange={(e) => setForm({ ...form, assignedChannel: e.target.value })} placeholder="담당 채널" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>이번주 할당</label><input type="number" value={form.weeklyAssigned} onChange={(e) => setForm({ ...form, weeklyAssigned: Number(e.target.value) })} style={inputStyle} /></div>
          <div><label style={labelStyle}>완료 건수</label><input type="number" value={form.completedCount} onChange={(e) => setForm({ ...form, completedCount: Number(e.target.value) })} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>건당 비용 (원)</label><input type="number" value={form.pricePerVideo} onChange={(e) => setForm({ ...form, pricePerVideo: e.target.value })} placeholder="10000" style={inputStyle} /></div>
        <div><label style={labelStyle}>편집 프로그램</label><input value={form.editProgram} onChange={(e) => setForm({ ...form, editProgram: e.target.value })} placeholder="프리미어, 파이널컷 등" style={inputStyle} /></div>
        <div><label style={labelStyle}>비고</label><input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="메모" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}
