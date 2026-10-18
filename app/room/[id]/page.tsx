"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [metric, setMetric] = useState('');
  const [predicted, setPredicted] = useState('');
  const [variance, setVariance] = useState('');
  const [horizon, setHorizon] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://forecastroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'forecast') {
        setForecasts(prev => {
          const idx = prev.findIndex(f => f.id === data.data.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = data.data; return n; }
          return [...prev, data.data];
        });
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://forecastroom.devdynamo713.com/room/${params.id}/forecasts`);
      if (res.ok) setForecasts(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addForecast = async () => {
    const pred = parseFloat(predicted);
    const v = parseFloat(variance);
    const ci = { lower: pred - 1.96 * v, upper: pred + 1.96 * v };
    const data = { id: Date.now().toString(), metric, predicted: pred, lower: ci.lower, upper: ci.upper, horizon, confidence: 0.95 };
    await fetch(`https://forecastroom.devdynamo713.com/room/${params.id}/forecast`, { method: 'POST', body: JSON.stringify(data) });
    setMetric(''); setPredicted(''); setVariance(''); setHorizon('');
  };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>ForecastRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="metric" className="metric-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={predicted} onChange={(e) => setPredicted(e.target.value)} placeholder="predicted" className="pred-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <input value={variance} onChange={(e) => setVariance(e.target.value)} placeholder="variance" className="var-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <input value={horizon} onChange={(e) => setHorizon(e.target.value)} placeholder="horizon (e.g. 30d)" className="horizon-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addForecast} disabled={!metric.trim() || !predicted || !variance || !horizon.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Forecast</button>
      </div>
      <div className="forecast-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {forecasts.map(f => (
          <div key={f.id} style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18 }}>{f.metric}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Predicted: {f.predicted}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>95% CI: {f.lower.toFixed(1)} - {f.upper.toFixed(1)}</div>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Horizon: {f.horizon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}