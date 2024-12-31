import { useTheme } from '../contexts/ThemeContext';

export interface EmptyLibraryProps {
  className?: string;
}

export function EmptyLibrary({ className = '' }: EmptyLibraryProps) {
  const { currentTheme } = useTheme();

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <svg
        viewBox="0 0 800 200"
        className="w-full h-auto"
      >
        {/* First book */}
        <g className="animate-[float1_7.2s_ease-in-out_infinite]">
          <g transform="translate(300, 100)">
            {/* Book spine shadow */}
            <rect
              x="-22"
              y="-30"
              width="4"
              height="60"
              fill={currentTheme.colors.background.card}
              className="opacity-20"
            />
            {/* Book spine */}
            <rect
              x="-20"
              y="-30"
              width="4"
              height="60"
              fill={currentTheme.colors.accent.primary}
              className="opacity-90"
            />
            {/* Book cover */}
            <rect
              x="-16"
              y="-30"
              width="36"
              height="60"
              rx="2"
              fill={currentTheme.colors.accent.primary}
              className="opacity-80"
            />
            {/* Book title bar */}
            <rect
              x="-12"
              y="-25"
              width="28"
              height="3"
              fill={currentTheme.colors.background.main}
              className="opacity-20"
            />
            {/* Book author bar */}
            <rect
              x="-12"
              y="-18"
              width="20"
              height="2"
              fill={currentTheme.colors.background.main}
              className="opacity-20"
            />
          </g>
        </g>

        {/* Second book */}
        <g className="animate-[float2_8.1s_ease-in-out_infinite]">
          <g transform="translate(400, 95)">
            {/* Book spine shadow */}
            <rect
              x="-24"
              y="-35"
              width="4"
              height="65"
              fill={currentTheme.colors.background.card}
              className="opacity-20"
            />
            {/* Book spine */}
            <rect
              x="-22"
              y="-35"
              width="4"
              height="65"
              fill={currentTheme.colors.accent.secondary}
              className="opacity-90"
            />
            {/* Book cover */}
            <rect
              x="-18"
              y="-35"
              width="40"
              height="65"
              rx="2"
              fill={currentTheme.colors.accent.secondary}
              className="opacity-80"
            />
            {/* Decorative band */}
            <rect
              x="-18"
              y="-15"
              width="40"
              height="8"
              fill={currentTheme.colors.background.main}
              className="opacity-10"
            />
            {/* Book title bar */}
            <rect
              x="-14"
              y="-30"
              width="32"
              height="3"
              fill={currentTheme.colors.background.main}
              className="opacity-20"
            />
          </g>
        </g>

        {/* Third book */}
        <g className="animate-[float3_6.7s_ease-in-out_infinite]">
          <g transform="translate(500, 105)">
            {/* Book spine shadow */}
            <rect
              x="-20"
              y="-25"
              width="4"
              height="55"
              fill={currentTheme.colors.background.card}
              className="opacity-20"
            />
            {/* Book spine */}
            <rect
              x="-18"
              y="-25"
              width="4"
              height="55"
              fill={currentTheme.colors.accent.primary}
              className="opacity-90"
            />
            {/* Book cover */}
            <rect
              x="-14"
              y="-25"
              width="32"
              height="55"
              rx="2"
              fill={currentTheme.colors.accent.primary}
              className="opacity-80"
            />
            {/* Circle decoration */}
            <circle
              cx="2"
              cy="5"
              r="8"
              fill={currentTheme.colors.background.main}
              className="opacity-10"
            />
            {/* Book title bars */}
            <rect
              x="-10"
              y="-20"
              width="24"
              height="2"
              fill={currentTheme.colors.background.main}
              className="opacity-20"
            />
            <rect
              x="-10"
              y="-15"
              width="20"
              height="2"
              fill={currentTheme.colors.background.main}
              className="opacity-20"
            />
          </g>
        </g>

        {/* Gentle stars with individual animations */}
        {[...Array(12)].map((_, i) => (
          <g key={i} className={`animate-[star${i % 4}_${3 + (i % 2) * 2}s_ease-in-out_infinite_${i * 0.5}s]`}>
            <circle
              cx={150 + i * 50}
              cy={40 + (i % 3) * 25}
              r={1 + (i % 2) * 0.5}
              fill={currentTheme.colors.accent.secondary}
              className="opacity-40"
            />
          </g>
        ))}
      </svg>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(-0.5deg); }
          50% { transform: translateY(-5px) rotate(0.5deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(-3px) rotate(0.3deg); }
          50% { transform: translateY(-8px) rotate(-0.3deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(-2px) rotate(-0.4deg); }
          50% { transform: translateY(-6px) rotate(0.4deg); }
        }

        @keyframes star0 {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes star1 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }

        @keyframes star2 {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        @keyframes star3 {
          0%, 100% { opacity: 0.3; transform: scale(1.1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}