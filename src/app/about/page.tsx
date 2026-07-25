'use client';

import { useState } from 'react';
import { UserCheck, ShieldCheck, MapPin, Phone, Clock, Award, Building2, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import QuickInquiryModal from '@/components/QuickInquiryModal';

export default function AboutPage() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <div className="bg-mesh-light min-h-screen text-slate-900 py-12 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-sky-600" />
            대표 공인중개사 소개 · irunda.co.kr
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight [word-break:keep-all] break-keep">
            울산 부동산, <br className="hidden sm:inline" />
            신뢰와 정직으로 가치를 이룹니다
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            이룬다 공인중개사사무소는 울산 전지역 상가·점포 정밀 상권분석 및 아파트·오피스텔 100% 실매물로 고객님의 부동산 거래를 안전하게 책임집니다.
          </p>
        </div>

        {/* Profile Card Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-sky-600 via-sky-400 to-amber-400 p-1 shadow-xl">
              <div className="w-full h-full rounded-[22px] bg-slate-100 overflow-hidden relative">
                <img
                  src="/profile.png"
                  alt="장혜경 소장 프로필 사진"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl font-bold">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">장혜경 소장</h2>
              <p className="text-xs font-bold text-sky-700 tracking-wide uppercase">
                이룬다 공인중개사사무소 대표 공인중개사
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="px-3.5 py-1.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-extrabold">
                울산 상가/점포 전문
              </span>
              <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-extrabold">
                아파트/오피스텔 매매·임대
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-extrabold">
                수익형 부동산 자산분석
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                이룬다 부동산의 3가지 안심 약속
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">울산 상가 & 상권 정밀 분석</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      울산 남구, 중구, 북구, 동구, 울주군 주요 상권 입지와 유동인구, 업종별 최적의 권리금 및 유동성 분석을 제공합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">아파트 · 오피스텔 100% 현장 검증</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      실제 현장 확인과 객관적인 실거래가 데이터 기반으로 거짓 없이 정확한 주거 매물을 추천합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">위치 보안 & 매물 정보 보호</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      공개 웹사이트에는 세부 지번 유추가 불가능하도록 반경 200~300m 보안 가상 위치만 표시하여 임대인 및 매도인의 소중한 정보와 자산을 안전하게 보호합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setIsInquiryOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                장혜경 소장 1:1 상담 신청
              </button>
              <a
                href="tel:010-2772-1719"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                010-2772-1719
              </a>
            </div>
          </div>
        </div>

        {/* Office Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center font-bold border border-sky-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">중개사무소 정보</h3>
            <p className="text-xs font-medium text-slate-600">상호: 이룬다 공인중개사사무소</p>
            <p className="text-xs font-semibold text-slate-800">대표: 장혜경 대표 공인중개사 (소장)</p>
            <p className="text-xs font-medium text-slate-600">주소: 울산 남구 화합로148번길 12 1층</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center font-bold border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">등록 & 보증 보험</h3>
            <p className="text-xs font-medium text-slate-600">공인중개사 자격 정식 등록</p>
            <p className="text-xs font-medium text-slate-600">울산 상가/주거 부동산 보증보험 가입업소</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center font-bold border border-emerald-200">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">영업시간 안내</h3>
            <p className="text-xs font-medium text-slate-600">평일/토요일: 09:00 ~ 19:00</p>
            <p className="text-xs font-medium text-slate-600">일요일/공휴일: 예약제 현장 안내</p>
          </div>
        </div>
      </div>

      <QuickInquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
}
