'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RequestsTimeChart({ weeklyStats = [], monthlyStats = [] }) {
  const [activeTab, setActiveTab] = useState('week'); // 'week' | 'month'

  const currentData = activeTab === 'week' ? weeklyStats : monthlyStats;
  const totalInPeriod = currentData.reduce((acc, cur) => acc + (cur.count || 0), 0);
  const maxVal = Math.max(...currentData.map((d) => d.count || 0), 4);

  const chartData = {
    labels: currentData.map((d) => d.label),
    datasets: [
      {
        label: 'Số lượng đơn',
        data: currentData.map((d) => d.count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const item = currentData[idx];
            const extra = item?.dateRange ? ` (${item.dateRange})` : '';
            return ` ${context.parsed.y} đơn yêu cầu${extra}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 12, weight: '500' },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxVal + 1,
        grid: {
          color: '#f1f5f9',
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800">
              Biểu đồ lượng đơn theo thời gian
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Tổng: {totalInPeriod} đơn
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'week'
              ? 'Số lượng đơn được tạo trong 4 tuần gần nhất'
              : 'Số lượng đơn được tạo trong 6 tháng gần nhất'}
          </p>
        </div>

        {/* Nút chuyển tab Tuần / Tháng */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'week'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo tuần
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'month'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo tháng
          </button>
        </div>
      </div>

      {/* Chart.js Bar Canvas */}
      <div className="h-64 w-full">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Footer ghi chú */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>* Biểu đồ dựng bằng Chart.js từ dữ liệu đơn thực tế trên hệ thống</span>
        <span className="font-medium text-slate-600">
          Mức cao nhất kỳ này: <strong className="text-slate-900">{Math.max(...currentData.map(d => d.count || 0))} đơn</strong>
        </span>
      </div>
    </div>
  );
}
