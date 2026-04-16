import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  card: {
    position: 'relative',
    width: '140px',
    minHeight: '140px',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid #ebebeb',
    cursor: 'default',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  cardUnlocked: {
    background: '#e6f7f1',
    border: '1px solid #b3e8d4',
  },
  cardLocked: {
    background: '#f1f0f0',
    border: '1px solid #e0dfdf',
  },
  cardNextAvailable: {
    background: '#f1f0f0',
  },
  checkmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    marginBottom: '4px',
  },
  iconWrapperUnlocked: {
    background: '#c4eddf',
  },
  iconWrapperLocked: {
    background: '#e2e1e1',
  },
  name: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: 1.3,
  },
  nameUnlocked: {
    color: '#0f6e56',
  },
  nameLocked: {
    color: '#9a9a9a',
  },
  description: {
    margin: 0,
    fontSize: '11px',
    lineHeight: 1.4,
  },
  descUnlocked: {
    color: '#2d7a64',
  },
  descLocked: {
    color: '#b5b5b5',
  },
};
