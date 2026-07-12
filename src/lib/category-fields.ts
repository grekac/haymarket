/** Поля объявления по категориям — по образцу Авито */

export type FieldType = "text" | "number" | "select" | "checkbox" | "textarea";

export type CategoryField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Показывать только если другое поле имеет значение */
  showIf?: { key: string; values: string[] };
  half?: boolean;
};

export type CategoryFieldGroup = {
  title: string;
  fields: CategoryField[];
};

const ELECTRONICS_SUBCATEGORIES = [
  { value: "phone", label: "Телефоны" },
  { value: "laptop", label: "Ноутбуки" },
  { value: "tablet", label: "Планшеты" },
  { value: "tv", label: "Телевизоры и мониторы" },
  { value: "audio", label: "Аудио и наушники" },
  { value: "gaming", label: "Игровые приставки" },
  { value: "photo", label: "Фото и видео" },
  { value: "appliance", label: "Бытовая техника" },
  { value: "accessories", label: "Аксессуары" },
  { value: "other", label: "Другое" },
];

const STORAGE_OPTIONS = [
  { value: "16", label: "16 ГБ" },
  { value: "32", label: "32 ГБ" },
  { value: "64", label: "64 ГБ" },
  { value: "128", label: "128 ГБ" },
  { value: "256", label: "256 ГБ" },
  { value: "512", label: "512 ГБ" },
  { value: "1024", label: "1 ТБ" },
  { value: "2048", label: "2 ТБ" },
];

const RAM_OPTIONS = [
  { value: "4", label: "4 ГБ" },
  { value: "8", label: "8 ГБ" },
  { value: "16", label: "16 ГБ" },
  { value: "32", label: "32 ГБ" },
  { value: "64", label: "64 ГБ" },
];

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

export const CATEGORY_FIELD_GROUPS: Record<string, CategoryFieldGroup[]> = {
  electronics: [
    {
      title: "Электроника",
      fields: [
        { key: "subcategory", label: "Тип товара", type: "select", required: true, options: ELECTRONICS_SUBCATEGORIES },
        { key: "brand", label: "Бренд", type: "text", required: true, placeholder: "Apple, Samsung, Xiaomi..." },
        { key: "model", label: "Модель", type: "text", required: true, placeholder: "iPhone 15 Pro, Galaxy S24..." },
        {
          key: "storage",
          label: "Память",
          type: "select",
          options: STORAGE_OPTIONS,
          showIf: { key: "subcategory", values: ["phone", "tablet", "laptop"] },
        },
        {
          key: "ram",
          label: "ОЗУ",
          type: "select",
          options: RAM_OPTIONS,
          showIf: { key: "subcategory", values: ["laptop"] },
        },
        {
          key: "screenSize",
          label: "Диагональ",
          type: "text",
          placeholder: '55", 27", 6.7"',
          showIf: { key: "subcategory", values: ["tv", "laptop", "tablet"] },
        },
        { key: "color", label: "Цвет", type: "text", placeholder: "Чёрный, белый..." },
        { key: "warranty", label: "На гарантии", type: "checkbox" },
      ],
    },
  ],

  jobs: [
    {
      title: "Вакансия",
      fields: [
        { key: "position", label: "Должность", type: "text", required: true, placeholder: "Менеджер, водитель..." },
        {
          key: "employmentType",
          label: "Тип занятости",
          type: "select",
          required: true,
          options: [
            { value: "full", label: "Полная занятость" },
            { value: "part", label: "Частичная занятость" },
            { value: "remote", label: "Удалённая работа" },
            { value: "contract", label: "Проектная / подряд" },
            { value: "internship", label: "Стажировка" },
          ],
        },
        {
          key: "experience",
          label: "Опыт работы",
          type: "select",
          options: [
            { value: "none", label: "Без опыта" },
            { value: "1-3", label: "1–3 года" },
            { value: "3-6", label: "3–6 лет" },
            { value: "6+", label: "Более 6 лет" },
          ],
        },
        {
          key: "schedule",
          label: "График",
          type: "select",
          options: [
            { value: "full-day", label: "Полный день" },
            { value: "shift", label: "Сменный" },
            { value: "flexible", label: "Гибкий" },
            { value: "weekends", label: "По выходным" },
          ],
        },
        { key: "salaryFrom", label: "Зарплата от (֏)", type: "number", min: 0 },
        { key: "salaryTo", label: "Зарплата до (֏)", type: "number", min: 0 },
        { key: "salaryNegotiable", label: "Зарплата по договорённости", type: "checkbox" },
      ],
    },
  ],

  services: [
    {
      title: "Услуга",
      fields: [
        {
          key: "serviceType",
          label: "Тип услуги",
          type: "select",
          required: true,
          options: [
            { value: "repair", label: "Ремонт и строительство" },
            { value: "cleaning", label: "Уборка" },
            { value: "transport", label: "Перевозки" },
            { value: "beauty", label: "Красота и здоровье" },
            { value: "education", label: "Обучение" },
            { value: "it", label: "IT и digital" },
            { value: "legal", label: "Юридические" },
            { value: "other", label: "Другое" },
          ],
        },
        {
          key: "priceType",
          label: "Цена",
          type: "select",
          required: true,
          options: [
            { value: "fixed", label: "Фиксированная" },
            { value: "from", label: "От (минимальная)" },
            { value: "negotiable", label: "По договорённости" },
            { value: "free", label: "Бесплатно" },
          ],
        },
        {
          key: "workFormat",
          label: "Формат",
          type: "select",
          options: [
            { value: "on-site", label: "У заказчика" },
            { value: "at-provider", label: "У исполнителя" },
            { value: "remote", label: "Онлайн / удалённо" },
          ],
        },
        { key: "experience", label: "Опыт (лет)", type: "number", min: 0 },
      ],
    },
  ],

  "home-furniture": [
    {
      title: "Товар для дома",
      fields: [
        {
          key: "itemType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "furniture", label: "Мебель" },
            { value: "appliances", label: "Бытовая техника" },
            { value: "kitchen", label: "Кухня" },
            { value: "decor", label: "Декор и текстиль" },
            { value: "garden", label: "Сад и дача" },
            { value: "tools", label: "Инструменты" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "brand", label: "Бренд", type: "text", placeholder: "IKEA, Bosch..." },
        { key: "material", label: "Материал", type: "text", placeholder: "Дерево, металл, ДСП..." },
        { key: "dimensions", label: "Размеры", type: "text", placeholder: "200×90×80 см" },
        { key: "delivery", label: "Доставка возможна", type: "checkbox" },
        { key: "assembly", label: "Сборка включена", type: "checkbox" },
      ],
    },
  ],

  clothing: [
    {
      title: "Одежда",
      fields: [
        {
          key: "clothingType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "men", label: "Мужская" },
            { value: "women", label: "Женская" },
            { value: "kids", label: "Детская" },
            { value: "shoes", label: "Обувь" },
            { value: "accessories", label: "Аксессуары" },
            { value: "bags", label: "Сумки" },
          ],
        },
        { key: "brand", label: "Бренд", type: "text", placeholder: "Zara, Nike, Adidas..." },
        { key: "size", label: "Размер", type: "text", required: true, placeholder: "M, 42, 104..." },
        {
          key: "season",
          label: "Сезон",
          type: "select",
          options: [
            { value: "summer", label: "Лето" },
            { value: "winter", label: "Зима" },
            { value: "demi", label: "Демисезон" },
            { value: "all", label: "Всесезон" },
          ],
        },
        { key: "color", label: "Цвет", type: "text" },
      ],
    },
  ],

  kids: [
    {
      title: "Детские товары",
      fields: [
        {
          key: "itemType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "clothes", label: "Одежда" },
            { value: "toys", label: "Игрушки" },
            { value: "stroller", label: "Коляски" },
            { value: "furniture", label: "Мебель" },
            { value: "feeding", label: "Питание и кормление" },
            { value: "school", label: "Школа" },
            { value: "other", label: "Другое" },
          ],
        },
        {
          key: "ageGroup",
          label: "Возраст",
          type: "select",
          options: [
            { value: "0-1", label: "0–1 год" },
            { value: "1-3", label: "1–3 года" },
            { value: "3-7", label: "3–7 лет" },
            { value: "7-12", label: "7–12 лет" },
            { value: "12+", label: "12+ лет" },
          ],
        },
        { key: "brand", label: "Бренд", type: "text" },
        { key: "size", label: "Размер", type: "text", placeholder: "62, 104, 28..." },
        {
          key: "gender",
          label: "Для кого",
          type: "select",
          options: [
            { value: "boy", label: "Мальчик" },
            { value: "girl", label: "Девочка" },
            { value: "unisex", label: "Унисекс" },
          ],
        },
      ],
    },
  ],

  animals: [
    {
      title: "Животные",
      fields: [
        {
          key: "animalType",
          label: "Вид",
          type: "select",
          required: true,
          options: [
            { value: "dog", label: "Собаки" },
            { value: "cat", label: "Кошки" },
            { value: "bird", label: "Птицы" },
            { value: "fish", label: "Рыбки" },
            { value: "rodent", label: "Грызуны" },
            { value: "farm", label: "Сельхоз животные" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "breed", label: "Порода", type: "text", required: true },
        { key: "age", label: "Возраст", type: "text", placeholder: "2 месяца, 3 года..." },
        {
          key: "gender",
          label: "Пол",
          type: "select",
          options: [
            { value: "male", label: "Мальчик" },
            { value: "female", label: "Девочка" },
          ],
        },
        { key: "vaccinated", label: "Привит", type: "checkbox" },
        { key: "documents", label: "Есть документы / родословная", type: "checkbox" },
        { key: "sterilized", label: "Стерилизован", type: "checkbox" },
      ],
    },
  ],

  "new-cars": [
    {
      title: "Новый автомобиль",
      fields: [
        { key: "dealer", label: "Салон / дилер", type: "text", placeholder: "Официальный дилер" },
        { key: "warranty", label: "Гарантия производителя", type: "checkbox" },
        { key: "inStock", label: "В наличии", type: "checkbox" },
        { key: "preorder", label: "Под заказ", type: "checkbox" },
        { key: "tradeIn", label: "Trade-in", type: "checkbox" },
      ],
    },
  ],

  "car-rental": [
    {
      title: "Аренда авто",
      fields: [
        {
          key: "rentalPeriod",
          label: "Срок аренды",
          type: "select",
          required: true,
          options: [
            { value: "hourly", label: "Почасово" },
            { value: "daily", label: "Посуточно" },
            { value: "weekly", label: "Понедельно" },
            { value: "monthly", label: "Помесячно" },
            { value: "long", label: "Долгосрочно" },
          ],
        },
        { key: "withDriver", label: "С водителем", type: "checkbox" },
        { key: "deposit", label: "Залог (֏)", type: "number", min: 0 },
        { key: "minAge", label: "Мин. возраст водителя", type: "number", min: 18, max: 99 },
        { key: "unlimitedKm", label: "Безлимитный пробег", type: "checkbox" },
      ],
    },
  ],

  "car-parts": [
    {
      title: "Запчасти",
      fields: [
        {
          key: "partType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "engine", label: "Двигатель" },
            { value: "body", label: "Кузов" },
            { value: "suspension", label: "Подвеска" },
            { value: "electronics", label: "Электрика" },
            { value: "tires", label: "Шины и диски" },
            { value: "accessories", label: "Аксессуары" },
            { value: "consumables", label: "Расходники" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "brand", label: "Бренд / производитель", type: "text" },
        { key: "compatibleWith", label: "Подходит для", type: "text", placeholder: "Toyota Camry 2018–2022" },
        { key: "oem", label: "Оригинал (OEM)", type: "checkbox" },
        { key: "newPart", label: "Новая", type: "checkbox" },
      ],
    },
  ],

  trucks: [
    {
      title: "Грузовик / спецтехника",
      fields: [
        {
          key: "vehicleType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "truck", label: "Грузовик" },
            { value: "trailer-truck", label: "Тягач" },
            { value: "van", label: "Фургон" },
            { value: "tipper", label: "Самосвал" },
            { value: "crane", label: "Автокран" },
            { value: "excavator", label: "Экскаватор" },
            { value: "loader", label: "Погрузчик" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "brand", label: "Марка", type: "text", required: true },
        { key: "model", label: "Модель", type: "text" },
        { key: "year", label: "Год выпуска", type: "number", min: 1970, max: new Date().getFullYear() + 1 },
        { key: "loadCapacity", label: "Грузоподъёмность", type: "number", unit: "т" },
        { key: "mileage", label: "Пробег", type: "number", unit: "км" },
      ],
    },
  ],

  "machinery-rental": [
    {
      title: "Аренда техники",
      fields: [
        {
          key: "equipmentType",
          label: "Тип техники",
          type: "select",
          required: true,
          options: [
            { value: "tractor", label: "Трактор" },
            { value: "tipper", label: "Самосвал" },
            { value: "excavator", label: "Экскаватор" },
            { value: "loader", label: "Погрузчик" },
            { value: "crane", label: "Кран" },
            { value: "asphalt", label: "Асфальтоукладчик" },
            { value: "roller", label: "Каток" },
            { value: "generator", label: "Генератор" },
            { value: "other", label: "Другое" },
          ],
        },
        {
          key: "rentalPeriod",
          label: "Срок аренды",
          type: "select",
          options: [
            { value: "hourly", label: "Почасово" },
            { value: "daily", label: "Посуточно" },
            { value: "project", label: "Под проект" },
          ],
        },
        { key: "withOperator", label: "С оператором", type: "checkbox" },
        { key: "delivery", label: "Доставка на объект", type: "checkbox" },
      ],
    },
  ],

  motorcycles: [
    {
      title: "Мототехника",
      fields: [
        {
          key: "motoType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "motorcycle", label: "Мотоцикл" },
            { value: "scooter", label: "Скутер" },
            { value: "atv", label: "Квадроцикл" },
            { value: "moped", label: "Мопед" },
            { value: "snowmobile", label: "Снегоход" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "brand", label: "Марка", type: "text", required: true },
        { key: "model", label: "Модель", type: "text" },
        { key: "year", label: "Год", type: "number", min: 1980, max: new Date().getFullYear() + 1 },
        { key: "engineVolume", label: "Объём двигателя", type: "number", unit: "см³" },
        { key: "mileage", label: "Пробег", type: "number", unit: "км" },
      ],
    },
  ],

  "water-transport": [
    {
      title: "Водный транспорт",
      fields: [
        {
          key: "waterType",
          label: "Тип",
          type: "select",
          required: true,
          options: [
            { value: "boat", label: "Лодка" },
            { value: "yacht", label: "Катер / яхта" },
            { value: "jet-ski", label: "Гидроцикл" },
            { value: "kayak", label: "Каяк / байдарка" },
            { value: "motor", label: "Лодочный мотор" },
            { value: "other", label: "Другое" },
          ],
        },
        { key: "brand", label: "Марка", type: "text" },
        { key: "length", label: "Длина", type: "number", unit: "м" },
        { key: "year", label: "Год", type: "number", min: 1970, max: new Date().getFullYear() + 1 },
      ],
    },
  ],

  buses: [
    {
      title: "Автобус",
      fields: [
        {
          key: "busType",
          label: "Тип",
          type: "select",
          options: [
            { value: "city", label: "Городской" },
            { value: "intercity", label: "Междугородний" },
            { value: "minibus", label: "Микроавтобус" },
            { value: "tourist", label: "Туристический" },
          ],
        },
        { key: "brand", label: "Марка", type: "text", required: true },
        { key: "seats", label: "Мест", type: "number", min: 4, max: 80 },
        { key: "year", label: "Год", type: "number", min: 1990, max: new Date().getFullYear() + 1 },
        { key: "mileage", label: "Пробег", type: "number", unit: "км" },
      ],
    },
  ],

  other: [
    {
      title: "Дополнительно",
      fields: [
        { key: "itemType", label: "Тип товара", type: "text", placeholder: "Опишите кратко" },
        { key: "brand", label: "Бренд", type: "text" },
        { key: "quantity", label: "Количество", type: "number", min: 1 },
        { key: "delivery", label: "Доставка возможна", type: "checkbox" },
      ],
    },
  ],
};

export const REAL_ESTATE_EXTRA_FIELDS: CategoryField[] = [
  {
    key: "dealType",
    label: "Тип сделки",
    type: "select",
    required: true,
    options: [
      { value: "SALE", label: "Продажа" },
      { value: "RENT", label: "Аренда" },
    ],
  },
  {
    key: "buildingYear",
    label: "Год постройки",
    type: "number",
    min: 1900,
    max: new Date().getFullYear() + 2,
  },
  {
    key: "renovationType",
    label: "Ремонт",
    type: "select",
    options: RENOVATION_OPTIONS,
  },
  {
    key: "heating",
    label: "Отопление",
    type: "select",
    options: HEATING_OPTIONS,
  },
  {
    key: "balcony",
    label: "Балкон / лоджия",
    type: "select",
    options: BALCONY_OPTIONS,
  },
  { key: "bathrooms", label: "Санузлов", type: "number", min: 1, max: 10 },
];

export function getCategoryFieldGroups(slug: string): CategoryFieldGroup[] {
  return CATEGORY_FIELD_GROUPS[slug] ?? [];
}

export function hasCategoryFields(slug: string): boolean {
  return slug in CATEGORY_FIELD_GROUPS;
}

/** Человекочитаемые значения для отображения */
const VALUE_LABELS: Record<string, Record<string, string>> = {
  subcategory: Object.fromEntries(ELECTRONICS_SUBCATEGORIES.map((o) => [o.value, o.label])),
  storage: Object.fromEntries(STORAGE_OPTIONS.map((o) => [o.value, o.label])),
  ram: Object.fromEntries(RAM_OPTIONS.map((o) => [o.value, o.label])),
  renovationType: Object.fromEntries(RENOVATION_OPTIONS.map((o) => [o.value, o.label])),
  heating: Object.fromEntries(HEATING_OPTIONS.map((o) => [o.value, o.label])),
  balcony: Object.fromEntries(BALCONY_OPTIONS.map((o) => [o.value, o.label])),
  dealType: { SALE: "Продажа", RENT: "Аренда" },
  employmentType: {
    full: "Полная занятость",
    part: "Частичная",
    remote: "Удалённая",
    contract: "Проектная",
    internship: "Стажировка",
  },
  experience: { none: "Без опыта", "1-3": "1–3 года", "3-6": "3–6 лет", "6+": "Более 6 лет" },
  schedule: { "full-day": "Полный день", shift: "Сменный", flexible: "Гибкий", weekends: "По выходным" },
  priceType: { fixed: "Фиксированная", from: "От", negotiable: "По договорённости", free: "Бесплатно" },
  workFormat: { "on-site": "У заказчика", "at-provider": "У исполнителя", remote: "Онлайн" },
  clothingType: { men: "Мужская", women: "Женская", kids: "Детская", shoes: "Обувь", accessories: "Аксессуары", bags: "Сумки" },
  season: { summer: "Лето", winter: "Зима", demi: "Демисезон", all: "Всесезон" },
  gender: { male: "Мальчик", female: "Девочка", boy: "Мальчик", girl: "Девочка", unisex: "Унисекс" },
  animalType: { dog: "Собака", cat: "Кошка", bird: "Птица", fish: "Рыбки", rodent: "Грызун", farm: "Сельхоз", other: "Другое" },
  itemType: {
    furniture: "Мебель", appliances: "Бытовая техника", kitchen: "Кухня", decor: "Декор",
    garden: "Сад", tools: "Инструменты", clothes: "Одежда", toys: "Игрушки", stroller: "Коляска",
    feeding: "Питание", school: "Школа", other: "Другое",
  },
  serviceType: {
    repair: "Ремонт", cleaning: "Уборка", transport: "Перевозки", beauty: "Красота",
    education: "Обучение", it: "IT", legal: "Юридические", other: "Другое",
  },
  partType: {
    engine: "Двигатель", body: "Кузов", suspension: "Подвеска", electronics: "Электрика",
    tires: "Шины и диски", accessories: "Аксессуары", consumables: "Расходники", other: "Другое",
  },
  rentalPeriod: { hourly: "Почасово", daily: "Посуточно", weekly: "Понедельно", monthly: "Помесячно", long: "Долгосрочно", project: "Под проект" },
  vehicleType: {
    truck: "Грузовик", "trailer-truck": "Тягач", van: "Фургон", tipper: "Самосвал",
    crane: "Автокран", excavator: "Экскаватор", loader: "Погрузчик", other: "Другое",
  },
  equipmentType: {
    tractor: "Трактор", tipper: "Самосвал", excavator: "Экскаватор", loader: "Погрузчик",
    crane: "Кран", asphalt: "Асфальтоукладчик", roller: "Каток", generator: "Генератор", other: "Другое",
  },
  motoType: {
    motorcycle: "Мотоцикл", scooter: "Скутер", atv: "Квадроцикл", moped: "Мопед",
    snowmobile: "Снегоход", other: "Другое",
  },
  waterType: {
    boat: "Лодка", yacht: "Катер / яхта", "jet-ski": "Гидроцикл", kayak: "Каяк", motor: "Лодочный мотор", other: "Другое",
  },
  busType: { city: "Городской", intercity: "Междугородний", minibus: "Микроавтобус", tourist: "Туристический" },
  propertyType: { APARTMENT: "Квартира", HOUSE: "Дом", COMMERCIAL: "Коммерческая", LAND: "Участок" },
};

export function formatAttributeValue(key: string, value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  const map = VALUE_LABELS[key];
  if (map && typeof value === "string" && map[value]) return map[value];
  if (key === "salaryFrom" || key === "salaryTo") return `${Number(value).toLocaleString("ru-RU")} ֏`;
  if (key === "storage" || key === "ram") return `${value} ГБ`;
  return String(value);
}

export function parseAttributes(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function collectAttributesFromForm(
  slug: string,
  fd: FormData
): Record<string, unknown> | null {
  const groups = getCategoryFieldGroups(slug);
  if (!groups.length) return null;

  const attrs: Record<string, unknown> = {};
  const watch = new Map<string, string>();

  for (const group of groups) {
    for (const field of group.fields) {
      if (field.type === "checkbox") {
        attrs[field.key] = fd.get(`attr_${field.key}`) === "on";
        continue;
      }
      const raw = fd.get(`attr_${field.key}`);
      if (raw == null || raw === "") continue;
      attrs[field.key] =
        field.type === "number" ? Number(raw) : String(raw).trim();
      if (field.type === "select" || field.type === "text") {
        watch.set(field.key, String(attrs[field.key]));
      }
    }
  }

  // Удалить поля, скрытые showIf
  for (const group of groups) {
    for (const field of group.fields) {
      if (!field.showIf) continue;
      const parent = watch.get(field.showIf.key) ?? String(attrs[field.showIf.key] ?? "");
      if (!field.showIf.values.includes(parent)) {
        delete attrs[field.key];
      }
    }
  }

  return Object.keys(attrs).length ? attrs : null;
}

export function getAttributeDisplayEntries(
  slug: string,
  attrs: Record<string, unknown>
): { label: string; value: string }[] {
  const groups = getCategoryFieldGroups(slug);
  const entries: { label: string; value: string }[] = [];

  for (const group of groups) {
    for (const field of group.fields) {
      const val = attrs[field.key];
      if (val == null || val === "" || val === false) continue;
      const formatted = formatAttributeValue(field.key, val);
      if (!formatted) continue;
      entries.push({ label: field.label, value: formatted });
    }
  }

  return entries;
}
