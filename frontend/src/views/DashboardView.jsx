import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  LineChart,
  Tag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import { AreaTrend, HorizontalBars, StatusDonut, statusColor } from "../components/charts.jsx";
import { cardRise, ChartReveal, gridStagger } from "../components/motion.jsx";
import { EmptyState, MetricCard, SkeletonBlock, SurfaceCard } from "../components/ui.jsx";

export default function DashboardView({
  summary,
  loading,
  formatCompactNumber,
  formatCurrency,
}) {
  const kpis = summary?.kpis;
  const charts = summary?.charts;
  const recent = summary?.recent;

  const buyerRevenueData = (charts?.top_buyers || [])
    .slice(0, 6)
    .map((buyer) => ({ name: buyer.buyer, value: buyer.revenue }));
  const categoryData = (charts?.product_categories || [])
    .slice(0, 8)
    .map((item) => ({ name: item.category, value: item.count }));
  const orderStatusData = (charts?.order_status || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));
  const paymentStatusData = (charts?.payment_status || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));
  const monthlyTrend = charts?.monthly_trend || [];
  const formatCompactCurrency = (value) => `$${formatCompactNumber(value)}`;

  const cards = [
    {
      label: "Total revenue",
      rawValue: kpis?.estimated_order_revenue,
      format: formatCompactCurrency,
      value: kpis ? formatCompactCurrency(kpis.estimated_order_revenue) : "...",
      detail: "Booked order value",
      icon: TrendingUp,
      chipClass: "bg-gradient-to-br from-[#d9773f]/16 to-[#d9773f]/5 text-[#d9773f]",
    },
    {
      label: "Sales orders",
      rawValue: kpis?.sales_orders,
      format: formatCompactNumber,
      value: kpis ? formatCompactNumber(kpis.sales_orders) : "...",
      detail: "Open order base",
      icon: ClipboardList,
      chipClass: "bg-gradient-to-br from-[#12323a]/16 to-[#12323a]/5 text-[#12323a]",
    },
    {
      label: "Finished goods",
      rawValue: kpis?.finished_goods,
      format: formatCompactNumber,
      value: kpis ? formatCompactNumber(kpis.finished_goods) : "...",
      detail: "Catalog coverage",
      icon: Boxes,
      chipClass: "bg-gradient-to-br from-[#4b8b69]/18 to-[#4b8b69]/5 text-[#4b8b69]",
    },
    {
      label: "Buyers",
      rawValue: kpis?.buyers,
      format: formatCompactNumber,
      value: kpis ? formatCompactNumber(kpis.buyers) : "...",
      detail: "Active accounts",
      icon: Users,
      chipClass: "bg-gradient-to-br from-[#0b7ea3]/16 to-[#0b7ea3]/5 text-[#0b7ea3]",
    },
    {
      label: "Suppliers",
      rawValue: kpis?.suppliers,
      format: formatCompactNumber,
      value: kpis ? formatCompactNumber(kpis.suppliers) : "...",
      detail: "Sourcing partners",
      icon: Truck,
      chipClass: "bg-gradient-to-br from-[#7d54c9]/16 to-[#7d54c9]/5 text-[#7d54c9]",
    },
    {
      label: "Pending invoices",
      rawValue: kpis?.pending_invoice_amount,
      format: formatCompactCurrency,
      value: kpis ? formatCompactCurrency(kpis.pending_invoice_amount) : "...",
      detail: "Requires follow-up",
      icon: AlertCircle,
      chipClass: "bg-gradient-to-br from-[#b44e46]/16 to-[#b44e46]/5 text-[#b44e46]",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        variants={gridStagger}
      >
        {cards.map((card) => (
          <motion.div
            key={card.label}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            variants={cardRise}
            whileHover={{ y: -4, boxShadow: "0 22px 48px rgba(16,34,39,0.12)" }}
          >
            <MetricCard {...card} />
          </motion.div>
        ))}
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-2">
        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Revenue trend</h3>
            <TrendingUp aria-hidden="true" className="text-[#d9773f]" size={20} />
          </div>
          <div className="mt-4">
            {loading && !monthlyTrend.length ? (
              <SkeletonBlock className="h-[240px]" />
            ) : monthlyTrend.length ? (
              <ChartReveal>
                <AreaTrend
                  color="#d9773f"
                  data={monthlyTrend}
                  dataKey="revenue"
                  valueFormatter={(value) => `$${formatCompactNumber(value)}`}
                />
              </ChartReveal>
            ) : (
              <EmptyState className="flex h-[240px] items-center justify-center" message="Trend data coming soon" />
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Orders trend</h3>
            <LineChart aria-hidden="true" className="text-[#2f9e6b]" size={20} />
          </div>
          <div className="mt-4">
            {loading && !monthlyTrend.length ? (
              <SkeletonBlock className="h-[240px]" />
            ) : monthlyTrend.length ? (
              <ChartReveal>
                <AreaTrend
                  color="#2f9e6b"
                  data={monthlyTrend}
                  dataKey="orders"
                  valueFormatter={(value) => `${formatCompactNumber(value)} orders`}
                />
              </ChartReveal>
            ) : (
              <EmptyState className="flex h-[240px] items-center justify-center" message="Trend data coming soon" />
            )}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Top buyers by revenue</h3>
            <BarChart3 aria-hidden="true" className="text-[#d9773f]" size={20} />
          </div>
          <div className="mt-4 h-[360px]">
            {loading && !buyerRevenueData.length ? (
              <SkeletonBlock className="h-full" />
            ) : (
              <ChartReveal className="h-full">
                <HorizontalBars
                  color="#d9773f"
                  data={buyerRevenueData}
                  valueFormatter={(value) => `$${formatCompactNumber(value)}`}
                />
              </ChartReveal>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Category mix</h3>
            <Tag aria-hidden="true" className="text-[#2f9e6b]" size={20} />
          </div>
          <div className="mt-4 h-[360px]">
            {loading && !categoryData.length ? (
              <SkeletonBlock className="h-full" />
            ) : (
              <ChartReveal className="h-full">
                <HorizontalBars
                  color="#2f9e6b"
                  data={categoryData}
                  highlightMax={false}
                  valueFormatter={(value) => `${formatCompactNumber(value)} styles`}
                />
              </ChartReveal>
            )}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Order status</h3>
            <ClipboardList aria-hidden="true" className="text-[#0b7ea3]" size={20} />
          </div>
          <div className="mt-4">
            {loading && !orderStatusData.length ? (
              <SkeletonBlock className="h-[200px]" />
            ) : (
              <ChartReveal>
                <StatusDonut
                  data={orderStatusData}
                  totalLabel="orders"
                  valueFormatter={(value) => `${formatCompactNumber(value)} orders`}
                />
              </ChartReveal>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Payment status</h3>
            <CreditCard aria-hidden="true" className="text-[#2f9e6b]" size={20} />
          </div>
          <div className="mt-4">
            {loading && !paymentStatusData.length ? (
              <SkeletonBlock className="h-[200px]" />
            ) : (
              <ChartReveal>
                <StatusDonut
                  data={paymentStatusData}
                  totalLabel="invoices"
                  valueFormatter={(value) => `${formatCompactNumber(value)} invoices`}
                />
              </ChartReveal>
            )}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="p-5">
          <h3 className="text-lg font-semibold text-ink">Recent products</h3>
          <div className="mt-4 space-y-3">
            {(recent?.products || []).slice(0, 6).map((product) => (
              <div className="rounded-2xl border border-slate-100 px-4 py-3" key={product.style_number}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{product.style_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.style_number} · {product.category} · {product.color}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef3f2] px-3 py-1 text-xs font-semibold text-slate-600">
                    {product.season}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h3 className="text-lg font-semibold text-ink">Recent orders</h3>
          <div className="mt-4 space-y-3">
            {(recent?.orders || []).slice(0, 6).map((order) => (
              <div className="rounded-2xl border border-slate-100 px-4 py-3" key={order.order_number}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{order.buyer}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.order_number} · {order.style_number} · Qty {order.quantity}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    style={{ background: `${statusColor(order.status)}1F`, color: statusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
