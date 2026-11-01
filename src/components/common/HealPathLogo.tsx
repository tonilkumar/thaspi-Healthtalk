import React from 'react';

interface HealPathLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'compact';
  showSubtitle?: boolean;
  className?: string;
}

export const HealPathLogo: React.FC<HealPathLogoProps> = ({
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Visual Logo Mark */}
      <div
        className={`${iconDimensions} relative shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-teal-500 p-[1.5px] shadow-md shadow-purple-500/20 transition-transform active:scale-95`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-teal-300/30 rounded-full blur-xs" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-pink-400/25 rounded-full blur-xs" />

          {/* Calming Heart + Sprout SVG Motif */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[65%] h-[65%] drop-shadow-sm"
          >
            {/* Soft Glowing Heart Foundation */}
            <path
              d="M12 20.25C12 20.25 3.75 14.85 3.75 8.7C3.75 5.8 6.05 3.5 8.95 3.5C10.5 3.5 11.9 4.2 12 4.7C12.1 4.2 13.5 3.5 15.05 3.5C17.95 3.5 20.25 5.8 20.25 8.7C20.25 14.85 12 20.25 12 20.25Z"
              fill="rgba(255, 255, 255, 0.16)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Unfurling Healing Leaf Sprout */}
            <path
              d="M12 15.5V9.5M12 9.5C12 9.5 9.75 8.25 9.75 6.25C11.5 6.25 12 9.5 12 9.5ZM12 11.5C12 11.5 14.25 10.25 14.25 8.25C12.5 8.25 12 11.5 12 11.5Z"
              stroke="#5EEAD4"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Small Radiant Sparkle */}
            <circle cx="16" cy="6" r="1" fill="#FEF08A" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center space-x-1">
            <span
              className={`font-black tracking-tight text-slate-900 ${titleSizes}`}
            >
              Heal<span className="text-purple-600">Path</span>
            </span>
          </div>
          {showSubtitle && variant !== 'compact' && (
            <span
              className={`font-semibold tracking-wider uppercase text-purple-600/90 ${subtitleSizes}`}
            >
              Emotional Wellness
            </span>
          )}
        </div>
      )}
    </div>
  );
};
