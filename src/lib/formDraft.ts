/**
 * 로그인 리다이렉트 시 폼 데이터를 sessionStorage에 저장/복원하는 유틸리티.
 * File 객체는 저장 불가 — 텍스트 필드만 보존됩니다.
 */

const PREFIX = 'form_draft_';

export function saveDraft(path: string, data: Record<string, unknown>) {
  try {
    sessionStorage.setItem(PREFIX + path, JSON.stringify(data));
  } catch { /* quota exceeded 등 무시 */ }
}

export function loadDraft(path: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + path);
    if (!raw) return null;
    sessionStorage.removeItem(PREFIX + path);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
