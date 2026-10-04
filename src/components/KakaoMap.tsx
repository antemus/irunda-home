'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Maximize2,
  Minimize2,
  Building2,
  X,
  FileText,
  Send,
  Layers,
} from 'lucide-react';
import { cleanApartmentBuildingName } from '@/utils/geoJitter';

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
  [key: string]: any;
}

interface KakaoMapProps {
  properties: MapProperty[];
  selectedPropertyId?: string;
  onSelectProperty?: (property: MapProperty) => void;
  onOpenDetail?: (property: MapProperty) => void;
  onOpenInquiry?: (property: MapProperty) => void;
  center?: { lat: number; lng: number };
  isExpanded?: boolean;
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
  onOpenDetail,
  onOpenInquiry,
  center = { lat: 35.5383, lng: 129.3114 }, // 울산 중심 기본 좌표
  isExpanded = false,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<{
    key: string;
    title: string;
    properties: MapProperty[];
  } | null>(null);

  // 카카오맵 SDK 로드 및 초기화
  useEffect(() => {
    let isMounted = true;
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '1b7e90b88ede13eb031b08a9b3071c60';

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        if (isMounted) setLoadError('카카오 지도 라이브러리를 불러오지 못했습니다.');
        return;
      }

      if (!containerRef.current) return;

      const mapOptions = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 8,
      };

      const map = new window.kakao.maps.Map(containerRef.current, mapOptions);
      mapRef.current = map;

      // 줌 컨트롤러 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // 지도 클릭 시 활성화된 멀티 팝업 닫기
      window.kakao.maps.event.addListener(map, 'click', () => {
        setActiveGroup(null);
      });

      if (isMounted) {
        setIsLoaded(true);
        renderOverlays(map);
      }
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => initMap());
    } else {
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

  // 창 크기나 확장 모드 변경 시 relayout 호출
  useEffect(() => {
    if (mapRef.current && window.kakao?.maps) {
      const timer = setTimeout(() => {
        mapRef.current.relayout();
        if (selectedPropertyId) {
          const target = properties.find((p) => p.id === selectedPropertyId);
          if (target && target.approx_lat && target.approx_lng) {
            mapRef.current.panTo(new window.kakao.maps.LatLng(target.approx_lat, target.approx_lng));
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isFullscreen, selectedPropertyId, properties]);

  // 외부에서 선택된 매물이 다중 매물 단지에 속할 경우 activeGroup 자동 동기화
  useEffect(() => {
    if (!selectedPropertyId || !properties || properties.length === 0) return;
    const target = properties.find((p) => p.id === selectedPropertyId);
    if (!target || !target.approx_lat || !target.approx_lng) return;

    const key = `${target.approx_lat.toFixed(5)},${target.approx_lng.toFixed(5)}`;
    const sameCoordProps = properties.filter(
      (p) => p.approx_lat && p.approx_lng && `${p.approx_lat.toFixed(5)},${p.approx_lng.toFixed(5)}` === key
    );

    if (sameCoordProps.length > 1) {
      const cleanTitle = cleanApartmentBuildingName(target.building_name) || target.property_type || '아파트';
      setActiveGroup({
        key,
        title: cleanTitle,
        properties: sameCoordProps,
      });
    }
  }, [selectedPropertyId, properties]);

  // 매물 마커 (CustomOverlay) 렌더링 - 동일 좌표 매물 그룹화 처리
  const renderOverlays = (map: any) => {
    if (!map || !window.kakao || !window.kakao.maps) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    if (!properties || properties.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let validCount = 0;

    // 동일 좌표 매물 그룹화 (아파트/오피스텔 단지 등)
    const groups = new Map<string, MapProperty[]>();
    properties.forEach((prop) => {
      if (!prop.approx_lat || !prop.approx_lng) return;
      const key = `${prop.approx_lat.toFixed(5)},${prop.approx_lng.toFixed(5)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(prop);
    });

    groups.forEach((groupProps, key) => {
      const first = groupProps[0];
      const position = new window.kakao.maps.LatLng(first.approx_lat, first.approx_lng);
      bounds.extend(position);
      validCount++;

      const isMulti = groupProps.length > 1;
      const isSelected = groupProps.some((p) => p.id === selectedPropertyId);
      const cleanTitle = cleanApartmentBuildingName(first.building_name) || first.property_type || '매물';

      const overlayEl = document.createElement('div');
      overlayEl.className = 'cursor-pointer group select-none';
      overlayEl.style.zIndex = isSelected ? '50' : '10';

      if (!isMulti) {
        const prop = first;
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
          setActiveGroup(null);
          if (onSelectProperty) onSelectProperty(prop);
          map.panTo(position);
        };
      } else {
        // 동일 아파트/건물 내 여러 매물이 겹칠 때: 건수 뱃지 및 단지명 표기
        overlayEl.innerHTML = `
          <div class="relative flex flex-col items-center transition-transform transform ${
            isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'
          }">
            <div class="${
              isSelected
                ? 'bg-slate-900 text-amber-300 border-amber-400 ring-4 ring-amber-400/30'
                : 'bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 hover:from-sky-800 hover:to-indigo-950 text-white border-white'
            } px-3 py-1.5 rounded-2xl font-extrabold text-xs shadow-2xl border-2 flex items-center gap-1.5 whitespace-nowrap transition-all">
              <span class="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm">
                ${groupProps.length}건
              </span>
              <span class="font-bold text-white text-xs">${cleanTitle}</span>
              <span class="font-black ${isSelected ? 'text-amber-300' : 'text-amber-200'} text-xs">${first.price ? `${first.price}` : '매물'}</span>
            </div>
            <div class="w-2.5 h-2.5 ${
              isSelected ? 'bg-slate-900 border-b border-r border-amber-400' : 'bg-indigo-900'
            } rotate-45 -mt-1 shadow-md"></div>
          </div>
        `;

        overlayEl.onclick = (e) => {
          e.stopPropagation();
          const targetProp = groupProps.find((p) => p.id === selectedPropertyId) || groupProps[0];
          if (onSelectProperty) onSelectProperty(targetProp);
          setActiveGroup({
            key,
            title: cleanTitle,
            properties: groupProps,
          });
          map.panTo(position);
        };
      }

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: overlayEl,
        yAnchor: 1,
        zIndex: isSelected ? 50 : 10,
      });

      customOverlay.setMap(map);
      overlaysRef.current.push(customOverlay);
    });

    if (selectedPropertyId) {
      const target = properties.find((p) => p.id === selectedPropertyId);
      if (target && target.approx_lat && target.approx_lng) {
        map.panTo(new window.kakao.maps.LatLng(target.approx_lat, target.approx_lng));
      }
    } else if (validCount > 0) {
      map.setBounds(bounds);
    }
  };

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] rounded-none h-screen w-screen'
          : 'h-full min-h-[550px]'
      }`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 카카오맵 캔버스 컨테이너 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} className="w-full h-full" />

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
            <h3 className="text-base font-extrabold text-slate-900">카카오 지도 도메인 등록 필요</h3>
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

      {/* 상단 안내 배지 & 컨트롤 버튼 모음 */}
      {isLoaded && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>울산 매물 지도 ({properties.length}건)</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
              🛡️ 단지 정확위치 / 상가 보안위치
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

          <button
            onClick={toggleFullscreen}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-2xl shadow-md border border-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95"
            title={isFullscreen ? '기본 화면으로 복귀' : '지도 전체화면으로 크게보기'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>화면 축소</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>지도 전체화면 확대</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 아파트/단지 내 다중 매물 목록 팝업 카드 */}
      {activeGroup && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-30 animate-fadeIn flex flex-col max-h-[65vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-4 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-sm font-black text-white truncate max-w-[200px]">
                {activeGroup.title}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shrink-0">
                총 {activeGroup.properties.length}개 매물
              </span>
            </div>
            <button
              onClick={() => setActiveGroup(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle Address */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{activeGroup.properties[0]?.masked_address}</span>
          </div>

          {/* Scrollable Unit Cards */}
          <div className="p-3 overflow-y-auto space-y-2.5 flex-1 text-xs">
            {activeGroup.properties.map((prop, idx) => {
              const isSelected = selectedPropertyId === prop.id;
              return (
                <div
                  key={prop.id || idx}
                  onClick={() => {
                    if (onSelectProperty) onSelectProperty(prop);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50 shadow-md ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
                      {prop.transaction_type || '매매'} · {prop.property_type || '아파트'}
                    </span>
                    {prop.property_no && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        #{prop.property_no}
                      </span>
                    )}
                  </div>

                  <div className="pt-0.5">
                    <h5 className="font-extrabold text-sm text-slate-900 truncate">
                      {prop.public_title}
                    </h5>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="font-black text-sky-700 text-sm">
                      {prop.price || '가격 문의'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenDetail) onOpenDetail(prop);
                          if (onSelectProperty) onSelectProperty(prop);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1"
                        title="법정 명시사항 상세정보"
                      >
                        <FileText className="w-3 h-3 text-sky-600" />
                        상세보기
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenInquiry) onOpenInquiry(prop);
                          if (onSelectProperty) onSelectProperty(prop);
                        }}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-extrabold text-[11px] shadow-sm transition-all"
                      >
                        문의
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
