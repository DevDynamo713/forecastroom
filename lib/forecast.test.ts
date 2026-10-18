import { describe, it, expect } from 'vitest';
import { confidenceInterval, formatForecast } from './forecast';
describe('forecast', () => {
  it('computes 95% CI', () => {
    const ci = confidenceInterval(100, 10, 1.96);
    expect(ci.lower).toBeCloseTo(80.4);
    expect(ci.upper).toBeCloseTo(119.6);
  });
  it('computes 99% CI', () => {
    const ci = confidenceInterval(100, 10, 2.576);
    expect(ci.lower).toBeCloseTo(74.24);
    expect(ci.upper).toBeCloseTo(125.76);
  });
  it('formats correctly', () => {
    const f = { id: '1', metric: 'revenue', predicted: 1500, lower: 1400, upper: 1600, horizon: '30d', confidence: 0.95 };
    expect(formatForecast(f)).toBe('revenue: 1500 (95% CI: 1400-1600) [30d]');
  });
});