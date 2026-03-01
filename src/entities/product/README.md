# Product API Integration

This module provides a complete integration with the backend Product API, including all CRUD operations, member management, PRD management, and task management.

## Features

- ✅ Complete Product CRUD operations
- ✅ Member management (add/remove members)
- ✅ PRD (Product Requirements Document) management
- ✅ Task management with real-time updates
- ✅ Product analytics
- ✅ React Query integration for caching and synchronization
- ✅ Zustand store for local state management
- ✅ TypeScript support with full type safety

## API Endpoints Covered

### Products
- `GET /api/products` - Get all products with pagination
- `GET /api/products/{id}` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Members
- `GET /api/products/{id}/members` - Get product members
- `POST /api/products/{id}/members` - Add member to product
- `DELETE /api/products/{productId}/members/{memberId}` - Remove member

### PRD
- `GET /api/products/{productId}/prd` - Get PRD
- `PUT /api/products/{productId}/prd` - Create/update PRD

### Tasks
- `GET /api/products/{productId}/tasks` - Get tasks
- `POST /api/products/{productId}/tasks` - Create task
- `PATCH /api/products/{productId}/tasks/{taskId}` - Update task
- `DELETE /api/products/{productId}/tasks/{taskId}` - Delete task

### Analytics
- `GET /api/products/{id}/analytics` - Get product analytics

## Usage Examples

### Basic Product Operations

```tsx
import { useProductsQuery, useCreateProductMutation, useProductQuery } from '@/entities/product';

function ProductList() {
  const { data: productsResponse, isLoading } = useProductsQuery({
    page: 1,
    limit: 10,
    search: 'search term'
  });
  
  const createProductMutation = useCreateProductMutation();
  
  const handleCreateProduct = () => {
    createProductMutation.mutate({
      name: 'New Product',
      description: 'Product description',
      materialLink: 'https://example.com',
      teamMembers: [
        {
          email: 'user@example.com',
          name: 'John Doe',
          role: 'PM'
        }
      ]
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {productsResponse?.products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Using with Existing UI Components

You can integrate these APIs with your existing UI components by using the hooks and handling the responses:

```tsx
// In your existing product components
import { 
  useProductsQuery, 
  useCreateProductMutation, 
  useProductMembersQuery,
  useAddMemberMutation,
  handleProductApiError,
  handleProductApiSuccess 
} from '@/entities/product';

// Use the hooks in your existing components
const { data: productsResponse } = useProductsQuery();
const createProductMutation = useCreateProductMutation();
const { data: membersResponse } = useProductMembersQuery(productId);
const addMemberMutation = useAddMemberMutation();

// Handle API calls with proper error handling
const handleCreateProduct = () => {
  createProductMutation.mutate(productData, {
    onSuccess: () => handleProductApiSuccess('Product created!'),
    onError: (error) => handleProductApiError(error, 'Failed to create product')
  });
};
```

### Using Error Handling

```tsx
import { handleProductApiError, handleProductApiSuccess } from '@/entities/product';

// In your existing components, use these utilities for consistent error handling
const createProductMutation = useCreateProductMutation();

const handleCreate = () => {
  createProductMutation.mutate(data, {
    onSuccess: () => {
      handleProductApiSuccess('Product created successfully!');
    },
    onError: (error) => {
      handleProductApiError(error, 'Failed to create product.');
    }
  });
};
```

## Utilities Available

- `handleProductApiError` - Centralized error handling for product API calls
- `handleProductApiSuccess` - Success message handling for product API calls

## Hooks Available

### Query Hooks
- `useProductsQuery(params?)` - Get all products
- `useProductQuery(id, enabled?)` - Get specific product
- `useProductMembersQuery(productId, enabled?)` - Get product members
- `useProductPRDQuery(productId, enabled?)` - Get product PRD
- `useProductTasksQuery(productId, enabled?)` - Get product tasks
- `useProductAnalyticsQuery(productId, enabled?)` - Get product analytics

### Mutation Hooks
- `useCreateProductMutation()` - Create product
- `useUpdateProductMutation()` - Update product
- `useDeleteProductMutation()` - Delete product
- `useAddMemberMutation()` - Add member
- `useRemoveMemberMutation()` - Remove member
- `useUpsertPRDMutation()` - Create/update PRD
- `useCreateTaskMutation()` - Create task
- `useUpdateTaskMutation()` - Update task
- `useDeleteTaskMutation()` - Delete task

## Store

The Zustand store provides local state management for the currently selected product:

```tsx
import { useProductStore } from '@/entities/product';

function MyComponent() {
  const chosenProduct = useProductStore(state => state.chosenProduct);
  const setChosenProduct = useProductStore(state => state.setChosenProduct);
  const clearChosenProduct = useProductStore(state => state.clearChosenProduct);
  
  // Use the store methods
}
```

## Error Handling

All mutations include proper error handling. Check the `error` property on mutation results:

```tsx
const createProductMutation = useCreateProductMutation();

const handleCreate = () => {
  createProductMutation.mutate(data, {
    onError: (error) => {
      console.error('Failed to create product:', error);
      // Handle error (show toast, etc.)
    }
  });
};
```

## Authentication

All API calls automatically include authentication headers via the axios interceptor configured in `@/lib/config/axiosConfig`.
