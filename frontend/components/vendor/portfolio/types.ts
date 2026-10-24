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
