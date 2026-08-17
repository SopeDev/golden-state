import {
  createOgImage,
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
} from '@/lib/ogImage'

export const alt = ogImageAlt
export const size = ogImageSize
export const contentType = ogImageContentType

export default function OpenGraphImage() {
  return createOgImage()
}
