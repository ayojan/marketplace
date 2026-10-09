'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Sparkles, MessageSquare, Award, Clock, HeartHandshake, ShieldCheck } from 'lucide-react';

interface ReviewFormModalProps {
  bookingId: number;
  vendorName: string;
  serviceName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewFormModal = ({
  bookingId,
  vendorName,
  serviceName,
  open,
  onClose,
  onSuccess,
}: ReviewFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [comment, setComment] = useState('');

  const ratingLabels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Service',
    4: 'Very Good — Highly Satisfied',
    5: 'Exceptional — Absolutely Outstanding!',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select an overall rating');
      return;
    }

    setLoading(true);
    try {
      await apiService.reviews.create({
        review: {
          booking_id: bookingId,
          rating,
          quality_rating: qualityRating || null,
          communication_rating: communicationRating || null,
          value_rating: valueRating || null,
          punctuality_rating: punctualityRating || null,
          comment: comment || null,
        },
      });

      toast.success('Thank you! Review submitted successfully.');
      onSuccess();
      onClose();

      // Reset form
      setRating(0);
      setQualityRating(0);
      setCommunicationRating(0);
      setValueRating(0);
      setPunctualityRating(0);
      setComment('');
    } catch (error: any) {
      const errorMessage = error.extractedMessage || error.response?.data?.error || error.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#FBF8F4] border border-[#E8E2D9] text-[#221F1C] sm:max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-sans">
        
        {/* Top Header */}
        <DialogHeader className="space-y-2 text-left pb-2 border-b border-[#E8E2D9]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F3EADF] text-[#9E5338]">
              <Sparkles className="size-3.5" /> Client Feedback
            </span>
          </div>

          <DialogTitle className="text-2xl font-serif font-normal text-[#221F1C] tracking-tight">
            Leave a Review
          </DialogTitle>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6B6560] font-medium w-fit max-w-full truncate">
            <span className="font-semibold text-[#221F1C] truncate">{serviceName}</span>
            <span>•</span>
            <span className="text-[#9E5338] font-medium truncate">{vendorName}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          
          {/* Overall Rating (Required) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E2D9] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
                Overall Rating <span className="text-[#9E5338]">*</span>
              </label>
              {rating > 0 && (
                <span className="text-xs font-semibold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full transition-all">
                  {ratingLabels[rating]}
                </span>
              )}
            </div>

            <div className="pt-1">
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
          </div>

          {/* Sub-ratings Detailed Breakdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider px-1">
              Service Breakdown (Optional)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Quality */}
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#221F1C]">
                  <span className="flex items-center gap-1.5">
                    <Award className="size-3.5 text-[#9E5338]" /> Quality
                  </span>
                  {qualityRating > 0 && <span className="text-[11px] text-[#6B6560] font-medium">{qualityRating}/5</span>}
                </div>
                <StarRating value={qualityRating} onChange={setQualityRating} size={18} />
              </div>

              {/* Communication */}
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#221F1C]">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-[#9E5338]" /> Communication
                  </span>
                  {communicationRating > 0 && <span className="text-[11px] text-[#6B6560] font-medium">{communicationRating}/5</span>}
                </div>
                <StarRating value={communicationRating} onChange={setCommunicationRating} size={18} />
              </div>

              {/* Value */}
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#221F1C]">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="size-3.5 text-[#9E5338]" /> Value
                  </span>
                  {valueRating > 0 && <span className="text-[11px] text-[#6B6560] font-medium">{valueRating}/5</span>}
                </div>
                <StarRating value={valueRating} onChange={setValueRating} size={18} />
              </div>

              {/* Punctuality */}
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#221F1C]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#9E5338]" /> Punctuality
                  </span>
                  {punctualityRating > 0 && <span className="text-[11px] text-[#6B6560] font-medium">{punctualityRating}/5</span>}
                </div>
                <StarRating value={punctualityRating} onChange={setPunctualityRating} size={18} />
              </div>

            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#221F1C] uppercase tracking-wider px-1">
              Your Review & Experience
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Share details about their work quality, professionalism, punctuality, and overall service..."
              className="bg-white border-[#E8E2D9] text-[#221F1C] placeholder:text-[#6B6560]/60 resize-none min-h-[100px] rounded-2xl text-xs p-3.5 focus:border-[#9E5338] focus:ring-1 focus:ring-[#9E5338] transition-colors"
            />
            <div className="flex justify-end px-1">
              <span className="text-[11px] text-[#6B6560] font-medium">{comment.length}/1000 characters</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#E8E2D9] bg-white text-[#221F1C] hover:bg-[#F3EADF] text-xs font-medium h-11 cursor-pointer transition-colors"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-medium h-11 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              disabled={loading || !rating}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> Submit Review
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

