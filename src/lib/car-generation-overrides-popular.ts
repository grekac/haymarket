import type { OverrideDef } from "./car-generation-overrides";

/** Популярные модели (не BMW — см. car-generation-overrides-bmw.ts) */
export const POPULAR_GENERATION_OVERRIDES: OverrideDef[] = [
  {
    brand: "Mercedes-Benz",
    modelName: "C-Class",
    modelKeys: ["cclass", "c"],
    generations: [
      { code: "W206", yearFrom: 2021, yearTo: null, label: "W206" },
      { code: "W205", yearFrom: 2014, yearTo: 2021, label: "W205" },
      { code: "W204", yearFrom: 2007, yearTo: 2014, label: "W204" },
      { code: "W203", yearFrom: 2000, yearTo: 2007, label: "W203" },
      { code: "W202", yearFrom: 1993, yearTo: 2000, label: "W202" },
      { code: "W201", yearFrom: 1982, yearTo: 1993, label: "W201" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    modelName: "E-Class",
    modelKeys: ["eclass", "e"],
    generations: [
      { code: "W213", yearFrom: 2016, yearTo: null, label: "W213" },
      { code: "W212", yearFrom: 2009, yearTo: 2016, label: "W212" },
      { code: "W211", yearFrom: 2002, yearTo: 2009, label: "W211" },
      { code: "W210", yearFrom: 1995, yearTo: 2002, label: "W210" },
      { code: "W124", yearFrom: 1984, yearTo: 1995, label: "W124" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    modelName: "S-Class",
    modelKeys: ["sclass", "s"],
    generations: [
      { code: "W223", yearFrom: 2020, yearTo: null, label: "W223" },
      { code: "W222", yearFrom: 2013, yearTo: 2020, label: "W222" },
      { code: "W221", yearFrom: 2005, yearTo: 2013, label: "W221" },
      { code: "W220", yearFrom: 1998, yearTo: 2005, label: "W220" },
      { code: "W140", yearFrom: 1991, yearTo: 1998, label: "W140" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    modelName: "A-Class",
    modelKeys: ["aclass", "a"],
    generations: [
      { code: "W177", yearFrom: 2018, yearTo: null, label: "W177" },
      { code: "W176", yearFrom: 2012, yearTo: 2018, label: "W176" },
      { code: "W169", yearFrom: 2004, yearTo: 2012, label: "W169" },
    ],
  },
  {
    brand: "Toyota",
    modelName: "Camry",
    modelKeys: ["camry"],
    generations: [
      { code: "XV70", yearFrom: 2017, yearTo: null, label: "XV70" },
      { code: "XV50", yearFrom: 2011, yearTo: 2017, label: "XV50" },
      { code: "XV40", yearFrom: 2006, yearTo: 2011, label: "XV40" },
      { code: "XV30", yearFrom: 2001, yearTo: 2006, label: "XV30" },
      { code: "XV20", yearFrom: 1996, yearTo: 2001, label: "XV20" },
      { code: "XV10", yearFrom: 1991, yearTo: 1996, label: "XV10" },
    ],
  },
  {
    brand: "Toyota",
    modelName: "Corolla",
    modelKeys: ["corolla"],
    generations: [
      { code: "E210", yearFrom: 2018, yearTo: null, label: "E210" },
      { code: "E170", yearFrom: 2013, yearTo: 2019, label: "E170" },
      { code: "E150", yearFrom: 2006, yearTo: 2013, label: "E150" },
      { code: "E120", yearFrom: 2000, yearTo: 2006, label: "E120" },
      { code: "E110", yearFrom: 1995, yearTo: 2000, label: "E110" },
    ],
  },
  {
    brand: "Toyota",
    modelName: "RAV4",
    modelKeys: ["rav4"],
    generations: [
      { code: "XA50", yearFrom: 2018, yearTo: null, label: "XA50" },
      { code: "XA40", yearFrom: 2012, yearTo: 2018, label: "XA40" },
      { code: "XA30", yearFrom: 2005, yearTo: 2012, label: "XA30" },
      { code: "XA20", yearFrom: 2000, yearTo: 2005, label: "XA20" },
    ],
  },
  {
    brand: "Toyota",
    modelName: "Land Cruiser",
    modelKeys: ["landcruiser", "landcruiserprado"],
    generations: [
      { code: "J300", yearFrom: 2021, yearTo: null, label: "J300" },
      { code: "J200", yearFrom: 2007, yearTo: 2021, label: "J200" },
      { code: "J100", yearFrom: 1998, yearTo: 2007, label: "J100" },
      { code: "J80", yearFrom: 1990, yearTo: 1997, label: "J80" },
    ],
  },
  {
    brand: "Volkswagen",
    modelName: "Golf",
    modelKeys: ["golf"],
    generations: [
      { code: "Mk8", yearFrom: 2019, yearTo: null, label: "Mk8" },
      { code: "Mk7", yearFrom: 2012, yearTo: 2019, label: "Mk7" },
      { code: "Mk6", yearFrom: 2008, yearTo: 2012, label: "Mk6" },
      { code: "Mk5", yearFrom: 2003, yearTo: 2008, label: "Mk5" },
      { code: "Mk4", yearFrom: 1997, yearTo: 2003, label: "Mk4" },
      { code: "Mk3", yearFrom: 1991, yearTo: 1997, label: "Mk3" },
    ],
  },
  {
    brand: "Volkswagen",
    modelName: "Passat",
    modelKeys: ["passat"],
    generations: [
      { code: "B8", yearFrom: 2014, yearTo: null, label: "B8" },
      { code: "B7", yearFrom: 2010, yearTo: 2014, label: "B7" },
      { code: "B6", yearFrom: 2005, yearTo: 2010, label: "B6" },
      { code: "B5", yearFrom: 1996, yearTo: 2005, label: "B5" },
    ],
  },
  {
    brand: "Volkswagen",
    modelName: "Tiguan",
    modelKeys: ["tiguan"],
    generations: [
      { code: "AD", yearFrom: 2016, yearTo: null, label: "AD" },
      { code: "5N", yearFrom: 2007, yearTo: 2016, label: "5N" },
    ],
  },
  {
    brand: "Hyundai",
    modelName: "Elantra",
    modelKeys: ["elantra"],
    generations: [
      { code: "CN7", yearFrom: 2020, yearTo: null, label: "CN7" },
      { code: "AD", yearFrom: 2015, yearTo: 2020, label: "AD" },
      { code: "MD", yearFrom: 2010, yearTo: 2015, label: "MD" },
      { code: "HD", yearFrom: 2006, yearTo: 2010, label: "HD" },
    ],
  },
  {
    brand: "Hyundai",
    modelName: "Tucson",
    modelKeys: ["tucson"],
    generations: [
      { code: "NX4", yearFrom: 2020, yearTo: null, label: "NX4" },
      { code: "TL", yearFrom: 2015, yearTo: 2020, label: "TL" },
      { code: "LM", yearFrom: 2009, yearTo: 2015, label: "LM" },
    ],
  },
  {
    brand: "Hyundai",
    modelName: "Sonata",
    modelKeys: ["sonata"],
    generations: [
      { code: "DN8", yearFrom: 2019, yearTo: null, label: "DN8" },
      { code: "YF", yearFrom: 2009, yearTo: 2014, label: "YF" },
      { code: "NF", yearFrom: 2004, yearTo: 2009, label: "NF" },
    ],
  },
  {
    brand: "Hyundai",
    modelName: "Santa Fe",
    modelKeys: ["santafe"],
    generations: [
      { code: "TM", yearFrom: 2018, yearTo: null, label: "TM" },
      { code: "DM", yearFrom: 2012, yearTo: 2018, label: "DM" },
      { code: "CM", yearFrom: 2006, yearTo: 2012, label: "CM" },
    ],
  },
  {
    brand: "Kia",
    modelName: "Rio",
    modelKeys: ["rio"],
    generations: [
      { code: "YB", yearFrom: 2017, yearTo: null, label: "YB" },
      { code: "UB", yearFrom: 2011, yearTo: 2017, label: "UB" },
      { code: "JB", yearFrom: 2005, yearTo: 2011, label: "JB" },
    ],
  },
  {
    brand: "Kia",
    modelName: "Sportage",
    modelKeys: ["sportage"],
    generations: [
      { code: "NQ5", yearFrom: 2021, yearTo: null, label: "NQ5" },
      { code: "QL", yearFrom: 2016, yearTo: 2021, label: "QL" },
      { code: "SL", yearFrom: 2010, yearTo: 2016, label: "SL" },
    ],
  },
  {
    brand: "Kia",
    modelName: "Optima",
    modelKeys: ["optima", "k5"],
    generations: [
      { code: "JF", yearFrom: 2015, yearTo: 2020, label: "JF" },
      { code: "TF", yearFrom: 2010, yearTo: 2015, label: "TF" },
      { code: "MS", yearFrom: 2005, yearTo: 2010, label: "MS" },
    ],
  },
  {
    brand: "Honda",
    modelName: "Civic",
    modelKeys: ["civic"],
    generations: [
      { code: "FK", yearFrom: 2015, yearTo: null, label: "FK" },
      { code: "FB", yearFrom: 2011, yearTo: 2015, label: "FB" },
      { code: "FD", yearFrom: 2005, yearTo: 2011, label: "FD" },
      { code: "EM", yearFrom: 2000, yearTo: 2005, label: "EM" },
    ],
  },
  {
    brand: "Honda",
    modelName: "Accord",
    modelKeys: ["accord"],
    generations: [
      { code: "CR", yearFrom: 2012, yearTo: null, label: "CR" },
      { code: "CU", yearFrom: 2007, yearTo: 2012, label: "CU" },
      { code: "CL", yearFrom: 2002, yearTo: 2007, label: "CL" },
    ],
  },
  {
    brand: "Nissan",
    modelName: "Qashqai",
    modelKeys: ["qashqai"],
    generations: [
      { code: "J12", yearFrom: 2021, yearTo: null, label: "J12" },
      { code: "J11", yearFrom: 2013, yearTo: 2021, label: "J11" },
      { code: "J10", yearFrom: 2006, yearTo: 2013, label: "J10" },
    ],
  },
  {
    brand: "Nissan",
    modelName: "X-Trail",
    modelKeys: ["xtrail"],
    generations: [
      { code: "T33", yearFrom: 2021, yearTo: null, label: "T33" },
      { code: "T32", yearFrom: 2013, yearTo: 2021, label: "T32" },
      { code: "T31", yearFrom: 2007, yearTo: 2013, label: "T31" },
      { code: "T30", yearFrom: 2000, yearTo: 2007, label: "T30" },
    ],
  },
  {
    brand: "Audi",
    modelName: "A4",
    modelKeys: ["a4"],
    generations: [
      { code: "B9", yearFrom: 2015, yearTo: null, label: "B9" },
      { code: "B8", yearFrom: 2007, yearTo: 2015, label: "B8" },
      { code: "B7", yearFrom: 2004, yearTo: 2007, label: "B7" },
      { code: "B6", yearFrom: 2000, yearTo: 2004, label: "B6" },
    ],
  },
  {
    brand: "Audi",
    modelName: "A6",
    modelKeys: ["a6"],
    generations: [
      { code: "C8", yearFrom: 2018, yearTo: null, label: "C8" },
      { code: "C7", yearFrom: 2011, yearTo: 2018, label: "C7" },
      { code: "C6", yearFrom: 2004, yearTo: 2011, label: "C6" },
      { code: "C5", yearFrom: 1997, yearTo: 2004, label: "C5" },
    ],
  },
  {
    brand: "Audi",
    modelName: "A3",
    modelKeys: ["a3"],
    generations: [
      { code: "8Y", yearFrom: 2020, yearTo: null, label: "8Y" },
      { code: "8V", yearFrom: 2012, yearTo: 2020, label: "8V" },
      { code: "8P", yearFrom: 2003, yearTo: 2012, label: "8P" },
    ],
  },
  {
    brand: "Audi",
    modelName: "Q5",
    modelKeys: ["q5"],
    generations: [
      { code: "FY", yearFrom: 2017, yearTo: null, label: "FY" },
      { code: "8R", yearFrom: 2008, yearTo: 2017, label: "8R" },
    ],
  },
  {
    brand: "Lexus",
    modelName: "RX",
    modelKeys: ["rx"],
    generations: [
      { code: "AL20", yearFrom: 2015, yearTo: null, label: "AL20" },
      { code: "AL10", yearFrom: 2009, yearTo: 2015, label: "AL10" },
      { code: "XU30", yearFrom: 2003, yearTo: 2009, label: "XU30" },
    ],
  },
  {
    brand: "Lexus",
    modelName: "ES",
    modelKeys: ["es"],
    generations: [
      { code: "XV70", yearFrom: 2018, yearTo: null, label: "XV70" },
      { code: "XV60", yearFrom: 2012, yearTo: 2018, label: "XV60" },
      { code: "XV40", yearFrom: 2006, yearTo: 2012, label: "XV40" },
    ],
  },
  {
    brand: "Lada",
    modelName: "Vesta",
    modelKeys: ["vesta"],
    generations: [
      { code: "FL", yearFrom: 2020, yearTo: null, label: "рестайлинг" },
      { code: "2190", yearFrom: 2015, yearTo: 2020, label: "2190" },
    ],
  },
  {
    brand: "Lada",
    modelName: "Granta",
    modelKeys: ["granta"],
    generations: [
      { code: "FL", yearFrom: 2018, yearTo: null, label: "рестайлинг" },
      { code: "2190", yearFrom: 2011, yearTo: 2018, label: "2190" },
    ],
  },
];
