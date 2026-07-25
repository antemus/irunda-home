'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Phone, MessageSquare, Menu, X, Building2, UserCheck, FileText, Sparkles } from 'lucide-react';
import QuickInquiryModal from './QuickInquiryModal';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                    이룬다 부동산
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200">
                    irunda.co.kr
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">
                  울산 상가 전문 · 아파트 · 오피스텔 공인중개사사무소
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 text-sm font-bold text-slate-700">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl hover:text-sky-700 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                홈
              </Link>
              <Link
                href="/map"
                className="px-4 py-2 rounded-xl text-sky-700 bg-white shadow-sm flex items-center gap-1.5 font-extrabold"
              >
                <MapPin className="w-4 h-4 text-sky-600" />
                지도 매물 탐색
              </Link>
              <Link
                href="/submit"
                className="px-4 py-2 rounded-xl hover:text-sky-700 hover:bg-white transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                매물 내놓기/구하기
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 rounded-xl hover:text-sky-700 hover:bg-white transition-all flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                장혜경 소장 소개
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center gap-2 border border-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                빠른 문의
              </button>
              <a
                href="tel:010-2772-1719"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-extrabold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center gap-2 hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                전화 상담
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-sky-600/25"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                문의
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
                aria-label="메뉴 열기"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-slate-800 font-bold hover:bg-slate-50"
            >
              홈 메인
            </Link>
            <Link
              href="/map"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sky-700 font-bold bg-sky-50"
            >
              <MapPin className="w-4 h-4" />
              지도 매물 탐색
            </Link>
            <Link
              href="/submit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-800 font-bold hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              매물 내놓기/구하기
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-800 font-bold hover:bg-slate-50"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              장혜경 소장 소개
            </Link>
            <div className="pt-2 border-t border-slate-100">
              <a
                href="tel:010-2772-1719"
                className="w-full py-3 rounded-xl bg-sky-600 text-white font-extrabold text-center text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
              >
                <Phone className="w-4 h-4" />
                전화 연결 (010-2772-1719)
              </a>
            </div>
          </div>
        )}
      </header>

      <QuickInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
    </>
  );
}
