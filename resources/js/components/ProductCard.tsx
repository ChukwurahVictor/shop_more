import { type FC } from 'react';
import type { Product } from "../constants/products";

export type { Product };

interface ProductCardProps {
  product: Product;
  purchasing: boolean;
  justPurchased: boolean;
  onBuy: () => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, purchasing, justPurchased, onBuy }) => (
  <article className="bg-white rounded-[14px] border border-[#ebebeb] overflow-hidden flex flex-col transition-[transform,box-shadow] duration-200">
    {/* Product image area */}
    <div
      className="h-[148px] flex items-center justify-center relative"
      style={{ background: product.gradient }}
    >
      <span
        className="text-[56px] leading-none select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
        role="img"
        aria-label={product.name}
      >
        {product.emoji}
      </span>

      {justPurchased && (
        <div className="absolute inset-0 bg-[rgba(15,110,86,0.88)] flex flex-col items-center justify-center gap-1.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.25)" />
            <path d="M6 12.5l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white text-[13px] font-bold tracking-[0.3px]">Order placed!</span>
        </div>
      )}
    </div>

    {/* Product info */}
    <div className="px-4 pt-[14px] pb-[18px] flex flex-col gap-[5px] flex-1">
      <span className="text-[10px] font-bold text-brand uppercase tracking-[0.8px]">
        {product.category}
      </span>
      <h3 className="m-0 text-[14px] font-semibold text-[#1a1a1a] leading-[1.35]">
        {product.name}
      </h3>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[17px] font-extrabold text-[#1a1a1a]">${product.price}.00</span>
        <button
          className={[
            'flex items-center justify-center min-w-[82px] h-[34px] px-3.5 border-0 rounded-lg text-[13px] font-semibold text-white transition-[background,opacity] duration-150 font-sans',
            justPurchased ? 'bg-[#0f6e56] cursor-default' : purchasing ? 'bg-brand opacity-75 cursor-not-allowed' : 'bg-brand cursor-pointer',
          ].join(' ')}
          onClick={onBuy}
          disabled={purchasing || justPurchased}
          type="button"
          aria-busy={purchasing}
        >
          {purchasing ? (
            <span
              className="inline-block w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"
              aria-label="Processing"
            />
          ) : justPurchased ? (
            '✓ Bought'
          ) : (
            'Buy Now'
          )}
        </button>
      </div>

      <p className="mt-1 mb-0 text-[11px] text-[#aaa] flex items-center">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mr-1 shrink-0">
          <circle cx="8" cy="8" r="7" stroke="#1d9e75" strokeWidth="1.5" />
          <path d="M8 5v4l2.5 1.5" stroke="#1d9e75" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Earns +{product.price} loyalty points
      </p>
    </div>
  </article>
);

export default ProductCard;
