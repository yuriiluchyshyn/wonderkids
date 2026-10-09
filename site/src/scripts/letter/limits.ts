/**
 * What a letter may carry. These repeat the limits the API enforces
 * (`game/api/_lib/feedback.js`) — change both.
 */
export const MAX_FILES = 5;
export const MAX_FILE = 15 * 1024 * 1024;
export const MAX_TOTAL = 18 * 1024 * 1024;
/** A request may carry 4.5 MB at most, so a file travels in pieces of 1.5 MB. */
export const PART = 3 * 524288;
/** A phone photo is 3–8 MB; 1920 px on the long side shows a bug just as well. */
export const PHOTO_SIDE = 1920;
export const ALLOWED = /^(image\/(jpeg|png|webp|gif|heic|heif)|video\/(mp4|quicktime|webm))$/;
export const MIN_MESSAGE = 5;
