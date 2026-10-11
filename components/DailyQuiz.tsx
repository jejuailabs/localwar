'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Shield,
  Swords,
  Trophy,
} from 'lucide-react';
import { getGateway, backendMode } from '@/lib/gateway';
import { PROVINCES, PLAYABLE_REGIONS, regionByCode } from '@/lib/regions';
import { LEVELS, type Level, type GameSession, type SessionResult } from '@/packages/shared/game';
import type { BattleState, Preferences } from '@/packages/shared/conquest';
import { QuizPlay } from './Quiz';
import questionCatalog from '@/data/question-catalog.json';
const genderLabels = { unspecified: '응답하지 않음', female: '여성', male: '남성', other: '기타' };
const ageLabels = {
  unspecified: '응답하지 않음',
  under20: '20세 미만',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60plus': '60세 이상',
};
const levelLabels = ['가볍게', '흥미롭게', '깊이 있게', '전문가처럼'];
export function BattleSummary({
  onDaily,
  onState,
}: {
  onDaily: () => void;
  onState?: (state: BattleState) => void;
}) {
  const [state, setState] = useState<BattleState | null>(null);
  useEffect(() => {
    let gone = false;
    const refresh = () =>
      void getGateway()
        .then((g) => g.battleState())
        .then((s) => {
          if (!gone) {
            setState(s);
            onState?.(s);
          }
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => {
      gone = true;
      clearInterval(timer);
    };
  }, []);
  return (
    <section className="battle-summary">
      <div>
        <span className="eyebrow">TODAY'S BATTLE · {state?.day || 'KST'}</span>
        <h3>
          <Swords size={19} /> 오늘의 지역 점령전
        </h3>
        <p>직접 공격 90% + 데일리 지원 10% · 매일 00:00 새 전장</p>
      </div>
      <div className="battle-leaders">
        {state?.standings.slice(0, 3).map((r, i) => (
          <span key={r.regionCode}>
            <b>{i + 1}</b>
            {regionByCode(r.regionCode)?.name}
            <strong>{r.total.toFixed(2)}점</strong>
            <small>
              공격 {(0.9 * r.attackIndex).toFixed(2)} + 지원 {(0.1 * r.supportIndex).toFixed(2)}
            </small>
          </span>
        ))}
        {state && !state.standings.length && <p>오늘의 첫 기여를 기다리고 있어요.</p>}
        {state?.yesterday[0] && (
          <p>어제 1위 · {regionByCode(state.yesterday[0].regionCode)?.name}</p>
        )}
      </div>
      <button className="primary-button" onClick={onDaily}>
        <CalendarDays size={17} /> 데일리 퀴즈 <ArrowRight size={16} />
      </button>
    </section>
  );
}
export default function DailyQuiz({
  onComplete,
  onPlaying,
  initialResult,
}: {
  initialResult?: SessionResult | null;
  onComplete: (r: SessionResult) => void;
  onPlaying: (v: boolean) => void;
}) {
  const [state, setState] = useState<BattleState | null>(null),
    [level, setLevel] = useState<Level>(1),
    [session, setSession] = useState<GameSession | null>(null),
    [result, setResult] = useState<SessionResult | null>(initialResult || null),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(false),
    [error, setError] = useState(''),
    [province, setProvince] = useState('KR-49'),
    [prefs, setPrefs] = useState<Preferences>({
      regionCode: 'jeju-seogwipo',
      gender: 'unspecified',
      age: 'unspecified',
    });
  async function refresh() {
    const g = await getGateway();
    const s = await g.battleState();
    setState(s);
    if (s.preferences) {
      setPrefs(s.pending || s.preferences);
      setProvince(
        PROVINCES.find((p) =>
          p.regions.some((r) => r.code === (s.pending || s.preferences)!.regionCode),
        )!.iso,
      );
    }
    return s;
  }
  useEffect(() => {
    let gone = false;
    void refresh()
      .then(async (s) => {
        if (gone) return;
        if (
          localStorage.getItem('localwar-daily-active') === 'true' &&
          localStorage.getItem('localwar-daily-day') === s.day
        ) {
          const practice = localStorage.getItem('localwar-daily-practice') === 'true';
          if ((practice && s.practiceSession) || s.dailySession) await start(practice);
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      gone = true;
      onPlaying(false);
    };
  }, []);
  function playing(s: GameSession | null) {
    setSession(s);
    window.scrollTo({ top: 0, behavior: 'auto' });
    onPlaying(!!s);
    try {
      localStorage.setItem('localwar-daily-active', String(!!s));
    } catch {}
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      await (await getGateway()).savePreferences(prefs);
      await refresh();
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function start(practice: boolean) {
    setBusy(true);
    setError('');
    try {
      const g = await getGateway(),
        s = await g.startDaily(level, practice);
      localStorage.setItem('localwar-daily-practice', String(practice));
      localStorage.setItem('localwar-daily-day', s.day || '');
      if (s.completed) {
        setResult(s.completed);
        playing(null);
      } else if (s.answers?.length === 30) {
        complete(await g.finishSession(s.sessionId));
      } else {
        setResult(null);
        playing(s);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function complete(r: SessionResult) {
    setResult(r);
    playing(null);
    onComplete(r);
    void refresh().catch((e) => setError(e.message));
  }
  if (session)
    return (
      <QuizPlay
        key={session.sessionId}
        session={session}
        region={regionByCode(session.regionCode)!}
        onFinish={complete}
        onLeave={() => {
          playing(null);
          void refresh();
        }}
      />
    );
  if (result)
    return (
      <section className="daily-result">
        <span className="daily-emblem">
          <Trophy size={40} />
        </span>
        <span className="eyebrow">DAILY MISSION COMPLETE</span>
        <h1>{result.correctCount === 30 ? '전국 지식왕!' : '오늘의 지원 임무 완료!'}</h1>
        <p>
          {result.competitive
            ? `${regionByCode(result.regionCode)?.name}에 지원을 보냈어요.`
            : '연습 성적이 기록됐어요. 로그인한 계정의 오늘 첫 도전이 지역 지원에 반영됩니다.'}
        </p>
        <div className="daily-metrics">
          <div>
            <CheckCircle2 />
            <b>{result.correctCount}/30</b>
            <span>정답 · {result.daily?.accuracy}%</span>
          </div>
          <div>
            <Clock3 />
            <b>{result.daily?.speed}%</b>
            <span>맞힌 문제의 속도율</span>
          </div>
          <div>
            <Flag />
            <b>{result.daily?.support.toFixed(2)}</b>
            <span>내 지역 지원 점수</span>
          </div>
        </div>
        <p>
          개인 종합 성적 {result.daily?.performance.toFixed(2)} · 지원 점수는 난이도 계수를 적용하고
          지역 전체 참여자와 합산합니다.
        </p>
        <button className="primary-button" onClick={() => setResult(null)}>
          데일리 전장으로 <ArrowRight size={17} />
        </button>
        <div className="answer-review">
          <h3>오늘 발견한 30개의 이야기</h3>
          {result.items.map((q, i) => (
            <details key={q.id}>
              <summary>
                <span>{result.answers[i].correct ? '✓' : '×'}</span>
                <b>
                  {i + 1}. {q.prompt}
                </b>
              </summary>
              <div>
                <p>정답: {q.choices[result.answers[i].answerIndex]}</p>
                <p>{result.answers[i].explanation}</p>
                <a href={result.answers[i].source} target="_blank" rel="noreferrer">
                  관련 자료 보기
                </a>
              </div>
            </details>
          ))}
        </div>
      </section>
    );
  const own = state?.standings.find((r) => r.regionCode === state.preferences?.regionCode);
  return (
    <section className="daily-lobby">
      <div className="daily-hero">
        <div>
          <span className="eyebrow">DAILY 30 · {state?.day || '오늘의 전장'}</span>
          <h1>
            전국을 풀고,
            <br />
            <em>우리 지역에 힘을.</em>
          </h1>
          <p>
            난이도 하나, 전국 랜덤 30문제.
            <br />
            정확하게, 빠르게 맞혀 오늘의 지원을 보내세요.
          </p>
          <p>
            프리시즌 문제 풀 · {PLAYABLE_REGIONS.length}개 지역{' '}
            {questionCatalog.reduce((sum, entry) => sum + entry.questionCount, 0)}문항
          </p>
          <div className="daily-chips">
            <span>
              <CheckCircle2 size={15} /> 정답률 중심
            </span>
            <span>
              <Clock3 size={15} /> 문제당 30초
            </span>
            <span>
              <Flag size={15} /> 하루 한 번 지원
            </span>
          </div>
        </div>
        <div className="daily-orbit">
          <b>30</b>
          <span>QUESTIONS</span>
          <CalendarDays size={27} />
        </div>
      </div>
      <div className="daily-columns">
        <div className="daily-config">
          <h2>오늘은 어느 난이도로?</h2>
          <div className="daily-levels">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={level === l ? 'selected' : ''}
                disabled={busy}
                onClick={() => setLevel(l)}
              >
                <small>LEVEL {l}</small>
                <b>{levelLabels[l - 1]}</b>
                <span>지원 계수 {[0.7, 0.8, 0.9, 1][l - 1]}</span>
              </button>
            ))}
          </div>
          <div className="support-profile">
            <h3>내 지원 지역</h3>
            <p>처음 등록하면 바로 적용됩니다. 이후 정보 변경은 다음 날 적용됩니다.</p>
            {(!state?.preferences || editing) && (
              <>
                <div className="profile-fields">
                  <label>
                    시·도
                    <select
                      aria-label="지원 시도"
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setPrefs({
                          ...prefs,
                          regionCode: PROVINCES.find((p) => p.iso === e.target.value)!.regions[0]
                            .code,
                        });
                      }}
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.iso} value={p.iso}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    시·군·구
                    <select
                      aria-label="지원 시군구"
                      value={prefs.regionCode}
                      onChange={(e) => setPrefs({ ...prefs, regionCode: e.target.value })}
                    >
                      {PROVINCES.find((p) => p.iso === province)?.regions.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    성별 · 선택
                    <select
                      aria-label="참여 성별"
                      value={prefs.gender}
                      onChange={(e) =>
                        setPrefs({ ...prefs, gender: e.target.value as Preferences['gender'] })
                      }
                    >
                      {Object.entries(genderLabels).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    연령대 · 선택
                    <select
                      aria-label="참여 연령대"
                      value={prefs.age}
                      onChange={(e) =>
                        setPrefs({ ...prefs, age: e.target.value as Preferences['age'] })
                      }
                    >
                      {Object.entries(ageLabels).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="secondary-button" disabled={busy} onClick={() => void save()}>
                  지원 정보 저장
                </button>
              </>
            )}
            {state?.preferences && (
              <button className="text-button" onClick={() => setEditing((v) => !v)}>
                {editing ? '등록 정보 접기' : '지원 정보 변경'}
              </button>
            )}
            {state?.preferences && (
              <p className="saved-support">
                ✓ 현재 지원 지역: {regionByCode(state.preferences.regionCode)?.name}
                {state.pending && ` · 내일 적용: ${regionByCode(state.pending.regionCode)?.name}`}
              </p>
            )}
            <p>
              <Shield size={13} /> 성별·연령대는 개인 점수를 바꾸지 않으며 참여 편차 보정에만
              사용합니다. 미응답도 참여할 수 있어요.
            </p>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button daily-start"
            disabled={busy || !state || (!state.preferences && state.eligible)}
            onClick={() => void start(false)}
          >
            {busy
              ? '전장 연결 중…'
              : state?.dailyDone
                ? '오늘 성적 다시 보기'
                : state?.dailySession || (!state?.eligible && state?.practiceSession)
                  ? '진행 중인 데일리 이어 하기'
                  : '데일리 30문제 시작'}
            <ArrowRight size={18} />
          </button>
          {state?.dailyDone && (
            <button className="text-button" disabled={busy} onClick={() => void start(true)}>
              지원 반영 없이 연습하기
            </button>
          )}
          {state && !state.eligible && (
            <p>게스트는 연습 모드입니다. Google 로그인하면 오늘의 지역 지원에 참여합니다.</p>
          )}
        </div>
        <aside className="daily-support-card">
          <span className="eyebrow">TODAY'S CONTRIBUTION</span>
          <h2>
            <Flag size={21} />
            {state?.preferences
              ? regionByCode(state.preferences.regionCode)?.name
              : '우리 지역의 전력'}
          </h2>
          <div className="support-big">
            {own?.total.toFixed(2) || '0.00'}
            <small>오늘의 점령 지수</small>
          </div>
          <p>
            직접 공격 {(own ? own.attackIndex * 0.9 : 0).toFixed(2)} / 90
            <br />
            데일리 지원 {(own ? own.supportIndex * 0.1 : 0).toFixed(2)} / 10
          </p>
          <div className="support-split">
            <i style={{ width: `${own?.attackIndex || 0}%` }} />
            <i style={{ width: `${own?.supportIndex || 0}%` }} />
          </div>
          <p>데일리 참여 {own?.participants || 0}명 · 5명부터 지원 비중 전체 적용</p>
          <hr />
          <h3>오늘의 작전 규칙</h3>
          <p>
            정답률 80% + 정답률 × 속도율 20%
            <br />
            속도율은 맞힌 문제에서만 계산합니다.
          </p>
          <p>
            일일 공격권 {Math.max(0, 3 - (state?.attackUsed || 0))}/3
            <br />
            한국 시간 자정에 새 전장이 열립니다.
          </p>
          <p>
            충분한 참여 표본부터 성별·연령대 편차를 보정합니다. 보정 배수는 최대 1.5배이며 개인별
            정보는 공개되지 않습니다.
          </p>
          {backendMode === 'demo' && <p>현재는 브라우저 서버 시연 집계입니다.</p>}
        </aside>
      </div>
    </section>
  );
}
