export interface GeoPoint {
  lat: number;
  lng: number;
}

export function getApproximateCoordinates(lat: number, lng: number, minRadiusMeters = 180, maxRadiusMeters = 300): GeoPoint {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return { lat: 35.5383, lng: 129.3114 };
  }

  const earthRadius = 6378137; // in meters
  const radius = minRadiusMeters + Math.random() * (maxRadiusMeters - minRadiusMeters);
  const angle = Math.random() * 2 * Math.PI;

  const dx = radius * Math.cos(angle);
  const dy = radius * Math.sin(angle);

  const deltaLat = (dy / earthRadius) * (180 / Math.PI);
  const deltaLng = (dx / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

  return {
    lat: Number((lat + deltaLat).toFixed(6)),
    lng: Number((lng + deltaLng).toFixed(6)),
  };
}

export function maskAddress(fullAddress: string): string {
  if (!fullAddress) return '위치 정보 미공개';

  const cleanAddr = fullAddress.trim();
  const tokens = cleanAddr.split(/\s+/);

  if (tokens.length === 0) return '위치 정보 미공개';

  const maskedTokens: string[] = [];

  for (const token of tokens) {
    if (/^\d+(-\d+)?(번지|동|호|층)?$/.test(token)) break;
    if (/^산\d+(-\d+)?$/.test(token)) break;
    if (token.endsWith('빌딩') || token.endsWith('아파트') || token.endsWith('타워') || token.endsWith('상가')) break;

    if (token === '경상북도' || token === '경북') continue;
    if (token === '경상남도' || token === '경남') continue;
    if (token === '울산광역시' || token === '울산시') {
      maskedTokens.push('울산');
      continue;
    }

    maskedTokens.push(token);

    if (token.endsWith('동') || token.endsWith('리') || token.endsWith('가') || token.endsWith('구')) {
      if (token.endsWith('동') || token.endsWith('리') || token.endsWith('가')) break;
    }
  }

  if (maskedTokens.length === 0) {
    return '울산 주요 상권 부근';
  }

  return `${maskedTokens.join(' ')} 부근`;
}

/**
 * 부동산 매매가 포맷터 (억/만원 정밀 변환)
 * 예: 3 -> 매매가 3억원, 7.5 -> 매매가 7억 5,000만원, 30000 -> 매매가 3억원
 */
export function formatSalePrice(val: any): string {
  if (val === undefined || val === null || val === '') return '매매가 문의';
  const num = Number(val);
  if (isNaN(num) || num <= 0) return '매매가 문의';

  // 억 단위 저장된 경우 (예: 3 -> 3억, 7.5 -> 7억 5,000만)
  if (num < 100) {
    const uk = Math.floor(num);
    const remainderMan = Math.round((num - uk) * 10000);
    if (uk > 0 && remainderMan > 0) {
      return `매매가 ${uk}억 ${remainderMan.toLocaleString()}만원`;
    } else if (uk > 0) {
      return `매매가 ${uk}억원`;
    } else {
      return `매매가 ${remainderMan.toLocaleString()}만원`;
    }
  }

  // 만원 단위로 크기 저장된 경우 (예: 30000 -> 3억)
  if (num >= 10000) {
    const uk = Math.floor(num / 10000);
    const man = num % 10000;
    if (man > 0) {
      return `매매가 ${uk}억 ${man.toLocaleString()}만원`;
    }
    return `매매가 ${uk}억원`;
  }

  return `매매가 ${num.toLocaleString()}만원`;
}

/**
 * 건물명/상호명을 은폐하고 매물 보안 및 가시성을 높이는 보안 제목 생성기
 */
export function generateSecureTitle(item: any): string {
  const sigungu = item.sigungu || '울산';
  const bname = item.bname ? `${item.bname} ` : '';
  const trans = item.transaction_type || '임대';
  const pType = item.property_type || '상가점포';

  // 평수 계산
  const areaNum = item.exclusive_area || item.contract_area || item.land_area;
  const pyeongStr = areaNum && !isNaN(Number(areaNum)) ? `${Math.round(Number(areaNum) * 0.3025)}평 ` : '';

  if (pType.includes('상가') || pType.includes('점포')) {
    return `${sigungu} ${bname}${pyeongStr}추천 상가 (${trans})`;
  } else if (pType.includes('오피스텔') || pType.includes('아파트')) {
    return `${sigungu} ${bname}${pyeongStr}${pType} (${trans})`;
  } else if (pType.includes('원룸') || pType.includes('투룸') || pType.includes('주택')) {
    return `${sigungu} ${bname}${pyeongStr}인기 주거 매물 (${trans})`;
  } else if (pType.includes('토지')) {
    return `${sigungu} ${bname}${pyeongStr}토지 매물 (${trans})`;
  }

  return `${sigungu} ${bname}${pyeongStr}${pType} (${trans})`;
}
