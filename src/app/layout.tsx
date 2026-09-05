import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContactBar from '@/components/FloatingContactBar';

export const metadata: Metadata = {
  title: '울산 상가·아파트 전문 | 이룬다 공인중개사',
  description: '울산 전지역 상가, 점포, 아파트, 오피스텔 100% 실매물 전문. 정직한 시세와 권리분석으로 안전한 부동산 거래를 약속합니다.',
  keywords: '이룬다부동산, 울산부동산, 울산상가임대, 울산상가매매, 울산아파트, 울산오피스텔, 이룬다공인중개사, irunda.co.kr',
  openGraph: {
    title: '울산 상가·아파트 전문 | 이룬다 공인중개사',
    description: '100% 검증된 실매물과 안심 거래. 울산 상가·점포·아파트·오피스텔 지도 탐색 및 1:1 간편 상담',
    url: 'https://irunda.co.kr',
    siteName: '이룬다 부동산',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '1b7e90b88ede13eb031b08a9b3071c60'}&autoload=false&libraries=services,clusterer`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingContactBar />
      </body>
    </html>
  );
}
