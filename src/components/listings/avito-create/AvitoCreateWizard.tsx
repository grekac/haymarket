"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import {
  AvitoStepShell,
  AvitoRadioRow,
  AvitoChoicePill,
  AvitoField,
  avitoInputClass,
} from "@/components/listings/avito-create/AvitoStepUi";
import { CarSelector, type CarSelection } from "@/components/cars/CarSelector";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { CITIES, cn } from "@/lib/utils";
import type { HubCategoryItem } from "@/components/listings/CategoryHubGrid";

type Category = { id: string; name: string; slug: string; icon?: string };

const RE_TYPES = [
  { key: "APARTMENT", label: "Квартиры", propertyType: "APARTMENT" },
  { key: "ROOM", label: "Комнаты", propertyType: "APARTMENT", subtype: "room" },
  { key: "HOUSE", label: "Дома, дачи, коттеджи", propertyType: "HOUSE" },
  { key: "LAND", label: "Земельные участки", propertyType: "LAND" },
  { key: "GARAGE", label: "Гаражи и машиноместа", propertyType: "COMMERCIAL", subtype: "garage" },
  { key: "COMMERCIAL", label: "Коммерческая недвижимость", propertyType: "COMMERCIAL" },
  { key: "ABROAD", label: "Недвижимость за рубежом", propertyType: "APARTMENT", subtype: "abroad" },
] as const;

const DEAL_TYPES = [
  { key: "sell", label: "Продам", dealType: "SALE", intent: "sell" },
  { key: "rent_out", label: "Сдам", dealType: "RENT", intent: "rent_out" },
  { key: "buy", label: "Куплю", dealType: "SALE", intent: "buy" },
  { key: "rent_in", label: "Сниму", dealType: "RENT", intent: "rent_in" },
] as const;

const MARKET_TYPES = [
  { key: "secondary", label: "Вторичка" },
  { key: "new", label: "Новостройка" },
] as const;

const CAR_FLOW_SLUGS = new Set(["cars", "new-cars", "motorcycles", "trucks", "water-transport"]);

export function AvitoCreateWizard({
  categories,
  transportSubcategories = [],
  initialCategorySlug,
}: {
  categories: Category[];
  transportSubcategories?: HubCategoryItem[];
  initialCategorySlug?: string;
}) {
  const slug = initialCategorySlug ?? "";
  const category =
    categories.find((c) => c.slug === slug) ??
    transportSubcategories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <CreateListingForm
        categories={categories}
        transportSubcategories={transportSubcategories}
        initialCategorySlug={initialCategorySlug}
      />
    );
  }

  if (slug === "real-estate") {
    return <RealEstateWizard categoryId={category.id} />;
  }

  if (CAR_FLOW_SLUGS.has(slug) || slug === "car-parts") {
    return <CarWizard categoryId={category.id} categorySlug={slug} isParts={slug === "car-parts"} />;
  }

  return (
    <CreateListingForm
      categories={categories}
      transportSubcategories={transportSubcategories}
      initialCategorySlug={initialCategorySlug}
    />
  );
}

/* ───────── Real estate ───────── */

function RealEstateWizard({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [reType, setReType] = useState<(typeof RE_TYPES)[number] | null>(null);
  const [deal, setDeal] = useState<(typeof DEAL_TYPES)[number] | null>(null);
  const [market, setMarket] = useState<(typeof MARKET_TYPES)[number] | null>(null);
  const [address, setAddress] = useState("");
  const [aptNo, setAptNo] = useState("");
  const [city, setCity] = useState("Ереван");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const needsMarket = reType?.key === "APARTMENT" || reType?.key === "ROOM";

  function back() {
    if (step === 0) router.push("/create");
    else setStep((s) => s - 1);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) continue;
      const data = await res.json();
      setImages((prev) => [...prev, data.url]);
    }
  }

  async function submit() {
    if (!reType || !deal) return;
    setLoading(true);
    setError("");
    try {
      const autoTitle =
        title.trim() ||
        `${reType.label.replace(/ы$/, "а")} · ${deal.label}${area ? ` · ${area} м²` : ""}`;
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle,
          description: description.trim() || `${deal.label}. ${reType.label}. ${address || city}`,
          price: Number(price) || 0,
          categoryId,
          city,
          address: address.trim() || null,
          images,
          videoUrl: videoUrl.trim() || null,
          realEstate: {
            propertyType: reType.propertyType,
            dealType: deal.dealType,
            rooms: rooms ? Number(rooms) : null,
            area: area ? Number(area) : 1,
            floor: null,
            totalFloors: null,
            furniture: false,
            parking: false,
          },
          attributes: {
            intent: deal.intent,
            reSubtype: "subtype" in reType ? reType.subtype : null,
            marketType: market?.key ?? null,
            apartmentNumber: aptNo || null,
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Ошибка");
      }
      router.push("/my");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (step === 0) {
    return (
      <AvitoStepShell title="Недвижимость" onBack={back}>
        <div className="divide-y divide-[var(--border)]/40">
          {RE_TYPES.map((t) => (
            <AvitoRadioRow
              key={t.key}
              label={t.label}
              selected={reType?.key === t.key}
              onClick={() => {
                setReType(t);
                setStep(1);
              }}
            />
          ))}
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 1 && reType) {
    return (
      <AvitoStepShell title={reType.label} onBack={back}>
        <div className="divide-y divide-[var(--border)]/40">
          {DEAL_TYPES.map((d) => (
            <AvitoRadioRow
              key={d.key}
              label={d.label}
              selected={deal?.key === d.key}
              onClick={() => {
                setDeal(d);
                setStep(needsMarket ? 2 : 3);
              }}
            />
          ))}
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 2 && needsMarket) {
    return (
      <AvitoStepShell title="Вид объекта" onBack={back} showSaveExit>
        <div className="divide-y divide-[var(--border)]/40">
          {MARKET_TYPES.map((m) => (
            <AvitoRadioRow
              key={m.key}
              label={m.label}
              selected={market?.key === m.key}
              onClick={() => {
                setMarket(m);
                setStep(3);
              }}
            />
          ))}
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 3) {
    return (
      <AvitoStepShell
        title="Расположение"
        onBack={back}
        showSaveExit
        onContinue={() => setStep(4)}
        continueDisabled={!address.trim()}
      >
        <div className="space-y-5">
          <AvitoField label="Город">
            <select
              className={avitoInputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </AvitoField>
          <AvitoField label="Адрес">
            <input
              className={avitoInputClass}
              placeholder="Улица и номер дома"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </AvitoField>
          {(reType?.key === "APARTMENT" || reType?.key === "ROOM") && (
            <AvitoField label="Номер квартиры" hint="Номер никто не увидит">
              <input
                className={avitoInputClass}
                value={aptNo}
                onChange={(e) => setAptNo(e.target.value)}
              />
            </AvitoField>
          )}
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 4) {
    return (
      <AvitoStepShell
        title="Покажите объект"
        subtitle="Добавьте фото — так объявление заметят быстрее."
        onBack={back}
        showSaveExit
        onContinue={() => setStep(5)}
        continueDisabled={images.length === 0}
      >
        <PhotoBlock
          images={images}
          videoUrl={videoUrl}
          fileRef={fileRef}
          onPick={() => fileRef.current?.click()}
          onFiles={uploadFiles}
          onRemove={(url) => setImages((p) => p.filter((u) => u !== url))}
          onVideo={setVideoUrl}
        />
      </AvitoStepShell>
    );
  }

  return (
    <AvitoStepShell
      title="Детали и цена"
      onBack={back}
      showSaveExit
      continueLabel={loading ? "Отправка…" : "Разместить объявление"}
      onContinue={submit}
      continueDisabled={loading || !price || !area}
    >
      <div className="space-y-5">
        <AvitoField label="Заголовок">
          <input
            className={avitoInputClass}
            placeholder="Например: 2-комнатная в центре"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </AvitoField>
        <div className="grid grid-cols-2 gap-3">
          <AvitoField label="Площадь, м²">
            <input
              className={avitoInputClass}
              inputMode="decimal"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </AvitoField>
          <AvitoField label="Комнат">
            <input
              className={avitoInputClass}
              inputMode="numeric"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </AvitoField>
        </div>
        <AvitoField label="Цена, AMD">
          <input
            className={avitoInputClass}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </AvitoField>
        <AvitoField label="Описание">
          <textarea
            className={cn(avitoInputClass, "h-28 py-3 resize-none")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </AvitoField>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </AvitoStepShell>
  );
}

/* ───────── Cars / transport ───────── */

function CarWizard({
  categoryId,
  categorySlug,
  isParts,
}: {
  categoryId: string;
  categorySlug: string;
  isParts: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [car, setCar] = useState<CarSelection | null>(null);
  const [plateMain, setPlateMain] = useState("");
  const [plateRegion, setPlateRegion] = useState("");
  const [onRegister, setOnRegister] = useState<boolean | null>(true);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [city, setCity] = useState("Ереван");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function back() {
    if (step === 0) router.push("/create");
    else setStep((s) => s - 1);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) continue;
      const data = await res.json();
      setImages((prev) => [...prev, data.url]);
    }
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const autoTitle =
        title.trim() ||
        (isParts
          ? "Запчасти и аксессуары"
          : [car?.brand, car?.model, car?.yearFrom].filter(Boolean).join(" "));

      const plate =
        plateMain.trim() || plateRegion.trim()
          ? `${plateMain.trim()} ${plateRegion.trim()}`.trim()
          : null;

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle || "Авто",
          description:
            description.trim() ||
            `${autoTitle}. ${city}.${plate ? " Госномер проверен." : ""}`,
          price: Number(price) || 0,
          categoryId,
          city,
          images,
          videoUrl: videoUrl.trim() || null,
          condition: "used",
          carDetails: isParts
            ? undefined
            : {
                brand: car?.brand || "—",
                model: car?.model || "—",
                generation: car?.generation || null,
                year: car?.yearFrom || new Date().getFullYear(),
                mileage: Number(mileage) || 0,
                engineType: "Бензин",
                transmission: "Автомат",
                driveType: null,
                bodyType: null,
                color: null,
                engineVolume: null,
                power: null,
                ownersCount: null,
                vin: null,
                customsCleared: true,
              },
          attributes: {
            plateNumber: plate,
            plateOnRegister: onRegister,
            categorySlug,
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Ошибка");
      }
      router.push("/my");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  // Parts skip car selector / plate deep flow — still photos + details
  if (isParts) {
    if (step === 0) {
      return (
        <AvitoStepShell
          title="Покажите товар"
          subtitle="Добавьте фото запчасти или аксессуара."
          onBack={back}
          showSaveExit
          onContinue={() => setStep(1)}
          continueDisabled={images.length === 0}
        >
          <PhotoBlock
            images={images}
            videoUrl={videoUrl}
            fileRef={fileRef}
            onPick={() => fileRef.current?.click()}
            onFiles={uploadFiles}
            onRemove={(url) => setImages((p) => p.filter((u) => u !== url))}
            onVideo={setVideoUrl}
          />
        </AvitoStepShell>
      );
    }
    return (
      <AvitoStepShell
        title="Детали и цена"
        onBack={back}
        showSaveExit
        continueLabel={loading ? "Отправка…" : "Разместить объявление"}
        onContinue={submit}
        continueDisabled={loading || !price || !title.trim()}
      >
        <div className="space-y-5">
          <AvitoField label="Название">
            <input className={avitoInputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </AvitoField>
          <AvitoField label="Цена, AMD">
            <input className={avitoInputClass} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </AvitoField>
          <AvitoField label="Город">
            <select className={avitoInputClass} value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </AvitoField>
          <AvitoField label="Описание">
            <textarea className={cn(avitoInputClass, "h-28 py-3 resize-none")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </AvitoField>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 0) {
    return (
      <AvitoStepShell
        title="Какое авто?"
        onBack={back}
        showSaveExit
        onContinue={() => setStep(1)}
        continueDisabled={!car?.brand || !car?.model}
      >
        <CarSelector value={car ?? undefined} onChange={setCar} />
      </AvitoStepShell>
    );
  }

  if (step === 1) {
    return (
      <AvitoStepShell
        title="Государственный номер"
        subtitle="Мы убедимся, что VIN и госномер принадлежат одному авто. Покупатели данные не увидят"
        onBack={back}
        showSaveExit
        onContinue={() => setStep(2)}
      >
        <div className="space-y-6">
          <div className="flex h-16 rounded-2xl bg-[var(--bg-secondary)] overflow-hidden">
            <input
              className="flex-1 bg-transparent px-4 text-[18px] tracking-widest outline-none placeholder:text-[var(--text-muted)] uppercase"
              placeholder="о 000 оо"
              value={plateMain}
              onChange={(e) => setPlateMain(e.target.value)}
            />
            <div className="w-px bg-[var(--border)]" />
            <div className="w-20 flex flex-col items-center justify-center">
              <input
                className="w-full bg-transparent text-center text-[15px] outline-none placeholder:text-[var(--text-muted)]"
                placeholder="000"
                value={plateRegion}
                onChange={(e) => setPlateRegion(e.target.value)}
                maxLength={3}
              />
              <span className="text-[10px] text-[var(--text-muted)] font-semibold">AM</span>
            </div>
          </div>

          <div>
            <p className="text-[16px] font-semibold mb-3">Машина стоит на учёте в ГАИ?</p>
            <div className="grid grid-cols-2 gap-2">
              <AvitoChoicePill label="Да" selected={onRegister === true} onClick={() => setOnRegister(true)} />
              <AvitoChoicePill label="Нет" selected={onRegister === false} onClick={() => setOnRegister(false)} />
            </div>
          </div>
        </div>
      </AvitoStepShell>
    );
  }

  if (step === 2) {
    return (
      <AvitoStepShell
        title="Покажите машину снаружи и внутри"
        subtitle="Хотя бы на одном фото должен быть госномер — без него не получится разместить объявление. Сам номер спрячем за табличкой."
        onBack={back}
        showSaveExit
        onContinue={() => setStep(3)}
        continueDisabled={images.length === 0}
      >
        <PhotoBlock
          images={images}
          videoUrl={videoUrl}
          fileRef={fileRef}
          onPick={() => fileRef.current?.click()}
          onFiles={uploadFiles}
          onRemove={(url) => setImages((p) => p.filter((u) => u !== url))}
          onVideo={setVideoUrl}
          carMode
        />
      </AvitoStepShell>
    );
  }

  return (
    <AvitoStepShell
      title="Детали и цена"
      onBack={back}
      showSaveExit
      continueLabel={loading ? "Отправка…" : "Разместить объявление"}
      onContinue={submit}
      continueDisabled={loading || !price}
    >
      <div className="space-y-5">
        <AvitoField label="Пробег, км">
          <input className={avitoInputClass} inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} />
        </AvitoField>
        <AvitoField label="Цена, AMD">
          <input className={avitoInputClass} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
        </AvitoField>
        <AvitoField label="Город">
          <select className={avitoInputClass} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </AvitoField>
        <AvitoField label="Описание">
          <textarea className={cn(avitoInputClass, "h-28 py-3 resize-none")} value={description} onChange={(e) => setDescription(e.target.value)} />
        </AvitoField>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </AvitoStepShell>
  );
}

function PhotoBlock({
  images,
  videoUrl,
  fileRef,
  onPick,
  onFiles,
  onRemove,
  onVideo,
  carMode,
}: {
  images: string[];
  videoUrl: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onFiles: (files: FileList | null) => void;
  onRemove: (url: string) => void;
  onVideo: (v: string) => void;
  carMode?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[15px] font-semibold mb-3">Фото</p>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[var(--bg-secondary)]">
              <Image src={url} alt="" fill unoptimized className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onPick}
            className="w-24 h-24 rounded-2xl bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-1 text-[var(--text-primary)]"
          >
            <Camera className="w-6 h-6" />
            <span className="text-[12px] font-medium">Добавить</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      <AvitoField label={carMode ? "Видео с Rutube или VK Видео" : "Ссылка на видео"}>
        <input
          className={avitoInputClass}
          placeholder="Ссылка на видео"
          value={videoUrl}
          onChange={(e) => onVideo(e.target.value)}
        />
      </AvitoField>
    </div>
  );
}
