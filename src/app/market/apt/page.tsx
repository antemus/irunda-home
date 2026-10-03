'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
  Search,
  Sparkles,
  MapPin,
  ChevronDown,
  X,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface TradeItem {
  aptNm: string;
  aptDong?: string;
  tradeType?: 'trade' | 'rent';
  rentType?: '전세' | '월세';
  deposit?: number;
  depositFormatted?: string;
  monthlyRent?: number;
  monthlyRentFormatted?: string;
  dealAmount: number;
  dealAmountFormatted: string;
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  dealDate: string;
  excluUseAr: number;
  pyeong: number;
  standardExclu?: number;
  supplyArea?: number;
  supplyPyeong?: number;
  typeLetter?: string;
  typeName?: string;
  areaType: string;
  floor: number;
  buildYear?: string;
  umdNm?: string;
  jibun?: string;
  dealingGbn?: string;
  rgstDate?: string;
  contractType?: string;
  contractTerm?: string;
  useRRRight?: string;
}

interface MonthlyTrendItem {
  ym: string;
  label: string;
  avgPrice: number;
  avgPriceFormatted: string;
  count: number;
  jeonseCount?: number;
  wolseCount?: number;
}

interface SubTypeInfo {
  typeLetter: string;
  typeName: string;
  excluUseAr: number;
  count: number;
}

interface AreaGroup {
  standardExclu: number;
  supplyArea: number;
  supplyPyeong: number;
  count: number;
  subTypes?: SubTypeInfo[];
}

interface MarketData {
  success: boolean;
  tradeType?: 'trade' | 'rent';
  keyNotRegistered?: boolean;
  aptName: string;
  umdNm: string;
  buildYear: string;
  periodMonths: number;
  isNewComplex?: boolean;
  totalHouseholds?: number;
  description?: string;
  stats: {
    totalDeals: number;
    jeonseCount?: number;
    wolseCount?: number;
    latestDeal: TradeItem | null;
    priceDiff: number;
    priceDiffFormatted: string;
    maxPrice: number;
    maxPriceFormatted: string;
    minPrice: number;
    minPriceFormatted: string;
    avgPrice: number;
    avgPriceFormatted: string;
    avgWolseDeposit?: number;
    avgWolseDepositFormatted?: string;
    avgMonthlyRent?: number;
    avgMonthlyRentFormatted?: string;
  };
  areaGroups?: AreaGroup[];
  areaTypes: string[];
  monthlyTrend: MonthlyTrendItem[];
  trades: TradeItem[];
}

const DISTRICTS = [
  { code: '31140', name: '울산 남구' },
  { code: '31110', name: '울산 중구' },
  { code: '31200', name: '울산 북구' },
  { code: '31170', name: '울산 동구' },
  { code: '31710', name: '울산 울주군' },
];

// 단지별 특성, 실거래 통계, 연식 기반 맞춤형 소장 브리핑 생성기
function generateExpertBriefing(data: MarketData, tradeType: 'trade' | 'rent') {
  const { aptName, stats, buildYear, isNewComplex } = data;
  const total = stats.totalDeals;
  const diff = stats.priceDiff;
  const currentYear = new Date().getFullYear();
  const age = buildYear ? currentYear - parseInt(buildYear, 10) : null;

  // A. 전·월세 맞춤 브리핑
  if (tradeType === 'rent') {
    const jeonseCnt = stats.jeonseCount || 0;
    const wolseCnt = stats.wolseCount || 0;

    const intro = `${aptName} 단지의 최근 전·월세 임대차 시장 분석 리포트입니다. ${
      buildYear ? `준공 ${buildYear}년차 단지로 ` : ''
    }생활 인프라와 주거 편의성이 뛰어나 실수요 임차인들의 전월세 문의가 활발한 단지입니다.`;

    let trendComment = '';
    if (jeonseCnt > wolseCnt) {
      trendComment = `최근 6개월간 전세 거래(${jeonseCnt}건)가 월세(${wolseCnt}건) 대비 높은 비중을 보이며, 전세자금대출 및 보증보험 적격 매물 중심의 전세가 강세 흐름을 보이고 있습니다.`;
    } else if (wolseCnt > 0) {
      trendComment = `최근에는 금리 및 보증금 유동성 관리 영향으로 월세·반전세 계약(${wolseCnt}건)과 전세(${jeonseCnt}건)가 고르게 체결되며 임대차 형태가 다양화되고 있습니다.`;
    } else {
      trendComment = `평균 전세 보증금은 약 ${stats.avgPriceFormatted || '시세 형성'}, 월세는 보증금 ${stats.avgWolseDepositFormatted || '3,000만'}에 월 ${stats.avgMonthlyRentFormatted || '70만'} 선으로 안정적인 임대료 흐름을 보입니다.`;
    }

    let volumeComment = '';
    if (total >= 15) {
      volumeComment = `최근 6개월간 총 ${total}건의 전월세 거래가 집계되어 울산 남구 내에서도 뛰어난 임대차 환금성과 회전율을 입증하고 있습니다.`;
    } else if (total >= 5) {
      volumeComment = `최근 6개월간 총 ${total}건의 거래가 꾸준히 이어지며 안정적인 임대 수요를 유지하고 있습니다.`;
    } else {
      volumeComment = `실거주 비율이 높아 전월세 매물이 귀한 편이며, 적정 임대료의 신규 매물 출회 시 빠른 계약 체결이 기대됩니다.`;
    }

    const advice = `임대인(집주인)께서는 공실 위험을 줄이는 적정 보증금 및 월세 전환율 책정이 필수적이며, 임차인(세입자)께서는 전세보증보험 가입 요건과 등기부 융자 유무를 확인한 안전한 계약이 필수입니다. 이룬다부동산에서 가장 안전하게 맞춤 중개해 드립니다.`;

    return { intro, trendComment, volumeComment, advice };
  }

  // B. 매매 맞춤 브리핑 (신축 단지)
  if (isNewComplex || (total === 0 && age !== null && age <= 2)) {
    const intro = `${aptName} 단지는 ${buildYear ? `${buildYear}년 입주(예정)의 ` : ''}최신 프리미엄 신축 주거단지로, 우수한 입지 프리미엄과 최신 주거 설계를 고루 갖추어 실수요자들의 많은 관심을 받고 있는 단지입니다.`;
    const trendComment = `본 단지는 최신 신축 단지로, 현재 국토교통부 일반 매매 신고보다는 분양권·입주권 전매 및 입주 전월세 임대차 시장을 중심으로 활발하게 거래 및 시세가 형성되고 있습니다.`;
    const volumeComment = `신축 아파트 특성상 소유권 이전등기 진행 상황에 맞춰 순차적으로 매매 실거래 신고가 집계될 예정이며, 현재는 개별 동·층·조망·옵션별 프리미엄(P)에 따라 호가가 차등 형성되어 있습니다.`;
    const advice = `${aptName}의 최신 분양권 시세, 급매물 및 로열층 전월세 임대차 계약 문의는 이룬다공인중개사사무소로 문의주시면 실시간 호가 분석과 함께 가장 신속하고 안전하게 중개해 드립니다.`;
    return { intro, trendComment, volumeComment, advice };
  }

  // C. 매매 맞춤 브리핑 (일반 단지)
  let intro = '';
  if (age !== null && age <= 7) {
    intro = `${aptName} 단지는 준공 ${buildYear}년 차의 신축급 프리미엄을 갖추고 있어, 깔끔한 주거 환경과 최신 커뮤니티 시설을 선호하는 실수요자분들의 매수 문의가 꾸준한 단지입니다.`;
  } else if (age !== null && age <= 16) {
    intro = `${aptName} 단지는 인근 학군, 상권 등 생활 편의 인프라가 탄탄히 완성된 준신축 단지로, 실거주 만족도와 두터운 배후 수요를 고루 갖추고 있습니다.`;
  } else if (buildYear) {
    intro = `${aptName} 단지는 안정적인 입지 조건과 우수한 대중교통·학군 접근성을 기반으로 꾸준한 거래 회전율을 유지하는 대표적인 스테디셀러 단지입니다.`;
  } else {
    intro = `${aptName} 단지는 편리한 생활권과 교통망을 바탕으로 지역 내에서 높은 관심을 받고 있는 단지입니다.`;
  }

  let trendComment = '';
  if (diff > 0) {
    trendComment = `최근 실거래가는 직전 거래 대비 ${stats.priceDiffFormatted}하여 로열층 및 선호 타입 중심으로 매도 호가가 단단하게 지지되는 강세 흐름을 보이고 있습니다.`;
  } else if (diff < 0) {
    trendComment = `최근에는 시장 관망세 속에 일부 가격이 조정된 급매물 위주로 손바뀜이 일어났으며, 이는 저점 매수를 준비 중이신 분들께 좋은 진입 기회가 될 수 있습니다.`;
  } else {
    trendComment = `최근 시세는 급격한 등락 없이 안정적인 보합세를 유지하고 있으며, 조망과 일조권 등 개별 동·층에 따른 가격 차별화가 뚜렷하게 나타나고 있습니다.`;
  }

  let volumeComment = '';
  if (total >= 15) {
    volumeComment = `최근 6개월간 총 ${total}건의 활발한 실거래가 집계되어 울산 남구 내에서도 뛰어난 환금성을 입증하고 있습니다.`;
  } else if (total >= 5) {
    volumeComment = `최근 6개월간 총 ${total}건의 거래가 이어지며 실수요 중심의 안정적인 거래 흐름을 유지하고 있습니다.`;
  } else if (total > 0) {
    volumeComment = `실거주 비중이 높아 매물이 귀한 편이며, 적정 호가의 신규 매물이 출회될 경우 빠른 거래 매칭이 기대됩니다.`;
  } else {
    volumeComment = `최근 실거래 집계 건수가 적은 편이므로 매도·매수 시 주변 유사 평형의 호가와 시장 동향을 복합적으로 비교 분석하시는 것을 추천합니다.`;
  }

  const advice = `현재 매도를 고민 중이시라면 단지의 최신 호가와 잔여 매물 경쟁력을 고려한 적정 매도가 산정이 필수적이며, 매수를 희망하신다면 원하시는 평형의 최적 진입 시점을 맞춤 안내해 드리겠습니다.`;

  return { intro, trendComment, volumeComment, advice };
}

function MarketAptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aptParam = searchParams.get('apt') || searchParams.get('name') || '힐스테이트수암(1단지)';
  const lawdCdParam = searchParams.get('lawdCd') || '31140';
  const initialTradeType = ((searchParams.get('tradeType') || searchParams.get('type') || 'trade') === 'rent'
    ? 'rent'
    : 'trade') as 'trade' | 'rent';

  const [tradeType, setTradeType] = useState<'trade' | 'rent'>(initialTradeType);
  const [rentFilter, setRentFilter] = useState<'all' | 'jeonse' | 'wolse'>('all'); // 전월세 세부 필터

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketData | null>(null);
  const [copied, setCopied] = useState(false);

  // 네이버페이 부동산 스타일: 전용/공급 & 평/㎡ 변환 스위치
  const [areaStandard, setAreaStandard] = useState<'supply' | 'exclusive'>('supply');
  const [unitType, setUnitType] = useState<'pyeong' | 'm2'>('pyeong');
  const [selectedStandardExclu, setSelectedStandardExclu] = useState<number | 'all'>('all');
  const [selectedSubType, setSelectedSubType] = useState<string | 'all'>('all');

  // 드롭다운 검색용 상태
  const [selectedDistrict, setSelectedDistrict] = useState<string>(lawdCdParam);
  const [selectedDong, setSelectedDong] = useState<string>('전체');
  const [dongsList, setDongsList] = useState<string[]>([]);
  const [complexesByDong, setComplexesByDong] = useState<Record<string, string[]>>({});
  const [allComplexes, setAllComplexes] = useState<string[]>([]);

  // 텍스트 검색 & 실시간 자동완성
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 1. 단지 실거래 데이터 조회 (tradeType 변경 시 자동 재조회)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          apt: aptParam,
          lawdCd: lawdCdParam,
          months: '6',
          tradeType,
        });
        const res = await fetch(`/api/market/apt?${query.toString()}`);
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error || '실거래가 데이터를 불러오지 못했습니다.');
        }
        setData(result);
        setSearchInput(result.aptName || aptParam);
        setSelectedStandardExclu('all');
        setSelectedSubType('all');
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [aptParam, lawdCdParam, tradeType]);

  // 2. 선택된 구의 동 및 단지 목록 조회 (드롭다운 채우기)
  useEffect(() => {
    async function loadComplexes() {
      try {
        const res = await fetch(`/api/market/complexes?lawdCd=${selectedDistrict}`);
        const json = await res.json();
        if (json.success) {
          setDongsList(json.dongs || []);
          setComplexesByDong(json.complexesByDong || {});
          setAllComplexes(json.allComplexes || []);
        }
      } catch (e) {
        console.error('Failed to load complexes for dropdown:', e);
      }
    }

    loadComplexes();
  }, [selectedDistrict]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNavigateApt = (targetName: string, districtCode: string = selectedDistrict) => {
    setSearchInput(targetName);
    setShowSuggestions(false);
    router.push(
      `/market/apt?apt=${encodeURIComponent(targetName)}&lawdCd=${districtCode}&tradeType=${tradeType}`
    );
  };

  const handleTradeTypeSwitch = (type: 'trade' | 'rent') => {
    setTradeType(type);
    setRentFilter('all');
    router.replace(
      `/market/apt?apt=${encodeURIComponent(aptParam)}&lawdCd=${lawdCdParam}&tradeType=${type}`,
      { scroll: false }
    );
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    const clean = val.trim().toLowerCase();
    if (clean.length >= 1) {
      const matched = allComplexes
        .filter((name) => name.toLowerCase().includes(clean))
        .slice(0, 10);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    handleNavigateApt(trimmed, selectedDistrict);
  };

  // 평형 및 임대구분 필터링된 거래 목록
  const filteredTrades = (data?.trades || []).filter((t) => {
    // 1. 표준 평형 필터
    if (selectedStandardExclu !== 'all' && t.standardExclu !== selectedStandardExclu) {
      return false;
    }
    // 2. A, B 세부 타입 필터
    if (selectedSubType !== 'all' && t.typeLetter !== selectedSubType && t.typeName !== selectedSubType) {
      return false;
    }
    // 3. 전월세 구분 필터 (tradeType === 'rent'일 때)
    if (tradeType === 'rent') {
      if (rentFilter === 'jeonse' && t.rentType !== '전세') return false;
      if (rentFilter === 'wolse' && t.rentType !== '월세') return false;
    }
    return true;
  });

  const activePrices = filteredTrades.map((t) => t.deposit || t.dealAmount);
  const activeMax = activePrices.length > 0 ? Math.max(...activePrices) : 0;
  const activeMin = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const activeLatest = filteredTrades[0] || null;

  function formatPrice(manwon: number): string {
    if (!manwon || manwon <= 0) return '-';
    if (manwon >= 10000) {
      const eok = Math.floor(manwon / 10000);
      const rest = manwon % 10000;
      return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
    }
    return `${manwon.toLocaleString()}만`;
  }

  function getTabLabel(group: AreaGroup): string {
    if (areaStandard === 'supply') {
      return unitType === 'pyeong'
        ? `${group.supplyPyeong || 34}평형`
        : `공급 ${group.supplyArea || 112}㎡`;
    } else {
      return unitType === 'pyeong'
        ? `전용 ${Math.round((group.standardExclu / 3.30578) * 10) / 10}평`
        : `전용 ${group.standardExclu}㎡`;
    }
  }

  function getBadgeLabel(trade: TradeItem): string {
    const typeStr = trade.typeName || (trade.typeLetter ? `${trade.standardExclu}${trade.typeLetter}` : '');
    if (areaStandard === 'supply') {
      const pyeongBase = `${trade.supplyPyeong || 34}평`;
      return typeStr ? `${pyeongBase} (${typeStr})` : pyeongBase;
    } else {
      const m2Base = `전용 ${trade.standardExclu || Math.round(trade.excluUseAr)}㎡`;
      return typeStr ? `${m2Base} (${typeStr})` : m2Base;
    }
  }

  const currentGroup = data?.areaGroups?.find(
    (g) => g.standardExclu === selectedStandardExclu
  );

  let activePriceDiff = 0;
  let activePriceDiffFormatted = '';

  if (activeLatest && data?.trades) {
    const activeIndex = data.trades.indexOf(activeLatest);
    const previousSameAreaDeal = data.trades.find((t, idx) => {
      if (idx <= activeIndex) return false;
      if (tradeType === 'rent' && t.rentType !== activeLatest.rentType) return false;
      if (selectedSubType !== 'all') {
        return t.typeLetter === activeLatest.typeLetter || t.typeName === activeLatest.typeName;
      }
      const targetKey = activeLatest.standardExclu || Math.round(activeLatest.excluUseAr);
      return (t.standardExclu || Math.round(t.excluUseAr)) === targetKey;
    });

    if (previousSameAreaDeal) {
      const currAmt = activeLatest.deposit || activeLatest.dealAmount;
      const prevAmt = previousSameAreaDeal.deposit || previousSameAreaDeal.dealAmount;
      activePriceDiff = currAmt - prevAmt;
      if (activePriceDiff > 0) {
        activePriceDiffFormatted = `▲ ${formatPrice(activePriceDiff)} 상승 (직전 거래 대비)`;
      } else if (activePriceDiff < 0) {
        activePriceDiffFormatted = `▼ ${formatPrice(Math.abs(activePriceDiff))} 하락 (직전 거래 대비)`;
      } else {
        activePriceDiffFormatted = '보합 (직전 거래와 동일)';
      }
    } else {
      activePriceDiffFormatted = '최근 6개월 첫 거래';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-700 font-semibold text-lg">
          {tradeType === 'trade' ? '국토교통부 매매 실거래가 분석 중...' : '국토교통부 전·월세 실거래가 분석 중...'}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          {aptParam} 단지의 최근 거래 데이터를 불러오고 있습니다.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            실거래가 조회 실패
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error || '데이터가 없습니다.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-sky-600 text-white font-medium rounded-xl hover:bg-sky-700 transition"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  const briefing = generateExpertBriefing(data, tradeType);

  return (
    <div className="bg-slate-100 flex flex-col font-sans pb-28 md:pb-12">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white pt-6 pb-8 px-4 sm:px-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          {/* Badge & Share */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold text-sky-200 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              {tradeType === 'trade' ? '국토교통부 매매 공식 실거래' : '국토교통부 전·월세 공식 실거래'}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-xs font-medium bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>주소 복사됨!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>공유하기</span>
                </>
              )}
            </button>
          </div>

          {/* Complex Name & Location */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
            {data.aptName}
          </h1>
          <p className="text-xs sm:text-sm text-sky-200 flex items-center gap-2 mb-4">
            <span>울산광역시 {data.umdNm ? `남구 ${data.umdNm}` : '남구'}</span>
            {data.buildYear && (
              <>
                <span>•</span>
                <span>{data.buildYear}년 준공</span>
              </>
            )}
            <span>•</span>
            <span className="text-sky-300 font-medium">최근 6개월 실거래 분석</span>
          </p>

          {/* 🌟 지역 및 단지 드롭다운 선택기 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 mb-3 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-200 mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>지역 및 단지 선택 (드롭다운)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-sky-200 mb-0.5">구·군</label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedDong('전체');
                    }}
                    className="w-full appearance-none bg-slate-900/80 text-white text-xs font-semibold rounded-xl pl-3 pr-7 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-sky-200 mb-0.5">동 선택</label>
                <div className="relative">
                  <select
                    value={selectedDong}
                    onChange={(e) => setSelectedDong(e.target.value)}
                    className="w-full appearance-none bg-slate-900/80 text-white text-xs font-semibold rounded-xl pl-3 pr-7 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="전체" className="bg-slate-900 text-white">전체 동</option>
                    {dongsList.map((dong) => (
                      <option key={dong} value={dong} className="bg-slate-900 text-white">
                        {dong}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] text-sky-200 mb-0.5">단지 바로가기</label>
                <div className="relative">
                  <select
                    value={
                      (selectedDong === '전체' ? allComplexes : complexesByDong[selectedDong] || []).includes(data.aptName)
                        ? data.aptName
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) handleNavigateApt(e.target.value, selectedDistrict);
                    }}
                    className="w-full appearance-none bg-slate-900/80 text-white text-xs font-semibold rounded-xl pl-3 pr-7 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer truncate"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">단지 선택...</option>
                    {(selectedDong === '전체' ? allComplexes : complexesByDong[selectedDong] || []).map((name) => (
                      <option key={name} value={name} className="bg-slate-900 text-white">
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 2. 텍스트 검색창 (자동완성) */}
          <div ref={searchContainerRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchInput.trim().length >= 1 && suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="단지명 검색 (예: 삼산선경, 문수비스타, 힐스테이트)"
                className="w-full bg-slate-900/80 text-white text-xs sm:text-sm rounded-xl pl-9 pr-20 py-2.5 border border-white/20 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                조회
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-30 w-full mt-1.5 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-white/10 text-[10px] text-sky-200 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>단지명 자동완성</span>
                </div>
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleNavigateApt(name, selectedDistrict)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-sky-600 hover:text-white transition flex items-center justify-between border-b border-white/5 last:border-none"
                  >
                    <span className="font-semibold">{name}</span>
                    <ArrowRight className="w-3 h-3 text-sky-400 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 w-full -mt-4 space-y-4">
        {/* 🌟 1. 화면 메인 매매 ↔ 임대(전·월세) 원클릭 전환 버튼 바 */}
        <div className="bg-white rounded-2xl p-2 shadow-md border border-slate-200/90 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTradeTypeSwitch('trade')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2 ${
                tradeType === 'trade'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-500/40 scale-[1.01]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Building2 className={`w-4 h-4 sm:w-5 sm:h-5 ${tradeType === 'trade' ? 'text-white' : 'text-slate-400'}`} />
              <span>매매 실거래가</span>
              {tradeType === 'trade' && (
                <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-bold ml-1">
                  {data.trades.length}건
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTradeTypeSwitch('rent')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2 ${
                tradeType === 'rent'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/40 scale-[1.01]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <KeyRound className={`w-4 h-4 sm:w-5 sm:h-5 ${tradeType === 'rent' ? 'text-white' : 'text-slate-400'}`} />
              <span>임대 (전·월세)</span>
              {tradeType === 'rent' && (
                <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-bold ml-1">
                  {data.trades.length}건
                </span>
              )}
            </button>
          </div>

          {/* 임대 모드일 때 [전체] [전세만] [월세만] 빠른 서브 전환 바 */}
          {tradeType === 'rent' && (
            <div className="flex items-center justify-between gap-1.5 pt-2 px-1 border-t border-slate-100 flex-wrap">
              <span className="text-xs font-bold text-slate-600">임대 형태:</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'jeonse', 'wolse'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setRentFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      rentFilter === mode
                        ? mode === 'jeonse'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : mode === 'wolse'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode === 'all'
                      ? `전체 (${data.trades.length})`
                      : mode === 'jeonse'
                      ? `전세 (${data.stats.jeonseCount || 0})`
                      : `월세 (${data.stats.wolseCount || 0})`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 국토교통부 전월세 API 키 등록 안내 배너 */}
        {tradeType === 'rent' && data.keyNotRegistered && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>국토교통부 전·월세 실거래가 오픈API 연동 안내</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                공공데이터포털(data.go.kr)에서 <strong>&apos;국토교통부_아파트 전월세 자료&apos;</strong> API [활용신청]을 클릭하시면(자동 즉시 승인), 실시간 전월세 실거래 신고 내역이 자동 연동됩니다.
                <br />
                <span className="text-slate-500 font-medium">(현재는 해당 단지의 제원과 평형에 맞춘 시뮬레이션 데이터를 제공 중입니다.)</span>
              </p>
              <a
                href="https://www.data.go.kr/data/15058017/openapi.do"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition shadow-sm mt-1"
              >
                <span>공공데이터포털 전월세 API 신청 바로가기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 2. Hero Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              {tradeType === 'trade' ? (
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {selectedStandardExclu === 'all'
                ? tradeType === 'trade'
                  ? '가장 최근 매매 실거래가'
                  : '가장 최근 전·월세 실거래'
                : `${activeLatest ? getBadgeLabel(activeLatest) : ''} 최근 ${tradeType === 'trade' ? '매매가' : '전·월세'}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTradeTypeSwitch(tradeType === 'trade' ? 'rent' : 'trade')}
                className="text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                <span>{tradeType === 'trade' ? '임대(전·월세)로 보기' : '매매로 보기'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              {activePriceDiffFormatted && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    activePriceDiff > 0
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      : activePriceDiff < 0
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {activePriceDiffFormatted}
                </span>
              )}
            </div>
          </div>

          {activeLatest ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {activeLatest.dealAmountFormatted}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  ({getBadgeLabel(activeLatest)} · 전용 {activeLatest.excluUseAr}㎡)
                </span>
                {activeLatest.rentType && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeLatest.rentType === '전세'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {activeLatest.rentType}
                  </span>
                )}
                {activeLatest.contractType && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {activeLatest.contractType}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  계약일 {activeLatest.dealDate}
                </span>
                <span>•</span>
                <span>{activeLatest.floor}층</span>
                {activeLatest.aptDong && (
                  <>
                    <span>•</span>
                    <span>{activeLatest.aptDong}</span>
                  </>
                )}
                {activeLatest.contractTerm && (
                  <>
                    <span>•</span>
                    <span className="text-slate-600">기간 {activeLatest.contractTerm}</span>
                  </>
                )}
                {activeLatest.dealingGbn && (
                  <>
                    <span>•</span>
                    <span className="text-sky-600 font-medium">{activeLatest.dealingGbn}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {data.buildYear ? `${data.buildYear}년 신축 단지` : '신축 단지'}
                </span>
                {data.totalHouseholds && (
                  <span className="text-xs text-slate-500 font-medium">
                    총 {data.totalHouseholds}세대
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-900 mb-1.5">
                국토부 실거래 신고 내역 집계 대기 중
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                본 단지는 <strong>{data.buildYear ? `${data.buildYear}년 준공(입주)` : '신축'} 단지</strong>로, 국토교통부 실거래 시스템 기준 최근 일반 매매 실거래 내역이 아직 집계되지 않았습니다. 현재는 <strong>분양권·입주권 전매 및 전월세 임대차</strong> 위주로 시세가 활발히 형성되고 있습니다.
              </p>
              <div className="bg-gradient-to-r from-amber-50 to-sky-50 rounded-xl p-3 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-0.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    신축 분양권/입주권 및 전월세 시세 문의
                  </p>
                  <p className="text-[11px] text-slate-600">
                    실시간 호가, 추천 매물, 동·호수별 프리미엄(P) 분석을 바로 안내해 드립니다.
                  </p>
                </div>
                <a
                  href="tel:010-2772-1719"
                  className="w-full sm:w-auto text-center px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs shadow-sm transition whitespace-nowrap"
                >
                  소장 직통 전화상담
                </a>
              </div>
            </div>
          )}

          {/* 3-Column Quick Stats (매매 vs 전월세 맞춤형 통계) */}
          {tradeType === 'trade' ? (
            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">
                  {data.isNewComplex ? '준공/입주' : '최고 실거래'}
                </p>
                <p className="text-sm font-bold text-rose-600">
                  {data.isNewComplex
                    ? `${data.buildYear || 2025}년`
                    : activeMax > 0
                    ? formatPrice(activeMax)
                    : '-'}
                </p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[11px] text-slate-500 mb-0.5">
                  {data.isNewComplex ? '단지 규모' : '최저 실거래'}
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {data.isNewComplex
                    ? data.totalHouseholds
                      ? `${data.totalHouseholds}세대`
                      : '신축'
                    : activeMin > 0
                    ? formatPrice(activeMin)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">
                  {data.isNewComplex ? '주요 거래' : '매매 건수'}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {data.isNewComplex ? '분양권·전월세' : `${filteredTrades.length}건`}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">전세 평균 보증금</p>
                <p className="text-sm font-bold text-blue-600">
                  {data.stats.avgPriceFormatted !== '-' ? data.stats.avgPriceFormatted : '-'}
                </p>
                <p className="text-[10px] text-slate-400">
                  최고 {data.stats.maxPriceFormatted || '-'}
                </p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[11px] text-slate-500 mb-0.5">월세 평균 시세</p>
                <p className="text-sm font-bold text-emerald-600">
                  {data.stats.avgWolseDepositFormatted && data.stats.avgMonthlyRentFormatted
                    ? `${data.stats.avgWolseDepositFormatted} / ${data.stats.avgMonthlyRentFormatted}`
                    : '-'}
                </p>
                <p className="text-[10px] text-slate-400">보증금 / 월 임대료</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">전·월세 거래량</p>
                <p className="text-sm font-bold text-slate-800">
                  총 {filteredTrades.length}건
                </p>
                <p className="text-[10px] text-slate-500">
                  전세 {data.stats.jeonseCount || 0} · 월세 {data.stats.wolseCount || 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Area Type Tabs with Naver Real Estate-style Toggles & A/B SubTypes */}
        {data.areaGroups && data.areaGroups.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-800">평형 선택</h2>
              </div>

              {/* 🔄 네이버페이 부동산 스타일 전용/공급 & 평/㎡ 변환 스위치 */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setAreaStandard('supply')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      areaStandard === 'supply'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    공급
                  </button>
                  <button
                    type="button"
                    onClick={() => setAreaStandard('exclusive')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      areaStandard === 'exclusive'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    전용
                  </button>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setUnitType('pyeong')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      unitType === 'pyeong'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    평
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('m2')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      unitType === 'm2'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ㎡
                  </button>
                </div>
              </div>
            </div>

            {/* 대표 평형 탭 버튼 목록 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedStandardExclu('all');
                  setSelectedSubType('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
                  selectedStandardExclu === 'all'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체 ({data.trades.length})
              </button>
              {data.areaGroups.map((group) => {
                const isSelected = selectedStandardExclu === group.standardExclu;
                const label = getTabLabel(group);
                return (
                  <button
                    key={group.standardExclu}
                    onClick={() => {
                      setSelectedStandardExclu(group.standardExclu);
                      setSelectedSubType('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                      ({group.count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* A/B 세부 타입 선택 서브바 */}
            {currentGroup && currentGroup.subTypes && currentGroup.subTypes.length > 1 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">세부 타입:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                    selectedSubType === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  전체 ({currentGroup.count})
                </button>
                {currentGroup.subTypes.map((sub) => {
                  const isSubSelected = selectedSubType === sub.typeLetter || selectedSubType === sub.typeName;
                  return (
                    <button
                      key={sub.typeName}
                      type="button"
                      onClick={() => setSelectedSubType(sub.typeLetter || sub.typeName)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
                        isSubSelected
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="font-bold">{sub.typeName}타입</span>
                      <span className="text-[10px] text-slate-400">({sub.excluUseAr}㎡)</span>
                      <span className={`text-[10px] font-bold ${isSubSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                        [{sub.count}]
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 🌟 전·월세 임대 구분 필터 (전세만 / 월세만) */}
            {tradeType === 'rent' && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">임대 형태:</span>
                  {(['all', 'jeonse', 'wolse'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRentFilter(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        rentFilter === mode
                          ? mode === 'jeonse'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : mode === 'wolse'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mode === 'all'
                        ? `전체 (${data.trades.length})`
                        : mode === 'jeonse'
                        ? `전세만 (${data.stats.jeonseCount || 0})`
                        : `월세만 (${data.stats.wolseCount || 0})`}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">
                  선택 결과: {filteredTrades.length}건
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Monthly Average Trend Visual */}
        {data.monthlyTrend && data.monthlyTrend.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  {tradeType === 'trade' ? '최근 6개월 매매 추이' : '최근 6개월 전세 보증금 추이'}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                {tradeType === 'trade' ? '월별 평균 거래가' : '월별 전세 평균 보증금'}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1 sm:gap-2">
              {data.monthlyTrend.map((item) => (
                <div
                  key={item.ym}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center flex flex-col justify-between"
                >
                  <span className="text-[11px] font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="my-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {item.avgPriceFormatted !== '-' ? item.avgPriceFormatted : '-'}
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-600 font-semibold">
                    {item.count > 0 ? `${item.count}건` : '0건'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Transaction History Timeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-800">
                {tradeType === 'trade' ? '매매 실거래 내역' : '전·월세 실거래 내역'}
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              총 <strong className="text-slate-800">{filteredTrades.length}</strong>건
            </span>
          </div>

          {filteredTrades.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTrades.map((trade, idx) => (
                <div
                  key={`${trade.dealDate}-${trade.floor}-${trade.dealAmount}-${trade.monthlyRent || 0}-${idx}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {trade.dealDate}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                        {getBadgeLabel(trade)}
                      </span>
                      {trade.rentType && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            trade.rentType === '전세'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {trade.rentType}
                        </span>
                      )}
                      {trade.contractType && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {trade.contractType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>{trade.floor}층</span>
                      {trade.aptDong && (
                        <>
                          <span>•</span>
                          <span>{trade.aptDong}</span>
                        </>
                      )}
                      {trade.contractTerm && (
                        <>
                          <span>•</span>
                          <span>기간 {trade.contractTerm}</span>
                        </>
                      )}
                      {trade.dealingGbn && (
                        <>
                          <span>•</span>
                          <span className="text-sky-600 font-medium">{trade.dealingGbn}</span>
                        </>
                      )}
                      {trade.rgstDate && (
                        <span className="text-emerald-600 font-medium">등기</span>
                      )}
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        (전용 {trade.excluUseAr}㎡)
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {trade.dealAmountFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              {data.isNewComplex ? (
                <div className="space-y-1.5 px-4">
                  <p className="font-semibold text-slate-700 text-xs sm:text-sm">
                    신축 단지로 최근 국토교통부 실거래 신고 내역이 집계 대기 중입니다.
                  </p>
                  <p className="text-slate-400 text-xs">
                    분양권·입주권 전매 및 전월세 임대차 시세는 이룬다부동산으로 문의해 주세요.
                  </p>
                </div>
              ) : (
                '해당 조건의 최근 실거래 내역이 없습니다.'
              )}
            </div>
          )}
        </div>

        {/* 5. Director's Expert Briefing Section (단지 맞춤형 스마트 브리핑) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/80 shrink-0 bg-slate-800 relative">
              <Image
                src="/profile.png"
                alt="장혜경 소장"
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-1 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {data.aptName} {tradeType === 'trade' ? '매매' : '전·월세'} 현장 브리핑
              </div>
              <h3 className="text-base font-bold text-white">
                이룬다부동산 장혜경 대표 소장
              </h3>
              <p className="text-xs text-slate-400">울산 남구 아파트·상가 전문 공인중개사</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 border border-white/10 space-y-2">
            <p>
              &ldquo;<strong>{briefing.intro}</strong>&rdquo;
            </p>
            <p className="text-sky-200">
              &bull; <strong>시세 흐름:</strong> {briefing.trendComment}
            </p>
            <p className="text-slate-300">
              &bull; <strong>거래 회전:</strong> {briefing.volumeComment}
            </p>
            <p className="text-amber-200 font-medium pt-1 border-t border-white/10">
              💡 <strong>소장 의견:</strong> {briefing.advice}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:010-2772-1719"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>소장 직통 전화</span>
            </a>
            <a
              href="https://open.kakao.com/o/sGpdIfki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>카카오톡 1:1 상담</span>
            </a>
          </div>
        </div>

        {/* 6. Footer Disclaimer */}
        <div className="text-center text-[11px] text-slate-600 py-3 space-y-1">
          <p>
            데이터 출처: 국토교통부 실거래가 공개시스템 ({tradeType === 'trade' ? '아파트 매매' : '아파트 전·월세'} 자료제공서비스)
          </p>
          <p>
            이룬다공인중개사사무소 | 대표: 장혜경 | 울산광역시 남구 신정동
          </p>
        </div>
      </main>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Home className="w-4 h-4" />
            <span>홈으로</span>
          </Link>
          <a
            href="tel:010-2772-1719"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-sky-500/20"
          >
            <Phone className="w-4 h-4" />
            <span>{tradeType === 'trade' ? '매매 시세/매물 전화문의' : '전·월세 임대차 전화문의'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MarketAptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <MarketAptContent />
    </Suspense>
  );
}
