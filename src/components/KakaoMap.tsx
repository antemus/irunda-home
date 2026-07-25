'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, Building2, Phone, MessageSquare } from 'lucide-react';

export interface MapProperty {
  id: string;
  public_title?: string;
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
    L: any;
  }
}

export default function KakaoMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  center = { lat: 35.5383, lng: 129.3114 } // Default Ulsan City Center
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const kakaoMapRef = useRef<any>(null);
  const kakaoMarkersRef = useRef<any[]>([]);
  const [mapEngine, setMapEngine] = useState<'kakao' | 'leaflet'>('kakao');

  // 1. Try Kakao Maps first, fallback to Leaflet OpenStreetMap if Kakao is blocked by domain restriction on localhost
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '1b7e90b88ede13eb031b08a9b3071c60';

    const loadLeafletFallback = () => {
      setMapEngine('leaflet');

      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (window.L) {
        initLeafletMap();
      } else {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initLeafletMap();
        document.head.appendChild(script);
      }
    };

    const initKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!containerRef.current) return;
          try {
            const options = {
              center: new window.kakao.maps.LatLng(center.lat, center.lng),
              level: 6,
            };
            const map = new window.kakao.maps.Map(containerRef.current, options);
            kakaoMapRef.current = map;
            renderKakaoMarkers(map);
          } catch (e) {
            console.warn('Kakao map domain restriction, switching to Leaflet:', e);
            loadLeafletFallback();
          }
        });
      } else {
        loadLeafletFallback();
      }
    };

    // Load Kakao script
    if (window.kakao && window.kakao.maps) {
      initKakaoMap();
    } else {
      const scriptId = 'kakao-sdk-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJsKey}&autoload=false&libraries=services,clusterer`;
        script.async = true;
        document.head.appendChild(script);
      }

      script.onload = () => initKakaoMap();
      script.onerror = () => loadLeafletFallback();

      // Timeout fallback to Leaflet if Kakao SDK hangs
      timeoutId = setTimeout(() => {
        if (!kakaoMapRef.current) {
          loadLeafletFallback();
        }
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 2. Leaflet Map Initialization (100% Free OpenStreetMap Real Map Tiles for Ulsan)
  const initLeafletMap = () => {
    if (!containerRef.current || !window.L) return;
    if (leafletMapRef.current) return;

    try {
      const L = window.L;
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: true,
      });

      // Add OpenStreetMap real map tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | 이룬다 부동산 보안지도',
      }).addTo(map);

      leafletMapRef.current = map;
      renderLeafletMarkers(map);
    } catch (e) {
      console.warn('Leaflet map error:', e);
    }
  };

  // Render Markers on Leaflet
  const renderLeafletMarkers = (map: any) => {
    if (!map || !window.L || !properties) return;
    const L = window.L;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    const bounds: [number, number][] = [];

    properties.forEach((prop) => {
      const lat = prop.approx_lat || 35.5383;
      const lng = prop.approx_lng || 129.3114;
      bounds.push([lat, lng]);

      const isSelected = prop.id === selectedPropertyId;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="
              background: ${isSelected ? '#f59e0b' : '#0284c7'};
              color: ${isSelected ? '#0f172a' : '#ffffff'};
              border: 2px solid #ffffff;
              padding: 4px 10px;
              border-radius: 16px;
              font-weight: 800;
              font-size: 11px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              font-family: sans-serif;
            ">
              <span>${prop.property_type || '상가'}</span>
              <span style="color: ${isSelected ? '#000000' : '#fef08a'}; font-weight: 900; margin-left: 4px;">${prop.price || '문의'}</span>
            </div>
            <div style="width: 8px; height: 8px; background: ${isSelected ? '#f59e0b' : '#0284c7'}; transform: rotate(45deg); margin-top: -4px;"></div>
          </div>
        `,
        iconSize: [100, 40],
        iconAnchor: [50, 40],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${prop.property_type || '상가점포'} · ${prop.transaction_type || '임대'}</div>
          <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 2px;">${prop.public_title || '추천 매물'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📍 ${prop.masked_address || '울산 소재지 부근'}</div>
          <div style="font-size: 13px; font-weight: 900; color: #0369a1; margin-top: 6px; border-top: 1px solid #e2e8f0; pt: 4px;">${prop.price || '문의'}</div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectProperty) onSelectProperty(prop);
      });
    });

    if (bounds.length > 0 && map.fitBounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Render Markers on Kakao Map
  const renderKakaoMarkers = (map: any) => {
    if (!map || !window.kakao || !window.kakao.maps) return;

    kakaoMarkersRef.current.forEach((m) => m.setMap(null));
    kakaoMarkersRef.current = [];

    if (!properties || properties.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let validCount = 0;

    properties.forEach((prop) => {
      if (!prop.approx_lat || !prop.approx_lng) return;

      const latLng = new window.kakao.maps.LatLng(prop.approx_lat, prop.approx_lng);
      bounds.extend(latLng);
      validCount++;

      const isSelected = prop.id === selectedPropertyId;

      const content = document.createElement('div');
      content.className = 'cursor-pointer group';
      content.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="${
            isSelected
              ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110'
              : 'bg-sky-600 text-white border-white hover:bg-sky-500'
          } px-3 py-1.5 rounded-2xl font-extrabold text-xs shadow-xl border-2 flex items-center gap-1 transition-all whitespace-nowrap">
            <span>${prop.property_type || '상가'}</span>
            <span class="font-black text-amber-200">${prop.price ? `${prop.price}` : '문의'}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-sky-600 rotate-45 -mt-1 shadow-md"></div>
        </div>
      `;

      content.onclick = () => {
        if (onSelectProperty) onSelectProperty(prop);
        map.panTo(latLng);
      };

      const overlay = new window.kakao.maps.CustomOverlay({
        position: latLng,
        content: content,
        yAnchor: 1,
      });

      overlay.setMap(map);
      kakaoMarkersRef.current.push(overlay);
    });

    if (validCount > 0) {
      map.setBounds(bounds);
    }
  };

  useEffect(() => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      renderLeafletMarkers(leafletMapRef.current);
    } else if (mapEngine === 'kakao' && kakaoMapRef.current) {
      renderKakaoMarkers(kakaoMapRef.current);
    }
  }, [properties, selectedPropertyId, mapEngine]);

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100"
      style={{ width: '100%', height: '100%', minHeight: '550px' }}
    >
      {/* Real Map Canvas Container (Explicit Inline Height & Width) */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', minHeight: '550px' }} 
        className="w-full h-full min-h-[550px]"
      />

      {/* Map Header Overlay Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-sky-600" />
        <span>울산 전지역 실시간 매물 지도 ({properties.length}건)</span>
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
          🛡️ 위치 보안 마커 (가상 200m)
        </span>
      </div>
    </div>
  );
}
