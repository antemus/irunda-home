'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

export interface MapProperty {
  id: string;
  property_no?: string;
  public_title?: string;
  public_description?: string;
  etc?: string;
  masked_address?: string;
  approx_lat?: number;
  approx_lng?: number;
  price?: string | number;
  pyeong_price?: string | number;
  property_type?: string;
  transaction_type?: string;
}

interface KakaoMapProps {
  properties: MapProperty[];
  selectedPropertyId?: string;
  onSelectProperty?: (property: MapProperty) => void;
  center?: { lat: number; lng: number };
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  center = { lat: 35.5383, lng: 129.3114 }, // 울산 중심 기본 좌표
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 카카오맵 SDK 로드 및 초기화
  useEffect(() => {
    let isMounted = true;
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '1b7e90b88ede13eb031b08a9b3071c60';

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        if (isMounted) setLoadError('카카오 지도 라이브러리를 불러오지 못했습니다.');
        return;
      }

      window.kakao.maps.load(() => {
        if (!containerRef.current || !isMounted) return;

        try {
          if (!mapRef.current) {
            const options = {
              center: new window.kakao.maps.LatLng(center.lat, center.lng),
              level: 5,
            };
            const map = new window.kakao.maps.Map(containerRef.current, options);

            // 지도 컨트롤 추가 (지도/스카이뷰 & 줌 컨트롤)
            const mapTypeControl = new window.kakao.maps.MapTypeControl();
            map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

            const zoomControl = new window.kakao.maps.ZoomControl();
            map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

            mapRef.current = map;
            setIsLoaded(true);
            setLoadError(null);
          }

          renderOverlays(mapRef.current);
        } catch (err: any) {
          console.error('카카오맵 초기화 오류:', err);
          if (isMounted) setLoadError(err?.message || '카카오맵 초기화 실패');
        }
      });
    };

    // 1. 이미 SDK가 로드되어 있는 경우
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // 2. 동적 스크립트 로드
      const scriptId = 'kakao-map-sdk';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJsKey}&autoload=false&libraries=services,clusterer`;
        script.async = true;
        document.head.appendChild(script);
      }

      script.onload = () => initMap();
      script.onerror = () => {
        if (isMounted) {
          setLoadError('카카오 개발자 콘솔의 사이트 도메인 등록이 필요합니다.');
        }
      };

      // 일정 주기로 window.kakao.maps 감지
      const interval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 300);

      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 매물 마커 (CustomOverlay) 렌더링
  const renderOverlays = (map: any) => {
    if (!map || !window.kakao || !window.kakao.maps) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    if (!properties || properties.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let validCount = 0;

    properties.forEach((prop) => {
      if (!prop.approx_lat || !prop.approx_lng) return;

      const position = new window.kakao.maps.LatLng(prop.approx_lat, prop.approx_lng);
      bounds.extend(position);
      validCount++;

      const isSelected = prop.id === selectedPropertyId;

      const overlayEl = document.createElement('div');
      overlayEl.className = 'cursor-pointer group select-none';
      overlayEl.style.zIndex = isSelected ? '50' : '10';

      overlayEl.innerHTML = `
        <div class="relative flex flex-col items-center transition-transform transform ${
          isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'
        }">
          <div class="${
            isSelected
              ? 'bg-slate-900 text-amber-300 border-amber-400 ring-4 ring-amber-400/30'
              : 'bg-sky-600 hover:bg-sky-700 text-white border-white'
          } px-3 py-1.5 rounded-2xl font-extrabold text-xs shadow-xl border-2 flex items-center gap-1.5 whitespace-nowrap transition-all">
            <span class="${isSelected ? 'text-amber-300' : 'text-sky-100'} font-semibold text-[11px]">${prop.property_type || '상가'}</span>
            <span class="font-black ${isSelected ? 'text-white' : 'text-amber-200'}">${prop.price ? `${prop.price}` : '문의'}</span>
          </div>
          <div class="w-2.5 h-2.5 ${
            isSelected ? 'bg-slate-900 border-b border-r border-amber-400' : 'bg-sky-600'
          } rotate-45 -mt-1 shadow-md"></div>
        </div>
      `;

      overlayEl.onclick = (e) => {
        e.stopPropagation();
        if (onSelectProperty) onSelectProperty(prop);
        map.panTo(position);
      };

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: overlayEl,
        yAnchor: 1,
        zIndex: isSelected ? 50 : 10,
      });

      customOverlay.setMap(map);
      overlaysRef.current.push(customOverlay);
    });

    // 선택된 매물이 있으면 해당 매물로 이동, 없으면 전체 매물이 다 보이게 범위 조정
    if (selectedPropertyId) {
      const target = properties.find((p) => p.id === selectedPropertyId);
      if (target && target.approx_lat && target.approx_lng) {
        map.panTo(new window.kakao.maps.LatLng(target.approx_lat, target.approx_lng));
      }
    } else if (validCount > 0) {
      map.setBounds(bounds);
    }
  };

  // properties나 selectedPropertyId 변경 시 마커 재렌더링
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      renderOverlays(mapRef.current);
    }
  }, [properties, selectedPropertyId, isLoaded]);

  const handleResetBounds = () => {
    if (!mapRef.current || !properties || properties.length === 0 || !window.kakao?.maps) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    let count = 0;
    properties.forEach((prop) => {
      if (prop.approx_lat && prop.approx_lng) {
        bounds.extend(new window.kakao.maps.LatLng(prop.approx_lat, prop.approx_lng));
        count++;
      }
    });
    if (count > 0) {
      mapRef.current.setBounds(bounds);
    }
  };

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100"
      style={{ width: '100%', height: '100%', minHeight: '550px' }}
    >
      {/* 카카오맵 캔버스 컨테이너 */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', minHeight: '550px' }} 
        className="w-full h-full min-h-[550px]"
      />

      {/* 로딩 인디케이터 */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-white px-5 py-3 rounded-2xl shadow-md border border-slate-200">
            <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
            <span>카카오 지도를 불러오는 중입니다...</span>
          </div>
        </div>
      )}

      {/* 에러 및 도메인 설정 안내 모달 */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-30 p-4">
          <div className="text-center space-y-3 bg-white p-6 rounded-3xl border border-amber-200 shadow-2xl max-w-md animate-fadeIn">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              카카오 지도 도메인 등록 필요
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              카카오맵 API 보안 정책에 따라 카카오 개발자센터에 현재 웹사이트 도메인을 등록하셔야 지도가 정상 출력됩니다.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1 text-[11px] text-slate-700 font-mono">
              <p className="font-bold text-slate-900">👉 등록할 사이트 도메인:</p>
              <p>• https://irunda.co.kr</p>
              <p>• https://www.irunda.co.kr</p>
              <p>• http://localhost:3000</p>
            </div>
            <a
              href="https://developers.kakao.com/console/app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <span>카카오 개발자센터 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 상단 보안 위치 배지 & 위치 초기화 버튼 */}
      {isLoaded && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>울산 카카오 매물 지도 ({properties.length}건)</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
              🛡️ 보안 가상 위치
            </span>
          </div>

          <button
            onClick={handleResetBounds}
            className="bg-white/95 hover:bg-white text-slate-700 px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="전체 매물 한눈에 보기"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span>전체 위치</span>
          </button>
        </div>
      )}
    </div>
  );
}
