'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import QuickInquiryModal from './QuickInquiryModal';

export default function FloatingContactBar() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg md:hidden">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <a
            href="tel:010-2772-1719"
            className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-transform"
          >
            <Phone className="w-4 h-4" />
            전화 상담
          </a>

          <a
            href="https://open.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-4 h-4 fill-slate-900" />
            카톡 1:1 상담
          </a>

          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-3.5 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <Send className="w-3.5 h-3.5" />
            간편 문의
          </button>
        </div>
      </div>

      <QuickInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
    </>
  );
}
