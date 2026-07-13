"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, Check, Car } from "lucide-react";
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

function GenerationImage({
  gen,
  imageUrl,
  loading,
}: {
  gen: Generation;
  imageUrl: string | null;
  loading: boolean;
}) {
  const title = gen.name ?? gen.code;

  if (isRealCarPhoto(imageUrl)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl!}
        alt={title}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-hover)]">
      {loading ? (
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      ) : (
        <>
          <Car className="w-10 h-10 text-[var(--text-muted)]" strokeWidth={1.5} />
          <p className="text-xs font-bold text-center leading-tight px-1 text-[var(--text-secondary)]">
            {title}
          </p>
        </>
      )}
    </div>
  );
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
      className={`group rounded-lg border overflow-hidden text-left transition-colors ${
        selected ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--text-muted)]"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[var(--bg-secondary)]">
        <GenerationImage gen={gen} imageUrl={imageUrl} loading={loading} />
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full flex items-center justify-center z-10">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="p-3 bg-[var(--bg-card)] space-y-0.5">
        <p className="font-bold text-sm leading-tight">{years}</p>
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        {gen.variants && gen.variants.length > 1 && (
          <p className="text-xs text-[var(--text-muted)] pt-0.5">
            {gen.variants.map((v) => v.label).join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
}

export function CarSelector({ value, onChange, compact }: Props) {
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
  }

  function selectModel(model: Model) {
    setSelectedModel(model);
    setSelectedGen(null);
    setStep("generation");
  }

  function selectGeneration(gen: Generation) {
    setSelectedGen(gen);
    if (!selectedBrand || !selectedModel) return;
    onChange({
      brand: selectedBrand.name,
      brandId: selectedBrand.id,
      model: selectedModel.name,
      modelId: selectedModel.id,
      generation: gen.code,
      generationId: gen.id,
      yearFrom: gen.yearFrom,
      yearTo: gen.yearTo,
    });
  }

  function goBack() {
    if (step === "generation") {
      setStep("model");
      setSelectedGen(null);
    } else if (step === "model") {
      setStep("brand");
      setSelectedModel(null);
      setSelectedBrand(null);
    }
    onChange(null);
  }

  const steps: Step[] = ["brand", "model", "generation"];

  const breadcrumb = [
    selectedBrand?.name,
    selectedModel?.name,
    selectedGen?.name ?? selectedGen?.code,
  ].filter(Boolean).join(" → ");

  return (
    <div className={`space-y-4 ${compact ? "" : "border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-card)]"}`}>
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              step === s
                ? "bg-[var(--accent)]"
                : steps.indexOf(step) > i
                  ? "bg-[var(--text-muted)]"
                  : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {step !== "brand" && (
          <button type="button" onClick={goBack} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {step === "brand" && "Шаг 1 — Марка"}
            {step === "model" && "Шаг 2 — Модель"}
            {step === "generation" && "Шаг 3 — Поколение"}
          </p>
          {breadcrumb && (
            <p className="text-sm font-medium truncate text-[var(--text-secondary)]">{breadcrumb}</p>
          )}
        </div>
      </div>

      {step === "brand" && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Поиск марки..."
              className="pl-10"
            />
          </div>
          {!brandSearch && allBrands.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              Сначала популярные · прокрутите вниз для всех {allBrands.length} марок
            </p>
          )}
          {loading && !brands.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--text-muted)]">Марка не найдена</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4">
              {(() => {
                const showSections = !brandSearch.trim();
                const { popular, other } = showSections
                  ? splitBrandsByPopularity(brands)
                  : { popular: brands, other: [] as Brand[] };

                const renderGrid = (items: Brand[]) => (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                    {items.map((brand) => (
                      <BrandPickerButton
                        key={brand.id}
                        brand={brand}
                        selected={selectedBrand?.id === brand.id}
                        onSelect={() => selectBrand(brand)}
                        onLogoResolved={handleLogoResolved}
                      />
                    ))}
                  </div>
                );

                if (!showSections) return renderGrid(brands);

                return (
                  <>
                    {popular.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 sticky top-0 bg-[var(--bg-card)] py-1 z-10">
                          Популярные
                        </p>
                        {renderGrid(popular)}
                      </div>
                    )}
                    {other.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 sticky top-0 bg-[var(--bg-card)] py-1 z-10">
                          Все марки · {other.length}
                        </p>
                        {renderGrid(other)}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {step === "model" && selectedBrand && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder={`Поиск модели ${selectedBrand.name}...`}
              className="pl-10"
            />
          </div>
          {!modelSearch && allModels.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              Выберите модель · {allModels.length} вариантов
            </p>
          )}
          {modelSearch && (
            <p className="text-xs text-[var(--text-muted)]">
              Найдено · {models.length}
            </p>
          )}
          {modelsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--text-muted)]">
              {modelSearch ? "Модель не найдена" : "Модели для этой марки пока не добавлены"}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => selectModel(model)}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg border text-left transition-colors ${
                    selectedModel?.id === model.id
                      ? "border-[var(--accent)] bg-[var(--bg-hover)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <span className="text-sm font-semibold line-clamp-2">{model.name}</span>
                  {selectedModel?.id === model.id && <Check className="w-4 h-4 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {step === "generation" && selectedBrand && selectedModel && (
        <>
          <p className="text-xs text-[var(--text-muted)]">
            Выберите поколение · {generations.length} вариантов
          </p>
          {generationsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--border)] overflow-hidden">
                  <div className="aspect-[4/3] bg-[var(--bg-secondary)] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse" />
                    <div className="h-3 bg-[var(--bg-secondary)] rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--text-muted)]">
              Поколения для этой модели пока не добавлены
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
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
        </>
      )}
    </div>
  );
}
