export interface PackageItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  subtitle?: string;
  description: string[];
  recommendation: string;
  isHot?: boolean;
  type: 'package' | 'membership';
}

export interface AlaCarteItem {
  name: string;
  price: number;
  note?: string;
}

export interface AlaCarteCategory {
  title: string;
  items: AlaCarteItem[];
}