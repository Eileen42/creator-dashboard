import React, { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { THEME } from './config';
import { callBackend } from './api';
import { PageHeader, Footer, EmptyState, ModalWrapper, inputStyle, labelStyle } from '../common';

export default function ChannelsPage({ channels, spreadsheetId, onReload, onBack, platformsAndChannels }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const brandList = channels.reduce((acc, ch) => {
    if (ch.brand && !acc.find(b => b.name === ch.brand)) acc.push({ name: ch.brand, color: ch.brandColor });
    return acc;
  }, []);

  const handleSave = async (data) => {
    setIsLoading(true);
    await callBackend('saveChannel', { spreadsheetId, channelData: data });
    await onReload();
    setShowModal(false);
    setEditItem(null);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setIsLoading(true);
      await callBackend('deleteChannel', { spreadsheetId, channelId: id });
      await onReload();
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="채널 관리" onBack={onBack} onAdd={() => { setEditItem(null); setShowModal(true); }} />
      
      {channels.length === 0 ? (
        <EmptyState icon="📺" title="등록된 채널이 없습니다" desc="새 채널을 추가해보세요" />
      ) : (
        <div style={{ padding: '0 24px' }}>
          {channels.map((ch) => (
            <div key={ch.id} style={{ background: THEME.bgSecondary, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: THEME.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: ch.brandColor || THEME.accent1, color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{ch.brand}</div>
                  <div>
                    <div style={{ color: THEME.textPrimary, fontWeight: '600' }}>{ch.channelName}</div>
                    <div style={{ color: THEME.textSecondary, fontSize: '13px' }}>{ch.platform}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(ch); setShowModal(true); }} style={{ background: THEME.bgTertiary, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Pencil size={16} color={THEME.textSecondary} /></button>
                  <button onClick={() => handleDelete(ch.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} color={THEME.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ChannelModal brandList={brandList} editData={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} isLoading={isLoading} platforms={platformsAndChannels?.platforms || []} />
      )}

      <Footer />
    </div>
  );
}

function ChannelModal({ brandList, editData, onSave, onClose, isLoading, platforms }) {
  const [form, setForm] = useState(editData || { brand: '', brandColor: THEME.accent1, platform: '유튜브', channelName: '', accountId: '', password: '', channelUrl: '' });
  const [isNewBrand, setIsNewBrand] = useState(!editData && brandList.length === 0);
  const colorOptions = [THEME.accent1, THEME.accent2, THEME.accent3, THEME.accent4, THEME.accent5, '#EC4899'];

  const handleBrandSelect = (name) => {
    const existing = brandList.find(b => b.name === name);
    setForm({ ...form, brand: name, brandColor: existing?.color || THEME.accent1 });
  };

  const handleSubmit = () => {
    if (!form.brand || !form.channelName) { alert('브랜드명과 채널명은 필수입니다.'); return; }
    onSave(form);
  };

  return (
    <ModalWrapper title={editData ? '채널 수정' : '새 채널 추가'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>브랜드 *</label>
          {!isNewBrand && brandList.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={form.brand} onChange={(e) => handleBrandSelect(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="">브랜드 선택</option>
                {brandList.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <button onClick={() => setIsNewBrand(true)} style={{ background: `${THEME.accent2}15`, border: 'none', borderRadius: '10px', padding: '12px 16px', color: THEME.accent2, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ 새 브랜드</button>
            </div>
          ) : (
            <div>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="새 브랜드 이름" style={inputStyle} />
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                {colorOptions.map(c => <button key={c} onClick={() => setForm({ ...form, brandColor: c })} style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, border: form.brandColor === c ? '3px solid #1A1D26' : 'none', cursor: 'pointer' }} />)}
              </div>
              {brandList.length > 0 && <button onClick={() => setIsNewBrand(false)} style={{ marginTop: '10px', background: 'none', border: 'none', color: THEME.accent1, fontSize: '13px', cursor: 'pointer' }}>← 기존 브랜드 선택</button>}
            </div>
          )}
        </div>
        <div><label style={labelStyle}>플랫폼 *</label><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} style={inputStyle}>{platforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
        <div><label style={labelStyle}>채널명 *</label><input value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })} placeholder="채널 이름" style={inputStyle} /></div>
        <div><label style={labelStyle}>계정아이디</label><input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="@username" style={inputStyle} /></div>
        <div><label style={labelStyle}>비밀번호</label><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="비밀번호" style={inputStyle} /></div>
        <div><label style={labelStyle}>채널 URL</label><input value={form.channelUrl} onChange={(e) => setForm({ ...form, channelUrl: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
        <button onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, border: 'none', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{isLoading ? '저장 중...' : '저장'}</button>
      </div>
    </ModalWrapper>
  );
}
