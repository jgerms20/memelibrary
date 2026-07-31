import { describe, expect, it } from 'vitest';
import {
  PROVENANCE_STATUS,
  isOriginalIntentEligible,
  provenanceCopyFor,
  provenanceStatusFor,
} from './provenance.js';

describe('provenance policy helpers', () => {
  it('treats missing provenance as uncertain instead of inventing an origin', () => {
    expect(provenanceStatusFor({})).toBe(PROVENANCE_STATUS.UNCERTAIN);
    expect(provenanceCopyFor({}).label).toBe('Origin not yet confirmed');
  });

  it('keeps confirmed and uncertain records searchable while excluding derivatives', () => {
    expect(isOriginalIntentEligible({ provenanceStatus: PROVENANCE_STATUS.CONFIRMED_ORIGINAL })).toBe(true);
    expect(isOriginalIntentEligible({ provenanceStatus: PROVENANCE_STATUS.UNCERTAIN })).toBe(true);
    expect(isOriginalIntentEligible({ provenanceStatus: PROVENANCE_STATUS.DERIVATIVE_REUSE })).toBe(false);
  });
});
