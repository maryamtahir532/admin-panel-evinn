"use client";

import { useState } from "react";
import { request } from "@/lib/api";

const oldAccessories = [
  {
    name: "Top Box",
    slug: "top-box",
    price: 12000,
    image: "/accessory.png",
    description:
      "Premium quality top box with ample storage for your helmet and extra gear. Features a secure locking mechanism to keep your valuables safe during stops.",
    features: ["Waterproof design", "Secure key lock", "Large capacity (fits 1 full-face helmet)"],
    inStock: true,
  },
  {
    name: "Windshield",
    slug: "windshield",
    price: 4500,
    image: "/accessory1.png",
    description:
      "Aerodynamic windshield designed to reduce wind fatigue and protect you from debris. Made with scratch-resistant acrylic for clear visibility.",
    features: ["Scratch-resistant material", "Easy installation", "Improves aerodynamics"],
    inStock: true,
  },
  {
    name: "Phone Holder",
    slug: "phone-holder",
    price: 1300,
    image: "/accessory2.png",
    description:
      "Sturdy and shock-absorbent phone holder for safe navigation on the go. Keeps your device firmly in place even on bumpy roads.",
    features: ["360-degree rotation", "Anti-vibration pads", "Universal fit for most smartphones"],
    inStock: true,
  },
  {
    name: "Seat Cover",
    slug: "seat-cover",
    price: 2700,
    image: "/accessory3.png",
    description:
      "Breathable and anti-slip seat cover for enhanced comfort on long rides. Protects your original seat from wear, tear, and weather damage.",
    features: ["Anti-slip texture", "Heat resistant", "Water-repellent"],
    inStock: true,
  },
  {
    name: "Helmet",
    slug: "helmet",
    price: 6500,
    image: "/accessory4.png",
    description:
      "High-impact resistant full-face helmet ensuring maximum safety. Features a built-in ventilation system to keep you cool during summer rides.",
    features: ["Safety certified", "Anti-fog clear visor", "Washable inner padding"],
    inStock: true,
  },
  {
    name: "Riding Jacket",
    slug: "riding-jacket",
    price: 8500,
    image: "/accessory5.png",
    description:
      "All-weather riding jacket with protective armor at the elbows, shoulders, and back. Includes reflective stripes for night-time visibility.",
    features: ["CE-approved armor", "Water-resistant outer layer", "Adjustable straps for perfect fit"],
    inStock: true,
  },
  {
    name: "Gloves",
    slug: "gloves",
    price: 2000,
    image: "/accessory6.png",
    description:
      "Durable riding gloves with hard knuckle protection and reinforced palm grips. Designed for comfort and precise throttle control.",
    features: ["Knuckle protection", "Touchscreen compatible fingertips", "Breathable mesh panels"],
    inStock: false,
  },
  {
    name: "Charging Cable",
    slug: "charging-cable",
    price: 1400,
    image: "/accessory7.png",
    description:
      "Heavy-duty, weather-proof charging cable designed specifically for motorcycle setups. Keep your devices charged up on long tours.",
    features: ["Fast charging support", "Weather-proof caps", "Thick durable wire"],
    inStock: true,
  },
];

export default function ImportAccessoriesPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLine = (line: string) => setLog((prev) => [...prev, line]);

  const run = async () => {
    setRunning(true);
    setLog([]);

    for (const item of oldAccessories) {
      try {
        const res = await fetch(item.image);

        if (!res.ok) throw new Error(`image ${item.image} not found in public folder`);

        const blob = await res.blob();
        const ext = item.image.split(".").pop();
        const file = new File([blob], `${item.slug}.${ext}`, { type: blob.type });

        const fd = new FormData();
        fd.append("image", file);
        fd.append("name", item.name);
        fd.append("slug", item.slug);
        fd.append("price", String(item.price));
        fd.append("description", item.description);
        fd.append("inStock", String(item.inStock));
        item.features.forEach((feature) => fd.append("features", feature));

        await request("/accessories", { method: "POST", body: fd });

        addLine(`${item.name}: added`);
      } catch (err) {
        addLine(`${item.name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }

    addLine("Done.");
    setRunning(false);
  };

  return (
    <div style={{ padding: 32, color: "#111", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Import old accessories</h1>

      <p style={{ margin: "8px 0 16px" }}>
        Uploads {oldAccessories.length} accessories (with images) to the backend.
        Login as admin first.
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