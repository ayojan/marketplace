'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Star, 
  Upload, 
  Loader2,
  Camera,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  Edit3,
  Sparkles,
  Search,
  ArrowUpRight,
  FolderPlus,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Layers,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export interface PortfolioImage {
  id: string | number;
  url: string;
  thumbnail_url?: string;
  filename?: string;
  byte_size?: number;
}

export interface PortfolioItemType {
  id: string | number;
  title: string;
  category: string;
  description?: string;
  is_featured?: boolean;
  images: PortfolioImage[];
  image_count?: number;
  created_at?: string;
}

const DEFAULT_CATEGORIES = [
  'Weddings',
  'Pre-Wedding',
  'Candid & Moments',
  'Portraits & Bridal',
  'Traditional Rituals',
  'Cinematography',
  'Venues & Decor'
];

// Rich curated initial showcases for realistic vendor presentation & fallback
const INITIAL_SHOWCASES: PortfolioItemType[] = [
  {
    id: 's-1',
    title: 'Royal Destination Wedding at Taj Lake Palace',
    category: 'Weddings',
    description: 'Heritage palace celebration in Udaipur capturing grand pheras under the mandap, night illuminations, and royal guest entries.',
    is_featured: true,
    image_count: 4,
    created_at: '2026-03-12',
    images: [
      {
        id: 'img-101',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
        filename: 'royal_mandap_udaipur.jpg'
      },
      {
        id: 'img-102',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        filename: 'sangeet_dance_moments.jpg'
      },
      {
        id: 'img-103',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
        filename: 'sunset_varmala_exchange.jpg'
      },
      {
        id: 'img-104',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        filename: 'candid_couple_laughter.jpg'
      }
    ]
  },
  {
    id: 's-2',
    title: 'Sunset Editorial Pre-Wedding in South Goa',
    category: 'Pre-Wedding',
    description: 'Bespoke golden hour portraits along coastal cliffs and heritage Portuguese villas with soft natural lighting and candid laughter.',
    is_featured: true,
    image_count: 3,
    created_at: '2026-03-24',
    images: [
      {
        id: 'img-201',
        url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=400&q=80',
        filename: 'goa_sunset_cliffs.jpg'
      },
      {
        id: 'img-202',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
        filename: 'heritage_villa_walk.jpg'
      },
      {
        id: 'img-203',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
        filename: 'beachfront_candid_twilight.jpg'
      }
    ]
  },
  {
    id: 's-3',
    title: 'Vibrant Haldi & Sangeet Celebrations',
    category: 'Traditional Rituals',
    description: 'High-energy cultural joy, marigold floral showers, family performances, and authentic emotion preserved in rich color fidelity.',
    is_featured: false,
    image_count: 3,
    created_at: '2026-04-02',
    images: [
      {
        id: 'img-301',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        filename: 'marigold_haldi_splash.jpg'
      },
      {
        id: 'img-302',
        url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=400&q=80',
        filename: 'sangeet_stage_lights.jpg'
      },
      {
        id: 'img-303',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80',
        filename: 'mehendi_hands_detail.jpg'
      }
    ]
  },
  {
    id: 's-4',
    title: 'Bridal Couture & Fine Art Portraits',
    category: 'Portraits & Bridal',
    description: 'Intricate zardozi embroidery, heritage jewellery styling, and editorial close-ups designed for magazine features.',
    is_featured: false,
    image_count: 2,
    created_at: '2026-04-10',
    images: [
      {
        id: 'img-401',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
        filename: 'bridal_lehenga_veil.jpg'
      },
      {
        id: 'img-402',
        url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80',
        filename: 'kundan_jewellery_portrait.jpg'
      }
    ]
  }
];

const STORAGE_KEY = 'ayoj_vendor_portfolio_v2';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemType[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  // Lightbox Image Preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const detailDropzoneInputRef = useRef<HTMLInputElement>(null);

  // Load portfolio items from backend with localStorage & fallback sync
  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    let itemsFromApi: PortfolioItemType[] = [];

    try {
      // 1. Try fetching from current vendor portfolio endpoint
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
      // Check local storage or use initial showcases
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
    const validImages = fileArray.filter(file => {
      const isImg = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isImg) toast.error(`${file.name} is not an image file.`);
      if (!isValidSize) toast.error(`${file.name} exceeds 10MB limit.`);
      return isImg && isValidSize;
    });

    if (validImages.length === 0) return;

    if (validImages.length > 10) {
      toast.warning('A maximum of 10 photos can be staged per showcase. Selecting first 10.');
    }

    const selectedSlice = validImages.slice(0, 10);
    const newStaged = selectedSlice.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    // Auto-populate title if empty
    if (!newTitle) {
      const suggestedName = selectedSlice[0].name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setNewTitle(suggestedName);
    }

    setStagedFiles(prev => [...prev, ...newStaged].slice(0, 10));
    setIsCreateModalOpen(true);
  };

  // Remove a staged photo before creation
  const handleRemoveStagedPhoto = (index: number) => {
    setStagedFiles(prev => {
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
      const rawFiles = stagedFiles.map(s => s.file);

      // Attempt backend API call
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

      // Format showcase object
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

      // Clean up modal state
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
    const updatedList = portfolioItems.map(p =>
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
      // already optimistically updated
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

    const updatedList = portfolioItems.filter(p => p.id !== id);
    savePortfolioItems(updatedList);

    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }

    try {
      await apiService.portfolioItems.delete(id).catch(() => null);
    } catch (err) {
      // optimistic update done
    }

    toast.success(`Showcase "${title}" deleted.`);
  };

  // Add more photos to an existing selected collection
  const handleAddPhotosToCollection = async (files: FileList | File[]) => {
    if (!selectedCollection) return;

    const fileArray = Array.from(files);
    const validImages = fileArray.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
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

      const updatedList = portfolioItems.map(p =>
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

    const filteredImages = selectedCollection.images.filter(img => img.id !== imageId);
    const updatedCollection: PortfolioItemType = {
      ...selectedCollection,
      images: filteredImages,
      image_count: filteredImages.length
    };

    const updatedList = portfolioItems.map(p =>
      p.id === selectedCollection.id ? updatedCollection : p
    );

    savePortfolioItems(updatedList);
    setSelectedCollection(updatedCollection);

    try {
      await apiService.portfolioItems.removeImage(selectedCollection.id, imageId).catch(() => null);
    } catch (err) {
      // optimistic update completed
    }

    toast.success('Photo removed.');
  };

  // Filter collections
  const filteredItems = portfolioItems.filter(item => {
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
  const totalPhotos = portfolioItems.reduce((acc, curr) => acc + (curr.images?.length || curr.image_count || 0), 0);
  const featuredCount = portfolioItems.filter(p => p.is_featured).length;

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
            href="/photographer/1"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
            <span>Showcases</span>
            <Layers className="size-4 text-[#9E5338]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#221F1C]">
            {totalCollections}
          </div>
          <span className="text-[10px] text-[#6B6560]">Curated galleries</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
            <span>High-Res Photos</span>
            <Camera className="size-4 text-[#9E5338]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#221F1C]">
            {totalPhotos}
          </div>
          <span className="text-[10px] text-[#6B6560]">Original media items</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
            <span>Featured On Profile</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#221F1C]">
            {featuredCount}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Top hero placement</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
            <span>Marketplace Status</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[#221F1C] mt-1">
            Active & Verified
          </div>
          <span className="text-[10px] text-[#6B6560]">Indexed for search</span>
        </div>
      </div>

      {/* Prominent Quick Drag & Drop Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-8 sm:p-10 text-center relative cursor-pointer group ${
          dragActive 
            ? 'border-[#9E5338] bg-[#F5ECE2]' 
            : 'border-[#E8E2D9] bg-white hover:border-[#9E5338]/60 hover:bg-[#FAF7F2]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
        />

        <div className="size-14 rounded-2xl bg-[#F5ECE2] border border-[#E8E2D9] flex items-center justify-center mx-auto mb-3 text-[#9E5338] group-hover:scale-105 transition-transform shadow-xs">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-[#9E5338]" />
          ) : (
            <Upload className="size-6 text-[#9E5338]" />
          )}
        </div>

        <h3 className="text-base font-semibold text-[#221F1C] mb-1">
          {dragActive ? 'Drop your photos to begin showcase' : 'Drag & drop photos here, or click to upload'}
        </h3>
        
        <p className="text-xs text-[#6B6560] max-w-md mx-auto mb-4">
          Select multiple high-resolution photos (JPEG, PNG, WebP up to 10MB each). We automatically organize them into an editorial client showcase.
        </p>

        <div className="flex items-center gap-2">
          <Button 
            type="button"
            size="sm"
            className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-5 h-9 pointer-events-none"
          >
            <FolderPlus className="size-3.5 mr-1.5" />
            Browse Files from Device
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {['All', 'Featured', ...DEFAULT_CATEGORIES].map((category) => {
            const isSelected = activeCategoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs font-medium border ${
                  isSelected
                    ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                    : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
                }`}
              >
                {category === 'Featured' ? (
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-current" />
                    Featured
                  </span>
                ) : (
                  category
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#6B6560]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search showcases..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] rounded-full text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6560] hover:text-[#221F1C]"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const coverImage = item.images?.[0]?.url || item.images?.[0]?.thumbnail_url;
            const photoCount = item.images?.length || item.image_count || 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                onClick={() => setSelectedCollection(item)}
                className="group relative rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white shadow-xs hover:border-[#9E5338]/60 hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#6B6560]">
                      <Camera className="size-8 stroke-1 text-[#6B6560]/40 mb-1" />
                      <span className="text-[10px]">No photos yet</span>
                    </div>
                  )}

                  {/* Gradient shade on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Top Badges & Quick Action Buttons */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-[#221F1C] shadow-xs">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Featured Star Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFeatured(item, e)}
                        title={item.is_featured ? 'Remove from featured' : 'Highlight as featured'}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          item.is_featured
                            ? 'bg-amber-400 text-[#221F1C] shadow-xs'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                      >
                        <Star className={`size-3.5 ${item.is_featured ? 'fill-[#221F1C]' : ''}`} />
                      </button>

                      {/* Delete Showcase button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteShowcase(item.id, item.title, e)}
                        title="Delete showcase"
                        className="p-1.5 rounded-full bg-black/40 text-white hover:bg-red-600 transition-colors cursor-pointer backdrop-blur-md"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Photo Count Pill */}
                  <div className="absolute bottom-2.5 right-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                      <ImageIcon className="size-3 text-[#9E5338]" />
                      {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#221F1C] line-clamp-1 group-hover:text-[#9E5338] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#6B6560] line-clamp-2 mt-1 leading-relaxed">
                      {item.description || 'Editorial gallery showcasing candid moments, lighting, and venue atmosphere.'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E8E2D9] flex items-center justify-between text-[11px] text-[#6B6560]">
                    <span className="flex items-center gap-1">
                      {item.is_featured && (
                        <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                      )}
                      {item.is_featured ? 'Featured Hero' : 'Standard'}
                    </span>
                    <span className="text-[#9E5338] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Manage <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-white p-8">
            <Camera className="size-10 text-[#6B6560]/40 mx-auto mb-2" />
            <h4 className="text-base font-serif font-bold text-[#221F1C]">No showcases found</h4>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || activeCategoryFilter !== 'All'
                ? 'Try adjusting your search terms or category filter to discover your collections.'
                : 'Your portfolio is currently empty. Upload your first wedding or event showcase above.'}
            </p>
            {(searchQuery || activeCategoryFilter !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('All');
                }}
                className="rounded-full text-xs border-[#E8E2D9] text-[#221F1C]"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* CREATE SHOWCASE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#221F1C]">
                    Create New Showcase
                  </h2>
                  <p className="text-xs text-[#6B6560] mt-0.5">
                    Add title, category, and review photos before publishing to your profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="size-8 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateShowcase} className="space-y-5">
                {/* Showcase Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#221F1C] block">
                    Showcase Title <span className="text-[#9E5338]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Royal Destination Wedding at Rambagh Palace"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#221F1C] block">
                    Category <span className="text-[#9E5338]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                          newCategory === cat
                            ? 'bg-[#F5ECE2] border-[#9E5338] text-[#9E5338] font-bold shadow-xs'
                            : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#221F1C] hover:bg-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#221F1C] block">
                    Story & Client Vision <span className="text-xs font-normal text-[#6B6560]">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Highlight the ceremony venue, lighting conditions, or unique couple requirements..."
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors resize-none"
                  />
                </div>

                {/* Staged Photos Preview Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#221F1C]">
                      Photos Selected ({stagedFiles.length}/10)
                    </label>
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3.5" /> Add More Photos
                    </button>
                    <input
                      ref={modalFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                    />
                  </div>

                  {stagedFiles.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] max-h-56 overflow-y-auto">
                      {stagedFiles.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] bg-white group"
                        >
                          <Image
                            src={item.previewUrl}
                            alt="preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#9E5338] text-white">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveStagedPhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => modalFileInputRef.current?.click()}
                      className="p-6 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-[#FAF7F2] cursor-pointer hover:border-[#9E5338]"
                    >
                      <Camera className="size-6 text-[#9E5338] mx-auto mb-1" />
                      <p className="text-xs text-[#221F1C] font-semibold">Click to select photos for this showcase</p>
                      <p className="text-[10px] text-[#6B6560]">JPEG, PNG, WebP up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* Featured Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]">
                  <div>
                    <h4 className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
                      <Star className="size-3.5 text-amber-500 fill-amber-500" />
                      Highlight as Featured Showcase
                    </h4>
                    <p className="text-[11px] text-[#6B6560] mt-0.5">
                      Pins this collection to the top banner of your public vendor storefront.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                    className="size-4 accent-[#9E5338] cursor-pointer rounded"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2D9]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-full border-[#E8E2D9] text-xs h-9 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-6 shadow-xs gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Uploading Media...
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        Publish Showcase
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COLLECTION INSPECTOR / MANAGEMENT MODAL */}
      <AnimatePresence>
        {selectedCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E8E2D9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5ECE2] text-[#9E5338] border border-[#E8E2D9]">
                      {selectedCollection.category}
                    </span>
                    {selectedCollection.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Star className="size-3 fill-amber-700" /> Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#221F1C] mt-1.5">
                    {selectedCollection.title}
                  </h2>
                  <p className="text-xs text-[#6B6560] mt-1">
                    {selectedCollection.description || 'No story provided for this collection.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(selectedCollection)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      selectedCollection.is_featured
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-[#E8E2D9] bg-white text-[#6B6560] hover:text-[#221F1C]'
                    }`}
                    title={selectedCollection.is_featured ? 'Remove featured' : 'Make featured'}
                  >
                    <Star className={`size-4 ${selectedCollection.is_featured ? 'fill-amber-600' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCollection(null)}
                    className="size-8 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2] transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
                    Showcase Photos ({selectedCollection.images.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => detailDropzoneInputRef.current?.click()}
                    className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Upload More Photos
                  </button>
                  <input
                    ref={detailDropzoneInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleAddPhotosToCollection(e.target.files)}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedCollection.images.map((img, idx) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImageUrl(img.url)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-[#E8E2D9] bg-[#FAF7F2] cursor-pointer"
                    >
                      <Image
                        src={img.thumbnail_url || img.url}
                        alt="collection photo"
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#9E5338] text-white shadow-xs z-10">
                          Cover
                        </span>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImageUrl(img.url);
                          }}
                          title="View High-Res"
                          className="p-1.5 rounded-full bg-white/90 text-[#221F1C] hover:bg-white transition-colors"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhotoFromCollection(img.id, e)}
                          title="Delete Photo"
                          className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDeleteShowcase(selectedCollection.id, selectedCollection.title, e)}
                  className="rounded-full text-red-600 border-red-200 hover:bg-red-50 text-xs h-9 px-4 gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Delete Showcase
                </Button>

                <Button
                  size="sm"
                  onClick={() => setSelectedCollection(null)}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-6"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxImageUrl && (
          <div 
            onClick={() => setLightboxImageUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="size-5" />
            </button>
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-4xl max-h-[85vh] w-full h-[80vh] flex items-center justify-center"
            >
              <Image
                src={lightboxImageUrl}
                alt="Full preview"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PortfolioManager;