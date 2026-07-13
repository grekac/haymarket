"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CarSelector, type CarSelection } from "@/components/cars/CarSelector";
import { TransportSubPicker } from "@/components/listings/TransportSubPicker";
import type { HubCategoryItem } from "@/components/listings/CategoryHubGrid";
import { CITIES, CONDITIONS } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

type AiResult = {
  title: string;
  description: string;
  price: number;
  priceMin: number;
  priceMax: number;
  reasoning?: string;
  comparablesCount?: number;
  source?: string;
};

export function QuickCreateWizard({
  categories,
  transportSubcategories = [],
}: {
  categories: Category[];
  transportSubcategories?: HubCategoryItem[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pickerMode, setPickerMode] = useState<"main" | "transport">("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [carSelection, setCarSelection] = useState<CarSelection | null>(null);
  const [city, setCity] = useState("Ереван");
  const [condition, setCondition] = useState("used");
  const [ai, setAi] = useState<AiResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cat = categories.find((c) => c.id === categoryId)
    ?? transportSubcategories.find((c) => c.id === categoryId);
  const isCarCategory = categorySlug === "cars" || categorySlug === "new-cars";

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Ошибка загрузки");
    return (await res.json()).url as string;
  }

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      setImages((prev) => [...prev, url]);
    }
  }

  async function runAi() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/listing-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          categoryName: cat?.name,
          city,
          condition,
          imageCount: images.length,
          carBrand: carSelection?.brand,
          carModel: carSelection?.model,
          carYear: carSelection?.yearTo ?? carSelection?.yearFrom,
          carMileage: 0,
          carTransmission: "Автомат",
          carEngineType: "Бензин",
        }),
      });
      const data = await res.json();
      setAi(data);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price));
      setStep(3);
    } catch {
      setError("Не удалось сгенерировать описание");
    } finally {
      setLoading(false);
    }
  }

  async function publish(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {
      title,
      description,
      price: Number(price),
      categoryId,
      city,
      condition,
      images,
      aiPriceHint: ai?.price ?? null,
      aiPriceMin: ai?.priceMin ?? null,
      aiPriceMax: ai?.priceMax ?? null,
    };

    if (isCarCategory && carSelection) {
      payload.carDetails = {
        brand: carSelection.brand,
        model: carSelection.model || "—",
        generation: carSelection.generation || null,
        year: carSelection.yearTo ?? new Date().getFullYear(),
        mileage: 0,
        transmission: "Автомат",
        engineType: "Бензин",
        bargainingPossible: true,
      };
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/listing/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const label = "text-sm font-medium text-[var(--text-secondary)] mb-1.5 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
        ))}
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-xl">{error}</p>}

      {step === 1 && pickerMode === "transport" && (
        <TransportSubPicker
          items={transportSubcategories}
          onPick={(item) => {
            setCategoryId(item.id);
            setCategorySlug(item.slug);
            setCarSelection(null);
            setPickerMode("main");
          }}
          onBack={() => setPickerMode("main")}
        />
      )}

      {step === 1 && pickerMode === "main" && (
        <div className="space-y-5">
          <h2 className="font-semibold">Шаг 1: Фото и категория</h2>
          <div>
            <label className={label}>Фотографии</label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                <Upload className="w-5 h-5" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {!categoryId ? (
            <div>
              <label className={label}>Категория *</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (c.slug === "cars" && transportSubcategories.length > 0) {
                        setPickerMode("transport");
                        return;
                      }
                      setCategoryId(c.id);
                      setCategorySlug(c.slug);
                    }}
                    className="p-3 rounded-xl border border-[var(--border)] text-left text-sm font-semibold hover:border-[var(--accent)] transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Категория</p>
                <p className="font-semibold text-sm">{cat?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => { setCategoryId(""); setCategorySlug(""); setCarSelection(null); }}
                className="text-xs text-[var(--accent)] font-medium"
              >
                Изменить
              </button>
            </div>
          )}

          {isCarCategory && categoryId && (
            <CarSelector mode="create" value={carSelection ?? undefined} onChange={setCarSelection} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Город</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)]">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Состояние</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)]">
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!categoryId || (isCarCategory && (!carSelection?.brand || !carSelection?.model))}
            onClick={() => setStep(2)}
          >
            Далее <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 text-center py-6">
          {cat && (
            <p className="text-sm text-[var(--text-muted)]">
              Категория: <span className="font-semibold text-[var(--text-primary)]">{cat.name}</span>
            </p>
          )}
          <Sparkles className="w-12 h-12 mx-auto text-[var(--accent)]" />
          <h2 className="font-semibold text-lg">AI поможет за 5 секунд</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Сгенерируем название, описание и подсказку по цене на основе категории и фото
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" /> Назад</Button>
            <Button className="flex-1" onClick={runAi} disabled={loading}>
              {loading ? "Генерация..." : "Сгенерировать с AI"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={publish} className="space-y-4">
          <h2 className="font-semibold">Шаг 3: Проверьте и опубликуйте</h2>

          {ai && (
            <div className="text-xs bg-[var(--bg-hover)] p-3 rounded-xl space-y-1">
              <p className="font-medium text-[var(--text-secondary)]">
                AI-оценка: {formatPrice(ai.price, "AMD")}
              </p>
              <p className="text-[var(--text-muted)]">
                Диапазон: {formatPrice(ai.priceMin, "AMD")} — {formatPrice(ai.priceMax, "AMD")}
              </p>
              {ai.reasoning && <p className="text-[var(--text-muted)]">{ai.reasoning}</p>}
            </div>
          )}

          <div><label className={label}>Название</label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><label className={label}>Описание</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm" /></div>
          <div><label className={label}>Цена (֏)</label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>Назад</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Публикация..." : "Опубликовать за 30 сек"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
