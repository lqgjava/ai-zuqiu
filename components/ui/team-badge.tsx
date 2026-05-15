'use client';

import { useState } from 'react';
import Image from 'next/image';

const GRADIENTS = [
  'from-blue-600 to-blue-400',
  'from-red-600 to-red-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-500 to-orange-500',
  'from-purple-600 to-purple-400',
  'from-rose-600 to-rose-400',
  'from-cyan-600 to-cyan-400',
  'from-indigo-600 to-indigo-400',
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface TeamBadgeProps {
  name: string;
  badgeUrl?: string | null;
  size?: number;
}

export function TeamBadge({ name, badgeUrl, size = 48 }: TeamBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = badgeUrl && !imgError;
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];
  const initial = name.charAt(0);

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-lg overflow-hidden"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={badgeUrl}
          alt={name}
          width={size}
          height={size}
          className="object-contain p-[2px]"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white font-bold select-none" style={{ fontSize: size * 0.42 }}>
            {initial}
          </span>
        </div>
      )}
    </div>
  );
}
