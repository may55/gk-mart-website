import { useRef, useState } from "react";
import { Loader2, Upload, X, ImageOff } from "lucide-react";
import { adminFetch, adminUpload } from "../../lib/admin-api";
import { resizeImageToMaxSize } from "../../../lib/image-processing";

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 150 * 1024;

interface Props {
  productEnum: string;
  images: string[];
  onChanged: (images: string[]) => void;
}

export function ProductImageManager({ productEnum, images, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canAdd = images.length < MAX_IMAGES;

  const upload = async (files: File[]) => {
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Only ${MAX_IMAGES - images.length} slot(s) remaining`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const resizedFiles = await Promise.all(
        files.map((file) => resizeImageToMaxSize(file, MAX_SIZE_BYTES)),
      );
      const formData = new FormData();
      resizedFiles.forEach((f) => formData.append("images", f));
      const res = (await adminUpload(`/products/${productEnum}/images`, formData)) as {
        data: { images: string[] };
      };
      onChanged(res.data.images);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (index: number) => {
    setDeletingIndex(index);
    setError(null);
    try {
      const res = await adminFetch<{ data: { images: string[] } }>(
        `/products/${productEnum}/images/${index}`,
        { method: "DELETE" },
      );
      onChanged(res.data.images);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    upload(files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Images</h2>
        <span className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-24 w-24 shrink-0">
            <img
              src={url}
              alt={`product-${i + 1}`}
              className="h-full w-full rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(i)}
              disabled={deletingIndex !== null || uploading}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow disabled:opacity-60"
            >
              {deletingIndex === i ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}

        {images.length === 0 && !uploading && (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}

        {uploading && (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {canAdd && !uploading && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Upload className="h-5 w-5" />
            <span className="text-center text-[10px] leading-tight">Drop or click</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => upload(Array.from(e.target.files ?? []))}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Max 5 images · 150KB each · JPG, PNG, WebP</p>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
