import { COMMUNITY_FACETS } from '../lib/search.js';

function FilterGroup({ label, value, options, onChange }) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <div className="filter-chips">
        {options.map((option) => (
          <button
            key={option.value}
            className={value === option.value ? 'filter-chip is-active' : 'filter-chip'}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function FilterBar({ filters, platformOptions, resultCount, onChange }) {
  return (
    <div className="filter-bar" aria-label="Search filters">
      <div className="filter-scroll">
        <FilterGroup
          label="Format"
          value={filters.media}
          onChange={(value) => onChange('media', value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'video', label: 'Motion' },
            { value: 'image', label: 'Image' },
          ]}
        />
        <FilterGroup
          label="Source"
          value={filters.platform}
          onChange={(value) => onChange('platform', value)}
          options={[
            { value: 'all', label: 'All platforms' },
            ...platformOptions.map((platform) => ({ value: platform, label: platform })),
          ]}
        />
        <FilterGroup
          label="Culture"
          value={filters.community}
          onChange={(value) => onChange('community', value)}
          options={[
            { value: 'all', label: 'All communities' },
            ...COMMUNITY_FACETS.map((community) => ({ value: community, label: community })),
          ]}
        />
      </div>
      <span className="result-count" aria-live="polite">{resultCount.toLocaleString()} matches</span>
    </div>
  );
}
