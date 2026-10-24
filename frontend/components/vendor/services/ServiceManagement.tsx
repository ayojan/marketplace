'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import {
  Service,
  ServiceImageItem,
  ServiceFormData,
  ServiceManagementProps
} from './constants';
import ServiceListHeader from './ServiceListHeader';
import ServiceListGrid from './ServiceListGrid';
import ServiceCreateEditModal from './ServiceCreateEditModal';
import ServicePhotoManagerModal from './ServicePhotoManagerModal';

const DEFAULT_FORM: ServiceFormData = {
  name: '',
  description: '',
  service_category_id: '',
  base_price: '',
  pricing_type: 'hourly',
  status: 'draft'
};

const ServiceManagement = ({ services: initialServices, onServiceUpdate }: ServiceManagementProps) => {
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
  const [formData, setFormData] = useState<ServiceFormData>(DEFAULT_FORM);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteExistingImage = async (serviceId: string | number, imageId: number) => {
    try {
      await apiService.services.images.delete(serviceId, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      setActivePhotoService((prev) =>
        prev
          ? {
              ...prev,
              images: (prev.images || []).filter((img) => img.id !== imageId)
            }
          : null
      );
      setServices((prev) =>
        prev.map((s) => {
          if (String(s.id) === String(serviceId)) {
            return { ...s, images: (s.images || []).filter((img) => img.id !== imageId) };
          }
          return s;
        })
      );
      toast.success('Service photo removed');
      onServiceUpdate && onServiceUpdate();
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleSetPrimaryImage = async (serviceId: string | number, imageId: number) => {
    try {
      await apiService.services.images.setPrimary(serviceId, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );
      setActivePhotoService((prev) =>
        prev
          ? {
              ...prev,
              images: (prev.images || []).map((img) => ({
                ...img,
                is_primary: img.id === imageId
              }))
            }
          : null
      );
      setServices((prev) =>
        prev.map((s) => {
          if (String(s.id) === String(serviceId)) {
            return {
              ...s,
              images: (s.images || []).map((img) => ({
                ...img,
                is_primary: img.id === imageId
              }))
            };
          }
          return s;
        })
      );
      toast.success('Primary showcase photo updated');
      onServiceUpdate && onServiceUpdate();
    } catch {
      toast.error('Failed to set primary image');
    }
  };

  const openPhotoManager = async (service: Service) => {
    setActivePhotoService(service);
    try {
      const res = await apiService.services.images.list(service.id);
      if (res?.data?.service_images) {
        setActivePhotoService((prev) =>
          prev && prev.id === service.id ? { ...prev, images: res.data.service_images } : prev
        );
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, images: res.data.service_images } : s))
        );
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
        setActivePhotoService((prev) => (prev ? { ...prev, images: updatedImages } : null));
        setServices((prev) =>
          prev.map((s) => (String(s.id) === String(serviceId) ? { ...s, images: updatedImages } : s))
        );
        onServiceUpdate && onServiceUpdate();
      }
    } catch (err: any) {
      console.error('Error uploading service images:', err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to upload some images. Please try again.';
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
            const uploadErrMsg =
              uploadErr?.response?.data?.error ||
              uploadErr?.response?.data?.message ||
              `Failed to upload "${file.name}"`;
            toast.error(uploadErrMsg);
          }
        }
      }

      // Refresh service list
      try {
        const freshRes = await apiService.services.getById(savedService.id);
        const freshService = freshRes.data?.service || freshRes.data || savedService;
        if (editingService) {
          setServices((prev) => prev.map((s) => (s.id === editingService.id ? freshService : s)));
        } else {
          setServices((prev) => [...prev, freshService]);
        }
      } catch {
        if (editingService) {
          setServices((prev) => prev.map((s) => (s.id === editingService.id ? savedService : s)));
        } else {
          setServices((prev) => [...prev, savedService]);
        }
      }

      toast.success(
        editingService ? 'Service listing updated successfully!' : 'Service listing created successfully!'
      );
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
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast.success('Service deleted successfully');
      onServiceUpdate && onServiceUpdate();
    } catch {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    filePreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setFormData(DEFAULT_FORM);
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
      <ServiceListHeader
        onAddNew={() => {
          resetForm();
          setShowForm(true);
        }}
      />

      {/* Add / Edit Service Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ServiceCreateEditModal
            editingService={editingService}
            formData={formData}
            categories={categories}
            vendorCategories={vendorCategories}
            error={error}
            loading={loading}
            uploadingImages={uploadingImages}
            existingImages={existingImages}
            filePreviews={filePreviews}
            onInputChange={handleInputChange}
            onFileSelect={handleFileSelect}
            onRemoveSelectedFile={removeSelectedFile}
            onDeleteExistingImage={handleDeleteExistingImage}
            onSetPrimaryImage={handleSetPrimaryImage}
            onSubmit={handleSubmit}
            onClose={resetForm}
          />
        )}
      </AnimatePresence>

      {/* Services Grid List */}
      <ServiceListGrid
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenPhotoManager={openPhotoManager}
        onAddNew={() => {
          resetForm();
          setShowForm(true);
        }}
      />

      {/* Quick Photo Manager Modal */}
      <ServicePhotoManagerModal
        service={activePhotoService}
        uploadingImages={uploadingImages}
        onClose={() => setActivePhotoService(null)}
        onQuickUpload={handleQuickUpload}
        onSetPrimaryImage={handleSetPrimaryImage}
        onDeleteImage={handleDeleteExistingImage}
      />
    </div>
  );
};

export default ServiceManagement;
