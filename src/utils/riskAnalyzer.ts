import { RiskFlag } from '../types';

export const SENSATIONAL_KEYWORDS = [
  'breaking',
  'shocking',
  'share before deleted',
  'share before it is deleted',
  'urgent',
  'forwarded as received',
  'forward to all groups',
  'secret',
  'alert',
  'danger',
  'must watch',
  '100% proof',
  'banned news',
  'modi government ordered',
  'rbi urgent notice',
];

/**
 * Calculates risk flags for a claim based on the 3 core criteria:
 * 1. Sensational keywords (breaking, shocking, share before deleted, etc.)
 * 2. Shouting (>50% CAPS alphabetic characters)
 * 3. Unsourced (no source link provided)
 * 4. High Risk: 2 or more flags
 */
export function evaluateRiskFlags(text: string, sourceUrl?: string): { flags: RiskFlag[]; isHighRisk: boolean } {
  const flags: RiskFlag[] = [];
  const lowerText = text.toLowerCase();

  // 1. Sensationalism check
  const matchedSensationalWord = SENSATIONAL_KEYWORDS.find(keyword => lowerText.includes(keyword));
  if (matchedSensationalWord) {
    flags.push({
      type: 'Sensational',
      label: 'Sensational',
      reason: `Contains viral trigger phrases (e.g., "${matchedSensationalWord}")`,
    });
  }

  // 2. Shouting check (>50% CAPS)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 8) {
    const uppercaseLetters = letters.replace(/[^A-Z]/g, '');
    const capsPercentage = (uppercaseLetters.length / letters.length) * 100;
    if (capsPercentage > 50) {
      flags.push({
        type: 'Shouting',
        label: 'Shouting',
        reason: `${Math.round(capsPercentage)}% uppercase text (>50% threshold), typical of viral panic forwards`,
      });
    }
  }

  // 3. Unsourced check
  const trimmedUrl = (sourceUrl || '').trim();
  const hasValidUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
  if (!hasValidUrl) {
    flags.push({
      type: 'Unsourced',
      label: 'Unsourced',
      reason: 'No verifiable link or publication source provided',
    });
  }

  const isHighRisk = flags.length >= 2;

  return { flags, isHighRisk };
}
