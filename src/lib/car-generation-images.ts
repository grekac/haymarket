/**
 * Curated real car photos for popular generations (Wikimedia Commons).
 * Key formats: brandSlug|modelSlug|CODE  or  brandSlug|CODE
 */
export const GENERATION_IMAGE_CACHE: Record<string, string> = {
  // ── BMW 3 Series ──
  "bmw|3-er-reihe|E46":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_E46_330Ci_Sport_Package.jpg/640px-BMW_E46_330Ci_Sport_Package.jpg",
  "bmw|3-er-reihe|E90":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg/640px-2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg",
  "bmw|3-er-reihe|F30":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2012_BMW_318d_Sport_Automatic_2.0.jpg/640px-2012_BMW_318d_Sport_Automatic_2.0.jpg",
  "bmw|3-er-reihe|G20":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2019_BMW_318d_SE_Automatic_2.0_Front.jpg/640px-2019_BMW_318d_SE_Automatic_2.0_Front.jpg",

  // ── BMW chassis (shared across models) ──
  "bmw|E21":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/BMW_E21_320i.jpg/640px-BMW_E21_320i.jpg",
  "bmw|E30":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/BMW_E30_325i_%281988%29.jpg/640px-BMW_E30_325i_%281988%29.jpg",
  "bmw|E34":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/BMW_E34_525i.jpg/640px-BMW_E34_525i.jpg",
  "bmw|E36":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/BMW_E36_325i_%281995%29.jpg/640px-BMW_E36_325i_%281995%29.jpg",
  "bmw|E39":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/BMW_E39_528i_%281999%29.jpg/640px-BMW_E39_528i_%281999%29.jpg",
  "bmw|E46": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_E46_330Ci_Sport_Package.jpg/640px-BMW_E46_330Ci_Sport_Package.jpg",
  "bmw|E90": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg/640px-2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg",
  "bmw|F30": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2012_BMW_318d_Sport_Automatic_2.0.jpg/640px-2012_BMW_318d_Sport_Automatic_2.0.jpg",
  "bmw|G20": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2019_BMW_318d_SE_Automatic_2.0_Front.jpg/640px-2019_BMW_318d_SE_Automatic_2.0_Front.jpg",
  "bmw|E87":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/BMW_E87_130i.jpg/640px-BMW_E87_130i.jpg",
  "bmw|F20":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2012_BMW_116i_Sport_5-door_1.6_Front.jpg/640px-2012_BMW_116i_Sport_5-door_1.6_Front.jpg",
  "bmw|F40":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_BMW_118i_M_Sport_Automatic_1.5_Front.jpg/640px-2019_BMW_118i_M_Sport_Automatic_1.5_Front.jpg",
  "bmw|E60":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2004_BMW_530d_Sport_Automatic_3.0_Front.jpg/640px-2004_BMW_530d_Sport_Automatic_3.0_Front.jpg",
  "bmw|F10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2010_BMW_520d_SE_Automatic_2.0_Front.jpg/640px-2010_BMW_520d_SE_Automatic_2.0_Front.jpg",
  "bmw|G30":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2018_BMW_520d_SE_Automatic_2.0_Front.jpg/640px-2018_BMW_520d_SE_Automatic_2.0_Front.jpg",
  "bmw|E65":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/BMW_745i_E65.jpg/640px-BMW_745i_E65.jpg",
  "bmw|F01":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/2010_BMW_730d_SE_Automatic_3.0_Front.jpg/640px-2010_BMW_730d_SE_Automatic_3.0_Front.jpg",
  "bmw|G11":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2016_BMW_730d_M_Sport_Automatic_3.0_Front.jpg/640px-2016_BMW_730d_M_Sport_Automatic_3.0_Front.jpg",
  "bmw|E53":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BMW_X5_%28E53%29_front_20080612.jpg/640px-BMW_X5_%28E53%29_front_20080612.jpg",
  "bmw|E70":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2011_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg/640px-2011_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg",
  "bmw|F15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2014_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg/640px-2014_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg",
  "bmw|G05":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2019_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg/640px-2019_BMW_X5_xDrive30d_M_Sport_Automatic_3.0_Front.jpg",
  "bmw|E83":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/BMW_X3_%28E83%29_front_20071026.jpg/640px-BMW_X3_%28E83%29_front_20071026.jpg",
  "bmw|F25":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2011_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg/640px-2011_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg",
  "bmw|G01":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg/640px-2018_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg",

  "bmw|G15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg/640px-2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg",
  "bmw|8-series|G15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg/640px-2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg",
  "bmw|series-8|G15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg/640px-2019_BMW_M850i_xDrive_Gran_Coup%C3%A9_F06_Front.jpg",

  // ── Mercedes-Benz ──
  "mercedes-benz|c-class|W203":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes_W203_front_20080328.jpg/640px-Mercedes_W203_front_20080328.jpg",
  "mercedes-benz|c-class|W204":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Mercedes_C-Klasse_%28W204%29_Elegance_front.jpg/640px-Mercedes_C-Klasse_%28W204%29_Elegance_front.jpg",
  "mercedes-benz|c-class|W205":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2015_Mercedes-Benz_C_220_BlueTEC_AMG_Line_Automatic_2.1_Front.jpg/640px-2015_Mercedes-Benz_C_220_BlueTEC_AMG_Line_Automatic_2.1_Front.jpg",
  "mercedes-benz|c-class|W206":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Mercedes-Benz_C_200_AMG_Line_Automatic_1.5_Front.jpg/640px-2021_Mercedes-Benz_C_200_AMG_Line_Automatic_1.5_Front.jpg",
  "mercedes-benz|W201":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mercedes_190E_W201_front.jpg/640px-Mercedes_190E_W201_front.jpg",
  "mercedes-benz|W202":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercedes_W202_front_20080328.jpg/640px-Mercedes_W202_front_20080328.jpg",
  "mercedes-benz|W203": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes_W203_front_20080328.jpg/640px-Mercedes_W203_front_20080328.jpg",
  "mercedes-benz|W204": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Mercedes_C-Klasse_%28W204%29_Elegance_front.jpg/640px-Mercedes_C-Klasse_%28W204%29_Elegance_front.jpg",
  "mercedes-benz|W205": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2015_Mercedes-Benz_C_220_BlueTEC_AMG_Line_Automatic_2.1_Front.jpg/640px-2015_Mercedes-Benz_C_220_BlueTEC_AMG_Line_Automatic_2.1_Front.jpg",
  "mercedes-benz|W206": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Mercedes-Benz_C_200_AMG_Line_Automatic_1.5_Front.jpg/640px-2021_Mercedes-Benz_C_200_AMG_Line_Automatic_1.5_Front.jpg",
  "mercedes-benz|e-class|W211":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes_E-Klasse_W211_front_20080328.jpg/640px-Mercedes_E-Klasse_W211_front_20080328.jpg",
  "mercedes-benz|e-class|W212":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2010_Mercedes-Benz_E_350_CDI_BlueEFFICIENCY_Avantgarde_Automatic_3.0_Front.jpg/640px-2010_Mercedes-Benz_E_350_CDI_BlueEFFICIENCY_Avantgarde_Automatic_3.0_Front.jpg",
  "mercedes-benz|e-class|W213":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2017_Mercedes-Benz_E_220d_SE_Automatic_2.0_Front.jpg/640px-2017_Mercedes-Benz_E_220d_SE_Automatic_2.0_Front.jpg",
  "mercedes-benz|W211": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes_E-Klasse_W211_front_20080328.jpg/640px-Mercedes_E-Klasse_W211_front_20080328.jpg",
  "mercedes-benz|W212": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2010_Mercedes-Benz_E_350_CDI_BlueEFFICIENCY_Avantgarde_Automatic_3.0_Front.jpg/640px-2010_Mercedes-Benz_E_350_CDI_BlueEFFICIENCY_Avantgarde_Automatic_3.0_Front.jpg",
  "mercedes-benz|W213": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2017_Mercedes-Benz_E_220d_SE_Automatic_2.0_Front.jpg/640px-2017_Mercedes-Benz_E_220d_SE_Automatic_2.0_Front.jpg",
  "mercedes-benz|s-class|W220":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes_S-Klasse_W220_front_20080328.jpg/640px-Mercedes_S-Klasse_W220_front_20080328.jpg",
  "mercedes-benz|s-class|W221":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Mercedes-Benz_S_320_CDI_4MATIC_L_%28V_221%29_%E2%80%93_Frontansicht_%281%29%2C_30._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Mercedes-Benz_S_320_CDI_4MATIC_L_%28V_221%29_%E2%80%93_Frontansicht_%281%29%2C_30._August_2011%2C_D%C3%BCsseldorf.jpg",
  "mercedes-benz|s-class|W222":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2014_Mercedes-Benz_S_350_BlueTEC_L_Automatic_3.0_Front.jpg/640px-2014_Mercedes-Benz_S_350_BlueTEC_L_Automatic_3.0_Front.jpg",
  "mercedes-benz|s-class|W223":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2021_Mercedes-Benz_S_450_4MATIC_Long_Automatic_3.0_Front.jpg/640px-2021_Mercedes-Benz_S_450_4MATIC_Long_Automatic_3.0_Front.jpg",
  "mercedes-benz|W220": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes_S-Klasse_W220_front_20080328.jpg/640px-Mercedes_S-Klasse_W220_front_20080328.jpg",
  "mercedes-benz|W221": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Mercedes-Benz_S_320_CDI_4MATIC_L_%28V_221%29_%E2%80%93_Frontansicht_%281%29%2C_30._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Mercedes-Benz_S_320_CDI_4MATIC_L_%28V_221%29_%E2%80%93_Frontansicht_%281%29%2C_30._August_2011%2C_D%C3%BCsseldorf.jpg",
  "mercedes-benz|W222": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2014_Mercedes-Benz_S_350_BlueTEC_L_Automatic_3.0_Front.jpg/640px-2014_Mercedes-Benz_S_350_BlueTEC_L_Automatic_3.0_Front.jpg",
  "mercedes-benz|W223": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2021_Mercedes-Benz_S_450_4MATIC_Long_Automatic_3.0_Front.jpg/640px-2021_Mercedes-Benz_S_450_4MATIC_Long_Automatic_3.0_Front.jpg",
  "mercedes-benz|W169":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mercedes-Benz_A_180_CD_I_%28W169%29_%E2%80%93_Frontansicht%2C_4._Juni_2011%2C_D%C3%BCsseldorf.jpg/640px-Mercedes-Benz_A_180_CD_I_%28W169%29_%E2%80%93_Frontansicht%2C_4._Juni_2011%2C_D%C3%BCsseldorf.jpg",
  "mercedes-benz|W176":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2013_Mercedes-Benz_A_180_BlueEFFICIENCY_Sport_1.6_Front.jpg/640px-2013_Mercedes-Benz_A_180_BlueEFFICIENCY_Sport_1.6_Front.jpg",
  "mercedes-benz|W177":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2018_Mercedes-Benz_A_180_AMG_Line_Automatic_1.3_Front.jpg/640px-2018_Mercedes-Benz_A_180_AMG_Line_Automatic_1.3_Front.jpg",
  "mercedes-benz|X204":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2010_Mercedes-Benz_GLK_220_CDI_BlueEFFICIENCY_Sport_Automatic_2.1_Front.jpg/640px-2010_Mercedes-Benz_GLK_220_CDI_BlueEFFICIENCY_Sport_Automatic_2.1_Front.jpg",
  "mercedes-benz|X253":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Mercedes-Benz_GLC_220_d_AMG_Line_Automatic_2.1_Front.jpg/640px-2016_Mercedes-Benz_GLC_220_d_AMG_Line_Automatic_2.1_Front.jpg",
  "mercedes-benz|W166":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2013_Mercedes-Benz_ML_250_BlueTEC_Sport_Automatic_2.1_Front.jpg/640px-2013_Mercedes-Benz_ML_250_BlueTEC_Sport_Automatic_2.1_Front.jpg",
  "mercedes-benz|V167":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2019_Mercedes-Benz_GLE_300_d_4MATIC_AMG_Line_Automatic_2.0_Front.jpg/640px-2019_Mercedes-Benz_GLE_300_d_4MATIC_AMG_Line_Automatic_2.0_Front.jpg",

  "mercedes-benz|cls|C257 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg/640px-2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg",
  "mercedes-benz|C257 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg/640px-2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg",
  "mercedes-benz|cls|C219 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg/640px-Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg",
  "mercedes-benz|cls|C219":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg/640px-Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg",
  "mercedes-benz|C219":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg/640px-Mercedes-Benz_CLS_500_%28C219%29_front_20100807.jpg",
  "mercedes-benz|cls|C218":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mercedes-Benz_CLS_350_BlueEFFICIENCY_%28C218%29_front_20130112.jpg/640px-Mercedes-Benz_CLS_350_BlueEFFICIENCY_%28C218%29_front_20130112.jpg",
  "mercedes-benz|C218":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mercedes-Benz_CLS_350_BlueEFFICIENCY_%28C218%29_front_20130112.jpg/640px-Mercedes-Benz_CLS_350_BlueEFFICIENCY_%28C218%29_front_20130112.jpg",
  "mercedes-benz|cls|C257":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg/640px-2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg",
  "mercedes-benz|C257":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg/640px-2018_Mercedes-Benz_CLS_350_d_4MATIC_AMG_Line_Automatic_2.9_Front.jpg",

  "mercedes-benz|g-class|W460":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_G-Class_W460.jpg/640px-Mercedes-Benz_G-Class_W460.jpg",
  "mercedes-benz|W460":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_G-Class_W460.jpg/640px-Mercedes-Benz_G-Class_W460.jpg",
  "mercedes-benz|g-class|W463":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg/640px-Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg",
  "mercedes-benz|W463":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg/640px-Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg",
  "mercedes-benz|g-class|W463 FL1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg/640px-Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg",
  "mercedes-benz|W463 FL1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg/640px-Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg",
  "mercedes-benz|g-class|W463 FL2":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg/640px-Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg",
  "mercedes-benz|g-class|W463 FL3":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg/640px-Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg",
  "mercedes-benz|g-class|W463 FL4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg/640px-Mercedes-Benz_G_500_%28W463%29_front_20180125.jpg",
  "mercedes-benz|g-class|W465 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg/640px-2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg",
  "mercedes-benz|W465 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg/640px-2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg",
  "mercedes-benz|g-class|W460/W461":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_G-Class_W460.jpg/640px-Mercedes-Benz_G-Class_W460.jpg",
  "mercedes-benz|W460/W461":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_G-Class_W460.jpg/640px-Mercedes-Benz_G-Class_W460.jpg",
  "mercedes-benz|g-class|W463 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg/640px-Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg",
  "mercedes-benz|W463 FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg/640px-Mercedes-Benz_G_55_AMG_%28W463%29_front_20080118.jpg",
  "mercedes-benz|g-class|W463 II":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2019_Mercedes-Benz_G_500_AMG_Line_Automatic_4.0_Front.jpg/640px-2019_Mercedes-Benz_G_500_AMG_Line_Automatic_4.0_Front.jpg",
  "mercedes-benz|g-class|W465":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg/640px-2024_Mercedes-Benz_G_580_EQ_Technology_4MATIC_5-door_5.4_Front.jpg",

  // ── Volkswagen ──
  "volkswagen|golf|Mk5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2005_Volkswagen_Golf_GT_1.4_Front.jpg/640px-2005_Volkswagen_Golf_GT_1.4_Front.jpg",
  "volkswagen|golf|Mk6":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2010_Volkswagen_Golf_Match_TSI_1.4_Front.jpg/640px-2010_Volkswagen_Golf_Match_TSI_1.4_Front.jpg",
  "volkswagen|golf|Mk7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2013_Volkswagen_Golf_Match_BlueMotion_Technology_1.6_Front.jpg/640px-2013_Volkswagen_Golf_Match_BlueMotion_Technology_1.6_Front.jpg",
  "volkswagen|golf|Mk8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2020_Volkswagen_Golf_Life_TSI_1.5_Front.jpg/640px-2020_Volkswagen_Golf_Life_TSI_1.5_Front.jpg",
  "volkswagen|Mk5": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2005_Volkswagen_Golf_GT_1.4_Front.jpg/640px-2005_Volkswagen_Golf_GT_1.4_Front.jpg",
  "volkswagen|Mk6": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2010_Volkswagen_Golf_Match_TSI_1.4_Front.jpg/640px-2010_Volkswagen_Golf_Match_TSI_1.4_Front.jpg",
  "volkswagen|Mk7": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2013_Volkswagen_Golf_Match_BlueMotion_Technology_1.6_Front.jpg/640px-2013_Volkswagen_Golf_Match_BlueMotion_Technology_1.6_Front.jpg",
  "volkswagen|Mk8": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2020_Volkswagen_Golf_Life_TSI_1.5_Front.jpg/640px-2020_Volkswagen_Golf_Life_TSI_1.5_Front.jpg",
  "volkswagen|passat|B6":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2006_Volkswagen_Passat_SE_TDI_2.0_Front.jpg/640px-2006_Volkswagen_Passat_SE_TDI_2.0_Front.jpg",
  "volkswagen|passat|B7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2011_Volkswagen_Passat_S_TDI_BlueMotion_1.6_Front.jpg/640px-2011_Volkswagen_Passat_S_TDI_BlueMotion_1.6_Front.jpg",
  "volkswagen|passat|B8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2015_Volkswagen_Passat_S_TDI_BlueMotion_1.6_Front.jpg/640px-2015_Volkswagen_Passat_S_TDI_BlueMotion_1.6_Front.jpg",
  "volkswagen|tiguan|5N":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2008_Volkswagen_Tiguan_Sport_and_Style_2.0_Front.jpg/640px-2008_Volkswagen_Tiguan_Sport_and_Style_2.0_Front.jpg",
  "volkswagen|tiguan|AD":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2016_Volkswagen_Tiguan_S_TDI_BlueMotion_2.0_Front.jpg/640px-2016_Volkswagen_Tiguan_S_TDI_BlueMotion_2.0_Front.jpg",

  // ── Toyota ──
  "toyota|camry|XV40":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2007_Toyota_Camry_LE_V6_in_Lake_Success%2C_NY%2C_USA.jpg/640px-2007_Toyota_Camry_LE_V6_in_Lake_Success%2C_NY%2C_USA.jpg",
  "toyota|camry|XV50":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Toyota_Camry_%28ASV50R%29_Atara_S_sedan_%282015-07-03%29_01.jpg/640px-2012_Toyota_Camry_%28ASV50R%29_Atara_S_sedan_%282015-07-03%29_01.jpg",
  "toyota|camry|XV70":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/640px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg",
  "toyota|XV40": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2007_Toyota_Camry_LE_V6_in_Lake_Success%2C_NY%2C_USA.jpg/640px-2007_Toyota_Camry_LE_V6_in_Lake_Success%2C_NY%2C_USA.jpg",
  "toyota|XV50": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Toyota_Camry_%28ASV50R%29_Atara_S_sedan_%282015-07-03%29_01.jpg/640px-2012_Toyota_Camry_%28ASV50R%29_Atara_S_sedan_%282015-07-03%29_01.jpg",
  "toyota|XV70": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/640px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg",
  "toyota|corolla|E120":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2003_Toyota_Corolla_L_1.4_Front.jpg/640px-2003_Toyota_Corolla_L_1.4_Front.jpg",
  "toyota|corolla|E150":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2008_Toyota_Corolla_1.4_VVT-i_SR_5dr_Front.jpg/640px-2008_Toyota_Corolla_1.4_VVT-i_SR_5dr_Front.jpg",
  "toyota|corolla|E170":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2014_Toyota_Corolla_Icon_Technology_VVT-i_1.4_Front.jpg/640px-2014_Toyota_Corolla_Icon_Technology_VVT-i_1.4_Front.jpg",
  "toyota|corolla|E210":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2019_Toyota_Corolla_Hybrid_%28ZE121%29_SX_sedan_%282019-08-13%29_01.jpg/640px-2019_Toyota_Corolla_Hybrid_%28ZE121%29_SX_sedan_%282019-08-13%29_01.jpg",
  "toyota|E120": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2003_Toyota_Corolla_L_1.4_Front.jpg/640px-2003_Toyota_Corolla_L_1.4_Front.jpg",
  "toyota|E150": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2008_Toyota_Corolla_1.4_VVT-i_SR_5dr_Front.jpg/640px-2008_Toyota_Corolla_1.4_VVT-i_SR_5dr_Front.jpg",
  "toyota|E170": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2014_Toyota_Corolla_Icon_Technology_VVT-i_1.4_Front.jpg/640px-2014_Toyota_Corolla_Icon_Technology_VVT-i_1.4_Front.jpg",
  "toyota|E210": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2019_Toyota_Corolla_Hybrid_%28ZE121%29_SX_sedan_%282019-08-13%29_01.jpg/640px-2019_Toyota_Corolla_Hybrid_%28ZE121%29_SX_sedan_%282019-08-13%29_01.jpg",
  "toyota|rav4|XA30":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2007_Toyota_RAV4_XR_Automatic_2.0_Front.jpg/640px-2007_Toyota_RAV4_XR_Automatic_2.0_Front.jpg",
  "toyota|rav4|XA40":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2013_Toyota_RAV4_Icon_D-4D_2.0_Front.jpg/640px-2013_Toyota_RAV4_Icon_D-4D_2.0_Front.jpg",
  "toyota|rav4|XA50":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Toyota_RAV4_Design_2.5_Front.jpg/640px-2019_Toyota_RAV4_Design_2.5_Front.jpg",
  "toyota|XA30": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2007_Toyota_RAV4_XR_Automatic_2.0_Front.jpg/640px-2007_Toyota_RAV4_XR_Automatic_2.0_Front.jpg",
  "toyota|XA40": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2013_Toyota_RAV4_Icon_D-4D_2.0_Front.jpg/640px-2013_Toyota_RAV4_Icon_D-4D_2.0_Front.jpg",
  "toyota|XA50": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Toyota_RAV4_Design_2.5_Front.jpg/640px-2019_Toyota_RAV4_Design_2.5_Front.jpg",
  "toyota|land-cruiser|J100":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Toyota_Land_Cruiser_100_VX_4.2_Front.jpg/640px-Toyota_Land_Cruiser_100_VX_4.2_Front.jpg",
  "toyota|land-cruiser|J200":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2010_Toyota_Land_Cruiser_V8_D-4D_4.5_Front.jpg/640px-2010_Toyota_Land_Cruiser_V8_D-4D_4.5_Front.jpg",
  "toyota|J100": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Toyota_Land_Cruiser_100_VX_4.2_Front.jpg/640px-Toyota_Land_Cruiser_100_VX_4.2_Front.jpg",
  "toyota|J200": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2010_Toyota_Land_Cruiser_V8_D-4D_4.5_Front.jpg/640px-2010_Toyota_Land_Cruiser_V8_D-4D_4.5_Front.jpg",

  // ── Hyundai ──
  "hyundai|elantra|HD":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2007_Hyundai_Elantra_GLS_2.0_Front.jpg/640px-2007_Hyundai_Elantra_GLS_2.0_Front.jpg",
  "hyundai|elantra|MD":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2011_Hyundai_Elantra_GLS_%28Australia%29.jpg/640px-2011_Hyundai_Elantra_GLS_%28Australia%29.jpg",
  "hyundai|elantra|AD":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2016_Hyundai_Elantra_SE_1.4_Front.jpg/640px-2016_Hyundai_Elantra_SE_1.4_Front.jpg",
  "hyundai|elantra|CN7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2021_Hyundai_Elantra_SEL_2.0_Front.jpg/640px-2021_Hyundai_Elantra_SEL_2.0_Front.jpg",
  "hyundai|MD": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2011_Hyundai_Elantra_GLS_%28Australia%29.jpg/640px-2011_Hyundai_Elantra_GLS_%28Australia%29.jpg",
  "hyundai|AD": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2016_Hyundai_Elantra_SE_1.4_Front.jpg/640px-2016_Hyundai_Elantra_SE_1.4_Front.jpg",
  "hyundai|CN7": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2021_Hyundai_Elantra_SEL_2.0_Front.jpg/640px-2021_Hyundai_Elantra_SEL_2.0_Front.jpg",
  "hyundai|tucson|LM":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2010_Hyundai_Tucson_1.6_GDi_Premium_5dr_4WD_Front.jpg/640px-2010_Hyundai_Tucson_1.6_GDi_Premium_5dr_4WD_Front.jpg",
  "hyundai|tucson|TL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2016_Hyundai_Tucson_Premium_SE_1.7_CRDi_4WD_Front.jpg/640px-2016_Hyundai_Tucson_Premium_SE_1.7_CRDi_4WD_Front.jpg",
  "hyundai|tucson|NX4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2021_Hyundai_Tucson_Ultimate_1.6_T-GDi_4WD_Front.jpg/640px-2021_Hyundai_Tucson_Ultimate_1.6_T-GDi_4WD_Front.jpg",
  "hyundai|TL": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2016_Hyundai_Tucson_Premium_SE_1.7_CRDi_4WD_Front.jpg/640px-2016_Hyundai_Tucson_Premium_SE_1.7_CRDi_4WD_Front.jpg",
  "hyundai|sonata|NF":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2006_Hyundai_Sonata_GLS_2.4_Front.jpg/640px-2006_Hyundai_Sonata_GLS_2.4_Front.jpg",
  "hyundai|sonata|YF":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2011_Hyundai_Sonata_GLS_2.0_Front.jpg/640px-2011_Hyundai_Sonata_GLS_2.0_Front.jpg",
  "hyundai|sonata|DN8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2020_Hyundai_Sonata_SEL_2.5_Front.jpg/640px-2020_Hyundai_Sonata_SEL_2.5_Front.jpg",
  "hyundai|santa-fe|DM":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2013_Hyundai_Santa_Fe_Premium_SE_2.2_CRDi_4WD_Front.jpg/640px-2013_Hyundai_Santa_Fe_Premium_SE_2.2_CRDi_4WD_Front.jpg",
  "hyundai|santa-fe|TM":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2019_Hyundai_Santa_Fe_Ultimate_2.2_CRDi_4WD_Front.jpg/640px-2019_Hyundai_Santa_Fe_Ultimate_2.2_CRDi_4WD_Front.jpg",

  // ── Kia ──
  "kia|rio|UB":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2012_Kia_Rio_1.25_1_Front.jpg/640px-2012_Kia_Rio_1.25_1_Front.jpg",
  "kia|rio|YB":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2018_Kia_Rio_1.0_T-GDi_2_Front.jpg/640px-2018_Kia_Rio_1.0_T-GDi_2_Front.jpg",
  "kia|sportage|SL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2016_Kia_Sportage_1.7_CRDi_2_Front.jpg/640px-2016_Kia_Sportage_1.7_CRDi_2_Front.jpg",
  "kia|sportage|NQ5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2022_Kia_Sportage_GT-Line_1.6_T-GDi_Front.jpg/640px-2022_Kia_Sportage_GT-Line_1.6_T-GDi_Front.jpg",
  "kia|optima|TF":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2011_Kia_Optima_EX_2.0_Front.jpg/640px-2011_Kia_Optima_EX_2.0_Front.jpg",
  "kia|optima|JF":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2016_Kia_Optima_SX_Turbo_2.0_Front.jpg/640px-2016_Kia_Optima_SX_Turbo_2.0_Front.jpg",

  // ── Honda ──
  "honda|civic|FD":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2007_Honda_Civic_1.8_Ex_i-VTEC_5dr_Front.jpg/640px-2007_Honda_Civic_1.8_Ex_i-VTEC_5dr_Front.jpg",
  "honda|civic|FK":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2016_Honda_Civic_1.5_VTEC_Turbo_ES_Automatic_1.5_Front.jpg/640px-2016_Honda_Civic_1.5_VTEC_Turbo_ES_Automatic_1.5_Front.jpg",
  "honda|FD": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2007_Honda_Civic_1.8_Ex_i-VTEC_5dr_Front.jpg/640px-2007_Honda_Civic_1.8_Ex_i-VTEC_5dr_Front.jpg",
  "honda|FK": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2016_Honda_Civic_1.5_VTEC_Turbo_ES_Automatic_1.5_Front.jpg/640px-2016_Honda_Civic_1.5_VTEC_Turbo_ES_Automatic_1.5_Front.jpg",
  "honda|accord|CU":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2004_Honda_Accord_2.0_i-VTEC_SE_4dr_Front.jpg/640px-2004_Honda_Accord_2.0_i-VTEC_SE_4dr_Front.jpg",
  "honda|accord|CR":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2013_Honda_Accord_2.0_i-VTEC_EX_4dr_Front.jpg/640px-2013_Honda_Accord_2.0_i-VTEC_EX_4dr_Front.jpg",

  // ── Nissan ──
  "nissan|qashqai|J10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2008_Nissan_Qashqai_Tekna_dCi_4WD_Front.jpg/640px-2008_Nissan_Qashqai_Tekna_dCi_4WD_Front.jpg",
  "nissan|qashqai|J11":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2014_Nissan_Qashqai_Tekna_Dig-T_4WD_Front.jpg/640px-2014_Nissan_Qashqai_Tekna_Dig-T_4WD_Front.jpg",
  "nissan|J10": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2008_Nissan_Qashqai_Tekna_dCi_4WD_Front.jpg/640px-2008_Nissan_Qashqai_Tekna_dCi_4WD_Front.jpg",
  "nissan|J11": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2014_Nissan_Qashqai_Tekna_Dig-T_4WD_Front.jpg/640px-2014_Nissan_Qashqai_Tekna_Dig-T_4WD_Front.jpg",
  "nissan|x-trail|T30":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2003_Nissan_X-Trail_2.0_Sport_Front.jpg/640px-2003_Nissan_X-Trail_2.0_Sport_Front.jpg",
  "nissan|x-trail|T32":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2014_Nissan_X-Trail_Tekna_dCi_4WD_Front.jpg/640px-2014_Nissan_X-Trail_Tekna_dCi_4WD_Front.jpg",

  // ── Audi ──
  "audi|a4|B8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2009_Audi_A4_S_line_TDi_2.0_Front.jpg/640px-2009_Audi_A4_S_line_TDi_2.0_Front.jpg",
  "audi|a4|B9":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2016_Audi_A4_S_line_TDi_2.0_Front.jpg/640px-2016_Audi_A4_S_line_TDi_2.0_Front.jpg",
  "audi|B8": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2009_Audi_A4_S_line_TDi_2.0_Front.jpg/640px-2009_Audi_A4_S_line_TDi_2.0_Front.jpg",
  "audi|B9": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2016_Audi_A4_S_line_TDi_2.0_Front.jpg/640px-2016_Audi_A4_S_line_TDi_2.0_Front.jpg",
  "audi|a6|C7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2012_Audi_A6_S_line_TDi_2.0_Front.jpg/640px-2012_Audi_A6_S_line_TDi_2.0_Front.jpg",
  "audi|a6|C8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Audi_A6_S_line_40_TDI_quattro_Front.jpg/640px-2019_Audi_A6_S_line_40_TDI_quattro_Front.jpg",
  "audi|a3|8V":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2013_Audi_A3_Sportback_1.4_TFSI_S_line_Front.jpg/640px-2013_Audi_A3_Sportback_1.4_TFSI_S_line_Front.jpg",
  "audi|q5|FY":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Audi_Q5_S_line_40_TDI_quattro_Front.jpg/640px-2018_Audi_Q5_S_line_40_TDI_quattro_Front.jpg",

  // ── Lexus ──
  "lexus|rx|AL10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2010_Lexus_RX_450h_SE-L_CVT_3.5_Front.jpg/640px-2010_Lexus_RX_450h_SE-L_CVT_3.5_Front.jpg",
  "lexus|rx|AL20":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2016_Lexus_RX_450h_Luxury_CVT_3.5_Front.jpg/640px-2016_Lexus_RX_450h_Luxury_CVT_3.5_Front.jpg",
  "lexus|es|XV40":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2007_Lexus_ES_350_Front.jpg/640px-2007_Lexus_ES_350_Front.jpg",
  "lexus|es|XV60":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2013_Lexus_ES_300h_SE-I_CVT_2.5_Front.jpg/640px-2013_Lexus_ES_300h_SE-I_CVT_2.5_Front.jpg",

  // ── Lada ──
  "lada|vesta|FL":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lada_Vesta_%28front%29.jpg/640px-Lada_Vesta_%28front%29.jpg",
  "lada|granta|2190":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lada_Granta_%28front%29.jpg/640px-Lada_Granta_%28front%29.jpg",
};

export function lookupGenerationImage(
  brandSlug: string,
  modelSlug: string,
  code: string
): string | null {
  const c = code.split("/")[0].trim().toUpperCase();
  const brand = brandSlug.toLowerCase();
  const slug = modelSlug.toLowerCase();

  const tryKey = (chassis: string) =>
    GENERATION_IMAGE_CACHE[`${brand}|${slug}|${chassis}`] ??
    GENERATION_IMAGE_CACHE[`${brand}|${chassis}`] ??
    null;

  const direct = tryKey(c);
  if (direct) return direct;

  const baseFl = c.replace(/ FL$/, "").replace(/ II$/, "");
  if (baseFl !== c) {
    const flPhoto = tryKey(baseFl);
    if (flPhoto) return flPhoto;
  }

  // BMW E91/E92/E93 → фото базового E90 (только внутри марки)
  const bmw = c.match(/^([A-Z])(\d)(\d)$/);
  if (bmw && bmw[3] !== "0") {
    const base = `${bmw[1]}${bmw[2]}0`;
    return (
      GENERATION_IMAGE_CACHE[`${brand}|${slug}|${base}`] ??
      GENERATION_IMAGE_CACHE[`${brand}|${base}`] ??
      null
    );
  }

  return null;
}
