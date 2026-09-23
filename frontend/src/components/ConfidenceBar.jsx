import './ConfidenceBar.css';

export default function ConfidenceBar({ value = 0, size = 'md', showLabel = true, animated = true }) {
  const pct = Math.round(value * 100);
  const hue = value < 0.3 ? 345 : value < 0.6 ? 40 : value < 0.85 ? 160 : 165;

  return (
    <div className={`confidence-bar confidence-bar-${size}`}>
      <div className="confidence-bar-track">
        <div
          className={`confidence-bar-fill ${animated ? 'confidence-bar-animated' : ''}`}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(${hue}, 80%, 45%), hsl(${hue}, 90%, 55%))`,
            boxShadow: `0 0 12px hsla(${hue}, 80%, 50%, 0.4)`,
          }}
        />
      </div>
      {showLabel && (
        <span className="confidence-bar-label" style={{ color: `hsl(${hue}, 80%, 60%)` }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
