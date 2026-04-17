import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { isAxiosError } from "axios";
import { useAchievements } from "../hooks/useAchievements";
import { simulatePurchase } from "../api/achievements";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { BadgeTier } from "../types";
import {
    BADGE_GRADIENT,
    BADGE_ACCENT,
    BADGE_LABEL,
    NO_BADGE_GRADIENT,
    NO_BADGE_ACCENT,
    NO_BADGE_LABEL,
} from "../constants/badges";
import { PRODUCTS } from "../constants/products";
import type { Product } from "../constants/products";
import BadgeJourney from "../components/BadgeJourney";
import ProgressBar from "../components/ProgressBar";
import AchievementGrid from "../components/AchievementGrid";
import ProductCard from "../components/ProductCard";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorState from "../components/ErrorState";
import BadgeUnlockModal from "../components/BadgeUnlockModal";

// ─── Tier helpers ─────────────────────────────────────────────────────────────

function tierGradient(badge: BadgeTier | null): string {
    return badge ? BADGE_GRADIENT[badge] : NO_BADGE_GRADIENT;
}

function tierAccent(badge: BadgeTier | null): string {
    return badge ? BADGE_ACCENT[badge] : NO_BADGE_ACCENT;
}

function tierLabel(badge: BadgeTier | null): string {
    return badge ? BADGE_LABEL[badge] : NO_BADGE_LABEL;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard: FC = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const userId = user!.id;

    const [purchasingId, setPurchasingId] = useState<number | null>(null);
    const [recentlyPurchased, setRecentlyPurchased] = useState<Set<number>>(
        new Set(),
    );
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [unlockedBadge, setUnlockedBadge] = useState<BadgeTier | null>(null);

    const { data, isLoading, isError, refetch } = useAchievements(userId);

    // Track badge upgrades — skip on first load, fire on subsequent changes
    const prevBadgeRef = useRef<BadgeTier | null | undefined>(undefined);
    useEffect(() => {
        if (data === undefined) return;
        const current = data.current_badge;
        if (prevBadgeRef.current === undefined) {
            // First load — record baseline without showing modal
            prevBadgeRef.current = current;
            return;
        }
        if (current !== prevBadgeRef.current && current !== null) {
            setUnlockedBadge(current);
        }
        prevBadgeRef.current = current;
    }, [data]);

    const handleBuy = useCallback(
        async (product: Product) => {
            if (purchasingId !== null) return;
            setPurchasingId(product.id);
            setPurchaseError(null);
            try {
                await simulatePurchase(userId, product.price);
                await refetch();
                setRecentlyPurchased((prev) => new Set(prev).add(product.id));
                setTimeout(() => {
                    setRecentlyPurchased((prev) => {
                        const next = new Set(prev);
                        next.delete(product.id);
                        return next;
                    });
                }, 3000);
            } catch (err: unknown) {
                if (isAxiosError(err)) {
                    setPurchaseError(
                        err.response?.data?.message ??
                            "Purchase failed. Please try again.",
                    );
                } else {
                    setPurchaseError("Purchase failed. Please try again.");
                }
            } finally {
                setPurchasingId(null);
            }
        },
        [purchasingId, userId, refetch],
    );

    async function handleLogout(): Promise<void> {
        setLoggingOut(true);
        toast("Signed out successfully", "info");
        await logout();
    }

    const firstName = user!.name.split(" ")[0];
    const currentBadge = data?.current_badge ?? null;
    const heroGradient = tierGradient(currentBadge);
    const heroAccent = tierAccent(currentBadge);
    const memberLabel = tierLabel(currentBadge);
    const milestonesUnlocked = data?.unlocked_achievements.length ?? 0;
    const totalPurchases = data?.total_purchases ?? 0;
    const loyaltyPoints = totalPurchases * 100;
    const toNextTier = data?.remaining_to_unlock_next_badge;

    return (
        <div className="min-h-screen bg-[#f5f5f3] font-sans pb-[72px]">
            {unlockedBadge && (
                <BadgeUnlockModal
                    badge={unlockedBadge}
                    onClose={() => setUnlockedBadge(null)}
                />
            )}
            {/* ── Sticky nav ── */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1020px] mx-auto px-5 h-[62px] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 28 28"
                            fill="none"
                            aria-hidden="true"
                        >
                            <circle cx="14" cy="14" r="14" fill="#1d9e75" />
                            <path
                                d="M8 14.5l4 4 8-8"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="text-[17px] font-extrabold text-gray-900 tracking-tight">
                            ShopMore
                        </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#888"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        <div className="w-px h-[22px] bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <div className="w-[34px] h-[34px] rounded-full bg-brand text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                                {user!.name[0].toUpperCase()}
                            </div>
                            <span className="text-[13px] font-semibold text-gray-700">
                                {user!.name}
                            </span>
                        </div>
                        <button
                            className="px-3.5 py-[7px] text-[13px] font-semibold bg-transparent text-gray-500 border border-gray-300 rounded-[7px] cursor-pointer font-sans whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            type="button"
                        >
                            {loggingOut ? "Signing out…" : "Sign out"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1020px] mx-auto px-5 py-7 flex flex-col gap-6">
                {/* ── Hero membership card ── */}
                <section
                    className="rounded-[18px] px-10 py-9 relative overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.16)]"
                    style={{ background: heroGradient }}
                    aria-label="Membership overview"
                >
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-8">
                        {/* Left: member info + stats */}
                        <div className="flex flex-col gap-2.5 flex-1">
                            <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 pl-2 rounded-full border w-fit"
                                style={{
                                    borderColor: `${heroAccent}55`,
                                    background: `${heroAccent}22`,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ background: heroAccent }}
                                />
                                <span
                                    className="text-[10px] font-bold tracking-widest"
                                    style={{ color: heroAccent }}
                                >
                                    SHOPMORE REWARDS MEMBER
                                </span>
                            </div>
                            <h1 className="m-0 text-[30px] font-extrabold text-white tracking-tight leading-tight [text-shadow:0_1px_4px_rgba(0,0,0,0.2)]">
                                Welcome back, {firstName}!
                            </h1>
                            <p className="m-0 text-[15px] text-white/80 font-medium">
                                {memberLabel}
                            </p>

                            <div className="flex items-center gap-5 mt-2 bg-black/[0.18] rounded-xl px-5 py-3.5 w-fit">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xl font-extrabold text-white leading-none">
                                        {loyaltyPoints.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-white/65 font-semibold uppercase tracking-wide">
                                        Loyalty Points
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/20 shrink-0" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xl font-extrabold text-white leading-none">
                                        {data
                                            ? totalPurchases.toLocaleString()
                                            : "—"}
                                    </span>
                                    <span className="text-[10px] text-white/65 font-semibold uppercase tracking-wide">
                                        Purchases
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/20 shrink-0" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xl font-extrabold text-white leading-none">
                                        {milestonesUnlocked} / 5
                                    </span>
                                    <span className="text-[10px] text-white/65 font-semibold uppercase tracking-wide">
                                        Milestones
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/20 shrink-0" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xl font-extrabold text-white leading-none">
                                        {data
                                            ? toNextTier === 0
                                                ? "🏆"
                                                : (toNextTier ?? "—")
                                            : "—"}
                                    </span>
                                    <span className="text-[10px] text-white/65 font-semibold uppercase tracking-wide">
                                        To Next Tier
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: tier badge */}
                        <div
                            className="hidden sm:flex flex-col items-center gap-2.5 shrink-0"
                            aria-hidden="true"
                        >
                            <div
                                className="p-2 rounded-full border-2"
                                style={{ borderColor: `${heroAccent}66` }}
                            >
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center"
                                    style={{ background: `${heroAccent}22` }}
                                >
                                    <span
                                        className="text-[42px] font-black leading-none [text-shadow:0_2px_8px_rgba(0,0,0,0.25)]"
                                        style={{ color: heroAccent }}
                                    >
                                        {data?.current_badge
                                            ? data.current_badge[0]
                                            : "?"}
                                    </span>
                                </div>
                            </div>
                            <span
                                className="text-xs font-bold tracking-wide uppercase"
                                style={{ color: heroAccent }}
                            >
                                {data?.current_badge ?? "New Member"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Loading / Error ── */}
                {isLoading && <SkeletonLoader />}
                {isError && !isLoading && <ErrorState onRetry={refetch} />}

                {/* ── Content ── */}
                {!isLoading && !isError && data && (
                    <>
                        {/* Shop & Earn */}
                        <section aria-label="Product shop">
                            <div className="flex items-start justify-between flex-wrap gap-3 mb-[18px]">
                                <div>
                                    <h2 className="m-0 text-xl font-extrabold text-gray-900 tracking-tight">
                                        Shop & Earn Rewards
                                    </h2>
                                    <p className="mt-1 mb-0 text-[13px] text-gray-400 leading-relaxed">
                                        Every purchase earns loyalty points and
                                        unlocks milestones toward your next
                                        badge.
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 whitespace-nowrap shrink-0">
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="7"
                                            fill="#1d9e75"
                                        />
                                        <path
                                            d="M5 8.5l2.5 2.5L11 5.5"
                                            stroke="#fff"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Earn 100 pts per purchase
                                </div>
                            </div>

                            {purchaseError && (
                                <p
                                    className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700"
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    {purchaseError}
                                </p>
                            )}

                            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-5">
                                {PRODUCTS.map((product) => (
                                    <div
                                        key={product.id}
                                        className="product-card-wrap"
                                    >
                                        <ProductCard
                                            product={product}
                                            purchasing={
                                                purchasingId === product.id
                                            }
                                            justPurchased={recentlyPurchased.has(
                                                product.id,
                                            )}
                                            onBuy={() => {
                                                void handleBuy(product);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Progress + Journey row */}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
                            <section
                                className="bg-white border border-gray-200 rounded-[14px] p-6 flex flex-col gap-4 shadow-sm"
                                aria-label="Progress to next badge"
                            >
                                <h2 className="m-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Progress to Next Tier
                                </h2>
                                <ProgressBar
                                    totalPurchases={totalPurchases}
                                    unlockedCount={
                                        data.unlocked_achievements.length
                                    }
                                    nextBadge={data.next_badge}
                                    currentBadge={data.current_badge}
                                />
                            </section>
                            <section
                                className="bg-white border border-gray-200 rounded-[14px] p-6 flex flex-col gap-4 shadow-sm"
                                aria-label="Tier journey"
                            >
                                <h2 className="m-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Your Tier Journey
                                </h2>
                                <BadgeJourney
                                    currentBadge={data.current_badge}
                                />
                            </section>
                        </div>

                        {/* Milestones */}
                        <section
                            className="bg-white border border-gray-200 rounded-[14px] p-6 flex flex-col gap-4 shadow-sm"
                            aria-label="Milestones"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="m-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Your Milestones
                                </h2>
                                <span className="px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                                    {milestonesUnlocked} of 5 unlocked
                                </span>
                            </div>
                            <AchievementGrid
                                unlockedAchievements={
                                    data.unlocked_achievements
                                }
                                nextAvailableAchievements={
                                    data.next_available_achievements
                                }
                            />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
