export default function LifecycleChart({ values, title, labels = {} }) {
  const points = values
    .map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${100 - value}`)
    .join(' ');

  return (
    <figure className="lifecycle-chart">
      <svg viewBox="0 0 100 104" role="img" aria-label={`${title} relative attention over time`}>
        <path className="chart-grid" d="M0 25H100M0 50H100M0 75H100M0 100H100" />
        <polyline points={points} />
      </svg>
      <figcaption><span>{labels.start ?? 'Origin'}</span><span>{labels.peak ?? 'Peak'}</span><span>{labels.now ?? 'Now'}</span></figcaption>
    </figure>
  );
}
