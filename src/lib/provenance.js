export const PROVENANCE_STATUS = {
  CONFIRMED_ORIGINAL: 'confirmed-original',
  DERIVATIVE_REUSE: 'derivative-reuse',
  UNCERTAIN: 'uncertain',
};

const STATUS_COPY = {
  [PROVENANCE_STATUS.CONFIRMED_ORIGINAL]: {
    label: 'Confirmed original',
    description: 'The primary media and origin claim are supported by a primary upload plus corroborating evidence.',
  },
  [PROVENANCE_STATUS.DERIVATIVE_REUSE]: {
    label: 'Derivative or reuse',
    description: 'This is a reuse, edit, parody, or sound-only version—not the original source item.',
  },
  [PROVENANCE_STATUS.UNCERTAIN]: {
    label: 'Origin not yet confirmed',
    description: 'This source is useful for discovery, but the original item has not been established.',
  },
};

export function provenanceStatusFor(item = {}) {
  return STATUS_COPY[item.provenanceStatus] ? item.provenanceStatus : PROVENANCE_STATUS.UNCERTAIN;
}

export function provenanceCopyFor(item) {
  return STATUS_COPY[provenanceStatusFor(item)];
}

export function isOriginalIntentEligible(item) {
  return provenanceStatusFor(item) !== PROVENANCE_STATUS.DERIVATIVE_REUSE;
}
