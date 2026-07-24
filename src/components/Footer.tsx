import Link from 'next/link';
import { Building2, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">이룬다 공인중개사사무소</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              이룬다 부동산(irunda.co.kr)은 울산 전지역 상가, 점포, 수익형 부동산, 아파트, 오피스텔 전문 공인중개사사무소입니다.
              허위 매물 없이 100% 검증된 실매물과 정직한 상권 및 시세 분석으로 고객님의 성공적인 거래를 이룹니다.
            </p>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% 권리분석 & 안심 중개 계약 보증
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">바로가기</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  홈 메인
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-white transition-colors">
                  지도 매물 탐색
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">
                  내 매물 내놓기/구하기
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  장혜경 대표 소장 소개
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Business Registration */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">사무소 정보</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                대표전화: 010-8594-8949
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                사무소 위치: 울산광역시 전지역 중개
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                영업시간: 평일/토요일 09:00 ~ 19:00
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} 이룬다 공인중개사사무소 (irunda.co.kr). All rights reserved.</p>
          <div className="flex gap-4">
            <span>공인중개사 자격 정식 등록업소</span>
            <span>·</span>
            <span>울산 상가/아파트 전문</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
