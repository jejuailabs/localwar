'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Crown,
  Flag,
  Flame,
  Globe2,
  HelpCircle,
  Landmark,
  Map,
  MapPin,
  Moon,
  Route,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import BattleMap from './BattleMap';
import { ExpeditionResult, QuizPlay, RegionChallenge } from './Quiz';
import { PLAYABLE_REGIONS, REGIONS, regionByCode, type Region } from '@/lib/regions';
import {
  BADGES,
  EMPTY_PROGRESS,
  applyResult,
  discover,
  loadProgress,
  saveProgress,
  type Progress,
} from '@/lib/progress';
import { backendMode, getGateway, signIn } from '@/lib/gateway';
import type { GameSession, SessionResult } from '@/packages/shared/game';
type View = 'map' | 'region' | 'play' | 'result' | 'journal' | 'collection' | 'guide';
const BadgeIcons = { compass: Compass, flame: Flame, crown: Crown, map: Map };
export default function Game() {
  const [view, setView] = useState<View>('map'),
    [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS),
    [region, setRegion] = useState<Region>(PLAYABLE_REGIONS[0]),
    [session, setSession] = useState<GameSession | null>(null),
    [result, setResult] = useState<SessionResult | null>(null),
    [before, setBefore] = useState(32),
    [sound, setSound] = useState(false),
    [light, setLight] = useState(false),
    [toast, setToast] = useState(''),
    [player, setPlayer] = useState('새로운 탐험가'),
    [authBusy, setAuthBusy] = useState(false),
    [anonymous, setAnonymous] = useState(true);
  useEffect(() => {
    setProgress(loadProgress());
    try {
      setSound(localStorage.getItem('localwar-sound') === 'true');
      const theme = localStorage.getItem('localwar-theme') === 'light';
      setLight(theme);
      document.documentElement.dataset.theme = theme ? 'light' : 'dark';
    } catch {}
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (backendMode !== 'firebase') return;
    let off: (() => void) | undefined;
    let cancelled = false;
    void import('@/lib/firebase-gateway').then((m) => {
      if (cancelled) return;
      off = m.watchFirebasePlayer(
        (p) => {
          setPlayer(p.name);
          setAnonymous(p.anonymous);
        },
        (p) => {
          setProgress(p);
          saveProgress(p);
        },
        (message) => setToast(`게임 연결: ${message}`),
      );
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);
  function commit(p: Progress) {
    setProgress(p);
    saveProgress(p);
  }
  function openRegion(r: Region) {
    setRegion(r);
    if (backendMode === 'firebase')
      void getGateway()
        .then((g) => g.discoverRegion?.(r.code))
        .catch((e) => setToast(e.message));
    const next = discover(progress, r.code);
    commit(next);
    if (!progress.discovered.includes(r.code)) setToast(`새로운 지역 발견 · ${r.name}`);
    setView('region');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function finish(r: SessionResult) {
    setBefore(progress.territory[r.regionCode] || 32);
    const next = applyResult(progress, r);
    commit(next);
    setResult(r);
    setView('result');
    const gained = BADGES.filter(
      (b) => next.badges.includes(b.id) && !progress.badges.includes(b.id),
    );
    if (gained.length) setToast(`새로운 배지 · ${gained.map((b) => b.name).join(', ')}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function nav(v: View) {
    if (view === 'play') return;
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleSound() {
    const value = !sound;
    setSound(value);
    try {
      localStorage.setItem('localwar-sound', String(value));
    } catch {}
    setToast(value ? '게임 효과음 켜짐' : '게임 효과음 꺼짐');
  }
  function toggleTheme() {
    const value = !light;
    setLight(value);
    document.documentElement.dataset.theme = value ? 'light' : 'dark';
    try {
      localStorage.setItem('localwar-theme', value ? 'light' : 'dark');
    } catch {}
  }
  async function login() {
    if (!anonymous) {
      const m = await import('@/lib/firebase-gateway');
      await m.logoutPlayer();
      setToast('게스트 탐험가로 돌아왔어요.');
      return;
    }
    setAuthBusy(true);
    try {
      const user = await signIn();
      setPlayer(user.name);
      setToast(`${user.name}님, 원정을 시작해 볼까요?`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : '로그인하지 못했습니다.');
    } finally {
      setAuthBusy(false);
    }
  }
  const level = Math.floor(progress.xp / 1000) + 1;
  const levelPercent = (progress.xp % 1000) / 10;
  return (
    <div className="game-shell">
      <aside className="sidebar">
        <button
          className="brand"
          aria-label="로컬 퀴즈대전 첫 화면"
          disabled={view === 'play'}
          onClick={() => nav('map')}
        >
          <span className="brand-mark">
            <Compass size={25} strokeWidth={1.8} />
          </span>
          <span>
            로컬<span>퀴즈대전</span>
            <small>LOCAL QUIZ BATTLE</small>
          </span>
        </button>
        <div className="sidebar-season">
          <span className="season-chip">
            <i />
            PRE-SEASON
          </span>
          <h4>첫 번째 원정의 시작</h4>
          <p>우리 동네에서 대한민국까지</p>
        </div>
        <span className="nav-caption">PLAY & EXPLORE</span>
        <nav aria-label="게임 메뉴">
          {(
            [
              { id: 'map', label: '전국 지도', icon: Map },
              { id: 'journal', label: '나의 원정', icon: Route },
              { id: 'collection', label: '탐험 도감', icon: BookOpen },
              { id: 'guide', label: '플레이 가이드', icon: HelpCircle },
            ] as const
          ).map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                disabled={view === 'play'}
                className={
                  view === n.id || (n.id === 'map' && ['region', 'play', 'result'].includes(view))
                    ? 'active'
                    : ''
                }
                onClick={() => nav(n.id)}
              >
                <Icon size={19} />
                {n.label}
                {n.id === 'map' ? (
                  <span className="nav-dot" />
                ) : n.id === 'collection' && progress.badges.length > 0 ? (
                  <span className="nav-count">{progress.badges.length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-quest">
          <span className="quest-symbol">
            <Flag size={23} />
          </span>
          <span className="eyebrow">YOUR NEXT MISSION</span>
          <h4>{progress.visited.length >= 3 ? '새 기록에 도전하기' : '세 지역, 세 가지 이야기'}</h4>
          <p>
            {progress.visited.length >= 3
              ? '난이도를 올려 최고 점수를 갱신해보세요.'
              : '서귀포·충주·종로를 탐험하고 전국 탐험가 배지를 모으세요.'}
          </p>
          <div className="quest-mini-progress">
            {PLAYABLE_REGIONS.map((r) => (
              <span className={progress.visited.includes(r.code) ? 'done' : ''} key={r.code}>
                {progress.visited.includes(r.code) ? <Check size={12} /> : <MapPin size={12} />}
              </span>
            ))}
            <b>{progress.visited.length}/3</b>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div>
            <button
              className="icon-button"
              aria-label={sound ? '효과음 끄기' : '효과음 켜기'}
              onClick={toggleSound}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              className="icon-button"
              aria-label={light ? '다크 모드' : '라이트 모드'}
              onClick={toggleTheme}
            >
              {light ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span>{backendMode === 'demo' ? '체험 플레이' : '로그인 원정'}</span>
          </div>
          <small>지식이 쌓이면, 세계가 넓어집니다.</small>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <Globe2 size={16} />
            <span>대한민국</span>
            <ChevronRight size={13} />
            <b>
              {view === 'map'
                ? '전국 지도'
                : view === 'journal'
                  ? '나의 원정'
                  : view === 'collection'
                    ? '탐험 도감'
                    : view === 'guide'
                      ? '플레이 가이드'
                      : region.name}
            </b>
          </div>
          <div className="player-top">
            <span className="mode-badge">
              <i />
              {backendMode === 'demo' ? '프리시즌 · 체험' : '프리시즌 · 온라인'}
            </span>
            <span className="player-divider" />
            <div className="player-avatar">
              <Compass size={20} />
            </div>
            <div>
              <strong>{player}</strong>
              <span>
                Lv.{level} · {progress.xp.toLocaleString()} XP
              </span>
            </div>
            {backendMode === 'firebase' && (
              <button className="small-button" onClick={() => void login()} disabled={authBusy}>
                {authBusy ? '로그인 중…' : anonymous ? 'Google 로그인' : '로그아웃'}
              </button>
            )}
          </div>
        </header>
        <div className="page-content">
          {view === 'map' && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">
                    <span className="tiny-line" />
                    YOUR KNOWLEDGE. YOUR TERRITORY.
                  </span>
                  <h1>
                    아는 만큼, <em>우리 땅이 된다.</em>
                  </h1>
                  <p>대한민국을 탐험하고, 퀴즈로 도전하고, 나만의 깃발을 꽂아보세요.</p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => openRegion(PLAYABLE_REGIONS[0])}
                >
                  <Swords size={17} />
                  바로 원정 시작
                  <ArrowUpRight size={16} />
                </button>
              </section>
              <div className="dashboard-layout">
                <BattleMap
                  onRegion={openRegion}
                  discovered={progress.discovered}
                  territory={progress.territory}
                />
                <aside className="dashboard-side">
                  <section className="featured-expedition">
                    <img
                      src="/art/korea-expedition.webp"
                      alt="화산섬과 호수, 한옥마을이 어우러진 한국 탐험 풍경"
                    />
                    <div className="featured-overlay" />
                    <span className="featured-tag">
                      <Sparkles size={13} />
                      추천 첫 원정
                    </span>
                    <div className="featured-content">
                      <span className="eyebrow">JEJU IS CALLING</span>
                      <h2>
                        오늘은,
                        <br />
                        제주로 떠나볼까?
                      </h2>
                      <p>
                        성산일출봉에 숨은 이야기부터
                        <br />
                        바다를 지키는 사람들까지.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => openRegion(PLAYABLE_REGIONS[0])}
                      >
                        서귀포시 탐험하기
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </section>
                  <section className="expedition-list">
                    <div className="section-title">
                      <h3>
                        <Swords size={17} />
                        지금 도전할 수 있는 지역
                      </h3>
                      <span>3 REGIONS</span>
                    </div>
                    {PLAYABLE_REGIONS.map((r, i) => (
                      <button key={r.code} onClick={() => openRegion(r)} className="expedition-row">
                        <span className={`region-icon region-icon-${i}`}>
                          {i === 0 ? (
                            <Compass size={19} />
                          ) : i === 1 ? (
                            <Shield size={19} />
                          ) : (
                            <Landmark size={19} />
                          )}
                        </span>
                        <span>
                          <b>
                            {r.name}
                            <small>{r.province}</small>
                          </b>
                          <p>{r.tag}</p>
                        </span>
                        <span className="expedition-row-end">
                          <b>{progress.territory[r.code] || 32}%</b>
                          <small>내 점령도</small>
                        </span>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </section>
                  <section className="daily-mission">
                    <div className="mission-star">
                      <Award size={23} />
                    </div>
                    <div>
                      <span className="eyebrow">EXPLORER'S MISSION</span>
                      <h3>
                        {progress.badges.includes('combo')
                          ? '지식의 불꽃 획득 완료!'
                          : '연속 정답의 불꽃을 피워봐'}
                      </h3>
                      <p>
                        {progress.badges.includes('combo')
                          ? '다음 목표는 4문제 모두 정답.'
                          : '3문제 연속 정답 · 불꽃 배지 획득'}
                      </p>
                    </div>
                    <ArrowUpRight size={16} />
                  </section>
                </aside>
              </div>
              <section className="dashboard-stats">
                <div>
                  <span className="stat-icon">
                    <Compass size={21} />
                  </span>
                  <span>
                    <small>발견한 지역</small>
                    <b>
                      {progress.discovered.length}
                      <em> / {REGIONS.length}</em>
                    </b>
                  </span>
                  <p>다음 이야기가 기다리고 있어요.</p>
                </div>
                <div>
                  <span className="stat-icon">
                    <Flag size={21} />
                  </span>
                  <span>
                    <small>완료한 원정</small>
                    <b>
                      {progress.results.length}
                      <em> EXPEDITIONS</em>
                    </b>
                  </span>
                  <p>한 번의 도전, 하나의 발자취.</p>
                </div>
                <div>
                  <span className="stat-icon">
                    <Trophy size={21} />
                  </span>
                  <span>
                    <small>내 최고 점수</small>
                    <b>
                      {progress.bestScore.toLocaleString()}
                      <em> PTS</em>
                    </b>
                  </span>
                  <p>어제의 나를 넘어서 보세요.</p>
                </div>
              </section>
              <footer className="page-footer">
                <span>첫 원정은 가볍게. 다음 원정은 조금 더 깊이.</span>
                <span>
                  {backendMode === 'demo'
                    ? '체험 점령도 · 탐험 기록은 이 브라우저에 저장됩니다.'
                    : '점수는 Firebase 서버에서 검증됩니다.'}
                </span>
              </footer>
            </>
          )}
          {view === 'region' && (
            <RegionChallenge
              key={region.code}
              region={region}
              occupation={progress.territory[region.code] || 32}
              onClose={() => nav('map')}
              onStart={(s) => {
                setSession(s);
                setView('play');
                window.scrollTo({ top: 0 });
              }}
            />
          )}
          {view === 'play' && session && (
            <QuizPlay
              session={session}
              region={region}
              onFinish={finish}
              onLeave={() => {
                setView('map');
                setSession(null);
              }}
            />
          )}
          {view === 'result' && result && (
            <ExpeditionResult
              result={result}
              region={region}
              before={before}
              onMap={() => nav('map')}
              onRetry={() => setView('region')}
            />
          )}
          {view === 'journal' && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">YOUR EXPEDITION LOG</span>
                  <h1>나의 원정 기록</h1>
                  <p>발견한 이야기와 도전의 순간을 모았습니다.</p>
                </div>
                <button className="primary-button" onClick={() => nav('map')}>
                  새로운 원정
                  <ArrowRight size={17} />
                </button>
              </section>
              <div className="journal-summary">
                <div>
                  <Compass size={26} />
                  <b>Lv.{level}</b>
                  <span>탐험가 레벨</span>
                  <div className="progress-track">
                    <i style={{ width: `${levelPercent}%` }} />
                  </div>
                  <small>다음 레벨까지 {1000 - (progress.xp % 1000)} XP</small>
                </div>
                <div>
                  <Trophy size={26} />
                  <b>{progress.bestScore.toLocaleString()}</b>
                  <span>최고 점수</span>
                </div>
                <div>
                  <Flag size={26} />
                  <b>{progress.wins}</b>
                  <span>3문제 이상 정답 원정</span>
                </div>
              </div>
              {progress.results.length ? (
                <div className="journal-list">
                  {progress.results.map((r) => (
                    <button
                      key={r.sessionId}
                      onClick={() => {
                        setRegion(regionByCode(r.regionCode)!);
                        setBefore(
                          Math.max(0, (progress.territory[r.regionCode] || 32) - r.contribution),
                        );
                        setResult(r);
                        setView('result');
                      }}
                    >
                      <span className="region-icon">
                        <Flag size={21} />
                      </span>
                      <span>
                        <b>{regionByCode(r.regionCode)?.name}</b>
                        <small>
                          {r.correctCount}/4 정답 · {r.bestCombo} 콤보
                        </small>
                      </span>
                      <strong>
                        {r.totalScore.toLocaleString()}
                        <small> PTS</small>
                      </strong>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Route size={46} />
                  <h3>첫 원정의 기록을 남겨보세요.</h3>
                  <p>어떤 지역의 이야기부터 알아볼까요?</p>
                  <button className="primary-button" onClick={() => nav('map')}>
                    지도 펼치기
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === 'collection' && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">THE EXPLORER'S COLLECTION</span>
                  <h1>
                    작은 발견, <em>큰 컬렉션.</em>
                  </h1>
                  <p>발걸음마다 쌓이는 지역과 배지. 나만의 탐험 도감을 채워보세요.</p>
                </div>
                <span className="collection-count">
                  {progress.badges.length} / {BADGES.length} 배지
                </span>
              </section>
              <div className="badge-grid">
                {BADGES.map((b) => {
                  const unlocked = progress.badges.includes(b.id);
                  const Icon = BadgeIcons[b.symbol as keyof typeof BadgeIcons];
                  return (
                    <div className={`badge-card ${unlocked ? 'unlocked' : ''}`} key={b.id}>
                      <span>{unlocked ? <Icon size={38} /> : <Shield size={38} />}</span>
                      <small>{unlocked ? 'UNLOCKED' : 'TO BE DISCOVERED'}</small>
                      <h3>{b.name}</h3>
                      <p>{b.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="section-title discovered-title">
                <h3>
                  <MapPin size={19} />
                  발견한 지역
                </h3>
                <span>
                  {progress.discovered.length}/{REGIONS.length}
                </span>
              </div>
              <div className="discovery-grid">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    className={progress.discovered.includes(r.code) ? 'discovered' : ''}
                    onClick={() => openRegion(r)}
                  >
                    <span>
                      {progress.discovered.includes(r.code) ? (
                        <Check size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                    </span>
                    <b>{r.name}</b>
                    <small>{r.province}</small>
                    {r.playable && <span className="tiny-ready">퀴즈</span>}
                  </button>
                ))}
              </div>
            </>
          )}
          {view === 'guide' && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">A LITTLE GUIDE TO A BIG ADVENTURE</span>
                  <h1>첫 원정, 이렇게 시작하세요.</h1>
                  <p>아는 문제를 고르고, 모르는 이야기를 발견하는 게임입니다.</p>
                </div>
              </section>
              <div className="guide-grid">
                {[
                  {
                    n: '01',
                    icon: Map,
                    title: '지도에서 발견하기',
                    text: '전국 지도는 평평하게 시작합니다. 시·도에 마우스를 올리면 그 땅만 솟아오르고, 클릭해야 시·군·구 지도가 열립니다. 모바일에서는 탭으로 지역을 고르세요.',
                  },
                  {
                    n: '02',
                    icon: Compass,
                    title: '나만의 퀴즈 고르기',
                    text: '역사·인물·음식·여행의 16칸 중 4칸을 자유롭게 선택하세요. 높은 단계는 더 큰 점수에 도전할 수 있습니다.',
                  },
                  {
                    n: '03',
                    icon: Flame,
                    title: '30초 안에 도전하기',
                    text: '문제마다 30초. 3초 안에 맞히면 1.2배, 이후 시간에 따라 보너스가 줄어듭니다. 3연속 정답으로 불꽃 배지를 얻어요.',
                  },
                  {
                    n: '04',
                    icon: Flag,
                    title: '깃발과 발자취 남기기',
                    text: '체험에서는 120점마다 약 1%p의 점령 기여를 얻습니다. 점령도 100%에 도달하면 내 깃발이 올라갑니다. 원정 기록과 개인 점령 게이지가 쌓입니다.',
                  },
                ].map((g) => (
                  <article key={g.n}>
                    <span className="guide-number">{g.n}</span>
                    <g.icon size={30} />
                    <h3>{g.title}</h3>
                    <p>{g.text}</p>
                  </article>
                ))}
              </div>
              <div className="guide-cta">
                <div>
                  <h3>이제, 당신의 첫 원정 차례.</h3>
                  <p>제주 서귀포시·충북 충주시·서울 종로구에서 시작하세요.</p>
                </div>
                <button className="primary-button" onClick={() => nav('map')}>
                  지도 펼치기
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Sparkles size={17} />
          {toast}
          <button className="icon-button" aria-label="알림 닫기" onClick={() => setToast('')}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
