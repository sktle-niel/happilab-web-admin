/** One photo per message, images only, five megabytes at most: the same limit the app checks before a byte leaves the phone. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_ACCEPT = "image/png,image/jpeg,image/webp";

/** Null when the photo fits; the sentence the agent reads otherwise. */
// Rounded up, so a photo a byte over never reads as exactly 5 MB.
export const photoRefusal = (bytes: number) => (bytes <= MAX_PHOTO_BYTES ? null : `That photo is ${(Math.ceil((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB; the most is 5 MB.`);
