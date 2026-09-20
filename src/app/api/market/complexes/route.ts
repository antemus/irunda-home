import { NextResponse } from 'next/server';

const DISTRICT_MAP: Record<string, string> = {
  '31140': '울산 남구',
  '31110': '울산 중구',
  '31200': '울산 북구',
  '31170': '울산 동구',
  '31710': '울산 울주군',
};

// 최근 신축/분양 단지 중 최근 6개월간 일반 매매 거래가 아직 없는 주요 단지 보충 목록
const SUPPLEMENTAL_COMPLEXES: Record<string, { dong: string; aptNm: string }[]> = {
  '31140': [
    { dong: '신정동', aptNm: '울산대공원한신더휴' },
    { dong: '신정동', aptNm: '문수로푸르지오어반피스' },
    { dong: '신정동', aptNm: '힐스테이트문수로센트럴' },
    { dong: '신정동', aptNm: '대공원한신휴플러스' },
    { dong: '야음동', aptNm: '번영로센텀리즈' },
    { dong: '무거동', aptNm: '문수비스타동원' },
  ],
};

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lawdCd = searchParams.get('lawdCd') || '31140';
    const districtName = DISTRICT_MAP[lawdCd] || '울산 남구';

    const apiKey =
      process.env.DATA_GO_KR_API_KEY ||
      process.env.NEXT_PUBLIC_DATA_GO_KR_API_KEY ||
      '66d5d6cabad1c70ec4875ec88db6f73e85c656935d306e72b051eac5fa546a94';

    const months = getRecentYearMonths(6);

    const fetchPromises = months.map(async (ym) => {
      try {
        const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${apiKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${ym}&numOfRows=1000&pageNo=1`;
        const res = await fetch(url, {
          next: { revalidate: 86400 }, // 24시간 캐싱 (하루 1회 갱신)
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return '';
        return await res.text();
      } catch {
        return '';
      }
    });

    const texts = await Promise.all(fetchPromises);

    const byDongSet: Record<string, Set<string>> = {};
    const allSet = new Set<string>();

    texts.forEach((text) => {
      if (!text || !text.includes('<resultCode>000</resultCode>')) return;
      const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      items.forEach((item) => {
        const aptNm = (item[1].match(/<aptNm>(.*?)<\/aptNm>/) || [])[1]?.trim();
        const umdNm = (item[1].match(/<umdNm>(.*?)<\/umdNm>/) || [])[1]?.trim();
        if (aptNm) {
          allSet.add(aptNm);
          if (umdNm) {
            if (!byDongSet[umdNm]) byDongSet[umdNm] = new Set();
            byDongSet[umdNm].add(aptNm);
          }
        }
      });
    });

    // 보조 주요/신축 단지 목록 추가 (신축으로 아직 실거래 신고가 없더라도 드롭다운에 노출)
    const extraList = SUPPLEMENTAL_COMPLEXES[lawdCd] || [];
    extraList.forEach((c) => {
      allSet.add(c.aptNm);
      if (!byDongSet[c.dong]) byDongSet[c.dong] = new Set();
      byDongSet[c.dong].add(c.aptNm);
    });

    // 동별 정렬
    const complexesByDong: Record<string, string[]> = {};
    const dongs = Object.keys(byDongSet).sort((a, b) => a.localeCompare(b, 'ko'));
    dongs.forEach((dong) => {
      complexesByDong[dong] = Array.from(byDongSet[dong]).sort((a, b) =>
        a.localeCompare(b, 'ko')
      );
    });

    const allComplexes = Array.from(allSet).sort((a, b) => a.localeCompare(b, 'ko'));

    return NextResponse.json({
      success: true,
      lawdCd,
      districtName,
      dongs,
      complexesByDong,
      allComplexes,
    });
  } catch (error: any) {
    console.error('Complexes API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
