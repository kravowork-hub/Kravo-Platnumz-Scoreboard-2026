import React from 'react';
import { getCountryCode, getFlagImgUrl, getFlagEmoji } from './countries';

interface FlagBadgeProps {
  codeOrFlag: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({
  codeOrFlag,
  alt = 'Country Flag',
  className = '',
  size = 'md'
}) => {
  const code = getCountryCode(codeOrFlag);
  const emoji = getFlagEmoji(codeOrFlag);
  const imgUrl = getFlagImgUrl(code, 160);

  const sizeClasses = {
    sm: 'w-7 h-5 text-sm',
    md: 'w-10 h-7 text-xl',
    lg: 'w-14 h-9 text-2xl',
    xl: 'w-16 h-11 text-3xl'
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-md shadow-md border border-white/20 bg-slate-900 shrink-0 ${sizeClasses} ${className}`}
      title={alt}
    >
      <img
        src={imgUrl}
        alt={alt}
        className="w-full h-full object-cover select-none"
        loading="lazy"
        onError={(e) => {
          // If image fails or device is completely offline with no cache, show emoji
          const target = e.currentTarget as HTMLElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'inline';
        }}
      />
      <span className="hidden select-none leading-none filter drop-shadow">
        {emoji}
      </span>
    </div>
  );
};
