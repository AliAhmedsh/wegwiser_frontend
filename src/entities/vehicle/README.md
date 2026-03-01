# Vehicle API Integration

This document provides a comprehensive overview of the vehicle API integration in the frontend application.

## Overview

The vehicle system has been fully integrated with the backend API, providing a complete CRUD interface for vehicle management, team collaboration, and file handling. The integration follows a multi-step creation process that mirrors the backend API structure.

## API Service Layer

### VehicleService (`/lib/api/services/vehicleService.ts`)

The main service class that handles all vehicle-related API calls:

```typescript
import { vehicleService } from '@/lib/api/services/vehicleService';

// Get form data for vehicle creation
const formData = await vehicleService.getVehicleFormData(productId);

// Save basic vehicle information
const result = await vehicleService.saveBasicInfo({
  productId: 1,
  vehicleName: "Driller-X",
  vehicleType: "Drilling Equipment",
  shortDescription: "Advanced drilling vehicle"
});
```

### Available Methods

#### Vehicle Creation Flow
- `getVehicleFormData(productId)` - Get form data for Step 1
- `saveBasicInfo(data)` - Save basic vehicle info (Step 1)
- `saveProductRelationship(vehicleId, data)` - Save product relationship (Step 2)
- `saveVehicleOutline(vehicleId, data)` - Save vehicle outline (Step 3)
- `getTeamMembersForInvitation(vehicleId, search?)` - Get team members (Step 4)
- `addTeamMember(vehicleId, data)` - Add team member (Step 4)
- `removeTeamMember(vehicleId, memberId)` - Remove team member (Step 4)
- `getVehicleReview(vehicleId)` - Get review data (Step 5)
- `finalizeVehicle(vehicleId)` - Finalize vehicle creation (Step 5)

#### Vehicle Management
- `getAllVehicles(params?)` - Get all vehicles with pagination/filtering
- `getVehicle(id)` - Get single vehicle by ID
- `createCompleteVehicle(data)` - Create complete vehicle (frontend compatible)
- `deleteVehicle(id)` - Delete vehicle

#### Additional Features
- `aiElaborateDescription(data)` - AI-powered description enhancement
- `uploadVehicleFiles(vehicleId, files)` - Upload supporting files
- `getVehicleFiles(vehicleId)` - Get vehicle files

## React Query Hooks

### Vehicle Hooks (`/lib/api/hooks/useVehicle.ts`)

React Query hooks for data fetching and mutations:

```typescript
import { 
  useAllVehicles, 
  useVehicle, 
  useSaveBasicInfoMutation,
  useFinalizeVehicleMutation 
} from '@/lib/api/hooks/useVehicle';

// Query hooks
const { data: vehicles, isLoading } = useAllVehicles({
  page: 1,
  limit: 10,
  productId: 1,
  search: "driller"
});

// Mutation hooks
const saveBasicInfo = useSaveBasicInfoMutation();
const finalizeVehicle = useFinalizeVehicleMutation();
```

### Available Hooks

#### Query Hooks
- `useVehicleFormData(productId)` - Get form data
- `useAllVehicles(params?)` - Get all vehicles
- `useVehicle(id)` - Get single vehicle
- `useTeamMembersForInvitation(vehicleId, search?)` - Get team members
- `useVehicleReview(vehicleId)` - Get review data
- `useVehicleFiles(vehicleId)` - Get vehicle files

#### Mutation Hooks
- `useSaveBasicInfoMutation()` - Save basic info
- `useSaveProductRelationshipMutation()` - Save product relationship
- `useSaveVehicleOutlineMutation()` - Save vehicle outline
- `useAddTeamMemberMutation()` - Add team member
- `useRemoveTeamMemberMutation()` - Remove team member
- `useFinalizeVehicleMutation()` - Finalize vehicle
- `useAIElaborateMutation()` - AI elaborate description
- `useUploadVehicleFilesMutation()` - Upload files
- `useCreateCompleteVehicleMutation()` - Create complete vehicle
- `useDeleteVehicleMutation()` - Delete vehicle

## Vehicle Creation Flow

The vehicle creation process follows a 5-step workflow:

### Step 1: Basic Info
- **Component**: `BasicInfoForm`
- **API**: `POST /api/vehicles/basic-info`
- **Features**: 
  - Vehicle name, type, description
  - AI elaboration for descriptions
  - Form validation
  - Auto-save and continue

### Step 2: Product Relationship
- **Component**: `ProductRelating`
- **API**: `POST /api/vehicles/{vehicleId}/product-relationship`
- **Features**:
  - Voice input support
  - File upload capability
  - Relationship description

### Step 3: Vehicle Outline
- **Component**: `VehicleOutlineForm`
- **API**: `POST /api/vehicles/{vehicleId}/outline`
- **Features**:
  - Feature tags management
  - Date selection
  - Priority settings
  - Success metrics

### Step 4: Invite Members
- **Component**: `InviteMembers`
- **APIs**: 
  - `GET /api/vehicles/{vehicleId}/team-members`
  - `POST /api/vehicles/{vehicleId}/team-members`
  - `DELETE /api/vehicles/{vehicleId}/team-members/{memberId}`
- **Features**:
  - Search team members
  - Add/remove members
  - Capacity management
  - Role assignment

### Step 5: Review & Finalize
- **Component**: `ReviewInformation`
- **APIs**:
  - `GET /api/vehicles/{vehicleId}/review`
  - `POST /api/vehicles/{vehicleId}/finalize`
- **Features**:
  - Complete vehicle review
  - Final validation
  - Vehicle creation completion

## State Management

### Vehicle Creation Store (`/features/createVehicle/store.ts`)

Zustand store for managing vehicle creation state:

```typescript
interface CreationVehicleStore {
  step: number;
  vehicleId: number | null;
  vehicleData: VehicleData;
  vehicleMembers: WorkerListProps[];
  featureTags: string;
  date: Date | null;
  // ... methods
}
```

### Key Features
- Step navigation
- Vehicle ID tracking
- Form data persistence
- Team member management
- Reset functionality

## Components

### Vehicle List Component (`VehicleListWithAPI.tsx`)

Comprehensive vehicle listing with:
- Pagination support
- Search functionality
- Status filtering
- Delete operations
- Vehicle selection

### Vehicle Detail Component (`VehicleDetailWithAPI.tsx`)

Detailed vehicle view with:
- Tabbed interface (Overview, Team, Files)
- Team member display
- File management
- Edit/delete actions

### Demo Page (`/app/vehicles-demo/page.tsx`)

Complete demonstration of all vehicle API features:
- Vehicle listing
- Detailed views
- API endpoint reference
- Feature overview

## Error Handling

All API calls include comprehensive error handling:

```typescript
const saveBasicInfo = useSaveBasicInfoMutation();

// Automatic error handling with toast notifications
saveBasicInfo.mutate(data, {
  onError: (error) => {
    // Error is automatically handled by the mutation hook
    // Toast notifications are shown to the user
  }
});
```

## Authentication

All API calls automatically include authentication headers:

```typescript
// Automatic token injection
vehicleApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## File Upload

Support for file uploads with validation:

```typescript
const uploadFiles = useUploadVehicleFilesMutation();

const handleFileUpload = (files: File[]) => {
  uploadFiles.mutate({
    vehicleId: 1,
    files: files
  });
};
```

## AI Integration

AI-powered description enhancement:

```typescript
const aiElaborate = useAIElaborateMutation();

const handleAIElaborate = async (description: string) => {
  const result = await aiElaborate.mutateAsync({ description });
  setDescription(result.elaboratedDescription);
};
```

## Usage Examples

### Creating a New Vehicle

```typescript
import { useSaveBasicInfoMutation } from '@/lib/api/hooks/useVehicle';

const CreateVehicleForm = () => {
  const saveBasicInfo = useSaveBasicInfoMutation();
  
  const handleSubmit = async (data) => {
    try {
      const result = await saveBasicInfo.mutateAsync({
        productId: 1,
        vehicleName: "New Vehicle",
        vehicleType: "Equipment",
        shortDescription: "Description"
      });
      console.log('Vehicle created:', result.vehicle);
    } catch (error) {
      // Error handling is automatic
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Listing Vehicles

```typescript
import { useAllVehicles } from '@/lib/api/hooks/useVehicle';

const VehicleList = () => {
  const { data, isLoading, error } = useAllVehicles({
    page: 1,
    limit: 10,
    search: "driller"
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading vehicles</div>;
  
  return (
    <div>
      {data?.vehicles.map(vehicle => (
        <div key={vehicle.id}>{vehicle.name}</div>
      ))}
    </div>
  );
};
```

## Testing

The integration includes comprehensive error handling and loading states. All components are designed to work seamlessly with the backend API and provide a smooth user experience.

## Future Enhancements

- Real-time updates with WebSocket integration
- Advanced filtering and sorting options
- Bulk operations for multiple vehicles
- Enhanced file management with preview
- Advanced AI features for vehicle optimization
