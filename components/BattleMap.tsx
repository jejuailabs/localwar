'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Flag,
  Flame,
  Layers3,
  MapPin,
  Minus,
  Plus,
  Radar,
  Search,
  Swords,
} from 'lucide-react';
import { PROVINCES, type Province, type Region } from '@/lib/regions';
type Properties = { shapeISO: string; shapeName: string };
type CountyProperties = { id: string; name: string; provinceIso: string; lng: number; lat: number };
export default function BattleMap({
  onRegion,
  discovered,
  territory,
}: {
  onRegion: (r: Region) => void;
  discovered: string[];
  territory: Record<string, number>;
}) {
  const [data, setData] = useState<FeatureCollection<Geometry, Properties> | null>(null),
    [countyData, setCountyData] = useState<FeatureCollection<Geometry, CountyProperties> | null>(
      null,
    );
  const [active, setActive] = useState<Province | null>(null),
    [focus, setFocus] = useState<string | null>(null),
    [hoverCounty, setHoverCounty] = useState<Region | null>(null),
    [list, setList] = useState(false),
    [search, setSearch] = useState(''),
    [mapError, setMapError] = useState(false),
    [zoom, setZoom] = useState(1);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    Promise.all([
      fetch('/geo/korea.geojson').then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      }),
      fetch('/geo/counties.geojson').then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      }),
    ])
      .then(([p, c]) => {
        setData(p);
        setCountyData(c);
      })
      .catch(() => {
        setMapError(true);
        setList(true);
      });
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);
  const projection = useMemo(
    () =>
      data
        ? geoMercator().fitExtent(
            [
              [180, 43],
              [644, 577],
            ],
            data,
          )
        : null,
    [data],
  );
  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection]);
  const counties = useMemo(
    () => countyData?.features.filter((c) => c.properties.provinceIso === focus) || [],
    [countyData, focus],
  );
  const countyProjection = useMemo(
    () =>
      counties.length
        ? geoMercator().fitExtent(
            [
              [170, 91],
              [673, 530],
            ],
            { type: 'FeatureCollection', features: counties },
          )
        : null,
    [counties],
  );
  const countyPath = useMemo(
    () => (countyProjection ? geoPath(countyProjection) : null),
    [countyProjection],
  );
  const features = data?.features || [];
  function enter(p: Province) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setActive(p);
    setHoverCounty(null);
    setFocus(p.iso);
    setZoom(1);
  }
  function lift(iso: string) {
    if (focus || list) return;
    const p = PROVINCES.find((p) => p.iso === iso);
    if (!p) return;
    setActive(p);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => enter(p), 420);
  }
  function reset() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setFocus(null);
    setActive(null);
    setHoverCounty(null);
    setZoom(1);
  }
  function countyRegion(c: CountyProperties) {
    return active?.regions.find((r) => r.name === c.name);
  }
  const nationalTransform = `translate(${420 * (1 - zoom)},${310 * (1 - zoom)}) scale(${zoom})`;
  return (
    <section className="map-card" aria-label="대한민국 탐험 지도">
      <div className="map-toolbar">
        <div>
          <span className="live-dot" />
          <strong>{focus ? `${active?.short} 원정 지도` : '전국 탐험 지도'}</strong>
          <span className="quiet-label">
            {focus
              ? `${counties.length}개 시·군·구를 직접 탐험하세요`
              : '지도 위의 땅을 깨워보세요'}
          </span>
        </div>
        <button
          className={`small-button ${list ? 'selected' : ''}`}
          onClick={() => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            setList(!list);
          }}
        >
          <Layers3 size={14} />
          {list ? '지도 보기' : '지역 목록'}
        </button>
      </div>
      <div className={`map-viewport ${focus ? 'in-region' : ''}`}>
        <div className="map-grid" />
        <span className="ocean-label east">EAST SEA</span>
        <span className="ocean-label west">YELLOW SEA</span>
        {!list && projection && path ? (
          <svg
            className="korea-map"
            viewBox="0 0 760 650"
            aria-label="도에 마우스를 올려 시·군·구 지도를 펼쳐보세요"
          >
            <defs>
              <filter id="island-shadow" x="-80%" y="-80%" width="260%" height="260%">
                <feDropShadow
                  dx="0"
                  dy="18"
                  stdDeviation="13"
                  floodColor="#000b12"
                  floodOpacity=".85"
                />
              </filter>
              <filter id="county-shadow" x="-80%" y="-80%" width="260%" height="260%">
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="7"
                  floodColor="#00080d"
                  floodOpacity=".9"
                />
              </filter>
              <filter id="county-glow" x="-70%" y="-70%" width="240%" height="240%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="#f5c97f"
                  floodOpacity=".45"
                />
              </filter>
              <linearGradient id="terrain-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#617562" />
                <stop offset="1" stopColor="#182f35" />
              </linearGradient>
              <linearGradient id="county-active" x1="0" y1="0" x2=".3" y2="1">
                <stop offset="0" stopColor="#ffe0a0" />
                <stop offset="1" stopColor="#b98543" />
              </linearGradient>
            </defs>
            <g
              className={`national-board ${focus ? 'receded' : ''}`}
              style={{ transform: nationalTransform }}
            >
              {features.map((f) => {
                const p = PROVINCES.find((p) => p.iso === f.properties.shapeISO);
                if (!p) return null;
                const lifted = active?.iso === p.iso && !focus;
                const d = path(f) || '';
                const centroid = path.centroid(f);
                return (
                  <g key={p.iso} className={`province-island ${lifted ? 'lifted' : ''}`}>
                    <g className="province-terrain" pointerEvents="none">
                      {[12, 9, 6, 3].map((depth) => (
                        <path
                          key={depth}
                          d={d}
                          transform={`translate(0,${depth})`}
                          fill="#283f3b"
                          stroke="#142b31"
                          strokeWidth="1"
                        />
                      ))}
                      <path
                        d={d}
                        fill={p.color}
                        fillOpacity={lifted ? 1 : 0.76}
                        stroke={lifted ? '#ffe6a8' : '#b5cabe77'}
                        strokeWidth={lifted ? 2 : 1}
                        className="province-top"
                      />
                      {!['KR-11', 'KR-28', 'KR-30', 'KR-50', 'KR-29', 'KR-27', 'KR-31'].includes(
                        p.iso,
                      ) && (
                        <text x={centroid[0]} y={centroid[1]} className="province-label">
                          {p.short}
                        </text>
                      )}
                    </g>
                    <path
                      className="province-hit"
                      d={d}
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="4"
                      role="button"
                      tabIndex={focus ? -1 : 0}
                      aria-label={`${p.name} 시군 지도 펼치기`}
                      onMouseEnter={() => lift(p.iso)}
                      onFocus={() => setActive(p)}
                      onClick={() => enter(p)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          enter(p);
                        }
                      }}
                    />
                  </g>
                );
              })}
              {!focus &&
                PROVINCES.flatMap((p) => p.regions.filter((r) => r.playable)).map((r) => {
                  const point = projection([r.lng, r.lat]);
                  if (!point) return null;
                  return (
                    <g
                      key={r.code}
                      transform={`translate(${point[0]},${point[1]})`}
                      className="region-pin"
                      pointerEvents="none"
                    >
                      <circle
                        r="15"
                        className="pin-pulse"
                        stroke="#efbd78"
                        fill="none"
                        strokeOpacity=".45"
                      />
                      <circle r="5" fill="#ffe0a0" stroke="#15242d" strokeWidth="2" />
                      {r.code === 'seoul-jongno' && (
                        <text x="-16" y="-4" textAnchor="end" className="province-label">
                          서울
                        </text>
                      )}
                    </g>
                  );
                })}
            </g>
            {focus && countyPath && countyProjection && (
              <g
                key={focus}
                className="county-board"
                style={{
                  transform: `translate(${420 * (1 - zoom)},${300 * (1 - zoom) - 12}) scale(${zoom})`,
                }}
              >
                {counties.map((f, i) => {
                  const r = countyRegion(f.properties);
                  if (!r) return null;
                  const hovered = r.code === hoverCounty?.code;
                  const d = countyPath(f) || '';
                  const center = countyPath.centroid(f);
                  const area = countyPath.area(f);
                  return (
                    <g
                      key={f.properties.id}
                      className={`county-island ${hovered ? 'county-hovered' : ''} ${r.playable ? 'county-playable' : ''}`}
                    >
                      <g className="county-terrain" pointerEvents="none">
                        {[13, 10, 7, 4].map((depth) => (
                          <path
                            key={depth}
                            d={d}
                            transform={`translate(0,${depth})`}
                            fill={hovered ? '#95612b' : '#2b4845'}
                            stroke={hovered ? '#c2924a' : '#466259'}
                            strokeWidth=".55"
                          />
                        ))}
                        <path
                          d={d}
                          className="county-face"
                          fill={
                            hovered
                              ? 'url(#county-active)'
                              : r.playable
                                ? '#6b9e83'
                                : ['#456c62', '#527a68', '#4e7267', '#5b7d69', '#497568'][i % 5]
                          }
                          stroke={hovered ? '#ffe8b5' : '#9cbfac'}
                          strokeWidth={hovered ? 2.4 : 1.25}
                        />
                        {(area > 750 || hovered) && (
                          <text
                            x={center[0]}
                            y={center[1]}
                            className={`county-name ${hovered ? 'county-name-active' : ''}`}
                          >
                            {r.name}
                          </text>
                        )}
                        {r.playable && (
                          <g transform={`translate(${center[0]},${center[1] - 19})`}>
                            <circle r="11" fill="#0b1e26" stroke="#edbd78" strokeWidth="1.2" />
                            <path
                              d="M-3 5V-5L4-3L-3 0"
                              fill="#efbd78"
                              stroke="#efbd78"
                              strokeWidth="1.4"
                            />
                          </g>
                        )}
                      </g>
                      <path
                        d={d}
                        className="county-hit"
                        fill="transparent"
                        stroke="transparent"
                        strokeWidth="2"
                        role="button"
                        tabIndex={0}
                        aria-label={`${r.name} ${r.playable ? '퀴즈 선택' : '탐험'}`}
                        onMouseEnter={() => setHoverCounty(r)}
                        onFocus={() => setHoverCounty(r)}
                        onClick={() => onRegion(r)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRegion(r);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            )}
            {!focus && (
              <g transform="translate(679,70)" className="map-compass">
                <path d="M0-16 L5 0 L0 14 L-5 0Z" fill="#91abae" />
                <text y="-24" textAnchor="middle">
                  N
                </text>
              </g>
            )}
          </svg>
        ) : (
          !list && (
            <div className="map-loading">
              <Radar className="spin" />
              지도를 펼치는 중…
            </div>
          )
        )}
        {list && (
          <div className="region-list">
            <label className="search-box">
              <Search size={16} />
              <input
                aria-label="지역 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="지역 이름으로 찾아보기"
              />
            </label>
            {mapError && (
              <p className="muted">지도를 불러오지 못했어요. 목록에서 탐험할 수 있습니다.</p>
            )}
            <div className="province-list">
              {PROVINCES.filter(
                (p) => p.name.includes(search) || p.regions.some((r) => r.name.includes(search)),
              ).map((p) => (
                <div key={p.iso}>
                  <h4>{p.name}</h4>
                  <div>
                    {p.regions
                      .filter((r) => !search || p.name.includes(search) || r.name.includes(search))
                      .map((r) => (
                        <button
                          key={r.code}
                          onClick={() => onRegion(r)}
                          className={r.playable ? 'ready' : ''}
                        >
                          {r.name}
                          {r.playable && <span>퀴즈</span>}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {focus && !list && (
          <>
            <div className="region-stage-heading">
              <span className="eyebrow">REGION UNLOCKED</span>
              <h3>{active?.name}</h3>
              <p>시·군·구 위에 마우스를 올려 다음 원정지를 고르세요.</p>
            </div>
            <button className="map-back small-button" onClick={reset}>
              <ArrowLeft size={14} />
              전국으로
            </button>
            {hoverCounty ? (
              <div className="county-game-card" key={hoverCounty.code}>
                <div className="county-game-icon">
                  {hoverCounty.playable ? <Swords size={22} /> : <Compass size={22} />}
                </div>
                <div>
                  <span className="eyebrow">
                    {hoverCounty.playable ? 'READY TO CONQUER' : 'A NEW DISCOVERY'}
                  </span>
                  <h4>
                    {hoverCounty.name}
                    <span>{hoverCounty.playable ? '퀴즈 도전' : '탐험 지역'}</span>
                  </h4>
                  <p>
                    {hoverCounty.playable
                      ? `내 점령도 ${territory[hoverCounty.code] || 32}% · 클릭해서 4문제 선택`
                      : '클릭하면 탐험 도감에 기록됩니다.'}
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${hoverCounty.name} 선택`}
                  onClick={() => onRegion(hoverCounty)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="county-stage-tip">
                <Compass size={17} />
                <span>땅을 골라보세요. 새로운 이야기가 기다립니다.</span>
              </div>
            )}
          </>
        )}
        {!focus && active && !list && (
          <div className="province-lift-label">
            <span className="eyebrow">OPENING THE WORLD</span>
            <strong>{active.name}</strong>
            <span>{active.regions.length}개의 시·군·구를 펼치는 중…</span>
          </div>
        )}
        {!list && (
          <div className="map-controls">
            <button
              className="icon-button"
              aria-label="지도 확대"
              disabled={zoom >= 1.6}
              onClick={() => setZoom((v) => Math.min(1.6, v + 0.2))}
            >
              <Plus size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="지도 축소"
              disabled={zoom <= 1}
              onClick={() => setZoom((v) => Math.max(1, v - 0.2))}
            >
              <Minus size={17} />
            </button>
          </div>
        )}
        {!active && !list && (
          <div className="map-hint">
            <span className="hint-icon">
              <MapPin size={17} />
            </span>
            <div>
              <strong>지도를 만지면, 모험이 시작됩니다.</strong>
              <p>도에 마우스를 올리면 땅이 솟아오르고 시·군·구가 펼쳐져요.</p>
            </div>
          </div>
        )}
        <div className="map-legend">
          <span>
            <i className="gold" />
            퀴즈 도전 가능
          </span>
          <span>
            <i className="mint" />
            탐험 지역
          </span>
          <span className="map-credit">geoBoundaries · 경계 2020–2021</span>
        </div>
      </div>
      <div className="map-bottom">
        <span>
          <Compass size={14} />
          발견한 지역 <b>{discovered.length}</b>
        </span>
        <span>
          <span className="live-dot mint" />
          점령 현황은 <b>내 체험 기록</b> 기준
        </span>
        <span>
          이야기를 발견하고, 지식으로 점령하세요.
          <ArrowUpRight size={14} />
        </span>
      </div>
    </section>
  );
}
