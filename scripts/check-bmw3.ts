import { getBrand } from "auto-parts-db";

const brand = getBrand("BMW");
const m = brand?.models.find((x) => /3/i.test(x.name) && /series|reihe/i.test(x.name));
console.log(m?.name, m?.generations);
