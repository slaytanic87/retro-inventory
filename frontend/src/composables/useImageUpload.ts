import { ref } from 'vue'

/**
 * Turns user supplied image files into data URLs that are small enough to live
 * inside the mocked localStorage "database".
 *
 * Pictures are re-encoded through a canvas so a 6 MB phone photo ends up as a
 * ~100 KB thumbnail instead of blowing the 5 MB storage budget.
 */

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
]

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

/** Largest file we are willing to read before re-encoding. */
export const MAX_FILE_BYTES = 12 * 1024 * 1024

/** Upper bound for the stored data URL, so a handful of images still fit in localStorage. */
const MAX_ENCODED_BYTES = 600 * 1024

export interface ImageTarget {
  maxWidth: number
  maxHeight: number
  quality?: number
}

export const COVER_TARGET: ImageTarget = { maxWidth: 720, maxHeight: 960, quality: 0.82 }
export const CONSOLE_TARGET: ImageTarget = { maxWidth: 960, maxHeight: 720, quality: 0.82 }

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageUploadError'
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Rough byte size of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new ImageUploadError('That file could not be read.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new ImageUploadError('That file is not a readable image.'))
    image.src = src
  })
}

function encode(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): string | null {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext('2d')
  if (!context) return null
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  // WebP keeps transparency (console photos are often cut-outs) and compresses well.
  const webp = canvas.toDataURL('image/webp', quality)
  if (webp.startsWith('data:image/webp')) return webp
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Validates, downscales and re-encodes an image file.
 *
 * @returns a data URL ready to be stored on a game or console.
 */
export async function fileToStoredImage(file: File, target: ImageTarget): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageUploadError('Only image files can be uploaded.')
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageUploadError('Use a PNG, JPEG, WebP, GIF or AVIF file.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError(
      `That image is ${formatBytes(file.size)}. Keep it under ${formatBytes(MAX_FILE_BYTES)}.`,
    )
  }

  const original = await readAsDataUrl(file)
  const image = await loadImage(original)
  const { naturalWidth: width, naturalHeight: height } = image
  if (!width || !height) throw new ImageUploadError('That file is not a readable image.')

  const fits = width <= target.maxWidth && height <= target.maxHeight
  if (fits && dataUrlBytes(original) <= MAX_ENCODED_BYTES) return original

  let scale = Math.min(1, target.maxWidth / width, target.maxHeight / height)
  let quality = target.quality ?? 0.82

  for (let attempt = 0; attempt < 5; attempt++) {
    const encoded = encode(image, width * scale, height * scale, quality)
    if (!encoded) throw new ImageUploadError('This browser cannot process images.')
    if (dataUrlBytes(encoded) <= MAX_ENCODED_BYTES || attempt === 4) return encoded
    quality = Math.max(0.45, quality - 0.12)
    scale *= 0.8
  }

  throw new ImageUploadError('That image is too large to store.')
}

/** Stateful helper for components that own a file input or drop zone. */
export function useImageUpload(target: ImageTarget) {
  const busy = ref(false)
  const error = ref<string | null>(null)

  async function processFile(file: File | null | undefined): Promise<string | null> {
    if (!file) return null
    busy.value = true
    error.value = null
    try {
      return await fileToStoredImage(file, target)
    } catch (err) {
      error.value =
        err instanceof ImageUploadError
          ? err.message
          : 'The image could not be processed. Try another file.'
      return null
    } finally {
      busy.value = false
    }
  }

  function reset() {
    error.value = null
  }

  return { busy, error, processFile, reset }
}
