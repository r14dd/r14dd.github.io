export const vitals: { lcp: number | null; cls: number; fcp: number | null; inp: number | null } = {
  lcp: null, cls: 0, fcp: null, inp: null
};

try { new PerformanceObserver((l) => { for (const e of l.getEntries()) vitals.lcp = (e as any).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!(e as any).hadRecentInput) vitals.cls += (e as any).value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') vitals.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch {}
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) vitals.inp = Math.max(vitals.inp || 0, e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 }); } catch {}
