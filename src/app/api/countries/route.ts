import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerce } from "@/lib/woocommerce";

/**
 * GET /api/countries - Get countries and states/cities from WooCommerce
 */
export async function GET(request: NextRequest) {
  try {
    // Get shipping zones to extract countries and locations
    const shippingZones = await fetchWooCommerce("shipping/zones");

    // Extract unique countries from shipping zones
    const countriesMap = new Map<string, {
      code: string;
      name: string;
      states: Array<{ code: string; name: string; cities?: string[] }>;
    }>();

    // Process shipping zones to extract location data
    if (shippingZones && Array.isArray(shippingZones)) {
      for (const zone of shippingZones) {
        if (zone.locations && Array.isArray(zone.locations)) {
          for (const location of zone.locations) {
            const countryCode = location.code?.split(":")[0] || location.code || "";
            const stateCode = location.code?.includes(":") 
              ? location.code.split(":")[1] 
              : "";

            if (countryCode) {
              if (!countriesMap.has(countryCode)) {
                countriesMap.set(countryCode, {
                  code: countryCode,
                  name: getCountryName(countryCode),
                  states: [],
                });
              }

              const country = countriesMap.get(countryCode)!;
              
              // Add state if provided
              if (stateCode && !country.states.find(s => s.code === stateCode)) {
                country.states.push({
                  code: stateCode,
                  name: getStateName(countryCode, stateCode) || stateCode,
                });
              }
            }
          }
        }
      }
    }

    // If no zones found, add default Iran
    if (countriesMap.size === 0) {
      countriesMap.set("IR", {
        code: "IR",
        name: "ایران",
        states: getIranianProvinces(),
      });
    }

    // Convert map to array
    const countries = Array.from(countriesMap.values());

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get countries API error:", errorMessage);

    // Return default Iran on error
    return NextResponse.json({
      success: true,
      data: [
        {
          code: "IR",
          name: "ایران",
          states: getIranianProvinces(),
        },
      ],
    });
  }
}

function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    IR: "ایران",
    US: "ایالات متحده",
    GB: "انگلستان",
    CA: "کانادا",
    DE: "آلمان",
    FR: "فرانسه",
    IT: "ایتالیا",
    ES: "اسپانیا",
    NL: "هلند",
    BE: "بلژیک",
    AT: "اتریش",
    CH: "سوئیس",
    SE: "سوئد",
    NO: "نروژ",
    DK: "دانمارک",
    FI: "فنلاند",
    PL: "لهستان",
    CZ: "جمهوری چک",
    GR: "یونان",
    PT: "پرتغال",
    IE: "ایرلند",
    TR: "ترکیه",
    AE: "امارات متحده عربی",
    SA: "عربستان سعودی",
    KW: "کویت",
    QA: "قطر",
    BH: "بحرین",
    OM: "عمان",
    JO: "اردن",
    LB: "لبنان",
    IQ: "عراق",
    AF: "افغانستان",
    PK: "پاکستان",
    IN: "هند",
    CN: "چین",
    JP: "ژاپن",
    KR: "کره جنوبی",
    AU: "استرالیا",
    NZ: "نیوزیلند",
    BR: "برزیل",
    MX: "مکزیک",
    AR: "آرژانتین",
    CL: "شیلی",
    ZA: "آفریقای جنوبی",
    EG: "مصر",
    MA: "مراکش",
    DZ: "الجزایر",
    TN: "تونس",
    RU: "روسیه",
    UA: "اوکراین",
    KZ: "قزاقستان",
    UZ: "ازبکستان",
  };

  return countryNames[code] || code;
}

function getStateName(countryCode: string, stateCode: string): string {
  if (countryCode === "IR") {
    const iranProvinces: Record<string, string> = {
      "01": "آذربایجان شرقی",
      "02": "آذربایجان غربی",
      "03": "اردبیل",
      "04": "اصفهان",
      "05": "البرز",
      "06": "ایلام",
      "07": "بوشهر",
      "08": "تهران",
      "09": "چهارمحال و بختیاری",
      "10": "خراسان جنوبی",
      "11": "خراسان رضوی",
      "12": "خراسان شمالی",
      "13": "خوزستان",
      "14": "زنجان",
      "15": "سمنان",
      "16": "سیستان و بلوچستان",
      "17": "فارس",
      "18": "قزوین",
      "19": "قم",
      "20": "کردستان",
      "21": "کرمان",
      "22": "کرمانشاه",
      "23": "کهگیلویه و بویراحمد",
      "24": "گلستان",
      "25": "گیلان",
      "26": "لرستان",
      "27": "مازندران",
      "28": "مرکزی",
      "29": "هرمزگان",
      "30": "همدان",
      "31": "یزد",
    };
    return iranProvinces[stateCode] || stateCode;
  }
  return stateCode;
}

function getIranianProvinces(): Array<{ code: string; name: string }> {
  return [
    { code: "01", name: "آذربایجان شرقی" },
    { code: "02", name: "آذربایجان غربی" },
    { code: "03", name: "اردبیل" },
    { code: "04", name: "اصفهان" },
    { code: "05", name: "البرز" },
    { code: "06", name: "ایلام" },
    { code: "07", name: "بوشهر" },
    { code: "08", name: "تهران" },
    { code: "09", name: "چهارمحال و بختیاری" },
    { code: "10", name: "خراسان جنوبی" },
    { code: "11", name: "خراسان رضوی" },
    { code: "12", name: "خراسان شمالی" },
    { code: "13", name: "خوزستان" },
    { code: "14", name: "زنجان" },
    { code: "15", name: "سمنان" },
    { code: "16", name: "سیستان و بلوچستان" },
    { code: "17", name: "فارس" },
    { code: "18", name: "قزوین" },
    { code: "19", name: "قم" },
    { code: "20", name: "کردستان" },
    { code: "21", name: "کرمان" },
    { code: "22", name: "کرمانشاه" },
    { code: "23", name: "کهگیلویه و بویراحمد" },
    { code: "24", name: "گلستان" },
    { code: "25", name: "گیلان" },
    { code: "26", name: "لرستان" },
    { code: "27", name: "مازندران" },
    { code: "28", name: "مرکزی" },
    { code: "29", name: "هرمزگان" },
    { code: "30", name: "همدان" },
    { code: "31", name: "یزد" },
  ];
}

