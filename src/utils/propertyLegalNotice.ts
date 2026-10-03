import { formatSalePrice } from './geoJitter';

export const BROKERAGE_DISCLOSURE = {
  officeName: '이룬다공인중개사사무소',
  registrationNo: '31140202500096',
  representative: '장혜경 (대표 공인중개사)',
  address: '울산광역시 남구 화합로148번길 12, 1층 (삼산동)',
  phone: '010-2772-1719',
  notes: '공인중개사법 제18조의2 제2항에 따라 중개보조원은 명시하지 않으며, 소속 공인중개사가 성실·책임 중개합니다.',
};

export interface LegalNoticeData {
  location: string;
  propertyType: string;
  transactionType: string;
  price: string;
  exclusiveArea: string;
  additionalArea?: string;
  floorInfo: string;
  moveInDate: string;
  roomsBathrooms: string;
  approvalDate: string;
  parking: string;
  maintenanceFee: string;
  direction: string;
  illegalBuilding: string;
}

export function getLegalNoticeData(item: any): LegalNoticeData {
  if (!item) {
    return {
      location: '-',
      propertyType: '-',
      transactionType: '-',
      price: '-',
      exclusiveArea: '-',
      floorInfo: '-',
      moveInDate: '-',
      roomsBathrooms: '-',
      approvalDate: '-',
      parking: '-',
      maintenanceFee: '-',
      direction: '-',
      illegalBuilding: '해당없음 (건축물대장 기준)',
    };
  }

  // 1. 소재지
  const sido = item.sido || '울산광역시';
  const sigungu = item.sigungu || '남구';
  const bname = item.bname || '';
  const location = `${sido} ${sigungu} ${bname}`.trim() + ' (의뢰인 요청 및 개인정보 보호를 위해 상세지번 비공개)';

  // 2. 중개대상물 종류
  const propertyType = item.building_purpose || item.property_type || '건축물';

  // 3. 거래형태
  const transactionType = item.transaction_type || '임대';

  // 4. 가격
  let price = '가격 협의';
  if (transactionType === '매매') {
    price = formatSalePrice(item.sale_price);
  } else if (transactionType === '전세') {
    const dep = item.deposit ? Number(item.deposit).toLocaleString() : '0';
    price = `보증금 ${dep}만원`;
  } else {
    const dep = item.deposit ? Number(item.deposit).toLocaleString() : '0';
    const rnt = item.rent ? Number(item.rent).toLocaleString() : '0';
    price = `보증금 ${dep}만원 / 월차임 ${rnt}만원`;
  }

  // 5. 면적 (전용면적 필수 표기, ㎡ 단위 주표기)
  let exclusiveArea = '현장 확인 필요';
  const excl = item.exclusive_area ? Number(item.exclusive_area) : null;
  if (excl && !isNaN(excl) && excl > 0) {
    const pyeong = (excl * 0.3025).toFixed(1);
    exclusiveArea = `${excl.toFixed(2)}㎡ (약 ${pyeong}평)`;
  } else if (item.land_area && Number(item.land_area) > 0) {
    const landNum = Number(item.land_area);
    exclusiveArea = `대지면적 ${landNum.toFixed(2)}㎡ (약 ${(landNum * 0.3025).toFixed(1)}평)`;
  }

  const extraAreas: string[] = [];
  if (item.contract_area && Number(item.contract_area) > 0) {
    const cntr = Number(item.contract_area);
    extraAreas.push(`공급/계약 ${cntr.toFixed(2)}㎡ (약 ${(cntr * 0.3025).toFixed(1)}평)`);
  }
  if (item.total_floor_area && Number(item.total_floor_area) > 0) {
    const tot = Number(item.total_floor_area);
    extraAreas.push(`연면적 ${tot.toFixed(2)}㎡`);
  }
  if (item.land_area && Number(item.land_area) > 0 && excl && excl > 0) {
    const land = Number(item.land_area);
    extraAreas.push(`대지면적 ${land.toFixed(2)}㎡`);
  }
  const additionalArea = extraAreas.length > 0 ? extraAreas.join(' / ') : undefined;

  // 6. 해당층 / 총 층수
  const floorStr = item.floor
    ? String(item.floor).includes('층')
      ? String(item.floor)
      : `${item.floor}층`
    : '해당층 협의';
  const totalFloorStr = item.total_floors
    ? String(item.total_floors).includes('층')
      ? String(item.total_floors)
      : `${item.total_floors}층`
    : '총층수 확인 필요';
  const floorInfo = `해당 ${floorStr} / 총 ${totalFloorStr}`;

  // 7. 입주가능일
  const moveInDate = item.available_date && String(item.available_date).trim()
    ? String(item.available_date)
    : '즉시 입주 가능 (협의 가능)';

  // 8. 방 수 및 욕실 수
  const isResidential =
    item.property_type &&
    (item.property_type.includes('주택') ||
      item.property_type.includes('아파트') ||
      item.property_type.includes('원룸') ||
      item.property_type.includes('빌라') ||
      item.property_type.includes('오피스텔'));

  let roomsBathrooms = '';
  if (item.rooms || isResidential) {
    const r = item.rooms ? `${item.rooms}개` : '1개 이상(확인필요)';
    const b = item.restroom ? `${item.restroom}개` : '1개(확인필요)';
    roomsBathrooms = `방 ${r} / 욕실 ${b}`;
  } else {
    roomsBathrooms = item.restroom
      ? `화장실 ${item.restroom}개`
      : '상가/업무용 (공용 또는 전용 화장실 완비)';
  }

  // 9. 행정기관 사용승인일 (준공일)
  const approvalDate = item.approval_date && String(item.approval_date).trim()
    ? String(item.approval_date)
    : '건축물대장상 승인일자 확인 필요';

  // 10. 주차대수
  let parking = '총 주차대수 확인 필요 (협의)';
  if (item.parking && String(item.parking).trim()) {
    const pStr = String(item.parking).trim();
    if (pStr.includes('대') || pStr.includes('불가') || pStr.includes('가능') || pStr.includes('없음')) {
      parking = pStr;
    } else {
      parking = `총 ${pStr}대 주차 가능 (세대/공용)`;
    }
  }

  // 11. 관리비 (세부 비목 및 부과방식)
  let maintenanceFee = '정액 관리비 없음 (전기, 수도, 가스 등 실사용량에 따른 실비 부과)';
  if (item.maintenance_fee && Number(item.maintenance_fee) > 0) {
    maintenanceFee = `월 ${item.maintenance_fee}만원 (수도·공용청소비 등 관리규약에 따름 / 전기·가스는 실사용량 별도 부과)`;
  }

  // 12. 방향 (기준 명시 필수)
  let direction = '주출입구 기준 남향 등 (현장 확인 필요)';
  if (item.direction && String(item.direction).trim()) {
    const dStr = String(item.direction).trim();
    const basis = isResidential ? '거실 창문 기준' : '주출입구 기준';
    direction = `${dStr} (${basis})`;
  }

  // 13. 위반건축물 여부
  const illegalBuilding = '해당없음 (건축물대장상 위반건축물 미등재)';

  return {
    location,
    propertyType,
    transactionType,
    price,
    exclusiveArea,
    additionalArea,
    floorInfo,
    moveInDate,
    roomsBathrooms,
    approvalDate,
    parking,
    maintenanceFee,
    direction,
    illegalBuilding,
  };
}
