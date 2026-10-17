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
  Loader2,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ServiceImageItem {
  id: number;
  url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  is_primary?: boolean;
  title?: string;
}

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
  images?: ServiceImageItem[];
}

const ServiceManagement = ({ services: initialServices, onServiceUpdate }: any) => {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendorCategories, setVendorCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; previewUrl: string }[]>([]);
  const [existingImages, setExistingImages] = useState<ServiceImageItem[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activePhotoService, setActivePhotoService] = useState<Service | null>(null);
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
      const [catsRes, profileRes] = await Promise.all([
        apiService.profiles.serviceCategories().catch(() => null),
        apiService.profiles.me().catch(() => null)
      ]);
      setCategories(catsRes?.data?.service_categories || []);
      if (profileRes?.data?.categories) {
        setVendorCategories(profileRes.data.categories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const newPreviews: { file: File; previewUrl: string }[] = [];

    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format (JPG, PNG, WebP)`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 10MB limit`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteExistingImage = async (serviceId: string | number, imageId: number) => {
    try {
      await apiService.services.images.delete(serviceId, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      setActivePhotoService(prev => prev ? {
        ...prev,
        images: (prev.images || []).filter(img => img.id !== imageId)
      } : null);
      setServices(prev => prev.map(s => {
        if (String(s.id) === String(serviceId)) {
          return { ...s, images: (s.images || []).filter(img => img.id !== imageId) };
        }
        return s;
      }));
      toast.success('Service photo removed');
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      toast.error('Failed to remove image');
    }
  };

  const handleSetPrimaryImage = async (serviceId: string | number, imageId: number) => {
    try {
      await apiService.services.images.setPrimary(serviceId, imageId);
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      setActivePhotoService(prev => prev ? {
        ...prev,
        images: (prev.images || []).map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      } : null);
      setServices(prev => prev.map(s => {
        if (String(s.id) === String(serviceId)) {
          return {
            ...s,
            images: (s.images || []).map(img => ({
              ...img,
              is_primary: img.id === imageId
            }))
          };
        }
        return s;
      }));
      toast.success('Primary showcase photo updated');
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      toast.error('Failed to set primary image');
    }
  };

  const openPhotoManager = async (service: Service) => {
    setActivePhotoService(service);
    try {
      const res = await apiService.services.images.list(service.id);
      if (res?.data?.service_images) {
        setActivePhotoService(prev => prev && prev.id === service.id ? { ...prev, images: res.data.service_images } : prev);
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, images: res.data.service_images } : s));
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  const handleQuickUpload = async (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`"${file.name}" is not a supported format (JPG, PNG, WebP)`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds the 10MB limit`);
          continue;
        }
        await apiService.services.images.upload(serviceId, file);
        uploadedCount++;
      }

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} real service ${uploadedCount === 1 ? 'photo' : 'photos'} uploaded!`);
        const res = await apiService.services.images.list(serviceId);
        const updatedImages = res?.data?.service_images || [];
        setActivePhotoService(prev => prev ? { ...prev, images: updatedImages } : null);
        setServices(prev => prev.map(s => String(s.id) === String(serviceId) ? { ...s, images: updatedImages } : s));
        onServiceUpdate && onServiceUpdate();
      }
    } catch (err: any) {
      console.error('Error uploading service images:', err);
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to upload some images. Please try again.';
      toast.error(errorMsg);
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
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

      let savedService: Service;
      if (editingService) {
        const response = await apiService.services.update(editingService.id, serviceData);
        savedService = response.data.service || editingService;
      } else {
        const response = await apiService.services.create(serviceData);
        savedService = response.data.service;
      }

      // Upload selected image files if any
      if (selectedFiles.length > 0 && savedService?.id) {
        setUploadingImages(true);
        for (const file of selectedFiles) {
          try {
            await apiService.services.images.upload(savedService.id, file);
          } catch (uploadErr: any) {
            console.error('Image upload failed:', uploadErr);
            const uploadErrMsg = uploadErr?.response?.data?.error || uploadErr?.response?.data?.message || `Failed to upload "${file.name}"`;
            toast.error(uploadErrMsg);
          }
        }
      }

      // Refresh service list
      try {
        const freshRes = await apiService.services.getById(savedService.id);
        const freshService = freshRes.data?.service || freshRes.data || savedService;
        if (editingService) {
          setServices(prev => prev.map(s => s.id === editingService.id ? freshService : s));
        } else {
          setServices(prev => [...prev, freshService]);
        }
      } catch {
        if (editingService) {
          setServices(prev => prev.map(s => s.id === editingService.id ? savedService : s));
        } else {
          setServices(prev => [...prev, savedService]);
        }
      }

      toast.success(editingService ? 'Service listing updated successfully!' : 'Service listing created successfully!');
      resetForm();
      onServiceUpdate && onServiceUpdate();
    } catch (err: any) {
      const details = err.response?.data?.details;
      const detailsStr = Array.isArray(details) ? details.join(', ') : details;
      const mainErr = err.response?.data?.error || err.extractedMessage || 'Failed to save service';
      setError(detailsStr ? `${mainErr}: ${detailsStr}` : mainErr);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleEdit = async (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      service_category_id: service.category?.id?.toString() || '',
      base_price: service.base_price?.toString() || '',
      pricing_type: service.pricing_type,
      status: service.status
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages(service.images || []);
    setShowForm(true);

    try {
      const res = await apiService.services.images.list(service.id);
      if (res?.data?.service_images) {
        setExistingImages(res.data.service_images);
      }
    } catch (err) {
      console.error('Error fetching service images:', err);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiService.services.delete(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully');
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    // Revoke object URLs to prevent memory leaks
    filePreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setFormData({
      name: '',
      description: '',
      service_category_id: '',
      base_price: '',
      pricing_type: 'hourly',
      status: 'draft'
    });
    setEditingService(null);
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
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
                      {vendorCategories.length > 0 ? (
                        <>
                          <optgroup label="Your Operating Categories">
                            {vendorCategories.map((vc: any) => (
                              <option key={`vc-${vc.id}`} value={vc.id}>
                                {vc.name} {vc.is_primary ? '★ (Primary Trade)' : ''}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Other Categories">
                            {categories
                              .filter((c: any) => !vendorCategories.some((vc: any) => vc.id === c.id))
                              .map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                          </optgroup>
                        </>
                      ) : (
                        categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
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

                {/* Real Service Showcase Images Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                        <Camera className="size-3.5 text-[#9E5338]" />
                        Real Service Photos & Showcase <span className="text-[#6B6560] font-normal text-[11px]">(Better Transparency)</span>
                      </Label>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        Upload real photographs of your actual work, equipment, setups, or deliverable highlights for this service.
                      </p>
                    </div>
                    {(existingImages.length > 0 || filePreviews.length > 0) && (
                      <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full shrink-0">
                        {existingImages.length + filePreviews.length} Total Photos
                      </span>
                    )}
                  </div>

                  {/* Upload Dropzone */}
                  <div className="border-2 border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-white rounded-2xl p-4 sm:p-5 text-center transition-colors">
                    <input
                      type="file"
                      id="service-images-input"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="service-images-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="size-10 rounded-full bg-[#FAF7F2] group-hover:bg-[#F3EADF] text-[#9E5338] flex items-center justify-center transition-colors">
                        <Upload className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors">
                          Click to browse or drag real service photos
                        </span>
                        <p className="text-[10px] text-[#6B6560]">
                          Supports JPEG, PNG, WebP up to 10MB per image
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Existing Photos List (When editing) */}
                  {existingImages.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                        Current Service Photos ({existingImages.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {existingImages.map((img) => (
                          <div 
                            key={img.id} 
                            className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] group bg-stone-100"
                          >
                            <img
                              src={img.url || img.thumbnail_url || img.medium_url}
                              alt={img.title || 'Service photo'}
                              className="w-full h-full object-cover"
                            />
                            {img.is_primary && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#9E5338] text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5">
                                <Star className="size-2.5 fill-white" /> Primary
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                              {!img.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(editingService!.id, img.id)}
                                  className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-[#221F1C] text-[10px] font-semibold transition-colors cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingImage(editingService!.id, img.id)}
                                className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="size-2.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Staged New Uploads Preview */}
                  {filePreviews.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                        New Photos to Upload on Save ({filePreviews.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filePreviews.map((preview, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-square rounded-xl overflow-hidden border border-[#9E5338]/40 ring-1 ring-[#9E5338]/30 group bg-stone-100"
                          >
                            <img
                              src={preview.previewUrl}
                              alt={preview.file.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="size-3" />
                            </button>
                            <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[9px] font-medium text-white bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
                              {preview.file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    disabled={loading || uploadingImages} 
                    className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-7 h-11 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {loading || uploadingImages ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> {uploadingImages ? 'Uploading photos...' : 'Saving...'}
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
                      type="button"
                      onClick={() => openPhotoManager(service)} 
                      className="p-2 rounded-full text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                      title="Manage Real Service Photos"
                      aria-label="Manage Real Service Photos"
                    >
                      <Camera className="size-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleEdit(service)} 
                      className="p-2 rounded-full text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                      title="Edit Service"
                      aria-label="Edit Service"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(service.id)} 
                      className="p-2 rounded-full text-[#6B6560] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Service"
                      aria-label="Delete Service"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-2">
                  {/* Thumbnail if service has photos */}
                  {service.images && service.images.length > 0 && (service.images.find(i => i.is_primary)?.url || service.images[0]?.url || service.images[0]?.thumbnail_url) ? (
                    <div 
                      onClick={() => openPhotoManager(service)}
                      className="relative size-16 rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100 shrink-0 cursor-pointer group/thumb"
                      title="Click to view/manage photos"
                    >
                      <img
                        src={service.images.find(i => i.is_primary)?.url || service.images[0].url || service.images[0].thumbnail_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-white text-[8px] font-bold flex items-center gap-0.5">
                        <Camera className="size-2" /> {service.images.length}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-[#221F1C] tracking-tight group-hover:text-[#9E5338] transition-colors truncate">
                      {service.name}
                    </h4>
                    {service.category?.name && (
                      <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-[#6B6560] font-normal mb-3 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Real Photos indicator badge / CTA */}
                <div className="mb-4">
                  {service.images && service.images.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => openPhotoManager(service)}
                      className="text-[11px] font-semibold text-[#9E5338] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="size-3" />
                      <span>{service.images.length} real service {service.images.length === 1 ? 'photo' : 'photos'} uploaded</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPhotoManager(service)}
                      className="text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] flex items-center gap-1.5 p-1.5 rounded-lg border border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-[#FAF7F2] w-full justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="size-3 text-[#9E5338]" />
                      <span>Add real service photos for better transparency</span>
                    </button>
                  )}
                </div>
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

      {/* Quick Photo Manager Modal */}
      <AnimatePresence>
        {activePhotoService && (
          <div 
            onClick={() => setActivePhotoService(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8 cursor-default"
            >
              {/* Header */}
              <div className="p-6 bg-[#FAF7F2] border-b border-[#E8E2D9] flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338]">
                    Real Service Photos
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#221F1C]">
                    {activePhotoService.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePhotoService(null)}
                  className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                <p className="text-xs text-[#6B6560]">
                  High-quality real photos of your actual work, equipment, and setups give customers full transparency and improve trust.
                </p>

                {/* Direct Upload button */}
                <div className="border-2 border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-[#FBF8F4] rounded-2xl p-4 text-center transition-colors">
                  <input
                    type="file"
                    id="quick-photo-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleQuickUpload(activePhotoService.id, e)}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="quick-photo-upload"
                    className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingImages ? (
                      <Loader2 className="size-5 text-[#9E5338] animate-spin" />
                    ) : (
                      <Upload className="size-5 text-[#9E5338]" />
                    )}
                    <span className="text-xs font-semibold text-[#221F1C]">
                      {uploadingImages ? 'Uploading photos...' : 'Upload real photos for this service'}
                    </span>
                    <span className="text-[10px] text-[#6B6560]">
                      JPG, PNG, WebP up to 10MB
                    </span>
                  </label>
                </div>

                {/* Photos Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                    Uploaded Photos ({activePhotoService.images?.length || 0})
                  </h4>

                  {(!activePhotoService.images || activePhotoService.images.length === 0) ? (
                    <div className="p-6 rounded-2xl border border-dashed border-[#E8E2D9] text-center bg-stone-50 text-xs text-[#6B6560]">
                      No photos uploaded for this service yet. Add photos above to showcase your real services.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activePhotoService.images.map((img) => (
                        <div 
                          key={img.id} 
                          className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] group bg-stone-100"
                        >
                          <img
                            src={img.url || img.thumbnail_url || img.medium_url}
                            alt={img.title || activePhotoService.name}
                            className="w-full h-full object-cover"
                          />
                          {img.is_primary && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#9E5338] text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5">
                              <Star className="size-2.5 fill-white" /> Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            {!img.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(activePhotoService.id, img.id)}
                                className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-[#221F1C] text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                Make Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingImage(activePhotoService.id, img.id)}
                              className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="size-2.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-stone-50 border-t border-[#E8E2D9] flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActivePhotoService(null)}
                  className="rounded-full border-[#E8E2D9] text-xs font-semibold px-5 h-9"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManagement;

