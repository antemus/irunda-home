'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import QuickInquiryModal from './QuickInquiryModal';

export default function FloatingContactBar() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const kakaoChatUrl = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || 'https://open.kakao.com/o/sGpdIfki';

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
            href={kakaoChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#FBC02D] text-slate-950 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/25 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            카톡 1:1 상담
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

      {/* Desktop Floating Kakao 1:1 Quick Button (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-[9990] hidden md:flex flex-col items-end gap-3">
        <a
          href={kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-5 py-3.5 bg-[#FEE500] hover:bg-[#FDD835] text-slate-950 rounded-full font-extrabold text-sm shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:shadow-2xl border border-amber-300/60 transition-all hover:scale-105"
          title="카카오톡 1:1 오픈채팅 문의"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <MessageSquare className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>카톡 1:1 문의</span>
        </a>
      </div>

      <QuickInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
    </>
  );
}
