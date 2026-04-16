import type { FC, ReactNode, CSSProperties } from 'react';
import { styles } from './AchievementChip.styles';

interface AchievementChipProps {
  name: string;
  description: string;
  icon: ReactNode;
  unlocked: boolean;
  nextAvailable?: boolean;
}

const CheckmarkBadge: FC = () => (
  <span style={styles.checkmark as CSSProperties} aria-label="Unlocked">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="#1d9e75" />
      <path
        d="M4 7.2L6.1 9.5L10 5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const AchievementChip: FC<AchievementChipProps> = ({
  name,
  description,
  icon,
  unlocked,
  nextAvailable = false,
}) => {
  const cardStyle: CSSProperties = {
    ...styles.card,
    ...(unlocked ? styles.cardUnlocked : styles.cardLocked),
    ...(nextAvailable && !unlocked ? styles.cardNextAvailable : {}),
  };

  const nameStyle: CSSProperties = {
    ...styles.name,
    ...(unlocked ? styles.nameUnlocked : styles.nameLocked),
  };

  const descStyle: CSSProperties = {
    ...styles.description,
    ...(unlocked ? styles.descUnlocked : styles.descLocked),
  };

  const iconWrapperStyle: CSSProperties = {
    ...styles.iconWrapper,
    ...(unlocked ? styles.iconWrapperUnlocked : styles.iconWrapperLocked),
  };

  return (
    <article
      style={cardStyle}
      className={nextAvailable && !unlocked ? 'next-available-chip' : ''}
    >
      {unlocked && <CheckmarkBadge />}
      <div style={iconWrapperStyle} aria-hidden="true">
        {icon}
      </div>
      <p style={nameStyle}>{name}</p>
      <p style={descStyle}>{description}</p>
    </article>
  );
};

export default AchievementChip;
