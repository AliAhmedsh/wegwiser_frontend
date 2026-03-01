# Design Workspace Entity

This entity provides comprehensive functionality for managing design workspaces, pages, and layers with full backend persistence.

## Features

### ✅ **Page Management (Design Workspaces)**

- Create, update, delete design workspaces/projects
- Each page represents a separate design project (e.g., "Email Template", "Landing Page")
- Page renaming with inline editing
- Page ordering and persistence

### ✅ **Layer Management (Design Elements)**

- Create, update, delete individual design elements
- Each layer represents a design element (logo, text, button, shape, image)
- Layer selection and grouping capabilities
- Inline editing with keyboard shortcuts
- Visual hierarchy with indentation
- Nested layer hierarchy for grouped elements

### ✅ **Backend Integration**

- Full API integration with React Query
- Optimistic updates for better UX
- Error handling with toast notifications
- Loading states for all operations

### ✅ **State Management**

- Zustand store for local state
- React Query for server state
- Automatic synchronization between frontend and backend

## API Endpoints Used

- `POST /api/design-workspace/{workspaceId}/pages` - Create page
- `PUT /api/design-workspace/pages/{pageId}` - Update page
- `POST /api/design-workspace/pages/{pageId}/layers` - Create layer
- `PUT /api/design-workspace/layers/{layerId}` - Update layer
- `DELETE /api/design-workspace/layers/{layerId}` - Delete layer
- `POST /api/design-workspace/pages/{pageId}/layers/reorder` - Reorder layers

## Usage

### Basic Setup

```tsx
import { useDesignWorkspace } from '@/entities/designWorkspace';

function MyComponent() {
  const {
    pages,
    currentPage,
    createPage,
    createLayer,
    updateLayer,
    deleteLayer,
    isCreatingPage,
    isCreatingLayer,
  } = useDesignWorkspace(workspaceId, pageId);

  return <div>{/* Your UI components */}</div>;
}
```

### Layer Operations

```tsx
// Create a new layer
createLayer({
  pageId: 1,
  data: {
    name: 'New Layer',
    parentId: 2, // Optional: for nested layers
  },
});

// Update layer
updateLayer({
  layerId: 1,
  data: {
    name: 'Updated Layer Name',
  },
});

// Delete layer
deleteLayer(1);
```

### Page Operations

```tsx
// Create a new page
createPage({
  workspaceId: 1,
  data: {
    name: 'New Page',
  },
});

// Update page
updatePage({
  pageId: 1,
  data: {
    name: 'Updated Page Name',
  },
});
```

## Store Structure

The Zustand store manages:

- Current workspace and page IDs
- Pages array with full data
- Layers in hierarchical structure
- Editing states for inline editing
- Loading states for all operations

## Data Flow

1. **User Action** → Component calls hook function
2. **Optimistic Update** → Local state updated immediately
3. **API Call** → Backend request made
4. **Success** → Data synchronized, toast shown
5. **Error** → Local state reverted, error toast shown

## Design Structure

### **Pages (Design Workspaces)**

Each page represents a separate design project:

```
Pages
├── Email Template Project
├── Landing Page Design
├── Mobile App UI
└── Dashboard Design
```

### **Layers (Design Elements)**

Each layer represents an individual design element:

```
Layers
├── Logo (image element)
├── Header Text (text element)
├── Blue Rectangle (shape element)
├── Submit Button (button element)
└── User Avatar (image element)
```

### **Grouped Elements**

Related elements can be grouped together:

```
Header Group
├── Logo
├── Navigation Menu
└── User Profile
```

## Persistence

All layer and page operations are automatically persisted to the backend:

- Layer order is maintained across sessions
- Nested relationships are preserved
- Changes are saved immediately on user actions
- Data is synchronized on page refresh

### **Canvas Auto-Save**

The canvas automatically saves design elements when you create or modify designs:

#### **How It Works:**

1. **Select a Layer**: Click on any layer in the sidebar (e.g., "Logo", "Button")
2. **Create Designs**: Draw shapes, add text, images on the canvas
3. **Auto-Save**: Changes are automatically saved after 2 seconds of inactivity
4. **Load on Selection**: When you select the same layer again, your design is automatically loaded

#### **What Gets Saved:**

- **Design Elements**: All shapes, text, images, lines, arrows
- **Properties**: Fill color, stroke, dimensions, etc.
- **Position**: X, Y coordinates of each element
- **Size**: Width and height of each element
- **Order**: Layer order and hierarchy

#### **Benefits:**

✅ **No Manual Save**: Designs save automatically  
✅ **Debounced**: Waits 2 seconds after last change to avoid excessive API calls  
✅ **Per-Layer**: Each layer has its own canvas state  
✅ **Persistent**: Designs remain even after logout/browser close  
✅ **Fast Loading**: Designs load instantly when layer is selected

#### **Usage:**

```typescript
// Auto-save is automatically enabled when you:
// 1. Select a layer in the sidebar
// 2. Create or modify design elements on the canvas
// 3. Changes are saved automatically after 2 seconds

// The hook is already integrated in MainCanvasKonva component
useCanvasAutoSave({
  layerId: selectedLayerId,
  pageId: currentPageId,
  enabled: !!selectedLayerId,
  debounceMs: 2000,
});
```

## Error Handling

- Network errors are caught and displayed
- Optimistic updates are reverted on failure
- User-friendly error messages via toast notifications
- Loading states prevent duplicate operations
