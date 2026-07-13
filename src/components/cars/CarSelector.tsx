"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, Check, Car, X } from "lucide-react";
import { formatYearRange } from "@/lib/car-catalog-utils";
import { sortBrandsByPopularity, splitBrandsByPopularity } from "@/lib/car-logos";
import { Input } from "@/components/ui/Input";
import { BrandLogo } from "./BrandLogo";
import { BrandPickerButton } from "./BrandPickerButton";

type Brand = { id: string; name: string; slug: string; logoUrl: string };
type Model = { id: string; name: string; slug: string; brandId: string };
type Generation = {
  id: string;
  code: string;
  name: string | null;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
  modelId: string;
  variants?: { id: string; code: string; label: string }[];
};

export type CarSelection = {
  brand: string;
  brandId: string;
  model: string;
  modelId: string;
  generation: string;
  generationId: string;
  yearFrom: number;
  yearTo: number | null;
};

type Props = {
  value?: Partial<CarSelection>;
  onChange: (selection: CarSelection | null) => void;
  compact?: boolean;
  /** filter = можно только марку; create = марка+модель, поколение необязательно */
  mode?: "create" | "filter";
};

type Step = "brand" | "model" | "generation";

function isRealCarPhoto(url: string | null | undefined) {
  return (
    !!url &&
    url !== "__pending__" &&
    !url.includes("car-logos-dataset") &&
    url !== "__initials__"
  );
}

function isPendingImage(url: string) {
  return (
    !url ||
    url === "__pending__" ||
    url.includes("car-logos-dataset") ||
    url === "__initials__"
  );
}

async function resolveGenerationImages(gens: Generation[]): Promise<Generation[]> {
  const pendingIds = gens.filter((g) => isPendingImage(g.imageUrl)).map((g) => g.id);
  if (!pendingIds.length) return gens;

  const results: Record<string, string | null> = {};
  for (let i = 0; i < pendingIds.length; i += 24) {
    const chunk = pendingIds.slice(i, i + 24);
    const res = await fetch("/api/cars/resolve-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: chunk }),
    });
    const data = await res.json();
    Object.assign(results, data.results ?? {});
  }

  return gens.map((g) => {
    const resolved = results[g.id];
    if (isRealCarPhoto(resolved)) return { ...g, imageUrl: resolved! };
    return g;
  });
}

function useDebounce(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function GenerationCard({
  gen,
  selected,
  onSelect,
}: {
  gen: Generation;
  selected: boolean;
  onSelect: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    isRealCarPhoto(gen.imageUrl) ? gen.imageUrl : null
  );
  const [loading, setLoading] = useState(isPendingImage(gen.imageUrl));

  useEffect(() => {
    if (isRealCarPhoto(gen.imageUrl)) {
      setImageUrl(gen.imageUrl);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/cars/resolve-image?id=${gen.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (isRealCarPhoto(data.url)) setImageUrl(data.url);
      })
      .finally(() => setLoading(false));
  }, [gen.id, gen.imageUrl, gen.code]);

  const title = gen.name ?? gen.code;
  const years = formatYearRange(gen.yearFrom, gen.yearTo);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group shrink-0 w-[148px] sm:w-[168px] rounded-2xl border overflow-hidden text-left transition-all snap-start ${
        selected
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-md"
          : "border-[var(--border)] hover:border-[var(--text-muted)]"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[var(--bg-secondary)]">
        {isRealCarPhoto(imageUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl!}
            alt={title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-hover)]">
            {loading ? (
              <div className="w-7 h-7 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            ) : (
              <Car className="w-9 h-9 text-[var(--text-muted)]" strokeWidth={1.5} />
            )}
          </div>
        )}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full flex items-center justify-center z-10">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="p-2.5 bg-[var(--bg-card)] space-y-0.5">
        <p className="font-bold text-[13px] leading-tight">{years}</p>
        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1">{title}</p>
      </div>
    </button>
  );
}

function emitSelection(
  brand: Brand,
  model: Model | null,
  gen: Generation | null
): CarSelection {
  return {
    brand: brand.name,
    brandId: brand.id,
    model: model?.name ?? "",
    modelId: model?.id ?? "",
    generation: gen?.code ?? "",
    generationId: gen?.id ?? "",
    yearFrom: gen?.yearFrom ?? 1990,
    yearTo: gen?.yearTo ?? null,
  };
}

export function CarSelector({ value, onChange, compact, mode = "create" }: Props) {
  const isFilter = mode === "filter";
  const [step, setStep] = useState<Step>("brand");
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const debouncedBrandSearch = useDebounce(brandSearch, 300);
  const debouncedModelSearch = useDebounce(modelSearch, 300);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [generationsLoading, setGenerationsLoading] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cars/brands?all=1");
      const data: Brand[] = await res.json();
      const sorted = sortBrandsByPopularity(data);
      setAllBrands(sorted);
      setBrands(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    const lower = debouncedBrandSearch.trim().toLowerCase();
    if (!lower) {
      setBrands(allBrands);
      return;
    }
    setBrands(sortBrandsByPopularity(allBrands.filter((b) => b.name.toLowerCase().includes(lower))));
  }, [debouncedBrandSearch, allBrands]);

  const handleLogoResolved = useCallback((id: string, url: string) => {
    const patch = (prev: Brand[]) => prev.map((b) => (b.id === id ? { ...b, logoUrl: url } : b));
    setBrands(patch);
    setAllBrands(patch);
  }, []);

  useEffect(() => {
    if (!selectedBrand) {
      setAllModels([]);
      setModels([]);
      return;
    }

    setModelsLoading(true);
    fetch(`/api/cars/models?brandId=${selectedBrand.id}&all=1&carsOnly=1`)
      .then((r) => r.json())
      .then((data: Model[]) => {
        setAllModels(data);
        setModels(data);
      })
      .finally(() => setModelsLoading(false));
  }, [selectedBrand]);

  useEffect(() => {
    const lower = debouncedModelSearch.trim().toLowerCase();
    if (!lower) {
      setModels(allModels);
      return;
    }
    setModels(allModels.filter((m) => m.name.toLowerCase().includes(lower)));
  }, [debouncedModelSearch, allModels]);

  useEffect(() => {
    if (!selectedModel) {
      setGenerations([]);
      return;
    }

    setGenerationsLoading(true);
    fetch(`/api/cars/generations?modelId=${selectedModel.id}`)
      .then((r) => r.json())
      .then((gens: Generation[]) => {
        setGenerations(gens);
        setGenerationsLoading(false);
        void resolveGenerationImages(gens).then(setGenerations);
      })
      .catch(() => setGenerationsLoading(false));
  }, [selectedModel]);

  function selectBrand(brand: Brand) {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedGen(null);
    setModelSearch("");
    setStep("model");
    if (isFilter) {
      onChange(emitSelection(brand, null, null));
    }
  }

  function selectModel(model: Model) {
    if (!selectedBrand) return;
    setSelectedModel(model);
    setSelectedGen(null);
    setStep("generation");
    onChange(emitSelection(selectedBrand, model, null));
  }

  function selectGeneration(gen: Generation) {
    setSelectedGen(gen);
    if (!selectedBrand || !selectedModel) return;
    onChange(emitSelection(selectedBrand, selectedModel, gen));
  }

  function confirmWithoutGeneration() {
    if (!selectedBrand || !selectedModel) return;
    setSelectedGen(null);
    onChange(emitSelection(selectedBrand, selectedModel, null));
  }

  function clearAll() {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedGen(null);
    setStep("brand");
    setBrandSearch("");
    setModelSearch("");
    onChange(null);
  }

  function goBack() {
    if (step === "generation") {
      setStep("model");
      setSelectedGen(null);
      if (selectedBrand && selectedModel) {
        onChange(emitSelection(selectedBrand, selectedModel, null));
      }
    } else if (step === "model") {
      setStep("brand");
      setSelectedModel(null);
      if (isFilter && selectedBrand) {
        onChange(emitSelection(selectedBrand, null, null));
      } else {
        setSelectedBrand(null);
        onChange(null);
      }
    }
  }

  const breadcrumb = [
    selectedBrand?.name,
    selectedModel?.name || (selectedBrand && isFilter ? "все модели" : null),
    selectedGen?.name ?? selectedGen?.code,
  ].filter(Boolean).join(" · ");

  const hasSelection = Boolean(value?.brand || selectedBrand);

  return (
    <div
      className={`space-y-3 ${
        compact
          ? ""
          : "border border-[var(--border)] rounded-2xl p-4 bg-[var(--bg-card)] shadow-[var(--shadow-sm)]"
      }`}
    >
      {/* Summary chips — left to right */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <Chip
            active={step === "brand"}
            filled={!!selectedBrand}
            onClick={() => setStep("brand")}
            label={selectedBrand?.name ?? "Марка"}
          />
          <Chip
            active={step === "model"}
            filled={!!selectedModel}
            disabled={!selectedBrand}
            onClick={() => selectedBrand && setStep("model")}
            label={selectedModel?.name || (isFilter && selectedBrand ? "Все модели" : "Модель")}
          />
          <Chip
            active={step === "generation"}
            filled={!!selectedGen}
            disabled={!selectedModel}
            onClick={() => selectedModel && setStep("generation")}
            label={selectedGen?.name ?? selectedGen?.code ?? "Поколение"}
            optional
          />
        </div>
        {hasSelection && (
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
            aria-label="Сбросить"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {breadcrumb && (
        <p className="text-xs text-[var(--text-muted)] truncate px-0.5">{breadcrumb}</p>
      )}

      {step === "brand" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Поиск марки..."
              className="pl-10 rounded-xl"
            />
          </div>
          {loading && !brands.length ? (
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[76px] h-[84px] rounded-xl bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <p className="text-sm text-center py-6 text-[var(--text-muted)]">Марка не найдена</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const showSections = !brandSearch.trim();
                const { popular, other } = showSections
                  ? splitBrandsByPopularity(brands)
                  : { popular: brands, other: [] as Brand[] };

                const row = (items: Brand[]) => (
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
                    {items.map((brand) => (
                      <div key={brand.id} className="shrink-0 w-[76px] snap-start">
                        <BrandPickerButton
                          brand={brand}
                          selected={selectedBrand?.id === brand.id}
                          onSelect={() => selectBrand(brand)}
                          onLogoResolved={handleLogoResolved}
                        />
                      </div>
                    ))}
                  </div>
                );

                if (!showSections) return row(brands);

                return (
                  <>
                    {popular.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                          Популярные
                        </p>
                        {row(popular)}
                      </div>
                    )}
                    {other.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                          Все марки · {other.length}
                        </p>
                        {row(other)}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {step === "model" && selectedBrand && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder={`Модель ${selectedBrand.name}...`}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          {isFilter && (
            <button
              type="button"
              onClick={() => {
                setSelectedModel(null);
                setSelectedGen(null);
                onChange(emitSelection(selectedBrand, null, null));
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !selectedModel
                  ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              Все модели {selectedBrand.name}
            </button>
          )}

          {modelsLoading ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 h-10 w-24 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <p className="text-sm text-center py-6 text-[var(--text-muted)]">
              {modelSearch ? "Модель не найдена" : "Модели пока не добавлены"}
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => selectModel(model)}
                  className={`shrink-0 snap-start px-4 py-2.5 rounded-full text-sm font-semibold border whitespace-nowrap transition-colors ${
                    selectedModel?.id === model.id
                      ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "generation" && selectedBrand && selectedModel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={goBack}
                className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-sm font-medium truncate">
                {selectedBrand.name} {selectedModel.name}
              </p>
            </div>
            <button
              type="button"
              onClick={confirmWithoutGeneration}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            >
              Без поколения
            </button>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] px-0.5">
            Поколение необязательно · листайте вправо
          </p>

          {generationsLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-none">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[148px] rounded-2xl border border-[var(--border)] overflow-hidden">
                  <div className="aspect-[4/3] bg-[var(--bg-secondary)] animate-pulse" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-[var(--bg-secondary)] rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-[var(--bg-secondary)] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-[var(--text-muted)]">Поколения не найдены</p>
              <button
                type="button"
                onClick={confirmWithoutGeneration}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold"
              >
                Продолжить без поколения
              </button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
              {generations.map((gen) => (
                <GenerationCard
                  key={gen.id}
                  gen={gen}
                  selected={selectedGen?.id === gen.id}
                  onSelect={() => selectGeneration(gen)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  filled,
  disabled,
  optional,
  onClick,
}: {
  label: string;
  active?: boolean;
  filled?: boolean;
  disabled?: boolean;
  optional?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`shrink-0 max-w-[140px] truncate px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
        filled
          ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
          : active
            ? "border-[var(--accent)] bg-[var(--bg-hover)] text-[var(--text-primary)]"
            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-[var(--text-muted)]"}`}
    >
      {label}
      {optional && !filled ? (
        <span className="ml-1 text-[10px] opacity-60 font-normal">необяз.</span>
      ) : null}
    </button>
  );
}
