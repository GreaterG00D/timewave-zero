'use client';

import { useState, useMemo } from 'react';
import { generateRecursiveWave } from '@/lib/timewave/recursiveWave';
import { computeBaseWave } from '@/lib/timewave/differenceWave';
import { kingWenSequence } from '@/lib/timewave/kingWen';
import { mapWaveToDates } from '@/lib/timewave/dateMapper';
import { hexagramInfo } from '@/lib/timewave/hexagramData';
import DatePicker from 'react-datepicker';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const TABS = ['Wen Sequence', 'Difference Wave', 'Recursive Timewave'] as const;
type TabLabel = typeof TABS[number];

const infoMap: Record<TabLabel, string> = {
  'Wen Sequence': `This chart shows the 64 hexagrams of the I Ching arranged in a specific sequence called the "King Wen order." A hexagram is a symbol made of six stacked lines — each line is either solid (like a dash: —) or broken (like this: – –). Each one is like a snapshot of change or a situation in life. In McKenna's theory, these hexagrams are turned into 6-digit binary codes using 1s for solid lines and 0s for broken lines. For example, the hexagram ☰☰ (all solid lines) becomes 111111, and ☷☷ (all broken) becomes 000000. This sequence forms the symbolic "DNA" that McKenna believed underlies patterns of time and change.`,

  'Difference Wave': `This graph shows how much each hexagram changes from the next one. It counts how many of the six lines (or bits in binary) are different between two symbols in the King Wen sequence. For example, if one hexagram is 111111 and the next is 000000, that's 6 changes. If two hexagrams are more similar, the difference is smaller — maybe just 1 or 2. These differences form a wave of values between 0 and 6. McKenna believed this wave reflects the "intensity of change" between symbolic states — and it's the raw material for generating the larger Timewave.`,

  'Recursive Timewave': `This graph is the final Timewave — the one that McKenna believed maps actual history. It's made by repeating and compressing the difference wave many times over, like zooming in on a pattern that repeats at every scale. The curve is anchored to a real date in time (called the zero point, like 2012-12-21), and the timeline counts backward from there. Lower parts of the wave mean more novelty — newness, breakthroughs, surprises, disruption. Higher parts mean repetition, structure, routine. McKenna believed this pattern shaped world events, and that humanity was spiraling toward a final, total novelty point where something radically new would emerge.`
};

const Timewave = () => {
  const [activeTab, setActiveTab] = useState<TabLabel>('Recursive Timewave');
  const [zeroDate, setZeroDate] = useState(new Date('2012-12-21'));

  const wenSequence = useMemo(() => kingWenSequence.map((hex, i) => ({
    label: `${i + 1}`,
    value: parseInt(hex, 2),
    ...hexagramInfo[i],
  })), []);

  const differenceWave = useMemo(() => computeBaseWave(), []);
  const recursiveWave = useMemo(() => mapWaveToDates(generateRecursiveWave(10), zeroDate, 1), [zeroDate]);

  const chartColors = {
    wenSequence: '#0a84ff',
    differenceWave: '#ff453a',
    recursiveWave: '#30d158',
    grid: 'rgba(255, 255, 255, 0.1)',
  };

  const chartFont = {
    family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1c1e',
        titleColor: '#fff',
        bodyColor: '#d1d1d6',
        borderColor: '#3a3a3c',
        borderWidth: 1,
        titleFont: { ...chartFont, size: 14, weight: 600 },
        bodyFont: { ...chartFont, size: 12 },
        displayColors: false,
        padding: 10,
        cornerRadius: 4,
      }
    },
    scales: {
      x: {
        grid: { color: chartColors.grid, drawBorder: false },
        ticks: { color: '#8e8e93', font: { ...chartFont, size: 12 } }
      },
      y: {
        grid: { color: chartColors.grid, drawBorder: false },
        ticks: { color: '#8e8e93', font: { ...chartFont, size: 12 } },
        beginAtZero: true
      }
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 2, hoverRadius: 4 }
    }
  };

  const renderChart = () => {
    if (activeTab === 'Wen Sequence') {
      return (
        <Line
          data={{
            labels: Array.from({ length: 64 }, (_, i) => `${i + 1}`),
            datasets: [{
              data: wenSequence.map((h) => h.value),
              borderColor: chartColors.wenSequence,
              backgroundColor: `${chartColors.wenSequence}10`,
              tension: 0.25,
              fill: true,
            }]
          }}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                    title: (items) => {
                      const hex = wenSequence[items[0].dataIndex];
                      return `#${hex.number}: ${hex.name}`;
                    },
                    label: (items) => {
                      const hex = wenSequence[items.dataIndex];
                      return `${hex.symbol} | Binary: ${hex.binary}`;
                    }
                  }
              }
            }
          }}
        />
      );
    }

    if (activeTab === 'Difference Wave') {
      return (
        <Line
          data={{
            labels: Array.from({ length: 63 }, (_, i) => `${i + 1}`),
            datasets: [{
              data: differenceWave,
              borderColor: chartColors.differenceWave,
              backgroundColor: `${chartColors.differenceWave}10`,
              tension: 0.25,
              fill: true,
            }]
          }}
          options={commonOptions}
        />
      );
    }

    if (activeTab === 'Recursive Timewave') {
      return (
        <>
          <div className="mb-4 flex items-center">
            <label className="text-sm text-gray-400 mr-3">Zero Point:</label>
            <DatePicker
              selected={zeroDate}
              onChange={(date) => date && setZeroDate(date)}
              className="border border-gray-600 bg-gray-800 text-white px-3 py-2 rounded-md text-sm focus:ring focus:ring-blue-500"
            />
            <div className="ml-auto text-xs text-gray-500 italic">
              Lower values = greater novelty
            </div>
          </div>
          <Line
            data={{
              labels: recursiveWave.map((p) => p.date),
              datasets: [{
                data: recursiveWave.map((p) => p.value),
                borderColor: chartColors.recursiveWave,
                backgroundColor: `${chartColors.recursiveWave}10`,
                tension: 0.25,
                fill: true,
              }]
            }}
            options={commonOptions}
          />
        </>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans" style={{ fontFamily: chartFont.family }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-light tracking-tight mb-4">Timewave Zero</h1>
          <p className="text-base text-gray-400 leading-relaxed mb-2">
            Explore Terence McKenna&apos;s theory of fractal time. Visualizations are built on the 64 I Ching hexagrams and their recursive transformations.
          </p>
        </header>

        <nav className="flex gap-4 border-b border-gray-800 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm ${activeTab === tab ? 'text-white border-b-2 border-white font-medium' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="bg-gray-900 p-5 rounded-md mb-6 text-sm text-gray-300 leading-relaxed">
          {infoMap[activeTab]}
        </section>

        <section className="relative w-full h-[600px] bg-white border border-gray-800 rounded-lg overflow-hidden">
          {renderChart()}
        </section>

        <footer className="mt-10 text-center text-xs text-gray-500">
          &copy; 2025 Timewave Explorer. Inspired by McKenna. Built for the curious.
        </footer>
      </div>
    </main>
  );
};

export default Timewave;