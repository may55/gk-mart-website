const DEFAULT_MAX_BYTES = 150 * 1024;

/** Shrinks an oversized image to the upload limit without changing its aspect ratio. */
export async function resizeImageToMaxSize(
  file: File,
  maxBytes = DEFAULT_MAX_BYTES,
): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= maxBytes) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    let quality = 0.86;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not process image");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= maxBytes) {
        const filename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], filename, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }

      if (quality > 0.5) {
        quality -= 0.1;
      } else {
        // Reduce both dimensions by the same factor to preserve the aspect ratio.
        width *= 0.8;
        height *= 0.8;
        quality = 0.82;
      }
    }

    throw new Error(`Could not resize ${file.name} below ${Math.round(maxBytes / 1024)}KB`);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality,
    );
  });
}
