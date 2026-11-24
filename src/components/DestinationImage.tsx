import { Compass } from 'lucide-react';
import { useState } from 'react';

interface DestinationImageProps {
  src: string;
  alt: string;
  label: string;
  className?: string;
}

export function DestinationImage({ src, alt, label, className = '' }: DestinationImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#153159] to-[#0284C7] text-white p-6 ${className}`}
      >
        <Compass className="w-8 h-8 text-[#38BDF8] mb-2" aria-hidden="true" />
        <span className="font-display text-sm font-medium tracking-tight text-center">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}
