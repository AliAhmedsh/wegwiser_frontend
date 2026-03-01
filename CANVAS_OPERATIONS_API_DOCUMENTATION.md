# Canvas Operations API Documentation

Yeh documentation explain karti hai ke kaise frontend se Canvas Operations APIs ko call kiya jata hai.

## Overview

Sabhi Canvas Operations APIs Node.js backend se call hoti hain, jo phir FastAPI ko forward karta hai. Frontend se direct FastAPI ko call nahi kiya jata.

## API Endpoints

### 1. Initialize Canvas

**Endpoint:** `POST /api/design-ai/canvas/init?project_id={project_id}`

**Frontend Service Call:**
```typescript
import { designAIService } from '@/lib/api/services/designAIService';

const result = await designAIService.initCanvas(projectId);
```

**UI Se Kaise Call Hoga:**
- Design Workspace ke header mein "Canvas Ops" button click karein
- "Init Canvas" tab select karein
- Project ID enter karein (default: selected product ID)
- "Initialize Canvas" button click karein

**Request Flow:**
```
Frontend UI → designAIService.initCanvas() 
→ POST /api/design-ai/canvas/init?project_id={project_id}
→ Node.js Backend (designAIController.initCanvas)
→ FastAPI POST /canvas/init?project_id={project_id}
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "project_id": "veh-001",
  "artboards": [...],
  "tokens_ref": {...},
  "layer_names_preserved": true
}
```

---

### 2. Apply Operations

**Endpoint:** `POST /api/design-ai/canvas/apply`

**Frontend Service Call:**
```typescript
const result = await designAIService.applyCanvas({
  project_id: "veh-001",
  ops: [
    {
      op: "create",
      path: [0],
      node: {
        id: "new-btn",
        name: "New Button",
        type: "button",
        bounds: { x: 100, y: 300, w: 150, h: 44 },
        fill: { token: "color.primary" }
      }
    },
    {
      op: "update",
      path: [0, 1],
      patch: { text: "Updated Text" }
    },
    {
      op: "delete",
      path: [0, 2]
    }
  ]
});
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Apply Ops" tab select karein
- Project ID enter karein
- Operations JSON array enter karein (create, update, delete operations)
- "Apply Operations" button click karein

**Request Flow:**
```
Frontend UI → designAIService.applyCanvas({ project_id, ops })
→ POST /api/design-ai/canvas/apply
→ Node.js Backend (designAIController.applyCanvas)
→ FastAPI POST /canvas/apply
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "doc": {...}
}
```

---

### 3. Get Canvas State

**Endpoint:** `GET /api/design-ai/canvas/get?project_id={project_id}`

**Frontend Service Call:**
```typescript
const result = await designAIService.getCanvas(projectId);
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Get Canvas" tab select karein
- Project ID enter karein
- "Get Canvas State" button click karein

**Request Flow:**
```
Frontend UI → designAIService.getCanvas(projectId)
→ GET /api/design-ai/canvas/get?project_id={project_id}
→ Node.js Backend (designAIController.getCanvas)
→ FastAPI GET /canvas/get?project_id={project_id}
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "project_id": "veh-001",
  "artboards": [...],
  "tokens_ref": {...}
}
```

---

### 4. Create Shape

**Endpoint:** `POST /api/design-ai/canvas/create-shape`

**Frontend Service Call:**
```typescript
const result = await designAIService.createShape({
  project_id: "veh-001",
  parent_path: [0],
  shape: {
    id: "rect-1",
    name: "Background",
    type: "rect",
    bounds: { x: 0, y: 0, w: 400, h: 300 },
    fill: { hex: "#F5F5F5" }
  }
});
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Create Shape" tab select karein
- Project ID enter karein
- Parent Path (JSON array) enter karein, e.g., `[0]`
- Shape object (JSON) enter karein
- "Create Shape" button click karein

**Request Flow:**
```
Frontend UI → designAIService.createShape({ project_id, parent_path, shape })
→ POST /api/design-ai/canvas/create-shape
→ Node.js Backend (designAIController.createShape)
→ FastAPI POST /canvas/create_shape
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "node_id": "rect-1",
  ...
}
```

---

### 5. Update Shape

**Endpoint:** `POST /api/design-ai/canvas/update-shape`

**Frontend Service Call:**
```typescript
const result = await designAIService.updateShape({
  project_id: "veh-001",
  node_id: "rect-1",
  updates: {
    bounds: { x: 50, y: 50, w: 400, h: 300 },
    fill: { hex: "#E0E0E0" }
  }
});
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Update Shape" tab select karein
- Project ID enter karein
- Node ID enter karein (e.g., "rect-1")
- Updates object (JSON) enter karein
- "Update Shape" button click karein

**Request Flow:**
```
Frontend UI → designAIService.updateShape({ project_id, node_id, updates })
→ POST /api/design-ai/canvas/update-shape
→ Node.js Backend (designAIController.updateShape)
→ FastAPI POST /canvas/update_shape
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "node_id": "rect-1",
  ...
}
```

---

### 6. Delete Shape

**Endpoint:** `POST /api/design-ai/canvas/delete-shape`

**Frontend Service Call:**
```typescript
const result = await designAIService.deleteShape({
  project_id: "veh-001",
  node_id: "rect-1"
});
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Delete Shape" tab select karein
- Project ID enter karein
- Node ID enter karein
- "Delete Shape" button click karein

**Request Flow:**
```
Frontend UI → designAIService.deleteShape({ project_id, node_id })
→ POST /api/design-ai/canvas/delete-shape
→ Node.js Backend (designAIController.deleteShape)
→ FastAPI POST /canvas/delete_shape
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "message": "Shape deleted successfully"
}
```

---

### 7. Bulk Update

**Endpoint:** `POST /api/design-ai/canvas/bulk-update?project_id={project_id}`

**Frontend Service Call:**
```typescript
const result = await designAIService.bulkUpdate(projectId, [
  {
    node_id: "btn-1",
    changes: { text: "New Text" }
  },
  {
    node_id: "btn-2",
    changes: { fill: { hex: "#FF0000" } }
  }
]);
```

**UI Se Kaise Call Hoga:**
- "Canvas Ops" panel open karein
- "Bulk Update" tab select karein
- Project ID enter karein
- Updates array (JSON) enter karein
- "Bulk Update" button click karein

**Request Flow:**
```
Frontend UI → designAIService.bulkUpdate(projectId, updates)
→ POST /api/design-ai/canvas/bulk-update?project_id={project_id}
→ Node.js Backend (designAIController.bulkUpdate)
→ FastAPI POST /canvas/bulk_update?project_id={project_id}
→ Response → Node.js → Frontend
```

**Response:**
```json
{
  "success": true,
  "updated_count": 2,
  ...
}
```

---

## UI Component Location

Canvas Operations panel ko access karne ke liye:

1. Design Workspace open karein
2. Header mein "Canvas Ops" button click karein
3. Panel right side mein open hoga
4. Different tabs se different operations perform kar sakte hain

## Error Handling

Sabhi operations mein:
- Loading state show hota hai
- Success/Error toast notifications show hote hain
- Response/Error details panel mein display hote hain
- JSON validation automatically hoti hai

## Notes

- Sabhi requests authenticated hain (JWT token automatically add hota hai)
- Project ID default mein selected product ka ID hota hai
- JSON fields ko properly format karna zaroori hai
- Response panel mein formatted JSON display hota hai

