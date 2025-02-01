import Image from "next/image"

interface EventImageProps {
  src: string | null
  alt: string
  className?: string
}

export function EventImage({ src, alt, className }: EventImageProps) {
  if (!src) {
    return (
      <div className={`relative bg-gradient-to-br from-indigo-100 to-violet-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-gradient-to-r from-indigo-600/10 to-violet-600/10 p-3">
            <svg className="h-6 w-6 text-indigo-600/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        sizes="(min-width: 1280px) 384px, (min-width: 1024px) 288px, (min-width: 768px) 342px, calc(100vw - 32px)"
      />
    </div>
  )
} 