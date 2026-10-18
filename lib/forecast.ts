export interface Forecast { id: string; metric: string; predicted: number; lower: number; upper: number; horizon: string; confidence: number }
export function confidenceInterval(predicted: number, variance: number, z: number): { lower: number; upper: number } {
  return { lower: predicted - z * variance, upper: predicted + z * variance };
}
export function formatForecast(f: Forecast): string { return `${f.metric}: ${f.predicted} (${f.confidence*100}% CI: ${f.lower}-${f.upper}) [${f.horizon}]`; }