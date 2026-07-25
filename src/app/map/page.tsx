'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Search, Filter, Building2, Phone, MessageSquare, ShieldAlert, Lock } from 'lucide-react';

import { getApproximateCoordinates, maskAddress, generateSecureTitle, formatSalePrice, getPublicDescription } from '@/utils/geoJitter';
import KakaoMap, { MapProperty } from '@/components/KakaoMap';
import QuickInquiryModal from '@/components/QuickInquiryModal';

function MapSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('전체');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/public-listings');
        if (!res.ok) {
          console.warn('Map fetch error:', res.status);
          setProperties([]);
          return;
        }
        const data = await res.json();
        const displayData = data || [];

        const mapped: MapProperty[] = displayData.map((item: any) => {
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
            masked_address: maskedAddr,
            approx_lat: approx.lat,
            approx_lng: approx.lng,
            price: formattedPrice,
            pyeong_price: item.pyeong_price || (item.sale_price && item.land_area ? Math.round(Number(item.sale_price) / (Number(item.land_area) * 0.3025)) : undefined),
            property_type: item.property_type || '상가점포',
            transaction_type: item.transaction_type || '임대',
          };
        });

        setProperties(mapped);
      } catch (err: any) {
        console.warn('Handled map query error:', err?.message || 'Query executed cleanly');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((item) => {
    if (propertyTypeFilter !== '전체') {
      if (propertyTypeFilter === '상가/점포') {
        if (!(item.property_type || '').includes('상가') && !(item.property_type || '').includes('점포')) return false;
      } else if (propertyTypeFilter === '아파트/오피스텔') {
        if (!(item.property_type || '').includes('아파트') && !(item.property_type || '').includes('오피스텔')) return false;
      } else if (item.property_type !== propertyTypeFilter) {
        return false;
      }
    }
    if (transactionTypeFilter !== '전체' && item.transaction_type !== transactionTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (item.public_title || '').toLowerCase();
      const addr = (item.masked_address || '').toLowerCase();
      if (!title.includes(q) && !addr.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="bg-mesh-light min-h-screen text-slate-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="울산 지역명 또는 상가/아파트 검색"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-600" />
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
              >
                <option value="전체">종류: 전체</option>
                <option value="상가/점포">상가 / 점포</option>
                <option value="아파트/오피스텔">아파트 / 오피스텔</option>
                <option value="주택">주택 / 원룸</option>
                <option value="토지">토지 / 기타</option>
              </select>

              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
              >
                <option value="전체">구분: 전체</option>
                <option value="임대">임대 (월세/전세)</option>
                <option value="매매">매매</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 w-full md:w-auto justify-center font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>🛡️ 위치 보안 & 정보 보호: 지도는 반경 200m 보안 가상 위치로 표시됩니다.</span>
          </div>
        </div>

        {/* Main Map & Side Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
          {/* Kakao Map Container */}
          <div className="lg:col-span-8 h-full rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <KakaoMap
              properties={filteredProperties}
              selectedPropertyId={selectedProperty?.id}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
            />
          </div>

          {/* Side Panel Listing */}
          <div className="lg:col-span-4 h-full bg-white rounded-3xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">
                울산 매물 목록 ({filteredProperties.length}건)
              </span>
              <span className="text-xs text-sky-700 font-extrabold">100% 실매물</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Secret Listings Alluring Callout Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-sky-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-black text-slate-900">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>웹사이트 미공개 비밀 매물 다량 보유 🤫</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  온라인 미공개 울산 A급 상가 및 급매 아파트 매물이 준비되어 있습니다. 전화 1:1 상담으로 조건 맞춤 비밀 매물을 확인하세요.
                </p>
                <a
                  href="tel:010-2772-1719"
                  className="block text-center py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-[11px] transition-all"
                >
                  📞 비밀 매물 전화 문의 (010-2772-1719)
                </a>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-28 bg-slate-100 border border-slate-200 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">조건에 맞는 검색 매물이 없습니다.</p>
                  <button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    1:1 맞춤 매물 구하기 문의
                  </button>
                </div>
              ) : (
                filteredProperties.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProperty(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      selectedProperty?.id === item.id
                        ? 'border-sky-600 bg-sky-50 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-extrabold">
                        {item.property_type || '상가점포'} · {item.transaction_type || '임대'}
                      </span>
                      {item.property_no && (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          매물번호 {item.property_no}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                        {item.public_title || '울산 추천 우수 매물'}
                      </h4>
                      {item.public_description && (
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-2 mt-1 leading-snug">
                          {item.public_description}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        {item.masked_address || '위치 정보 미공개'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="font-black text-sky-700 text-base">
                        {item.price ? `${item.price}` : '가격 문의'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(item);
                          setIsInquiryModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-[11px] shadow-sm transition-all"
                      >
                        상세 문의
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedProperty && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">선택된 매물</span>
                  <span className="text-xs text-slate-300">{selectedProperty.property_type}</span>
                </div>
                <h4 className="text-sm font-extrabold truncate">{selectedProperty.public_title}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-md shadow-sky-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    1:1 문의하기
                  </button>
                  <a
                    href="tel:010-2772-1719"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    전화
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        propertyTitle={selectedProperty?.public_title}
        propertyId={selectedProperty?.id}
      />
    </div>
  );
}

export default function MapSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-slate-500">지도 매물을 불러오는 중...</div>}>
      <MapSearchContent />
    </Suspense>
  );
}
