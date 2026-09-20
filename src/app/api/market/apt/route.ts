import { NextResponse } from 'next/server';

interface TradeItem {
  aptNm: string;
  aptDong?: string;
  dealAmount: number; // 만원 단위 (숫자)
  dealAmountFormatted: string; // e.g. "3억 7,800만"
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  dealDate: string; // YYYY.MM.DD
  excluUseAr: number; // 전용면적 ㎡
  pyeong: number; // 평수 (전용)
  standardExclu: number; // 기준 전용면적 (예: 59, 84, 114)
  supplyArea: number; // 공급면적 ㎡
  supplyPyeong: number; // 공급 평형
  typeLetter?: string; // e.g. "A", "B"
  typeName?: string; // e.g. "84A", "84B"
  areaType: string; // e.g. "전용 84㎡ (공급 112㎡ · 34평)"
  floor: number;
  buildYear?: string;
  umdNm?: string;
  jibun?: string;
  cdealType?: string; // 해제 여부
  dealingGbn?: string; // 중개거래 / 직거래
  rgstDate?: string; // 등기일자
}

function parseXmlItems(xmlText: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    const obj: Record<string, string> = {};
    const fieldRegex = /<([a-zA-Z0-9]+)>([\s\S]*?)<\/\1>/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(itemContent)) !== null) {
      obj[fieldMatch[1]] = fieldMatch[2].trim();
    }
    items.push(obj);
  }
  return items;
}

function formatKoreanPrice(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${manwon.toLocaleString()}만`;
}

function calculateSupplyInfo(excluArea: number) {
  let exclu = Math.round(excluArea);
  let supplyArea = 0;
  let supplyPyeong = 0;

  // 한국 아파트 대표 표준 평형 정규화 (59타입, 74타입, 84타입, 101타입, 114타입 등)
  if (excluArea >= 58 && excluArea < 61) {
    exclu = 59;
    supplyArea = 80;
    supplyPyeong = 24;
  } else if (excluArea >= 72 && excluArea < 77) {
    exclu = 74;
    supplyArea = 100;
    supplyPyeong = 30;
  } else if (excluArea >= 83 && excluArea < 86) {
    exclu = 84;
    supplyArea = 112;
    supplyPyeong = 34;
  } else if (excluArea >= 100 && excluArea < 104) {
    exclu = 101;
    supplyArea = 132;
    supplyPyeong = 40;
  } else if (excluArea >= 113 && excluArea < 119) {
    exclu = 114;
    supplyArea = 150;
    supplyPyeong = 45;
  } else if (excluArea >= 125 && excluArea < 136) {
    exclu = 128;
    supplyArea = 168;
    supplyPyeong = 51;
  } else if (excluArea >= 48 && excluArea < 53) {
    exclu = 49;
    supplyArea = 68;
    supplyPyeong = 20;
  } else {
    supplyArea = Math.round(excluArea / 0.76);
    supplyPyeong = Math.round(supplyArea / 3.30578);
  }

  return {
    standardExclu: exclu,
    supplyArea,
    supplyPyeong,
    displayLabel: `전용 ${exclu}㎡ (공급 ${supplyArea}㎡ · ${supplyPyeong}평형)`,
  };
}

// 최근 신축 단지 메타데이터 (국토부 매매 실거래 신고 이전인 신축/분양 단지 지원용)
const NEW_COMPLEX_METADATA: Record<
  string,
  {
    aptName: string;
    umdNm: string;
    buildYear: string;
    totalHouseholds?: number;
    description?: string;
    areaGroups?: {
      standardExclu: number;
      supplyArea: number;
      supplyPyeong: number;
      count: number;
      subTypes: {
        typeLetter: string;
        typeName: string;
        excluUseAr: number;
        count: number;
      }[];
    }[];
  }
> = {
  '울산대공원한신더휴': {
    aptName: '울산대공원한신더휴',
    umdNm: '신정동',
    buildYear: '2025',
    totalHouseholds: 302,
    description: '2025년 8월 준공(입주)된 울산 남구 신정동의 프리미엄 신축 주거복합 단지입니다.',
    areaGroups: [
      {
        standardExclu: 62,
        supplyArea: 83,
        supplyPyeong: 25,
        count: 0,
        subTypes: [{ typeLetter: '', typeName: '62', excluUseAr: 62.0, count: 0 }],
      },
      {
        standardExclu: 72,
        supplyArea: 96,
        supplyPyeong: 29,
        count: 0,
        subTypes: [{ typeLetter: '', typeName: '72', excluUseAr: 72.0, count: 0 }],
      },
      {
        standardExclu: 84,
        supplyArea: 112,
        supplyPyeong: 34,
        count: 0,
        subTypes: [
          { typeLetter: 'A', typeName: '84A', excluUseAr: 84.1, count: 0 },
          { typeLetter: 'B', typeName: '84B', excluUseAr: 84.8, count: 0 },
          { typeLetter: 'C', typeName: '84C', excluUseAr: 84.9, count: 0 },
        ],
      },
    ],
  },
  '문수로푸르지오어반피스': {
    aptName: '문수로푸르지오어반피스',
    umdNm: '신정동',
    buildYear: '2025',
    totalHouseholds: 339,
    description: '2025년 준공된 신정동 푸르지오 신축 단지입니다.',
    areaGroups: [
      {
        standardExclu: 84,
        supplyArea: 112,
        supplyPyeong: 34,
        count: 0,
        subTypes: [
          { typeLetter: 'A', typeName: '84A', excluUseAr: 84.1, count: 0 },
          { typeLetter: 'B', typeName: '84B', excluUseAr: 84.8, count: 0 },
        ],
      },
    ],
  },
  '힐스테이트문수로센트럴': {
    aptName: '힐스테이트문수로센트럴',
    umdNm: '신정동',
    buildYear: '2024',
    totalHouseholds: 602,
    description: '2024년 준공된 신정동 힐스테이트 랜드마크 신축 단지입니다.',
    areaGroups: [
      {
        standardExclu: 84,
        supplyArea: 112,
        supplyPyeong: 34,
        count: 0,
        subTypes: [{ typeLetter: 'A', typeName: '84A', excluUseAr: 84.2, count: 0 }],
      },
    ],
  },
  '번영로센텀리즈': {
    aptName: '번영로센텀리즈',
    umdNm: '야음동',
    buildYear: '2024',
    totalHouseholds: 288,
    description: '2024년 준공된 야음동 신축 주거단지입니다.',
    areaGroups: [
      {
        standardExclu: 84,
        supplyArea: 112,
        supplyPyeong: 34,
        count: 0,
        subTypes: [{ typeLetter: 'A', typeName: '84A', excluUseAr: 84.0, count: 0 }],
      },
    ],
  },
};

function cleanAptName(name: string): string {
  return (name || '')
    .replace(/\s+/g, '')
    .replace(/(아파트|apt|단지)$/gi, '')
    .replace(/[\(\)\-\_\,\.]/g, '')
    .toLowerCase();
}

// 정확도 기반 단지명 매칭 점수 계산기 (0 ~ 100점)
function calculateMatchScore(query: string, candidate: string): number {
  const q = cleanAptName(query);
  const c = cleanAptName(candidate);
  if (!q || !c) return 0;

  // 1. 완전 일치 (100점)
  if (q === c) return 100;

  // 2. 후보가 검색어를 완전히 포함 (예: 검색어 '한신휴플러스' -> 후보 '대공원한신휴플러스')
  if (c.includes(q)) {
    return 80 + Math.max(0, 15 - (c.length - q.length));
  }

  // 3. 검색어가 후보를 포함 (예: 검색어 '울산대공원한신더휴아파트' -> 후보 '대공원한신더휴')
  // 주의: '공원', '한신' 같은 짧은 2글자 일반 단어가 긴 검색어에 포함되어 잘못 매칭되는 것 엄격 차단
  if (q.includes(c)) {
    if (c.length >= 4 && c.length >= q.length * 0.6) {
      return 60 + Math.max(0, 15 - (q.length - c.length));
    }
    return 0; // 2~3글자 단어 및 너무 짧은 후보는 오매칭 방지
  }

  return 0;
}

function getRecentYearMonths(count: number = 6): string[] {
  const list: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    list.push(`${y}${m}`);
  }
  return list;
}

async function fetchMonthTrades(apiKey: string, lawdCd: string, dealYmd: string): Promise<any[]> {
  try {
    const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${apiKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=1000&pageNo=1`;
    // Next.js fetch 캐싱 (1시간 = 3600초)
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];
    const text = await res.text();
    if (!text.includes('<resultCode>000</resultCode>')) return [];

    return parseXmlItems(text);
  } catch (err) {
    console.error(`RTMS fetch error for ${lawdCd} ${dealYmd}:`, err);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const aptParam = searchParams.get('apt') || searchParams.get('name') || '';
    const lawdCdParam = searchParams.get('lawdCd') || '31140'; // 기본 울산 남구
    const monthsParam = parseInt(searchParams.get('months') || '6', 10);

    const apiKey =
      process.env.DATA_GO_KR_API_KEY ||
      process.env.NEXT_PUBLIC_DATA_GO_KR_API_KEY ||
      '66d5d6cabad1c70ec4875ec88db6f73e85c656935d306e72b051eac5fa546a94';

    if (!apiKey) {
      return NextResponse.json({ error: 'Public Data API key is not configured' }, { status: 500 });
    }

    const yearMonths = getRecentYearMonths(monthsParam);

    // 1차 조회 (지정된 시군구코드)
    let rawItems: any[] = [];
    const fetchPromises = yearMonths.map((ym) => fetchMonthTrades(apiKey, lawdCdParam, ym));
    const results = await Promise.all(fetchPromises);
    results.forEach((arr) => {
      rawItems.push(...arr);
    });

    let filteredRaw: any[] = [];

    if (aptParam) {
      // 1. 현재 구(남구 등) 내에서 가장 높은 매칭 점수를 가진 단지명 찾기
      const candidateScores = new Map<string, number>();
      for (const item of rawItems) {
        const name = item.aptNm || '';
        if (!name || candidateScores.has(name)) continue;
        const score = calculateMatchScore(aptParam, name);
        if (score >= 60) {
          candidateScores.set(name, score);
        }
      }

      let bestAptNm: string | null = null;
      let bestScore = 0;
      candidateScores.forEach((score, name) => {
        if (score > bestScore) {
          bestScore = score;
          bestAptNm = name;
        }
      });

      if (bestAptNm) {
        filteredRaw = rawItems.filter((i) => i.aptNm === bestAptNm);
      }

      // 2. 현재 구에서 못 찾은 경우 울산의 다른 구 순차 검색 (Score >= 60 점수 높은 것만 인정)
      if (filteredRaw.length === 0 && lawdCdParam === '31140') {
        const otherUlsanDistricts = ['31110', '31200', '31170', '31710']; // 중구, 북구, 동구, 울주군
        for (const altCd of otherUlsanDistricts) {
          const altPromises = yearMonths.map((ym) => fetchMonthTrades(apiKey, altCd, ym));
          const altResults = await Promise.all(altPromises);
          const altItems: any[] = [];
          altResults.forEach((arr) => altItems.push(...arr));

          let altBestNm: string | null = null;
          let altBestScore = 0;
          const altScores = new Map<string, number>();

          for (const item of altItems) {
            const name = item.aptNm || '';
            if (!name || altScores.has(name)) continue;
            const score = calculateMatchScore(aptParam, name);
            if (score >= 60) {
              altScores.set(name, score);
            }
          }

          altScores.forEach((score, name) => {
            if (score > altBestScore) {
              altBestScore = score;
              altBestNm = name;
            }
          });

          if (altBestNm) {
            filteredRaw = altItems.filter((i) => i.aptNm === altBestNm);
            break;
          }
        }
      }

      // 3. 국토부 실거래 데이터가 0건인 경우:
      // 신축 단지 메타데이터(NEW_COMPLEX_METADATA) 확인
      if (filteredRaw.length === 0) {
        let matchedMetaKey: string | null = null;
        let matchedMetaScore = 0;

        for (const key of Object.keys(NEW_COMPLEX_METADATA)) {
          const score = calculateMatchScore(aptParam, key);
          if (score >= 60 && score > matchedMetaScore) {
            matchedMetaScore = score;
            matchedMetaKey = key;
          }
        }

        if (matchedMetaKey) {
          const meta = NEW_COMPLEX_METADATA[matchedMetaKey];
          return NextResponse.json({
            success: true,
            isNewComplex: true,
            aptName: meta.aptName,
            umdNm: meta.umdNm,
            buildYear: meta.buildYear,
            totalHouseholds: meta.totalHouseholds,
            description: meta.description,
            periodMonths: monthsParam,
            stats: {
              totalDeals: 0,
              latestDeal: null,
              priceDiff: 0,
              priceDiffFormatted: '',
              maxPrice: 0,
              maxPriceFormatted: '-',
              minPrice: 0,
              minPriceFormatted: '-',
              avgPrice: 0,
              avgPriceFormatted: '-',
            },
            areaGroups: meta.areaGroups || [],
            areaTypes: meta.areaGroups?.map((g: any) => `${g.supplyPyeong}평`) || [],
            monthlyTrend: [],
            trades: [],
          });
        }
      }
    }

    // 데이터 가공 및 표준화
    const trades: TradeItem[] = filteredRaw
      .filter((i) => {
        // 취소/해제된 계약 제외 (cdealType === 'O' 또는 값이 있는 경우)
        if (i.cdealType && i.cdealType.trim() !== '') return false;
        return true;
      })
      .map((i) => {
        const dealAmountRaw = parseInt((i.dealAmount || '0').replace(/,/g, '').trim(), 10);
        const excluArea = parseFloat(i.excluUseAr || '0');
        const pyeong = Math.round((excluArea / 3.30578) * 10) / 10;
        const supplyInfo = calculateSupplyInfo(excluArea);

        const y = parseInt(i.dealYear, 10);
        const m = parseInt(i.dealMonth, 10);
        const d = parseInt(i.dealDay, 10);
        const dealDate = `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;

        return {
          aptNm: i.aptNm || '',
          aptDong: i.aptDong ? `${i.aptDong}동` : '',
          dealAmount: dealAmountRaw,
          dealAmountFormatted: formatKoreanPrice(dealAmountRaw),
          dealYear: y,
          dealMonth: m,
          dealDay: d,
          dealDate,
          excluUseAr: excluArea,
          pyeong,
          standardExclu: supplyInfo.standardExclu,
          supplyArea: supplyInfo.supplyArea,
          supplyPyeong: supplyInfo.supplyPyeong,
          areaType: supplyInfo.displayLabel,
          floor: parseInt(i.floor || '0', 10),
          buildYear: i.buildYear || '',
          umdNm: i.umdNm || '',
          jibun: i.jibun || '',
          cdealType: i.cdealType || '',
          dealingGbn: i.dealingGbn || '중개거래',
          rgstDate: i.rgstDate || '',
        };
      })
      // 계약일자 최신순 정렬
      .sort((a, b) => {
        if (a.dealYear !== b.dealYear) return b.dealYear - a.dealYear;
        if (a.dealMonth !== b.dealMonth) return b.dealMonth - a.dealMonth;
        return b.dealDay - a.dealDay;
      });

    // 아파트 대표 정보 산출
    const representativeName = trades[0]?.aptNm || aptParam || '아파트';
    const representativeDong = trades[0]?.umdNm || '';
    const buildYear = trades[0]?.buildYear || '';

    // 통계 계산
    const prices = trades.map((t) => t.dealAmount);
    const latestDeal = trades[0] || null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    // 1. standardExclu별 소수점 고유 면적 수집 및 A, B, C... 타입 매핑
    const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const excluMap = new Map<number, Set<number>>();
    trades.forEach((t) => {
      if (!excluMap.has(t.standardExclu)) {
        excluMap.set(t.standardExclu, new Set());
      }
      excluMap.get(t.standardExclu)!.add(t.excluUseAr);
    });

    const typeMapping: Record<string, { typeLetter: string; typeName: string }> = {};
    excluMap.forEach((set, stdExclu) => {
      const sortedAreas = Array.from(set).sort((a, b) => a - b);
      if (sortedAreas.length > 1) {
        sortedAreas.forEach((area, idx) => {
          const letter = LETTERS[idx] || String.fromCharCode(65 + idx);
          typeMapping[`${stdExclu}_${area}`] = {
            typeLetter: letter,
            typeName: `${stdExclu}${letter}`,
          };
        });
      } else if (sortedAreas.length === 1) {
        typeMapping[`${stdExclu}_${sortedAreas[0]}`] = {
          typeLetter: '',
          typeName: `${stdExclu}`,
        };
      }
    });

    // 각 trade에 typeLetter 및 typeName 반영
    trades.forEach((t) => {
      const mapped = typeMapping[`${t.standardExclu}_${t.excluUseAr}`];
      t.typeLetter = mapped?.typeLetter || '';
      t.typeName = mapped?.typeName || `${t.standardExclu}`;
    });

    // 평형(면적) 목록 추출
    const areaTypesSet = new Set<string>();
    trades.forEach((t) => areaTypesSet.add(t.areaType));
    const areaTypes = Array.from(areaTypesSet).sort((a, b) => {
      const numA = parseInt((a.match(/\d+/) || ['0'])[0], 10);
      const numB = parseInt((b.match(/\d+/) || ['0'])[0], 10);
      return numA - numB;
    });

    // 각 표준 평형별 메타데이터 및 하위 A/B 타입 목록 (전용/공급 및 평/㎡ 변환 지원용)
    const groupsMap = new Map<number, {
      standardExclu: number;
      supplyArea: number;
      supplyPyeong: number;
      count: number;
      subTypes: {
        typeLetter: string;
        typeName: string;
        excluUseAr: number;
        count: number;
      }[];
    }>();

    trades.forEach((t) => {
      const existing = groupsMap.get(t.standardExclu);
      if (existing) {
        existing.count += 1;
        const sub = existing.subTypes.find((s) => s.excluUseAr === t.excluUseAr);
        if (sub) {
          sub.count += 1;
        } else {
          existing.subTypes.push({
            typeLetter: t.typeLetter || '',
            typeName: t.typeName || `${t.standardExclu}`,
            excluUseAr: t.excluUseAr,
            count: 1,
          });
        }
      } else {
        groupsMap.set(t.standardExclu, {
          standardExclu: t.standardExclu,
          supplyArea: t.supplyArea,
          supplyPyeong: t.supplyPyeong,
          count: 1,
          subTypes: [
            {
              typeLetter: t.typeLetter || '',
              typeName: t.typeName || `${t.standardExclu}`,
              excluUseAr: t.excluUseAr,
              count: 1,
            },
          ],
        });
      }
    });

    const areaGroups = Array.from(groupsMap.values()).sort(
      (a, b) => a.standardExclu - b.standardExclu
    );
    areaGroups.forEach((g) => {
      g.subTypes.sort((a, b) => a.excluUseAr - b.excluUseAr);
    });

    // 가장 최근 거래 평형과 동일한 이전 거래가와의 가격 변동 계산
    let priceDiff = 0;
    let priceDiffFormatted = '';
    if (latestDeal) {
      const sameAreaPrevious = trades.find(
        (t, idx) => idx > 0 && t.areaType === latestDeal.areaType
      );
      if (sameAreaPrevious) {
        priceDiff = latestDeal.dealAmount - sameAreaPrevious.dealAmount;
        if (priceDiff > 0) {
          priceDiffFormatted = `▲ ${formatKoreanPrice(priceDiff)} 상승`;
        } else if (priceDiff < 0) {
          priceDiffFormatted = `▼ ${formatKoreanPrice(Math.abs(priceDiff))} 하락`;
        } else {
          priceDiffFormatted = '보합 (동일)';
        }
      }
    }

    // 월별 평균 추이 집계 (최근 6개월)
    const monthlySummary: Record<string, { total: number; count: number }> = {};
    yearMonths.forEach((ym) => {
      monthlySummary[ym] = { total: 0, count: 0 };
    });
    trades.forEach((t) => {
      const ym = `${t.dealYear}${String(t.dealMonth).padStart(2, '0')}`;
      if (monthlySummary[ym]) {
        monthlySummary[ym].total += t.dealAmount;
        monthlySummary[ym].count += 1;
      }
    });

    const monthlyTrend = yearMonths.reverse().map((ym) => {
      const s = monthlySummary[ym] || { total: 0, count: 0 };
      const avg = s.count > 0 ? Math.round(s.total / s.count) : 0;
      const formattedMonth = `${ym.slice(4)}월`;
      return {
        ym,
        label: formattedMonth,
        avgPrice: avg,
        avgPriceFormatted: avg > 0 ? formatKoreanPrice(avg) : '-',
        count: s.count,
      };
    });

    return NextResponse.json({
      success: true,
      aptName: representativeName,
      umdNm: representativeDong,
      buildYear,
      periodMonths: monthsParam,
      stats: {
        totalDeals: trades.length,
        latestDeal,
        priceDiff,
        priceDiffFormatted,
        maxPrice,
        maxPriceFormatted: formatKoreanPrice(maxPrice),
        minPrice,
        minPriceFormatted: formatKoreanPrice(minPrice),
        avgPrice,
        avgPriceFormatted: formatKoreanPrice(avgPrice),
      },
      areaGroups,
      areaTypes,
      monthlyTrend,
      trades,
    });
  } catch (error: any) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
