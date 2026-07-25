'use client';

import { CheckCircle2, X, PhoneCall, Clock } from 'lucide-react';

interface InquirySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
}

export default function InquirySuccessModal({ isOpen, onClose, customerName = '고객' }: InquirySuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center space-y-5 border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">문의가 성공적으로 접수되었습니다!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-semibold text-sky-700">{customerName}</span>님, 이룬다 공인중개사가 확인 후 입력해주신 연락처로 신속히 안내해 드리겠습니다.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-left text-xs text-slate-600 space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Clock className="w-4 h-4 text-sky-600" />
            안내 가능 시간
          </div>
          <p>· 영업시간(09:00 ~ 19:00): 접수 후 30분 이내 연락</p>
          <p>· 야간 및 공휴일: 다음 영업일 오전에 순차 연락</p>
        </div>

        <div className="pt-2 flex gap-3">
          <a
            href="tel:010-2772-1719"
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            지금 전화하기
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
