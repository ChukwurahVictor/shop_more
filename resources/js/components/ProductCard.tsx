import { type FC, type CSSProperties } from 'react';
import type { Product } from "../constants/products";

export type { Product };

interface ProductCardProps {
  product: Product;
  purchasing: boolean;
  justPurchased: boolean;
  onBuy: () => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, purchasing, justPurchased, onBuy }) => {
  return (
    <article style={styles.card}>
      {/* Product image area */}
      <div style={{ ...styles.imageArea, background: product.gradient }}>
        <span style={styles.emoji} role="img" aria-label={product.name}>
          {product.emoji}
        </span>

        {justPurchased && (
          <div style={styles.purchasedOverlay}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.25)" />
              <path d="M6 12.5l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={styles.purchasedText}>Order placed!</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={styles.info}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.name}>{product.name}</h3>

        <div style={styles.footer}>
          <span style={styles.price}>${product.price}.00</span>
          <button
            style={{
              ...styles.buyBtn,
              ...(purchasing ? styles.buyBtnLoading : {}),
              ...(justPurchased ? styles.buyBtnSuccess : {}),
            }}
            onClick={onBuy}
            disabled={purchasing || justPurchased}
            type="button"
            aria-busy={purchasing}
          >
            {purchasing ? (
              <span style={styles.spinner} aria-label="Processing" />
            ) : justPurchased ? (
              '✓ Bought'
            ) : (
              'Buy Now'
            )}
          </button>
        </div>

        <p style={styles.earnNote}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
            <circle cx="8" cy="8" r="7" stroke="#1d9e75" strokeWidth="1.5" />
            <path d="M8 5v4l2.5 1.5" stroke="#1d9e75" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Earns +{product.price} loyalty points
        </p>
      </div>
    </article>
  );
};

export default ProductCard;

const styles: Record<string, CSSProperties> = {
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #ebebeb',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
  },
  imageArea: {
    height: '148px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: '56px',
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))',
    userSelect: 'none',
  },
  purchasedOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15, 110, 86, 0.88)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  purchasedText: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  info: {
    padding: '14px 16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  category: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1d9e75',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  name: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 1.35,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  price: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#1a1a1a',
  },
  buyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '82px',
    height: '34px',
    padding: '0 14px',
    background: '#1d9e75',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 150ms ease, opacity 150ms ease',
    fontFamily: 'inherit',
  },
  buyBtnLoading: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },
  buyBtnSuccess: {
    background: '#0f6e56',
    cursor: 'default',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  earnNote: {
    margin: '4px 0 0',
    fontSize: '11px',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
  },
};
