export default function LifecycleChart({ values, title }) {
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`)
    .join(' ');

  return (
    <figure className="lifecycle-chart">
      <svg viewBox="0 0 100 104" role="img" aria-label={`${title} relative attention over time`}>
        <path className="chart-grid" d="M0 25H100M0 50H100M0 75H100M0 100H100" />
        <polyline points={points} />
      </svg>
      <figcaption><span>ORIGIN</span><span>PEAK</span><span>NOW</span></figcaption>
    </figure>
  );
}
