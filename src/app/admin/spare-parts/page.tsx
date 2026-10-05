"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Wrench,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";
import type {
  SparePart,
  SparePartListResponse,
  SparePartResponse,
} from "@/types/api";

interface SparePartForm {
  name: string;
  slug: string;
  price: string;
  image: string;
  description: string;
  features: string[];
  inStock: boolean;
}

const formatPrice = (value: number) =>
  `PKR ${value.toLocaleString("en-US")}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyForm: SparePartForm = {
  name: "",
  slug: "",
  price: "",
  image: "",
  description: "",
  features: [""],
  inStock: true,
};

const MAX_FEATURES = 8;

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong.";

const inputClass = (error?: string) =>
  `w-full rounded-xl border bg-[#081119] px-4 text-sm text-white outline-none transition-all placeholder:text-[#5F6B79] ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-[#273540] focus:border-[#c8e51b] focus:ring-1 focus:ring-[#c8e51b]/20"
  }`;

function SparePartImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#273641] bg-[#081119]">
      {failed || !src ? (
        <Wrench size={20} className="text-[#566473]" />
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-9 w-9 object-contain"
        />
      )}
    </div>
  );
}

export default function SparePartsPage() {
  const router = useRouter();

  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "out-of-stock"
  >("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SparePartForm>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  useEffect(() => {
    request<SparePartListResponse>("/spare-parts", {
      query: { limit: 100 },
    })
      .then((data) => setSpareParts(data.spareParts))
      .catch((err) => showToast(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredSpareParts = spareParts.filter((item) => {
    const matchesSearch = `${item.name} ${item.slug} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && item.inStock) ||
      (stockFilter === "out-of-stock" && !item.inStock);

    return matchesSearch && matchesStock;
  });

  const inStockCount = spareParts.filter((item) => item.inStock).length;
  const outOfStockCount = spareParts.length - inStockCount;

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setSlugTouched(false);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item: SparePart) => {
    setEditingId(item._id);

    setForm({
      name: item.name,
      slug: item.slug,
      price: String(item.price),
      image: item.imageUrl,
      description: item.description,
      features: item.features.length > 0 ? [...item.features] : [""],
      inStock: item.inStock,
    });

    setSelectedFile(null);
    setSlugTouched(true);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setSlugTouched(false);
    setErrors({});
  };

  const handleInput = (
    field: "name" | "slug" | "price" | "description",
    value: string
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "name" && !slugTouched) {
        next.slug = value.trim() ? slugify(value) : "";
      }

      return next;
    });

    if (field === "slug") {
      setSlugTouched(true);
    }

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      ...(field === "name" ? { slug: "" } : {}),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature
      ),
    }));
  };

  const addFeature = () => {
    setForm((prev) =>
      prev.features.length >= MAX_FEATURES
        ? prev
        : { ...prev, features: [...prev.features, ""] }
    );
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const next = prev.features.filter((_, i) => i !== index);

      return { ...prev, features: next.length > 0 ? next : [""] };
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG, WEBP, GIF and AVIF images are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5MB.",
      }));
      return;
    }

    setSelectedFile(file);
    setForm((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const priceValue = Number(form.price);
    const slugValue = form.slug.trim();

    if (!form.name.trim()) {
      newErrors.name = "Spare Part name is required.";
    }

    if (!slugValue) {
      newErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
      newErrors.slug =
        "Slug must use lowercase letters, numbers and hyphens.";
    } else if (
      spareParts.some(
        (item) => item.slug === slugValue && item._id !== editingId
      )
    ) {
      newErrors.slug = "This slug is already used by another spare part.";
    }

    if (!form.price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = "Enter a valid price greater than 0.";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (editingId === null && !selectedFile) {
      newErrors.image = "Spare Part image is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const fields = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      features: form.features
        .map((feature) => feature.trim())
        .filter((feature) => feature !== ""),
      inStock: form.inStock,
    };

    setSaving(true);

    try {
      let body: FormData | typeof fields;

      if (selectedFile) {
        const fd = new FormData();

        fd.append("image", selectedFile);
        fd.append("name", fields.name);
        fd.append("slug", fields.slug);
        fd.append("price", String(fields.price));
        fd.append("description", fields.description);
        fd.append("inStock", String(fields.inStock));
        fields.features.forEach((feature) => fd.append("features", feature));

        body = fd;
      } else {
        body = fields;
      }

      if (editingId !== null) {
        const data = await request<SparePartResponse>(
          `/spare-parts/${editingId}`,
          { method: "PATCH", body }
        );

        setSpareParts((prev) =>
          prev.map((item) =>
            item._id === data.sparePart._id ? data.sparePart : item
          )
        );

        showToast("Spare Part updated successfully.");
      } else {
        const data = await request<SparePartResponse>("/spare-parts", {
          method: "POST",
          body,
        });

        setSpareParts((prev) => [data.sparePart, ...prev]);

        showToast("Spare Part added successfully.");
      }

      closeModal();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: errorText(err) }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SparePart) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name}?`
    );

    if (!confirmed) return;

    try {
      await request(`/spare-parts/${item._id}`, { method: "DELETE" });

      setSpareParts((prev) =>
        prev.filter((entry) => entry._id !== item._id)
      );

      showToast("Spare Part deleted successfully.");
    } catch (err) {
      showToast(errorText(err));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#071018] text-[#E8EBF2]">
      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#263541] bg-[#0D1720] text-[#9CA8B6] transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/10 hover:text-[#c8e51b]"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c8e51b]/10">
                    <Wrench size={15} className="text-[#c8e51b]" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7F8B9A]">
                    EVINN Admin Panel
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Spare Parts
                </h1>

                <p className="mt-1 text-sm text-[#7E8998]">
                  Manage your replacement parts and components.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c8e51b] px-5 text-sm font-bold text-[#071018] shadow-[0_8px_30px_rgba(200,229,27,0.12)] transition-all duration-200 hover:bg-[#d8ef43] hover:shadow-[0_10px_35px_rgba(200,229,27,0.2)]"
            >
              <Plus size={19} />
              Add New Spare Part
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8e51b]/10 text-[#c8e51b]">
                  <Wrench size={20} />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#586675]">
                  Spare Parts
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Total Spare Parts</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {spareParts.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8e51b]/10 text-[#c8e51b]">
                  <Check size={20} />
                </div>

                <span className="rounded-full bg-[#c8e51b]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#c8e51b]">
                  In Stock
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">In Stock</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {inStockCount}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316]">
                  <X size={20} />
                </div>

                <span className="rounded-full bg-[#f97316]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#f97316]">
                  Out of Stock
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Out of Stock</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {outOfStockCount}
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1E2C38] bg-[#0D1720] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-4 border-b border-[#1E2C38] p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Spare Parts
                </h2>

                <p className="mt-1 text-sm text-[#727F8E]">
                  Showing {filteredSpareParts.length} of {spareParts.length}{" "}
                  spare parts
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-xl border border-[#263540] bg-[#081119] p-1">
                  {(
                    [
                      ["all", "All"],
                      ["in-stock", "In Stock"],
                      ["out-of-stock", "Out of Stock"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setStockFilter(value)}
                      className={`flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:flex-none ${
                        stockFilter === value
                          ? "bg-[#c8e51b] text-[#071018]"
                          : "text-[#7F8B9A] hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-[280px]">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647282]"
                  />

                  <input
                    type="text"
                    placeholder="Search spare parts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#263540] bg-[#081119] pl-11 pr-10 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#5F6C7A] focus:border-[#c8e51b] focus:ring-1 focus:ring-[#c8e51b]/20"
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#687585] transition hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#1E2C38] bg-[#09131B]">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Image
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Spare Part
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Features
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-[#7F8B9A]">
                        Loading spare parts...
                      </td>
                    </tr>
                  ) : filteredSpareParts.length > 0 ? (
                    filteredSpareParts.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-[#17242E] transition-all duration-200 hover:bg-[#111D27]"
                      >
                        <td className="px-6 py-4">
                          <SparePartImage src={item.imageUrl} alt={item.name} />
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>

                            <p className="mt-0.5 font-mono text-xs text-[#566473]">
                              {item.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="whitespace-nowrap font-mono text-sm font-semibold text-white">
                            {formatPrice(item.price)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-[260px] text-xs text-[#8996A5]">
                            <p className="truncate">
                              {item.features[0] ?? "No features"}
                            </p>

                            {item.features.length > 1 && (
                              <p className="mt-0.5 text-[#566473]">
                                +{item.features.length - 1} more
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              item.inStock
                                ? "border-[#c8e51b]/20 bg-[#c8e51b]/10 text-[#c8e51b]"
                                : "border-[#f97316]/20 bg-[#f97316]/10 text-[#f97316]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.inStock ? "bg-[#c8e51b]" : "bg-[#f97316]"
                              }`}
                            />

                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#293843] bg-[#101B24] text-[#9AA5B3] transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/10 hover:text-[#c8e51b]"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A2927] bg-[#1A1514] text-[#D9796D] transition-all duration-200 hover:border-[#f97316] hover:bg-[#f97316]/10 hover:text-[#f97316]"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8e51b]/10 text-[#c8e51b]">
                          <Search size={24} />
                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                          No spare parts found
                        </h3>

                        <p className="mt-1 text-sm text-[#7F8B9A]">
                          Try a different search or filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-[#1D2A36] pt-5 text-xs text-[#667281] sm:flex-row sm:items-center sm:justify-between">
            <span>
              © 2026 <b className="text-[#c8e51b]">EVINN.</b> All Rights
              Reserved.
            </span>

            <span>
              Pakistan&apos;s Trusted Electric Mobility Marketplace
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-[#293843] bg-[#0D1720] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E2C38] bg-[#0D1720] px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8e51b]/10 text-[#c8e51b]">
                    <Wrench size={18} />
                  </div>

                  <h2 className="text-lg font-bold text-white">
                    {editingId !== null
                      ? "Edit Spare Part"
                      : "Add New Spare Part"}
                  </h2>
                </div>

                <p className="mt-1 pl-12 text-xs text-[#788493]">
                  Enter spare part information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7D8998] transition-all duration-200 hover:bg-[#18232D] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Spare Part Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInput("name", e.target.value)}
                    placeholder="e.g. Charger"
                    className={`${inputClass(errors.name)} h-12`}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Price (PKR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleInput("price", e.target.value)}
                    placeholder="e.g. 1200"
                    className={`${inputClass(errors.price)} h-12`}
                  />

                  {errors.price && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleInput("slug", e.target.value)}
                    placeholder="charger"
                    className={`${inputClass(errors.slug)} h-12 font-mono`}
                  />

                  <p className="mt-1.5 text-xs text-[#657282]">
                    Auto-generated from the name. You can edit it.
                  </p>

                  {errors.slug && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleInput("description", e.target.value)}
                  placeholder="Describe this spare part..."
                  className={`${inputClass(errors.description)} resize-none py-3 leading-relaxed`}
                />

                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#D6DBE2]">
                    Features
                  </label>

                  <span className="text-xs text-[#657282]">
                    {form.features.length} / {MAX_FEATURES}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        placeholder={`Feature ${index + 1}`}
                        className={`${inputClass()} h-11`}
                      />

                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3A2927] bg-[#1A1514] text-[#D9796D] transition-all duration-200 hover:border-[#f97316] hover:bg-[#f97316]/10 hover:text-[#f97316]"
                        title="Remove feature"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {form.features.length < MAX_FEATURES && (
                  <button
                    type="button"
                    onClick={addFeature}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#c8e51b] transition hover:text-[#d8ef43]"
                  >
                    <Plus size={14} />
                    Add Feature
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Spare Part Image
                </label>

                <label className="flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#33434F] bg-[#081119] p-5 text-center transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/5">
                  {form.image ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#293843] bg-[#0D1720] p-3 shadow-lg">
                          <img
                            src={form.image}
                            alt="Spare Part preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c8e51b] text-[#071018]">
                          <Check size={14} />
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#c8e51b]">
                        <ImagePlus size={14} />
                        Change Image
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={30} className="mb-2 text-[#c8e51b]" />

                      <span className="text-sm font-medium text-[#D6DBE2]">
                        Upload spare part image
                      </span>

                      <span className="mt-1 text-xs text-[#697686]">
                        JPG, PNG, WEBP, GIF or AVIF • Max 5MB
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {errors.image && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.image}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Stock Status
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, inStock: true }))}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      form.inStock
                        ? "border-[#c8e51b] bg-[#c8e51b]/10 text-[#c8e51b] shadow-[0_0_20px_rgba(200,229,27,0.05)]"
                        : "border-[#273540] bg-[#081119] text-[#7F8B9A] hover:border-[#3A4A57]"
                    }`}
                  >
                    In Stock
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, inStock: false }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      !form.inStock
                        ? "border-[#f97316] bg-[#f97316]/10 text-[#f97316]"
                        : "border-[#273540] bg-[#081119] text-[#7F8B9A] hover:border-[#3A4A57]"
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#1D2A36] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#2A3843] bg-[#101B24] px-5 py-3 text-sm font-semibold text-[#AAB4C1] transition-all duration-200 hover:border-[#53616F] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#c8e51b] px-5 py-3 text-sm font-bold text-[#071018] transition-all duration-200 hover:bg-[#d8ef43] hover:shadow-[0_8px_25px_rgba(200,229,27,0.15)]"
                >
                  <Check size={17} />

                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Spare Part"
                      : "Add Spare Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-[#c8e51b]/20 bg-[#101B24] px-5 py-3 text-sm font-medium text-white shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8e51b] text-[#071018]">
            <Check size={14} />
          </div>

          {toast}
        </div>
      )}
    </div>
  );
}