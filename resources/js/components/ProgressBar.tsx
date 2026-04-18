import { useState, useEffect, type FC } from 'react';
import type { BadgeTier } from '../types';
import { PURCHASE_MILESTONES } from "../constants/badges";

interface ProgressBarProps {
    totalPurchases: number;
    unlockedCount: number; // number of achievements already unlocked
    nextBadge: BadgeTier | null;
    currentBadge: BadgeTier | null;
}

const ProgressBar: FC<ProgressBarProps> = ({
    totalPurchases,
    unlockedCount,
    nextBadge,
    currentBadge,
}) => {
    const isPlatinum = currentBadge === "Platinum";

    const nextMilestone = PURCHASE_MILESTONES[unlockedCount] ?? null;
    const prevMilestone =
        unlockedCount > 0
            ? PURCHASE_MILESTONES[unlockedCount - 1]!.purchases
            : 0;

    const percent = isPlatinum
        ? 100
        : nextMilestone
          ? Math.min(
                ((totalPurchases - prevMilestone) /
                    (nextMilestone.purchases - prevMilestone)) *
                    100,
                100,
            )
          : 100;

    const [width, setWidth] = useState(0);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            requestAnimationFrame(() => setWidth(percent));
        });
        return () => cancelAnimationFrame(id);
    }, [percent]);

    if (isPlatinum) {
        return (
            <section className="flex flex-col gap-2" aria-label="Badge progress">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 rounded-xl px-6 py-4 text-center">
                    <span className="animate-celebrate inline-block text-base font-semibold text-[#6a0dad]">
                        🏆 You&apos;ve reached the highest badge!
                    </span>
                </div>
            </section>
        );
    }

    if (!nextMilestone) {
        return (
            <section className="flex flex-col gap-2" aria-label="Badge progress">
                <p className="m-0 text-sm text-[#444]">
                    Start making purchases to earn achievements and unlock your
                    first badge!
                </p>
                <div
                    className="h-3 bg-[#ebebeb] rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={0}
                    aria-valuemax={1}
                    aria-label="No progress yet"
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-[#26c68e]"
                        style={{ width: '0%', transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }}
                    />
                </div>
                <p className="m-0 text-xs text-[#999]">
                    0 / {PURCHASE_MILESTONES[0]!.purchases} purchases
                </p>
            </section>
        );
    }

    const remaining = Math.max(nextMilestone.purchases - totalPurchases, 0);

    return (
        <section className="flex flex-col gap-2" aria-label="Badge progress">
            <p className="m-0 text-sm text-[#444]">
                <strong>{remaining}</strong> more purchase
                {remaining !== 1 ? "s" : ""} to unlock{" "}
                <strong>{nextMilestone.name}</strong>
                {nextBadge ? (
                    <>
                        {" "}
                        → <strong>{nextBadge}</strong>
                    </>
                ) : null}
            </p>

            <div
                className="h-3 bg-[#ebebeb] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={totalPurchases}
                aria-valuemax={nextMilestone.purchases}
                aria-label={`${totalPurchases} of ${nextMilestone.purchases} purchases`}
            >
                <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-[#26c68e]"
                    style={{ width: `${width}%`, transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }}
                />
            </div>

            <p className="m-0 text-xs text-[#999]">
                {totalPurchases} / {nextMilestone.purchases} purchases
            </p>
        </section>
    );
};

export default ProgressBar;

