'use client';

import { useState } from 'react';
import { X, Send, Phone, User, MessageSquare, Lock } from 'lucide-react';
import InquirySuccessModal from './InquirySuccessModal';

interface QuickInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  propertyId?: string;
}

export default function QuickInquiryModal({ isOpen, onClose, propertyTitle, propertyId }: QuickInquiryModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [inquiryType, setInquiryType] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!isOpen && !isSuccessOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('성함과 연락처를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          inquiry_type: propertyTitle ? 'property_inquiry' : inquiryType,
          property_id: propertyId || null,
          property_title: propertyTitle || null,
        }),
      });

      if (!res.ok) {
        throw new Error('문의 등록 실패');
      }

      onClose();
      setIsSuccessOpen(true);
    } catch (err) {
      console.error(err);
      alert('문의 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {propertyTitle ? '매물 상세 문의하기' : '간편 3초 상담 문의'}
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  {propertyTitle ? propertyTitle : '이룬다 공인중개사가 정성껏 답변해 드립니다.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">성함 *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">연락처 *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              {!propertyTitle && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">문의 유형</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  >
                    <option value="general">일반 상담 / 매물 찾기</option>
                    <option value="submit_property">매물 내놓기 (매도/임대)</option>
                    <option value="find_land">토지/임야 구매 상담</option>
                    <option value="commercial">상가/공장 매매 및 임대</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">문의 내용 (선택)</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="희망 지역, 예산, 지목 또는 요구사항을 남겨주시면 더욱 빠른 안내가 가능합니다."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>고객님의 개인정보는 상담 목적으로만 안전하게 사용됩니다.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? '접수 처리 중...' : '문의 접수하기'}
              </button>
            </form>
          </div>
        </div>
      )}

      <InquirySuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        customerName={name || '고객'}
      />
    </>
  );
}
