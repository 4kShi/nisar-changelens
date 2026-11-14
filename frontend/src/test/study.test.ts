import { describe, expect, it } from 'vitest';
import {
  ACQUISITIONS,
  EVIDENCE_TIERS,
  MEKONG_PROVINCES,
  SCIENTIFIC_QA_ITEMS,
  STUDY_AREAS,
  VERIFIED_ANGIANG_PAIR_STATS,
  bboxesIntersect,
  estimateBboxAreaKm2,
  evaluatePairCompatibility,
} from '../data/study';
import { DISCOVERED_GRANULES } from '../data/catalogInventory';

describe('NISAR ChangeLens Scientific Study & Catalog Verification', () => {
  it('exposes all 29 discovered NASA CMR granules (11 validated + 18 provisional)', () => {
    expect(DISCOVERED_GRANULES.length).toBe(29);
    const validated = DISCOVERED_GRANULES.filter((g) => g.collection === 'NISAR_L2_GCOV_V1');
    const provisional = DISCOVERED_GRANULES.filter(
      (g) => g.collection === 'NISAR_L2_GCOV_PROVISIONAL_V1'
    );
    expect(validated.length).toBe(11);
    expect(provisional.length).toBe(18);
  });

  it('defines all 4 distinct scientific evidence tiers and 13 Mekong Delta provinces', () => {
    expect(EVIDENCE_TIERS.length).toBe(4);
    expect(MEKONG_PROVINCES.length).toBe(13);
    expect(STUDY_AREAS.length).toBe(3);
    expect(SCIENTIFIC_QA_ITEMS.length).toBeGreaterThanOrEqual(4);
  });

  it('passes all 10 compatibility gates for the verified Oct 22 -> Nov 03 pair in An Giang', () => {
    const res = evaluatePairCompatibility(
      'G4404304390-ASF',
      'G4410154671-ASF',
      'angiang-screening'
    );
    expect(res.allPassed).toBe(true);
    expect(res.gates.length).toBe(10);
    expect(res.gates.every((g) => g.passed)).toBe(true);
  });

  it('blocks comparison fail-closed when the rejected Dong Thap pilot bbox (0% valid pixels) is active', () => {
    const res = evaluatePairCompatibility(
      'G4404304390-ASF',
      'G4410154671-ASF',
      'dongthap-pilot'
    );
    expect(res.allPassed).toBe(false);
    const gate9 = res.gates.find((g) => g.gateNumber === 9);
    const gate10 = res.gates.find((g) => g.gateNumber === 10);
    expect(gate9?.passed).toBe(false);
    expect(gate10?.passed).toBe(false);
  });

  it('blocks comparison when granules come from different tracks or reverse chronological order', () => {
    const reverse = evaluatePairCompatibility(
      'G4410154671-ASF',
      'G4404304390-ASF',
      'angiang-screening'
    );
    expect(reverse.allPassed).toBe(false);

    const crossTrack = evaluatePairCompatibility(
      'G4404304390-ASF',
      'G3931797250-ASF',
      'angiang-screening'
    );
    expect(crossTrack.allPassed).toBe(false);
  });

  it('records verified An Giang metrics within the 250 MB shared byte budget', () => {
    expect(VERIFIED_ANGIANG_PAIR_STATS.combinedBytesUsed).toBeLessThanOrEqual(
      VERIFIED_ANGIANG_PAIR_STATS.sharedTotalLimitBytes
    );
    expect(VERIFIED_ANGIANG_PAIR_STATS.commonValidPixels).toBe(1207740);
    expect(VERIFIED_ANGIANG_PAIR_STATS.commonValidFraction).toBeGreaterThan(0.999);
    expect(ACQUISITIONS[0].maturity).toBe('VALIDATED');
    expect(ACQUISITIONS[1].maturity).toBe('VALIDATED');
  });

  it('computes bbox intersections and area estimates accurately', () => {
    expect(
      bboxesIntersect([104.95, 10.45, 105.05, 10.55], [103.52, 8.85, 106.15, 11.45])
    ).toBe(true);
    expect(
      bboxesIntersect([104.95, 10.45, 105.05, 10.55], [106.5, 10.5, 106.8, 10.9])
    ).toBe(false);
    const area = estimateBboxAreaKm2([104.95, 10.45, 105.05, 10.55]);
    expect(area).toBeGreaterThan(115);
    expect(area).toBeLessThan(125);
  });
});
