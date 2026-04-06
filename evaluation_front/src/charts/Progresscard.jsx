import React from "react";

/**
 * A structured card for displaying circular progress.
 * @param {number} percentage - 0 to 100
 * @param {string} title - The header of the card
 * @param {string} subtitle - Small text below the circle
 */
export function ProgressCard({ percentage = 0, title, subtitle }) {
  // SVG Calculations
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card flex-col items-center text-center">
      {title && <div className="cardTitle mb-lg">{title}</div>}

      <div className="relative inline-flex items-center justify-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--bg-muted, #f1f3f5)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Bar */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--primary-color, #3b82f6)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.5s ease-in-out",
              strokeLinecap: "round",
            }}
          />
        </svg>

        {/* Percentage Label inside the circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{percentage}%</span>
        </div>
      </div>

      {subtitle && (
        <div className="muted small mt-md font-medium uppercase tracking-wider">
          {subtitle}
        </div>
      )}
    </div>
  );
}
