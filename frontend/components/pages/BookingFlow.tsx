'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Loader2,
  CalendarDays,
  ShieldCheck,
  Info
} from 'lucide-react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface BookingFlowProps {
  params: {
    serviceId: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  vendor: {
    id: string;
    business_name: string;
  };
}

const BookingFlow: React.FC<BookingFlowProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form State
  const [bookingDate, setBookingDate] = useState(searchParams.get('date') || '');
  const [startTime, setStartTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  
  // Availability State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);

  useEffect(() => {
    const loadService = async () => {
      try {
        const res = await apiService.services.getById(params.serviceId);
        setService(res.data);
      } catch (error) {
        console.error('Error loading service:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    if (params.serviceId) {
      loadService();
    }
  }, [params.serviceId]);

  const checkAvailability = useCallback(async () => {
    if (!bookingDate || !startTime) return;
    
    setCheckingAvailability(true);
    setIsAvailable(null);
    setAlternatives([]);
    
    try {
      // Create a datetime for check
      const res = await apiService.bookings.checkAvailability({
        service_id: params.serviceId,
        date: bookingDate,
        start_time: startTime,
        duration: 4 // Mock duration
      });
      
      setIsAvailable(res.data.available);
      
      if (!res.data.available) {
        // Fetch alternatives if not available
        const altRes = await apiService.bookings.suggestAlternatives({
          service_id: params.serviceId,
          date: bookingDate,
          start_time: startTime
        });
        setAlternatives(altRes.data.alternative_times || []);
      }
    } catch (err) {
      console.error('Availability check failed:', err);
    } finally {
      setCheckingAvailability(false);
    }
  }, [params.serviceId, bookingDate, startTime]);

  useEffect(() => {
    if (bookingDate && startTime) {
      checkAvailability();
    }
  }, [bookingDate, startTime, checkAvailability]);

  const handleConfirmBooking = async () => {
    if (!service) return;
    
    setLoading(true);
    try {
      const bookingData = {
        booking: {
          service_id: service.id,
          event_date: bookingDate,
          event_location: location,
          requirements: requirements,
          total_amount: service.base_price,
          start_time: startTime
        }
      };
      
      await apiService.bookings.create(bookingData);
      toast.success('Booking request sent successfully!');
      router.push('/customer/dashboard');
    } catch (error: any) {
      toast.error(error.extractedMessage || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </button>

        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2 block">Secure Booking</span>
              <h1 className="text-4xl font-bold text-white tracking-tight">{service?.name}</h1>
              <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                <span className="font-bold text-slate-300">{service?.vendor?.business_name}</span>
                <span className="size-1 rounded-full bg-slate-700" />
                Professional Services
              </p>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center gap-3">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center">
                     <div className={`size-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-500 ${step === i ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/20' : step > i ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'border-white/10 text-slate-600'}`}>
                        {step > i ? <CheckCircle2 className="size-4" /> : i}
                     </div>
                     {i < 3 && <div className={`w-6 h-px mx-2 ${step > i ? 'bg-emerald-500/30' : 'bg-white/5'}`} />}
                  </div>
               ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
             <div className="lg:col-span-7 space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                     <motion.div 
                       key="step1"
                       initial={{ opacity: 0, x: -20 }} 
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       className="space-y-6"
                     >
                        <div className="space-y-4">
                           <h3 className="text-xl font-bold text-white">Event Particulars</h3>
                           <div className="grid gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Event Location</label>
                                 <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                    <input 
                                      type="text" 
                                      value={location}
                                      onChange={(e) => setLocation(e.target.value)}
                                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl h-14 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all" 
                                      placeholder="Where is the event taking place?" 
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Special Requirements</label>
                                 <textarea 
                                   value={requirements}
                                   onChange={(e) => setRequirements(e.target.value)}
                                   className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 text-white focus:outline-none focus:border-primary/50 min-h-[160px] resize-none transition-all" 
                                   placeholder="Detail any specific shots, themes, or custom requests you have..." 
                                 />
                              </div>
                           </div>
                        </div>
                        <Button 
                          onClick={() => setStep(2)} 
                          disabled={!location}
                          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/10"
                        >
                          Continue to Schedule
                        </Button>
                     </motion.div>
                  )}

                  {step === 2 && (
                     <motion.div 
                       key="step2"
                       initial={{ opacity: 0, x: -20 }} 
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       className="space-y-6"
                     >
                        <h3 className="text-xl font-bold text-white">Select Date & Time</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Event Date</label>
                              <div className="relative">
                                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                 <input 
                                   type="date" 
                                   value={bookingDate}
                                   onChange={(e) => setBookingDate(e.target.value)}
                                   className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl h-14 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark] transition-all" 
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Starting Time</label>
                              <div className="relative">
                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                 <input 
                                   type="time" 
                                   value={startTime}
                                   onChange={(e) => setStartTime(e.target.value)}
                                   className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl h-14 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark] transition-all" 
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Availability Feedback */}
                        <div className="mt-4">
                           {checkingAvailability ? (
                              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 text-slate-400 text-sm">
                                 <Loader2 className="size-4 animate-spin text-primary" /> Checking professional availability...
                              </div>
                           ) : isAvailable === true ? (
                              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm font-bold">
                                 <CheckCircle2 className="size-5" /> Professional is available for this slot!
                              </div>
                           ) : isAvailable === false ? (
                              <div className="space-y-4">
                                 <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-bold">
                                    <AlertCircle className="size-5" /> This slot is currently unavailable.
                                 </div>
                                 
                                 {alternatives.length > 0 && (
                                    <div className="space-y-3">
                                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Suggested Alternatives</p>
                                       <div className="grid grid-cols-1 gap-2">
                                          {alternatives.map((alt, idx) => (
                                             <button 
                                               key={idx}
                                               onClick={() => {
                                                  setBookingDate(alt.date);
                                                  setStartTime(alt.start_time);
                                               }}
                                               className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                                             >
                                                <div className="flex items-center gap-3">
                                                   <CalendarDays className="size-4 text-primary" />
                                                   <span className="text-sm font-bold text-white">{new Date(alt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                   <span className="text-slate-500">•</span>
                                                   <span className="text-sm text-slate-300">{alt.start_time}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select</div>
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ) : null}
                        </div>

                        <div className="flex gap-4 pt-4">
                           <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-white/[0.05] hover:bg-white/[0.02] font-bold">Back</Button>
                           <Button 
                             onClick={() => setStep(3)} 
                             disabled={!bookingDate || !startTime || isAvailable === false || checkingAvailability}
                             className="flex-[2] h-14 rounded-2xl font-bold text-base"
                           >
                             Review Booking
                           </Button>
                        </div>
                     </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div 
                       key="step3"
                       initial={{ opacity: 0, scale: 0.95 }} 
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="text-center py-10 space-y-8"
                     >
                        <div className="relative inline-block">
                           <div className="size-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                              <CheckCircle2 className="size-12" />
                           </div>
                           <motion.div 
                             initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                             className="absolute -top-2 -right-2 size-8 rounded-full bg-[#0f1115] border border-white/10 flex items-center justify-center"
                           >
                              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                           </motion.div>
                        </div>
                        
                        <div className="max-w-sm mx-auto space-y-3">
                           <h3 className="text-2xl font-bold text-white">Almost there!</h3>
                           <p className="text-sm text-slate-400 leading-relaxed">
                              You're about to send a booking request to <span className="text-white font-bold">{service?.vendor?.business_name}</span>. 
                              The professional will review your details and respond shortly.
                           </p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-left space-y-4">
                           <div className="flex justify-between items-center border-b border-white/[0.03] pb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled For</span>
                              <span className="text-sm font-bold text-white">{new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })} @ {startTime}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</span>
                              <span className="text-sm font-bold text-white">{location}</span>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl border-white/[0.05] hover:bg-white/[0.02] font-bold">Back</Button>
                           <Button 
                             onClick={handleConfirmBooking}
                             disabled={loading}
                             className="flex-[2] h-14 rounded-2xl font-bold text-base shadow-2xl shadow-primary/20"
                           >
                             {loading ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
                             Confirm & Send Request
                           </Button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                           <ShieldCheck className="size-3 text-emerald-500" /> Payment secured by Ayoj
                        </p>
                     </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Order Summary Sidebar */}
             <div className="lg:col-span-5">
                <Card className="bg-[#16191e] border-white/[0.05] rounded-[2.5rem] sticky top-24 overflow-hidden">
                   <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-b border-white/[0.03]">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">Order Summary</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transaction Ref: JS-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                   </div>
                   <CardContent className="p-8 space-y-8">
                      <div className="space-y-4">
                         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                            <p className="font-bold text-white text-base mb-1">{service?.name}</p>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{service?.description}</p>
                         </div>
                      </div>
                      
                      <div className="space-y-4 text-sm font-medium">
                         <div className="flex justify-between items-center text-slate-400">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Package Price</span>
                            <span className="font-bold text-white">₹{service?.base_price?.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-slate-400">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Service Fee (5%)</span>
                            <span className="font-bold text-white">₹{( (service?.base_price || 0) * 0.05).toLocaleString()}</span>
                         </div>
                         <div className="pt-6 border-t border-white/[0.05]">
                            <div className="flex justify-between items-end">
                               <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Amount</p>
                                  <div className="text-3xl font-bold text-white tracking-tighter flex items-center gap-1">
                                     <IndianRupee className="size-5 text-primary" strokeWidth={3} />
                                     {((service?.base_price || 0) * 1.05).toLocaleString()}
                                  </div>
                               </div>
                               <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase tracking-widest py-1 px-3">Fully Refundable</Badge>
                            </div>
                         </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                         <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Info className="size-3" /> Booking Terms
                         </p>
                         <p className="text-[10px] text-slate-400 leading-relaxed">
                            Your payment is held in escrow and only released to the professional after the event is successfully completed and you provide confirmation.
                         </p>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingFlow;
