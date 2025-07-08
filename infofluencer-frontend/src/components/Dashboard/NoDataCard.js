import React from "react";

// NoDataCard: Veri bulunamadığında gösterilen bilgi kartı.

/**
 * NoDataCard componenti, ilgili veri bulunamadığında kullanıcıya bilgi verir.
 */

const NoDataCard = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
    <Icon className="w-12 h-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4 text-center">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default NoDataCard;
