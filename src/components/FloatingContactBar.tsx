'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import QuickInquiryModal from './QuickInquiryModal';

export default function FloatingContactBar() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <>
      {/* Mobile Always-Visible Fixed Bottom Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[9990] p-3 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <a
            href="tel:010-2772-1719"
            className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-sky-700 active:from-sky-700 active:to-sky-800 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/25 transition-all"
          >
            <Phone className="w-4 h-4" />
            전화 상담
          </a>

          <a
            href="https://open.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-amber-400 active:bg-amber-500 text-slate-950 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/25 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            카톡 상담
          </a>

          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="flex-1 py-3 bg-slate-950 active:bg-slate-800 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1 shadow-md transition-all whitespace-nowrap"
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
