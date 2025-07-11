import React from 'react';

const colors = {
  Male: 'bg-blue-400',
  Female: 'bg-pink-400',
  Other: 'bg-green-400',
  F: 'bg-pink-400',
  M: 'bg-blue-400',
  U: 'bg-green-400',
};

const AudienceDemographyChart = ({ data, title }) => {
  // data: [{ label: 'F.18-24', value: 34047 }, { label: 'M.25-34', value: 98289 }, ...] veya [{ label: '18-24', value: 34047 }, ...] veya [{ label: 'F', value: 96287 }, ...]
  // 1. Yaş-cinsiyet kırılımı (F.18-24)
  const isAgeGender = data.some(item => item.label.includes('.'));
  const isOnlyAge = data.every(item => /^\d{2}-\d{2}$/.test(item.label) || /^\d{2}\+$/.test(item.label));
  const isOnlyGender = data.every(item => ['F', 'M', 'U', 'Male', 'Female', 'Other'].includes(item.label));

  // Grouped bar için yaş-cinsiyet kırılımı
  const processAgeGender = (rawData) => {
    const ageGenderMap = {};
    rawData.forEach(item => {
      const parts = item.label.split('.');
      if (parts.length === 2) {
        const gender = parts[0];
        const age = parts[1];
        if (!ageGenderMap[age]) {
          ageGenderMap[age] = { age, Male: 0, Female: 0, Other: 0, F: 0, M: 0, U: 0 };
        }
        ageGenderMap[age][gender] = item.value;
      }
    });
    return Object.values(ageGenderMap);
  };

  // Sadece yaş için
  const processOnlyAge = (rawData) => rawData.map(item => ({ age: item.label, value: item.value }));
  // Sadece gender için
  const processOnlyGender = (rawData) => rawData.map(item => ({ gender: item.label, value: item.value }));

  let chartContent = null;

  if (isAgeGender) {
    // Grouped bar: yaş-cinsiyet
    const processedData = processAgeGender(data);
    const max = Math.max(...processedData.flatMap(d => [d.F, d.M, d.U, d.Male, d.Female, d.Other]), 1);
    chartContent = (
      <div className="flex flex-col gap-3">
        {processedData.map((row, i) => (
          <div key={row.age} className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-600">{row.age}</span>
            {['F', 'M', 'U', 'Female', 'Male', 'Other'].map(gender => (
              row[gender] > 0 && (
                <div key={gender} className="flex items-center gap-1">
                  <div
                    className={`h-4 rounded ${colors[gender] || 'bg-gray-300'}`}
                    style={{ width: `${(row[gender] || 0) / max * 100}%`, minWidth: 6 }}
                    title={gender}
                  ></div>
                  <span className="text-xs text-gray-500">{row[gender] || 0}</span>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
    );
  } else if (isOnlyAge) {
    // Sadece yaş: bar chart
    const processedData = processOnlyAge(data);
    const max = Math.max(...processedData.map(d => d.value), 1);
    chartContent = (
      <div className="flex flex-col gap-3">
        {processedData.map((row, i) => (
          <div key={row.age} className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-600">{row.age}</span>
            <div className="flex-1 h-4 rounded bg-gray-100 relative">
              <div
                className="h-4 rounded bg-orange-400"
                style={{ width: `${(row.value / max) * 100}%`, minWidth: 6 }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{row.value}</span>
          </div>
        ))}
      </div>
    );
  } else if (isOnlyGender) {
    // Sadece gender: bar chart
    const processedData = processOnlyGender(data);
    const max = Math.max(...processedData.map(d => d.value), 1);
    chartContent = (
      <div className="flex flex-col gap-3">
        {processedData.map((row, i) => (
          <div key={row.gender} className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-600">{row.gender}</span>
            <div className="flex-1 h-4 rounded bg-gray-100 relative">
              <div
                className={`h-4 rounded ${colors[row.gender] || 'bg-gray-300'}`}
                style={{ width: `${(row.value / max) * 100}%`, minWidth: 6 }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{row.value}</span>
          </div>
        ))}
      </div>
    );
  } else {
    chartContent = <div className="text-xs text-gray-400">Veri yok veya desteklenmeyen format.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
      <div className="text-lg font-bold text-[#FF6A00] mb-3">{title}</div>
      {chartContent}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span><span className="inline-block w-3 h-3 rounded mr-1 bg-blue-400"></span>Male</span>
        <span><span className="inline-block w-3 h-3 rounded mr-1 bg-pink-400"></span>Female</span>
        <span><span className="inline-block w-3 h-3 rounded mr-1 bg-green-400"></span>Other</span>
      </div>
    </div>
  );
};

export default AudienceDemographyChart; 