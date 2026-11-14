import type { Language } from '../i18n/translations';
import type { CatalogGranule } from './catalogInventory';
import {
  ACQUISITIONS,
  EVIDENCE_STATES,
  PROVENANCE,
  VERIFIED_ANGIANG_PAIR_STATS,
  VISUALIZATION_THRESHOLD_PRESETS,
  evaluatePairCompatibility,
  getAreaEvidenceStatus,
  type EvidenceStateId,
  type StudyAreaId,
  type StudyAreaPreset,
  type VisualizationThresholdId,
} from './study';

export type CompatibilityReport = ReturnType<typeof evaluatePairCompatibility>;

export interface ScreeningReceiptInput {
  areaId: StudyAreaId;
  displayArea: StudyAreaPreset;
  beforeGranule: CatalogGranule | undefined;
  afterGranule: CatalogGranule | undefined;
  compatibility: CompatibilityReport;
  thresholdId: VisualizationThresholdId;
  language: Language;
  mode: 'explore' | 'research';
  generatedAtUtc?: string;
}

export interface ScreeningReceiptPayload {
  receipt_schema: 'nisar-changelens-receipt/v1';
  application: string;
  tagline: string;
  team: string;
  repository: string;
  generated_at_utc: string;
  ui_context: {
    language: Language;
    mode: 'explore' | 'research';
    active_visualization_threshold: VisualizationThresholdId;
  };
  selected_aoi: {
    id: StudyAreaId;
    label: string;
    province: string;
    bbox_wgs84: [number, number, number, number];
    area_km2: number;
    evidence_tier: string;
    valid_coverage_pct: number | null;
    common_valid_pixels: number | null;
    total_pixels: number | null;
  };
  evidence_states: {
    active_coverage_state: EvidenceStateId;
    active_comparison_state: EvidenceStateId;
    taxonomy_definitions: Array<{
      state: EvidenceStateId;
      label: string;
      meaning: string;
    }>;
  };
  selected_pair: {
    before: {
      concept_id: string;
      granule_id: string | null;
      date_utc: string | null;
      collection: string | null;
      maturity: string | null;
      track: number | null;
      frame: number | null;
      direction: string | null;
      crid: string | null;
    };
    after: {
      concept_id: string;
      granule_id: string | null;
      date_utc: string | null;
      collection: string | null;
      maturity: string | null;
      track: number | null;
      frame: number | null;
      direction: string | null;
      crid: string | null;
    };
    interval_days: number | null;
    compatibility_level: string;
    all_gates_passed: boolean;
    passed_gates_count: number;
    failed_gates_count: number;
    summary_reason: string;
    gates: Array<{
      gate_number: number;
      rule_id: string;
      name: string;
      passed: boolean;
      observed: string;
    }>;
  };
  verified_quantitative_metrics: {
    evidence_state: 'COMPUTED';
    analysis_domain: string;
    methodology_formula: string;
    speckle_filter: string;
    polarization_analyzed: string;
    grid_crs: string;
    pixel_spacing_m: number;
    window_shape_pixels: readonly [number, number];
    valid_analyzed_pixels: number;
    excluded_invalid_pixels: number;
    valid_area_km2: number;
    before_smoothed_mean_db: number;
    before_raw_mean_db: number;
    after_smoothed_mean_db: number;
    after_raw_mean_db: number;
    delta_db: {
      mean: number;
      median: number;
      p05: number;
      p95: number;
      std: number;
    };
    baseline_3db_classes: {
      decrease_lte_minus3db_pixels: number;
      decrease_area_km2: number;
      decrease_pct: number;
      stable_within_3db_pixels: number;
      stable_area_km2: number;
      stable_pct: number;
      increase_gte_plus3db_pixels: number;
      increase_area_km2: number;
      increase_pct: number;
    };
    active_threshold_view: {
      id: VisualizationThresholdId;
      threshold_db: number | null;
      decrease_area_km2: number;
      decrease_pct: number;
      stable_area_km2: number;
      stable_pct: number;
      increase_area_km2: number;
      increase_pct: number;
    };
  } | null;
  provenance_and_byte_budget: {
    scope_note: string;
    budget_cap_bytes: number;
    stage1_mask_bytes_used: number;
    stage2_backscatter_bytes_used: number;
    combined_bytes_used: number;
    budget_used_pct: number;
    remaining_budget_bytes: number;
    verified_release_checksums_sha256: ReadonlyArray<{
      name: string;
      bytes: number;
      sha256: string;
    }> | null;
  };
  interpretation_and_limitations: {
    classification_disclaimer: string;
    level_1_observed_change: string;
    level_2_inferred_hypotheses: string[];
    level_3_unavailable_external_evidence: string[];
    known_qa_notes: string[];
    fabricated_confidence_score: null;
  };
}

export function buildScreeningReceiptPayload(
  input: ScreeningReceiptInput
): ScreeningReceiptPayload {
  const {
    areaId,
    displayArea,
    beforeGranule,
    afterGranule,
    compatibility,
    thresholdId,
    language,
    mode,
    generatedAtUtc = new Date().toISOString(),
  } = input;
  const pickText = (en: string, vi: string) => (language === 'vi' ? vi : en);
  const evidenceStatus = getAreaEvidenceStatus(areaId, compatibility.allPassed);
  const isVerifiedComparisonActive =
    areaId === 'angiang-screening' && compatibility.allPassed;

  const thresholdPreset =
    VISUALIZATION_THRESHOLD_PRESETS.find((p) => p.id === thresholdId) ??
    VISUALIZATION_THRESHOLD_PRESETS[0];

  const passedCount = compatibility.gates.filter((g) => g.passed).length;

  return {
    receipt_schema: 'nisar-changelens-receipt/v1',
    application: 'NISAR ChangeLens',
    tagline: 'See Change. Understand Earth.',
    team: '4/K (NASA Space Apps Challenge 2026 — Hanoi, Vietnam)',
    repository: 'https://github.com/4kShi/nisar-changelens',
    generated_at_utc: generatedAtUtc,
    ui_context: {
      language,
      mode,
      active_visualization_threshold: thresholdId,
    },
    selected_aoi: {
      id: areaId,
      label: pickText(displayArea.label, displayArea.label_vi),
      province: displayArea.province,
      bbox_wgs84: displayArea.bbox,
      area_km2: displayArea.areaKm2,
      evidence_tier: displayArea.evidenceTier,
      valid_coverage_pct: displayArea.validCoveragePct,
      common_valid_pixels: displayArea.commonValidPixels,
      total_pixels: displayArea.totalPixels,
    },
    evidence_states: {
      active_coverage_state: evidenceStatus.coverageState,
      active_comparison_state: evidenceStatus.comparisonState,
      taxonomy_definitions: EVIDENCE_STATES.map((ev) => ({
        state: ev.id,
        label: pickText(ev.label, ev.label_vi),
        meaning: pickText(ev.summary, ev.summary_vi),
      })),
    },
    selected_pair: {
      before: {
        concept_id: beforeGranule?.conceptId ?? 'unknown',
        granule_id: beforeGranule?.granuleId ?? null,
        date_utc: beforeGranule?.startUtc ?? null,
        collection: beforeGranule?.collection ?? null,
        maturity: beforeGranule?.maturity ?? null,
        track: beforeGranule?.track ?? null,
        frame: beforeGranule?.frame ?? null,
        direction: beforeGranule?.direction ?? null,
        crid: beforeGranule?.crid ?? null,
      },
      after: {
        concept_id: afterGranule?.conceptId ?? 'unknown',
        granule_id: afterGranule?.granuleId ?? null,
        date_utc: afterGranule?.startUtc ?? null,
        collection: afterGranule?.collection ?? null,
        maturity: afterGranule?.maturity ?? null,
        track: afterGranule?.track ?? null,
        frame: afterGranule?.frame ?? null,
        direction: afterGranule?.direction ?? null,
        crid: afterGranule?.crid ?? null,
      },
      interval_days: compatibility.intervalDays,
      compatibility_level: compatibility.compatibilityLevel,
      all_gates_passed: compatibility.allPassed,
      passed_gates_count: passedCount,
      failed_gates_count: compatibility.gates.length - passedCount,
      summary_reason: pickText(
        compatibility.summaryReason,
        compatibility.summaryReason_vi
      ),
      gates: compatibility.gates.map((g) => ({
        gate_number: g.gateNumber,
        rule_id: g.id,
        name: pickText(g.name, g.name_vi),
        passed: g.passed,
        observed: pickText(g.observed, g.observed_vi),
      })),
    },
    verified_quantitative_metrics: isVerifiedComparisonActive
      ? {
          evidence_state: 'COMPUTED',
          analysis_domain:
            'Strictly limited to verified jointly valid pixels inside [104.95, 10.45, 105.05, 10.55].',
          methodology_formula:
            'gamma0_dB = 10 * log10(mean_linear_HHHH_5x5); delta_dB = after_dB - before_dB',
          speckle_filter:
            '5x5 normalized validity-aware boxcar on linear power (norm > 0.2)',
          polarization_analyzed: PROVENANCE.frequencyTerm,
          grid_crs: VERIFIED_ANGIANG_PAIR_STATS.crs,
          pixel_spacing_m: VERIFIED_ANGIANG_PAIR_STATS.pixelSpacingMeters,
          window_shape_pixels: VERIFIED_ANGIANG_PAIR_STATS.shape,
          valid_analyzed_pixels: VERIFIED_ANGIANG_PAIR_STATS.commonValidPixels,
          excluded_invalid_pixels: VERIFIED_ANGIANG_PAIR_STATS.excludedJoint,
          valid_area_km2: VERIFIED_ANGIANG_PAIR_STATS.areasKm2.validAnalyzed,
          before_smoothed_mean_db: ACQUISITIONS[0].meanDbInAnGiang,
          before_raw_mean_db: -9.793,
          after_smoothed_mean_db: ACQUISITIONS[1].meanDbInAnGiang,
          after_raw_mean_db: -9.317,
          delta_db: { ...VERIFIED_ANGIANG_PAIR_STATS.deltaDb },
          baseline_3db_classes: {
            decrease_lte_minus3db_pixels:
              VERIFIED_ANGIANG_PAIR_STATS.classes.decreasePixels,
            decrease_area_km2: VERIFIED_ANGIANG_PAIR_STATS.areasKm2.decreaseArea,
            decrease_pct: VERIFIED_ANGIANG_PAIR_STATS.classes.decreasePct,
            stable_within_3db_pixels:
              VERIFIED_ANGIANG_PAIR_STATS.classes.noSignificantChangePixels,
            stable_area_km2:
              VERIFIED_ANGIANG_PAIR_STATS.areasKm2.noSignificantChangeArea,
            stable_pct:
              VERIFIED_ANGIANG_PAIR_STATS.classes.noSignificantChangePct,
            increase_gte_plus3db_pixels:
              VERIFIED_ANGIANG_PAIR_STATS.classes.increasePixels,
            increase_area_km2: VERIFIED_ANGIANG_PAIR_STATS.areasKm2.increaseArea,
            increase_pct: VERIFIED_ANGIANG_PAIR_STATS.classes.increasePct,
          },
          active_threshold_view: {
            id: thresholdPreset.id,
            threshold_db: thresholdPreset.thresholdDb,
            decrease_area_km2: thresholdPreset.decreaseAreaKm2,
            decrease_pct: thresholdPreset.decreasePct,
            stable_area_km2: thresholdPreset.stableAreaKm2,
            stable_pct: thresholdPreset.stablePct,
            increase_area_km2: thresholdPreset.increaseAreaKm2,
            increase_pct: thresholdPreset.increasePct,
          },
        }
      : null,
    provenance_and_byte_budget: {
      scope_note: isVerifiedComparisonActive
        ? 'Verified two-stage HTTP Range HDF5 extraction for An Giang pair.'
        : 'Current selection has blocked or unextracted pixel comparison; repository An Giang ledger retained below for audit traceability only.',
      budget_cap_bytes: VERIFIED_ANGIANG_PAIR_STATS.sharedTotalLimitBytes,
      stage1_mask_bytes_used: VERIFIED_ANGIANG_PAIR_STATS.maskBytesUsed,
      stage2_backscatter_bytes_used:
        VERIFIED_ANGIANG_PAIR_STATS.backscatterBytesUsed,
      combined_bytes_used: VERIFIED_ANGIANG_PAIR_STATS.combinedBytesUsed,
      budget_used_pct: 13.53,
      remaining_budget_bytes: VERIFIED_ANGIANG_PAIR_STATS.remainingBudgetBytes,
      verified_release_checksums_sha256: isVerifiedComparisonActive
        ? VERIFIED_ANGIANG_PAIR_STATS.checksums
        : null,
    },
    interpretation_and_limitations: {
      classification_disclaimer:
        'Potential Surface Change screening receipt only. Not an operational flood warning, emergency dispatch product, or machine-learning classifier.',
      level_1_observed_change: isVerifiedComparisonActive
        ? 'Verified/Computed: Calibrated L-band HHHH gamma0 shifted +0.417 dB on average (median +0.240 dB) over 1,207,740 jointly valid pixels (120.77 km²) in An Giang between 2026-10-22 and 2026-11-03.'
        : `Unavailable for comparison: ${pickText(compatibility.summaryReason, compatibility.summaryReason_vi)}`,
      level_2_inferred_hypotheses: [
        'Inferred hypothesis only: Negative Δγ⁰ (≤ −3.0 dB) is consistent with specular reflection from smooth standing water, wet soil smoothing, or cleared crop cover.',
        'Inferred hypothesis only: Positive Δγ⁰ (≥ +3.0 dB) is consistent with stem–water double-bounce in flooded/emergent vegetation, increased canopy roughness, or moisture/tillage shifts.',
      ],
      level_3_unavailable_external_evidence: [
        'Cross-polarized HVHV covariance and HH/HV ratios (Unavailable in current Stage 2 slice)',
        'Cloud-free Sentinel-2 / Landsat optical NDWI/MNDWI verification (Unavailable / Not integrated)',
        'Mekong River Commission / provincial river & canal gauge levels (Unavailable)',
        'High-resolution DEM local incidence angle normalization around Núi Tô (Unavailable)',
        'Synchronized field crop calendar and inundation ground truth (Unavailable)',
      ],
      known_qa_notes: [
        'W-1: Per-date vs joint-mask 5x5 neighborhood support around 86 single-date mask=0 pixels shifts ±3.0 dB class areas by ≤0.01 km² and Δγ⁰ mean/median by 0.000 dB.',
        'W-2: Jensen inequality under Rayleigh speckle explains why raw unsmoothed single-pixel dB means (-9.793 / -9.317 dB) are ~1.05 dB below 5x5 smoothed dB means (-8.742 / -8.325 dB).',
      ],
      fabricated_confidence_score: null,
    },
  };
}

export function formatScreeningReceiptMarkdown(
  payload: ScreeningReceiptPayload,
  lang: Language
): string {
  const isVi = lang === 'vi';
  const lines: string[] = [];

  lines.push(
    isVi
      ? `# Biên bản Kiểm định & Nguồn gốc Dữ liệu — ${payload.application}`
      : `# Screening & Provenance Receipt — ${payload.application}`
  );
  lines.push(`> *${payload.tagline}* · ${payload.team}`);
  lines.push('');
  lines.push(`- **Schema**: \`${payload.receipt_schema}\``);
  lines.push(
    `- **${isVi ? 'Thời điểm xuất (UTC)' : 'Generated (UTC)'}**: \`${payload.generated_at_utc}\``
  );
  lines.push(`- **Repository**: ${payload.repository}`);
  lines.push(
    `- **${isVi ? 'Ngữ cảnh giao diện' : 'UI Context'}**: \`${payload.ui_context.language.toUpperCase()} | ${payload.ui_context.mode}\``
  );
  lines.push('');

  lines.push(isVi ? '## 1. Vùng Quan tâm & Trạng thái Bằng chứng' : '## 1. Selected AOI & Evidence States');
  lines.push(`- **AOI**: ${payload.selected_aoi.label} (\`${payload.selected_aoi.id}\`, ${payload.selected_aoi.province})`);
  lines.push(`- **WGS84 BBox**: \`[${payload.selected_aoi.bbox_wgs84.join(', ')}]\` (${payload.selected_aoi.area_km2} km²)`);
  lines.push(
    `- **${isVi ? 'Tầng Bằng chứng' : 'Evidence Tier'}**: \`${payload.selected_aoi.evidence_tier}\``
  );
  lines.push(
    `- **${isVi ? 'Vùng phủ hợp lệ' : 'Valid Coverage'}**: ${
      payload.selected_aoi.valid_coverage_pct !== null
        ? `${payload.selected_aoi.valid_coverage_pct.toFixed(2)}% (${payload.selected_aoi.common_valid_pixels?.toLocaleString()} / ${payload.selected_aoi.total_pixels?.toLocaleString()} px)`
        : isVi
          ? 'Chưa trích xuất raster (Candidate / Unavailable)'
          : 'Unverified raster subset (Candidate / Unavailable)'
    }`
  );
  lines.push(
    `- **${isVi ? 'Trạng thái Vùng phủ / So sánh' : 'Coverage / Comparison State'}**: \`${payload.evidence_states.active_coverage_state}\` / \`${payload.evidence_states.active_comparison_state}\``
  );
  lines.push('');

  lines.push(isVi ? '## 2. Cặp Quan sát & 10 Cổng Tương thích' : '## 2. Selected Acquisition Pair & 10 Compatibility Gates');
  lines.push(
    `- **Before**: \`${payload.selected_pair.before.concept_id}\` (${payload.selected_pair.before.date_utc ?? 'N/A'}, Track ${payload.selected_pair.before.track ?? '?'} Frame ${payload.selected_pair.before.frame ?? '?'}, CRID \`${payload.selected_pair.before.crid ?? '?'}\`)`
  );
  lines.push(
    `- **After**: \`${payload.selected_pair.after.concept_id}\` (${payload.selected_pair.after.date_utc ?? 'N/A'}, Track ${payload.selected_pair.after.track ?? '?'} Frame ${payload.selected_pair.after.frame ?? '?'}, CRID \`${payload.selected_pair.after.crid ?? '?'}\`)`
  );
  lines.push(
    `- **${isVi ? 'Kết quả Cổng' : 'Gate Result'}**: ${payload.selected_pair.passed_gates_count} / ${payload.selected_pair.gates.length} PASSED (\`${payload.selected_pair.compatibility_level}\`)`
  );
  lines.push(`- **${isVi ? 'Tóm tắt' : 'Summary'}**: ${payload.selected_pair.summary_reason}`);
  lines.push('');
  lines.push('| # | Rule ID | Gate | Status | Observed |');
  lines.push('|---|---|---|---|---|');
  for (const g of payload.selected_pair.gates) {
    lines.push(
      `| ${g.gate_number} | \`${g.rule_id}\` | ${g.name} | **${g.passed ? 'PASS' : 'BLOCKED'}** | ${g.observed} |`
    );
  }
  lines.push('');

  lines.push(isVi ? '## 3. Số liệu Đã tính toán (Computed Metrics)' : '## 3. Computed Quantitative Metrics');
  if (payload.verified_quantitative_metrics) {
    const m = payload.verified_quantitative_metrics;
    lines.push(`- **State**: \`${m.evidence_state}\` · ${m.analysis_domain}`);
    lines.push(`- **Formula**: \`${m.methodology_formula}\``);
    lines.push(`- **Filter**: ${m.speckle_filter} · **Grid**: \`${m.grid_crs}\` (${m.pixel_spacing_m} m, \`${m.window_shape_pixels[0]}×${m.window_shape_pixels[1]}\`)`);
    lines.push(`- **Valid Support**: ${m.valid_analyzed_pixels.toLocaleString()} px (${m.valid_area_km2} km²); Excluded: ${m.excluded_invalid_pixels.toLocaleString()} px`);
    lines.push(`- **Before Mean (5×5 Smoothed / Raw)**: ${m.before_smoothed_mean_db} dB / ${m.before_raw_mean_db} dB`);
    lines.push(`- **After Mean (5×5 Smoothed / Raw)**: ${m.after_smoothed_mean_db} dB / ${m.after_raw_mean_db} dB`);
    lines.push(
      `- **Δγ⁰ dB**: Mean \`+${m.delta_db.mean} dB\`, Median \`+${m.delta_db.median} dB\`, P05–P95 \`[${m.delta_db.p05}, +${m.delta_db.p95}] dB\`, Std \`${m.delta_db.std} dB\``
    );
    lines.push(
      `- **Baseline ±3.0 dB Breakdown**: Decrease ${m.baseline_3db_classes.decrease_area_km2} km² (${m.baseline_3db_classes.decrease_pct}%), Stable ${m.baseline_3db_classes.stable_area_km2} km² (${m.baseline_3db_classes.stable_pct}%), Increase ${m.baseline_3db_classes.increase_area_km2} km² (${m.baseline_3db_classes.increase_pct}%)`
    );
    lines.push(
      `- **Active UI View (\`${m.active_threshold_view.id}\`)**: Decrease ${m.active_threshold_view.decrease_area_km2} km² (${m.active_threshold_view.decrease_pct}%), Stable ${m.active_threshold_view.stable_area_km2} km² (${m.active_threshold_view.stable_pct}%), Increase ${m.active_threshold_view.increase_area_km2} km² (${m.active_threshold_view.increase_pct}%)`
    );
  } else {
    lines.push(
      isVi
        ? '- **UNAVAILABLE**: So sánh điểm ảnh đã bị chặn bởi cổng kiểm định hoặc khu vực hiện tại chưa trích xuất dữ liệu raster HDF5 cục bộ. Không tạo số liệu suy diễn giả.'
        : '- **UNAVAILABLE**: Pixel comparison is blocked by compatibility gates or unextracted for the current AOI. Zero synthetic comparison metrics were fabricated.'
    );
  }
  lines.push('');

  lines.push(isVi ? '## 4. Giới hạn Khoa học & Bằng chứng Chưa khả dụng' : '## 4. Scientific Limitations & Unavailable Evidence');
  lines.push(`- **Disclaimer**: ${payload.interpretation_and_limitations.classification_disclaimer}`);
  lines.push(`- **Level 1**: ${payload.interpretation_and_limitations.level_1_observed_change}`);
  for (const h of payload.interpretation_and_limitations.level_2_inferred_hypotheses) {
    lines.push(`- **Level 2 (${isVi ? 'Suy luận' : 'Inferred'})**: ${h}`);
  }
  for (const u of payload.interpretation_and_limitations.level_3_unavailable_external_evidence) {
    lines.push(`- **Level 3 (${isVi ? 'Không khả dụng' : 'Unavailable'})**: ${u}`);
  }
  lines.push(`- **Synthetic / AI Confidence Score**: \`null\` (${isVi ? 'Không tạo độ tin cậy giả' : 'Never fabricated without ground truth'})`);
  lines.push('');

  lines.push(isVi ? '## 5. Sổ cái Ngân sách HTTP Range & Kiểm tra Toàn vẹn' : '## 5. HTTP Range Byte Budget & Integrity Ledger');
  lines.push(
    `- **Budget Used**: ${payload.provenance_and_byte_budget.combined_bytes_used.toLocaleString()} / ${payload.provenance_and_byte_budget.budget_cap_bytes.toLocaleString()} bytes (${payload.provenance_and_byte_budget.budget_used_pct}%)`
  );
  lines.push(`- **Note**: ${payload.provenance_and_byte_budget.scope_note}`);
  if (payload.provenance_and_byte_budget.verified_release_checksums_sha256) {
    lines.push('');
    lines.push('| File | Bytes | SHA-256 |');
    lines.push('|---|---:|---|');
    for (const c of payload.provenance_and_byte_budget.verified_release_checksums_sha256) {
      lines.push(`| \`${c.name}\` | ${c.bytes.toLocaleString()} | \`${c.sha256}\` |`);
    }
  }
  lines.push('');

  return lines.join('\n');
}
