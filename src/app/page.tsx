'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  Building2,
  ShieldCheck,
  Award,
  Phone,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { getApproximateCoordinates, maskAddress, generateSecureTitle, formatSalePrice, getPublicDescription } from '@/utils/geoJitter';

import QuickInquiryModal from '@/components/QuickInquiryModal';
import PropertyDetailModal from '@/components/PropertyDetailModal';

export interface PropertyItem {
  id: string;
  property_no?: string;
  public_title?: string;
  public_description?: string;
  etc?: string;
  masked_address?: string;
  approx_lat?: number;
  approx_lng?: number;
  price?: string | number;
  pyeong_price?: string | number;
  property_type?: string;
  transaction_type?: string;
  area?: string | number;
  images?: string[];
  created_at?: string;
}

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('전체');
  const [heroSearch, setHeroSearch] = useState('');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedPropertyForInquiry, setSelectedPropertyForInquiry] = useState<PropertyItem | null>(null);
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<PropertyItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPublicListings() {
      try {
        const res = await fetch('/api/public-listings');
        if (!res.ok) {
          console.warn('Failed to fetch public listings:', res.status);
          setProperties([]);
          return;
        }
        const data = await res.json();

        if (!data || data.length === 0) {
          setProperties([]);
          return;
        }

        const displayList = data;

        const mappedItems: PropertyItem[] = displayList.map((item: any) => {
          const lat = item.latitude ? Number(item.latitude) : 35.5383;
          const lng = item.longitude ? Number(item.longitude) : 129.3114;
          const approx = getApproximateCoordinates(lat, lng);

          const maskedAddr = item.masked_address 
            ? item.masked_address 
            : maskAddress(`${item.sido || ''} ${item.sigungu || ''} ${item.bname || ''} ${item.address || ''}`);

          const title = generateSecureTitle(item);

          let formattedPrice = item.price ? String(item.price) : '';
          if (!formattedPrice) {
            if (item.transaction_type === '매매') {
              formattedPrice = formatSalePrice(item.sale_price);
            } else {
              const dep = item.deposit !== undefined && item.deposit !== null ? `${item.deposit}` : '0';
              const rnt = item.rent !== undefined && item.rent !== null ? `${item.rent}` : '0';
              formattedPrice = `보증금 ${dep} / 월 ${rnt}만원`;
              if (item.premium) formattedPrice += ` (권리금 ${item.premium}만)`;
            }
          }

          return {
            id: item.id,
            property_no: item.property_no,
            public_title: title,
            public_description: getPublicDescription(item),
            etc: item.etc && item.etc !== 'null' ? item.etc : undefined,
            masked_address: maskedAddr,
            approx_lat: approx.lat,
            approx_lng: approx.lng,
            price: formattedPrice,
            pyeong_price: item.pyeong_price || (item.sale_price && item.land_area ? Math.round(Number(item.sale_price) / (Number(item.land_area) * 0.3025)) : undefined),
            property_type: item.property_type || '상가점포',
            transaction_type: item.transaction_type || '임대',
            area: item.exclusive_area || item.contract_area || item.land_area,
            created_at: item.created_at,
          };
        });

        setProperties(mappedItems);
      } catch (err: any) {
        console.warn('Query status:', err?.message || 'Handled');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicListings();
  }, []);

  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/map?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push('/map');
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (selectedType === '전체') return true;
    if (selectedType === '상가/점포') return (p.property_type || '').includes('상가') || (p.property_type || '').includes('점포');
    if (selectedType === '아파트/오피스텔') return (p.property_type || '').includes('아파트') || (p.property_type || '').includes('오피스텔');
    return p.property_type === selectedType;
  });

  const handleOpenPropertyInquiry = (item?: PropertyItem) => {
    setSelectedPropertyForInquiry(item || null);
    setIsInquiryOpen(true);
  };

  return (
    <div className="space-y-16 pb-20 bg-slate-50 min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-bold tracking-wide shadow-md whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>울산 전지역 상가 전문 · 아파트 · 오피스텔 · irunda.co.kr</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            울산 상가와 아파트, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
              정확한 상권과 시세
            </span>로 연결합니다.
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base leading-relaxed font-normal">
            울산광역시 전지역 상가, 점포, 수익형 부동산, 아파트, 오피스텔 100% 현장 검증 실매물. <br />
            위치 보안 시스템으로 소중한 정보를 보호하며 정직하고 안전한 계약을 이룹니다.
          </p>

          {/* Search Box */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-3xl mx-auto bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <MapPin className="w-5 h-5 text-sky-600 absolute left-4 top-3.5" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="지역명, 상가, 아파트명 검색 (예: 삼산동 상가, C1415)"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              지도 매물 탐색
            </button>
          </form>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-8 border-t border-white/10 text-white">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center items-center">
              <div className="text-xl sm:text-2xl font-black text-white whitespace-nowrap tracking-tight">상가 전문</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 whitespace-nowrap">울산 상권 정밀 분석</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center items-center">
              <div className="text-lg sm:text-2xl font-black text-sky-300 whitespace-nowrap tracking-tight">아파트 · 오피스텔</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 whitespace-nowrap">인기 주거 매물 전문</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center items-center">
              <div className="text-xl sm:text-2xl font-black text-amber-300 whitespace-nowrap tracking-tight">100% 실매물</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 whitespace-nowrap">현장 검증 매물 안내</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center items-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-300 whitespace-nowrap tracking-tight">원스톱</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 whitespace-nowrap">CRM 실시간 연동</div>
            </div>
          </div>
        </div>
      </section>

      {/* Broker Profile Card Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          {/* Profile Photo Display */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-sky-500 via-sky-600 to-amber-400 p-1.5 shadow-xl shrink-0">
              <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative border-2 border-white">
                <img
                  src="/profile.png"
                  alt="장혜경 소장 프로필 사진"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-0 right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-2.5 rounded-full shadow-lg font-bold">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">장혜경 소장</h2>
              <p className="text-xs sm:text-sm font-bold text-sky-700 tracking-wide whitespace-nowrap">
                이룬다 공인중개사사무소 대표 공인중개사
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              공인중개사 자격 정식 등록업소
            </div>
          </div>

          {/* Greeting & Promises */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-sky-700 uppercase">대표 인사말</span>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                "울산 상가와 주거 매물, <br />
                <span className="text-sky-700">정직과 전문성</span>으로 보답하겠습니다."
              </h3>
            </div>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              안녕하세요. 이룬다 공인중개사사무소 대표 <strong>장혜경 소장</strong>입니다. <br />
              울산 전지역의 <strong>상가·점포 정밀 입지 분석</strong>부터 <strong>아파트·오피스텔 매매/임대</strong>까지, 
              직접 현장을 확인한 <strong>100% 검증 실매물</strong>만을 엄선하여 최고의 만족을 선사합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                울산 상가 정밀 상권분석
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                아파트 · 오피스텔 매물
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                위치 보안 & 정보 보호
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secret / Off-Market Listings Alluring Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-sky-50 rounded-3xl p-8 sm:p-10 border-2 border-amber-300/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
              <Lock className="w-4 h-4" />
              <span>비공개 비밀 매물 다량 보유 🤫</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              온라인에 공개되지 않은 <span className="text-sky-700">비밀 실매물</span>이 다수 대기 중입니다!
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              임대인 및 매도인의 보안 요청으로 웹사이트에 노출되지 않은 <strong>울산 A급 핵심 상권, 무권리/소액권리 상가, 급매 아파트</strong>가 다수 준비되어 있습니다. 
              전화 상담 또는 1:1 간편 문의를 통해 맞춤 비밀 매물을 즉시 안내받으세요.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => handleOpenPropertyInquiry()}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-extrabold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              비밀 매물 1:1 문의
            </button>
            <a
              href="tel:010-2772-1719"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              010-2772-1719
            </a>
          </div>
        </div>
      </section>

      {/* Recommended Public Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-sky-600 uppercase">RECOMMENDED PROPERTIES</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              이룬다 추천 대표 실매물
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              울산 지역 현장 실사를 거친 검증 실매물 목록입니다.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
            {['전체', '상가/점포', '아파트/오피스텔', '주택', '토지'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-white text-sky-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 bg-slate-200/60 animate-pulse rounded-3xl border border-slate-200" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">해당 유형의 등록된 매물이 준비 중입니다.</h3>
            <p className="text-xs text-slate-500">지도를 방문하시거나 빠른 문의를 남겨주시면 맞춰 안내해 드립니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-[11px] font-extrabold border border-sky-200 whitespace-nowrap">
                      {item.transaction_type} · {item.property_type}
                    </span>
                    {item.property_no && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        매물번호 {item.property_no}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                    {item.public_title}
                  </h3>

                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.public_description}
                    </p>
                    {item.etc && (
                      <button
                        onClick={() => setSelectedPropertyForDetail(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200/80 transition-all mt-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        상세설명 전체보기 팝업
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{item.masked_address}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>조건:</span>
                      <span className="text-sky-700 font-black text-base">{item.price || '문의'}</span>
                    </div>
                    {item.pyeong_price && (
                      <div className="flex justify-between text-slate-600 font-semibold">
                        <span>평당 가격:</span>
                        <span>{item.pyeong_price} 만원/평</span>
                      </div>
                    )}
                    {item.area && (
                      <div className="flex justify-between text-slate-600 font-semibold">
                        <span>전용 면적:</span>
                        <span>{item.area} ㎡ ({Math.round(Number(item.area) * 0.3025)}평)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex gap-2">
                  {item.etc && (
                    <button
                      onClick={() => setSelectedPropertyForDetail(item)}
                      className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shrink-0"
                      title="상세설명 팝업 보기"
                    >
                      <FileText className="w-4 h-4 text-sky-700" />
                      설명보기
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenPropertyInquiry(item)}
                    className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-xl font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    상세 문의하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl border border-slate-800 shadow-xl transition-all hover:scale-105 whitespace-nowrap"
          >
            울산 지도에서 매물 전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Online Listing Submission Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-block px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full font-black text-xs whitespace-nowrap">
              울산 매도 / 매수 간편 접수
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              소중한 매물, 빠른 중개를 원하시나요?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              온라인 "내 매물 내놓기/구하기" 폼을 통해 접수해 주시면 장혜경 소장 및 이룬다 전문 중개팀이 직접 확인 후 최적의 시세와 매칭을 안내해 드립니다.
            </p>
          </div>
          <Link
            href="/submit"
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-400/20 transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            매물 내놓기 / 구하기 접수
          </Link>
        </div>
      </section>

      <QuickInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => {
          setIsInquiryOpen(false);
          setSelectedPropertyForInquiry(null);
        }}
        propertyTitle={selectedPropertyForInquiry?.public_title}
        propertyId={selectedPropertyForInquiry?.id}
      />

      <PropertyDetailModal
        isOpen={!!selectedPropertyForDetail}
        onClose={() => setSelectedPropertyForDetail(null)}
        property={selectedPropertyForDetail}
        onOpenInquiry={() => {
          if (selectedPropertyForDetail) {
            handleOpenPropertyInquiry(selectedPropertyForDetail);
          }
        }}
      />
    </div>
  );
}
