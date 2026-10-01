import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCountUp } from "./motion.jsx";

// Validated colorblind-safe status palette (light surface). See dataviz validator.
const STATUS_PALETTE = ["#0b7ea3", "#2f9e6b", "#d16f24", "#cc4136", "#7d54c9"];

// Semantic mapping so a state always reads the same colour across charts.
const STATUS_COLORS = {
  delivered: "#2f9e6b",
  shipped: "#0b7ea3",
  confirmed: "#0b7ea3",
  "in production": "#7d54c9",
  processing: "#7d54c9",
  pending: "#d16f24",
  cancelled: "#cc4136",
  canceled: "#cc4136",
  paid: "#2f9e6b",
  partial: "#d16f24",
  unpaid: "#cc4136",
  overdue: "#cc4136",
};

export function statusColor(name, index = 0) {
  return STATUS_COLORS[String(name).toLowerCase()] ?? STATUS_PALETTE[index % STATUS_PALETTE.length];
}

const AXIS_TICK = { fill: "#64748b", fontSize: 12 };
const GRID = "#eef2f1"; // recessive grid, lighter than slate-200

function truncate(value, max = 16) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function ChartTooltip({ active, payload, valueFormatter }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-[0_12px_32px_rgba(16,34,39,0.14)]">
      <p className="font-semibold capitalize text-ink">{item.name}</p>
      <p className="mt-0.5 text-slate-500">{valueFormatter(item.value)}</p>
    </div>
  );
}

// Left-aligned category/name tick (straight left edge, not right-aligned to the bars).
function AxisNameTick({ x, y, payload }) {
  return (
    <text dy={4} fill="#64748b" fontSize={12} textAnchor="start" x={2} y={y}>
      {truncate(payload.value, 18)}
    </text>
  );
}

export function HorizontalBars({ data, color, valueFormatter, highlightMax = true }) {
  const gid = useId().replace(/:/g, "");
  const maxIndex = useMemo(() => {
    if (!data?.length) return -1;
    return data.reduce((mi, d, i, a) => (d.value > a[mi].value ? i : mi), 0);
  }, [data]);

  if (!data?.length) {
    return null;
  }

  const peak = data[maxIndex];

  return (
    <div className="h-full min-h-[200px] w-full">
    <ResponsiveContainer height="100%" width="100%">
      <BarChart barCategoryGap="26%" data={data} layout="vertical" margin={{ bottom: 4, left: 6, right: 96, top: 4 }}>
        <defs>
          {/* horizontal fade -> full hue at the data end */}
          <linearGradient id={`${gid}-bar`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
          <linearGradient id={`${gid}-muted`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.42} />
          </linearGradient>
        </defs>
        <XAxis dataKey="value" domain={[0, "dataMax"]} hide type="number" />
        <YAxis
          axisLine={false}
          dataKey="name"
          interval={0}
          tick={<AxisNameTick />}
          tickLine={false}
          type="category"
          width={150}
        />
        <Tooltip
          content={<ChartTooltip valueFormatter={valueFormatter} />}
          cursor={{ fill: "rgba(16,34,39,0.04)" }}
        />
        <Bar
          animationBegin={150}
          animationDuration={700}
          background={{ fill: "#f1f5f4", radius: 9 }}
          barSize={18}
          dataKey="value"
          radius={[9, 9, 9, 9]}
        >
          {data.map((entry, index) => (
            <Cell
              fill={
                highlightMax
                  ? index === maxIndex
                    ? `url(#${gid}-bar)`
                    : `url(#${gid}-muted)`
                  : `url(#${gid}-bar)`
              }
              key={entry.name}
            />
          ))}
          <LabelList
            dataKey="value"
            fill="#334155"
            fontSize={11}
            fontWeight={600}
            formatter={valueFormatter}
            offset={12}
            position="right"
          />
        </Bar>
        {highlightMax && peak ? (
          <ReferenceDot fill={color} isFront r={4} stroke="#fff" strokeWidth={2} x={peak.value} y={peak.name} />
        ) : null}
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

// Floating rounded peak/tooltip pill (Pastis-style).
function PeakPill({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  const main = payload[0];
  return (
    <div className="-translate-y-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-[0_8px_20px_rgba(16,34,39,0.12)]">
      {valueFormatter(main.value)}
      <span className="ml-1.5 font-normal text-slate-400">{label}</span>
    </div>
  );
}

/**
 * Single-series gradient area trend (one card per metric — never dual-axis).
 * data: [{ label, orders, revenue }, ...]  dataKey: "revenue" | "orders"
 */
export function AreaTrend({ data, dataKey, color, valueFormatter = (v) => v.toLocaleString() }) {
  const gid = useId().replace(/:/g, "");
  const peak = useMemo(() => {
    if (!data?.length) return null;
    return data.reduce((m, d) => (d[dataKey] > m[dataKey] ? d : m), data[0]);
  }, [data, dataKey]);

  if (!data?.length) return null;

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 12, top: 24 }}>
          <defs>
            <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="55%" stopColor={color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis axisLine={false} dataKey="label" dy={6} interval="preserveStartEnd" tick={AXIS_TICK} tickLine={false} />
          <YAxis domain={[0, "dataMax + 5"]} hide />
          <Tooltip
            content={<PeakPill valueFormatter={valueFormatter} />}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4", strokeWidth: 1 }}
          />
          <Area
            activeDot={{ r: 5, fill: "#fff", stroke: color, strokeWidth: 3 }}
            animationDuration={900}
            animationEasing="ease-out"
            dataKey={dataKey}
            dot={false}
            fill={`url(#${gid}-fill)`}
            fillOpacity={1}
            stroke={color}
            strokeWidth={2.5}
            type="monotone"
          />
          {peak ? (
            <ReferenceDot fill={color} isFront r={4} stroke="#fff" strokeWidth={2} x={peak.label} y={peak[dataKey]} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ data, valueFormatter, totalLabel = "total" }) {
  const gid = useId().replace(/:/g, "");
  const total = useMemo(() => (data || []).reduce((sum, item) => sum + item.value, 0), [data]);
  const animatedTotal = useCountUp(total);

  if (!data?.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="h-[200px] w-full min-w-0 max-w-[220px] shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <defs>
              {data.map((item, index) => {
                const c = statusColor(item.name, index);
                return (
                  <linearGradient id={`${gid}-${index}`} key={item.name} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={1} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.82} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie
              animationDuration={900}
              cornerRadius={6}
              data={data}
              dataKey="value"
              innerRadius={58}
              isAnimationActive
              nameKey="name"
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell fill={`url(#${gid}-${index})`} key={item.name} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox;
                  return (
                    <>
                      <text fill="#102227" fontSize={24} fontWeight={600} textAnchor="middle" x={cx} y={cy - 4}>
                        {Math.round(animatedTotal).toLocaleString()}
                      </text>
                      <text fill="#94a3b8" fontSize={11} textAnchor="middle" x={cx} y={cy + 15}>
                        {totalLabel}
                      </text>
                    </>
                  );
                }}
                position="center"
              />
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
        {data.map((item, index) => (
          <li className="flex items-center justify-between gap-3 text-sm" key={item.name}>
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: statusColor(item.name, index) }}
              />
              <span className="truncate capitalize text-ink">{item.name}</span>
            </span>
            <span className="shrink-0 text-slate-500 tabular-nums">
              {item.value.toLocaleString()} · {total ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
