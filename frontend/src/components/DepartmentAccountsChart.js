'use client';

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

export default function DepartmentAccountsChart({ departments = [], activeUsers = 0 }) {
  const maxVal = Math.max(...departments.map((d) => d.users || 0), 4);

  const chartData = {
    labels: departments.map((d) => d.name),
    datasets: [
      {
        label: 'Số tài khoản',
        data: departments.map((d) => d.users || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 24,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const dept = departments[idx];
            return ` ${context.parsed.x} tài khoản (${dept?.percentage || 0}%)`;
          },
        },
      },
    },
    scales: {
      x: {
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
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#475569',
          font: { size: 12, weight: '500' },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Số tài khoản theo phòng ban
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ nhân sự đang hoạt động trong toàn bộ công ty
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full shrink-0">
            {activeUsers} tài khoản
          </span>
        </div>

        {departments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Chưa có thông tin phòng ban
          </div>
        ) : (
          <div className="h-48 w-full pt-1">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        * Biểu đồ thanh ngang Chart.js tổng hợp theo thời gian thực từ danh bạ nhân sự
      </div>
    </div>
  );
}
