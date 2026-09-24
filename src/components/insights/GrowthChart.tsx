import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';
import type { MonthlyCount } from '../../lib/selectors/stats';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface GrowthChartProps {
  data: MonthlyCount[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const isDark = document.documentElement.dataset.theme === 'dark';
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: '#7c5cfc',
            borderRadius: 4,
            maxBarThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: isDark ? '#91919e' : '#717180' } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: isDark ? '#91919e' : '#717180' },
            grid: { color: isDark ? '#303039' : '#eeeef0' },
          },
        },
      },
    };
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => chartRef.current?.destroy();
  }, [data]);

  return (
    <div style={{ height: 220 }}>
      <canvas ref={canvasRef} role="img" aria-label="Bookmarks added per month" />
    </div>
  );
}
