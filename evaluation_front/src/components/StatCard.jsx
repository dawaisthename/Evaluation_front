// components/StatCard.jsx
export function StatCard({ label, value, hint, trend, trendValue }) {
  const isPositive = trend === "up";
  const trendClass = isPositive ? "trend-up" : "trend-down";

  return (
    <div className="card statCard">
      <div className="statHeader">
        <span className="statLabel">{label}</span>
        {trendValue && (
          <div className={`trendBadge ${trendClass}`}>
            {isPositive ? "↑" : "↓"} {trendValue}
          </div>
        )}
      </div>
      <span className="statValue">{value}</span>
      {hint && <span className="statHint">{hint}</span>}
    </div>
  );
}
