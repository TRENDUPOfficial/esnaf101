"use client";

export type PieSegment = {
  label: string;
  value: number;
  color: string;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ segments }: { segments: PieSegment[] }) {
  const total = segments.reduce((s, seg) => s + Math.abs(seg.value), 0);
  if (total === 0) return null;

  const cx = 80;
  const cy = 80;
  const r = 70;
  let currentAngle = 0;

  const paths = segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const slice = (seg.value / total) * 360;
      const path = arcPath(cx, cy, r, currentAngle, currentAngle + slice);
      const midAngle = currentAngle + slice / 2;
      currentAngle += slice;
      return { ...seg, path, midAngle };
    });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width={160} height={160} viewBox="0 0 160 160" className="shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} stroke="white" strokeWidth={1.5} />
        ))}
        <circle cx={cx} cy={cy} r={30} fill="white" className="dark:fill-gray-800" />
      </svg>

      <ul className="space-y-2 text-sm w-full">
        {segments
          .filter((s) => s.value > 0)
          .map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span
                  className="inline-block w-3 h-3 rounded-sm shrink-0"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {s.value.toFixed(2)} ₺
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
