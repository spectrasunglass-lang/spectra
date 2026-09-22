export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("res.cloudinary.com");
}

export interface CldOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:good" | "auto:best" | "auto:eco" | number;
  crop?: "limit" | "scale" | "fill" | "fit" | "thumb";
}

/**
 * Transforms a Cloudinary URL to request pre-resized, modern format (f_auto),
 * and optimized quality (q_auto) directly from Cloudinary CDN edge.
 *
 * If the URL is not from Cloudinary (e.g. local /logo.png, Supabase, data URIs),
 * it returns the original URL untouched.
 */
export function cldUrl(
  url?: string | null,
  optionsOrWidth?: number | CldOptions
): string {
  if (!url || typeof url !== "string") return url || "";
  if (!url.includes("res.cloudinary.com")) return url;

  const options: CldOptions =
    typeof optionsOrWidth === "number"
      ? { width: optionsOrWidth }
      : optionsOrWidth || {};

  const {
    width,
    height,
    quality = "auto",
    crop = "limit",
  } = options;

  const params: string[] = ["f_auto"];
  if (quality) params.push(`q_${quality}`);
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  if (crop && (width || height)) params.push(`c_${crop}`);

  const transformStr = params.join(",");

  const uploadIdx = url.indexOf("/image/upload/");
  if (uploadIdx === -1) {
    const fallbackIdx = url.indexOf("/upload/");
    if (fallbackIdx === -1) return url;

    const prefix = url.slice(0, fallbackIdx + "/upload/".length);
    let rest = url.slice(fallbackIdx + "/upload/".length);
    rest = rest.replace(/^(?:(?:[a-z]{1,3}_[a-zA-Z0-9_:-]+),?)+\//i, "");
    return `${prefix}${transformStr}/${rest}`;
  }

  const prefix = url.slice(0, uploadIdx + "/image/upload/".length);
  let rest = url.slice(uploadIdx + "/image/upload/".length);
  rest = rest.replace(/^(?:(?:[a-z]{1,3}_[a-zA-Z0-9_:-]+),?)+\//i, "");
  return `${prefix}${transformStr}/${rest}`;
}
