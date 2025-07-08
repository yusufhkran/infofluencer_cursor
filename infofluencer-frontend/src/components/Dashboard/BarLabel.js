import React from "react";

// BarLabel: Bar grafiklerinde özel etiket gösterimi için kullanılır.

/**
 * BarLabel componenti, bar grafiklerinde değer ve kategori bilgisini gösterir.
 */

const BarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width + 5}
      y={y + 10}
      fill="#6B7280"
      fontSize={12}
      textAnchor="start"
    >
      {value}
    </text>
  );
};

export default BarLabel;
