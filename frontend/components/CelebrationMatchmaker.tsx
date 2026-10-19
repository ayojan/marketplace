'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Heart, 
  Camera, 
  Brush, 
  Flower2, 
  Music, 
  Utensils, 
  Building2, 
  Users, 
  MapPin, 
  IndianRupee, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  PartyPopper,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, CITIES } from '@/lib/contexts/LocationContext';

const OCCASIONS_OPTIONS = [
  { id: 'wedding', name: 'Wedding & Shaadi', icon: Heart, tag: 'Most Popular' },
  { id: 'pre-wedding', name: 'Haldi, Mehendi & Sangeet', icon: Camera, tag: 'Celebration' },
  { id: 'engagement', name: 'Engagement & Roka', icon: Sparkles, tag: 'Milestone' },
  { id: 'birthday', name: 'Birthday & Anniversary', icon: PartyPopper, tag: 'Party' },
  { id: 'corporate', name: 'Corporate Gala / Summit', icon: Building2, tag: 'Formal' },
];

const GUEST_SCALES = [
  { id: 'intimate', label: 'Intimate Gathering', guests: '< 50 guests', multiplier: 0.8 },
  { id: 'classic', label: 'Classic Celebration', guests: '50 – 150 guests', multiplier: 1.0 },
  { id: 'grand', label: 'Grand Milestone', guests: '150 – 400 guests', multiplier: 1.5 },
  { id: 'royal', label: 'Royal Event', guests: '400+ guests', multiplier: 2.2 },
];

const SERVICE_ITEMS = [
  { id: 'photographer', name: 'Candid Photography & Film', icon: Camera, baseMin: 30000, baseMax: 70000 },
  { id: 'makeup-artist', name: 'Bridal Makeover & Styling', icon: Brush, baseMin: 15000, baseMax: 40000 },
  { id: 'decorator', name: 'Thematic Stage & Decor', icon: Flower2, baseMin: 40000, baseMax: 90000 },
  { id: 'dj', name: 'Sangeet DJ & Sound Setup', icon: Music, baseMin: 20000, baseMax: 45000 },
  { id: 'event-planner', name: 'Event Coordination & Planning', icon: Sparkles, baseMin: 35000, baseMax: 80000 },
  { id: 'caterer', name: 'Gourmet Event Catering', icon: Utensils, baseMin: 45000, baseMax: 100000 },
];

export default function CelebrationMatchmaker() {
  const router = useRouter();
  const { selectedCity } = useLocation();

  const [step, setStep] = useState<number>(1);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('wedding');
  const [selectedCityOption, setSelectedCityOption] = useState<string>(selectedCity && selectedCity !== 'All Cities' ? selectedCity : 'Delhi NCR');
  const [selectedScale, setSelectedScale] = useState<string>('classic');
  const [selectedServices, setSelectedServices] = useState<string[]>(['photographer', 'decorator']);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) 
        : [...prev, id]
    );
  };

  // Calculate budget estimate based on selected services and scale
  const scaleObj = GUEST_SCALES.find(s => s.id === selectedScale) || GUEST_SCALES[1];
  const totalMin = Math.round(
    selectedServices.reduce((sum, sId) => {
      const item = SERVICE_ITEMS.find(s => s.id === sId);
      return sum + (item ? item.baseMin : 0);
    }, 0) * scaleObj.multiplier
  );

  const totalMax = Math.round(
    selectedServices.reduce((sum, sId) => {
      const item = SERVICE_ITEMS.find(s => s.id === sId);
      return sum + (item ? item.baseMax : 0);
    }, 0) * scaleObj.multiplier
  );

  const handleExploreMarketplace = () => {
    const firstCat = selectedServices[0] || 'photographer';
    const params = new URLSearchParams();
    if (firstCat) params.set('category', firstCat);
    if (selectedCityOption && selectedCityOption !== 'All Cities') params.set('location', selectedCityOption);
    if (selectedOccasion) params.set('occasion', selectedOccasion);
    
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <section className="py-14 px-4 sm:px-6 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider border border-[#E8E2D9]">
            <Sparkles className="size-3 text-[#9E5338]" />
            <span>Ayoj Instant Matchmaker</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
            Plan your celebration in 60 seconds.
          </h2>

          <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
            Select your milestone occasion and required talent to see verified pricing estimates and top pros in your hub.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
          {[
            { num: 1, label: 'Occasion' },
            { num: 2, label: 'Hub & Scale' },
            { num: 3, label: 'Talent Needed' },
            { num: 4, label: 'Your Plan' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`size-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#9E5338] text-white shadow-2xs' 
                      : isCompleted 
                        ? 'bg-[#F3EADF] text-[#86442B]' 
                        : 'bg-white border border-[#E8E2D9] text-[#6B6560]'
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : s.num}
                </button>
                {s.num < 4 && <div className="w-5 sm:w-8 h-[1px] bg-[#E8E2D9]" />}
              </div>
            );
          })}
        </div>

        {/* Interactive Step Card Body */}
        <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-xs">
          
          {/* Step 1: Occasion */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#221F1C]">
                  Step 1: What celebration are you planning?
                </h3>
                <p className="text-xs text-[#6B6560]">
                  Choose your celebration type to customize pricing metrics and recommended artists.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {OCCASIONS_OPTIONS.map((occ) => {
                  const Icon = occ.icon;
                  const isSelected = selectedOccasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setSelectedOccasion(occ.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                          : 'border-[#E8E2D9] bg-[#FAF7F2]/40 hover:bg-white hover:border-[#9E5338]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`size-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#9E5338] text-white' : 'bg-white border border-[#E8E2D9] text-[#9E5338]'
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-white px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                          {occ.tag}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#221F1C]">{occ.name}</h4>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#E8E2D9]">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-6 rounded-full h-10 gap-1.5"
                >
                  <span>Continue to Hub &amp; Scale</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Hub & Scale */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#221F1C]">
                  Step 2: Celebration Hub &amp; Guest Scale
                </h3>
                <p className="text-xs text-[#6B6560]">
                  Pricing and team size adapt according to location and event scale.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#9E5338]" /> Celebration City / Hub
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCityOption(city)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer border ${
                          selectedCityOption === city
                            ? 'bg-[#9E5338] text-white border-[#9E5338] font-semibold'
                            : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#4A4540] hover:bg-white'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Scale */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
                    <Users className="size-3.5 text-[#9E5338]" /> Guest Scale
                  </label>
                  <div className="space-y-2">
                    {GUEST_SCALES.map((scale) => {
                      const isSelected = selectedScale === scale.id;
                      return (
                        <button
                          key={scale.id}
                          type="button"
                          onClick={() => setSelectedScale(scale.id)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F3EADF] border-[#9E5338] text-[#86442B]'
                              : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#4A4540] hover:bg-white'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-[#221F1C]">{scale.label}</p>
                            <p className="text-[11px] text-[#6B6560]">{scale.guests}</p>
                          </div>
                          {isSelected && <Check className="size-4 text-[#86442B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-full text-xs border-[#E8E2D9] h-10 px-5"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-6 rounded-full h-10 gap-1.5"
                >
                  <span>Select Talent Needed</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Talent Selection */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#221F1C]">
                  Step 3: What creative services do you need?
                </h3>
                <p className="text-xs text-[#6B6560]">
                  Select the pros you are shortlisting for this milestone (select multiple).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICE_ITEMS.map((svc) => {
                  const Icon = svc.icon;
                  const isSelected = selectedServices.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                          : 'border-[#E8E2D9] bg-[#FAF7F2]/40 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`size-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#9E5338] text-white' : 'bg-white border border-[#E8E2D9] text-[#9E5338]'
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <div className={`size-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-[#9E5338] border-[#9E5338] text-white' : 'border-[#E8E2D9] bg-white'
                        }`}>
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#221F1C]">{svc.name}</h4>
                        <p className="text-[10px] text-[#6B6560] mt-0.5">
                          Approx. ₹{(svc.baseMin / 1000).toFixed(0)}k – ₹{(svc.baseMax / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="rounded-full text-xs border-[#E8E2D9] h-10 px-5"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-6 rounded-full h-10 gap-1.5"
                >
                  <span>Calculate Matched Plan</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Matched Plan Result */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="text-center space-y-2">
                <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto shadow-2xs">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#221F1C]">
                  Your Custom Celebration Match Plan
                </h3>
                <p className="text-xs text-[#6B6560]">
                  Based on {OCCASIONS_OPTIONS.find(o => o.id === selectedOccasion)?.name} in {selectedCityOption} for {scaleObj.label} ({scaleObj.guests}).
                </p>
              </div>

              {/* Estimate Box */}
              <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-4 max-w-lg mx-auto text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-white px-3 py-1 rounded-full border border-[#E8E2D9]">
                  Estimated Budget Range
                </span>

                <div className="text-3xl font-serif font-bold text-[#221F1C] flex items-center justify-center gap-1">
                  <IndianRupee className="size-6 text-[#9E5338]" />
                  <span>{totalMin.toLocaleString('en-IN')} – {totalMax.toLocaleString('en-IN')}</span>
                </div>

                <p className="text-[11px] text-[#6B6560] leading-relaxed">
                  Published direct rates across {selectedServices.length} chosen services with 0% platform markups.
                </p>

                {/* Selected Service Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {selectedServices.map(sId => {
                    const svc = SERVICE_ITEMS.find(s => s.id === sId);
                    return (
                      <span key={sId} className="px-2.5 py-0.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-medium text-[#221F1C]">
                        {svc?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleExploreMarketplace}
                  className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-8 h-11 rounded-full shadow-xs gap-2"
                >
                  <span>Explore Matched Pros in {selectedCityOption}</span>
                  <ArrowRight className="size-3.5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto rounded-full text-xs border-[#E8E2D9] h-11 px-6 gap-1.5 text-[#6B6560]"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Start Over</span>
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
