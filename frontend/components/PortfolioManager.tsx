'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';
import {
  PortfolioStatsBar,
  PortfolioDropzone,
  PortfolioFilterBar,
  PortfolioShowcaseGrid,
  PortfolioCreateModal,
  PortfolioDetailModal,
  PortfolioLightbox,
  DEFAULT_CATEGORIES,
  INITIAL_SHOWCASES,
  STORAGE_KEY,
  PortfolioItemType,
  PortfolioImage
} from './portfolio';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemType[]>([]);
  const [, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Filter & Search states
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [newDescription, setNewDescription] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<{ file: File; previewUrl: string }[]>([]);

  // Detailed Collection View / Manage Modal
  const [selectedCollection, setSelectedCollection] = useState<PortfolioItemType | null>(null);

  // Lightbox Image Preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Load portfolio items from backend with localStorage & fallback sync
  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    let itemsFromApi: PortfolioItemType[] = [];

    try {
      const response = await apiService.portfolioItems.getAll().catch(() => null);
      if (response?.data?.portfolio_items && response.data.portfolio_items.length > 0) {
        itemsFromApi = response.data.portfolio_items.map((item: any) => ({
          ...item,
          images: item.images && item.images.length > 0 ? item.images : []
        }));
      }
    } catch (err) {
      console.warn('API portfolio fetch note:', err);
    }

    if (itemsFromApi.length > 0) {
      setPortfolioItems(itemsFromApi);
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPortfolioItems(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      setPortfolioItems(INITIAL_SHOWCASES);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Persist local changes so vendor preview testing survives refreshes
  const savePortfolioItems = (updated: PortfolioItemType[]) => {
    setPortfolioItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Drag and drop handlers for main dropzone
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Handle file staging when user selects files
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter((file) => {
      const isImg = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isImg) toast.error(`${file.name} is not an image file.`);
      if (!isValidSize) toast.error(`${file.name} exceeds 10MB limit.`);
      return isImg && isValidSize;
    });

    if (validImages.length === 0) return;

    if (validImages.length > 10) {
      toast.warning('A maximum of 10 photos can be staged per showcase. Selecting first 10.');
    }

    const selectedSlice = validImages.slice(0, 10);
    const newStaged = selectedSlice.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    if (!newTitle) {
      const suggestedName = selectedSlice[0].name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setNewTitle(suggestedName);
    }

    setStagedFiles((prev) => [...prev, ...newStaged].slice(0, 10));
    setIsCreateModalOpen(true);
  };

  // Remove a staged photo before creation
  const handleRemoveStagedPhoto = (index: number) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  // Submit creation of a new showcase
  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error('Please enter a title for your showcase');
      return;
    }

    if (stagedFiles.length === 0) {
      toast.error('Please attach at least one photo to this showcase');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Publishing your showcase...');

    try {
      const rawFiles = stagedFiles.map((s) => s.file);

      let createdItemFromApi: any = null;
      try {
        const createRes = await apiService.portfolioItems.create({
          portfolio_item: {
            title: newTitle.trim(),
            category: newCategory,
            description: newDescription.trim(),
            is_featured: newIsFeatured
          }
        });

        if (createRes?.data?.portfolio_item?.id) {
          const itemId = createRes.data.portfolio_item.id;
          const uploadRes = await apiService.portfolioItems.uploadImages(itemId, rawFiles);
          createdItemFromApi = uploadRes?.data?.portfolio_item || createRes.data.portfolio_item;
        }
      } catch (apiErr) {
        console.warn('Backend API upload fallback engaged:', apiErr);
      }

      const formattedImages: PortfolioImage[] = createdItemFromApi?.images?.length
        ? createdItemFromApi.images
        : stagedFiles.map((sf, idx) => ({
            id: `local-img-${Date.now()}-${idx}`,
            url: sf.previewUrl,
            thumbnail_url: sf.previewUrl,
            filename: sf.file.name,
            byte_size: sf.file.size
          }));

      const newShowcase: PortfolioItemType = {
        id: createdItemFromApi?.id || `local-showcase-${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        is_featured: newIsFeatured,
        image_count: formattedImages.length,
        created_at: new Date().toISOString().split('T')[0],
        images: formattedImages
      };

      const updatedList = [newShowcase, ...portfolioItems];
      savePortfolioItems(updatedList);

      toast.success('Showcase published successfully!', { id: toastId });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewIsFeatured(false);
      setStagedFiles([]);
    } catch (err: any) {
      console.error('Showcase creation error:', err);
      toast.error('Failed to publish showcase. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle Featured status on a showcase
  const handleToggleFeatured = async (item: PortfolioItemType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const newFeaturedState = !item.is_featured;
    const updatedList = portfolioItems.map((p) =>
      p.id === item.id ? { ...p, is_featured: newFeaturedState } : p
    );
    savePortfolioItems(updatedList);

    if (selectedCollection?.id === item.id) {
      setSelectedCollection({ ...selectedCollection, is_featured: newFeaturedState });
    }

    try {
      await apiService.portfolioItems.update(item.id, {
        portfolio_item: { is_featured: newFeaturedState }
      }).catch(() => null);
    } catch (err) {
      // optimistic update
    }

    toast.success(
      newFeaturedState
        ? `"${item.title}" is now featured on your public profile!`
        : `"${item.title}" removed from featured highlights.`
    );
  };

  // Delete an entire showcase
  const handleDeleteShowcase = async (id: string | number, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete the collection "${title}"? This cannot be undone.`)) {
      return;
    }

    const updatedList = portfolioItems.filter((p) => p.id !== id);
    savePortfolioItems(updatedList);

    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }

    try {
      await apiService.portfolioItems.delete(id).catch(() => null);
    } catch (err) {
      // optimistic update
    }

    toast.success(`Showcase "${title}" deleted.`);
  };

  // Add more photos to an existing selected collection
  const handleAddPhotosToCollection = async (files: FileList | File[]) => {
    if (!selectedCollection) return;

    const fileArray = Array.from(files);
    const validImages = fileArray.filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (validImages.length === 0) {
      toast.error('No valid images under 10MB provided.');
      return;
    }

    const toastId = toast.loading(`Uploading ${validImages.length} photo(s)...`);

    try {
      let apiUpdatedCollection: any = null;
      try {
        const uploadRes = await apiService.portfolioItems.uploadImages(selectedCollection.id, validImages);
        apiUpdatedCollection = uploadRes?.data?.portfolio_item;
      } catch (apiErr) {
        console.warn('API batch upload fallback:', apiErr);
      }

      const newImages: PortfolioImage[] = apiUpdatedCollection?.images || [
        ...selectedCollection.images,
        ...validImages.map((f, i) => {
          const objectUrl = URL.createObjectURL(f);
          return {
            id: `local-img-${Date.now()}-${i}`,
            url: objectUrl,
            thumbnail_url: objectUrl,
            filename: f.name,
            byte_size: f.size
          };
        })
      ];

      const updatedCollection: PortfolioItemType = {
        ...selectedCollection,
        images: newImages,
        image_count: newImages.length
      };

      const updatedList = portfolioItems.map((p) =>
        p.id === selectedCollection.id ? updatedCollection : p
      );

      savePortfolioItems(updatedList);
      setSelectedCollection(updatedCollection);

      toast.success(`${validImages.length} photo(s) added successfully!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to add photos.', { id: toastId });
    }
  };

  // Delete a single photo from a showcase
  const handleDeletePhotoFromCollection = async (imageId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!selectedCollection) return;
    if (selectedCollection.images.length <= 1) {
      toast.warning('A showcase must retain at least one photo. Delete the collection instead.');
      return;
    }

    if (!window.confirm('Remove this photo from the showcase?')) return;

    const filteredImages = selectedCollection.images.filter((img) => img.id !== imageId);
    const updatedCollection: PortfolioItemType = {
      ...selectedCollection,
      images: filteredImages,
      image_count: filteredImages.length
    };

    const updatedList = portfolioItems.map((p) =>
      p.id === selectedCollection.id ? updatedCollection : p
    );

    savePortfolioItems(updatedList);
    setSelectedCollection(updatedCollection);

    try {
      await apiService.portfolioItems.removeImage(selectedCollection.id, imageId).catch(() => null);
    } catch (err) {
      // optimistic update
    }

    toast.success('Photo removed.');
  };

  // Filter collections
  const filteredItems = portfolioItems.filter((item) => {
    const matchesCategory =
      activeCategoryFilter === 'All'
        ? true
        : activeCategoryFilter === 'Featured'
        ? item.is_featured
        : item.category.toLowerCase() === activeCategoryFilter.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalCollections = portfolioItems.length;
  const totalPhotos = portfolioItems.reduce(
    (acc, curr) => acc + (curr.images?.length || curr.image_count || 0),
    0
  );
  const featuredCount = portfolioItems.filter((p) => p.is_featured).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#221F1C]">
      {/* Top Header & Public Profile Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#E8E2D9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#221F1C]">
              Portfolio & Media Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5ECE2] text-[#9E5338] border border-[#E8E2D9]">
              Verified Studio
            </span>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Curate your client-facing photography collections, client teasers, and highlighted celebrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/vendors/1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto rounded-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] text-xs font-medium h-9 gap-1.5"
            >
              <Eye className="size-3.5 text-[#9E5338]" />
              View Public Profile
              <ArrowUpRight className="size-3 text-[#6B6560]" />
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              setNewTitle('');
              setNewDescription('');
              setNewIsFeatured(false);
              setStagedFiles([]);
              setIsCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-4 gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="size-4" />
            New Showcase
          </Button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <PortfolioStatsBar
        totalCollections={totalCollections}
        totalPhotos={totalPhotos}
        featuredCount={featuredCount}
      />

      {/* Prominent Quick Drag & Drop Upload Zone */}
      <PortfolioDropzone
        dragActive={dragActive}
        isUploading={isUploading}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onFilesSelected={handleFilesSelected}
      />

      {/* Filter and Search Bar */}
      <PortfolioFilterBar
        activeCategoryFilter={activeCategoryFilter}
        setActiveCategoryFilter={setActiveCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Showcase Grid */}
      <PortfolioShowcaseGrid
        items={filteredItems}
        searchQuery={searchQuery}
        activeCategoryFilter={activeCategoryFilter}
        onSelectCollection={(item) => setSelectedCollection(item)}
        onToggleFeatured={handleToggleFeatured}
        onDeleteShowcase={handleDeleteShowcase}
        onResetFilters={() => {
          setSearchQuery('');
          setActiveCategoryFilter('All');
        }}
      />

      {/* CREATE SHOWCASE MODAL */}
      <PortfolioCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        newIsFeatured={newIsFeatured}
        setNewIsFeatured={setNewIsFeatured}
        stagedFiles={stagedFiles}
        onFilesSelected={handleFilesSelected}
        onRemoveStagedPhoto={handleRemoveStagedPhoto}
        onSubmit={handleCreateShowcase}
        isUploading={isUploading}
      />

      {/* COLLECTION INSPECTOR / MANAGEMENT MODAL */}
      <PortfolioDetailModal
        collection={selectedCollection}
        onClose={() => setSelectedCollection(null)}
        onToggleFeatured={handleToggleFeatured}
        onAddPhotos={handleAddPhotosToCollection}
        onDeletePhoto={handleDeletePhotoFromCollection}
        onDeleteShowcase={handleDeleteShowcase}
        onViewImage={(url) => setLightboxImageUrl(url)}
      />

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      <PortfolioLightbox
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </div>
  );
};

export default PortfolioManager;