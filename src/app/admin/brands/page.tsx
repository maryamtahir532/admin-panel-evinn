"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";
import type { Brand, BrandListResponse, BrandResponse } from "@/types/api";

interface BrandForm {
  name: string;
  logo: string;
}

const emptyForm: BrandForm = {
  name: "",
  logo: "",
};

const brandLink = (name: string) =>
  "/brands/" +
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong.";

export default function BrandsPage() {
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  useEffect(() => {
    request<BrandListResponse>("/brands")
      .then((data) => setBrands(data.brands))
      .catch((err) => showToast(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands = brands.filter((brand) =>
    `${brand.displayName} ${brand.origin} ${brandLink(brand.displayName)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingId(brand._id);

    setForm({
      name: brand.displayName,
      logo: brand.logoUrl,
    });

    setLogoFile(null);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setErrors({});
  };

  const handleInput = (field: keyof BrandForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
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
        logo: "Only JPG, PNG and WEBP images are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image size must be less than 5MB.",
      }));
      return;
    }

    setLogoFile(file);

    setForm((prev) => ({
      ...prev,
      logo: URL.createObjectURL(file),
    }));

    setErrors((prev) => ({
      ...prev,
      logo: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Brand name is required.";
    }

    if (!form.logo) {
      newErrors.logo = "Brand logo is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      if (editingId !== null) {
        let body: FormData | { displayName: string };

        if (logoFile) {
          body = new FormData();
          body.append("displayName", form.name.trim());
          body.append("logo", logoFile);
        } else {
          body = { displayName: form.name.trim() };
        }

        const data = await request<BrandResponse>(`/brands/${editingId}`, {
          method: "PATCH",
          body,
        });

        setBrands((prev) =>
          prev.map((brand) => (brand._id === data.brand._id ? data.brand : brand))
        );

        showToast("Brand updated successfully.");
      } else {
        const fd = new FormData();
        fd.append("displayName", form.name.trim());
        fd.append("logo", logoFile as File);

        const data = await request<BrandResponse>("/brands", {
          method: "POST",
          body: fd,
        });

        setBrands((prev) =>
          [...prev, data.brand].sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          )
        );

        showToast("Brand added successfully.");
      }

      closeModal();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: errorText(err) }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${brand.displayName}?`
    );

    if (!confirmed) return;

    try {
      await request(`/brands/${brand._id}`, { method: "DELETE" });

      setBrands((prev) => prev.filter((item) => item._id !== brand._id));

      showToast("Brand deleted successfully.");
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
                    <Tag size={15} className="text-[#c8e51b]" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7F8B9A]">
                    EVINN Admin Panel
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Brands
                </h1>

                <p className="mt-1 text-sm text-[#7E8998]">
                  Manage your electric vehicle brands.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c8e51b] px-5 text-sm font-bold text-[#071018] shadow-[0_8px_30px_rgba(200,229,27,0.12)] transition-all duration-200 hover:bg-[#d8ef43] hover:shadow-[0_10px_35px_rgba(200,229,27,0.2)]"
            >
              <Plus size={19} />
              Add New Brand
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#1E2C38] bg-[#0D1720] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-[#2A3B48]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8e51b]/10 text-[#c8e51b]">
                  <Tag size={20} />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#586675]">
                  Brands
                </span>
              </div>

              <p className="text-sm text-[#7F8B9A]">Total Brands</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {brands.length}
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1E2C38] bg-[#0D1720] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-4 border-b border-[#1E2C38] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Brands
                </h2>

                <p className="mt-1 text-sm text-[#727F8E]">
                  Showing {filteredBrands.length} of {brands.length} brands
                </p>
              </div>

              <div className="relative w-full lg:w-[340px]">
                <Search
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#647282]"
                />

                <input
                  type="text"
                  placeholder="Search brands..."
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1E2C38] bg-[#09131B]">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Logo
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Brand Name
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#718090]">
                      Link
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
                        colSpan={4}
                        className="px-6 py-16 text-center text-sm text-[#7F8B9A]"
                      >
                        Loading brands...
                      </td>
                    </tr>
                  ) : filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <tr
                        key={brand._id}
                        className="border-b border-[#17242E] transition-all duration-200 hover:bg-[#111D27]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#273641] bg-[#081119]">
                            <img
                              src={brand.logoUrl}
                              alt={brand.displayName}
                              className="h-9 w-9 object-contain"
                            />
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-white">
                              {brand.displayName}
                            </span>

                            <p className="mt-0.5 text-xs text-[#566473]">
                              {brand.origin || "—"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-[#081119] px-3 py-1.5 font-mono text-xs text-[#8996A5]">
                            {brandLink(brand.displayName)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(brand)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#293843] bg-[#101B24] text-[#9AA5B3] transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/10 hover:text-[#c8e51b]"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(brand)}
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
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8e51b]/10 text-[#c8e51b]">
                          <Search size={24} />
                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                          No brands found
                        </h3>

                        <p className="mt-1 text-sm text-[#7F8B9A]">
                          Try searching with a different brand name.
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
          <div className="max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-[#293843] bg-[#0D1720] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E2C38] bg-[#0D1720] px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8e51b]/10 text-[#c8e51b]">
                    <Tag size={18} />
                  </div>

                  <h2 className="text-lg font-bold text-white">
                    {editingId !== null ? "Edit Brand" : "Add New Brand"}
                  </h2>
                </div>

                <p className="mt-1 pl-12 text-xs text-[#788493]">
                  Enter brand information below.
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
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Brand Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInput("name", e.target.value)}
                  placeholder="e.g. Okla"
                  className={`h-12 w-full rounded-xl border bg-[#081119] px-4 text-sm text-white outline-none transition-all placeholder:text-[#5F6B79] ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#273540] focus:border-[#c8e51b] focus:ring-1 focus:ring-[#c8e51b]/20"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6DBE2]">
                  Brand Logo
                </label>

                <label className="flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#33434F] bg-[#081119] p-5 text-center transition-all duration-200 hover:border-[#c8e51b] hover:bg-[#c8e51b]/5">
                  {form.logo ? (
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#293843] bg-[#0D1720] p-3 shadow-lg">
                        <img
                          src={form.logo}
                          alt="Brand preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c8e51b] text-[#071018]">
                        <Check size={14} />
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={30} className="mb-2 text-[#c8e51b]" />

                      <span className="text-sm font-medium text-[#D6DBE2]">
                        Upload brand logo
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

                {form.logo && (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#c8e51b] transition hover:text-[#d8ef43]">
                    <ImagePlus size={14} />
                    Change Logo

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {errors.logo && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.logo}</p>
                )}
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
                    ? "Update Brand"
                    : "Add Brand"}
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