export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category | string;
  image: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
}
