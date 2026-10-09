'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Briefcase,
  Sparkles,
  Tag,
  IndianRupee,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  description: string;
  formatted_price: string;
  base_price?: number;
  pricing_type: string;
  status: string;
  category: {
    id: number;
    name: string;
  };
}

const ServiceManagement = ({ services: initialServices, onServiceUpdate }: any) => {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_category_id: '',
    base_price: '',
    pricing_type: 'hourly',
    status: 'draft'
  });

  useEffect(() => {
    setServices(initialServices || []);
  }, [initialServices]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await apiService.profiles.serviceCategories();
      setCategories(res.data.service_categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation checks
    if (!formData.name.trim()) {
      setError('Service name is required');
      return;
    }

    if (!formData.service_category_id) {
      setError('Please select a service category');
      return;
    }

    if (formData.description.length < 50) {
      setError('Service description must be at least 50 characters long');
      return;
    }

    if (formData.pricing_type !== 'custom') {
      const parsedPrice = parseFloat(formData.base_price);
      if (!formData.base_price || isNaN(parsedPrice) || parsedPrice <= 0) {
        setError('Base price must be specified and greater than ₹0 for non-custom pricing');
        return;
      }
    }

    setLoading(true);

    try {
      const parsedCatId = parseInt(formData.service_category_id, 10);
      const parsedPrice = formData.base_price ? parseFloat(formData.base_price) : null;

      const serviceData = {
        service: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          pricing_type: formData.pricing_type,
          base_price: parsedPrice,
          status: formData.status,
          service_category_id: isNaN(parsedCatId) ? null : parsedCatId
        }
      };

      let response;
      if (editingService) {
        response = await apiService.services.update(editingService.id, serviceData);
        setServices(prev => prev.map(s => s.id === editingService.id ? response.data.service : s));
      } else {
        response = await apiService.services.create(serviceData);
        setServices(prev => [...prev, response.data.service]);
      }

      resetForm();
      onServiceUpdate && onServiceUpdate();
    } catch (err: any) {
      const details = err.response?.data?.details;
      const detailsStr = Array.isArray(details) ? details.join(', ') : details;
      const mainErr = err.response?.data?.error || err.extractedMessage || 'Failed to save service';
      setError(detailsStr ? `${mainErr}: ${detailsStr}` : mainErr);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      service_category_id: service.category?.id?.toString() || '',
      base_price: service.base_price?.toString() || '',
      pricing_type: service.pricing_type,
      status: service.status
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiService.services.delete(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      service_category_id: '',
      base_price: '',
      pricing_type: 'hourly',
      status: 'draft'
    });
    setEditingService(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h2 className="text-2xl font-serif text-[#221F1C]">Services & Packages</h2>
          <p className="text-xs text-[#6B6560] mt-1 font-normal">
            Manage your professional offerings, pricing tiers, and service visibility
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-5 h-10 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="mr-1.5 size-4" /> Add New Service
        </Button>
      </div>

      {/* Add / Edit Service Form Container */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border border-[#E8E2D9] shadow-xl bg-[#FBF8F4] rounded-3xl p-6 sm:p-8">
              
              {/* Modal/Form Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-full bg-[#F3EADF] flex items-center justify-center text-[#9E5338]">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xl font-serif text-[#221F1C]">
                      {editingService ? 'Edit Service Listing' : 'Create New Service Listing'}
                    </h3>
                    <p className="text-xs text-[#6B6560] font-normal">
                      Provide clear details to attract clients across the Ayoj marketplace
                    </p>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetForm} 
                  className="rounded-full hover:bg-[#F3EADF] text-[#6B6560] cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {error && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
                  <X className="size-4 shrink-0 text-red-500" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                      Service Name <span className="text-[#9E5338]">*</span>
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-11 rounded-2xl bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338]"
                      placeholder="e.g. Candid Wedding Photography (Full Day)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                      Category <span className="text-[#9E5338]">*</span>
                    </Label>
                    <select
                      name="service_category_id"
                      value={formData.service_category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
                    >
                      <option value="">Select a service category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                      Description <span className="text-[#9E5338]">*</span>
                    </Label>
                    <span className={`text-[11px] font-medium ${formData.description.length > 0 && formData.description.length < 50 ? 'text-[#9E5338]' : 'text-[#6B6560]'}`}>
                      {formData.description.length < 50 ? `${50 - formData.description.length} more chars needed` : 'Minimum requirement met'}
                    </span>
                  </div>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    minLength={50}
                    maxLength={2000}
                    className="rounded-2xl min-h-[110px] bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338] p-3.5 resize-none"
                    placeholder="Detail what is included in this package (minimum 50 characters, e.g. deliverables, equipment, team size, duration)..."
                  />
                  <div className="flex justify-end px-1">
                    <span className="text-[11px] text-[#6B6560] font-medium">{formData.description.length}/2000 characters</span>
                  </div>
                </div>

                {/* Pricing Type, Base Price, & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">Pricing Model</Label>
                    <select
                      name="pricing_type"
                      value={formData.pricing_type}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
                    >
                      <option value="hourly">Hourly Rate</option>
                      <option value="package">Package Deal</option>
                      <option value="custom">Custom Quote</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                      Base Price (₹) {formData.pricing_type !== 'custom' && <span className="text-[#9E5338]">*</span>}
                    </Label>
                    <Input
                      type="number"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      required={formData.pricing_type !== 'custom'}
                      min={1}
                      className="h-11 rounded-2xl bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338]"
                      placeholder={formData.pricing_type === 'custom' ? 'Optional for custom quotes' : 'e.g. 50000'}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">Visibility Status</Label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
                    >
                      <option value="draft">Draft (Hidden)</option>
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm} 
                    className="rounded-full border border-[#E8E2D9] bg-white text-[#221F1C] hover:bg-[#F3EADF] text-xs font-semibold px-6 h-11 cursor-pointer transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-7 h-11 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" /> Save Service
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.length > 0 ? (
          services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="p-6 rounded-2xl border border-[#E8E2D9] bg-white hover:border-[#9E5338]/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="size-10 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338]">
                    <Briefcase className="size-5" />
                  </div>

                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(service)} 
                      className="p-2 rounded-full text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)} 
                      className="p-2 rounded-full text-[#6B6560] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#221F1C] mb-1.5 tracking-tight group-hover:text-[#9E5338] transition-colors">
                  {service.name}
                </h4>
                
                <p className="text-xs text-[#6B6560] font-normal mb-5 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
                <div className="text-sm font-bold text-[#9E5338] flex items-center gap-1">
                  <span>{service.formatted_price}</span>
                </div>

                <Badge 
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border-none ${
                    service.status === 'active' 
                      ? 'bg-[#F3EADF] text-[#9E5338]' 
                      : 'bg-[#E8E2D9]/50 text-[#6B6560]'
                  }`}
                >
                  {service.status}
                </Badge>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[#E8E2D9] bg-white rounded-3xl p-8">
            <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto mb-3">
              <Briefcase className="size-6" />
            </div>
            <h3 className="text-base font-serif text-[#221F1C] mb-1">No services listed yet</h3>
            <p className="text-xs text-[#6B6560] mb-4">Add your first service package to start receiving customer inquiries and bookings.</p>
            <Button 
              onClick={() => { resetForm(); setShowForm(true); }}
              className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-6 h-10 cursor-pointer"
            >
              <Plus className="mr-1.5 size-4" /> Add Service Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;

