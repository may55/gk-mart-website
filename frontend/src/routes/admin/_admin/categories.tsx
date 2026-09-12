import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Image, Loader2, Pencil, Upload } from "lucide-react";
import type { Category } from "../../../lib/types";
import { adminFetch, adminUpload } from "../../../admin/lib/admin-api";
import { resizeImageToMaxSize } from "../../../lib/image-processing";

export const Route = createFileRoute("/admin/_admin/categories")({
  component: CategoriesAdminPage,
});

/** Manages category names and uploads the image shown on the customer category page. */
function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminFetch<{ data: Category[] }>("/categories");
      setCategories(response.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async () => {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    setSaving(true);
    try {
      await adminFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ label: nextLabel }),
      });
      setLabel("");
      await loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const updateLabel = async (id: string) => {
    const nextLabel = editingLabel.trim();
    if (!nextLabel) return;
    setSaving(true);
    try {
      await adminFetch(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ label: nextLabel }),
      });
      setEditingId(null);
      await loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (category: Category, file: File | undefined) => {
    if (!file) return;
    setUploadingId(category._id);
    setError(null);
    try {
      const resizedFile = await resizeImageToMaxSize(file);
      const formData = new FormData();
      formData.append("image", resizedFile);
      await adminUpload(`/categories/${category._id}/image`, formData);
      await loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload category image");
    } finally {
      setUploadingId(null);
      const input = fileInputRefs.current[category._id];
      if (input) input.value = "";
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Manage Categories</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Add category images shown to customers.
        </p>
      </div>

      <div className="mb-6 flex max-w-xl gap-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") createCategory();
          }}
          placeholder="New category name"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={createCategory}
          disabled={saving || !label.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Add category
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.label}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {editingId === category._id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => updateLabel(category._id)}
                      className="text-xs font-semibold text-primary"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">{category.label}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category._id);
                        setEditingLabel(category.label);
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Edit category name"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <input
                  ref={(element) => {
                    fileInputRefs.current[category._id] = element;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadImage(category, event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[category._id]?.click()}
                  disabled={uploadingId === category._id}
                  className="mt-4 flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  {uploadingId === category._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {category.image ? "Update image" : "Add image"}
                </button>
                <p className="mt-1.5 text-[11px] text-muted-foreground">Image limit: 150 KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
