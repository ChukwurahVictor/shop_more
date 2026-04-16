import { useState, type FC, type CSSProperties } from 'react';
import { isAxiosError } from 'axios';
import { useAchievements } from '../hooks/useAchievements';
import { simulatePurchase } from '../api/achievements';
import { useAuth } from '../context/AuthContext';
import type { ApiErrorData } from '../types';
import BadgeDisplay from '../components/BadgeDisplay';
import BadgeJourney from '../components/BadgeJourney';
import ProgressBar from '../components/ProgressBar';
import AchievementGrid from '../components/AchievementGrid';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

const Dashboard: FC = () => {
  const { user, logout } = useAuth();
  const userId = user!.id;

  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const { data, isLoading, isError, refetch } = useAchievements(userId);

  async function handleSimulatePurchase(): Promise<void> {
    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    try {
      await simulatePurchase(userId, 100);
      await refetch();
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (err: unknown) {
      let message = 'Purchase simulation failed. Please try again.';
      if (isAxiosError<ApiErrorData>(err) && err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setPurchaseError(message);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    await logout();
  }

  const firstName = user!.name.split(' ')[0];

  return (
    <div style={pageStyles.page}>
      {/* ── Top Nav ── */}
      <nav style={pageStyles.nav}>
        <div style={pageStyles.navInner}>
          <div style={pageStyles.navBrand}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="14" fill="#1d9e75" />
              <path d="M8 14.5l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={pageStyles.navBrandName}>Bumpa Rewards</span>
          </div>

          <div style={pageStyles.navRight}>
            <div style={pageStyles.avatarChip}>
              <div style={pageStyles.avatar}>{user!.name[0].toUpperCase()}</div>
              <span style={pageStyles.avatarName}>{user!.name}</span>
            </div>
            <button
              style={{ ...pageStyles.logoutBtn, ...(loggingOut ? pageStyles.logoutBtnDisabled : {}) }}
              onClick={handleLogout}
              disabled={loggingOut}
              type="button"
            >
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </nav>

      <main style={pageStyles.main}>
        {/* ── Header ── */}
        <header style={pageStyles.header}>
          <div>
            <h1 style={pageStyles.greeting}>Welcome back, {firstName}!</h1>
            <p style={pageStyles.subGreeting}>Here's your loyalty progress at a glance.</p>
          </div>
        </header>

        {/* ── Loading ── */}
        {isLoading && <SkeletonLoader />}

        {/* ── Error ── */}
        {isError && !isLoading && <ErrorState onRetry={refetch} />}

        {/* ── Content ── */}
        {!isLoading && !isError && data && (
          <>
            {/* Badge + Journey row */}
            <div style={pageStyles.badgeRow}>
              <section style={pageStyles.card} aria-label="Current badge">
                <h2 style={pageStyles.cardTitle}>Current Badge</h2>
                <BadgeDisplay badgeName={data.current_badge} />
              </section>

              <section style={pageStyles.card} aria-label="Badge journey">
                <h2 style={pageStyles.cardTitle}>Your Journey</h2>
                <BadgeJourney currentBadge={data.current_badge} />
              </section>
            </div>

            {/* Progress bar */}
            <section style={pageStyles.card} aria-label="Progress to next badge">
              <h2 style={pageStyles.cardTitle}>Progress to Next Badge</h2>
              <ProgressBar
                current={data.unlocked_achievements.length}
                remaining={data.remaining_to_unlock_next_badge}
                nextBadge={data.next_badge}
                currentBadge={data.current_badge}
              />
            </section>

            {/* Achievement grid */}
            <section style={pageStyles.card} aria-label="Achievements">
              <h2 style={pageStyles.cardTitle}>Your Achievements</h2>
              <AchievementGrid
                unlockedAchievements={data.unlocked_achievements}
                nextAvailableAchievements={data.next_available_achievements}
              />
            </section>

            {/* Demo action */}
            <section style={pageStyles.card} aria-label="Demo controls">
              <h2 style={pageStyles.cardTitle}>Demo Controls</h2>
              <p style={pageStyles.demoNote}>
                Simulate a $100 purchase to advance your loyalty progress and unlock achievements.
              </p>

              <button
                style={{
                  ...pageStyles.purchaseBtn,
                  ...(purchasing ? pageStyles.purchaseBtnDisabled : {}),
                }}
                onClick={handleSimulatePurchase}
                disabled={purchasing}
                type="button"
                aria-busy={purchasing}
              >
                {purchasing ? 'Processing\u2026' : 'Simulate a Purchase'}
              </button>

              {purchaseSuccess && (
                <p style={pageStyles.successMsg} role="status" aria-live="polite">
                  Purchase recorded! Achievements updated.
                </p>
              )}

              {purchaseError && (
                <p style={pageStyles.errorMsg} role="alert" aria-live="assertive">
                  {purchaseError}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

const pageStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8f8f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    paddingBottom: '64px',
  },
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #ebebeb',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  navInner: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 16px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navBrandName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.2px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#1d9e75',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  logoutBtn: {
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: '600',
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '7px',
    cursor: 'pointer',
    transition: 'filter 150ms ease',
    fontFamily: 'inherit',
  },
  logoutBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  greeting: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 1.2,
  },
  subGreeting: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#888',
  },
  badgeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  demoNote: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.6,
  },
  purchaseBtn: {
    padding: '12px 24px',
    background: '#1d9e75',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 200ms ease, transform 200ms ease, opacity 200ms ease',
    fontFamily: 'inherit',
    alignSelf: 'flex-start',
  },
  purchaseBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  successMsg: {
    margin: 0,
    fontSize: '13px',
    color: '#1d9e75',
    fontWeight: '600',
  },
  errorMsg: {
    margin: 0,
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '500',
  },
};
