import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  Music,
  Pause,
  Play,
  RotateCcw,
  Home,
  Trophy,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TRIG_QUESTIONS, TrigQuestion } from './data/questions';
import { MathText } from './components/MathText';
import { RaceTrack, CharacterMood } from './components/RaceTrack';
import { CountdownOverlay, FormulasModal, PauseOverlay, RulesModal } from './components/Modals';
import { PRAISE_PHRASES, WRONG_PHRASES, pickRandom, soundEngine } from './utils/audio';

type GameScreen = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED';
type QuestionCountOption = 10 | 25 | 50;

interface PreparedQuestion {
  id: number;
  q: string;
  options: [string, string, string, string];
  answer: number;
  hint: string;
}

interface MistakeRecord {
  id: number;
  q: string;
  correctAnswer: string;
  hint: string;
}

interface SavedRecord {
  gamesPlayed: number;
  bestScore: number;
  lastWinner: string;
}

interface RoundOutcome {
  type: 'correct' | 'both_wrong' | 'timeout';
  winner?: 1 | 2;
  chosenIndex?: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const P1_KEYS = ['A', 'S', 'D', 'F'] as const;
const P2_KEYS = ['J', 'K', 'L', ';'] as const;

const OPTION_STYLES = [
  {
    bg: 'bg-[#E3F3FF] hover:bg-[#D2ECFF] border-[#7CC6FE]',
    badge: 'bg-[#7CC6FE] text-white',
  },
  {
    bg: 'bg-[#FFEAF2] hover:bg-[#FFDCE9] border-[#FFA8C5]',
    badge: 'bg-[#FFA8C5] text-white',
  },
  {
    bg: 'bg-[#FFF7DC] hover:bg-[#FFEFA8] border-[#FFE08A]',
    badge: 'bg-[#F5C542] text-[#3B4A6B]',
  },
  {
    bg: 'bg-[#E2FAF2] hover:bg-[#CEF5E8] border-[#8FE3B0]',
    badge: 'bg-[#56C98C] text-white',
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepareDeck(count: QuestionCountOption): PreparedQuestion[] {
  const picked = shuffleArray(TRIG_QUESTIONS).slice(0, count);
  return picked.map((item: TrigQuestion) => {
    const indexed = item.options.map((text, idx) => ({
      text,
      isCorrect: idx === item.answer,
    }));
    const shuffled = shuffleArray(indexed);
    const newAnswer = shuffled.findIndex((o) => o.isCorrect);
    return {
      id: item.id,
      q: item.q,
      options: [shuffled[0].text, shuffled[1].text, shuffled[2].text, shuffled[3].text],
      answer: newAnswer,
      hint: item.hint,
    };
  });
}

function loadRecords(): SavedRecord {
  try {
    const raw = window.localStorage.getItem('trig_pegasi_records');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedRecord>;
      return {
        gamesPlayed: typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : 0,
        bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
        lastWinner: typeof parsed.lastWinner === 'string' ? parsed.lastWinner : '',
      };
    }
  } catch {
    // Ignore storage errors in sandboxed iframes
  }
  return { gamesPlayed: 0, bestScore: 0, lastWinner: '' };
}

function saveRecords(record: SavedRecord) {
  try {
    window.localStorage.setItem('trig_pegasi_records', JSON.stringify(record));
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  // Settings & Navigation
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>(10);
  const [p1NameInput, setP1NameInput] = useState("1-O'YINCHI");
  const [p2NameInput, setP2NameInput] = useState("2-O'YINCHI");
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  // Modals
  const [showFormulas, setShowFormulas] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Records
  const [records, setRecords] = useState<SavedRecord>(() => loadRecords());

  // Countdown state (3, 2, 1, 0)
  const [countdownStep, setCountdownStep] = useState<number | null>(null);

  // Active Game State
  const [deck, setDeck] = useState<PreparedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Wrong, setP1Wrong] = useState(0);
  const [p2Wrong, setP2Wrong] = useState(0);
  const [p1Streak, setP1Streak] = useState(0);
  const [p2Streak, setP2Streak] = useState(0);

  const [p1Mood, setP1Mood] = useState<CharacterMood>('idle');
  const [p2Mood, setP2Mood] = useState<CharacterMood>('idle');

  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [p1WrongIdx, setP1WrongIdx] = useState<number | null>(null);
  const [p2WrongIdx, setP2WrongIdx] = useState<number | null>(null);

  const [p1HintUsed, setP1HintUsed] = useState(false);
  const [p2HintUsed, setP2HintUsed] = useState(false);
  const [p1HiddenOpts, setP1HiddenOpts] = useState<number[]>([]);
  const [p2HiddenOpts, setP2HiddenOpts] = useState<number[]>([]);

  const [roundOutcome, setRoundOutcome] = useState<RoundOutcome | null>(null);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  const roundTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  const p1Name = p1NameInput.trim() || "1-O'YINCHI";
  const p2Name = p2NameInput.trim() || "2-O'YINCHI";
  const currentQuestion = deck[currentIdx] || null;

  const clearAllTimers = useCallback(() => {
    if (roundTimerRef.current !== null) {
      window.clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      window.clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const toggleSound = () => {
    soundEngine.unlock();
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.setSoundEnabled(next);
    if (next) soundEngine.playClick();
  };

  const toggleMusic = () => {
    soundEngine.unlock();
    const next = !musicOn;
    setMusicOn(next);
    soundEngine.setMusicEnabled(next);
    soundEngine.playClick();
  };

  const finishGame = useCallback(
    (finalP1: number, finalP2: number) => {
      clearAllTimers();
      setScreen('FINISHED');
      soundEngine.playFanfare();

      if (finalP1 > finalP2) {
        setP1Mood('dance');
        setP2Mood('idle');
        soundEngine.speak("Tabriklaymiz! G'olib aniqlandi!");
      } else if (finalP2 > finalP1) {
        setP2Mood('dance');
        setP1Mood('idle');
        soundEngine.speak("Tabriklaymiz! G'olib aniqlandi!");
      } else {
        setP1Mood('dance');
        setP2Mood('dance');
        soundEngine.speak("Ikkala o'yinchi ham ajoyib natija ko'rsatdi!");
      }

      const winnerLabel =
        finalP1 > finalP2 ? p1Name : finalP2 > finalP1 ? p2Name : 'Durang';

      setRecords((prev) => {
        const updated: SavedRecord = {
          gamesPlayed: prev.gamesPlayed + 1,
          bestScore: Math.max(prev.bestScore, finalP1, finalP2),
          lastWinner: winnerLabel,
        };
        saveRecords(updated);
        return updated;
      });
    },
    [clearAllTimers, p1Name, p2Name]
  );

  const goToNextQuestion = useCallback(
    (nextP1Score: number, nextP2Score: number) => {
      if (nextP1Score >= 10 || nextP2Score >= 10 || currentIdx + 1 >= deck.length) {
        finishGame(nextP1Score, nextP2Score);
        return;
      }
      setCurrentIdx((idx) => idx + 1);
      setTimeLeft(20);
      setP1Locked(false);
      setP2Locked(false);
      setP1WrongIdx(null);
      setP2WrongIdx(null);
      setP1HiddenOpts([]);
      setP2HiddenOpts([]);
      setRoundOutcome(null);
      setP1Mood('idle');
      setP2Mood('idle');
    },
    [currentIdx, deck.length, finishGame]
  );

  const addMistake = useCallback((q: PreparedQuestion) => {
    setMistakes((prev) => {
      if (prev.some((m) => m.id === q.id)) return prev;
      return [
        ...prev,
        {
          id: q.id,
          q: q.q,
          correctAnswer: q.options[q.answer],
          hint: q.hint,
        },
      ];
    });
  }, []);

  const startNewGame = useCallback(() => {
    clearAllTimers();
    soundEngine.unlock();
    soundEngine.playClick();

    const freshDeck = prepareDeck(questionCount);
    setDeck(freshDeck);
    setCurrentIdx(0);
    setTimeLeft(20);
    setP1Score(0);
    setP2Score(0);
    setP1Wrong(0);
    setP2Wrong(0);
    setP1Streak(0);
    setP2Streak(0);
    setP1Mood('idle');
    setP2Mood('idle');
    setP1Locked(false);
    setP2Locked(false);
    setP1WrongIdx(null);
    setP2WrongIdx(null);
    setP1HintUsed(false);
    setP2HintUsed(false);
    setP1HiddenOpts([]);
    setP2HiddenOpts([]);
    setRoundOutcome(null);
    setMistakes([]);

    setScreen('COUNTDOWN');
    setCountdownStep(3);
    soundEngine.playCountdown(false);
    soundEngine.speak('Uch, ikki, bir — boshladik!');

    countdownTimerRef.current = window.setTimeout(() => {
      setCountdownStep(2);
      soundEngine.playCountdown(false);
      countdownTimerRef.current = window.setTimeout(() => {
        setCountdownStep(1);
        soundEngine.playCountdown(false);
        countdownTimerRef.current = window.setTimeout(() => {
          setCountdownStep(0);
          soundEngine.playCountdown(true);
          countdownTimerRef.current = window.setTimeout(() => {
            setCountdownStep(null);
            setScreen('PLAYING');
          }, 700);
        }, 850);
      }, 850);
    }, 850);
  }, [clearAllTimers, questionCount]);

  // Question 20s Timer
  useEffect(() => {
    if (screen !== 'PLAYING' || roundOutcome !== null || !currentQuestion) {
      return;
    }

    roundTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (roundTimerRef.current !== null) {
            window.clearInterval(roundTimerRef.current);
            roundTimerRef.current = null;
          }
          soundEngine.playWrong();
          soundEngine.speak('Vaqt tugadi!');
          addMistake(currentQuestion);
          setRoundOutcome({ type: 'timeout' });
          setP1Mood('sad');
          setP2Mood('sad');
          advanceTimerRef.current = window.setTimeout(() => {
            goToNextQuestion(p1Score, p2Score);
          }, 1600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current !== null) {
        window.clearInterval(roundTimerRef.current);
        roundTimerRef.current = null;
      }
    };
  }, [screen, roundOutcome, currentQuestion, addMistake, goToNextQuestion, p1Score, p2Score]);

  const handleAnswer = useCallback(
    (player: 1 | 2, optionIdx: number) => {
      if (screen !== 'PLAYING' || roundOutcome !== null || !currentQuestion) return;
      if (player === 1 && (p1Locked || p1HiddenOpts.includes(optionIdx))) return;
      if (player === 2 && (p2Locked || p2HiddenOpts.includes(optionIdx))) return;

      soundEngine.unlock();

      if (optionIdx === currentQuestion.answer) {
        // Correct answer!
        if (roundTimerRef.current !== null) {
          window.clearInterval(roundTimerRef.current);
          roundTimerRef.current = null;
        }
        soundEngine.playCorrect();

        const nextP1Score = player === 1 ? p1Score + 1 : p1Score;
        const nextP2Score = player === 2 ? p2Score + 1 : p2Score;

        if (player === 1) {
          const nextStreak = p1Streak + 1;
          setP1Score(nextP1Score);
          setP1Streak(nextStreak);
          setP1Mood('run');
          window.setTimeout(() => setP1Mood('happy'), 350);
          if (nextStreak >= 3 && nextStreak % 3 === 0) {
            soundEngine.speak("Zo'r! Davom et!");
          } else {
            soundEngine.speak(pickRandom(PRAISE_PHRASES));
          }
        } else {
          const nextStreak = p2Streak + 1;
          setP2Score(nextP2Score);
          setP2Streak(nextStreak);
          setP2Mood('run');
          window.setTimeout(() => setP2Mood('happy'), 350);
          if (nextStreak >= 3 && nextStreak % 3 === 0) {
            soundEngine.speak("Zo'r! Davom et!");
          } else {
            soundEngine.speak(pickRandom(PRAISE_PHRASES));
          }
        }

        setRoundOutcome({ type: 'correct', winner: player, chosenIndex: optionIdx });
        advanceTimerRef.current = window.setTimeout(() => {
          goToNextQuestion(nextP1Score, nextP2Score);
        }, 1350);
      } else {
        // Wrong answer!
        soundEngine.playWrong();
        soundEngine.speak(pickRandom(WRONG_PHRASES));
        addMistake(currentQuestion);

        if (player === 1) {
          setP1Wrong((w) => w + 1);
          setP1Streak(0);
          setP1Locked(true);
          setP1WrongIdx(optionIdx);
          setP1Mood('sad');
          if (p2Locked) {
            if (roundTimerRef.current !== null) {
              window.clearInterval(roundTimerRef.current);
              roundTimerRef.current = null;
            }
            setRoundOutcome({ type: 'both_wrong' });
            advanceTimerRef.current = window.setTimeout(() => {
              goToNextQuestion(p1Score, p2Score);
            }, 1500);
          }
        } else {
          setP2Wrong((w) => w + 1);
          setP2Streak(0);
          setP2Locked(true);
          setP2WrongIdx(optionIdx);
          setP2Mood('sad');
          if (p1Locked) {
            if (roundTimerRef.current !== null) {
              window.clearInterval(roundTimerRef.current);
              roundTimerRef.current = null;
            }
            setRoundOutcome({ type: 'both_wrong' });
            advanceTimerRef.current = window.setTimeout(() => {
              goToNextQuestion(p1Score, p2Score);
            }, 1500);
          }
        }
      }
    },
    [
      screen,
      roundOutcome,
      currentQuestion,
      p1Locked,
      p2Locked,
      p1HiddenOpts,
      p2HiddenOpts,
      p1Score,
      p2Score,
      p1Streak,
      p2Streak,
      addMistake,
      goToNextQuestion,
    ]
  );

  const handleUseHint = (player: 1 | 2) => {
    if (screen !== 'PLAYING' || roundOutcome !== null || !currentQuestion) return;
    if (player === 1 && (p1HintUsed || p1Locked)) return;
    if (player === 2 && (p2HintUsed || p2Locked)) return;

    soundEngine.unlock();
    soundEngine.playHint();

    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQuestion.answer);
    const toHide = shuffleArray(wrongIndices).slice(0, 2);

    if (player === 1) {
      setP1HintUsed(true);
      setP1HiddenOpts(toHide);
    } else {
      setP2HintUsed(true);
      setP2HiddenOpts(toHide);
    }
  };

  // Keyboard Controls (A,S,D,F for P1; J,K,L,; for P2)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'PLAYING' || roundOutcome !== null) return;
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyA' || key === 'a') handleAnswer(1, 0);
      else if (code === 'KeyS' || key === 's') handleAnswer(1, 1);
      else if (code === 'KeyD' || key === 'd') handleAnswer(1, 2);
      else if (code === 'KeyF' || key === 'f') handleAnswer(1, 3);
      else if (code === 'KeyJ' || key === 'j') handleAnswer(2, 0);
      else if (code === 'KeyK' || key === 'k') handleAnswer(2, 1);
      else if (code === 'KeyL' || key === 'l') handleAnswer(2, 2);
      else if (code === 'Semicolon' || key === ';') handleAnswer(2, 3);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, roundOutcome, handleAnswer]);

  const returnToMenu = () => {
    clearAllTimers();
    setCountdownStep(null);
    setScreen('MENU');
    soundEngine.playClick();
  };

  // Circular Timer SVG math
  const timerRadius = 22;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerOffset = timerCircumference * (1 - timeLeft / 20);

  // Confetti colors for winner screen
  const confettiItems = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: `${(i * 3.7) % 100}%`,
        delay: `${(i * 0.19) % 2.4}s`,
        duration: `${2.8 + (i % 4) * 0.55}s`,
        color: ['#7CC6FE', '#FFA8C5', '#FFE08A', '#8FE3B0', '#CDB8FF'][i % 5],
        size: 8 + (i % 4) * 3,
      })),
    []
  );

  // Winner determination
  const isDraw = p1Score === p2Score;
  const winnerName = p1Score > p2Score ? p1Name : p2Name;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden">
      {/* MAIN MENU SCREEN */}
      {screen === 'MENU' && (
        <main className="w-full max-w-3xl pastel-card p-6 sm:p-10 text-center relative z-10">
          {/* Pastel Logo Emblem */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#7CC6FE] via-[#FFE08A] to-[#FFA8C5] p-1.5 shadow-md mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl leading-none">🏁</span>
              <span className="font-display text-xs font-extrabold text-[#4AA8F0] tracking-wide mt-0.5">
                sin · cos
              </span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#3B4A6B] tracking-tight leading-tight">
            TRIGONOMETRIYA PEGASI
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#6E7E9F] mt-1 mb-6">
            Kim birinchi marraga?
          </p>

          {/* Player Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-left">
            <div className="rounded-2xl bg-[#E8F6FF] p-3.5 border-2 border-[#7CC6FE]/60">
              <label className="block text-xs font-extrabold text-[#4AA8F0] mb-1">
                1-OʻYINCHI ISMI (CHAP · A S D F)
              </label>
              <input
                type="text"
                maxLength={16}
                value={p1NameInput}
                onChange={(e) => setP1NameInput(e.target.value)}
                placeholder="1-O'YINCHI"
                className="w-full bg-white rounded-xl px-3.5 py-2 text-base font-extrabold text-[#3B4A6B] outline-none focus:ring-2 focus:ring-[#7CC6FE]"
              />
            </div>

            <div className="rounded-2xl bg-[#FFF0F6] p-3.5 border-2 border-[#FFA8C5]/60">
              <label className="block text-xs font-extrabold text-[#FF7FA8] mb-1">
                2-OʻYINCHI ISMI (OʻNG · J K L ;)
              </label>
              <input
                type="text"
                maxLength={16}
                value={p2NameInput}
                onChange={(e) => setP2NameInput(e.target.value)}
                placeholder="2-O'YINCHI"
                className="w-full bg-white rounded-xl px-3.5 py-2 text-base font-extrabold text-[#3B4A6B] outline-none focus:ring-2 focus:ring-[#FFA8C5]"
              />
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="mb-6">
            <div className="text-sm font-extrabold text-[#3B4A6B] mb-2">
              📋 SAVOLLAR SONI
            </div>
            <div className="inline-flex items-center gap-2 bg-[#F3F7FF] p-1.5 rounded-full">
              {([10, 25, 50] as QuestionCountOption[]).map((count) => {
                const active = questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      soundEngine.unlock();
                      soundEngine.playClick();
                      setQuestionCount(count);
                    }}
                    className={`btn-pop rounded-full px-5 sm:px-7 py-2 font-extrabold text-base cursor-pointer ${
                      active
                        ? 'bg-[#7CC6FE] text-white shadow-sm'
                        : 'text-[#3B4A6B] hover:bg-white'
                    }`}
                  >
                    {count} ta
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Play Button */}
          <button
            type="button"
            onClick={startNewGame}
            className="btn-pop w-full sm:w-auto min-w-[280px] rounded-full py-4 px-10 bg-gradient-to-r from-[#7CC6FE] via-[#9AD4FF] to-[#8FE3B0] text-[#3B4A6B] font-display font-extrabold text-2xl shadow-[0_10px_24px_rgba(124,198,254,0.38)] inline-flex items-center justify-center gap-3 mb-5 cursor-pointer border-2 border-white"
          >
            <Play className="w-7 h-7 fill-current" />
            OʻYINNI BOSHLASH
          </button>

          {/* Secondary Pastel Menu Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playClick();
                setShowFormulas(true);
              }}
              className="btn-pop rounded-full py-3 px-5 bg-[#CDB8FF]/60 hover:bg-[#CDB8FF]/80 text-[#3B4A6B] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              FORMULALAR JADVALI
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playClick();
                setShowRules(true);
              }}
              className="btn-pop rounded-full py-3 px-5 bg-[#FFE08A]/80 hover:bg-[#FFE08A] text-[#3B4A6B] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
              QOIDALAR
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`btn-pop rounded-full py-3 px-5 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer ${
                soundOn ? 'bg-[#BDF2E3] text-[#3B4A6B]' : 'bg-[#F1F5F9] text-[#6E7E9F]'
              }`}
            >
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              {soundOn ? 'OVOZ: YOQILGAN' : "OVOZ: O'CHIRILGAN"}
            </button>

            <button
              type="button"
              onClick={toggleMusic}
              className={`btn-pop rounded-full py-3 px-5 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer ${
                musicOn ? 'bg-[#FFA8C5]/50 text-[#3B4A6B]' : 'bg-[#F1F5F9] text-[#6E7E9F]'
              }`}
            >
              <Music className="w-5 h-5" />
              {musicOn ? 'MUSIQA: YOQILGAN' : "MUSIQA: O'CHIRILGAN"}
            </button>
          </div>

          {/* Saved Records Summary */}
          {records.gamesPlayed > 0 && (
            <div className="mt-2 pt-4 border-t border-[#EEF4FF] flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm font-bold text-[#6E7E9F] tabular-nums">
              <span>🏆 Oʻyinlar: {records.gamesPlayed}</span>
              <span>⭐ Eng yuqori ochko: {records.bestScore}</span>
              {records.lastWinner && <span>🎉 Oxirgi gʻolib: {records.lastWinner}</span>}
            </div>
          )}
        </main>
      )}

      {/* ACTIVE GAMEPLAY SCREEN */}
      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'COUNTDOWN') && (
        <div className="w-full max-w-6xl flex flex-col gap-3 sm:gap-4 z-10">
          {/* TOP HUD BAR */}
          <header className="grid grid-cols-3 items-center gap-2 sm:gap-4">
            {/* Player 1 Score Card */}
            <div className="pastel-card px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-2 border-[#7CC6FE]/60">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#4AA8F0] truncate">{p1Name}</div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#3B4A6B] tabular-nums leading-none mt-0.5">
                  {p1Score}
                </div>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#E8F6FF] flex items-center justify-center text-lg sm:text-xl shrink-0">
                🧢
              </div>
            </div>

            {/* Center Timer, Progress & Controls */}
            <div className="pastel-card px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4">
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-extrabold text-[#6E7E9F]">SAVOL</div>
                <div className="font-display text-base sm:text-xl font-extrabold text-[#3B4A6B] tabular-nums leading-tight">
                  {Math.min(currentIdx + 1, deck.length)}/{deck.length}
                </div>
              </div>

              {/* Circular 20s Timer */}
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 ${
                  timeLeft <= 5 && roundOutcome === null ? 'animate-soft-pulse' : ''
                }`}
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r={timerRadius}
                    fill="none"
                    stroke="#EEF4FF"
                    strokeWidth="5"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={timerRadius}
                    fill="none"
                    stroke={timeLeft <= 5 ? '#FF9E9E' : '#7CC6FE'}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={timerCircumference}
                    strokeDashoffset={timerOffset}
                    className="transition-[stroke-dashoffset] duration-700 linear"
                  />
                </svg>
                <span
                  className={`absolute font-display font-extrabold text-base sm:text-lg tabular-nums ${
                    timeLeft <= 5 ? 'text-[#E11D48]' : 'text-[#3B4A6B]'
                  }`}
                >
                  {timeLeft}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setScreen('PAUSED');
                  }}
                  className="btn-pop w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFE08A] text-[#3B4A6B] flex items-center justify-center cursor-pointer"
                  aria-label="Pauza"
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`btn-pop w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer ${
                    soundOn ? 'bg-[#BDF2E3] text-[#3B4A6B]' : 'bg-[#F1F5F9] text-[#6E7E9F]'
                  }`}
                  aria-label="Ovozni yoqish yoki o'chirish"
                >
                  {soundOn ? (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Player 2 Score Card */}
            <div className="pastel-card px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-2 border-[#FFA8C5]/60">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FFF0F6] flex items-center justify-center text-lg sm:text-xl shrink-0">
                🎀
              </div>
              <div className="min-w-0 text-right">
                <div className="text-xs font-extrabold text-[#FF7FA8] truncate">{p2Name}</div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#3B4A6B] tabular-nums leading-none mt-0.5">
                  {p2Score}
                </div>
              </div>
            </div>
          </header>

          {/* RACE TRACK & SCENERY */}
          <RaceTrack
            p1Name={p1Name}
            p2Name={p2Name}
            p1Pos={p1Score}
            p2Pos={p2Score}
            p1Mood={p1Mood}
            p2Mood={p2Mood}
            p1Streak={p1Streak}
            p2Streak={p2Streak}
          />

          {/* CENTRAL QUESTION CARD */}
          {currentQuestion && (
            <section className="pastel-card px-5 py-5 sm:px-10 sm:py-7 text-center relative overflow-hidden">
              {/* Round Feedback Pill Banner */}
              {roundOutcome && (
                <div
                  className={`mb-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full font-display font-extrabold text-lg sm:text-xl ${
                    roundOutcome.type === 'correct'
                      ? 'bg-[#8FE3B0] text-[#1E4D33]'
                      : 'bg-[#FF9E9E] text-[#6B1D1D]'
                  }`}
                >
                  {roundOutcome.type === 'correct' ? (
                    <>
                      TOʻGʻRI! ✅ ({roundOutcome.winner === 1 ? p1Name : p2Name})
                    </>
                  ) : roundOutcome.type === 'timeout' ? (
                    <>⏱️ Vaqt tugadi! Toʻgʻri javob: {currentQuestion.options[currentQuestion.answer]}</>
                  ) : (
                    <>❌ Ikkalasi ham xato! Toʻgʻri javob: {currentQuestion.options[currentQuestion.answer]}</>
                  )}
                </div>
              )}

              <h2 className="font-display font-extrabold text-[32px] sm:text-[48px] leading-tight text-[#3B4A6B] tracking-tight">
                <MathText text={currentQuestion.q} />
              </h2>
            </section>
          )}

          {/* TWO-PLAYER ANSWER DECKS (BOTTOM LEFT & RIGHT) */}
          {currentQuestion && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* PLAYER 1 DECK */}
              <div
                className={`pastel-card p-3.5 sm:p-4 border-2 border-[#7CC6FE]/70 transition-opacity ${
                  p1Locked && roundOutcome === null ? 'opacity-80' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4AA8F0]" />
                    <span className="font-display font-extrabold text-base sm:text-lg text-[#3B4A6B]">
                      {p1Name}
                    </span>
                    {p1Locked && roundOutcome === null && (
                      <span className="text-xs font-extrabold bg-[#FF9E9E] text-[#6B1D1D] px-2.5 py-0.5 rounded-full animate-wrong-shake">
                        ❌ Xato
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={p1HintUsed || p1Locked || roundOutcome !== null}
                    onClick={() => handleUseHint(1)}
                    className={`btn-pop rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer ${
                      p1HintUsed
                        ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                        : 'bg-[#FFE08A] text-[#3B4A6B] shadow-sm'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    {p1HintUsed ? 'Ishlatildi' : 'Maslahat (1)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isHidden = p1HiddenOpts.includes(idx);
                    const isWrongChosen = p1WrongIdx === idx;
                    const isCorrectReveal =
                      roundOutcome !== null && idx === currentQuestion.answer;
                    const style = OPTION_STYLES[idx];

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={p1Locked || isHidden || roundOutcome !== null}
                        onClick={() => handleAnswer(1, idx)}
                        className={`btn-pop min-h-[60px] sm:min-h-[68px] rounded-full px-4 py-2.5 border-2 flex items-center justify-between gap-2 font-extrabold text-lg sm:text-xl text-[#3B4A6B] cursor-pointer ${
                          isHidden
                            ? 'opacity-20 pointer-events-none bg-[#F8FAFC] border-slate-200'
                            : isCorrectReveal
                              ? 'bg-[#8FE3B0] border-[#43B577] scale-[1.02]'
                              : isWrongChosen
                                ? 'bg-[#FF9E9E] border-[#E06666] animate-wrong-shake'
                                : style.bg
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${style.badge}`}
                        >
                          {OPTION_LABELS[idx]}
                        </span>
                        <span className="flex-1 text-center truncate">
                          <MathText text={opt} />
                        </span>
                        <span className="hidden lg:inline-block text-[11px] font-extrabold text-[#6E7E9F] bg-white/75 px-1.5 py-0.5 rounded-md">
                          {P1_KEYS[idx]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PLAYER 2 DECK */}
              <div
                className={`pastel-card p-3.5 sm:p-4 border-2 border-[#FFA8C5]/70 transition-opacity ${
                  p2Locked && roundOutcome === null ? 'opacity-80' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF7FA8]" />
                    <span className="font-display font-extrabold text-base sm:text-lg text-[#3B4A6B]">
                      {p2Name}
                    </span>
                    {p2Locked && roundOutcome === null && (
                      <span className="text-xs font-extrabold bg-[#FF9E9E] text-[#6B1D1D] px-2.5 py-0.5 rounded-full animate-wrong-shake">
                        ❌ Xato
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={p2HintUsed || p2Locked || roundOutcome !== null}
                    onClick={() => handleUseHint(2)}
                    className={`btn-pop rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer ${
                      p2HintUsed
                        ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                        : 'bg-[#FFE08A] text-[#3B4A6B] shadow-sm'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    {p2HintUsed ? 'Ishlatildi' : 'Maslahat (1)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isHidden = p2HiddenOpts.includes(idx);
                    const isWrongChosen = p2WrongIdx === idx;
                    const isCorrectReveal =
                      roundOutcome !== null && idx === currentQuestion.answer;
                    const style = OPTION_STYLES[idx];

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={p2Locked || isHidden || roundOutcome !== null}
                        onClick={() => handleAnswer(2, idx)}
                        className={`btn-pop min-h-[60px] sm:min-h-[68px] rounded-full px-4 py-2.5 border-2 flex items-center justify-between gap-2 font-extrabold text-lg sm:text-xl text-[#3B4A6B] cursor-pointer ${
                          isHidden
                            ? 'opacity-20 pointer-events-none bg-[#F8FAFC] border-slate-200'
                            : isCorrectReveal
                              ? 'bg-[#8FE3B0] border-[#43B577] scale-[1.02]'
                              : isWrongChosen
                                ? 'bg-[#FF9E9E] border-[#E06666] animate-wrong-shake'
                                : style.bg
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${style.badge}`}
                        >
                          {OPTION_LABELS[idx]}
                        </span>
                        <span className="flex-1 text-center truncate">
                          <MathText text={opt} />
                        </span>
                        <span className="hidden lg:inline-block text-[11px] font-extrabold text-[#6E7E9F] bg-white/75 px-1.5 py-0.5 rounded-md">
                          {P2_KEYS[idx]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* WINNER / FINISHED SCREEN */}
      {screen === 'FINISHED' && (
        <>
          {/* Pastel Confetti */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
            {confettiItems.map((c) => (
              <div
                key={c.id}
                className="confetti-piece absolute -top-6 rounded-sm"
                style={{
                  left: c.left,
                  width: `${c.size}px`,
                  height: `${c.size * 1.4}px`,
                  backgroundColor: c.color,
                  animationDelay: c.delay,
                  animationDuration: c.duration,
                }}
              />
            ))}
          </div>

          <main className="w-full max-w-3xl pastel-card p-6 sm:p-10 text-center relative z-30">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFE08A] text-4xl shadow-md mb-3">
              {isDraw ? '🤝' : <Trophy className="w-10 h-10 text-[#3B4A6B]" />}
            </div>

            {isDraw ? (
              <>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#3B4A6B]">
                  🤝 DURANG!
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#6E7E9F] mt-1 mb-6">
                  Ikkala oʻyinchi ham ajoyib natija koʻrsatdi!
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#3B4A6B]">
                  🏆 GʻOLIB! {winnerName}
                </h1>
                <p className="text-lg font-bold text-[#6E7E9F] mt-1 mb-6">
                  Tabriklaymiz! Marraga birinchi boʻlib yetib keldingiz! 🌟
                </p>
              </>
            )}

            {/* Player Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
              <div className="rounded-2xl bg-[#E8F6FF] p-4 border-2 border-[#7CC6FE]">
                <div className="font-display text-xl font-extrabold text-[#3B4A6B] mb-2">
                  🧢 {p1Name}
                </div>
                <div className="flex items-center gap-4 text-base font-extrabold tabular-nums">
                  <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                    <CheckCircle2 className="w-5 h-5" /> Toʻgʻri: {p1Score}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#B91C1C]">
                    <XCircle className="w-5 h-5" /> Xato: {p1Wrong}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FFF0F6] p-4 border-2 border-[#FFA8C5]">
                <div className="font-display text-xl font-extrabold text-[#3B4A6B] mb-2">
                  🎀 {p2Name}
                </div>
                <div className="flex items-center gap-4 text-base font-extrabold tabular-nums">
                  <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                    <CheckCircle2 className="w-5 h-5" /> Toʻgʻri: {p2Score}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#B91C1C]">
                    <XCircle className="w-5 h-5" /> Xato: {p2Wrong}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={startNewGame}
                className="btn-pop w-full sm:w-auto rounded-full py-3.5 px-8 bg-[#8FE3B0] text-[#3B4A6B] font-extrabold text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                QAYTA OʻYNASH
              </button>
              <button
                type="button"
                onClick={returnToMenu}
                className="btn-pop w-full sm:w-auto rounded-full py-3.5 px-8 bg-[#FFE08A] text-[#3B4A6B] font-extrabold text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Home className="w-5 h-5" />
                BOSH MENYU
              </button>
            </div>

            {/* Mistake Analysis Section */}
            <div className="text-left border-t-2 border-[#EEF4FF] pt-5">
              <h2 className="font-display text-xl font-extrabold text-[#3B4A6B] mb-3">
                📝 Xato qilingan savollar tahlili ({mistakes.length})
              </h2>
              {mistakes.length === 0 ? (
                <div className="rounded-2xl bg-[#E6FAF4] p-4 text-center font-bold text-[#15803D]">
                  Ajoyib! Birorta ham xatoga yoʻl qoʻyilmadi! 🌟
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {mistakes.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl bg-[#F8FBFF] border border-[#E2ECFF] p-3.5 flex flex-col gap-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display font-extrabold text-base text-[#3B4A6B]">
                          <MathText text={m.q} />
                        </span>
                        <span className="rounded-full bg-[#8FE3B0] text-[#1E4D33] px-3 py-0.5 text-sm font-extrabold">
                          Javob: <MathText text={m.correctAnswer} />
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#6E7E9F]">
                        💡 {m.hint}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* Modals & Overlays */}
      <FormulasModal open={showFormulas} onClose={() => setShowFormulas(false)} />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
      <PauseOverlay
        open={screen === 'PAUSED'}
        onResume={() => {
          soundEngine.playClick();
          setScreen('PLAYING');
        }}
        onMenu={returnToMenu}
      />
      <CountdownOverlay step={countdownStep} />
    </div>
  );
}
