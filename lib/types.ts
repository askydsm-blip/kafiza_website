import { ObjectId } from 'mongodb';

/**
 * Base interface for all database documents
 */
export interface BaseDocument {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Farmer document interface
 * Represents coffee farmers in Brazil
 */
export interface Farmer extends BaseDocument {
  name: string;
  farmName: string;
  location: {
    state: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  coffeeTypes: string[];
  certifications: string[];
  contact: {
    email: string;
    phone?: string;
    whatsapp?: string;
  };
  description: string;
  images: string[];
  isActive: boolean;
  rating?: number;
  totalOrders: number;
}

/**
 * Roaster document interface
 * Represents coffee roasters in New Zealand
 */
export interface Roaster extends BaseDocument {
  businessName: string;
  ownerName: string;
  location: {
    city: string;
    region: string;
    address: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  businessType: 'roastery' | 'cafe' | 'both';
  description: string;
  isActive: boolean;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  totalOrders: number;
}

/**
 * Order document interface
 * Represents coffee orders between roasters and farmers
 */
export interface Order extends BaseDocument {
  roasterId: ObjectId;
  farmerId: ObjectId;
  coffeeType: string;
  quantity: number;
  unit: 'kg' | 'lb';
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: string;
  estimatedDelivery: Date;
  notes?: string;
}

/**
 * API Response wrapper for consistent error handling
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

