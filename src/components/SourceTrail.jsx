export default function SourceTrail({ item }) {
  return (
    <div className="source-trail">
      <div className="rail-heading">
        <span>SOURCE TRAIL</span>
        <small>{item.title}</small>
      </div>
      <div className="trail-items">
        {item.trail.map((step, index) => (
          <div className={`trail-step tone-${step.tone}`} key={`${step.label}-${step.date}`}>
            <span className="trail-node">{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <time>{step.date}</time>
              <small>{step.detail}</small>
            </div>
          </div>
        ))}
      </div>
      <a className="trail-source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
        {item.sourceAction ?? 'View original source'}
      </a>
    </div>
  );
}
