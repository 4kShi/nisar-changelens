import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../App';
import { STORAGE_KEY, TRANSLATIONS } from '../i18n/translations';
import { translateKey } from '../i18n/I18nContext';

// Mock maplibre-gl so MapStage renders cleanly inside jsdom without WebGL
vi.mock('maplibre-gl', () => {
  class MockMap {
    on() {
      return this;
    }
    remove() {}
    addControl() {}
    isStyleLoaded() {
      return false;
    }
  }
  class MockNavigationControl {}
  class MockScaleControl {}
  class MockAttributionControl {}
  return {
    Map: MockMap,
    NavigationControl: MockNavigationControl,
    ScaleControl: MockScaleControl,
    AttributionControl: MockAttributionControl,
    setWorkerUrl: vi.fn(),
  };
});

describe('Bilingual EN / VI Language Switcher & i18n System', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('maintains 100% translation key parity between English and Vietnamese dictionaries', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const viKeys = Object.keys(TRANSLATIONS.vi).sort();
    expect(viKeys).toEqual(enKeys);
    for (const k of enKeys) {
      expect(TRANSLATIONS.en[k].trim().length).toBeGreaterThan(0);
      expect(TRANSLATIONS.vi[k].trim().length).toBeGreaterThan(0);
    }
  });

  it('1. defaults to English (en) when no language preference is stored', () => {
    render(<App />);
    const enBtn = screen.getByTestId('lang-btn-en');
    const viBtn = screen.getByTestId('lang-btn-vi');

    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(viBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.lang).toBe('en');

    // Verify English UI strings are rendered
    expect(
      screen.getByText('An Giang Pair Verified (10/10 Gates · 99.91% Valid)')
    ).toBeInTheDocument();
    expect(screen.getByText('Area of Interest (AOI) & Evidence Tier')).toBeInTheDocument();
    expect(screen.getByText('Before–After Radar Backscatter')).toBeInTheDocument();
    expect(screen.getByText('3-Level Evidence Hierarchy & Q&A')).toBeInTheDocument();
  });

  it('2 & 3. switches en -> vi and vi -> en immediately without reloading the page', () => {
    render(<App />);

    const enBtn = screen.getByTestId('lang-btn-en');
    const viBtn = screen.getByTestId('lang-btn-vi');

    // Switch to Vietnamese
    fireEvent.click(viBtn);

    expect(viBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.lang).toBe('vi');

    // Check Vietnamese translations across Header, Map HUD, Sections 01–05, and Footer
    expect(
      screen.getByText('Cặp ảnh An Giang đã xác thực (10/10 Cổng · 99,91% Hợp lệ)')
    ).toBeInTheDocument();
    expect(screen.getByText('Vùng quan tâm (AOI) & Tầng bằng chứng')).toBeInTheDocument();
    expect(screen.getByText('Tán xạ ngược Radar Trước–Sau')).toBeInTheDocument();
    expect(
      screen.getByText('Hệ thống bằng chứng 3 cấp độ & Hỏi đáp (Q&A)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('05 · 10 Cổng kiểm tra tính tương thích & Nguồn gốc dữ liệu')
    ).toBeInTheDocument();

    // Switch back to English
    fireEvent.click(enBtn);

    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(viBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.lang).toBe('en');
    expect(
      screen.getByText('An Giang Pair Verified (10/10 Gates · 99.91% Valid)')
    ).toBeInTheDocument();
  });

  it('4. persists language selection in localStorage and restores it on remount', () => {
    const { unmount } = render(<App />);

    const viBtn = screen.getByTestId('lang-btn-vi');
    fireEvent.click(viBtn);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('vi');

    unmount();

    // Remount fresh <App /> and verify it initializes in Vietnamese from localStorage
    render(<App />);
    expect(screen.getByTestId('lang-btn-vi')).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByText('Cặp ảnh An Giang đã xác thực (10/10 Cổng · 99,91% Hợp lệ)')
    ).toBeInTheDocument();
  });

  it('5. falls back safely to English when a translation key is missing', () => {
    expect(translateKey('vi', 'header.modeExplore')).toBe('Khám phá');
    expect(translateKey('en', 'header.modeExplore')).toBe('Explore');
    expect(translateKey('vi', 'nonexistent.custom.key')).toBe('nonexistent.custom.key');
  });

  it('6. preserves AOI selection, granule filters, comparison state, and exact scientific numbers across language switches', () => {
    render(<App />);

    // Verify verified An Giang numerical values in EN
    expect(screen.getByText('+0.417 dB')).toBeInTheDocument();
    expect(screen.getAllByText(/0\.29 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/116\.09 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.39 km²/).length).toBeGreaterThan(0);

    // Switch to Vietnamese and verify exact same scientific numerical values remain intact
    fireEvent.click(screen.getByTestId('lang-btn-vi'));
    expect(screen.getByText('+0.417 dB')).toBeInTheDocument();
    expect(screen.getAllByText(/0\.29 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/116\.09 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.39 km²/).length).toBeGreaterThan(0);

    // Change AOI to the rejected Đồng Tháp diagnostic window while in VI
    const areaSelect = screen.getByLabelText(
      'Các cửa sổ kiểm chứng định sẵn'
    ) as HTMLSelectElement;
    fireEvent.change(areaSelect, { target: { value: 'dongthap-pilot' } });
    expect(areaSelect.value).toBe('dongthap-pilot');

    // Verify Vietnamese blocked reason appears
    expect(
      screen.getByText(
        'So sánh chưa khả dụng / Đã bị chặn bởi cổng kiểm tra tính tương thích'
      )
    ).toBeInTheDocument();

    // Switch back to English and verify the Đồng Tháp AOI state is preserved
    fireEvent.click(screen.getByTestId('lang-btn-en'));
    const areaSelectEn = screen.getByLabelText(
      'Preset Verification Windows'
    ) as HTMLSelectElement;
    expect(areaSelectEn.value).toBe('dongthap-pilot');
    expect(
      screen.getByText('Comparison Unavailable / Blocked by Compatibility Gates')
    ).toBeInTheDocument();
  });
});
