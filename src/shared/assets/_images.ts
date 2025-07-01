import type { ImageMetadata } from 'astro'

const rawMap = import.meta.glob<{ default: ImageMetadata }>(
  '/src/shared/assets/images/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

/* '/a/b/c/foo.jpg' → 'foo' */
type FileName<T extends string> =
  T extends `${string}/${infer File}`
  ? File extends `${infer Name}.${string}` ? Name : never
  : never

export type ImageKey = FileName<keyof typeof rawMap>

export const images: Record<ImageKey, ImageMetadata> = {} as any

for (const [path, mod] of Object.entries(rawMap)) {
  const key = path.split('/').pop()!.replace(/\.[^.]+$/, '') as ImageKey
  images[key] = mod.default        // ← кладём именно meta.default
}
