/**
 * 문의 접수 유효성 검사 및 스팸 필터링 유틸리티
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  cleanName?: string;
  cleanPhone?: string;
}

const SPAM_KEYWORDS = [
  'http://',
  'https://',
  'www.',
  'casino',
  '토토',
  '바카라',
  '카지노',
  '슬롯',
  '성인',
  '비아그라',
  '시알리스',
  '대출',
  '고객님인출',
  '텔레그램',
  '라인id',
  'telegram',
  '암호화폐',
  '비트코인',
  '코인투자',
  '주식리딩',
];

const FAKE_PHONE_PATTERNS = [
  '01000000000',
  '01011111111',
  '01022222222',
  '01033333333',
  '01044444444',
  '01055555555',
  '01066666666',
  '01077777777',
  '01088888888',
  '01099999999',
  '01012345678',
  '01087654321',
];

/**
 * 한국 전화번호 하이픈(-) 자동 변환
 */
export function formatPhoneNumber(input: string): string {
  const clean = input.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (clean.length === 10) {
    if (clean.startsWith('02')) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  if (clean.length === 9 && clean.startsWith('02')) {
    return clean.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return input;
}

/**
 * 성함, 연락처, 내용 필터링 검사
 */
export function validateInquiry(name: string, phone: string, message?: string): ValidationResult {
  // 1. 성함(이름) 검사
  const trimmedName = (name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { isValid: false, errorMessage: '성함을 2자 이상 입력해 주세요.' };
  }

  if (/^[0-9]+$/.test(trimmedName) || /^[^a-zA-Z0-9가-힣]+$/.test(trimmedName)) {
    return { isValid: false, errorMessage: '올바른 성함을 입력해 주세요.' };
  }

  // 2. 연락처 검사
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
    return { isValid: false, errorMessage: '올바른 전화번호를 입력해 주세요 (9~11자리 숫자).' };
  }

  const validPrefixes = ['010', '011', '016', '017', '018', '019', '052', '070', '02', '031', '032', '033', '041', '042', '043', '051', '053', '054', '055'];
  const hasValidPrefix = validPrefixes.some((prefix) => cleanPhone.startsWith(prefix));
  if (!hasValidPrefix) {
    return { isValid: false, errorMessage: '유효한 지역번호 또는 휴대폰 번호(010 등)를 입력해 주세요.' };
  }

  if (FAKE_PHONE_PATTERNS.includes(cleanPhone)) {
    return { isValid: false, errorMessage: '정확한 실제 연락처를 입력해 주세요.' };
  }

  // 3. 스팸 키워드 및 링크 검사
  const fullContent = `${trimmedName} ${message || ''}`.toLowerCase();
  for (const keyword of SPAM_KEYWORDS) {
    if (fullContent.includes(keyword)) {
      return { isValid: false, errorMessage: '스팸 또는 비정상적인 문구가 포함되어 접수할 수 없습니다.' };
    }
  }

  return {
    isValid: true,
    cleanName: trimmedName,
    cleanPhone: formatPhoneNumber(cleanPhone),
  };
}
