'use client';

import { useState } from 'react';
import { FileSpreadsheet, User, Phone, MapPin, Send, Lock } from 'lucide-react';
import InquirySuccessModal from '@/components/InquirySuccessModal';
import { validateInquiry, formatPhoneNumber } from '@/utils/inquiryValidation';

export default function SubmitPropertyPage() {
  const [inquiryType, setInquiryType] = useState('submit_property'); // 'submit_property' or 'find_property'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(formatPhoneNumber(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullContent = `[${inquiryType === 'submit_property' ? '울산 매물 내놓기' : '울산 매물 구하기'}]\n- 희망지역/소재지: ${location || '미입력'}\n- 희망가격/예산: ${priceRange || '미입력'}\n- 세부요청: ${message}`;

    // 유효성 검사 및 스팸 필터링
    const validation = validateInquiry(name, phone, fullContent);
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: validation.cleanName,
          phone: validation.cleanPhone,
          inquiry_type: inquiryType,
          message: fullContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '접수 실패');
      }

      setIsSuccessOpen(true);
      setName('');
      setPhone('');
      setLocation('');
      setPriceRange('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || '접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-extrabold uppercase border border-amber-200">
          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          울산 온라인 매물 접수 센터 · irunda.co.kr
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          울산 상가 · 점포 · 아파트 내놓기 & 구하기
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          울산 전지역 상가 매도/임대나 아파트·오피스텔 매수/임차를 희망하시나요? <br />
          아래 양식을 작성해 주시면 장혜경 소장 및 전문 중개팀이 직접 확인 후 신속히 안내해 드립니다.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        {/* Toggle Type */}
        <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setInquiryType('submit_property')}
            className={`py-3 rounded-xl font-extrabold text-sm transition-all ${
              inquiryType === 'submit_property'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏠 매물 내놓기 (매도 / 임대)
          </button>
          <button
            type="button"
            onClick={() => setInquiryType('find_property')}
            className={`py-3 rounded-xl font-extrabold text-sm transition-all ${
              inquiryType === 'find_property'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔍 매물 구하기 (매수 / 임차)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                성함 / 상호명 *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동 (2자 이상)"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                연락처 *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                희망 지역 / 매물 위치 (선택)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 울산 남구 삼산동, 달동 시청 인근"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                희망 가격 / 예산 (선택)
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="예: 보증금 2,000만 / 월 100만 이하 또는 매매 5억"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              상세 요구사항 및 메모 (선택)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="상가 업종, 입주 희망일, 전용 면적 등 세부 요구사항을 남겨주시면 더욱 정밀한 상권분석 및 매칭이 진행됩니다."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
            <Lock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>수집된 정보는 이룬다 공인중개사의 매물 중개 및 안내 목적으로만 안전하게 보호됩니다.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl font-black text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? '접수 처리 중...' : '온라인 매물 접수하기'}
          </button>
        </form>
      </div>

      <InquirySuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        customerName={name || '고객'}
      />
    </div>
  );
}
