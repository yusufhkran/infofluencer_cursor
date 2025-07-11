import React from 'react';

const badgeColors = [
  'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
];

const AudienceBadges = ({ items }) => (
  <div className="flex flex-wrap gap-3 mt-2">
    {items.map((item, i) => (
      <span
        key={item.label}
        className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-200 ${badgeColors[i % badgeColors.length]}`}
      >
        {item.icon && <span className="mr-2 text-lg">{item.icon}</span>}
        <span className="font-medium">{item.label}:</span>
        <span className="ml-2 font-bold">{item.value}</span>
      </span>
    ))}
  </div>
);

export default AudienceBadges; 