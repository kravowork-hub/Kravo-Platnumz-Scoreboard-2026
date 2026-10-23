import React, { useState } from 'react';
import { getCountryCode, getFlagVectorUrl, getFlagImgUrl, getFlagEmoji } from './countries';

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
  const vectorUrl = getFlagVectorUrl(codeOrFlag);
  const [imgSrc, setImgSrc] = useState(vectorUrl);
  const [hasError, setHasError] = useState(false);

  // Synchronize imgSrc when codeOrFlag changes
  React.useEffect(() => {
    setImgSrc(getFlagVectorUrl(codeOrFlag));
    setHasError(false);
  }, [codeOrFlag]);

  const sizeClasses = {
    sm: 'w-7 h-5 text-sm',
    md: 'w-10 h-7 text-xl',
    lg: 'w-14 h-9 text-2xl',
    xl: 'w-16 h-11 text-3xl'
  }[size];

  const isWavyPng = code === 'zw';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group flag-wave-animated ${
        isWavyPng
          ? 'bg-transparent overflow-visible drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]'
          : 'overflow-hidden border border-white/35 bg-slate-900 rounded-md shadow-[inset_2px_0_0_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.55)]'
      } ${sizeClasses} ${className}`}
      title={alt}
    >
      {!hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full select-none pointer-events-none ${isWavyPng ? 'object-contain' : 'object-cover'}`}
          loading="lazy"
          onError={() => {
            // Fallback to flagcdn PNG if vector SVG is unavailable, then to emoji
            const fallbackPng = getFlagImgUrl(code, 160);
            if (imgSrc !== fallbackPng) {
              setImgSrc(fallbackPng);
            } else {
              setHasError(true);
            }
          }}
        />
      ) : (
        <span className="select-none leading-none filter drop-shadow">
          {emoji}
        </span>
      )}

      {/* Top Fabric Specular Highlight Sheen for regular rectangular flags */}
      {!isWavyPng && (
        <>
          <span
            className="absolute inset-x-0 top-0 h-[44%] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 flag-ripple-light mix-blend-overlay pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
};
