'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RequestTypesChart({ distribution = [], totalRequests = 0 }) {
  const COLOR_PALETTE = [
    '#2563eb', // Blue
    '#9333ea', // Purple
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  const chartData = {
    labels: distribution.map((item) => item.name),
    datasets: [
      {
        data: distribution.map((item) => item.count || 0),
        backgroundColor: distribution.map((_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
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
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const item = distribution[idx];
            return ` ${item.name}: ${item.count} đơn (${item.percentage}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Tỷ lệ các loại đơn phổ biến
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {distribution.length} loại đơn
          </span>
        </div>

        {totalRequests === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Chưa có dữ liệu đơn yêu cầu trên hệ thống
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Vòng Doughnut Chart.js */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <Doughnut data={chartData} options={chartOptions} />
              {/* Con số tổng ở tâm vòng tròn */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 leading-none">
                  {totalRequests}
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  Tổng đơn
                </span>
              </div>
            </div>

            {/* Chú giải chi tiết */}
            <div className="flex-1 w-full space-y-3">
              {distribution.map((item, idx) => {
                const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                return (
                  <div key={item.id || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-700 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900">{item.percentage}%</span>
                        <span className="text-slate-400">({item.count} đơn)</span>
                      </div>
                    </div>
                    {/* Thanh tỷ lệ mini */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        * Biểu đồ Doughnut Chart.js hiển thị tỷ trọng đơn theo thời gian thực
      </div>
    </div>
  );
}
