"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CarSelector, type CarSelection } from "@/components/cars/CarSelector";
import { CategoryFieldsForm } from "@/components/listings/CategoryFieldsForm";
import { CategoryIcon, CATEGORY_GRADIENT } from "@/components/listings/CategoryIcon";
import { TransportSubPicker } from "@/components/listings/TransportSubPicker";
import type { HubCategoryItem } from "@/components/listings/CategoryHubGrid";
import { collectAttributesFromForm, hasCategoryFields, REAL_ESTATE_EXTRA_FIELDS } from "@/lib/category-fields";
import { collectRealEstateExtrasFromForm, mergeRealEstateAttributes } from "@/lib/real-estate-extra";
import { PriceEstimateInline } from "@/components/listings/PriceEstimatePanel";
import { CITIES, CONDITIONS, TRANSMISSIONS, ENGINE_TYPES, DRIVE_TYPES, BODY_TYPES, PROPERTY_TYPES } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; icon?: string };

const selectClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)]";

const RENOVATION_OPTIONS = [
  { value: "designer", label: "Дизайнерский" },
  { value: "euro", label: "Евроремонт" },
  { value: "cosmetic", label: "Косметический" },
  { value: "needs", label: "Требует ремонта" },
  { value: "none", label: "Без ремонта" },
];

const HEATING_OPTIONS = [
  { value: "central", label: "Центральное" },
  { value: "gas", label: "Газовое" },
  { value: "electric", label: "Электрическое" },
  { value: "individual", label: "Индивидуальное" },
  { value: "none", label: "Нет" },
];

const BALCONY_OPTIONS = [
  { value: "none", label: "Нет" },
  { value: "balcony", label: "Балкон" },
  { value: "loggia", label: "Лоджия" },
  { value: "two", label: "2 балкона/лоджии" },
];

export function CreateListingForm({
  categories,
  transportSubcategories = [],
  initialCategorySlug,
}: {
  categories: Category[];
  transportSubcategories?: HubCategoryItem[];
  initialCategorySlug?: string;
}) {
  const router = useRouter();
  const initialCat = initialCategorySlug
    ? categories.find((c) => c.slug === initialCategorySlug)
      ?? transportSubcategories.find((c) => c.slug === initialCategorySlug)
    : undefined;

  const [step, setStep] = useState(initialCat ? 2 : 1);
  const [pickerMode, setPickerMode] = useState<"main" | "transport">("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(initialCat?.id ?? "");
  const [categorySlug, setCategorySlug] = useState(initialCat?.slug ?? "");
  const [images, setImages] = useState<string[]>([]);
  const [carSelection, setCarSelection] = useState<CarSelection | null>(null);
  const [aiEstimate, setAiEstimate] = useState<{
    price: number;
    priceMin: number;
    priceMax: number;
    reasoning: string;
    comparablesCount: number;
    source: string;
  } | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId)
    ?? transportSubcategories.find((c) => c.id === categoryId);
  const isCar = categorySlug === "cars" || categorySlug === "new-cars";
  const isRealEstate = categorySlug === "real-estate";
  const showAttributes = hasCategoryFields(categorySlug);

  function pickCategory(cat: Category) {
    if (cat.slug === "cars" && transportSubcategories.length > 0) {
      setPickerMode("transport");
      return;
    }
    setCategoryId(cat.id);
    setCategorySlug(cat.slug);
    setCarSelection(null);
    setStep(2);
  }

  function pickTransportSub(item: HubCategoryItem) {
    setCategoryId(item.id);
    setCategorySlug(item.slug);
    setCarSelection(null);
    setPickerMode("main");
    setStep(2);
  }

  function canGoStep3() {
    if (isCar && !carSelection) return false;
    return true;
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Ошибка загрузки");
    const data = await res.json();
    return data.url as string;
  }

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      setImages((prev) => [...prev, url]);
    }
  }

  async function runPriceEstimate() {
    if (!carSelection || !formRef.current) return;
    setEstimateLoading(true);
    setAiEstimate(null);
    try {
      const fd = new FormData(formRef.current);
      const res = await fetch("/api/ai/price-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: carSelection.brand,
          model: carSelection.model,
          generation: carSelection.generation,
          year: Number(fd.get("year")) || carSelection.yearTo || new Date().getFullYear(),
          mileage: Number(fd.get("mileage")) || 0,
          transmission: fd.get("transmission"),
          engineType: fd.get("engineType"),
          engineVolume: fd.get("engineVolume") ? Number(fd.get("engineVolume")) : null,
          power: fd.get("power") ? Number(fd.get("power")) : null,
          driveType: fd.get("driveType") || null,
          bodyType: fd.get("bodyType") || null,
          condition: fd.get("condition") || "used",
          city: fd.get("city") || "Ереван",
          listedPrice: fd.get("price") ? Number(fd.get("price")) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка оценки");
      setAiEstimate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось оценить цену");
    } finally {
      setEstimateLoading(false);
    }
  }

  function applyAiPrice() {
    if (!aiEstimate || !priceRef.current) return;
    priceRef.current.value = String(aiEstimate.price);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const cat = selectedCategory;

    const payload: Record<string, unknown> = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: fd.get("price"),
      categoryId,
      city: fd.get("city"),
      district: fd.get("district"),
      address: fd.get("address"),
      condition: fd.get("condition"),
      images,
    };

    if (cat?.slug === "cars" || cat?.slug === "new-cars") {
      if (!carSelection) {
        setError("Выберите марку, модель и поколение автомобиля");
        setLoading(false);
        return;
      }
      payload.carDetails = {
        brand: carSelection.brand,
        model: carSelection.model,
        generation: carSelection.generation,
        year: Number(fd.get("year")),
        vin: fd.get("vin") || null,
        mileage: Number(fd.get("mileage")),
        transmission: fd.get("transmission"),
        engineType: fd.get("engineType"),
        engineVolume: fd.get("engineVolume") ? Number(fd.get("engineVolume")) : null,
        power: fd.get("power") ? Number(fd.get("power")) : null,
        driveType: fd.get("driveType") || null,
        bodyType: fd.get("bodyType") || null,
        color: fd.get("color") || null,
        ownersCount: fd.get("ownersCount") ? Number(fd.get("ownersCount")) : null,
        customsCleared: fd.get("customsCleared") === "on",
        exchangePossible: fd.get("exchangePossible") === "on",
        bargainingPossible: fd.get("bargainingPossible") === "on",
      };
    }

    if (cat?.slug === "real-estate") {
      payload.realEstate = {
        dealType: fd.get("dealType") || "SALE",
        propertyType: fd.get("propertyType"),
        area: Number(fd.get("area")),
        rooms: fd.get("rooms") ? Number(fd.get("rooms")) : null,
        floor: fd.get("floor") ? Number(fd.get("floor")) : null,
        totalFloors: fd.get("totalFloors") ? Number(fd.get("totalFloors")) : null,
        buildingYear: fd.get("buildingYear") ? Number(fd.get("buildingYear")) : null,
        renovationType: fd.get("renovationType") || null,
        heating: fd.get("heating") || null,
        balcony: fd.get("balcony") || null,
        bathrooms: fd.get("bathrooms") ? Number(fd.get("bathrooms")) : null,
        furniture: fd.get("furniture") === "on",
        parking: fd.get("parking") === "on",
      };
      const reExtras = collectRealEstateExtrasFromForm(fd);
      const merged = mergeRealEstateAttributes(null, reExtras);
      if (merged) payload.attributes = merged;
    }

    if (cat && showAttributes) {
      const attrs = collectAttributesFromForm(cat.slug, fd);
      if (attrs) payload.attributes = attrs;
    }

    if (aiEstimate && isCar) {
      payload.aiPriceHint = aiEstimate.price;
      payload.aiPriceMin = aiEstimate.priceMin;
      payload.aiPriceMax = aiEstimate.priceMax;
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

  const CategoryChip = () =>
    selectedCategory ? (
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ${
              CATEGORY_GRADIENT[categorySlug] ?? CATEGORY_GRADIENT.other
            }`}
          >
            {"icon" in selectedCategory && selectedCategory.icon && (
              <CategoryIcon name={selectedCategory.icon} className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Категория</p>
            <p className="font-semibold text-sm">{selectedCategory?.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-xs font-medium text-[var(--accent)] hover:underline shrink-0"
        >
          Изменить
        </button>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step >= s ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-xl">{error}</p>
      )}

      {step === 1 && pickerMode === "transport" && (
        <TransportSubPicker
          items={transportSubcategories}
          onPick={pickTransportSub}
          onBack={() => setPickerMode("main")}
        />
      )}

      {step === 1 && pickerMode === "main" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Выберите категорию</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all text-left"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ${
                    CATEGORY_GRADIENT[c.slug] ?? CATEGORY_GRADIENT.other
                  }`}
                >
                  {c.icon && <CategoryIcon name={c.icon} className="w-5 h-5 text-white" />}
                </div>
                <span className="font-semibold text-sm">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step >= 2 && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="categoryId" value={categoryId} />
          <CategoryChip />

          {step === 2 && (
            <>
              <div>
                <label className={label}>Фотографии</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
              </div>

              {isCar && (
        <fieldset className="space-y-4 border border-[var(--border)] rounded-2xl p-5">
          <legend className="font-bold px-2">Автомобиль</legend>
          <CarSelector value={carSelection ?? undefined} onChange={setCarSelection} />
          {carSelection && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Год выпуска *</label>
                <Input
                  name="year"
                  type="number"
                  required
                  min={carSelection.yearFrom}
                  max={carSelection.yearTo ?? new Date().getFullYear()}
                  defaultValue={carSelection.yearTo ?? new Date().getFullYear()}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Пробег (км) *</label>
              <Input name="mileage" type="number" required min={0} />
            </div>
            <div>
              <label className={label}>КПП *</label>
              <select name="transmission" required className={selectClass}>
                {TRANSMISSIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Двигатель *</label>
              <select name="engineType" required className={selectClass}>
                {ENGINE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Объём (л)</label>
              <Input name="engineVolume" type="number" step="0.1" />
            </div>
            <div>
              <label className={label}>Мощность (л.с.)</label>
              <Input name="power" type="number" />
            </div>
            <div>
              <label className={label}>Привод</label>
              <select name="driveType" className={selectClass}>
                <option value="">—</option>
                {DRIVE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Кузов</label>
              <select name="bodyType" className={selectClass}>
                <option value="">—</option>
                {BODY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Цвет</label>
              <Input name="color" />
            </div>
            <div>
              <label className={label}>VIN</label>
              <Input name="vin" />
            </div>
            <div>
              <label className={label}>Владельцев</label>
              <Input name="ownersCount" type="number" min={1} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="customsCleared" defaultChecked /> Растаможен
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="exchangePossible" /> Обмен
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="bargainingPossible" defaultChecked /> Торг
            </label>
          </div>
        </fieldset>
      )}

      {isRealEstate && (
        <fieldset className="space-y-4 border border-[var(--border)] rounded-2xl p-5">
          <legend className="font-bold px-2">Недвижимость</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Сделка *</label>
              <select name="dealType" required className={selectClass} defaultValue="SALE">
                <option value="SALE">Продажа</option>
                <option value="RENT">Аренда</option>
              </select>
            </div>
            <div>
              <label className={label}>Тип *</label>
              <select name="propertyType" required className={selectClass}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Площадь (м²) *</label>
              <Input name="area" type="number" required step="0.1" min={1} />
            </div>
            <div>
              <label className={label}>Комнат *</label>
              <Input name="rooms" type="number" required min={0} max={20} />
            </div>
            <div>
              <label className={label}>Этаж</label>
              <Input name="floor" type="number" />
            </div>
            <div>
              <label className={label}>Этажей в доме</label>
              <Input name="totalFloors" type="number" />
            </div>
            <div>
              <label className={label}>Год постройки</label>
              <Input name="buildingYear" type="number" min={1900} max={2030} />
            </div>
            <div>
              <label className={label}>Санузлов</label>
              <Input name="bathrooms" type="number" min={1} max={10} />
            </div>
            <div>
              <label className={label}>Ремонт</label>
              <select name="renovationType" className={selectClass}>
                <option value="">—</option>
                {RENOVATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Отопление</label>
              <select name="heating" className={selectClass}>
                <option value="">—</option>
                {HEATING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Балкон / лоджия</label>
              <select name="balcony" className={selectClass}>
                <option value="">—</option>
                {BALCONY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="furniture" /> С мебелью
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="parking" /> Парковка / гараж
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="re_airConditioning" /> Кондиционер
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
            {REAL_ESTATE_EXTRA_FIELDS.filter((f) =>
              ["livingArea", "kitchenArea", "buildingMaterial", "ceilingHeight", "commercialSubtype", "commercialPurpose", "landPurpose"].includes(f.key)
            ).map((field) => (
              <div key={field.key}>
                <label className={label}>{field.label}</label>
                {field.type === "select" ? (
                  <select name={`re_${field.key}`} className={selectClass}>
                    <option value="">—</option>
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name={`re_${field.key}`}
                    type={field.type === "number" ? "number" : "text"}
                    step={field.step}
                    min={field.min}
                  />
                )}
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {showAttributes && <CategoryFieldsForm categorySlug={categorySlug} />}

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4" /> Назад
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!canGoStep3()}
                  onClick={() => setStep(3)}
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold">Описание и публикация</h2>
              <div>
                <label className={label}>Название *</label>
                <Input name="title" required maxLength={120} placeholder="Кратко о товаре" />
              </div>
              <div>
                <label className={label}>Описание *</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="Подробности, комплектация, причина продажи..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Цена (֏) *</label>
                  <Input name="price" ref={priceRef} type="number" required min={0} placeholder="0 = договорная" />
                </div>
                <div>
                  <label className={label}>Состояние</label>
                  <select name="condition" className={selectClass} defaultValue="used">
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isCar && carSelection && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={runPriceEstimate}
                    disabled={estimateLoading}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4" />
                    {estimateLoading ? "Оцениваем..." : "Оценить цену AI"}
                  </Button>
                  {aiEstimate && (
                    <PriceEstimateInline
                      estimate={aiEstimate}
                      onApply={applyAiPrice}
                      loading={estimateLoading}
                    />
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Город *</label>
                  <select name="city" required className={selectClass}>
                    <option value="">Выберите</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Район</label>
                  <Input name="district" placeholder="Кентрон, Арабкир..." />
                </div>
              </div>
              <div>
                <label className={label}>Адрес</label>
                <Input name="address" placeholder="Улица, дом" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-4 h-4" /> Назад
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="flex-1">
                  {loading ? "Публикация..." : "Опубликовать"}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
