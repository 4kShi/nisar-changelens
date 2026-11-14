import { describe, expect, it } from 'vitest';
import {
  ACQUISITIONS,
  EVIDENCE_TIERS,
  MEKONG_PROVINCES,
  SCIENTIFIC_QA_ITEMS,
  STUDY_AREAS,
  VERIFIED_ANGIANG_PAIR_STATS,
  VISUALIZATION_THRESHOLD_PRESETS,
  bboxesIntersect,
  discoverCompatiblePairs,
  estimateBboxAreaKm2,
  evaluatePairCompatibility,
  normalizeChronologicalPair,
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

  it('automatically normalizes reversed chronological granule selections into Earlier -> Later order', () => {
    const reversed = normalizeChronologicalPair('G4410154671-ASF', 'G4404304390-ASF');
    expect(reversed.earlierConceptId).toBe('G4404304390-ASF');
    expect(reversed.laterConceptId).toBe('G4410154671-ASF');
    expect(reversed.wasSwapped).toBe(true);

    const chronological = normalizeChronologicalPair('G4404304390-ASF', 'G4410154671-ASF');
    expect(chronological.earlierConceptId).toBe('G4404304390-ASF');
    expect(chronological.laterConceptId).toBe('G4410154671-ASF');
    expect(chronological.wasSwapped).toBe(false);
  });

  it('discovers all 22 repeat-pass compatible pairs across the 29 catalog granules with 3-tier classification', () => {
    const pairs = discoverCompatiblePairs('angiang-screening', [104.95, 10.45, 105.05, 10.55]);
    expect(pairs.length).toBe(22);

    // Top pair must be the Level 3 Raster-Verified An Giang pair (G4404304390-ASF -> G4410154671-ASF)
    expect(pairs[0].earlier.conceptId).toBe('G4404304390-ASF');
    expect(pairs[0].later.conceptId).toBe('G4410154671-ASF');
    expect(pairs[0].compatibilityLevel).toBe('LEVEL_3_RASTER_VERIFIED');
    expect(pairs[0].cridPolicyStatus).toBe('IDENTICAL_VALIDATED_CRID');
    expect(pairs[0].intervalDays).toBe(12);

    // Second pair must be the Level 2 Validated CRID P05036 pair on Track 148 Frame 84
    const t148f84Validated = pairs.find(
      (p) =>
        p.earlier.conceptId === 'G4410568072-ASF' && p.later.conceptId === 'G4410081861-ASF'
    );
    expect(t148f84Validated).toBeDefined();
    expect(t148f84Validated?.compatibilityLevel).toBe('LEVEL_2_GEOMETRIC_CANDIDATE');
    expect(t148f84Validated?.cridPolicyStatus).toBe('IDENTICAL_VALIDATED_CRID');
    expect(t148f84Validated?.track).toBe(148);
    expect(t148f84Validated?.frame).toBe(84);

    // Verify evaluation of Level 2 Validated CRID candidate passes all 7 metadata/geometry gates
    const evalLevel2 = evaluatePairCompatibility(
      'G4410568072-ASF',
      'G4410081861-ASF',
      'mekong'
    );
    expect(evalLevel2.compatibilityLevel).toBe('LEVEL_2_GEOMETRIC_CANDIDATE');
    expect(evalLevel2.cridPolicyStatus).toBe('IDENTICAL_VALIDATED_CRID');
    expect(evalLevel2.gates.slice(0, 7).every((g) => g.passed)).toBe(true);
  });

  it('preserves exact pixel counts across all visualization threshold presets (sum = 1,207,740)', () => {
    for (const preset of VISUALIZATION_THRESHOLD_PRESETS) {
      const total = preset.decreasePixels + preset.stablePixels + preset.increasePixels;
      expect(total).toBe(1207740);
    }
    const refPreset = VISUALIZATION_THRESHOLD_PRESETS.find((p) => p.id === '3.0');
    expect(refPreset?.isReferenceBaseline).toBe(true);
    expect(refPreset?.decreaseAreaKm2).toBe(0.29);
    expect(refPreset?.stableAreaKm2).toBe(116.09);
    expect(refPreset?.increaseAreaKm2).toBe(4.39);
  });
});
