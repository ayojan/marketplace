'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Send, 
  MessageSquare, 
  Loader2, 
  User, 
  Store,
  Calendar,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number | string;
  sender_id: number | string;
  sender_name?: string;
  message: string;
  sent_at: string;
  is_mine?: boolean;
}

interface BookingMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  recipientName?: string;
  serviceTitle?: string;
}

export const BookingMessageModal: React.FC<BookingMessageModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  recipientName = 'Vendor Partner',
  serviceTitle = 'Event Booking'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = React.useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await apiService.bookings.messages(bookingId);
      const fetched = res.data?.messages || res.data || [];
      setMessages(fetched);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadMessages();
    }
  }, [isOpen, bookingId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempMsg: Message = {
      id: Date.now(),
      sender_id: 'me',
      message: text,
      sent_at: new Date().toISOString(),
      is_mine: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await apiService.bookings.sendMessage(bookingId, { message: text });
      if (res.data?.booking_message || res.data?.message_data) {
        const serverMsg = res.data.booking_message || res.data.message_data;
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...serverMsg, is_mine: true } : m));
      }
      toast.success('Message sent');
    } catch (err: any) {
      toast.error(err.extractedMessage || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col h-[560px]"
        >
          {/* Header */}
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338]">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#221F1C]">{recipientName}</h3>
                <p className="text-[11px] text-[#6B6560] font-medium">{serviceTitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] hover:bg-[#F3EADF] transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF8F4]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#6B6560] text-xs gap-2">
                <Loader2 className="size-4 animate-spin text-[#9E5338]" />
                Loading message history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B6560] space-y-2">
                <div className="size-12 rounded-full bg-[#F3EADF] flex items-center justify-center text-[#9E5338] mb-1">
                  <MessageSquare className="size-6" />
                </div>
                <h4 className="text-xs font-bold text-[#221F1C]">No messages yet</h4>
                <p className="text-[11px] max-w-xs">Start a direct conversation regarding event requirements, timelines, and special preferences.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.is_mine || msg.sender_id === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${
                        isMine
                          ? 'bg-[#9E5338] text-white rounded-br-none shadow-sm'
                          : 'bg-white border border-[#E8E2D9] text-[#221F1C] rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-[#6B6560] mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMine && <CheckCheck className="size-3 text-emerald-600" />}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E8E2D9] flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-[#FBF8F4] border-[#E8E2D9] h-10 rounded-full text-xs px-4 focus:border-[#9E5338] text-[#221F1C] placeholder:text-[#6B6560]"
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full size-10 p-0 flex items-center justify-center shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
