import { useEffect, useRef, type FC } from 'react';
import type { BadgeTier } from '../types';
import { BADGE_EMOJI, BADGE_ACCENT, BADGE_GRADIENT } from '../constants/badges';
import { CONFETTI_COLORS } from '../constants/colors';

interface Particle {
    id:       number;
    left:     number;
    color:    string;
    size:     number;
    duration: number;
    delay:    number;
    isCircle: boolean;
    rotate:   number;
}

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
        id:       i,
        left:     rand(0, 100),
        color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size:     rand(7, 13),
        duration: rand(2.2, 4.0),
        delay:    rand(0, 1.4),
        isCircle: Math.random() > 0.45,
        rotate:   rand(0, 360),
    }));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    badge:   BadgeTier;
    onClose: () => void;
}

const BadgeUnlockModal: FC<Props> = ({ badge, onClose }) => {
    const particles = useRef<Particle[]>(generateParticles(72));

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const color    = BADGE_ACCENT[badge];
    const gradient = BADGE_GRADIENT[badge];
    const emoji    = BADGE_EMOJI[badge];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`${badge} badge unlocked`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Confetti layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {particles.current.map((p) => (
                    <span
                        key={p.id}
                        className="absolute top-0 animate-confetti-fall"
                        style={{
                            left:            `${p.left}%`,
                            width:           p.size,
                            height:          p.isCircle ? p.size : p.size * 0.55,
                            borderRadius:    p.isCircle ? '50%' : '2px',
                            backgroundColor: p.color,
                            animationDuration: `${p.duration}s`,
                            animationDelay:    `${p.delay}s`,
                            transform:       `rotate(${p.rotate}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* Modal card */}
            <div className="relative z-10 bg-white rounded-[24px] px-10 py-10 flex flex-col items-center gap-5 shadow-2xl w-[min(460px,90vw)] animate-modal-in text-center">

                {/* Badge circle */}
                <div
                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: gradient }}
                >
                    <span className="text-5xl leading-none select-none">{emoji}</span>
                </div>

                {/* Copy */}
                <div className="flex flex-col gap-2">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        New Badge Unlocked 🎉
                    </p>
                    <h2
                        className="m-0 text-4xl font-black tracking-tight leading-none"
                        style={{ color }}
                    >
                        {badge}
                    </h2>
                    <p className="m-0 text-[14px] text-gray-500 leading-relaxed">
                        You've reached{' '}
                        <strong className="text-gray-800 font-semibold">{badge} tier</strong>
                        {' '}— a ₦300 cashback is on its way. Keep shopping to climb higher!
                    </p>
                </div>

                {/* CTA */}
                <button
                    className="mt-1 px-8 py-3 rounded-xl text-white text-[15px] font-bold shadow-md cursor-pointer border-0 w-full"
                    style={{ background: gradient }}
                    onClick={onClose}
                    type="button"
                    autoFocus
                >
                    Awesome, let's go! 🚀
                </button>
            </div>
        </div>
    );
};

export default BadgeUnlockModal;
