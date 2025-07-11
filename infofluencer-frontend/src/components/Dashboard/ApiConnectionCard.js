import React from 'react';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

export default function ApiConnectionCard({
  icon,
  title,
  description,
  status,
  summary,
  aiScore,
  onConnect,
  onDisconnect,
  connected,
  infoText,
  proOnly,
}) {
  return (
    <div className="p-5 rounded-2xl shadow border bg-white flex flex-col gap-2 relative">
      {proOnly && (
        <span className="absolute top-2 right-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">PRO</span>
      )}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-bold text-lg">{title}</span>
      </div>
      <div className="text-sm text-gray-500">{description}</div>
      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || ''}`}>
        {status === 'active' && 'Bağlantı aktif'}
        {status === 'waiting' && 'Bağlantı bekliyor'}
        {status === 'error' && 'Hata oluştu'}
      </div>
      {summary && (
        <div className="text-xs text-gray-700 mt-1">
          <b>Özet:</b> {summary}
        </div>
      )}
      {aiScore !== undefined && aiScore !== null && (
        <div className="text-xs text-blue-700 mt-1">
          <b>AI Uyum Skoru:</b> %{aiScore}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        {connected ? (
          <button
            onClick={onDisconnect}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Bağlantıyı Kapat
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
          >
            Bağlan
          </button>
        )}
      </div>
      {infoText && (
        <div className="mt-2 text-xs text-gray-400 italic">
          <span title={infoText}>💡 {infoText}</span>
        </div>
      )}
    </div>
  );
} 