'use client';

import { X, FileText, Phone, MessageSquare, MapPin, Building2, ShieldCheck, Tag } from 'lucide-react';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    property_no?: string;
    public_title?: string;
    masked_address?: string;
    price?: string | number;
    property_type?: string;
    transaction_type?: string;
    etc?: string;
  } | null;
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
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
              {property.public_title || '상세 매물설명'}
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 text-sm">
          {/* Quick Info Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{property.masked_address || '울산 지역 부근'}</span>
            </div>
            <div className="text-sky-700 font-black text-base">
              {property.price || '가격 문의'}
            </div>
          </div>

          {/* ETC Detailed Description Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/70 w-fit">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>상세 매물설명 (공개 현황)</span>
            </div>

            {rawEtc ? (
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {rawEtc}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
                등록된 상세 설명문이 없습니다. 이룬다 공인중개사(010-2772-1719)로 문의하시면 친절히 안내해 드립니다.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="tel:010-2772-1719"
            className="w-full sm:w-1/2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            전화 문의 (010-2772-1719)
          </a>
          <button
            onClick={() => {
              onClose();
              if (onOpenInquiry) onOpenInquiry();
            }}
            className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            1:1 간편 문의하기
          </button>
        </div>
      </div>
    </div>
  );
}
