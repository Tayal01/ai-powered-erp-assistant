import { motion } from "framer-motion";
import { ImageIcon, Link2, LoaderCircle, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { searchByImage } from "../api.js";
import { EmptyState, ErrorBanner, SectionTitle, SurfaceCard } from "../components/ui.jsx";

function SimilarProductCard({ item, formatCurrency }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-slate-200 bg-white p-5"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f4efe8]">
          {item.image_url ? (
            <img alt={item.style_name} className="h-full w-full object-cover" src={item.image_url} />
          ) : (
            <ImageIcon aria-hidden="true" className="text-[#102227]" size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">{item.style_name}</h3>
              <p className="text-sm text-slate-500">
                {item.style_number} · {item.category}
              </p>
            </div>
            {item.similarity_percent != null ? (
              <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#4b8b69]">
                {item.similarity_percent}% match
              </span>
            ) : null}
          </div>
          <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
            <p>Color: {item.color}</p>
            <p>Fabric: {item.fabric}</p>
            <p>Supplier: {item.supplier}</p>
            <p>Price: {formatCurrency(item.selling_price)}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function ImageSearchView({
  formatCurrency,
  getApiErrorMessage,
  notifyError,
  notifySuccess,
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({ items: [], count: 0, engine: "" });

  const objectUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const displayPreview = previewUrl || objectUrl;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setPreviewUrl("");
    setResults({ items: [], count: 0, engine: "" });
    setError("");
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (loading) {
      return;
    }
    if (!selectedFile && !imageUrl.trim()) {
      setError("Upload an image or provide an image URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await searchByImage({
        file: selectedFile,
        imageUrl: imageUrl.trim(),
      });
      setResults(data);
      if (selectedFile && objectUrl) {
        setPreviewUrl(objectUrl);
      } else if (imageUrl.trim()) {
        setPreviewUrl(imageUrl.trim());
      }
      notifySuccess("image-search", `Found ${data.count} visually similar products.`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to search by image.");
      setError(message);
      notifyError("image-search", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
          <UploadCloud aria-hidden="true" size={20} />
        </div>
        <SectionTitle
          subtitle="Upload a garment photo or paste an image URL to find visually similar catalog products."
          title="Image-based product discovery"
        />

        <form className="mt-6 space-y-4" onSubmit={handleSearch}>
          <label
            className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-[#f8faf9] px-6 py-10 text-center transition hover:border-[#4b8b69]"
            htmlFor="image-upload"
          >
            <UploadCloud aria-hidden="true" className="text-[#102227]" size={28} />
            <span className="mt-3 text-sm font-semibold text-ink">
              {selectedFile ? selectedFile.name : "Drag and drop or click to upload"}
            </span>
            <span className="mt-1 text-xs text-slate-500">PNG, JPG, or WEBP</span>
            <input
              accept="image/*"
              className="sr-only"
              id="image-upload"
              onChange={handleFileChange}
              type="file"
            />
          </label>

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            or image URL
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#4b8b69]"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/garment.jpg"
                value={imageUrl}
              />
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102227] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12323a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : null}
              Find similar products
            </button>
          </div>
        </form>
      </SurfaceCard>

      <ErrorBanner message={error} />

      {displayPreview ? (
        <SurfaceCard className="p-6">
          <SectionTitle subtitle="Reference image used for vector search" title="Preview" />
          <img
            alt="Uploaded reference"
            className="mt-4 max-h-80 rounded-[24px] border border-slate-200 object-contain"
            src={displayPreview}
          />
        </SurfaceCard>
      ) : null}

      {results.items?.length ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-600">
            {results.count} similar products {results.engine ? `via ${results.engine}` : ""}
          </p>
          <div className="grid gap-4">
            {results.items.map((item) => (
              <SimilarProductCard formatCurrency={formatCurrency} item={item} key={item.style_number} />
            ))}
          </div>
        </div>
      ) : null}

      {!loading && !results.items?.length && !error ? (
        <EmptyState message="Upload a reference garment image to start visual discovery." />
      ) : null}
    </div>
  );
}
