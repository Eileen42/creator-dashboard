import { CONFIG } from './config';

// ============================================
// 백엔드 API 호출
// ============================================
export async function callBackend(action, params = {}) {
  const url = new URL(CONFIG.APPS_SCRIPT_URL);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => {
    if (typeof params[key] === 'object') {
      url.searchParams.append(key, JSON.stringify(params[key]));
    } else {
      url.searchParams.append(key, params[key]);
    }
  });
  
  try {
    const response = await fetch(url.toString());
    return await response.json();
  } catch (error) {
    console.error('Backend error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 숫자 포맷 함수들
// ============================================
export function formatNumber(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
  if (num >= 10000) return (num / 10000).toFixed(0) + '만';
  return num?.toLocaleString() || '0';
}

export function formatCurrency(num) {
  return '₩' + (num?.toLocaleString() || '0');
}

// ============================================
// 날짜 포맷 함수
// ============================================
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateKR(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
