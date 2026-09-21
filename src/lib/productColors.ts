export interface ProductColorVariant {
  id: string;
  name: string;
  image_url: string;
  images?: string[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

/** Safely reads colour variants returned from Supabase JSONB data with multi-image support. */
export function normalizeProductColorVariants(value: unknown): ProductColorVariant[] {
  let rawValue = value;

  if (typeof value === "string") {
    try {
      rawValue = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(rawValue)) return [];

  const usedIds = new Set<string>();

  return rawValue.reduce<ProductColorVariant[]>((variants, item, index) => {
    if (!isRecord(item)) return variants;

    const name = typeof item.name === "string" ? item.name.trim() : "";
    const imageUrl = typeof item.image_url === "string" ? item.image_url.trim() : "";
    const requestedId = typeof item.id === "string" ? item.id.trim() : "";

    // Parse multi-image array if present
    let images: string[] = [];
    if (Array.isArray(item.images)) {
      images = item.images.filter((img): img is string => typeof img === "string" && img.trim() !== "");
    }

    // Determine the primary cover image
    const primaryImage = imageUrl || images[0] || "";

    // A customer-facing variant must always identify a colour and at least one image.
    if (!name || !primaryImage) return variants;

    // Ensure primary image is present in the images array
    if (images.length === 0) {
      images = [primaryImage];
    } else if (!images.includes(primaryImage)) {
      images = [primaryImage, ...images];
    }

    const idBase = requestedId || `color-${index + 1}`;
    let id = idBase;
    let duplicateNumber = 2;
    while (usedIds.has(id)) {
      id = `${idBase}-${duplicateNumber}`;
      duplicateNumber += 1;
    }
    usedIds.add(id);

    variants.push({
      id,
      name,
      image_url: primaryImage,
      images,
    });
    return variants;
  }, []);
}

export function createProductColorVariant(): ProductColorVariant {
  const id = globalThis.crypto?.randomUUID?.() || `color-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { id, name: "", image_url: "", images: [] };
}
