"use client";

import { useState } from "react";
import { request } from "@/lib/api";
import type { BrandListResponse } from "@/types/api";

type Row = [
  string,
  string,
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

const N = "N/A";

const bikeRows: Row[] = [
  ["Crown Electric Spark", "Crown CMC", 195000, "/crown1.webp", "crown-electric-spark", "70 km", "65 km/h", "72V 30Ah", "4.5 hrs", "3000W", "115 kg", "2 Years"],
  ["Crown Electric Fairy", "Crown CMC", 220000, "/crown2.webp", "crown-electric-fairy", "70 km", "55 km/h", "72V 30Ah", "3 to 4 hrs", "3000W", "115 kg", "2 Years"],
  ["Crown Electric Firefly", "Crown CMC", 235000, "/crown3.webp", "crown-electric-firefly", "90 km", "65 km/h", "72V 30Ah", "4.5 hrs", "3000W", "115 kg", "2 Years"],
  ["Road King Bullet 70cc", "Road King", 135000, "/road1.png", "road-king-bullet", "120 km", "80 km/h", "72V 30Ah", "4.5 hrs", "3000W", "115 kg", "2 Years"],
  ["Hi-Speed Infinity 150cc (2025)", "Hi Speed", 420000, "/hispeed1.jpeg", "hi-speed-infinity", N, "110 km/h", N, N, "11.4 hp", "120 kg", N],
  ["Hi-Speed SR200 200cc (2025)", "Hi Speed", 500000, "/hispeed2.jpg", "hi-speed-sr200", "405 km", "130 km/h", N, N, "10.8 hp", "147 kg", N],
  ["Hi-Speed Batllo SR 200 (2025)", "Hi Speed", 615000, "/hispeed3.webp", "hi-speed-batllo-sr", "520 km", "130 km/h", N, N, "17.4 hp", "140 kg", N],
  ["Hi-Speed Cyclone RA2 (2025)", "Hi Speed", 860000, "/hispeed4.webp", "hi-speed-cyclone-ra2", "390 km", "140 km/h", N, N, "19 hp", "149 kg", N],
  ["Road King RK-100E", "Road King", 198000, "/road2.png", "road-king-rk", "120 km", "90 km/h", "72V 30Ah", "4.5 hrs", "3000W", "115 kg", "2 Years"],
  ["Metro LY 70", "Metro", 88000, "/metro1.jpeg", "metro-ly-70", "522 km", "85 km/h", N, N, "4.5 hp", "88 kg", N],
  ["Metro Wonder Bike", "Metro", 110000, "/metro2.webp", "metro-wonder-bike", N, N, N, N, "5.6 hp", "82 kg", N],
  ["Metro MR 70", "Metro", 115000, "/metro3.jpeg", "metro-mr-70", "522 km", "85 km/h", N, N, "5.5 hp", "82 kg", N],
  ["Metro Dabang 70cc", "Metro", 124000, "/metro4.png", "metro-dabang-70cc", "495 km", "85 km/h", N, N, "5.6 hp", "82 kg", N],
  ["United US150 (2024)", "United", 302000, "/united.webp", "united-us150", "520 km", "110 km/h", N, N, "11.8 hp", "128 kg", N],
  ["Yadea Keeness (2025)", "Yadea", 1350000, "/yadea1.png", "yadea-keeness", "140 km", "100 km/h", N, N, "13.4 hp", "140 kg", N],
];

const scooterRows: Row[] = [
  ["Luyuan MODA-1", "Luyuan", 215000, "/luyun1.jpg", "luyuan-moda-1", "90 km", "70 km/h", "60V 20Ah", "6 hrs", "1200W", "100 kg", "2 Years"],
  ["Luyuan S70", "Luyuan", 235000, "/luyun2.jpg", "luyuan-s70", "120 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["REVOO A04", "Revoo", 100000, "/revoo1.png", "revoo-a04", "40 km", "70 km/h", "60V 20Ah", "6 hrs", "1200W", "100 kg", "2 Years"],
  ["REVOO A01", "Revoo", 210000, "/revoo2.png", "revoo-model-2", "95 km", "70 km/h", "60V 20Ah", "7 hrs", "1200W", "100 kg", "2 Years"],
  ["Orevo B2", "Orevo", 165000, "/orevo1.png", "orevo-b2", "75 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Orevo G9", "Orevo", 260000, "/orevo2.png", "orevo-g9", "120 km", "70 km/h", "60V 20Ah", "6 hrs", "1200W", "100 kg", "2 Years"],
  ["Jolta Electric Sparrow", "Jolta", 144900, "/jolta1.png", "jolta-electric-sparrow", "55 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Jolta Electric Neo", "Jolta", 147900, "/jotla2.png", "jolta-electric-neo", "70 km", "60 km/h", "60V 20Ah", "6 hrs", "1200W", "100 kg", "2 Years"],
  ["MAX-7", "EVINN", 200000, "/evinn1.png", "evinn-max-7", "100 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["LEQI", "EVINN", 180000, "/evinn2.png", "evinn-leqi", "100 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Velectra 1969", "Velectra", 619000, "/velectra1.webp", "velectra-1969", "150 km", "105 km/h", "60V 20Ah", "3.5 hrs", "1200W", "100 kg", "2 Years"],
  ["Velocity 180", "Velectra", 339000, "/velectra2.webp", "velocity-180", "180 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["ECRUZE TRI-MAX", "ECruze", 252000, "/ecruze1.png", "ecruze-tri-max", "85 km", "45 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["ECRUZE X9-Pro", "ECruze", 222000, "/ecruze2.png", "ecruze-x9-pro", "75 km", "60 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Eveon Zippy", "Eveon", 97000, "/eveon1.jpg", "eveon-zippy", "40 km", "70 km/h", "60V 20Ah", "6 hrs", "1200W", "100 kg", "2 Years"],
  ["Eveon Pearl", "Eveon", 159000, "/eveon2.jpg", "eveon-pearl", "60 km", "70 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Sprint", "Jinpeng", 229900, "/jinpeng1.webp", "jinpeng-sprint", "110 km", "55 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Reliance", "Jinpeng", 239900, "/jinpeng2.webp", "jinpeng-model-2", "45 km", "90 km/h", "60V 20Ah", "4 hrs", "1200W", "100 kg", "2 Years"],
  ["Evee S1 Pro (2024)", "Evee", 195000, "/evee1.png", "s1-pro", "85 km", "50 km/h", N, N, "1.6 hp", "105 kg", N],
  ["Evee S1 Air (2024)", "Evee", 225000, "/evee2.png", "s1-air", "120 km", "60 km/h", N, N, "2.7 hp", "110 kg", N],
  ["Evee S1 (2024)", "Evee", 225000, "/evee3.png", "s1", "65 km", "50 km/h", N, N, "1.34 hp", "100 kg", N],
  ["Evee Nisa 3W (2024)", "Evee", 235000, "/evee4.png", "nisa-3w", "65 km", "50 km/h", N, N, "1.61 hp", "90 kg", N],
  ["Evee SQUBE Max (2024)", "Evee", 235000, "/evee5.png", "sqube-max", "100 km", "60 km/h", N, N, "1.6 hp", "95 kg", N],
  ["Evee GEN-Z Pro (2026)", "Evee", 239000, "/evee6.png", "gen-z-pro", "85 km", "60 km/h", N, N, "2.68 hp", "95 kg", N],
  ["Evee GEN-Z (2024)", "Evee", 269000, "/evee7.png", "gen-z", "80 km", "60 km/h", N, N, "2.68 hp", "110 kg", N],
  ["Evee Nisa (2024)", "Evee", 340000, "/evee5.png", "nisa", "65 km", "60 km/h", N, N, "2.68 hp", "105 kg", N],
  ["Evee Mito+ (2024)", "Evee", 345000, "/evee3.png", "mitoplus", "100 km", "70 km/h", N, N, "2.7 hp", "95 kg", N],
  ["Horwin CR1 (2024)", "Horwin", 399000, "/horwin1.png", "horwin-cr1", N, N, N, N, "10.7 hp", "140 kg", N],
  ["Horwin QBB5 (2023)", "Horwin", 492000, "/horwin2.png", "horwin-qbb5", N, N, N, N, "3.75 hp", "125 kg", N],
  ["Horwin EK1 (2024)", "Horwin", 591600, "/horwin3.jpeg", "horwin-ek1", N, N, N, N, "3.75 hp", "92 kg", N],
  ["Horwin SK1 (2024)", "Horwin", 635000, "/horwin4.jpeg", "horwin-sk1", "90 km", "90 km/h", N, N, "3.1 hp", "105 kg", N],
  ["Metro X8 Foldable Electric Scooter", "Metro", 129000, "/metro5.webp", "metro-x8-foldable-electric-scooter", N, N, N, N, N, N, N],
  ["Metro T9 Eco", "Metro", 174000, "/metro6.webp", "metro-t9-eco", "475 km", "50 km/h", N, N, "7.0 hp", "90 kg", N],
  ["Metro T9 Sport", "Metro", 184000, "/metro7.jpeg", "metro-t9-sport", "520 km", "55 km/h", N, N, "2.15 hp", "85 kg", N],
  ["Metro Thrill", "Metro", 195000, "/metro8.webp", "metro-thrill", N, N, N, N, "1.61 hp", "95 kg", N],
  ["Metro Thrill Pro", "Metro", 199000, "/metro9.jpeg", "metro-thrill-pro", N, N, N, N, "2.68 hp", "105 kg", N],
  ["Metro Thrill Pro 125", "Metro", 210000, "/metro10.webp", "metro-thrill-pro-125", "456 km", "95 km/h", N, N, "11.5 hp", "108 kg", N],
  ["Metro Metrix", "Metro", 250000, "/metro11.webp", "metro-metrix", "150 km", "65 km/h", N, N, "5.0 hp", "82 kg", N],
  ["Metro M6 Empower (Nano Carbon Fiber)", "Metro", 260000, "/metro12.jpeg", "metro-m6-empower-nano-carbon-fiber", N, N, N, N, "12.8 hp", "128 kg", N],
  ["Metro E8S Range Maker", "Metro", 265000, "/metro13.png", "metro-e8s-range-maker", N, N, N, N, "1.34 hp", "137 kg", N],
  ["Metro E8S Pro", "Metro", 277000, "/metro14.webp", "metro-e8s-pro", N, N, N, N, "2.68 hp", "102 kg", N],
  ["Metro T9 Pro", "Metro", 279000, "/metro15.webp", "metro-t9-pro", N, N, N, N, "1.61 hp", "120 kg", N],
  ["Metro E8S Mountain Climber", "Metro", 284000, "/metro16.webp", "metro-e8s-mountain-climber", N, N, N, N, "10.8 hp", "105 kg", N],
  ["Metro M6 Empower (Portable Lithium)", "Metro", 288000, "/metro17.webp", "metro-m6-empower-portable-lithium", N, N, N, N, "1.34 hp", "70 kg", N],
  ["Metro Premium", "Metro", 295500, "/metro18.webp", "metro-premium", "540 km", "85 km/h", N, N, "5.0 hp", "82 kg", N],
  ["Metro Premium Plus", "Metro", 318000, "/metro19.webp", "metro-premium-plus", N, N, N, N, "6.5 hp", "125 kg", N],
  ["Metro Miku Super", "Metro", 550000, "/metro12.jpeg", "metro-miku-super", "523 km", "85 km/h", N, N, "6.03 hp", "110 kg", N],
  ["Okla Onyx (2024)", "Okla", 275000, "/okla1.webp", "okla-onyx", "85 km", "60 km/h", N, N, "1.6 hp", "95 kg", N],
  ["Okla Orbit (2026)", "Okla", 162000, "/okla2.jpeg", "okla-orbit", "80 km", "45 km/h", "72V 20Ah", N, "1000W", N, "2 Years"],
  ["Okla OKT Econo (2026)", "Okla", 202000, "/okla3.jpeg", "okla-okt-econo", "80 km", "45 km/h", "72V 32Ah", N, "1200W", N, "2 Years"],
  ["Okla OMO (2026)", "Okla", 299000, "/okla4.webp", "okla-omo", "100 km", "60 km/h", "72V 32Ah", N, "2000W", N, "2 Years"],
  ["Okla OMIGO (2026)", "Okla", 399000, "/okla5.webp", "okla-omigo", "75 km", "50 km/h", "74V 28Ah", N, "1500W", N, "2 Years"],
  ["Okla OKG (2026)", "Okla", 549000, "/okla6.png", "okla-okg", "60 km", "80 km/h", "74V 28Ah", N, "4000W", N, "2 Years"],
  ["Okla OMAX (2026)", "Okla", 599000, "/okla7.png", "okla-omax", "80 km", "85 km/h", "74V 28Ah", N, "3000W", N, "2 Years"],
];

const allModels = [
  ...bikeRows.map((row) => ({ type: "bike", row })),
  ...scooterRows.map((row) => ({ type: "scooter", row })),
];

export default function ImportModelsPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLine = (line: string) => setLog((prev) => [...prev, line]);

  const run = async () => {
    setRunning(true);
    setLog([]);

    try {
      const { brands } = await request<BrandListResponse>("/brands");

      if (brands.length === 0) {
        addLine("No brands in backend. Import brands first.");
        setRunning(false);
        return;
      }

      const brandMap = new Map(
        brands.map((brand) => [brand.displayName.toLowerCase(), brand._id])
      );

      for (const { type, row } of allModels) {
        const [name, brandName, price, image, slug, range, topSpeed, battery, chargingTime, motorPower, weight, warranty] = row;

        try {
          const brandId = brandMap.get(brandName.toLowerCase());

          if (!brandId) throw new Error(`brand "${brandName}" not found in backend`);

          const res = await fetch(image);

          if (!res.ok) throw new Error(`image ${image} not found in public folder`);

          const blob = await res.blob();
          const ext = image.split(".").pop();
          const file = new File([blob], `${slug}.${ext}`, { type: blob.type });

          const fd = new FormData();
          fd.append("image", file);
          fd.append("name", name);
          fd.append("brand", brandId);
          fd.append("type", type);
          fd.append("price", String(price));
          fd.append("rating", "4.5");
          fd.append("slug", slug);
          fd.append(
            "specs",
            JSON.stringify({ range, topSpeed, battery, chargingTime, motorPower, weight, warranty })
          );

          await request("/bikes", { method: "POST", body: fd });

          addLine(`${name}: added`);
        } catch (err) {
          addLine(`${name}: ${err instanceof Error ? err.message : "failed"}`);
        }
      }

      addLine("Done.");
    } catch (err) {
      addLine(err instanceof Error ? err.message : "failed");
    }

    setRunning(false);
  };

  return (
    <div style={{ padding: 32, color: "#111", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Import old models</h1>

      <p style={{ margin: "8px 0 16px" }}>
        Uploads {allModels.length} models (with images) to the backend. Login as
        admin and import brands first.
      </p>

      <button
        onClick={run}
        disabled={running}
        style={{
          padding: "10px 18px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {running ? "Importing..." : "Start import"}
      </button>

      <ul style={{ marginTop: 20, lineHeight: 1.8 }}>
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}