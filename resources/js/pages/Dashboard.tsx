import { useCallback, useState, type FC, type CSSProperties } from 'react';
import { isAxiosError } from 'axios';
import { useAchievements } from '../hooks/useAchievements';
import { simulatePurchase } from '../api/achievements';
import { useAuth } from '../context/AuthContext';
import type { BadgeTier } from '../types';
import BadgeJourney from '../components/BadgeJourney';
import ProgressBar from '../components/ProgressBar';
import AchievementGrid from '../components/AchievementGrid';
import ProductCard, { type Product } from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

// ─── Product catalogue ────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Pro Headphones', category: 'Electronics',   price: 100, emoji: '🎧', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, name: 'Luxury Skincare Set',      category: 'Beauty',        price: 100, emoji: '✨', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, name: 'Designer Tote Bag',        category: 'Fashion',       price: 100, emoji: '👜', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, name: 'Artisan Coffee Bundle',    category: 'Food & Drink',  price: 100, emoji: '☕', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 5, name: 'Smart Fitness Watch',      category: 'Sports',        price: 100, emoji: '⌚', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 6, name: 'Scented Candle Set',       category: 'Home & Living', price: 100, emoji: '🕯️', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
];

// ─── Tier helpers ─────────────────────────────────────────────────────────────

const TIER_GRADIENT: Record<string, string> = {
  null:     'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
  Bronze:   'linear-gradient(135deg, #a0522d 0%, #cd7f32 100%)',
  Silver:   'linear-gradient(135deg, #5a5a5a 0%, #9e9e9e 100%)',
  Gold:     'linear-gradient(135deg, #b8730a 0%, #f5c518 100%)',
  Platinum: 'linear-gradient(135deg, #3a006f 0%, #7b2cbf 100%)',
};

const TIER_ACCENT: Record<string, string> = {
  null:     '#26c68e',
  Bronze:   '#cd7f32',
  Silver:   '#c0c0c0',
  Gold:     '#f5c518',
  Platinum: '#c77dff',
};

const TIER_LABEL: Record<string, string> = {
  null:     'New Member — start shopping to earn your first badge!',
  Bronze:   'Bronze Member',
  Silver:   'Silver Member',
  Gold:     'Gold Member',
  Platinum: 'Platinum Member ✦',
};

function tierKey(badge: BadgeTier | null): string {
  return badge ?? 'null';
}

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard: FC = () => {
  const { user, logout } = useAuth();
  const userId = user!.id;

  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [recentlyPurchased, setRecentlyPurchased] = useState<Set<number>>(new Set());
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data, isLoading, isError, refetch } = useAchievements(userId);

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
          setPurchaseError(err.response?.data?.message ?? 'Purchase failed. Please try again.');
        } else {
          setPurchaseError('Purchase failed. Please try again.');
        }
      } finally {
        setPurchasingId(null);
      }
    },
    [purchasingId, userId, refetch],
  );

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    await logout();
  }

  const firstName = user!.name.split(' ')[0];
  const tk = tierKey(data?.current_badge ?? null);
  const heroGradient = TIER_GRADIENT[tk];
  const heroAccent   = TIER_ACCENT[tk];
  const tierLabel    = TIER_LABEL[tk];
  const loyaltyPoints      = (data?.unlocked_achievements.length ?? 0) * 100;
  const milestonesUnlocked =  data?.unlocked_achievements.length ?? 0;
  const toNextTier         =  data?.remaining_to_unlock_next_badge;

  return (
      <div style={S.page}>
          <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 20px;
        }
        .product-card-wrap article:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.10);
        }
        .progress-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        @media (max-width: 560px) {
          .hero-badge-col { display: none !important; }
        }
      `}</style>

          {/* ── Sticky nav ── */}
          <nav style={S.nav}>
              <div style={S.navInner}>
                  <div style={S.navBrand}>
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
                      <span style={S.navBrandName}>ShopMore</span>
                  </div>

                  <div style={S.navRight}>
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
                      <div style={S.navDivider} />
                      <div style={S.avatarChip}>
                          <div style={S.avatar}>
                              {user!.name[0].toUpperCase()}
                          </div>
                          <span style={S.avatarName}>{user!.name}</span>
                      </div>
                      <button
                          style={{
                              ...S.logoutBtn,
                              ...(loggingOut ? S.logoutBtnDisabled : {}),
                          }}
                          onClick={handleLogout}
                          disabled={loggingOut}
                          type="button"
                      >
                          {loggingOut ? "Signing out…" : "Sign out"}
                      </button>
                  </div>
              </div>
          </nav>

          <main style={S.main}>
              {/* ── Hero membership card ── */}
              <section
                  style={{ ...S.hero, background: heroGradient }}
                  aria-label="Membership overview"
              >
                  <div style={S.heroOverlay} />
                  <div className="hero-inner" style={S.heroInner}>
                      {/* Left: member info + stats */}
                      <div style={S.heroLeft}>
                          <div
                              style={{
                                  ...S.heroChip,
                                  borderColor: `${heroAccent}55`,
                                  background: `${heroAccent}22`,
                              }}
                          >
                              <span
                                  style={{
                                      ...S.heroChipDot,
                                      background: heroAccent,
                                  }}
                              />
                              <span
                                  style={{
                                      color: heroAccent,
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      letterSpacing: "0.8px",
                                  }}
                              >
                                  SHOPMORE REWARDS MEMBER
                              </span>
                          </div>
                          <h1 style={S.heroGreeting}>
                              Welcome back, {firstName}!
                          </h1>
                          <p style={S.heroTierLabel}>{tierLabel}</p>

                          <div style={S.heroStats}>
                              <div style={S.statItem}>
                                  <span style={S.statValue}>
                                      {loyaltyPoints.toLocaleString()}
                                  </span>
                                  <span style={S.statLabel}>
                                      Loyalty Points
                                  </span>
                              </div>
                              <div style={S.statSep} />
                              <div style={S.statItem}>
                                  <span style={S.statValue}>
                                      {milestonesUnlocked} / 5
                                  </span>
                                  <span style={S.statLabel}>Milestones</span>
                              </div>
                              <div style={S.statSep} />
                              <div style={S.statItem}>
                                  <span style={S.statValue}>
                                      {data
                                          ? toNextTier === 0
                                              ? "🏆"
                                              : (toNextTier ?? "—")
                                          : "—"}
                                  </span>
                                  <span style={S.statLabel}>To Next Tier</span>
                              </div>
                          </div>
                      </div>

                      {/* Right: tier badge */}
                      <div
                          className="hero-badge-col"
                          style={S.heroBadgeCol}
                          aria-hidden="true"
                      >
                          <div
                              style={{
                                  ...S.heroBadgeRing,
                                  borderColor: `${heroAccent}66`,
                              }}
                          >
                              <div
                                  style={{
                                      ...S.heroBadgeCircle,
                                      background: `${heroAccent}22`,
                                  }}
                              >
                                  <span
                                      style={{
                                          ...S.heroBadgeLetter,
                                          color: heroAccent,
                                      }}
                                  >
                                      {data?.current_badge
                                          ? data.current_badge[0]
                                          : "?"}
                                  </span>
                              </div>
                          </div>
                          <span
                              style={{ ...S.heroBadgeName, color: heroAccent }}
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
                          <div style={S.sectionHeader}>
                              <div>
                                  <h2 style={S.sectionTitle}>
                                      Shop & Earn Rewards
                                  </h2>
                                  <p style={S.sectionSub}>
                                      Every purchase earns loyalty points and
                                      unlocks milestones toward your next badge.
                                  </p>
                              </div>
                              <div style={S.earnPill}>
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
                                  style={S.errorBanner}
                                  role="alert"
                                  aria-live="assertive"
                              >
                                  {purchaseError}
                              </p>
                          )}

                          <div className="product-grid">
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
                      <div className="progress-row">
                          <section
                              style={S.card}
                              aria-label="Progress to next badge"
                          >
                              <h2 style={S.cardTitle}>Progress to Next Tier</h2>
                              <ProgressBar
                                  current={data.unlocked_achievements.length}
                                  remaining={
                                      data.remaining_to_unlock_next_badge
                                  }
                                  nextBadge={data.next_badge}
                                  currentBadge={data.current_badge}
                              />
                          </section>
                          <section style={S.card} aria-label="Tier journey">
                              <h2 style={S.cardTitle}>Your Tier Journey</h2>
                              <BadgeJourney currentBadge={data.current_badge} />
                          </section>
                      </div>

                      {/* Milestones */}
                      <section style={S.card} aria-label="Milestones">
                          <div style={S.milestoneHeader}>
                              <h2 style={S.cardTitle}>Your Milestones</h2>
                              <span style={S.milestonePill}>
                                  {milestonesUnlocked} of 5 unlocked
                              </span>
                          </div>
                          <AchievementGrid
                              unlockedAchievements={data.unlocked_achievements}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f3',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    paddingBottom: '72px',
  },
  // Nav
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e8e8',
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  navInner: {
    maxWidth: '1020px',
    margin: '0 auto',
    padding: '0 20px',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navBrandName: { fontSize: '17px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  navDivider: { width: '1px', height: '22px', background: '#e8e8e8' },
  avatarChip: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#1d9e75', color: '#fff', fontSize: '13px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarName: { fontSize: '13px', fontWeight: '600', color: '#333' },
  logoutBtn: {
    padding: '7px 14px', fontSize: '13px', fontWeight: '600',
    background: 'transparent', color: '#666', border: '1px solid #ddd',
    borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
  },
  logoutBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  // Layout
  main: {
    maxWidth: '1020px', margin: '0 auto', padding: '28px 20px',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },

  // Hero
  hero: {
    borderRadius: '18px', padding: '36px 40px',
    position: 'relative' as const, overflow: 'hidden',
    boxShadow: '0 6px 28px rgba(0,0,0,0.16)',
  },
  heroOverlay: {
    position: 'absolute' as const, inset: 0,
    background: 'rgba(0,0,0,0.10)', pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative' as const, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', gap: '32px',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  heroChip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px 4px 8px', borderRadius: '100px', border: '1px solid transparent',
    width: 'fit-content',
  },
  heroChipDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  heroGreeting: {
    margin: 0, fontSize: '30px', fontWeight: '800', color: '#ffffff',
    letterSpacing: '-0.5px', lineHeight: 1.15, textShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  heroTierLabel: { margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroStats: {
    display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px',
    background: 'rgba(0,0,0,0.18)', borderRadius: '12px', padding: '14px 20px',
    width: 'fit-content',
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { fontSize: '20px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
  statLabel: {
    fontSize: '10px', color: 'rgba(255,255,255,0.65)',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  statSep: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 },
  heroBadgeCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 },
  heroBadgeRing: { padding: '8px', borderRadius: '50%', border: '2px solid transparent' },
  heroBadgeCircle: {
    width: '96px', height: '96px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.15)',
  },
  heroBadgeLetter: { fontSize: '42px', fontWeight: '900', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.25)' },
  heroBadgeName: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' as const },

  // Section
  sectionHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '12px', marginBottom: '18px',
  },
  sectionTitle: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px' },
  sectionSub: { margin: '4px 0 0', fontSize: '13px', color: '#888', lineHeight: 1.5 },
  earnPill: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', background: '#e6f7f1', border: '1px solid #b3e8d4',
    borderRadius: '100px', fontSize: '12px', fontWeight: '600', color: '#0f6e56',
    whiteSpace: 'nowrap' as const, flexShrink: 0,
  },
  errorBanner: {
    margin: '0 0 16px', padding: '12px 16px', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#b91c1c',
  },

  // Card
  card: {
    background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '14px',
    padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    margin: 0, fontSize: '11px', fontWeight: '700', color: '#aaa',
    textTransform: 'uppercase', letterSpacing: '0.8px',
  },
  milestoneHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '8px',
  },
  milestonePill: {
    padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: '100px', fontSize: '12px', fontWeight: '600', color: '#15803d',
  },
};
