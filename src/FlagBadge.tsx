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
    sm: 'w-8 h-6 text-sm',
    md: 'w-11 h-8 text-xl',
    lg: 'w-15 h-11 text-2xl',
    xl: 'w-18 h-13 text-3xl'
  }[size];

  const isWavyPng = code === 'zw';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group flag-wave-animated bg-transparent overflow-visible drop-shadow-[0_3px_6px_rgba(0,0,0,0.75)] ${sizeClasses} ${className}`}
      title={alt}
    >
      <div
        className={`relative w-full h-full flex items-center justify-center bg-transparent ${
          !isWavyPng ? 'flag-cloth-contour' : ''
        }`}
      >
        {!hasError ? (
          <img
            src={imgSrc}
            alt={alt}
            className={`w-full h-full select-none pointer-events-none bg-transparent ${
              isWavyPng ? 'object-contain' : 'object-cover'
            }`}
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

        {/* 3D Fabric wave fold highlights & specular sheen for all cloth flags matching Zimbabwe */}
        {!isWavyPng && !hasError && (
          <>
            <span
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/20 via-white/40 via-[25%] via-black/30 via-[52%] via-white/45 via-[74%] to-black/25 mix-blend-overlay"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 flag-ripple-light mix-blend-soft-light pointer-events-none"
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </div>
  );
};
