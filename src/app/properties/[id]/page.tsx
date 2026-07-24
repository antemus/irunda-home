'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { MapPin, Phone, MessageSquare, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getApproximateCoordinates, maskAddress } from '@/utils/geoJitter';
import KakaoMap, { MapProperty } from '@/components/KakaoMap';
import QuickInquiryModal from '@/components/QuickInquiryModal';

export interface PropertyDetail {
  id: string;
  public_title?: string;
  public_description?: string;
  masked_address?: string;
  approx_lat?: number;
  approx_lng?: number;
  price?: string | number;
  pyeong_price?: string | number;
  area?: string | number;
  property_type?: string;
  transaction_type?: string;
  images?: string[];
  created_at?: string;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Property detail query status:', error.message || error);
          setProperty(null);
          return;
        }

        if (!data) {
          setProperty(null);
          return;
        }

        const lat = data.latitude ? Number(data.latitude) : 36.019;
        const lng = data.longitude ? Number(data.longitude) : 129.343;
        const approx = getApproximateCoordinates(lat, lng);

        const maskedAddr = data.masked_address 
          ? data.masked_address 
          : maskAddress(`${data.sido || ''} ${data.sigungu || ''} ${data.bname || ''} ${data.address || ''}`);

        const title = data.public_title 
          ? data.public_title 
          : `${data.sigungu || '포항'} ${data.bname || ''} ${data.property_type || '우수'} 매물 (${data.transaction_type || '매매'})`;

        const formattedPrice = data.price 
          ? String(data.price) 
          : (data.sale_price 
              ? `${data.sale_price}만원` 
              : (data.deposit || data.rent 
                  ? `보증금 ${data.deposit || 0} / 월 ${data.rent || 0}만원` 
                  : '가격 문의'));

        setProperty({
          id: data.id,
          public_title: title,
          public_description: data.public_description || data.features || data.etc || '현장 실사를 거친 검증 실매물입니다.',
          masked_address: maskedAddr,
          approx_lat: approx.lat,
          approx_lng: approx.lng,
          price: formattedPrice,
          pyeong_price: data.pyeong_price || (data.sale_price && data.land_area ? Math.round(Number(data.sale_price) / (Number(data.land_area) * 0.3025)) : undefined),
          property_type: data.property_type || '토지',
          transaction_type: data.transaction_type || '매매',
          area: data.land_area || data.contract_area || data.area || '-',
          images: data.images || [],
          created_at: data.created_at,
        });
      } catch (err: any) {
        console.warn('Handled detail query error:', err?.message || 'Query executed cleanly');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-mesh-dark min-h-screen text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">매물 상세 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-mesh-dark min-h-screen text-slate-100 flex items-center justify-center p-8">
        <div className="glass-panel-dark p-8 rounded-3xl border border-slate-800 text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-white">매물 정보를 찾을 수 없거나 노출이 종료되었습니다.</h2>
          <Link href="/map" className="inline-block px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-500/25">
            지도 매물 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const mapProperties: MapProperty[] = property.approx_lat && property.approx_lng ? [property] : [];

  return (
    <div className="bg-mesh-dark min-h-screen text-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Button */}
        <Link href="/map" className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-400 font-semibold text-xs transition-colors">
          <ArrowLeft className="w-4 h-4" />
          지도 매물 목록으로 돌아가기
        </Link>

        {/* Main Detail Header */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-extrabold text-xs">
                {property.property_type || '매물'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs">
                {property.transaction_type || '매매'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              100% 검증 실매물
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {property.public_title || '추천 우수 매물'}
            </h1>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              소재지: <span className="font-semibold text-slate-200">{property.masked_address || '위치 보안 적용'}</span>
            </p>
          </div>

          {/* Specs Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-200">
            <div>
              <span className="text-xs text-slate-400">희망 매매가</span>
              <div className="text-xl font-black text-sky-400">{property.price || '문의'}</div>
            </div>
            <div>
              <span className="text-xs text-slate-400">평당 가격</span>
              <div className="text-sm font-bold">{property.pyeong_price ? `${property.pyeong_price} 만원/평` : '문의'}</div>
            </div>
            <div>
              <span className="text-xs text-slate-400">면적</span>
              <div className="text-sm font-bold">{property.area ? `${property.area} ㎡` : '상세 문의'}</div>
            </div>
            <div>
              <span className="text-xs text-slate-400">위치 보안</span>
              <div className="text-sm font-bold text-amber-400">반경 200m 가상위치</div>
            </div>
          </div>

          {/* Description */}
          {property.public_description && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <h3 className="text-sm font-bold text-white">매물 주요 특징 & 설명</h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {property.public_description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="flex-1 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              이 매물 1:1 상담 문의하기
            </button>
            <a
              href="tel:010-8594-8949"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-800 shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-sky-400" />
              전화 문의 (010-8594-8949)
            </a>
          </div>
        </div>

        {/* Security Map View */}
        <div className="glass-panel-dark rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-400" />
              매물 위치 정보 (보안 마커)
            </h3>
            <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              실제 지번 비공개 / 반경 200~300m 부근 노출
            </span>
          </div>
          <div className="h-96 rounded-2xl overflow-hidden border border-slate-800">
            <KakaoMap properties={mapProperties} />
          </div>
        </div>

        <QuickInquiryModal
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          propertyTitle={property.public_title}
          propertyId={property.id}
        />
      </div>
    </div>
  );
}
