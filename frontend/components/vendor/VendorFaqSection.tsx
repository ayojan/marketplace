'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, CreditCard, Plane, CalendarClock, Camera } from 'lucide-react';

interface VendorFaqSectionProps {
  vendorName?: string;
  category?: string;
}

export default function VendorFaqSection({
  vendorName = 'The Studio',
  category = 'Celebration Specialist',
}: VendorFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const FAQS = [
    {
      q: `What is the payment milestone schedule for booking ${vendorName}?`,
      icon: CreditCard,
      a: `Typically, reservations require a 25% date-lock advance to guarantee slot availability in the studio's calendar. 50% is scheduled one week prior to event execution, and the remaining 25% upon final delivery of work. Direct invoicing has zero platform commission or hidden markups.`,
    },
    {
      q: `Does the team travel for outstation or destination celebrations?`,
      icon: Plane,
      a: `Yes! ${vendorName} regularly undertakes destination weddings and milestone events across India. Travel (flights/trains) and basic on-site accommodation for the operating crew are coordinated directly between the host and artist prior to event confirmation.`,
    },
    {
      q: `What happens if our event date needs to be rescheduled?`,
      icon: CalendarClock,
      a: `We understand celebrations may shift. If notified at least 30 days in advance, the date-lock advance can be transferred to an open alternate slot within 12 months at no penalty, subject to studio calendar availability.`,
    },
    {
      q: `What equipment and team size will be deployed on-site?`,
      icon: Camera,
      a: `The deployed crew matches the chosen package deliverables. For candid photography and film, this typically includes 2–4 senior camera artists, 4K full-frame cinema bodies, drone operators, and backup sound equipment. For decor, dedicated floral and technical setup crews arrive 6–8 hours prior.`,
    },
    {
      q: `How does the Ayoj 0% Middleman Guarantee protect hosts?`,
      icon: ShieldCheck,
      a: `Ayoj operates on direct artist-to-host connectivity. You receive authentic published rates with zero platform surcharges, verified identity authentication, and direct telephone/WhatsApp communication with the lead artist.`,
    },
  ];

  return (
    <section id="faqs" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="size-3 text-[#9E5338]" />
            Frequently Asked Questions
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C]">
            Studio Policies &amp; Client FAQs
          </h2>
          <p className="text-xs text-[#6B6560] mt-0.5">
            Everything you need to know about booking, milestones, travel, and deliverable commitments.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? 'bg-white border-[#9E5338]/40 shadow-xs'
                  : 'bg-white/80 border-[#E8E2D9] hover:border-[#9E5338]/30 hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-[#F3EADF] text-[#9E5338]' : 'bg-[#FAF7F2] text-[#6B6560]'
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#221F1C]">
                    {faq.q}
                  </span>
                </div>

                <div className="size-6 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#6B6560] shrink-0">
                  {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#6B6560] leading-relaxed border-t border-[#E8E2D9]/60 animate-in fade-in-0 duration-150">
                  <p className="max-w-3xl">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
