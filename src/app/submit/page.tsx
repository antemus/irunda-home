'use client';

import { useState } from 'react';
import { FileSpreadsheet, User, Phone, MapPin, Send, Lock } from 'lucide-react';
import InquirySuccessModal from '@/components/InquirySuccessModal';

export default function SubmitPropertyPage() {
  const [inquiryType, setInquiryType] = useState('submit_property'); // 'submit_property' or 'find_property'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('성함과 연락처는 필수 입력입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullContent = `[${inquiryType === 'submit_property' ? '울산 매물 내놓기' : '울산 매물 구하기'}]\n- 희망지역/소재지: ${location || '미입력'}\n- 희망가격/예산: ${priceRange || '미입력'}\n- 세부요청: ${message}`;

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          inquiry_type: inquiryType,
          message: fullContent,
        }),
      });

      if (!res.ok) throw new Error('접수 실패');

      setIsSuccessOpen(true);
      setName('');
      setPhone('');
      setLocation('');
      setPriceRange('');
      setMessage('');
    } catch (err) {
      console.error(err);
      alert('접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
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

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-6">
        {/* Toggle Type */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setInquiryType('submit_property')}
            className={`py-3 rounded-xl font-extrabold text-sm transition-all ${
              inquiryType === 'submit_property'
                ? 'bg-white text-sky-700 shadow-md border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏪 매물 내놓기 (매도 / 임대)
          </button>
          <button
            type="button"
            onClick={() => setInquiryType('find_property')}
            className={`py-3 rounded-xl font-extrabold text-sm transition-all ${
              inquiryType === 'find_property'
                ? 'bg-white text-amber-800 shadow-md border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔎 매물 구하기 (매수 / 임차)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">성함 / 고객명 *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">연락처 *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {inquiryType === 'submit_property' ? '울산 매물 소재지 (구/동)' : '울산 희망 지역'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={inquiryType === 'submit_property' ? '예: 울산 남구 삼산동 상가' : '예: 울산 남구/중구 아파트'}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {inquiryType === 'submit_property' ? '희망 보증금/월세/매매가' : '희망 예산'}
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="예: 보증금 3000 / 월 150만원 또는 매매 3억"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">세부 문의 및 요청 사항</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="희망 업종(상가의 경우), 면적, 전용 층수, 입주 희망 시기 등을 남겨주세요."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <Lock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>입력해주신 정보는 울산 중개 상담 용도로만 안전하게 관리되며 외부에 유출되지 않습니다.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-black rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? '접수 처리 중...' : '울산 매물 접수 완료하기'}
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
