'use client';

import { X, FileText, Phone, MessageSquare, MapPin, Building2, ShieldCheck, Tag, Send } from 'lucide-react';
import PropertyLegalNoticeTable from './PropertyLegalNoticeTable';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any | null;
  onOpenInquiry?: () => void;
}

export default function PropertyDetailModal({
  isOpen,
  onClose,
  property,
  onOpenInquiry,
}: PropertyDetailModalProps) {
  if (!isOpen || !property) return null;

  const rawEtc = property.etc && property.etc !== 'null' ? property.etc : '';
  const desc = property.public_description || property.current_status || rawEtc;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black">
                {property.transaction_type || '상담'} · {property.property_type || '매물'}
              </span>
              {property.property_no && (
                <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                  매물번호 {property.property_no}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-xl font-black tracking-tight text-white line-clamp-1">
              {property.public_title || '상세 매물 정보'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Quick Info Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{property.masked_address || '울산 주요 지역 부근'}</span>
            </div>
            <div className="text-sky-700 font-black text-base">
              {property.price || '가격 문의'}
            </div>
          </div>

          {/* Legal Notice Table (공인중개사법 법정 명시사항) */}
          <PropertyLegalNoticeTable property={property} theme="light" />

          {/* Description & Features Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/70 w-fit">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>상세 설명 및 매물 특징</span>
            </div>

            {desc ? (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {desc}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
                울산 상가·주거 실매물 전문 이룬다공인중개사사무소(010-2772-1719)로 문의하시면 현장 실사 및 맞춤 권리분석을 신속히 안내해 드립니다.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <a
            href="tel:010-2772-1719"
            className="w-full sm:flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            전화 문의 (010-2772-1719)
          </a>
          <a
            href={process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || 'https://open.kakao.com/o/sGpdIfki'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 bg-[#FEE500] hover:bg-[#FDD835] text-slate-950 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            카톡 1:1 상담
          </a>
          <button
            onClick={() => {
              onClose();
              if (onOpenInquiry) onOpenInquiry();
            }}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            간편 문의
          </button>
        </div>
      </div>
    </div>
  );
}
