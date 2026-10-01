import { motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Boxes,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  ImageIcon,
  Layers3,
  Palette,
  RotateCcw,
  Search,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cardRise, gridStagger } from "../components/motion.jsx";
import {
  CompactStat,
  EmptyState,
  ErrorBanner,
  Modal,
  SectionTitle,
  SkeletonBlock,
  SurfaceCard,
} from "../components/ui.jsx";

function ProductThumbnail({ product }) {
  const [failed, setFailed] = useState(false);

  if (product.image_url && !failed) {
    return (
      <img
        alt={product.style_name}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
        loading="lazy"
        onError={() => setFailed(true)}
        src={product.image_url}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#102227] text-white ring-1 ring-slate-200">
      <ImageIcon aria-hidden="true" size={20} />
    </div>
  );
}

function ProductHeroImage({ product }) {
  const [failed, setFailed] = useState(false);

  if (product.image_url && !failed) {
    return (
      <div className="relative min-h-[260px] overflow-hidden rounded-[24px] bg-[#eef3f2]">
        <img
          alt={product.style_name}
          className="h-full min-h-[260px] w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
          src={product.image_url}
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink shadow-sm">
          {product.season}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-slate-200 bg-[#eef3f2] text-[#102227]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <ImageIcon aria-hidden="true" size={24} />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">{product.category}</p>
        <p className="mt-1 text-xs text-slate-500">Product image unavailable</p>
      </div>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(16,34,39,0.04)]"
          key={index}
        >
          <div className="flex items-start gap-4">
            <SkeletonBlock className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <SkeletonBlock className="h-5 w-44" />
                  <SkeletonBlock className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="ml-auto h-3 w-20" />
                  <SkeletonBlock className="ml-auto h-6 w-24" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductDetailModal({ open, onClose, productDetail, loading, error, formatCurrency }) {
  const product = productDetail?.product;

  return (
    <Modal
      onClose={onClose}
      open={open}
      subtitle={product ? `${product.style_number} · ${product.category}` : "Operational product snapshot"}
      title={product ? product.style_name : "Product detail"}
    >
      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="space-y-5">
          <div className="rounded-[28px] bg-white p-6">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-4 h-10 w-72 max-w-full" />
            <SkeletonBlock className="mt-3 h-4 w-56 max-w-full" />
            <div className="mt-5 flex gap-2">
              <SkeletonBlock className="h-8 w-20" />
              <SkeletonBlock className="h-8 w-28" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(16,34,39,0.04)]" key={index}>
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="mt-3 h-5 w-24" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <SurfaceCard className="p-5">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="mt-4 h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-10/12" />
              <SkeletonBlock className="mt-2 h-4 w-8/12" />
            </SurfaceCard>
            <SurfaceCard className="p-5">
              <SkeletonBlock className="h-5 w-28" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="rounded-2xl bg-[#f7f9f8] px-4 py-3" key={index}>
                    <SkeletonBlock className="h-3 w-14" />
                    <SkeletonBlock className="mt-3 h-4 w-24" />
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>
      ) : null}

      {product ? (
        <div className="space-y-5">
          <div className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(16,34,39,0.05)] lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
            <ProductHeroImage product={product} />

            <div className="flex min-w-0 flex-col justify-between rounded-[24px] bg-[#102227] p-6 text-white">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{product.style_number}</p>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                    {product.season}
                  </span>
                </div>
                <h4 className="mt-4 text-3xl font-semibold">{product.style_name}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {product.category} · {product.fabric} · {product.color}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[product.print, product.brand].filter(Boolean).map((chip) => (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Supplier", product.supplier],
              ["Season", product.season],
              ["Brand", product.brand],
              ["Selling price", formatCurrency(product.selling_price)],
            ].map(([label, value]) => (
              <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(16,34,39,0.04)]" key={label}>
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <SurfaceCard className="p-5">
              <h5 className="text-base font-semibold text-ink">Tech pack</h5>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {productDetail.tech_pack?.fabric_details || "No tech pack details found."}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {productDetail.tech_pack?.construction || "Construction unavailable"} ·{" "}
                {productDetail.tech_pack?.wash_instructions || "Wash instructions unavailable"}
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <h5 className="text-base font-semibold text-ink">Supplier profile</h5>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-[#f7f9f8] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Company</p>
                  <p className="mt-2 font-medium text-ink">{productDetail.supplier?.company_name || product.supplier}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f9f8] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Country</p>
                  <p className="mt-2 font-medium text-ink">{productDetail.supplier?.country || "Unavailable"}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f9f8] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Lead time</p>
                  <p className="mt-2 font-medium text-ink">
                    {productDetail.supplier?.lead_time_days ? `${productDetail.supplier.lead_time_days} days` : "Unavailable"}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="p-5">
            <h5 className="text-base font-semibold text-ink">Recent related orders</h5>
            <div className="mt-4 space-y-3">
              {(productDetail.orders || []).slice(0, 5).map((order) => (
                <div className="rounded-2xl border border-slate-100 px-4 py-3" key={order.order_number}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{order.order_number}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.buyer} · Qty {order.quantity}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold text-slate-600">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </Modal>
  );
}

export default function ProductsView({
  filters,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onSortChange,
  page,
  products,
  productsLoading,
  selectedProduct,
  selectedProductLoading,
  onProductSelect,
  onProductModalClose,
  productDetailError,
  productsError,
  isDetailOpen,
  formatCompactNumber,
  formatCurrency,
  sortBy,
  sortOrder,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil((products?.total || 0) / (products?.page_size || 8)));
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const filterFields = useMemo(
    () => [
      { key: "category", label: "Category", placeholder: "Outerwear, Dress, Polo...", icon: Layers3 },
      { key: "color", label: "Color", placeholder: "Plum, Grey Melange...", icon: Palette },
      { key: "fabric", label: "Fabric", placeholder: "Cotton twill, Chambray...", icon: Boxes },
      { key: "season", label: "Season", placeholder: "AW26, SS25...", icon: CalendarDays },
      { key: "supplier", label: "Supplier", placeholder: "Supplier name", icon: Building2 },
    ],
    [],
  );

  const sortOptions = [
    { value: "style_name", label: "Name" },
    { value: "style_number", label: "Style" },
    { value: "selling_price", label: "Price" },
    { value: "cost", label: "Cost" },
    { value: "gsm", label: "GSM" },
    { value: "season", label: "Season" },
  ];
  const SortIcon = sortOrder === "asc" ? ArrowUpAZ : ArrowDownAZ;
  const sortDirectionLabel = sortOrder === "asc" ? "Ascending" : "Descending";

  return (
    <>
      <div className="space-y-5">
        <motion.div
          animate="show"
          className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]"
          initial="hidden"
          variants={gridStagger}
        >
          <motion.div variants={cardRise}>
            <SurfaceCard className="h-full p-5">
              <SectionTitle
                subtitle="Focused product search for merchandising teams"
                title="Product catalog"
                action={
                  <button
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setFiltersOpen((current) => !current)}
                    type="button"
                  >
                    <Filter aria-hidden="true" size={16} />
                    {filtersOpen ? "Hide filters" : "Show filters"}
                  </button>
                }
              />
            </SurfaceCard>
          </motion.div>
          {[
            {
              icon: Search,
              label: "Catalog size",
              value: formatCompactNumber(products?.total || 0),
              chipClass: "bg-gradient-to-br from-[#0b7ea3]/16 to-[#0b7ea3]/5 text-[#0b7ea3]",
            },
            {
              icon: Filter,
              label: "Active filters",
              value: String(activeFilters),
              chipClass: "bg-gradient-to-br from-[#d9773f]/16 to-[#d9773f]/5 text-[#d9773f]",
            },
            {
              icon: Tag,
              label: "Page",
              value: `${page}/${totalPages}`,
              chipClass: "bg-gradient-to-br from-[#4b8b69]/18 to-[#4b8b69]/5 text-[#4b8b69]",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              variants={cardRise}
              whileHover={{ y: -4, boxShadow: "0 22px 48px rgba(16,34,39,0.12)" }}
            >
              <CompactStat chipClass={stat.chipClass} icon={stat.icon} label={stat.label} value={stat.value} />
            </motion.div>
          ))}
        </motion.div>

        {filtersOpen ? (
          <SurfaceCard className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-600">Refine the catalog by core apparel attributes.</p>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={onResetFilters}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={16} />
                Clear filters
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {filterFields.map((field) => {
                const Icon = field.icon;
                return (
                  <label
                    className="rounded-[20px] border border-slate-200 bg-[#fbfcfb] px-4 py-3 transition focus-within:border-[#d9773f] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d9773f]/10"
                    key={field.key}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Icon aria-hidden="true" size={14} />
                      {field.label}
                    </span>
                    <input
                      className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-slate-400"
                      onChange={(event) => onFilterChange(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      value={filters[field.key]}
                    />
                  </label>
                );
              })}
            </div>
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionTitle
              subtitle={productsLoading ? "Refreshing live ERP inventory..." : `${products?.items?.length || 0} styles on this page`}
              title="Matching styles"
              action={
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef3f2] px-3 py-2 text-sm font-medium text-slate-700">
                  <Tag aria-hidden="true" size={15} />
                  {products?.total || 0} total products
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8faf9] p-1">
              <span className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</span>
              <div className="flex flex-wrap items-center gap-1">
                {sortOptions.map((option) => {
                  const active = sortBy === option.value;
                  return (
                    <button
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-white text-ink shadow-[0_6px_18px_rgba(16,34,39,0.08)]"
                          : "text-slate-600 hover:bg-white/70 hover:text-ink"
                      }`}
                      key={option.value}
                      onClick={() => onSortChange(option.value, sortOrder)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <button
                aria-label={`Sort direction: ${sortDirectionLabel}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-[0_6px_18px_rgba(16,34,39,0.06)] transition hover:bg-slate-50"
                onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
                title={`Sort direction: ${sortDirectionLabel}`}
                type="button"
              >
                <SortIcon aria-hidden="true" size={16} />
              </button>
            </div>
          </div>

          {productsError ? <div className="mt-4"><ErrorBanner message={productsError} /></div> : null}

          {productsLoading ? <ProductListSkeleton /> : null}

          {!productsLoading ? (
            <motion.div
              animate="show"
              className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-2"
              initial="hidden"
              key={`${page}-${sortBy}-${sortOrder}`}
              variants={gridStagger}
            >
              {(products?.items || []).map((product) => (
              <motion.button
                className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-left shadow-[0_10px_30px_rgba(16,34,39,0.04)] transition hover:border-slate-300 hover:bg-[#fcfdfc]"
                key={product.style_number}
                onClick={() => onProductSelect(product.style_number)}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                type="button"
                variants={cardRise}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start gap-4">
                  <ProductThumbnail product={product} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-ink">{product.style_name}</p>
                          <span className="rounded-full bg-[#eef3f2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                            {product.season}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {product.style_number} · {product.category}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Selling price</p>
                        <p className="mt-1 text-lg font-semibold text-ink">
                          {formatCurrency(product.selling_price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[#f7f9f8] px-3 py-2">
                        <span className="text-xs uppercase tracking-wide text-slate-500">Fabric</span>
                        <p className="mt-1 font-medium text-ink">{product.fabric}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f7f9f8] px-3 py-2">
                        <span className="text-xs uppercase tracking-wide text-slate-500">Color / Print</span>
                        <p className="mt-1 font-medium text-ink">{product.color} · {product.print}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f7f9f8] px-3 py-2">
                        <span className="text-xs uppercase tracking-wide text-slate-500">Supplier</span>
                        <p className="mt-1 font-medium text-ink">{product.supplier}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
              ))}
            </motion.div>
          ) : null}

          {!productsLoading && !(products?.items || []).length ? (
            <div className="mt-4"><EmptyState message="No products match the current filters. Try clearing a few fields." /></div>
          ) : null}

          <div className="mt-5 flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              disabled={page <= 1 || productsLoading}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={16} />
              Previous
            </button>
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              disabled={page >= totalPages || productsLoading}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              Next
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          </div>
        </SurfaceCard>
      </div>

      <ProductDetailModal
        error={productDetailError}
        formatCurrency={formatCurrency}
        loading={selectedProductLoading}
        onClose={onProductModalClose}
        open={isDetailOpen}
        productDetail={selectedProduct}
      />
    </>
  );
}
