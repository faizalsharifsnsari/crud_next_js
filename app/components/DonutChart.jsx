"use client";

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${cx} ${cy}
    L ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}
    Z
  `;
}

export default function PieChart({ title, data, centerLabel }) {
  let angle = 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
        {title}
      </h3>

      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((item, index) => {
          const sliceAngle = (item.percent / 100) * 360;
          const path = slicePath(100, 100, 80, angle, angle + sliceAngle);
          angle += sliceAngle;

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
            />
          );
        })}

        {/* Center label */}
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-800 text-lg font-bold"
        >
          {centerLabel}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-gray-700">
              {item.label} — {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
