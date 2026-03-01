export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ProductMember {
  id: number;
  productId: number;
  userId: number;
  role: string;
  user: User;
}

export interface ProductFile {
  id: number;
  productId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface ProductVehicle {
  id: number;
  name: string;
  type: string;
  members: any[];
}

export interface ProductAnalytics {
  vehicleCount: number;
  memberCount: number;
  fileCount: number;
  recentVehicles: ProductVehicle[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  materialLink: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  members: ProductMember[];
  files: ProductFile[];
  vehicles: ProductVehicle[];
  _count: {
    vehicles: number;
    members: number;
    files: number;
  };
}

export interface CreateProductDto {
  name: string;
  description?: string;
  materialLink?: string;
  teamMembers?: {
    email: string;
    name: string;
    role: string;
  }[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  materialLink?: string;
}

export interface AddMemberDto {
  email: string;
  name: string;
  role: string;
}

export interface ProductPRD {
  id: number;
  productId: number;
  featureName: string;
  goal: string;
  successMetrics: string;
  dependencies: string;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePRDDto {
  featureName: string;
  goal: string;
  successMetrics: string;
  dependencies: string;
}

export interface ProductTask {
  id: number;
  productId: number;
  text: string;
  done: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  text: string;
  vehicleId?: number;
}

export interface UpdateTaskDto {
  text?: string;
  done?: boolean;
  vehicleId?: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

export interface MembersResponse {
  success: boolean;
  members: ProductMember[];
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: ProductAnalytics;
}

export interface PRDResponse {
  success: boolean;
  prd: ProductPRD | null;
}

export interface TasksResponse {
  success: boolean;
  tasks: ProductTask[];
}
