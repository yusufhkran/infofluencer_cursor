import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const barData = [
  { name: 'Mon', Follower: 1200 },
  { name: 'Tue', Follower: 1500 },
  { name: 'Wed', Follower: 1100 },
  { name: 'Thu', Follower: 1700 },
  { name: 'Fri', Follower: 1400 },
  { name: 'Sat', Follower: 2000 },
  { name: 'Sun', Follower: 1800 },
];

const pieData = [
  { name: 'TR', value: 60 },
  { name: 'DE', value: 25 },
  { name: 'UK', value: 15 },
];
const pieColors = ['#FF6A00', '#FFB347', '#1F1F1F'];

const AnalyticsCharts = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-orange-50 min-h-[220px]">
      <h3 className="text-lg font-bold text-[#FF6A00] mb-2">Analiz Grafikler</h3>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bar Chart */}
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-500 mb-2">Haftalık Takipçi Artışı</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="Follower" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" />
                  <stop offset="100%" stopColor="#FFB347" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-500 mb-2">Audience Ülke Dağılımı</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 