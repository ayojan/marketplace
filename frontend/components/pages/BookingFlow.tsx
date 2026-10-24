'use client';

import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  BookingHeaderStepper,
  BookingStep1Details,
  BookingStep2Schedule,
  BookingStep3Review,
  BookingOrderSummarySidebar,
  BookingMobileActionBar,
  Service,
  AlternativeSlot
} from '@/components/booking';

interface BookingFlowProps {
  params: {
    serviceId: string;
  };
}

const BookingFlow: React.FC<BookingFlowProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = useId();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [step, setStep] = useState(1);
  const isFirstRender = useRef(true);

  // Form State
  const [bookingDate, setBookingDate] = useState(searchParams.get('date') || '');
  const [startTime, setStartTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');

  // Availability State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeSlot[]>([]);

  useEffect(() => {
    const loadService = async () => {
      const isNumeric = /^\d+$/.test(params.serviceId);

      if (isNumeric) {
        try {
          const res = await apiService.services.getById(params.serviceId);
          if (res?.data) {
            setService(res.data);
            setLoading(false);
            return;
          }
        } catch (error) {
          try {
            const vendorServicesRes = await apiService.vendors.getServices(params.serviceId);
            const firstService = vendorServicesRes?.data?.services?.[0];
            if (firstService) {
              setService(firstService);
              setLoading(false);
              return;
            }
          } catch (vErr) {
            console.warn('Resolving service from catalog fallback:', vErr);
          }
        }
      }

      setService(null);
      setLoading(false);
    };

    if (params.serviceId) {
      loadService();
    }
  }, [params.serviceId]);

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getCurrentTimeStr = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const isSlotInPast = useCallback(() => {
    if (!bookingDate) return false;
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (bookingDate < todayStr) return true;
    if (bookingDate === todayStr && startTime) {
      const currentTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return startTime <= currentTimeStr;
    }
    return false;
  }, [bookingDate, startTime]);

  const checkAvailability = useCallback(async () => {
    if (!bookingDate || !startTime) return;

    if (isSlotInPast()) {
      setIsAvailable(false);
      setCheckingAvailability(false);
      setAlternatives([]);
      return;
    }

    const isNumeric = /^\d+$/.test(String(params.serviceId));
    if (!isNumeric) {
      setIsAvailable(true);
      setCheckingAvailability(false);
      return;
    }

    setCheckingAvailability(true);
    setIsAvailable(null);
    setAlternatives([]);

    try {
      const durationHours = 4;
      let calculatedEndTime: string | undefined;
      if (startTime) {
        const [h, m] = startTime.split(':').map(Number);
        const endH = Math.min(23, (h || 10) + durationHours);
        calculatedEndTime = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
      }

      const res = await apiService.bookings.checkAvailability({
        service_id: params.serviceId,
        date: bookingDate,
        start_time: startTime,
        end_time: calculatedEndTime,
        duration: durationHours
      });

      setIsAvailable(res.data.available);

      if (!res.data.available) {
        const altRes = await apiService.bookings.suggestAlternatives({
          service_id: params.serviceId,
          date: bookingDate,
          start_time: startTime,
          end_time: calculatedEndTime,
          duration: durationHours
        });
        setAlternatives(altRes.data.alternative_times || []);
      }
    } catch (err) {
      console.warn('Availability check soft-fallback:', err);
      if (!isSlotInPast()) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
    } finally {
      setCheckingAvailability(false);
    }
  }, [params.serviceId, bookingDate, startTime, isSlotInPast]);

  // Scroll restoration: smooth scroll to top on step transitions
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Debounced availability check (500ms) to avoid rapid API calls during user inputs
  useEffect(() => {
    if (!bookingDate || !startTime) return;

    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [bookingDate, startTime, checkAvailability]);

  const handleConfirmBooking = async () => {
    if (!service) return;

    if (isSlotInPast()) {
      toast.error('Cannot book a date or time in the past');
      return;
    }

    setLoading(true);
    try {
      const numPrice = Number(service.base_price) || 0;
      const combinedDateTime = bookingDate && startTime ? `${bookingDate}T${startTime}:00` : bookingDate;
      const bookingData = {
        booking: {
          service_id: service.id,
          event_date: combinedDateTime,
          event_location: location,
          requirements: requirements.trim() || undefined,
          total_amount: numPrice,
          start_time: startTime,
          event_duration: '4 hours'
        }
      };

      await apiService.bookings.create(bookingData);
      toast.success('Booking request submitted successfully! The vendor will review it shortly.');
      router.push('/customer/dashboard?tab=bookings');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      const apiErrors = error.response?.data?.errors;
      const errorMsg = Array.isArray(apiErrors)
        ? apiErrors.join(', ')
        : error.response?.data?.error || error.extractedMessage || 'Failed to create booking. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = (req: string) => {
    if (!requirements) {
      setRequirements(req);
    } else if (!requirements.includes(req)) {
      setRequirements((prev) => `${prev}, ${req}`);
    }
  };

  const numBasePrice = Number(service?.base_price) || 0;
  const platformFee = Math.round(numBasePrice * 0.05);
  const totalAmount = numBasePrice + platformFee;

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 font-sans">
        <div className="size-12 rounded-full border-2 border-[#9E5338] border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9E5338]">Loading booking details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1B19] font-sans">
        <Header />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="size-16 rounded-full bg-[#F3EADF] text-[#9E5338] mx-auto flex items-center justify-center mb-6">
            <HelpCircle className="size-8" />
          </div>
          <h2 className="text-2xl font-serif text-[#221F1C] mb-3">Service Not Found</h2>
          <p className="text-sm text-[#6B6560] mb-6">
            The requested service or vendor could not be located in our verified database. It may have been updated or removed.
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-2.5 bg-[#9E5338] text-white rounded-lg text-sm font-semibold hover:bg-[#85432B] transition-colors shadow-sm"
          >
            Explore Verified Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1B19] font-sans antialiased">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-28 lg:pb-12">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6560] hover:text-[#9E5338] transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Service / Profile</span>
        </button>

        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Header Title & Stepper */}
          <BookingHeaderStepper service={service} step={step} />

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Form Steps */}
            <div className="lg:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: EVENT PARTICULARS */}
                {step === 1 && (
                  <BookingStep1Details
                    location={location}
                    setLocation={setLocation}
                    requirements={requirements}
                    setRequirements={setRequirements}
                    onAddRequirement={handleAddRequirement}
                    onContinue={() => setStep(2)}
                  />
                )}

                {/* STEP 2: DATE & TIME */}
                {step === 2 && (
                  <BookingStep2Schedule
                    bookingDate={bookingDate}
                    setBookingDate={setBookingDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    todayStr={getTodayStr()}
                    currentTimeStr={getCurrentTimeStr()}
                    isSlotInPast={isSlotInPast()}
                    checkingAvailability={checkingAvailability}
                    isAvailable={isAvailable}
                    alternatives={alternatives}
                    onSelectAlternative={(alt) => {
                      setBookingDate(alt.date);
                      setStartTime(alt.start_time);
                    }}
                    onBack={() => setStep(1)}
                    onReview={() => setStep(3)}
                  />
                )}

                {/* STEP 3: REVIEW & CONFIRM */}
                {step === 3 && (
                  <BookingStep3Review
                    service={service}
                    bookingDate={bookingDate}
                    startTime={startTime}
                    location={location}
                    requirements={requirements}
                    loading={loading}
                    onBack={() => setStep(2)}
                    onConfirm={handleConfirmBooking}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Order Summary & Pricing Breakdown Sidebar */}
            <div className="lg:col-span-5">
              <BookingOrderSummarySidebar
                service={service}
                transactionId={transactionId}
                numBasePrice={numBasePrice}
                platformFee={platformFee}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bottom Action Bar (Thumb Zone) */}
      <BookingMobileActionBar
        step={step}
        setStep={setStep}
        totalAmount={totalAmount}
        location={location}
        bookingDate={bookingDate}
        startTime={startTime}
        isAvailable={isAvailable}
        checkingAvailability={checkingAvailability}
        isSlotInPast={isSlotInPast()}
        loading={loading}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
};

export default BookingFlow;
