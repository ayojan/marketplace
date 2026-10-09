'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0-5
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const StarRating = ({ value, onChange, size = 22, readOnly = false }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const activeRating = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = activeRating >= star;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onClick={() => !readOnly && onChange?.(star)}
            disabled={readOnly}
            className={`transition-all transform ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-115 active:scale-95'
            }`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-[#D97706] text-[#D97706] drop-shadow-xs'
                  : 'fill-[#E8E2D9]/40 text-[#D4C9BC]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

