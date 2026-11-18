import React from 'react';

export interface LeakyBucketProps {
  className?: string;
  showLabels?: boolean;
}

export const LeakyBucket: React.FC<LeakyBucketProps> = ({ className = '', showLabels = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-surface-elevated border border-border rounded-lg ${className}`}>
      <div className="w-full max-w-md">
        <svg
          viewBox="0 0 500 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          role="img"
          aria-label="Illustration of the farmer's leaky bucket being plugged by FarmGate Hub"
        >
          {/* Top pouring water representing production policy */}
          <path
            d="M 220 20 L 220 80 M 250 10 L 250 85 M 280 25 L 280 80"
            stroke="#0284c7"
            strokeWidth="4"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <text x="250" y="45" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="600" fontFamily="sans-serif">
            Higher Production Inflow
          </text>

          {/* Bucket Outline */}
          <path
            d="M 140 90 L 170 330 Q 250 350 330 330 L 360 90 Z"
            fill="#f5f5f4"
            stroke="#1c1917"
            strokeWidth="3.5"
          />
          {/* Bucket Rim */}
          <ellipse cx="250" cy="90" rx="110" ry="18" fill="#e7e5e4" stroke="#1c1917" strokeWidth="3" />

          {/* Water level inside bucket */}
          <path
            d="M 155 170 C 200 165, 300 175, 345 170 L 326 315 Q 250 335 174 315 Z"
            fill="#bae6fd"
            opacity="0.85"
          />

          {/* Leak 1: Spoilage (Top Left) */}
          <g transform="translate(142, 160)">
            <circle cx="10" cy="10" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <path d="M 0 10 Q -40 25 -30 65" stroke="#0284c7" strokeWidth="3" fill="none" strokeDasharray="3 3" />
            {/* Plug */}
            <rect x="0" y="3" width="16" height="14" rx="3" fill="#1f6b3a" stroke="#14532d" strokeWidth="1.5" />
            <text x="-40" y="-12" fill="#991b1b" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              1. Spoilage (11.6% loss)
            </text>
            <text x="-40" y="2" fill="#1f6b3a" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              ✓ Plugged by Cool Pod
            </text>
          </g>

          {/* Leak 2: Distress Sales (Middle Left) */}
          <g transform="translate(155, 230)">
            <circle cx="10" cy="10" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <path d="M 0 10 Q -40 20 -20 60" stroke="#0284c7" strokeWidth="3" fill="none" strokeDasharray="3 3" />
            {/* Plug */}
            <rect x="0" y="3" width="16" height="14" rx="3" fill="#1f6b3a" stroke="#14532d" strokeWidth="1.5" />
            <text x="-50" y="-10" fill="#991b1b" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              2. Distress Selling
            </text>
            <text x="-50" y="4" fill="#1f6b3a" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              ✓ Plugged by Advances
            </text>
          </g>

          {/* Leak 3: Missing Information (Top Right) */}
          <g transform="translate(332, 175)">
            <circle cx="10" cy="10" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <path d="M 20 10 Q 60 25 45 65" stroke="#0284c7" strokeWidth="3" fill="none" strokeDasharray="3 3" />
            {/* Plug */}
            <rect x="5" y="3" width="16" height="14" rx="3" fill="#1f6b3a" stroke="#14532d" strokeWidth="1.5" />
            <text x="35" y="-12" fill="#991b1b" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              3. Missing Price Data
            </text>
            <text x="35" y="2" fill="#1f6b3a" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              ✓ Plugged by Daily Alerts
            </text>
          </g>

          {/* Leak 4: Opaque Commissions (Middle Right) */}
          <g transform="translate(320, 245)">
            <circle cx="10" cy="10" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <path d="M 20 10 Q 60 20 40 60" stroke="#0284c7" strokeWidth="3" fill="none" strokeDasharray="3 3" />
            {/* Plug */}
            <rect x="5" y="3" width="16" height="14" rx="3" fill="#1f6b3a" stroke="#14532d" strokeWidth="1.5" />
            <text x="35" y="-10" fill="#991b1b" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              4. Opaque Deductions
            </text>
            <text x="35" y="4" fill="#1f6b3a" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              ✓ Plugged by Flat ₹1.50 Fee
            </text>
          </g>

          {/* Bucket Label */}
          <text x="250" y="270" textAnchor="middle" fill="#1c1917" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
            Farmer's Net Income
          </text>
          <text x="250" y="290" textAnchor="middle" fill="#1f6b3a" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            "I will wait, because I can."
          </text>
        </svg>
      </div>

      {showLabels && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-ink">"Fix the leaks, not the people"</p>
          <p className="text-xs text-ink-muted max-w-sm mx-auto mt-0.5">
            FarmGate Hub preserves the useful intermediary aggregation functions while stopping harvest loss, distress selling, and hidden commissions.
          </p>
        </div>
      )}
    </div>
  );
};
