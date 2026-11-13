import React from 'react';

export type CharacterMood = 'idle' | 'run' | 'happy' | 'sad' | 'dance';

interface RaceTrackProps {
  p1Name: string;
  p2Name: string;
  p1Pos: number; // 0 to 10
  p2Pos: number; // 0 to 10
  p1Mood: CharacterMood;
  p2Mood: CharacterMood;
  p1Streak: number;
  p2Streak: number;
}

const BoyCharacter: React.FC<{ mood: CharacterMood }> = ({ mood }) => {
  const animClass =
    mood === 'run'
      ? 'char-run'
      : mood === 'happy'
        ? 'char-happy'
        : mood === 'sad'
          ? 'char-sad'
          : mood === 'dance'
            ? 'char-dance'
            : 'char-idle';

  return (
    <div className={`relative w-14 h-16 sm:w-16 sm:h-20 ${animClass}`}>
      {mood === 'happy' && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 text-sm pointer-events-none">
          <span className="animate-bounce">⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>✨</span>
        </div>
      )}
      <svg viewBox="0 0 80 96" className="w-full h-full drop-shadow-sm" aria-label="1-o'yinchi qahramoni">
        {/* Shadow */}
        <ellipse cx="40" cy="90" rx="20" ry="4" fill="rgba(59,74,107,0.16)" />
        {/* Backpack */}
        <rect x="14" y="46" width="14" height="24" rx="6" fill="#4AA8F0" />
        {/* Legs */}
        <rect x="29" y="70" width="9" height="16" rx="4.5" fill="#4C648F" />
        <rect x="43" y="70" width="9" height="16" rx="4.5" fill="#4C648F" />
        {/* Shoes */}
        <rect x="27" y="82" width="13" height="7" rx="3.5" fill="#FFFFFF" stroke="#4AA8F0" strokeWidth="2" />
        <rect x="42" y="82" width="14" height="7" rx="3.5" fill="#FFFFFF" stroke="#4AA8F0" strokeWidth="2" />
        {/* Torso / Blue Hoodie */}
        <rect x="24" y="42" width="32" height="32" rx="12" fill="#7CC6FE" stroke="#4AA8F0" strokeWidth="2" />
        {/* Star emblem on shirt */}
        <circle cx="42" cy="57" r="6" fill="#FFE08A" />
        {/* Left & Right Arms */}
        <rect
          x="17"
          y={mood === 'happy' || mood === 'dance' ? 32 : 45}
          width="9"
          height="20"
          rx="4.5"
          fill="#7CC6FE"
          stroke="#4AA8F0"
          strokeWidth="1.5"
          transform={mood === 'happy' || mood === 'dance' ? 'rotate(-28 21 42)' : 'rotate(10 21 45)'}
        />
        <rect
          x="54"
          y={mood === 'happy' || mood === 'dance' ? 30 : 45}
          width="9"
          height="20"
          rx="4.5"
          fill="#7CC6FE"
          stroke="#4AA8F0"
          strokeWidth="1.5"
          transform={mood === 'happy' || mood === 'dance' ? 'rotate(28 58 42)' : 'rotate(-14 58 45)'}
        />
        {/* Head */}
        <circle cx="40" cy="26" r="19" fill="#FFE3CC" stroke="#F0C2A2" strokeWidth="1.5" />
        {/* Hair & Cap */}
        <path d="M21 23 C21 10, 59 10, 59 23 Z" fill="#4AA8F0" />
        <path d="M36 17 L63 21 C64 23, 58 25, 38 22 Z" fill="#3B8CD4" />
        {/* Big Cartoon Eyes */}
        <circle cx="35" cy="27" r="3.4" fill="#3B4A6B" />
        <circle cx="48" cy="27" r="3.4" fill="#3B4A6B" />
        <circle cx="36.2" cy="25.8" r="1.2" fill="#FFFFFF" />
        <circle cx="49.2" cy="25.8" r="1.2" fill="#FFFFFF" />
        {/* Cheeks */}
        <ellipse cx="29" cy="31" rx="3.2" ry="1.8" fill="#FFA8C5" opacity="0.6" />
        <ellipse cx="53" cy="31" rx="3.2" ry="1.8" fill="#FFA8C5" opacity="0.6" />
        {/* Mouth & Expression */}
        {mood === 'sad' ? (
          <>
            <path d="M31 22 L37 24" stroke="#3B4A6B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M51 22 L45 24" stroke="#3B4A6B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M35 37 Q41 32 47 37" fill="none" stroke="#3B4A6B" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <path
            d={mood === 'happy' || mood === 'dance' ? 'M34 33 Q41 41 48 33 Z' : 'M35 34 Q41 39 47 34'}
            fill={mood === 'happy' || mood === 'dance' ? '#FF7FA8' : 'none'}
            stroke="#3B4A6B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

const GirlCharacter: React.FC<{ mood: CharacterMood }> = ({ mood }) => {
  const animClass =
    mood === 'run'
      ? 'char-run'
      : mood === 'happy'
        ? 'char-happy'
        : mood === 'sad'
          ? 'char-sad'
          : mood === 'dance'
            ? 'char-dance'
            : 'char-idle';

  return (
    <div className={`relative w-14 h-16 sm:w-16 sm:h-20 ${animClass}`}>
      {mood === 'happy' && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 text-sm pointer-events-none">
          <span className="animate-bounce">🌟</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>✨</span>
        </div>
      )}
      <svg viewBox="0 0 80 96" className="w-full h-full drop-shadow-sm" aria-label="2-o'yinchi qahramoni">
        {/* Shadow */}
        <ellipse cx="40" cy="90" rx="20" ry="4" fill="rgba(59,74,107,0.16)" />
        {/* Hair Back */}
        <circle cx="56" cy="28" r="9" fill="#6E4E42" />
        {/* Skirt / Pink Dress */}
        <path d="M26 44 L54 44 L60 72 L20 72 Z" fill="#FFA8C5" stroke="#FF7FA8" strokeWidth="2" strokeLinejoin="round" />
        {/* Heart emblem */}
        <circle cx="38" cy="56" r="5.5" fill="#FFE08A" />
        {/* Legs */}
        <rect x="29" y="71" width="8" height="15" rx="4" fill="#FFE3CC" />
        <rect x="43" y="71" width="8" height="15" rx="4" fill="#FFE3CC" />
        {/* Shoes */}
        <rect x="25" y="82" width="13" height="7" rx="3.5" fill="#FFFFFF" stroke="#FF7FA8" strokeWidth="2" />
        <rect x="42" y="82" width="13" height="7" rx="3.5" fill="#FFFFFF" stroke="#FF7FA8" strokeWidth="2" />
        {/* Arms */}
        <rect
          x="16"
          y={mood === 'happy' || mood === 'dance' ? 31 : 45}
          width="8.5"
          height="19"
          rx="4.2"
          fill="#FFA8C5"
          stroke="#FF7FA8"
          strokeWidth="1.5"
          transform={mood === 'happy' || mood === 'dance' ? 'rotate(-26 20 42)' : 'rotate(14 20 45)'}
        />
        <rect
          x="55"
          y={mood === 'happy' || mood === 'dance' ? 31 : 45}
          width="8.5"
          height="19"
          rx="4.2"
          fill="#FFA8C5"
          stroke="#FF7FA8"
          strokeWidth="1.5"
          transform={mood === 'happy' || mood === 'dance' ? 'rotate(26 59 42)' : 'rotate(-10 59 45)'}
        />
        {/* Head */}
        <circle cx="40" cy="26" r="18.5" fill="#FFE3CC" stroke="#F0C2A2" strokeWidth="1.5" />
        {/* Hair Bangs */}
        <path d="M21 24 C22 9, 58 9, 59 24 C50 18, 30 18, 21 24 Z" fill="#6E4E42" />
        {/* Pink Bow */}
        <circle cx="52" cy="14" r="4.5" fill="#FF7FA8" />
        <circle cx="58" cy="17" r="4" fill="#FFA8C5" />
        {/* Big Eyes facing slightly left toward finish */}
        <circle cx="32" cy="27" r="3.4" fill="#3B4A6B" />
        <circle cx="45" cy="27" r="3.4" fill="#3B4A6B" />
        <circle cx="33" cy="25.8" r="1.2" fill="#FFFFFF" />
        <circle cx="46" cy="25.8" r="1.2" fill="#FFFFFF" />
        {/* Cheeks */}
        <ellipse cx="26" cy="31" rx="3.2" ry="1.8" fill="#FF7FA8" opacity="0.55" />
        <ellipse cx="50" cy="31" rx="3.2" ry="1.8" fill="#FF7FA8" opacity="0.55" />
        {/* Mouth */}
        {mood === 'sad' ? (
          <>
            <path d="M29 22 L35 24" stroke="#3B4A6B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M48 22 L42 24" stroke="#3B4A6B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M33 37 Q39 32 45 37" fill="none" stroke="#3B4A6B" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <path
            d={mood === 'happy' || mood === 'dance' ? 'M32 33 Q39 41 46 33 Z' : 'M33 34 Q39 39 45 34'}
            fill={mood === 'happy' || mood === 'dance' ? '#FF7FA8' : 'none'}
            stroke="#3B4A6B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

export const RaceTrack: React.FC<RaceTrackProps> = ({
  p1Name,
  p2Name,
  p1Pos,
  p2Pos,
  p1Mood,
  p2Mood,
  p1Streak,
  p2Streak,
}) => {
  const clampedP1 = Math.min(10, Math.max(0, p1Pos));
  const clampedP2 = Math.min(10, Math.max(0, p2Pos));

  const buntingColors = ['#7CC6FE', '#FFA8C5', '#FFE08A', '#8FE3B0', '#CDB8FF', '#BDF2E3'];

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-[#DDF3FF] via-[#EFF9FF] to-[#C8F1D5] shadow-[0_8px_24px_rgba(120,150,200,0.18)] border-2 border-white">
      {/* Sunny Sky Scenery Layer */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden">
        {/* Sun */}
        <div className="absolute top-2 left-4 sm:left-8 w-14 h-14 sm:w-16 sm:h-16 pointer-events-none">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <g className="animate-sun-spin">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="40"
                  y1="6"
                  x2="40"
                  y2="14"
                  stroke="#FFE08A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 40 40)`}
                />
              ))}
            </g>
            <circle cx="40" cy="40" r="20" fill="#FFE08A" />
            <circle cx="34" cy="37" r="2" fill="#3B4A6B" />
            <circle cx="46" cy="37" r="2" fill="#3B4A6B" />
            <path d="M35 44 Q40 48 45 44" fill="none" stroke="#3B4A6B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Floating Clouds */}
        <div className="absolute top-3 left-[22%] w-20 sm:w-24 opacity-90 animate-cloud-slow pointer-events-none">
          <svg viewBox="0 0 120 55">
            <path d="M25 45 H95 C106 45 112 37 110 28 C108 20 99 16 90 19 C85 8 68 4 56 12 C47 6 31 11 28 22 C17 22 10 31 13 39 C15 43 20 45 25 45 Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="absolute top-5 right-[18%] w-24 sm:w-28 opacity-85 animate-cloud-reverse pointer-events-none">
          <svg viewBox="0 0 120 55">
            <path d="M25 45 H95 C106 45 112 37 110 28 C108 20 99 16 90 19 C85 8 68 4 56 12 C47 6 31 11 28 22 C17 22 10 31 13 39 C15 43 20 45 25 45 Z" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Distant School Building & Trees */}
        <svg
          viewBox="0 0 800 120"
          preserveAspectRatio="xMidYMax slice"
          className="absolute bottom-0 inset-x-0 w-full h-24 pointer-events-none"
        >
          {/* Rolling soft pastel hills */}
          <path d="M0 120 Q160 72 360 100 T800 92 L800 120 Z" fill="#BCECC9" />
          <path d="M0 120 Q240 85 520 105 T800 98 L800 120 Z" fill="#A6E4B9" />

          {/* School Building (center-left background) */}
          <g transform="translate(335, 36)">
            {/* Main body */}
            <rect x="10" y="26" width="110" height="52" rx="4" fill="#FFF7E2" stroke="#E8D8B2" strokeWidth="2" />
            {/* Roof */}
            <polygon points="4,28 65,4 126,28" fill="#FFA8C5" stroke="#FF7FA8" strokeWidth="2" strokeLinejoin="round" />
            {/* Clock */}
            <circle cx="65" cy="18" r="6" fill="#FFFFFF" stroke="#3B4A6B" strokeWidth="1.5" />
            <line x1="65" y1="18" x2="65" y2="14.5" stroke="#3B4A6B" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="65" y1="18" x2="68" y2="18" stroke="#3B4A6B" strokeWidth="1.4" strokeLinecap="round" />
            {/* Door & Windows */}
            <rect x="57" y="54" width="16" height="24" rx="3" fill="#7CC6FE" />
            <rect x="22" y="38" width="14" height="14" rx="3" fill="#BDF2E3" stroke="#8FE3B0" strokeWidth="1.5" />
            <rect x="39" y="38" width="14" height="14" rx="3" fill="#BDF2E3" stroke="#8FE3B0" strokeWidth="1.5" />
            <rect x="77" y="38" width="14" height="14" rx="3" fill="#BDF2E3" stroke="#8FE3B0" strokeWidth="1.5" />
            <rect x="94" y="38" width="14" height="14" rx="3" fill="#BDF2E3" stroke="#8FE3B0" strokeWidth="1.5" />
            {/* School Flag */}
            <line x1="65" y1="4" x2="65" y2="-10" stroke="#3B4A6B" strokeWidth="1.8" />
            <polygon points="65,-10 79,-6 65,-2" fill="#FFE08A" />
          </g>

          {/* Cute Trees */}
          <g transform="translate(275, 58)">
            <rect x="11" y="28" width="6" height="24" rx="3" fill="#C9A27E" />
            <circle cx="14" cy="20" r="15" fill="#8FE3B0" />
          </g>
          <g transform="translate(490, 58)">
            <rect x="11" y="28" width="6" height="24" rx="3" fill="#C9A27E" />
            <circle cx="14" cy="20" r="15" fill="#8FE3B0" />
          </g>
          <g transform="translate(95, 62)">
            <rect x="10" y="26" width="6" height="22" rx="3" fill="#C9A27E" />
            <circle cx="13" cy="18" r="13" fill="#9EE8BC" />
          </g>
          <g transform="translate(680, 62)">
            <rect x="10" y="26" width="6" height="22" rx="3" fill="#C9A27E" />
            <circle cx="13" cy="18" r="13" fill="#9EE8BC" />
          </g>
        </svg>

        {/* Colorful Bunting Flags */}
        <div className="absolute top-0 inset-x-0 flex justify-around px-4 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 sm:w-5 sm:h-5 animate-flag"
              style={{
                animationDelay: `${i * 120}ms`,
                backgroundColor: buntingColors[i % buntingColors.length],
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Dual Converging Race Lanes & Center Finish Arch */}
      <div className="relative bg-[#B9ECC7] px-3 sm:px-6 pb-4 pt-3 border-t-2 border-white/70">
        {/* Player Lane Labels + Streak Indicators */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#4AA8F0]" />
            <span className="font-display font-bold text-sm sm:text-base text-[#3B4A6B] truncate max-w-[130px] sm:max-w-[200px]">
              {p1Name} ({clampedP1}/10)
            </span>
            {p1Streak >= 3 && (
              <span className="text-xs font-extrabold text-[#D97706] bg-[#FFE08A] px-2 py-0.5 rounded-full animate-bounce">
                🔥 SERIYA!
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold text-[#3B4A6B] bg-white/85 px-3 py-1 rounded-full shadow-sm">
            <span>🏁 MARRA</span>
          </div>

          <div className="flex items-center gap-2">
            {p2Streak >= 3 && (
              <span className="text-xs font-extrabold text-[#D97706] bg-[#FFE08A] px-2 py-0.5 rounded-full animate-bounce">
                🔥 SERIYA!
              </span>
            )}
            <span className="font-display font-bold text-sm sm:text-base text-[#3B4A6B] truncate max-w-[130px] sm:max-w-[200px]">
              {p2Name} ({clampedP2}/10)
            </span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#FF7FA8]" />
          </div>
        </div>

        {/* Track Surface */}
        <div className="relative flex items-center gap-1 sm:gap-2 rounded-2xl bg-white/80 p-2 sm:p-3 shadow-inner">
          {/* Player 1 Track (Left -> Center, 10 steps) */}
          <div className="relative flex-1 grid grid-cols-10 gap-1 sm:gap-1.5 h-16 sm:h-20 items-end">
            {Array.from({ length: 10 }).map((_, idx) => {
              const step = idx + 1;
              const passed = clampedP1 >= step;
              return (
                <div
                  key={step}
                  className={`h-7 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-extrabold transition-colors duration-300 border ${
                    passed
                      ? 'bg-[#7CC6FE] text-white border-[#4AA8F0]'
                      : 'bg-[#EEF7FF] text-[#6E7E9F] border-[#D5EAFF]'
                  }`}
                >
                  {step}
                </div>
              );
            })}
            {/* Boy Character Positioned on P1 Track */}
            <div
              className="absolute bottom-4 sm:bottom-5 z-10 pointer-events-none transition-all duration-500 ease-out"
              style={{
                left: `calc(${(clampedP1 / 10) * 92}% - 8px)`,
              }}
            >
              <BoyCharacter mood={p1Mood} />
            </div>
          </div>

          {/* Center Checkered Finish Line 🏁 */}
          <div className="relative flex flex-col items-center justify-center shrink-0 w-10 sm:w-14 h-16 sm:h-20 rounded-xl bg-white border-2 border-[#FFE08A] shadow-sm overflow-hidden">
            <div
              className="w-full h-full opacity-90"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #3B4A6B 25%, transparent 25%), linear-gradient(-45deg, #3B4A6B 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3B4A6B 75%), linear-gradient(-45deg, transparent 75%, #3B4A6B 75%)',
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)]">
              🏁
            </span>
          </div>

          {/* Player 2 Track (Right -> Center, 10 steps) */}
          <div className="relative flex-1 grid grid-cols-10 gap-1 sm:gap-1.5 h-16 sm:h-20 items-end">
            {Array.from({ length: 10 }).map((_, idx) => {
              const step = 10 - idx; // 10 nearest center, 1 at far right
              const passed = clampedP2 >= step;
              return (
                <div
                  key={step}
                  className={`h-7 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-extrabold transition-colors duration-300 border ${
                    passed
                      ? 'bg-[#FFA8C5] text-white border-[#FF7FA8]'
                      : 'bg-[#FFF0F6] text-[#6E7E9F] border-[#FFD6E5]'
                  }`}
                >
                  {step}
                </div>
              );
            })}
            {/* Girl Character Positioned on P2 Track */}
            <div
              className="absolute bottom-4 sm:bottom-5 z-10 pointer-events-none transition-all duration-500 ease-out"
              style={{
                right: `calc(${(clampedP2 / 10) * 92}% - 8px)`,
              }}
            >
              <GirlCharacter mood={p2Mood} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
