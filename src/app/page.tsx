'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { getApproximateCoordinates, maskAddress, generateSecureTitle } from '@/utils/geoJitter';

import QuickInquiryModal from '@/components/QuickInquiryModal';

export interface PropertyItem {
  id: string;
  property_no?: string;
  public_title?: string;
  public_description?: string;
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
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    async function fetchPublicListings() {
      try {
        // 서버 API Route를 통해 조회 (RLS 우회, service role key 사용)
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
              formattedPrice = item.sale_price ? `매매가 ${item.sale_price}만원` : '매매가 문의';
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
            public_description: item.public_description || item.etc || item.current_status || item.features || '울산 지역 현장 실사를 거친 검증 실매물입니다.',
            masked_address: maskedAddr,
            approx_lat: approx.lat,
            approx_lng: approx.lng,
            price: formattedPrice,
            pyeong_price: item.pyeong_price || (item.sale_price && item.land_area ? Math.round(Number(item.sale_price) / (Number(item.land_area) * 0.3025)) : undefined),
            property_type: item.property_type || '상가점포',
            transaction_type: item.transaction_type || '임대',
            area: item.exclusive_area || item.contract_area || item.land_area || '-',
            images: item.images || [],
            created_at: item.created_at,
          };
        });

        setProperties(mappedItems);
      } catch (err: any) {
        console.warn('Handled fetch error:', err?.message || 'Query executed cleanly');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicListings();
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (selectedType === '전체') return true;
    if (selectedType === '상가/점포') return (p.property_type || '').includes('상가') || (p.property_type || '').includes('점포');
    if (selectedType === '아파트/오피스텔') return (p.property_type || '').includes('아파트') || (p.property_type || '').includes('오피스텔');
    return p.property_type === selectedType;
  });

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
          <div className="max-w-3xl mx-auto bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <MapPin className="w-5 h-5 text-sky-600 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="지역명, 상가, 아파트명 검색 (예: 삼산동 상가, C1415)"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
              />
            </div>
            <Link
              href="/map"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              지도 매물 탐색
            </Link>
          </div>

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
              안녕하세요. 이룬다 공인중개사사무소 대표 **장혜경 소장**입니다. <br />
              울산 전지역의 **상가·점포 정밀 입지 분석**부터 **아파트·오피스텔 매매/임대**까지, 
              직접 현장을 확인한 **100% 검증 실매물**만을 엄선하여 최고의 만족을 선사합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                울산 상가 정밀 상권분석
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                아파트 · 오피스텔 맞춤 중개
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                위치 보안 & 개인정보 보호
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/about"
                className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
              >
                장혜경 소장 프로필 & 사무소 안내
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              추천 주요 매물
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              이룬다 추천 우수 매물 ({filteredProperties.length}건)
            </h2>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-200 p-1.5 rounded-2xl border border-slate-300 text-xs font-bold overflow-x-auto max-w-full">
            {['전체', '상가/점포', '아파트/오피스텔', '주택', '토지'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-sky-600 text-white shadow-md font-extrabold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white border border-slate-200 animate-pulse rounded-3xl shadow-sm" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">등록된 공개 매물이 준비 중입니다.</p>
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-sky-600/25 whitespace-nowrap"
            >
              희망 조건 매물 문의하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProperties.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold whitespace-nowrap">
                      {item.property_type || '상가점포'}
                    </span>
                    <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                      {item.transaction_type || '임대'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                      {item.public_title || '울산 추천 우수 매물'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      {item.masked_address || '울산 지역 위치 보안 적용'}
                    </p>
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

                <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsInquiryOpen(true)}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-xl font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
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

      <QuickInquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
}
