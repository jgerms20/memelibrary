export default function SourceTrail({ item }) {
  return (
    <div className="source-trail">
      <div className="rail-heading">
        <span>HOW IT SPREAD</span>
        <small>{item.title}</small>
      </div>
      <p className="trail-intro">A linked timeline from first capture to how the reference lives online now.</p>
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
        {item.sourceAction ?? 'Open original source'}
      </a>
    </div>
  );
}
