'use client';

import React from 'react';
import { ShieldCheck, Building2, Phone, MapPin, User, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { BROKERAGE_DISCLOSURE, getLegalNoticeData } from '@/utils/propertyLegalNotice';

interface PropertyLegalNoticeTableProps {
  property: any;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function PropertyLegalNoticeTable({
  property,
  className = '',
  theme = 'light',
}: PropertyLegalNoticeTableProps) {
  const notice = getLegalNoticeData(property);
  const isDark = theme === 'dark';

  const rowItems = [
    { label: '중개대상물 종류', value: notice.propertyType },
    { label: '소재지', value: notice.location },
    { label: '거래 형태', value: notice.transactionType },
    { label: '거래 금액', value: notice.price, highlight: true },
    { label: '전용 면적', value: notice.exclusiveArea, highlight: true },
    { label: '기타 면적', value: notice.additionalArea || '해당사항 없음' },
    { label: '해당층 / 총 층수', value: notice.floorInfo },
    { label: '입주 가능일', value: notice.moveInDate },
    { label: '방 수 / 욕실 수', value: notice.roomsBathrooms },
    { label: '주차 대수', value: notice.parking },
    { label: '사용승인일 (준공)', value: notice.approvalDate },
    { label: '관리비', value: notice.maintenanceFee },
    { label: '방향 (기준)', value: notice.direction },
    { label: '위반건축물 여부', value: notice.illegalBuilding },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Header */}
      <div className="flex items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          <h4 className={`text-xs sm:text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            중개대상물 법정 표시·광고 명시사항
          </h4>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
          공인중개사법 시행령 제17조의2 준수
        </span>
      </div>

      {/* Specification Grid Table */}
      <div className={`rounded-2xl border overflow-hidden text-xs ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/70'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {rowItems.slice(0, 7).map((item, idx) => (
              <div key={idx} className="flex items-stretch min-h-[38px]">
                <div className={`w-32 sm:w-36 px-3.5 py-2.5 font-bold flex items-center shrink-0 border-r ${isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800' : 'bg-slate-100/90 text-slate-700 border-slate-200'}`}>
                  {item.label}
                </div>
                <div className={`px-3.5 py-2.5 flex items-center flex-1 font-medium ${item.highlight ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-700 font-bold') : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {rowItems.slice(7).map((item, idx) => (
              <div key={idx} className="flex items-stretch min-h-[38px]">
                <div className={`w-32 sm:w-36 px-3.5 py-2.5 font-bold flex items-center shrink-0 border-r ${isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800' : 'bg-slate-100/90 text-slate-700 border-slate-200'}`}>
                  {item.label}
                </div>
                <div className={`px-3.5 py-2.5 flex items-center flex-1 font-medium ${item.highlight ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-700 font-bold') : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brokerage Disclosure Box */}
      <div className={`rounded-2xl p-4 border text-xs space-y-2 ${isDark ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-slate-100/80 border-slate-200/90 text-slate-700'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-300 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-black text-xs">
            <Building2 className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            <span className={isDark ? 'text-white' : 'text-slate-900'}>{BROKERAGE_DISCLOSURE.officeName}</span>
            <span className="text-[11px] font-normal text-slate-400">(등록번호: {BROKERAGE_DISCLOSURE.registrationNo})</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            공인중개사 책임중개
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>대표자: <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>{BROKERAGE_DISCLOSURE.representative}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>대표번호: <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>{BROKERAGE_DISCLOSURE.phone}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>사무소 소재지: {BROKERAGE_DISCLOSURE.address}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          ※ 「공인중개사법」 제18조의2(중개대상물의 표시·광고) 규정을 준수하며, 중개보조원은 명시하지 않습니다.
        </div>
      </div>
    </div>
  );
}
