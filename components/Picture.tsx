import images from '@/content/images.generated.json'

type Key = keyof typeof images

/** Responsive WebP with a blurred placeholder underneath, so the layout never jumps. */
export default function Picture({
  name,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  style,
}: {
  name: Key
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const img = images[name]
  return (
    <img
      className={className}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      style={{ backgroundImage: `url(${img.placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center', ...style }}
    />
  )
}
