'use client';

import { motion } from 'framer-motion';
import { Camera, Star, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import AyojLogo from '@/components/AyojLogo';

export default function AuthLeftPanel() {
  const testimonial = {
    name: 'Priya & Rahul Sharma',
    role: 'Wedding Hosts — Delhi NCR',
    quote: 'Ayoj made finding our wedding photographer & bridal makeup artist completely stress-free. Exceptional talent!',
    rating: 5,
  };

  const stats = [
    { label: '2,700+', text: 'Verified Event Pros' },
    { label: '15,000+', text: 'Celebrations Managed' },
  ];

  return (
    <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden bg-[#FBF8F4]">
      {/* Background Photography - Authentic Indian Wedding */}
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80"
        alt="Ayoj Indian Wedding Celebration"
        fill
        unoptimized
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Editorial Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#221F1C]/85 via-[#221F1C]/50 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-12 text-white">
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="bg-white/90 backdrop-blur-md p-2 px-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <AyojLogo size="sm" showTagline={false} />
          </div>
        </motion.div>

        {/* Floating Stats Badges */}
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white/95 backdrop-blur-md border border-[#E8E2D9] rounded-xl px-4 py-3 w-fit max-w-xs shadow-md"
            >
              <div className="text-lg font-serif font-bold text-[#9E5338]">{stat.label}</div>
              <div className="text-xs text-[#6B6560] font-medium">{stat.text}</div>
            </motion.div>
          ))}
        </div>

        {/* Center Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-sm"
        >
          <h2 className="text-4xl font-serif font-normal leading-tight mb-3 text-white">
            Every moment <br />
            <span className="italic text-[#F3EADF] font-serif">deserves</span> to be <br />
            celebrated.
          </h2>
          <p className="text-white/80 font-normal leading-relaxed text-sm">
            Discover and book trusted photographers, makeup artists, decorators, and event planners — all in one place.
          </p>
        </motion.div>

        {/* Bottom Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E8E2D9] text-[#221F1C] shadow-lg w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {Array(testimonial.rating)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-[#D97706] text-[#D97706]"
                  />
                ))}
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
              <ShieldCheck className="size-3" /> Verified Host
            </span>
          </div>
          <p className="text-xs text-[#221F1C] mb-3 font-normal leading-relaxed">
            "{testimonial.quote}"
          </p>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center font-bold text-xs text-[#9E5338]">
              {testimonial.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="text-xs font-bold text-[#221F1C]">
                {testimonial.name}
              </div>
              <div className="text-[11px] text-[#6B6560]">{testimonial.role}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

