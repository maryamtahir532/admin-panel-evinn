"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bike as BikeIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";
import type {
  Bike,
  BikeListResponse,
  BikeResponse,
  BikeSpecs,
  BikeType,
  Brand,
  BrandListResponse,
} from "@/types/api";

interface ModelForm {
  name: string;
  brand: string;
  type: BikeType;
  price: string;
  rating: string;
  slug: string;
  image: string;
  specs: BikeSpecs;
}

const specFields: { key: keyof BikeSpecs; label: string; placeholder: string }[] = [
  { key: "range", label: "Range", placeholder: "e.g. 70 km" },
  { key: "topSpeed", label: "Top Speed", placeholder: "e.g. 65 km/h" },
  { key: "battery", label: "Battery", placeholder: "e.g. 72V 30Ah" },
  { key: "chargingTime", label: "Charging Time", placeholder: "e.g. 4.5 hrs" },
  { key: "motorPower", label: "Motor Power", placeholder: "e.g. 3000W" },
  { key: "weight", label: "Weight", placeholder: "e.g. 115 kg" },
  { key: "warranty", label: "Warranty", placeholder: "e.g. 2 Years" },
];

const emptySpecs: BikeSpecs = {
  range: "",
  topSpeed: "",
  battery: "",
  chargingTime: "",
  motorPower: "",
  weight: "",
  warranty: "",
};

const emptyForm: ModelForm = {
  name: "",
  brand: "",
  type: "scooter",
  price: "",
  rating: "4.5",
  slug: "",
  image: "",
  specs: emptySpecs,
};

const PAGE_SIZE = 10;

const formatPrice = (value: number) =>
  `PKR ${value.toLocaleString("en-US")}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong.";

const inputClass = (error?: string) =>
  `h-12 w-full rounded-xl border bg-[#081119] px-4 text-sm text-white outline-none transition-all placeholder:text-[#5F6B79] [&>option]:bg-[#081119] ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-[#273540] focus:border-[#c8e51b] focus:ring-1 focus:ring-[#c8e51b]/20"
  }`;

function ModelImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-12 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#273641] bg-[#081119]">
      {failed || !src ? (
        <BikeIcon size={20} className="text-[#566473]" />
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-10 w-12 object-contain"
        />
      )}
    </div>
  );
}

export default function ModelsPage() {
  const router = useRouter();

  const [models, setModels] = useState<Bike[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | BikeType>("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModelForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    Promise.all([
      request<BrandListResponse>("/brands"),
      request<BikeListResponse>("/bikes", { query: { limit: 100 } }),
    ])
      .then(([brandData, bikeData]) => {
        setBrands(brandData.brands);
        setModels(bikeData.bikes);
      })
      .catch((err) => showToast(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, brandFilter]);

  const filteredModels = useMemo(
    () =>
      models.filter((model) => {
        const matchesSearch = `${model.name} ${model.brand.displayName} ${model.type} ${model.slug}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesType = typeFilter === "all" || model.type === typeFilter;

        const matchesBrand =
          brandFilter === "all" || model.brand._id === brandFilter;

        return matchesSearch && matchesType && matchesBrand;
      }),
    [models, search, typeFilter, brandFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedModels = filteredModels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalBikes = models.filter((model) => model.type === "bike").length;
  const totalScooters = models.filter(
    (model) => model.type === "scooter"
  ).length;
  const totalBrands = new Set(models.map((model) => model.brand._id)).size;

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSlugTouched(false);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (model: Bike) => {
    setEditingId(model._id);

    setForm({
      name: model.name,
      brand: model.brand._id,
      type: model.type,
      price: String(model.price),
      rating: String(model.rating),
      slug: model.slug,
      image: model.imageUrl,
      specs: { ...emptySpecs, ...model.specs },
    });

    setImageFile(null);
    setSlugTouched(true);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSlugTouched(false);
    setErrors({});
  };

  const handleInput = (
    field: "name" | "brand" | "type" | "price" | "rating" | "slug",
    value: string
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value } as ModelForm;

      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
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

  const handleSpec = (key: keyof BikeSpecs, value: string) => {
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: value },
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG and WEBP images are allowed.",
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

    setImageFile(file);

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
    const ratingValue = Number(form.rating);
    const slugValue = form.slug.trim();

    if (!form.name.trim()) {
      newErrors.name = "Model name is required.";
    }

    if (!form.brand) {
      newErrors.brand = "Please select a brand.";
    }

    if (!form.price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = "Enter a valid price greater than 0.";
    }

    if (
      form.rating.trim() === "" ||
      Number.isNaN(ratingValue) ||
      ratingValue < 0 ||
      ratingValue > 5
    ) {
      newErrors.rating = "Rating must be between 0 and 5.";
    }

    if (!slugValue) {
      newErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
      newErrors.slug = "Use lowercase letters, numbers and hyphens only.";
    } else if (
      models.some((model) => model.slug === slugValue && model._id !== editingId)
    ) {
      newErrors.slug = "This slug is already used by another model.";
    }

    if (!form.image) {
      newErrors.image = "Model image is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const cleanSpecs = Object.fromEntries(
      specFields.map(({ key }) => [key, form.specs[key].trim() || "N/A"])
    ) as unknown as BikeSpecs;

    const fields = {
      name: form.name.trim(),
      brand: form.brand,
      type: form.type,
      price: Number(form.price),
      rating: Number(form.rating),
      slug: form.slug.trim(),
      specs: cleanSpecs,
    };

    setSaving(true);

    try {
      let body: FormData | typeof fields;

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("name", fields.name);
        fd.append("brand", fields.brand);
        fd.append("type", fields.type);
        fd.append("price", String(fields.price));
        fd.append("rating", String(fields.rating));
        fd.append("slug", fields.slug);
        fd.append("specs", JSON.stringify(fields.specs));
        body = fd;
      } else {
        body = fields;
      }

      if (editingId !== null) {
        const data = await request<BikeResponse>(`/bikes/${editingId}`, {
          method: "PATCH",
          body,
        });

        setModels((prev) =>
          prev.map((model) => (model._id === data.bike._id ? data.bike : model))
        );

        showToast("Model updated successfully.");
      } else {
        const data = await request<BikeResponse>("/bikes", {
          method: "POST",
          body,
        });

        setModels((prev) => [data.bike, ...prev]);

        showToast("Model added successfully.");
      }

      closeModal();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: errorText(err) }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (model: Bike) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${model.name}?`
    );

    if (!confirmed) return;

    try {
      await request(`/bikes/${model._id}`, { method: "DELETE" });

      setModels((prev) => prev.filter((item) => item._id !== model._id));

      showToast("Model deleted successfully.");
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
                    <BikeIcon size={15} className="text-[#c8e51b]" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7F8B9A]">
                    EVINN Admin Panel
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Models
                </h1>

                <p className="mt-1 text-sm text-[#7E8998]">
                  Manage your electric bikes and scooters.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c8e51b] px-5 text-sm font-bold text-[#071018] shadow-[0_8px_30px_rgba(200,229,27,0.12)] transition-all duration-200 hover:bg-[#d8ef43] hover:shadow-[0_10px_35px_rgba(200,229,27,0.2)]"
            >
              <Plus size={19} />
              Add New Model
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8e51b]/10 text-[#c8e51b]">
                  <BikeIcon size={20} />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#586675]">
                  Models
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Total Models</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {models.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8e51b]/10 text-[#c8e51b]">
                  <BikeIcon size={20} />
                </div>

                <span className="rounded-full bg-[#c8e51b]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#c8e51b]">
                  Bikes
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Electric Bikes</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {totalBikes}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38bdf8]/10 text-[#38bdf8]">
                  <Zap size={20} />
                </div>

                <span className="rounded-full bg-[#38bdf8]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8]">
                  Scooters
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Electric Scooters</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {totalScooters}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316]">
                  <Tag size={20} />
                </div>

                <span className="rounded-full bg-[#f97316]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#f97316]">
                  Brands
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Brands With Models</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {totalBrands}
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1E2C38] bg-[#0D1720] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-4 border-b border-[#1E2C38] p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Models
                </h2>

                <p className="mt-1 text-sm text-[#727F8E]">
                  Showing {filteredModels.length} of {models.length} models
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-xl border border-[#263540] bg-[#081119] p-1">
                  {(["all", "bike", "scooter"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setTypeFilter(item)}
                      className={`flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition-all duration-200 sm:flex-none ${
                        typeFilter === item
                          ? "bg-[#c8e51b] text-[#071018]"
                          : "text-[#7F8B9A] hover:text-white"
                      }`}
                    >
                      {item === "all" ? "All" : `${item}s`}
                    </button>
                  ))}
                </div>

                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="h-11 rounded-xl border border-[#263540] bg-[#081119] px-3 text-sm text-white outline-none transition-all duration-200 focus:border-[#c8e51b] focus:ring-1 focus:ring-[#c8e51b]/20 [&>option]:bg-[#081119]"
                >
                  <option value="all">All Brands</option>

                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.displayName}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-[260px]">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647282]"
                  />

                  <input
                    type="text"
                    placeholder="Search models..."
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
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-[#1E2C38] bg-[#09131B]">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Image
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Model
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Brand
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Range / Speed
                    </th>

                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-sm text-[#7F8B9A]"
                      >
                        Loading models...
                      </td>
                    </tr>
                  ) : pagedModels.length > 0 ? (
                    pagedModels.map((model) => (
                      <tr
                        key={model._id}
                        className="border-b border-[#17242E] transition-all duration-200 hover:bg-[#111D27]"
                      >
                        <td className="px-6 py-4">
                          <ModelImage src={model.imageUrl} alt={model.name} />
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-white">
                              {model.name}
                            </span>

                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#566473]">
                              <Star
                                size={12}
                                className="fill-[#c8e51b] text-[#c8e51b]"
                              />
                              {model.rating}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-[#C3CCD6]">
                          {model.brand.displayName}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                              model.type === "bike"
                                ? "border-[#c8e51b]/20 bg-[#c8e51b]/10 text-[#c8e51b]"
                                : "border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#38bdf8]"
                            }`}
                          >
                            {model.type === "bike" ? (
                              <BikeIcon size={13} />
                            ) : (
                              <Zap size={13} />
                            )}

                            {model.type}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="whitespace-nowrap font-mono text-sm font-semibold text-white">
                            {formatPrice(model.price)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs text-[#8996A5]">
                            <p>{model.specs.range}</p>

                            <p className="mt-0.5 text-[#566473]">
                              {model.specs.topSpeed}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(model)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#293843] bg-[#101B24] text-[#9AA5B3] transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/10 hover:text-[#c8e51b]"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(model)}
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
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8e51b]/10 text-[#c8e51b]">
                          <Search size={24} />
                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                          No models found
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

            {filteredModels.length > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-[#1E2C38] px-5 py-4 sm:px-6">
                <p className="text-xs text-[#727F8E]">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#293843] bg-[#101B24] text-[#9AA5B3] transition-all duration-200 hover:border-[#c8e51b] hover:text-[#c8e51b] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#293843] disabled:hover:text-[#9AA5B3]"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#293843] bg-[#101B24] text-[#9AA5B3] transition-all duration-200 hover:border-[#c8e51b] hover:text-[#c8e51b] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#293843] disabled:hover:text-[#9AA5B3]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
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
          <div className="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-[#293843] bg-[#0D1720] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E2C38] bg-[#0D1720] px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8e51b]/10 text-[#c8e51b]">
                    <BikeIcon size={18} />
                  </div>

                  <h2 className="text-lg font-bold text-white">
                    {editingId !== null ? "Edit Model" : "Add New Model"}
                  </h2>
                </div>

                <p className="mt-1 pl-12 text-xs text-[#788493]">
                  Enter model information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7D8998] transition-all duration-200 hover:bg-[#18232D] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Model Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInput("name", e.target.value)}
                    placeholder="e.g. Crown Electric Spark"
                    className={inputClass(errors.name)}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Brand
                  </label>

                  <select
                    value={form.brand}
                    onChange={(e) => handleInput("brand", e.target.value)}
                    className={inputClass(errors.brand)}
                  >
                    <option value="">Select brand</option>

                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.displayName}
                      </option>
                    ))}
                  </select>

                  {errors.brand && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.brand}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInput("type", "bike")}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        form.type === "bike"
                          ? "border-[#c8e51b] bg-[#c8e51b]/10 text-[#c8e51b]"
                          : "border-[#273540] bg-[#081119] text-[#7F8B9A] hover:border-[#3A4A57]"
                      }`}
                    >
                      <BikeIcon size={16} />
                      Bike
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInput("type", "scooter")}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        form.type === "scooter"
                          ? "border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]"
                          : "border-[#273540] bg-[#081119] text-[#7F8B9A] hover:border-[#3A4A57]"
                      }`}
                    >
                      <Zap size={16} />
                      Scooter
                    </button>
                  </div>
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
                    placeholder="e.g. 195000"
                    className={inputClass(errors.price)}
                  />

                  {errors.price && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                    Rating (0 - 5)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => handleInput("rating", e.target.value)}
                    placeholder="e.g. 4.5"
                    className={inputClass(errors.rating)}
                  />

                  {errors.rating && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.rating}
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
                    placeholder="crown-electric-spark"
                    className={`${inputClass(errors.slug)} font-mono`}
                  />

                  <p className="mt-1.5 text-xs text-[#657282]">
                    Auto-generated from the model name. You can edit it.
                  </p>

                  {errors.slug && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Model Image
                </label>

                <label className="flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#33434F] bg-[#081119] p-5 text-center transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/5">
                  {form.image ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="flex h-28 w-40 items-center justify-center rounded-xl border border-[#293843] bg-[#0D1720] p-3 shadow-lg">
                          <img
                            src={form.image}
                            alt="Model preview"
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
                        Upload model image
                      </span>

                      <span className="mt-1 text-xs text-[#697686]">
                        JPG, PNG or WEBP • Max 5MB
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {errors.image && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.image}</p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">
                    Specifications
                  </h3>

                  <span className="text-xs text-[#657282]">
                    Empty fields are saved as N/A
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {specFields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                        {label}
                      </label>

                      <input
                        type="text"
                        value={form.specs[key]}
                        onChange={(e) => handleSpec(key, e.target.value)}
                        placeholder={placeholder}
                        className={inputClass()}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {errors.form && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {errors.form}
                </p>
              )}

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
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#c8e51b] px-5 py-3 text-sm font-bold text-[#071018] transition-all duration-200 hover:bg-[#d8ef43] hover:shadow-[0_8px_25px_rgba(200,229,27,0.15)] disabled:opacity-60"
                >
                  <Check size={17} />

                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Model"
                    : "Add Model"}
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