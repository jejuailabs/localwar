'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Flag,
  Landmark,
  MapPin,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Utensils,
  X,
  XCircle,
  Compass,
  Shield,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  CATEGORIES,
  LEVELS,
  BASE_POINTS,
  type Pick,
  type GameSession,
  type AnswerResult,
  type SessionResult,
} from '@/packages/shared/game';
import type { Region } from '@/lib/regions';
import { getGateway } from '@/lib/gateway';
import { REGION_ART } from '@/lib/art';
import { playSound } from '@/lib/sound';
const Icons = { landmark: Landmark, users: Users, utensils: Utensils, compass: Compass };
export function RegionChallenge({
  region,
  onClose,
  onStart,
  occupation,
}: {
  region: Region;
  onClose: () => void;
  onStart: (session: GameSession) => void;
  occupation: number;
}) {
  const [picks, setPicks] = useState<Pick[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const max = picks.reduce((sum, p) => sum + BASE_POINTS[p.level], 0);
  async function start() {
    setBusy(true);
    setError('');
    try {
      const gateway = await getGateway();
      onStart(await gateway.startSession(region.code, picks));
    } catch (e) {
      setError(e instanceof Error ? e.message : '원정을 시작하지 못했습니다.');
      setBusy(false);
    }
  }
  return (
    <div className="challenge-layout">
      <div className="challenge-intro">
        <div className="challenge-art">
          <img
            src={(REGION_ART[region.code] || REGION_ART['jeju-seogwipo']).src}
            alt={(REGION_ART[region.code] || REGION_ART['jeju-seogwipo']).alt}
          />
          <div className="art-vignette" />
          <span className="image-label">
            <Compass size={14} />
            REGIONAL EXPEDITION
          </span>
          <div>
            <span className="eyebrow">
              {region.province} · {region.tag}
            </span>
            <h2>
              {region.name}
              <span>원정 준비</span>
            </h2>
          </div>
        </div>
        <p className="region-description">{region.description}</p>
        <div className="territory-preview">
          <div>
            <span>
              <Flag size={14} />내 점령 게이지
            </span>
            <b>{occupation}%</b>
          </div>
          <div className="progress-track">
            <i style={{ width: `${occupation}%` }} />
          </div>
          <p>정답을 맞힐수록 내 깃발이 가까워집니다.</p>
        </div>
        <div className="rule-stack">
          <div>
            <Clock3 size={20} />
            <span>
              <b>문제당 30초</b>
              <small>빠른 정답은 최대 1.2배</small>
            </span>
          </div>
          <div>
            <Flame size={20} />
            <span>
              <b>연속 정답 콤보</b>
              <small>3연속 정답으로 불꽃 배지 획득</small>
            </span>
          </div>
          <div>
            <Compass size={20} />
            <span>
              <b>원정마다 새로운 발견</b>
              <small>해설로 지역의 이야기를 알아보세요</small>
            </span>
          </div>
        </div>
        <button className="text-button" onClick={onClose}>
          <RotateCcw size={14} />
          다른 지역 탐험하기
        </button>
      </div>
      <section className="quiz-selection">
        <div className="selection-head">
          <div>
            <span className="eyebrow">BUILD YOUR CHALLENGE</span>
            <h2>어떤 지식으로 도전할까요?</h2>
            <p>16칸 중 4칸을 골라 나만의 원정을 만드세요.</p>
          </div>
          <span className="pick-counter">
            <b>{picks.length}</b> / 4
          </span>
        </div>
        {region.playable ? (
          <>
            <div className="quiz-grid">
              <div className="grid-corner">분류 / 난이도</div>
              {LEVELS.map((l) => (
                <div className="level-label" key={l}>
                  <span>
                    {l === 1
                      ? '가볍게'
                      : l === 2
                        ? '흥미롭게'
                        : l === 3
                          ? '깊이 있게'
                          : '전문가처럼'}
                  </span>
                  <b>LEVEL {l}</b>
                </div>
              ))}
              {CATEGORIES.map((c) => {
                const Icon = Icons[c.icon as keyof typeof Icons];
                return (
                  <div className="grid-row" key={c.id}>
                    <div className="category-label" style={{ color: c.color }}>
                      <Icon size={20} />
                      <b>{c.label}</b>
                    </div>
                    {LEVELS.map((l) => {
                      const selected = picks.some((p) => p.category === c.id && p.level === l);
                      const order = picks.findIndex((p) => p.category === c.id && p.level === l);
                      return (
                        <button
                          key={l}
                          aria-label={`${c.label} ${l}단계 ${BASE_POINTS[l]}점`}
                          aria-pressed={selected}
                          disabled={busy || (!selected && picks.length === 4)}
                          className={`quiz-pick ${selected ? 'picked' : ''}`}
                          onClick={() => {
                            setError('');
                            setPicks(
                              selected
                                ? picks.filter((p) => !(p.category === c.id && p.level === l))
                                : [...picks, { category: c.id, level: l }],
                            );
                          }}
                        >
                          <span className="pick-order">
                            {selected ? (
                              order + 1
                            ) : (
                              <span className="difficulty-dots">
                                {Array.from({ length: l }, (_, i) => (
                                  <i key={i} />
                                ))}
                              </span>
                            )}
                          </span>
                          <strong>{BASE_POINTS[l]}</strong>
                          <small>POINTS</small>
                          {selected && <Check size={16} className="pick-check" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="selection-summary">
              <div>
                <span>선택한 원정의 기본 점수</span>
                <b>
                  {max.toLocaleString()} <small>PTS</small>
                </b>
              </div>
              <span>
                최대 <b>{Math.round(max * 1.2).toLocaleString()}점</b>에 도전
              </span>
            </div>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button
              className="primary-button challenge-start"
              disabled={picks.length !== 4 || busy}
              onClick={start}
            >
              <Swords size={18} />
              {busy
                ? '원정 준비 중…'
                : picks.length === 4
                  ? '4문제 원정 시작'
                  : `도전할 퀴즈를 ${4 - picks.length}개 더 골라주세요`}
              <ArrowRight size={18} />
            </button>
            <p className="selection-note">
              같은 난이도도 자유롭게 선택할 수 있어요. 선택 순서대로 출제됩니다.
            </p>
          </>
        ) : (
          <div className="coming-soon">
            <Compass size={46} />
            <h3>새로운 지역을 발견했어요!</h3>
            <p>
              이 지역의 퀴즈는 준비 중입니다.
              <br />
              지금은 서귀포시·충주시·종로구에서 도전할 수 있어요.
            </p>
            <button className="primary-button" onClick={onClose}>
              다음 지역 탐험하기
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
export function QuizPlay({
  session,
  region,
  onFinish,
  onLeave,
}: {
  session: GameSession;
  region: Region;
  onFinish: (r: SessionResult) => void;
  onLeave: () => void;
}) {
  const [index, setIndex] = useState(0),
    [deadline, setDeadline] = useState<number | null>(null),
    [remaining, setRemaining] = useState(30),
    [result, setResult] = useState<AnswerResult | null>(null),
    [selected, setSelected] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [total, setTotal] = useState(0),
    [combo, setCombo] = useState(0),
    [confirmLeave, setConfirmLeave] = useState(false);
  const locked = useRef(false);
  const answers = useRef<AnswerResult[]>([]);
  const item = session.items[index];
  const category = CATEGORIES.find((c) => c.id === item.category)!;
  async function begin() {
    setError('');
    try {
      const gateway = await getGateway();
      const timing = await gateway.beginQuestion(session.sessionId, index);
      setDeadline(timing.deadline);
      setRemaining(Math.max(0, (timing.deadline - Date.now()) / 1000));
    } catch (e) {
      setError(e instanceof Error ? e.message : '문제를 시작하지 못했습니다.');
    }
  }
  useEffect(() => {
    locked.current = false;
    setDeadline(null);
    setResult(null);
    setSelected(null);
    setBusy(false);
    setRemaining(30);
    void begin();
  }, [index]);
  async function answer(choice: number | null) {
    if (locked.current || !deadline) return;
    locked.current = true;
    setBusy(true);
    setSelected(choice);
    setError('');
    try {
      const gateway = await getGateway();
      const response = await gateway.submitAnswer(session.sessionId, index, choice);
      answers.current.push(response);
      setResult(response);
      playSound(response.correct);
      setTotal((t) => t + response.score);
      setCombo((c) => (response.correct ? c + 1 : 0));
    } catch (e) {
      locked.current = false;
      setError(e instanceof Error ? e.message : '답을 제출하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!deadline || result) return;
    const timer = setInterval(() => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      setRemaining(left);
      if (left === 0 && !locked.current) void answer(null);
    }, 100);
    return () => clearInterval(timer);
  }, [deadline, result, index]);
  async function next() {
    if (index < 3) {
      setIndex(index + 1);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const gateway = await getGateway();
      onFinish(await gateway.finishSession(session.sessionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : '결과를 불러오지 못했습니다.');
      setBusy(false);
    }
  }
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (['1', '2', '3', '4'].includes(e.key) && !result && deadline) {
        void answer(Number(e.key) - 1);
      }
      if (e.key === 'Enter' && result && !busy) {
        void next();
      }
    }
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [result, deadline, busy, index]);
  return (
    <section className="play-screen">
      <div className="play-breadcrumb">
        <span>
          <MapPin size={15} />
          {region.province} / {region.name}
          <b>원정 중</b>
        </span>
        <button className="text-button" onClick={() => setConfirmLeave(true)}>
          <X size={15} />
          원정 나가기
        </button>
      </div>
      <div className="play-layout">
        <div className="play-main">
          <div className="question-progress">
            {session.items.map((q, i) => (
              <div className={i === index ? 'current' : i < index ? 'completed' : ''} key={q.id}>
                <span>
                  {i < index ? (
                    answers.current[i]?.correct ? (
                      <Check size={15} />
                    ) : (
                      <X size={15} />
                    )
                  ) : (
                    `0${i + 1}`
                  )}
                </span>
                <p>
                  {CATEGORIES.find((c) => c.id === q.category)?.short}
                  <small>Lv.{q.level}</small>
                </p>
              </div>
            ))}
          </div>
          <div className="question-box">
            <div className="question-meta">
              <span style={{ color: category.color }}>
                {category.label} · LEVEL {item.level}
              </span>
              <span>{BASE_POINTS[item.level]} POINTS</span>
            </div>
            <h2>{item.prompt}</h2>
            <p className="question-prompt">정답이라고 생각하는 보기를 선택하세요.</p>
            <div className="answer-options">
              {item.choices.map((choice, i) => (
                <button
                  key={i}
                  aria-label={`보기 ${i + 1}: ${choice}`}
                  disabled={busy || !!result || !deadline}
                  className={`${selected === i ? 'chosen' : ''} ${result?.answerIndex === i ? 'correct' : ''} ${result && selected === i && !result.correct ? 'wrong' : ''}`}
                  onClick={() => void answer(i)}
                >
                  <span className="answer-number">{i + 1}</span>
                  <strong>{choice}</strong>
                  {result?.answerIndex === i ? (
                    <CheckCircle2 size={22} />
                  ) : result && selected === i && !result.correct ? (
                    <XCircle size={22} />
                  ) : null}
                </button>
              ))}
            </div>
            {result && (
              <div
                className={`answer-feedback ${result.correct ? 'success' : 'failure'}`}
                role="status"
              >
                <div>
                  <span>{result.correct ? <Sparkles size={23} /> : <Compass size={23} />}</span>
                  <strong>
                    {result.correct
                      ? '정답! 지역에 한 걸음 더 가까이.'
                      : result.timedOut
                        ? '시간 종료! 새로운 지식을 발견했어요.'
                        : '새로운 지식을 발견했어요.'}
                  </strong>
                  {result.correct && <b>+{result.score} PTS</b>}
                </div>
                <p>{result.explanation}</p>
                <a href={result.source} target="_blank" rel="noreferrer">
                  관련 자료 보기
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
                {!deadline && (
                  <button className="text-button" onClick={() => void begin()}>
                    다시 시작
                  </button>
                )}
              </p>
            )}
            {result ? (
              <button
                className="primary-button next-question"
                disabled={busy}
                onClick={() => void next()}
              >
                {busy ? '결과 집계 중…' : index === 3 ? '원정 결과 확인' : '다음 지역 이야기로'}
                <ArrowRight size={18} />
              </button>
            ) : (
              <p className="keyboard-hint">숫자키 1–4로 빠르게 선택할 수 있어요.</p>
            )}
          </div>
        </div>
        <aside className="play-sidebar">
          <div className={`timer-card ${remaining <= 5 && !result ? 'urgent' : ''}`}>
            <span className="eyebrow">TIME TO CONQUER</span>
            <div
              className="timer-ring"
              style={{ '--timer-progress': `${(remaining / 30) * 360}deg` } as React.CSSProperties}
            >
              <div>
                <Clock3 size={20} />
                <b>{Math.ceil(remaining).toString().padStart(2, '0')}</b>
                <span>SECONDS</span>
              </div>
            </div>
            <p>
              {result
                ? '다음 이야기로 떠날 준비 완료'
                : remaining <= 5
                  ? '집중! 마지막 기회를 잡으세요.'
                  : '빠르게 맞히면 최대 1.2배!'}
            </p>
          </div>
          <div className="score-card">
            <span className="eyebrow">EXPEDITION SCORE</span>
            <h3>
              {total.toLocaleString()}
              <small>PTS</small>
            </h3>
            <div className={`combo-display ${combo >= 2 ? 'on-fire' : ''}`}>
              <Flame size={23} />
              <span>{combo >= 2 ? `${combo} COMBO` : '연속 정답을 노려보세요'}</span>
            </div>
            <p>콤보는 배지와 연출에 반영됩니다.</p>
          </div>
          <div className="play-tip">
            <Compass size={18} />
            <b>탐험가의 메모</b>
            <p>
              정답보다 오래 남는 건 이야기.
              <br />
              해설에서 다음 원정의 힌트를 찾아보세요.
            </p>
          </div>
        </aside>
      </div>
      {confirmLeave && (
        <div className="modal-backdrop">
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label="원정 나가기">
            <Flag size={30} />
            <h3>이 원정을 마칠까요?</h3>
            <p>완료하지 않은 원정의 점수는 저장되지 않습니다.</p>
            <div>
              <button className="secondary-button" onClick={() => setConfirmLeave(false)}>
                계속 도전
              </button>
              <button className="primary-button" onClick={onLeave}>
                지도 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export function ExpeditionResult({
  result,
  region,
  before,
  onMap,
  onRetry,
}: {
  result: SessionResult;
  region: Region;
  before: number;
  onMap: () => void;
  onRetry: () => void;
}) {
  const perfect = result.correctCount === 4;
  const after = Math.min(100, before + result.contribution);
  return (
    <section className="result-screen">
      <div className="result-hero">
        <div className="confetti">
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  left: `${(i * 17) % 100}%`,
                  animationDelay: `${(i % 7) * 0.15}s`,
                  '--rotate': `${i * 37}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <span className="result-trophy">
          <Trophy size={42} />
        </span>
        <span className="eyebrow">EXPEDITION COMPLETE</span>
        <h1>
          {perfect
            ? '완벽한 원정!'
            : result.correctCount >= 3
              ? '멋진 원정이었어요!'
              : '다음 원정은 더 강하게!'}
        </h1>
        <p>{region.name}의 이야기를 발견하고, 지식으로 한 걸음 전진했습니다.</p>
        <div className="result-total">
          {result.totalScore.toLocaleString()}
          <span>PTS</span>
        </div>
        <div className="result-stats">
          <div>
            <CheckCircle2 size={19} />
            <b>{result.correctCount}/4</b>
            <span>정답</span>
          </div>
          <div>
            <Flame size={19} />
            <b>{result.bestCombo} COMBO</b>
            <span>최고 연속 정답</span>
          </div>
          <div>
            <Flag size={19} />
            <b>+{result.contribution}%p</b>
            <span>체험 점령 기여</span>
          </div>
        </div>
      </div>
      <div className="result-content">
        <div className="capture-card">
          <div>
            <span>
              <Flag size={19} />
              {region.name} 점령 게이지
            </span>
            <b>
              {before}% → <em>{after}%</em>
            </b>
          </div>
          <div className="capture-track">
            <i style={{ width: `${after}%` }} />
            <span style={{ left: `${before}%` }} />
          </div>
          <p>
            {after >= 100
              ? '내 깃발이 올라갔어요! 다른 지역에서도 도전해 보세요.'
              : '원정을 거듭할수록 깃발이 가까워집니다.'}{' '}
            {result.backend === 'demo' && '체험 결과는 이 브라우저에 저장됩니다.'}
          </p>
        </div>
        <div className="answer-review">
          <h3>원정에서 발견한 이야기</h3>
          {result.items.map((q, i) => (
            <details key={q.id}>
              <summary>
                <span className={result.answers[i].correct ? 'review-correct' : 'review-wrong'}>
                  {result.answers[i].correct ? <Check size={15} /> : <X size={15} />}
                </span>
                <b>{q.prompt}</b>
                <strong>+{result.answers[i].score}</strong>
              </summary>
              <div>
                <p>
                  <b>정답: </b>
                  {q.choices[result.answers[i].answerIndex]}
                </p>
                <p>{result.answers[i].explanation}</p>
                <a href={result.answers[i].source} target="_blank" rel="noreferrer">
                  관련 자료 보기
                  <ExternalLink size={12} />
                </a>
              </div>
            </details>
          ))}
        </div>
        <div className="result-actions">
          <button className="secondary-button" onClick={onRetry}>
            <RotateCcw size={16} />
            같은 지역 다시 도전
          </button>
          <button className="primary-button" onClick={onMap}>
            <Compass size={17} />
            새로운 지역 탐험
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
