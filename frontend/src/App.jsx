import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { BarChart3, Bot, ImageUp, LogOut, Menu, PackageSearch, Search, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";

import {
  getCurrentUser,
  getDashboardSummary,
  getProductDetail,
  getProducts,
  login,
  onAuthChange,
  signOut,
} from "./api.js";
import { Logo } from "./components/Logo.jsx";
import { ConfirmDialog, ErrorBanner } from "./components/ui.jsx";
import AssistantView from "./views/AssistantView.jsx";
import DashboardView from "./views/DashboardView.jsx";
import ImageSearchView from "./views/ImageSearchView.jsx";
import LoginScreen from "./views/LoginScreen.jsx";
import ProductSearchView from "./views/ProductSearchView.jsx";
import ProductsView from "./views/ProductsView.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Products", icon: PackageSearch },
  { id: "product-search", label: "Product Search", icon: Search },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "image-search", label: "Image Search", icon: ImageUp },
];

const VIEW_IDS = navItems.map((item) => item.id);
const ACTIVE_VIEW_KEY = "wfx-active-view";

function getStoredView() {
  const stored = sessionStorage.getItem(ACTIVE_VIEW_KEY);
  return stored && VIEW_IDS.includes(stored) ? stored : "dashboard";
}

const defaultFilters = {
  category: "",
  color: "",
  fabric: "",
  season: "",
  supplier: "",
};

const DASHBOARD_CACHE_KEY = "wfx-dashboard-summary";
const DASHBOARD_CACHE_TTL_MS = 120 * 1000;

function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;
  const message = typeof detail === "string" ? detail : error?.message;

  if (!message) {
    return fallbackMessage;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("network error") ||
    normalized.includes("resource temporarily unavailable") ||
    normalized.includes("failed to fetch")
  ) {
    return "Backend connection is unavailable right now. Check the API server and try again.";
  }

  if (normalized.includes("401") || normalized.includes("unauthorized")) {
    return "Your session expired. Please sign in again.";
  }

  return message;
}

function notifyError(key, message) {
  toast.error(message, { id: `error:${key}` });
}

function notifySuccess(key, message) {
  toast.success(message, { id: `success:${key}` });
}

function getCachedDashboardSummary() {
  const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) {
      return null;
    }

    if (Date.now() - parsed.timestamp > DASHBOARD_CACHE_TTL_MS) {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    return null;
  }
}

function setCachedDashboardSummary(summary) {
  sessionStorage.setItem(
    DASHBOARD_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: summary,
    }),
  );
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function AppSidebar({ activeView, onNavigate, user, mobile = false, onClose = null }) {
  return (
    <aside
      className={`${
        mobile
          ? "relative z-10 flex h-full w-[min(18rem,calc(100vw-3rem))] flex-col border-r border-[#d8dfdd] bg-white px-5 py-6 shadow-[20px_0_60px_rgba(16,34,39,0.18)]"
          : "hidden h-screen w-72 shrink-0 border-r border-[#d8dfdd] bg-white/75 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:flex lg:flex-col"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-12 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-ink">WFX AI ERP</p>
            <p className="text-xs text-slate-500">Connected workspace</p>
          </div>
        </div>
        {mobile ? (
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        ) : null}
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                active
                  ? "bg-[#102227] text-white shadow-sm"
                  : "text-slate-600 hover:bg-[#f7f9f8] hover:text-ink"
              }`}
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-slate-200 bg-[#f8faf9] p-4">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#d9773f]">
            <UserRound aria-hidden="true" size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-slate-500">
              {user.role} · {user.email}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace access</p>
          <p className="mt-2 text-sm font-semibold text-ink">Authenticated session</p>
        </div>
      </div>
    </aside>
  );
}

function AppHeader({ activeView, onLogout, onOpenMenu }) {
  const titleMap = {
    dashboard: {
      eyebrow: "Operations overview",
      title: "Dashboard",
    },
    products: {
      eyebrow: "Catalog workspace",
      title: "Products",
    },
    "product-search": {
      eyebrow: "Typesense search",
      title: "Product Search",
    },
    assistant: {
      eyebrow: "Natural language layer",
      title: "AI Assistant",
    },
    "image-search": {
      eyebrow: "Visual similarity",
      title: "Image Search",
    },
  };

  const current = titleMap[activeView];

  return (
    <header className="border-b border-[#d8dfdd] bg-white/80 px-4 py-3.5 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={onOpenMenu}
            type="button"
          >
            <Menu aria-hidden="true" size={18} />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d9773f]">{current.eyebrow}</p>
            <h1 className="text-xl font-semibold text-ink md:text-2xl">{current.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [activeView, setActiveView] = useState(getStoredView);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState(null);

  const cachedSummary = getCachedDashboardSummary();
  const [summary, setSummary] = useState(cachedSummary);
  const [summaryLoading, setSummaryLoading] = useState(() => !cachedSummary);
  const [summaryError, setSummaryError] = useState("");

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("style_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState(defaultFilters);
  const deferredFilters = useDeferredValue(filters);
  const [products, setProducts] = useState({ items: [], page: 1, page_size: 8, total: 0 });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [selectedStyleNumber, setSelectedStyleNumber] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductLoading, setSelectedProductLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState("");
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const dashboardRequestRef = useRef(0);
  const productsRequestRef = useRef(0);
  const productDetailRequestRef = useRef(0);

  function loadDashboardSummary() {
    const requestId = dashboardRequestRef.current + 1;
    dashboardRequestRef.current = requestId;
    setSummaryLoading(true);
    setSummaryError("");
    getDashboardSummary()
      .then((data) => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        setSummary(data);
        setCachedDashboardSummary(data);
        setSummaryError("");
      })
      .catch((error) => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load dashboard summary.");
        setSummaryError(message);
        notifyError("dashboard-summary", message);
      })
      .finally(() => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        setSummaryLoading(false);
      });
  }

  useEffect(() => {
    sessionStorage.setItem(ACTIVE_VIEW_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((nextUser) => {
        if (active) {
          setUser(nextUser);
        }
      })
      .finally(() => {
        if (active) {
          setSessionReady(true);
        }
      });

    const unsubscribe = onAuthChange((nextUser) => {
      if (active) {
        setUser(nextUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only load the dashboard summary when the Dashboard is actually open,
    // and skip the request entirely if we still have a fresh cached copy.
    if (!user || activeView !== "dashboard") {
      return;
    }

    if (getCachedDashboardSummary()) {
      return;
    }

    loadDashboardSummary();
  }, [user, activeView]);

  useEffect(() => {
    if (!user || activeView !== "products") {
      return;
    }

    const requestId = productsRequestRef.current + 1;
    productsRequestRef.current = requestId;
    setProductsLoading(true);
    setProductsError("");
    getProducts({
      page,
      page_size: 8,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...deferredFilters,
    })
      .then((data) => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        setProducts(data);
        setProductsError("");
        if (!data.items?.length) {
          setSelectedProduct(null);
          setSelectedStyleNumber("");
          return;
        }

        const selectedStillVisible = data.items.some(
          (item) => item.style_number === selectedStyleNumber,
        );

        if (!selectedStillVisible && isProductDetailOpen) {
          setSelectedStyleNumber(data.items[0].style_number);
        }
      })
      .catch((error) => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load products.");
        setProductsError(message);
        setSelectedProduct(null);
        notifyError("products-list", message);
      })
      .finally(() => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        setProductsLoading(false);
      });
  }, [user, page, deferredFilters, sortBy, sortOrder, activeView]);

  useEffect(() => {
    if (!user || !selectedStyleNumber || !isProductDetailOpen) {
      return;
    }

    const requestId = productDetailRequestRef.current + 1;
    productDetailRequestRef.current = requestId;
    setSelectedProductLoading(true);
    setProductDetailError("");
    getProductDetail(selectedStyleNumber)
      .then((data) => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        setSelectedProduct(data);
        setProductDetailError("");
      })
      .catch((error) => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load product detail.");
        setProductDetailError(message);
        notifyError("product-detail", message);
      })
      .finally(() => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        setSelectedProductLoading(false);
      });
  }, [user, selectedStyleNumber, isProductDetailOpen]);

  async function handleLogin(form) {
    setAuthLoading(true);
    try {
      const nextUser = await login(form);
      setUser(nextUser);
      setSessionReady(true);
      notifySuccess("login", "Signed in. Protected ERP APIs are ready.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    dashboardRequestRef.current += 1;
    productsRequestRef.current += 1;
    productDetailRequestRef.current += 1;
    setActiveView("dashboard");
    signOut();
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    setUser(null);
    setSummary(null);
    setSummaryError("");
    setProducts({ items: [], page: 1, page_size: 8, total: 0 });
    setProductsError("");
    setSelectedProduct(null);
    setSelectedStyleNumber("");
    setProductDetailError("");
    setIsProductDetailOpen(false);
    notifySuccess("logout", "Signed out successfully.");
  }

  function handleFilterChange(key, value) {
    startTransition(() => {
      setPage(1);
      setFilters((current) => ({ ...current, [key]: value }));
    });
  }

  function handleProductSelect(styleNumber) {
    setSelectedStyleNumber(styleNumber);
    setSelectedProduct(null);
    setIsProductDetailOpen(true);
  }

  function handleProductModalClose() {
    setIsProductDetailOpen(false);
    setProductDetailError("");
  }

  function handleSortChange(nextSortBy, nextSortOrder) {
    startTransition(() => {
      setPage(1);
      setSortBy(nextSortBy);
      setSortOrder(nextSortOrder);
    });
  }

  function handleResetFilters() {
    startTransition(() => {
      setPage(1);
      setFilters(defaultFilters);
    });
  }

  if (!sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4efe8] text-slate-600">
        Loading session...
      </main>
    );
  }

  if (!user) {
    return <LoginScreen loading={authLoading} onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe8_0%,#f8faf9_36%,#edf3f2_100%)] text-ink">
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-[#102227]/35"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <AppSidebar
            activeView={activeView}
            mobile
            onClose={() => setMobileNavOpen(false)}
            onNavigate={setActiveView}
            user={user}
          />
        </div>
      ) : null}

      <div className="flex min-h-screen">
        <AppSidebar activeView={activeView} onNavigate={setActiveView} user={user} />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            activeView={activeView}
            onLogout={() => setLogoutConfirmOpen(true)}
            onOpenMenu={() => setMobileNavOpen(true)}
          />

          <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-6 md:px-8">
            {activeView === "dashboard" ? (
              <div className="space-y-4">
                <ErrorBanner
                  action={
                    <button
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm"
                      onClick={loadDashboardSummary}
                      type="button"
                    >
                      Retry
                    </button>
                  }
                  message={summaryError}
                />
                <DashboardView
                  formatCompactNumber={formatCompactNumber}
                  formatCurrency={formatCurrency}
                  loading={summaryLoading}
                  summary={summary}
                />
              </div>
            ) : null}

            {activeView === "products" ? (
              <ProductsView
                filters={filters}
                formatCompactNumber={formatCompactNumber}
                formatCurrency={formatCurrency}
                isDetailOpen={isProductDetailOpen}
                onFilterChange={handleFilterChange}
                onPageChange={setPage}
                onProductModalClose={handleProductModalClose}
                onProductSelect={handleProductSelect}
                onResetFilters={handleResetFilters}
                onSortChange={handleSortChange}
                page={page}
                productDetailError={productDetailError}
                products={products}
                productsError={productsError}
                productsLoading={productsLoading}
                selectedProduct={selectedProduct}
                selectedProductLoading={selectedProductLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            ) : null}

            {activeView === "assistant" ? (
              <AssistantView getApiErrorMessage={getApiErrorMessage} notifyError={notifyError} />
            ) : null}

            {activeView === "product-search" ? (
              <ProductSearchView
                formatCurrency={formatCurrency}
                getApiErrorMessage={getApiErrorMessage}
                notifyError={notifyError}
              />
            ) : null}

            {activeView === "image-search" ? (
              <ImageSearchView
                formatCurrency={formatCurrency}
                getApiErrorMessage={getApiErrorMessage}
                notifyError={notifyError}
                notifySuccess={notifySuccess}
              />
            ) : null}
          </div>
        </section>
      </div>

      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Sign out"
        icon={LogOut}
        message="You'll need to sign in again to access the ERP workspace."
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
        open={logoutConfirmOpen}
        title="Sign out of WFX AI ERP?"
      />
    </main>
  );
}

export default App;
