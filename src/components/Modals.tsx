import React from 'react';
import { X, BookOpen, HelpCircle, Play, Home } from 'lucide-react';
import { TRIG_TABLE, TRIG_IDENTITIES } from '../data/questions';
import { MathText } from './MathText';

interface FormulasModalProps {
  open: boolean;
  onClose: () => void;
}

export const FormulasModal: React.FC<FormulasModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B4A6B]/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="pastel-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#CDB8FF]/50 flex items-center justify-center text-[#3B4A6B]">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3B4A6B]">
                Formulalar jadvali
              </h2>
              <p className="text-sm text-[#6E7E9F] font-semibold">
                Asosiy trigonometrik qiymatlar va ayniyatlar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-pop w-11 h-11 rounded-full bg-[#FFE08A] text-[#3B4A6B] flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trigonometric Values Table */}
        <div className="overflow-x-auto rounded-2xl border-2 border-[#E8F6FF] mb-6">
          <table className="w-full text-center border-collapse tabular-nums">
            <thead>
              <tr className="bg-gradient-to-r from-[#E8F6FF] via-[#FFF4FB] to-[#BDF2E3]/50 text-[#3B4A6B] font-extrabold text-sm sm:text-base">
                <th className="py-3 px-3">Gradus</th>
                <th className="py-3 px-3">Radian</th>
                <th className="py-3 px-3 text-[#4AA8F0]">sin α</th>
                <th className="py-3 px-3 text-[#FF7FA8]">cos α</th>
                <th className="py-3 px-3 text-[#059669]">tg α</th>
                <th className="py-3 px-3 text-[#7C3AED]">ctg α</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF4FF] text-sm sm:text-base font-bold text-[#3B4A6B]">
              {TRIG_TABLE.map((row, idx) => (
                <tr key={row.deg} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FBFF]'}>
                  <td className="py-2.5 px-3 font-extrabold">{row.deg}</td>
                  <td className="py-2.5 px-3">
                    <MathText text={row.rad} />
                  </td>
                  <td className="py-2.5 px-3 bg-[#7CC6FE]/10">
                    <MathText text={row.sin} />
                  </td>
                  <td className="py-2.5 px-3 bg-[#FFA8C5]/10">
                    <MathText text={row.cos} />
                  </td>
                  <td className="py-2.5 px-3 bg-[#BDF2E3]/20">
                    <MathText text={row.tg} />
                  </td>
                  <td className="py-2.5 px-3 bg-[#CDB8FF]/15">
                    <MathText text={row.ctg} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Core Identities */}
        <h3 className="font-display text-xl font-extrabold text-[#3B4A6B] mb-3">
          Asosiy trigonometrik ayniyatlar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRIG_IDENTITIES.map((item, idx) => {
            const bgList = [
              'bg-[#E8F6FF]',
              'bg-[#FFF0F6]',
              'bg-[#FFF8DF]',
              'bg-[#E6FAF4]',
            ];
            return (
              <div
                key={item.formula}
                className={`${bgList[idx % bgList.length]} rounded-2xl p-3.5 flex flex-col gap-1`}
              >
                <span className="font-display text-lg font-extrabold text-[#3B4A6B]">
                  {item.formula}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#6E7E9F]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  const rules = [
    {
      title: '1. Kim birinchi marraga?',
      desc: "Har bir o'yinchi o'z yo'lakchasida turadi. Yo'lakda 10 ta katak bor. Kim birinchi 10 ta to'g'ri javob topsa, darhol g'olib bo'ladi!",
      bg: 'bg-[#E8F6FF]',
    },
    {
      title: '2. Tezkor javob va xatolar',
      desc: "Har bir savol uchun 20 soniya vaqt beriladi. Kim birinchi TO'G'RI javobni bossa, 1 qadam oldinga yuradi. Xato qilgan o'yinchi shu savolda qayta bosa olmaydi — raqibda imkoniyat qoladi!",
      bg: 'bg-[#FFF0F6]',
    },
    {
      title: '3. Maslahat va Seriya',
      desc: "Har bir o'yinchiga o'yin davomida 1 marta 💡 Maslahat tugmasi beriladi (2 ta xato variantni olib tashlaydi). Ketma-ket 3 ta to'g'ri javobda 🔥 SERIYA bonusi yonadi!",
      bg: 'bg-[#FFF8DF]',
    },
    {
      title: '4. Klaviatura va Telefon boshqaruvi',
      desc: "Telefonda pastki chap va o'ng tugmalarni bosing. Kompyuterda: 1-o'yinchi uchun A, S, D, F; 2-o'yinchi uchun J, K, L, ; tugmalari ishlaydi.",
      bg: 'bg-[#E6FAF4]',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B4A6B]/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="pastel-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#FFE08A] flex items-center justify-center text-[#3B4A6B]">
              <HelpCircle className="w-6 h-6" />
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3B4A6B]">
              Oʻyin qoidalari
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-pop w-11 h-11 rounded-full bg-[#FFE08A] text-[#3B4A6B] flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.title} className={`${r.bg} rounded-2xl p-4`}>
              <h3 className="font-display text-lg font-extrabold text-[#3B4A6B] mb-1">
                {r.title}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-[#3B4A6B]/85 leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-pop rounded-full px-7 py-3 bg-[#7CC6FE] hover:bg-[#4AA8F0] text-white font-extrabold text-base shadow-md cursor-pointer"
          >
            Tushunarli!
          </button>
        </div>
      </div>
    </div>
  );
};

interface PauseOverlayProps {
  open: boolean;
  onResume: () => void;
  onMenu: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ open, onResume, onMenu }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B4A6B]/30 backdrop-blur-sm">
      <div className="pastel-card w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-3">⏸️</div>
        <h2 className="font-display text-3xl font-extrabold text-[#3B4A6B] mb-2">
          Oʻyin toʻxtatildi
        </h2>
        <p className="text-base font-semibold text-[#6E7E9F] mb-6">
          Biroz dam oling va tayyor boʻlgach davom eting!
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="btn-pop w-full rounded-full py-3.5 px-6 bg-[#8FE3B0] text-[#3B4A6B] font-extrabold text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            DAVOM ETTIRISH
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="btn-pop w-full rounded-full py-3.5 px-6 bg-[#FFE08A] text-[#3B4A6B] font-extrabold text-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Home className="w-5 h-5" />
            BOSH MENYU
          </button>
        </div>
      </div>
    </div>
  );
};

interface CountdownOverlayProps {
  step: number | null; // 3, 2, 1, 0 ("BOSHLADIK!")
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ step }) => {
  if (step === null) return null;

  const label = step === 0 ? 'BOSHLADIK!' : String(step);
  const bg =
    step === 3
      ? 'bg-[#7CC6FE]'
      : step === 2
        ? 'bg-[#FFA8C5]'
        : step === 1
          ? 'bg-[#FFE08A]'
          : 'bg-[#8FE3B0]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E8F6FF]/85 backdrop-blur-md p-4">
      <div
        key={label}
        className={`animate-count-pop ${bg} rounded-[36px] px-12 py-10 shadow-[0_14px_40px_rgba(120,150,200,0.28)] border-4 border-white text-center`}
      >
        <span className="font-display font-black text-6xl sm:text-8xl text-[#3B4A6B] tracking-tight">
          {label}
        </span>
      </div>
    </div>
  );
};
