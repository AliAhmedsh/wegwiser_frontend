'use client';

import React, { useState, useEffect } from 'react';
import { designAIService } from '@/lib/api/services/designAIService';
import { useProductStore } from '@/entities/product/store';
import { showToast } from '@/lib/utils/toast';
import { Node } from '@/lib/api/services/designAIService';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { convertNodeToCanvasInstance, convertNodeToCanvasInstanceForEdit } from '@/workspaces/designWorkspace/utils/nodeToCanvasConverter';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { 
  Rocket, 
  Zap, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Search, 
  Lightbulb, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface CanvasOperationsPanelProps {
  onClose?: () => void;
}

const CanvasOperationsPanel: React.FC<CanvasOperationsPanelProps> = ({ onClose }) => {
  const { chosenProduct } = useProductStore();
  const { layers, addInstance, updateInstance, deleteInstance, setAIGenerated, getInstanceById } = useCanvasLayersStore();
  const { stageRef } = useDesignWorkspaceStore();
  const { selectedInstancesIds } = useSelectedInstances();
  const [activeTab, setActiveTab] = useState<'init' | 'apply' | 'get' | 'create' | 'update' | 'delete' | 'bulk' | 'ds-discover' | 'ds-propose' | 'ds-approve' | 'ds-get'>('init');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = chosenProduct?.id?.toString() || '';

  // Helper to force canvas redraw
  const forceCanvasRedraw = () => {
    setTimeout(() => {
      try {
        if (stageRef?.current) {
          stageRef.current.batchDraw();
        }
      } catch (err) {
        console.error('Error forcing canvas redraw:', err);
      }
    }, 100);
    
    // Additional redraw after a delay to ensure rendering
    setTimeout(() => {
      try {
        if (stageRef?.current) {
          stageRef.current.batchDraw();
        }
      } catch (err) {
        console.error('Error forcing canvas redraw (delayed):', err);
      }
    }, 300);
  };

  // Helper to convert artboards to canvas layers
  const convertArtboardsToLayers = (artboards: any[]): any[] => {
    const canvasLayers: any[] = [];
    
    if (!artboards || !Array.isArray(artboards)) {
      console.warn('[Canvas Ops] No artboards found or invalid format');
      return canvasLayers;
    }
    
    console.log('[Canvas Ops] Converting', artboards.length, 'artboard(s) to canvas layers');
    
    artboards.forEach((artboard: any, artboardIndex: number) => {
      console.log(`[Canvas Ops] Processing artboard ${artboardIndex + 1}:`, artboard.id, artboard.name, 'children:', artboard.children?.length || 0);
      
      // Handle artboard children (main content - groups, buttons, etc.)
      if (artboard.children && Array.isArray(artboard.children) && artboard.children.length > 0) {
        artboard.children.forEach((child: Node, childIndex: number) => {
          try {
            console.log(`[Canvas Ops] Converting child ${childIndex + 1}:`, child.id, child.type, child.name);
            const canvasInstance = convertNodeToCanvasInstance(child);
            if (canvasInstance && canvasInstance.id) {
              canvasLayers.push(canvasInstance);
              console.log(`[Canvas Ops] ✓ Added to canvas:`, canvasInstance.id, canvasInstance.type);
            } else {
              console.warn(`[Canvas Ops] ✗ Failed to convert child:`, child.id, 'result:', canvasInstance);
            }
          } catch (err) {
            console.error('[Canvas Ops] Error converting child to canvas instance:', err, child);
          }
        });
      } else {
        console.warn(`[Canvas Ops] Artboard ${artboard.id} has no children`);
      }
      
      // Also check if artboard itself is a node (some APIs return artboard as node)
      // Skip frame type artboards as they're just containers
      if (artboard.type && artboard.id && artboard.type !== 'frame') {
        try {
          const canvasInstance = convertNodeToCanvasInstance(artboard);
          if (canvasInstance && canvasInstance.id) {
            canvasLayers.push(canvasInstance);
            console.log(`[Canvas Ops] ✓ Added artboard as layer:`, canvasInstance.id);
          }
        } catch (err) {
          console.error('[Canvas Ops] Error converting artboard to canvas instance:', err, artboard);
        }
      }
    });
    
    console.log('[Canvas Ops] Total layers converted:', canvasLayers.length);
    return canvasLayers;
  };

  // Form states for each operation
  const [initProjectId, setInitProjectId] = useState(projectId);
  
  const [applyOps, setApplyOps] = useState<string>('[\n  {\n    "op": "create",\n    "path": [0],\n    "node": {\n      "id": "new-btn",\n      "name": "New Button",\n      "type": "button",\n      "bounds": {"x": 100, "y": 300, "w": 150, "h": 44},\n      "fill": {"token": "color.primary"}\n    }\n  }\n]');
  const [applyProjectId, setApplyProjectId] = useState(projectId);
  
  const [getProjectId, setGetProjectId] = useState(projectId);
  
  const [createShapeData, setCreateShapeData] = useState({
    project_id: projectId,
    parent_path: [0],
    shape: {
      id: 'rect-1',
      name: 'Background',
      type: 'rect',
      bounds: { x: 0, y: 0, w: 400, h: 300 },
      fill: { hex: '#4CAF50' } // Green color
    } as Node
  });
  
  const [updateShapeData, setUpdateShapeData] = useState({
    project_id: projectId,
    node_id: '',
    updates: {
      bounds: { x: 50, y: 50, w: 400, h: 300 },
      fill: { hex: '#E0E0E0' }
    }
  });
  
  const [deleteShapeData, setDeleteShapeData] = useState({
    project_id: projectId,
    node_id: ''
  });
  
  const [bulkUpdateData, setBulkUpdateData] = useState<string>('[\n  {\n    "node_id": "btn-1",\n    "changes": {"text": "New Text"}\n  },\n  {\n    "node_id": "btn-2",\n    "changes": {"fill": {"hex": "#4CAF50"}}\n  }\n]');
  const [bulkUpdateProjectId, setBulkUpdateProjectId] = useState(projectId);

  
  useEffect(() => {
    if (projectId) {
      setInitProjectId(projectId);
      setApplyProjectId(projectId);
      setGetProjectId(projectId);
      setCreateShapeData(prev => ({ ...prev, project_id: projectId }));
      setUpdateShapeData(prev => ({ ...prev, project_id: projectId }));
      setDeleteShapeData(prev => ({ ...prev, project_id: projectId }));
      setBulkUpdateProjectId(projectId);
      setApproveDSData(prev => ({ ...prev, project_id: projectId }));
      setGetDSProjectId(projectId);
    }
  }, [projectId]);

  // Auto-fill Node ID when shape is selected
  useEffect(() => {
    if (selectedInstancesIds && selectedInstancesIds.length > 0) {
      const selectedId = selectedInstancesIds[0];
      
      if (activeTab === 'create') {
        const selectedInstance = getInstanceById(selectedId);
        if (selectedInstance && selectedInstance.type !== 'group') {
          const obj = selectedInstance.object as any;
          
          const x = obj?.x ?? 0;
          const y = obj?.y ?? 0;
          const w = obj?.width ?? 100;
          const h = obj?.height ?? 100;

          const newShape: any = {
            id: `${selectedInstance.type}-copy-${Date.now()}`,
            name: `${selectedInstance.name || selectedInstance.type} Copy`,
            type: selectedInstance.type,
            bounds: {
              x: Math.round(x + 20),
              y: Math.round(y + 20),
              w: Math.round(w),
              h: Math.round(h)
            }
          };

          if (obj?.fill) {
            newShape.fill = { hex: obj.fill };
          }
          if (obj?.stroke) {
            newShape.stroke = { 
              width: obj.strokeWidth || 1,
              hex: obj.stroke 
            };
          }
          if (obj?.text) {
            newShape.text = obj.text;
          }

          setCreateShapeData(prev => ({
          ...prev,
            shape: newShape as Node
        }));
          console.log('[Canvas Ops] Auto-filled Create Shape from selection:', selectedId, obj);
      }
      }
      
      if (activeTab === 'update') {
        const selectedInstance = getInstanceById(selectedId);
        const updates: any = {};
        
        if (selectedInstance && selectedInstance.type !== 'group') {
          const obj = selectedInstance.object as any;
          
          if (obj) {
            updates.bounds = {
              x: Math.round(obj.x ?? 0),
              y: Math.round(obj.y ?? 0),
              w: Math.round(obj.width ?? 100),
              h: Math.round(obj.height ?? 100)
            };
            
            if (obj.fill) {
              updates.fill = { hex: obj.fill };
            }
            if (obj.stroke) {
              updates.stroke = { 
                width: obj.strokeWidth || 1,
                hex: obj.stroke 
              };
            }
            if (obj.text) {
              updates.text = obj.text;
            }
          }
        }
        
        setUpdateShapeData({
          project_id: updateShapeData.project_id,
          node_id: selectedId,
          updates: Object.keys(updates).length > 0 ? updates : updateShapeData.updates
        });
        console.log('[Canvas Ops] Auto-filled Update Shape:', selectedId, updates);
      }
      
      if (activeTab === 'delete') {
        setDeleteShapeData(prev => ({
          ...prev,
          node_id: selectedId
        }));
        console.log('[Canvas Ops] Auto-filled Node ID for Delete Shape:', selectedId);
      }
    }
  }, [selectedInstancesIds, activeTab, getInstanceById]);

  useEffect(() => {
    if (activeTab === 'bulk' && selectedInstancesIds && selectedInstancesIds.length > 0) {
      const bulkUpdates: any[] = [];
      
      selectedInstancesIds.forEach(selectedId => {
        const selectedInstance = getInstanceById(selectedId);
        if (selectedInstance && selectedInstance.type !== 'group') {
          const obj = selectedInstance.object as any;
          
          if (obj) {
            const changes: any = {};
            
            const baseX = typeof obj.x === 'number' ? obj.x : 0;
            const baseY = typeof obj.y === 'number' ? obj.y : 0;
            const baseWidth = typeof obj.width === 'number' ? obj.width : 100;
            const baseHeight = typeof obj.height === 'number' ? obj.height : 100;
            
            const scaleX = typeof obj.scaleX === 'number' ? obj.scaleX : 1;
            const scaleY = typeof obj.scaleY === 'number' ? obj.scaleY : 1;
            
            const actualWidth = baseWidth * scaleX;
            const actualHeight = baseHeight * scaleY;
            
            changes.bounds = {
              x: Math.round(baseX),
              y: Math.round(baseY),
              w: Math.round(actualWidth),
              h: Math.round(actualHeight)
            };
            
            const fillColor = obj.fill;
            if (fillColor && typeof fillColor === 'string') {
              changes.fill = { hex: fillColor };
            }
            
            const strokeColor = obj.stroke;
            if (strokeColor && typeof strokeColor === 'string') {
              const strokeWidth = typeof obj.strokeWidth === 'number' ? obj.strokeWidth : 1;
              changes.stroke = { 
                width: strokeWidth,
                hex: strokeColor 
              };
            }
            
            const textValue = obj.text;
            if (textValue && typeof textValue === 'string') {
              changes.text = textValue;
            }
            
            bulkUpdates.push({
              node_id: selectedId,
              changes: changes
            });
            
            console.log('[Canvas Ops] Bulk shape:', selectedId, 'pos:', baseX, baseY, 'size:', actualWidth, 'x', actualHeight, 'scale:', scaleX, scaleY);
          }
        }
      });
      
      if (bulkUpdates.length > 0) {
        setBulkUpdateData(JSON.stringify(bulkUpdates, null, 2));
        console.log('[Canvas Ops] Bulk Update ready for', bulkUpdates.length, 'shapes');
      }
    }
  }, [selectedInstancesIds, activeTab, getInstanceById]);

  const [discoverDSData, setDiscoverDSData] = useState({
    project_id: projectId,
    brand_url: '',
    palette_hex: ['#0A66C2', '#111111', '#666666', '#F5F7FA', '#FFFFFF'],
    typefaces: ['Inter', 'Roboto'],
    tone: 'professional'
  });

  useEffect(() => {
    if (activeTab === 'ds-discover' && layers.length > 0) {
      const colorsSet = new Set<string>();
      const fontsSet = new Set<string>();
      
      const colorNameToHex: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'green': '#008000',
        'blue': '#0000FF',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'gray': '#808080',
        'grey': '#808080',
        'brown': '#A52A2A',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF'
      };
      
      const extractFromInstance = (instance: any, depth = 0) => {
        if (instance.type === 'group' && instance.children) {
          instance.children.forEach((child: any) => extractFromInstance(child, depth + 1));
          return;
        }
        
        const obj = instance.object as any;
        if (obj) {
          if (obj.fill && typeof obj.fill === 'string' && obj.fill !== 'transparent') {
            let hexColor = obj.fill;
            if (!hexColor.startsWith('#')) {
              hexColor = colorNameToHex[hexColor.toLowerCase()] || null;
            }
            if (hexColor && hexColor.startsWith('#')) {
              colorsSet.add(hexColor.toUpperCase());
            }
          }
          
          if (obj.stroke && typeof obj.stroke === 'string' && obj.stroke !== 'transparent') {
            let hexColor = obj.stroke;
            if (!hexColor.startsWith('#')) {
              hexColor = colorNameToHex[hexColor.toLowerCase()] || null;
            }
            if (hexColor && hexColor.startsWith('#')) {
              colorsSet.add(hexColor.toUpperCase());
            }
          }
          
          if (obj.fontFamily && typeof obj.fontFamily === 'string') {
            fontsSet.add(obj.fontFamily);
          }
        }
      };
      
      layers.forEach((layer: any) => extractFromInstance(layer));
      
      const detectedColors = Array.from(colorsSet).slice(0, 10);
      const detectedFonts = Array.from(fontsSet).slice(0, 5);
      
      console.log('[DS Discover] Detected:', detectedColors.length, 'colors,', detectedFonts.length, 'fonts');
      
      if (detectedColors.length > 0 || detectedFonts.length > 0) {
        setDiscoverDSData(prev => ({
          ...prev,
          palette_hex: detectedColors.length > 0 ? detectedColors : prev.palette_hex,
          typefaces: detectedFonts.length > 0 ? detectedFonts : prev.typefaces
        }));
      }
    }
  }, [activeTab, layers]);

  const [proposeDSData, setProposeDSData] = useState({
    project_id: projectId,
    base: 'material3',
    palette_hex: ['#0A66C2', '#111111', '#FFFFFF'],
    typefaces: ['Inter'],
    tone: 'clean'
  });

  useEffect(() => {
    if (activeTab === 'ds-propose' && layers.length > 0) {
      const colorsSet = new Set<string>();
      const fontsSet = new Set<string>();
      
      const colorNameToHex: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'green': '#008000',
        'blue': '#0000FF',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'gray': '#808080',
        'grey': '#808080',
        'brown': '#A52A2A',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF'
      };
      
      const extractFromInstance = (instance: any) => {
        if (instance.type === 'group' && instance.children) {
          instance.children.forEach(extractFromInstance);
          return;
        }
        
        const obj = instance.object as any;
        if (obj) {
          if (obj.fill && typeof obj.fill === 'string' && obj.fill !== 'transparent') {
            let hexColor = obj.fill;
            if (!hexColor.startsWith('#')) {
              hexColor = colorNameToHex[hexColor.toLowerCase()] || null;
            }
            if (hexColor && hexColor.startsWith('#')) {
              colorsSet.add(hexColor.toUpperCase());
            }
          }
          
          if (obj.stroke && typeof obj.stroke === 'string' && obj.stroke !== 'transparent') {
            let hexColor = obj.stroke;
            if (!hexColor.startsWith('#')) {
              hexColor = colorNameToHex[hexColor.toLowerCase()] || null;
            }
            if (hexColor && hexColor.startsWith('#')) {
              colorsSet.add(hexColor.toUpperCase());
            }
          }
          
          if (obj.fontFamily && typeof obj.fontFamily === 'string') {
            fontsSet.add(obj.fontFamily);
          }
        }
      };
      
      layers.forEach(extractFromInstance);
      
      const detectedColors = Array.from(colorsSet).slice(0, 10);
      const detectedFonts = Array.from(fontsSet).slice(0, 5);
      
      console.log('[DS Propose] Detected:', detectedColors.length, 'colors,', detectedFonts.length, 'fonts');
      
      if (detectedColors.length > 0 || detectedFonts.length > 0) {
        setProposeDSData(prev => ({
          ...prev,
          palette_hex: detectedColors.length > 0 ? detectedColors : prev.palette_hex,
          typefaces: detectedFonts.length > 0 ? detectedFonts : prev.typefaces
        }));
      }
    }
  }, [activeTab, layers]);

  const [approveDSData, setApproveDSData] = useState({
    project_id: projectId,
    approve_palette: true,
    approve_tokens: true,
    approve_typography: true
  });

  const [getDSProjectId, setGetDSProjectId] = useState(projectId);

  // Helper function to extract error message from various error formats
  const extractErrorMessage = (err: any): string => {
    if (!err) return 'An unknown error occurred';
    
    // Check for FastAPI validation errors (array format)
    if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
      const details = err.response.data.detail;
      return details.map((d: any) => {
        if (typeof d === 'string') return d;
        if (d.msg) return `${d.loc?.join('.') || 'field'}: ${d.msg}`;
        return JSON.stringify(d);
      }).join('\n');
    }
    
    // Check for simple error message
    if (err.response?.data?.error) {
      return typeof err.response.data.error === 'string' 
        ? err.response.data.error 
        : JSON.stringify(err.response.data.error);
    }
    
    // Check for detail string
    if (err.response?.data?.detail) {
      return typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : JSON.stringify(err.response.data.detail);
    }
    
    // Check for message
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    // Fallback to error message
    if (err.message) {
      return err.message;
    }
    
    // Last resort
    return typeof err === 'string' ? err : JSON.stringify(err);
  };

  // Helper function to format error for display
  const formatErrorForDisplay = (error: string | null): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return JSON.stringify(error, null, 2);
  };

  const handleInitCanvas = async () => {
    if (!initProjectId) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.initCanvas(initProjectId);
      setResponse(result);
      
      // Convert FastAPI response to canvas layers
      const canvasLayers = convertArtboardsToLayers(result.artboards || []);
      
      if (canvasLayers.length > 0) {
        console.log('[Canvas Ops] ✓ Initializing canvas with', canvasLayers.length, 'layers');
        console.log('[Canvas Ops] Layer IDs:', canvasLayers.map(l => l.id).join(', '));
        
        // Clear existing canvas first
        useCanvasLayersStore.setState({ layers: [] });
        
        // Set new layers
        useCanvasLayersStore.setState({ 
          layers: canvasLayers,
          isAIGenerated: true 
        });
        
        // Force multiple redraws to ensure rendering
        forceCanvasRedraw();
        setTimeout(() => {
          forceCanvasRedraw();
        }, 200);
        setTimeout(() => {
          forceCanvasRedraw();
        }, 500);
        
        // Reset AI flag after delay
        setTimeout(() => {
          useCanvasLayersStore.setState({ isAIGenerated: false });
          console.log('[Canvas Ops] ✓ Canvas initialization complete');
        }, 3000);
      } else {
        console.warn('[Canvas Ops] ✗ No layers found in init response');
        console.warn('[Canvas Ops] Response structure:', JSON.stringify(result, null, 2));
        showToast.warning('Canvas initialized but no shapes found to display');
      }
      
      showToast.success('Canvas initialized successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to initialize canvas';
      setError(errorMsg);
      // Check if error is about design system approval
      if (errorMsg.toLowerCase().includes('design system') && errorMsg.toLowerCase().includes('approved')) {
        showToast.error('Design system must be approved first. Please go to "Approve DS" tab.');
        setTimeout(() => setActiveTab('ds-approve'), 1000);
      } else {
        const toastMsg = errorMsg.split('\n')[0];
        showToast.error(toastMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCanvas = async () => {
    if (!applyProjectId || !applyOps) {
      showToast.error('Project ID and operations are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const ops = JSON.parse(applyOps);
      const result = await designAIService.applyCanvas({
        project_id: applyProjectId,
        ops
      });
      setResponse(result);
      
      // Apply operations to canvas
      const artboards = result.doc?.artboards || result.artboards || [];
      const canvasLayers = convertArtboardsToLayers(artboards);
      
      if (canvasLayers.length > 0) {
        console.log('[Canvas Ops] Applying operations, updating canvas with', canvasLayers.length, 'layers');
        useCanvasLayersStore.setState({ 
          layers: canvasLayers,
          isAIGenerated: true 
        });
        forceCanvasRedraw();
        setTimeout(() => {
          useCanvasLayersStore.setState({ isAIGenerated: false });
        }, 3000);
      } else {
        console.warn('[Canvas Ops] No layers found in apply response');
      }
      
      showToast.success('Canvas operations applied successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to apply canvas operations';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCanvas = async () => {
    if (!getProjectId) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.getCanvas(getProjectId);
      setResponse(result);
      
      // Load canvas state to canvas
      const canvasLayers = convertArtboardsToLayers(result.artboards || []);
      
      if (canvasLayers.length > 0) {
        console.log('[Canvas Ops] Loading canvas state with', canvasLayers.length, 'layers');
        useCanvasLayersStore.setState({ 
          layers: canvasLayers,
          isAIGenerated: true 
        });
        forceCanvasRedraw();
        setTimeout(() => {
          useCanvasLayersStore.setState({ isAIGenerated: false });
        }, 3000);
      } else {
        console.warn('[Canvas Ops] No layers found in get canvas response');
      }
      
      showToast.success('Canvas state retrieved successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to get canvas state';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShape = async () => {
    if (!createShapeData.project_id || !createShapeData.parent_path || !createShapeData.shape) {
      showToast.error('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('[Canvas Ops] Creating shape:', createShapeData.shape.id, createShapeData.shape.type);
      const result = await designAIService.createShape(createShapeData);
      setResponse(result);
      console.log('[Canvas Ops] Create shape response:', result);
      
      // Add shape to canvas - check multiple response formats
      let shapeAdded = false;
      let addedCanvasInstance: any = null;
      
      // Format 1: Direct node/shape in response
      if (result.node || result.shape || result.created_node) {
        try {
          const node = result.node || result.shape || result.created_node;
          console.log('[Canvas Ops] Found shape in direct response:', node.id, node.type);
          const canvasInstance = convertNodeToCanvasInstance(node);
          
          if (canvasInstance && canvasInstance.id) {
            console.log('[Canvas Ops] ✓ Adding shape to canvas (direct):', canvasInstance.id, canvasInstance.type);
            addInstance(canvasInstance, null);
            addedCanvasInstance = canvasInstance;
            shapeAdded = true;
          }
        } catch (err) {
          console.error('[Canvas Ops] ✗ Error adding shape to canvas (direct):', err);
        }
      }
      
      // Format 2: Shape in result.artboards (similar to init canvas response)
      if (!shapeAdded && result.artboards && Array.isArray(result.artboards)) {
        try {
          console.log('[Canvas Ops] Checking artboards array:', result.artboards.length);
          // Extract all children from artboards
          result.artboards.forEach((artboard: any, artboardIndex: number) => {
            if (artboard.children && Array.isArray(artboard.children)) {
              artboard.children.forEach((child: Node, childIndex: number) => {
                // Check if this is the shape we just created (by ID)
                const expectedId = createShapeData.shape.id || result.shape_id;
                if (child.id === expectedId || !expectedId) {
                  try {
                    console.log(`[Canvas Ops] Found matching child in artboard ${artboardIndex + 1}, child ${childIndex + 1}:`, child.id, child.type);
                    const canvasInstance = convertNodeToCanvasInstance(child);
                    if (canvasInstance && canvasInstance.id) {
                      console.log('[Canvas Ops] ✓ Adding shape to canvas (from artboards):', canvasInstance.id, canvasInstance.type);
                      addInstance(canvasInstance, null);
                      addedCanvasInstance = canvasInstance;
                      shapeAdded = true;
                    }
                  } catch (err) {
                    console.error('[Canvas Ops] ✗ Error converting shape from artboards:', err);
                  }
                }
              });
            }
          });
        } catch (err) {
          console.error('[Canvas Ops] ✗ Error processing artboards:', err);
        }
      }
      
      // Format 3: Shape in doc.artboards (from response structure) - PRIORITY FORMAT
      if (!shapeAdded && result.doc && result.doc.artboards) {
        try {
          const artboards = result.doc.artboards;
          console.log('[Canvas Ops] Checking doc.artboards:', artboards.length);
          // Prioritize result.shape_id (from API response) over createShapeData.shape.id
          const expectedShapeId = result.shape_id || createShapeData.shape.id;
          console.log('[Canvas Ops] Looking for shape ID:', expectedShapeId);
          console.log('[Canvas Ops] Response shape_id:', result.shape_id);
          console.log('[Canvas Ops] Request shape id:', createShapeData.shape.id);
          
          // Find the newly created shape in artboards
          artboards.forEach((artboard: any, artboardIndex: number) => {
            if (artboard.children && Array.isArray(artboard.children)) {
              console.log(`[Canvas Ops] Artboard ${artboardIndex + 1} has ${artboard.children.length} children`);
              
              // Find all children matching the expected ID
              const matchingChildren = artboard.children.filter((child: Node) => 
                child.id === expectedShapeId
              );
              
              console.log(`[Canvas Ops] Found ${matchingChildren.length} matching children with ID: ${expectedShapeId}`);
              
              if (matchingChildren.length > 0) {
                // Use the LAST matching child (newly created one is usually at the end)
                const child = matchingChildren[matchingChildren.length - 1];
                console.log(`[Canvas Ops] Using last matching child:`, child.id, child.type, child.name, 'bounds:', child.bounds);
                
                try {
                  const canvasInstance = convertNodeToCanvasInstance(child);
                  if (canvasInstance && canvasInstance.id) {
                    console.log('[Canvas Ops] ✓ Adding shape to canvas (from doc.artboards):', canvasInstance.id, canvasInstance.type);
                    if (canvasInstance.type === 'rectangle') {
                      const rect = canvasInstance as CanvasRectInstance;
                      console.log('[Canvas Ops] Shape bounds:', rect.object.x, rect.object.y, rect.object.width, rect.object.height);
                      console.log('[Canvas Ops] Shape fill:', rect.object.fill);
                    }
                    addInstance(canvasInstance, null);
                    addedCanvasInstance = canvasInstance;
                    shapeAdded = true;
                  } else {
                    console.warn('[Canvas Ops] ✗ Converted instance is invalid:', canvasInstance);
                  }
                } catch (err) {
                  console.error('[Canvas Ops] ✗ Error converting shape from doc:', err, child);
                }
              } else {
                // If no exact match, try to find by type and bounds match
                console.log('[Canvas Ops] No exact ID match, trying to find by type and bounds...');
                const shapeType = createShapeData.shape.type;
                const shapeBounds = createShapeData.shape.bounds;
                
                artboard.children.forEach((child: Node, childIndex: number) => {
                  if (child.type === shapeType && 
                      child.bounds?.x === shapeBounds?.x &&
                      child.bounds?.y === shapeBounds?.y &&
                      child.bounds?.w === shapeBounds?.w &&
                      child.bounds?.h === shapeBounds?.h) {
                    console.log(`[Canvas Ops] Found shape by bounds match at child ${childIndex + 1}:`, child.id, child.type);
                    try {
                      const canvasInstance = convertNodeToCanvasInstance(child);
                      if (canvasInstance && canvasInstance.id) {
                        console.log('[Canvas Ops] ✓ Adding shape to canvas (from doc.artboards by bounds):', canvasInstance.id, canvasInstance.type);
                        addInstance(canvasInstance, null);
                        addedCanvasInstance = canvasInstance;
                        shapeAdded = true;
                      }
                    } catch (err) {
                      console.error('[Canvas Ops] ✗ Error converting shape from doc (bounds match):', err);
                    }
                  }
                });
              }
            }
          });
        } catch (err) {
          console.error('[Canvas Ops] ✗ Error processing doc.artboards:', err);
        }
      }
      
      // Format 4: Use the shape_id to find in current canvas or add the original shape
      if (!shapeAdded && result.shape_id) {
        try {
          // Use the shape data we sent (it should match what was created)
          const canvasInstance = convertNodeToCanvasInstance(createShapeData.shape);
          if (canvasInstance && canvasInstance.id) {
            console.log('[Canvas Ops] ✓ Adding shape to canvas (using shape_id):', result.shape_id, canvasInstance.type);
            addInstance(canvasInstance, null);
            addedCanvasInstance = canvasInstance;
            shapeAdded = true;
          }
        } catch (err) {
          console.error('[Canvas Ops] ✗ Error adding shape using shape_id:', err);
        }
      }
      
      // Format 5: If still not added, try using the original shape data
      if (!shapeAdded) {
        try {
          const canvasInstance = convertNodeToCanvasInstance(createShapeData.shape);
          if (canvasInstance && canvasInstance.id) {
            console.log('[Canvas Ops] ✓ Adding shape to canvas (using original shape data):', canvasInstance.id, canvasInstance.type);
            addInstance(canvasInstance, null);
            addedCanvasInstance = canvasInstance;
            shapeAdded = true;
          }
        } catch (err) {
          console.error('[Canvas Ops] ✗ Error adding original shape:', err);
        }
      }
      
      if (shapeAdded && addedCanvasInstance) {
        console.log('[Canvas Ops] ✓ Shape successfully added to canvas:', addedCanvasInstance.id);
        setAIGenerated(true);
        
        // Force multiple redraws to ensure rendering
        forceCanvasRedraw();
        setTimeout(() => {
          forceCanvasRedraw();
        }, 200);
        setTimeout(() => {
          forceCanvasRedraw();
        }, 500);
        
        // Reset AI flag after delay
        setTimeout(() => {
          setAIGenerated(false);
          console.log('[Canvas Ops] ✓ Create shape complete');
        }, 3000);
        
        showToast.success(`Shape "${addedCanvasInstance.name || addedCanvasInstance.id}" created successfully`);
      } else {
        console.warn('[Canvas Ops] ✗ Could not add shape to canvas from response');
        console.warn('[Canvas Ops] Response structure:', JSON.stringify(result, null, 2));
        showToast.warning('Shape created but could not be added to canvas. Check console for details.');
      }
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to create shape';
      setError(errorMsg);
      console.error('[Canvas Ops] ✗ Create shape error:', errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShape = async () => {
    if (!updateShapeData.project_id) {
      showToast.error('Project ID is required');
      return;
    }
    if (!updateShapeData.node_id) {
      showToast.error('Node ID is required');
      return;
    }
    if (!updateShapeData.updates || Object.keys(updateShapeData.updates).length === 0) {
      showToast.error('Updates object is required and cannot be empty');
      return;
    }

    // Check if node exists in canvas before making API call
    const existingInstance = useCanvasLayersStore.getState().getInstanceById(updateShapeData.node_id);
    if (!existingInstance) {
      const errorMsg = `Node "${updateShapeData.node_id}" not found in canvas. Please select an instance on canvas and use "Use Selected" button, or enter a valid node ID.`;
      setError(errorMsg);
      showToast.error(`Node "${updateShapeData.node_id}" not found in canvas`);
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.updateShape(updateShapeData);
      setResponse(result);
      
      // Update shape on canvas if response contains updated node
      if (result.node || result.updated_node || result.updated) {
        try {
          const node = result.node || result.updated_node || result.updated;
          const canvasInstance = convertNodeToCanvasInstanceForEdit(node);
          
          // Find instance by node_id
          const existingInstance = useCanvasLayersStore.getState().getInstanceById(updateShapeData.node_id);
          
          if (existingInstance) {
            console.log('[Canvas Ops] Updating shape on canvas:', updateShapeData.node_id);
            updateInstance(updateShapeData.node_id, () => canvasInstance);
            setAIGenerated(true);
            forceCanvasRedraw();
            setTimeout(() => {
              setAIGenerated(false);
            }, 2000);
          } else {
            console.warn('[Canvas Ops] Instance not found for update:', updateShapeData.node_id);
            // If not found, try to add it
            addInstance(canvasInstance, null);
            setAIGenerated(true);
            forceCanvasRedraw();
            setTimeout(() => {
              setAIGenerated(false);
            }, 2000);
          }
        } catch (err) {
          console.error('Error updating shape on canvas:', err);
        }
      } else {
        console.warn('[Canvas Ops] No updated node in response');
      }
      
      // Also update canvas even if API response doesn't have node (update from updates object)
      try {
        const existingInstance = useCanvasLayersStore.getState().getInstanceById(updateShapeData.node_id);
        if (existingInstance && updateShapeData.updates) {
          updateInstance(updateShapeData.node_id, (instance) => {
            // Apply updates from the updates object
            if (updateShapeData.updates.bounds) {
              if (instance.type === 'rectangle' || instance.type === 'text') {
                const obj = (instance as any).object;
                if (obj) {
                  obj.x = updateShapeData.updates.bounds.x ?? obj.x;
                  obj.y = updateShapeData.updates.bounds.y ?? obj.y;
                  obj.width = updateShapeData.updates.bounds.w ?? obj.width;
                  obj.height = updateShapeData.updates.bounds.h ?? obj.height;
                }
              }
            }
            if (updateShapeData.updates.fill) {
              const obj = (instance as any).object;
              if (obj) {
                const fillValue = typeof updateShapeData.updates.fill === 'string' 
                  ? updateShapeData.updates.fill 
                  : (updateShapeData.updates.fill.hex || updateShapeData.updates.fill.color || obj.fill);
                obj.fill = fillValue;
              }
            }
            return instance;
          });
          setAIGenerated(true);
          forceCanvasRedraw();
          setTimeout(() => {
            setAIGenerated(false);
          }, 2000);
        }
      } catch (err) {
        console.error('Error applying updates to canvas:', err);
      }
      
      showToast.success('Shape updated successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to update shape';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShape = async () => {
    if (!deleteShapeData.project_id || !deleteShapeData.node_id) {
      showToast.error('Project ID and Node ID are required');
      return;
    }

    // Check if node exists in canvas before making API call
    const existingInstance = useCanvasLayersStore.getState().getInstanceById(deleteShapeData.node_id);
    if (!existingInstance) {
      const errorMsg = `Node "${deleteShapeData.node_id}" not found in canvas. Please select an instance on canvas and use "Use Selected" button, or enter a valid node ID.`;
      setError(errorMsg);
      showToast.error(`Node "${deleteShapeData.node_id}" not found in canvas`);
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.deleteShape(deleteShapeData);
      setResponse(result);
      
      // Delete shape from canvas
      try {
        const existingInstance = useCanvasLayersStore.getState().getInstanceById(deleteShapeData.node_id);
        if (existingInstance) {
          console.log('[Canvas Ops] Deleting shape from canvas:', deleteShapeData.node_id);
          deleteInstance(deleteShapeData.node_id);
          setAIGenerated(true);
          forceCanvasRedraw();
          setTimeout(() => {
            setAIGenerated(false);
          }, 2000);
        } else {
          console.warn('[Canvas Ops] Instance not found for deletion:', deleteShapeData.node_id);
        }
      } catch (err) {
        console.error('Error deleting shape from canvas:', err);
      }
      
      showToast.success('Shape deleted successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to delete shape';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUpdateProjectId || !bulkUpdateData) {
      showToast.error('Project ID and updates are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const updates = JSON.parse(bulkUpdateData);
      console.log('[Canvas Ops] Starting bulk update for', updates.length, 'shapes');
      const result = await designAIService.bulkUpdate(bulkUpdateProjectId, updates);
      setResponse(result);
      console.log('[Canvas Ops] Bulk update response:', result);
      
      let updatedCount = 0;
      
      // Get all current canvas instance IDs for debugging
      const currentCanvasIds = layers.map(l => l.id);
      console.log('[Canvas Ops] Current canvas instance IDs:', currentCanvasIds);
      console.log('[Canvas Ops] Requested update IDs:', updates.map((u: any) => u.node_id));
      
      // Method 1: Update from response doc.artboards (PRIORITY - most accurate)
      if (result.doc && result.doc.artboards && Array.isArray(result.doc.artboards)) {
        console.log('[Canvas Ops] Updating from response artboards:', result.doc.artboards.length);
        
        // Extract all requested node IDs
        const requestedNodeIds = updates.map((u: any) => u.node_id).filter(Boolean);
        console.log('[Canvas Ops] Requested node IDs:', requestedNodeIds);
        
        result.doc.artboards.forEach((artboard: any, artboardIndex: number) => {
          if (artboard.children && Array.isArray(artboard.children)) {
            console.log(`[Canvas Ops] Artboard ${artboardIndex + 1} has ${artboard.children.length} children`);
            
            // Process ALL children from response to show on canvas
            // This ensures all shapes from response are displayed on canvas
            artboard.children.forEach((child: Node, childIndex: number) => {
              // Check if this child ID was requested in updates
              const wasRequested = requestedNodeIds.includes(child.id);
              const existingInstance = useCanvasLayersStore.getState().getInstanceById(child.id);
              
              console.log(`[Canvas Ops] Processing child ${childIndex + 1}:`, {
                id: child.id,
                type: child.type,
                name: child.name,
                wasRequested,
                existsInCanvas: !!existingInstance,
                bounds: child.bounds,
                fill: child.fill
              });
              
              // Process ALL children from response to show on canvas
              // Update if exists, add if doesn't exist
              try {
                // Convert response node to canvas instance
                const updatedCanvasInstance = convertNodeToCanvasInstanceForEdit(child);
                
                if (!updatedCanvasInstance || !updatedCanvasInstance.id) {
                  console.warn('[Canvas Ops] ✗ Failed to convert child to canvas instance:', child.id);
                  return;
                }
                
                if (existingInstance) {
                  // Update existing instance - use a new object reference to force React re-render
                  console.log('[Canvas Ops] ✓ Updating existing instance from response:', child.id, child.type);
                  console.log('[Canvas Ops] Old fill:', (existingInstance as any).object?.fill);
                  console.log('[Canvas Ops] New fill:', (updatedCanvasInstance as any).object?.fill);
                  
                  // Force update by creating completely new instance
                  updateInstance(child.id, () => {
                    // Return a completely new object to ensure React detects the change
                    const cloned = JSON.parse(JSON.stringify(updatedCanvasInstance));
                    console.log('[Canvas Ops] Cloned instance fill:', (cloned as any).object?.fill);
                    return cloned;
                  });
                  updatedCount++;
                } else {
                  // Add new instance from response to canvas (even if not requested)
                  // This ensures all shapes from response are visible on canvas
                  console.log('[Canvas Ops] ✓ Adding new instance from response to canvas:', child.id, child.type);
                  addInstance(updatedCanvasInstance, null);
                  updatedCount++;
                }
              } catch (err) {
                console.error('[Canvas Ops] ✗ Error processing child from response:', err, child);
              }
            });
          }
        });
      }
      
      // Method 2: Apply updates directly from request (fallback if response doesn't have artboards or no matches)
      if (updatedCount === 0 && Array.isArray(updates)) {
        console.log('[Canvas Ops] Applying bulk updates directly from request to', updates.length, 'shapes');
        console.log('[Canvas Ops] Available canvas IDs:', currentCanvasIds);
        
        updates.forEach((update: any, index: number) => {
          if (update.node_id && update.changes) {
            try {
              const existingInstance = useCanvasLayersStore.getState().getInstanceById(update.node_id);
              if (existingInstance) {
                console.log(`[Canvas Ops] ✓ Applying changes to existing instance ${index + 1}:`, update.node_id);
                // Convert changes to canvas instance format
                updateInstance(update.node_id, (instance) => {
                  // Apply changes based on update structure
                  if (update.changes.bounds) {
                    if (instance.type === 'rectangle' || instance.type === 'text') {
                      const obj = (instance as any).object;
                      if (obj) {
                        obj.x = update.changes.bounds.x ?? obj.x;
                        obj.y = update.changes.bounds.y ?? obj.y;
                        obj.width = update.changes.bounds.w ?? obj.width;
                        obj.height = update.changes.bounds.h ?? obj.height;
                      }
                    }
                  }
                  if (update.changes.fill) {
                    const obj = (instance as any).object;
                    if (obj) {
                      const fillValue = typeof update.changes.fill === 'string' 
                        ? update.changes.fill 
                        : (update.changes.fill.hex || update.changes.fill.color || obj.fill);
                      obj.fill = fillValue;
                      console.log('[Canvas Ops] Updated fill to:', fillValue);
                    }
                  }
                  if (update.changes.text !== undefined) {
                    const obj = (instance as any).object;
                    if (obj && instance.type === 'text') {
                      obj.text = update.changes.text;
                      console.log('[Canvas Ops] Updated text to:', update.changes.text);
                    }
                  }
                  return instance;
                });
                updatedCount++;
              } else {
                console.warn(`[Canvas Ops] ✗ Instance "${update.node_id}" not found in canvas. Available IDs:`, currentCanvasIds);
              }
            } catch (err) {
              console.error('[Canvas Ops] ✗ Error updating instance in bulk update:', err, update);
            }
          } else {
            console.warn(`[Canvas Ops] ✗ Invalid update ${index + 1}:`, update);
          }
        });
      }
      
      if (updatedCount > 0) {
        console.log('[Canvas Ops] ✓ Successfully updated', updatedCount, 'shapes on canvas');
        
        // Force state update to trigger React re-render
        // Get fresh layers after all updates
        const updatedLayers = useCanvasLayersStore.getState().layers;
        console.log('[Canvas Ops] Current layers count:', updatedLayers.length);
        console.log('[Canvas Ops] Layer IDs:', updatedLayers.map(l => l.id));
        
        // Create completely new array with deep clone to force React re-render
        const newLayers = updatedLayers.map(layer => JSON.parse(JSON.stringify(layer)));
        useCanvasLayersStore.setState({ 
          layers: newLayers, // New array reference
          isAIGenerated: true 
        });
        
        console.log('[Canvas Ops] State updated, forcing redraws...');
        
        // Force multiple redraws to ensure rendering
        forceCanvasRedraw();
        setTimeout(() => {
          // Force another state update to ensure React picks up changes
          const freshLayers = useCanvasLayersStore.getState().layers;
          useCanvasLayersStore.setState({ 
            layers: freshLayers.map(l => JSON.parse(JSON.stringify(l)))
          });
          forceCanvasRedraw();
          console.log('[Canvas Ops] First redraw complete');
        }, 200);
        setTimeout(() => {
          forceCanvasRedraw();
          console.log('[Canvas Ops] Second redraw complete');
        }, 500);
        setTimeout(() => {
          forceCanvasRedraw();
          console.log('[Canvas Ops] Third redraw complete');
        }, 1000);
        
        // Reset AI flag after delay
        setTimeout(() => {
          useCanvasLayersStore.setState({ isAIGenerated: false });
          console.log('[Canvas Ops] ✓ Bulk update complete - all shapes should be visible now');
        }, 3000);
        
        showToast.success(`Bulk update completed: ${updatedCount} shape(s) updated on canvas`);
      } else {
        const requestedIds = updates.map((u: any) => u.node_id).filter(Boolean);
        const missingIds = requestedIds.filter(id => !currentCanvasIds.includes(id));
        console.warn('[Canvas Ops] ✗ No shapes were updated on canvas');
        console.warn('[Canvas Ops] Requested IDs:', requestedIds);
        console.warn('[Canvas Ops] Available canvas IDs:', currentCanvasIds);
        console.warn('[Canvas Ops] Missing IDs:', missingIds);
        
        if (missingIds.length > 0) {
          showToast.warning(`Bulk update: Node IDs not found on canvas: ${missingIds.join(', ')}. Available IDs: ${currentCanvasIds.slice(0, 5).join(', ')}${currentCanvasIds.length > 5 ? '...' : ''}`);
        } else {
          showToast.warning('Bulk update completed but no shapes were found to update. Check console for details.');
        }
      }
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to perform bulk update';
      setError(errorMsg);
      console.error('[Canvas Ops] ✗ Bulk update error:', errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  // Design System handlers
  const handleDiscoverDS = async () => {
    if (!discoverDSData.project_id) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.discoverDesignSystem(discoverDSData);
      setResponse(result);
      showToast.success('Design system discovered successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to discover design system';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeDS = async () => {
    if (!proposeDSData.project_id) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.proposeDesignSystem(proposeDSData);
      setResponse(result);
      showToast.success('Design system proposed successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to propose design system';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDS = async () => {
    if (!approveDSData.project_id) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.approveDesignSystem(approveDSData);
      setResponse(result);
      showToast.success('Design system approved successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to approve design system';
      setError(errorMsg);
      // Check if error is about DS not being proposed
      if (errorMsg.toLowerCase().includes('no ds proposed') || errorMsg.toLowerCase().includes('proposed')) {
        showToast.error('Design system must be proposed first. Please go to "Propose DS" tab.');
        // Auto-switch to propose DS tab
        setTimeout(() => setActiveTab('ds-propose'), 1000);
      } else {
        const toastMsg = errorMsg.split('\n')[0];
        showToast.error(toastMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetDS = async () => {
    if (!getDSProjectId) {
      showToast.error('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await designAIService.getDesignSystem(getDSProjectId);
      setResponse(result);
      showToast.success('Design system retrieved successfully');
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err) || 'Failed to get design system';
      setError(errorMsg);
      const toastMsg = errorMsg.split('\n')[0];
      showToast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'init', label: 'Init Canvas', icon: Rocket },
    { id: 'apply', label: 'Apply Ops', icon: Zap },
    { id: 'get', label: 'Get Canvas', icon: Download },
    { id: 'create', label: 'Create Shape', icon: Plus },
    { id: 'update', label: 'Update Shape', icon: Edit },
    { id: 'delete', label: 'Delete Shape', icon: Trash2 },
    { id: 'bulk', label: 'Bulk Update', icon: Package },
    { id: 'ds-discover', label: 'Discover DS', icon: Search },
    { id: 'ds-propose', label: 'Propose DS', icon: Lightbulb },
    { id: 'ds-approve', label: 'Approve DS', icon: CheckCircle2 },
    { id: 'ds-get', label: 'Get DS', icon: FileText },
  ];

  return (
    <>
      <style jsx>{`
        .canvas-ops-tabs-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .canvas-ops-tabs-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .canvas-ops-tabs-scrollbar::-webkit-scrollbar-thumb {
          background-color: #D1D5DB;
          border-radius: 2px;
        }
        .canvas-ops-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9CA3AF;
        }
      `}</style>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Canvas Operations</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-gray-200 overflow-x-auto canvas-ops-tabs-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB transparent'
          }}
        >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <IconComponent size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Init Canvas */}
        {activeTab === 'init' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={initProjectId}
                onChange={(e) => setInitProjectId(e.target.value)}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleInitCanvas}
              disabled={loading || !initProjectId}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Initializing...' : 'Initialize Canvas'}
            </button>
          </div>
        )}

        {/* Apply Canvas */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={applyProjectId}
                onChange={(e) => setApplyProjectId(e.target.value)}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operations (JSON Array)
              </label>
              <textarea
                value={applyOps}
                onChange={(e) => setApplyOps(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder='[{"op": "create", "path": [0], "node": {...}}]'
              />
            </div>
            <button
              onClick={handleApplyCanvas}
              disabled={loading || !applyProjectId || !applyOps}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Applying...' : 'Apply Operations'}
            </button>
          </div>
        )}

        {/* Get Canvas */}
        {activeTab === 'get' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={getProjectId}
                onChange={(e) => setGetProjectId(e.target.value)}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleGetCanvas}
              disabled={loading || !getProjectId}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Get Canvas State'}
            </button>
          </div>
        )}

        {/* Create Shape */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={createShapeData.project_id}
                onChange={(e) => setCreateShapeData({ ...createShapeData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Path (JSON Array)
              </label>
              <input
                type="text"
                value={JSON.stringify(createShapeData.parent_path)}
                onChange={(e) => {
                  try {
                    const path = JSON.parse(e.target.value);
                    setCreateShapeData({ ...createShapeData, parent_path: path });
                  } catch {}
                }}
                placeholder="[0]"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shape (JSON Object)
                {selectedInstancesIds && selectedInstancesIds.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-filled from: {selectedInstancesIds[0]}
                  </span>
                )}
              </label>
              <textarea
                value={JSON.stringify(createShapeData.shape, null, 2)}
                onChange={(e) => {
                  try {
                    const shape = JSON.parse(e.target.value);
                    setCreateShapeData({ ...createShapeData, shape });
                  } catch {}
                }}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <button
              onClick={handleCreateShape}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Shape'}
            </button>
          </div>
        )}

        {/* Update Shape */}
        {activeTab === 'update' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={updateShapeData.project_id}
                onChange={(e) => setUpdateShapeData({ ...updateShapeData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node ID
                {selectedInstancesIds && selectedInstancesIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateShapeData({
                        ...updateShapeData,
                        node_id: selectedInstancesIds[0]
                      });
                    }}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    (Use Selected: {selectedInstancesIds[0]})
                  </button>
                )}
              </label>
              <input
                type="text"
                value={updateShapeData.node_id}
                onChange={(e) => setUpdateShapeData({ ...updateShapeData, node_id: e.target.value })}
                placeholder={selectedInstancesIds && selectedInstancesIds.length > 0 ? "Click 'Use Selected' button above" : "Select a shape on canvas first"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updates (JSON Object)
                {selectedInstancesIds && selectedInstancesIds.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-filled from: {selectedInstancesIds[0]}
                  </span>
                )}
              </label>
              <textarea
                value={JSON.stringify(updateShapeData.updates, null, 2)}
                onChange={(e) => {
                  try {
                    const updates = JSON.parse(e.target.value);
                    setUpdateShapeData({ ...updateShapeData, updates });
                  } catch {}
                }}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <button
              onClick={handleUpdateShape}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Shape'}
            </button>
          </div>
        )}

        {/* Delete Shape */}
        {activeTab === 'delete' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={deleteShapeData.project_id}
                onChange={(e) => setDeleteShapeData({ ...deleteShapeData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node ID
                {selectedInstancesIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const selectedId = selectedInstancesIds[0];
                      if (selectedId) {
                        setDeleteShapeData({ ...deleteShapeData, node_id: selectedId });
                        showToast.success(`Using selected instance: ${selectedId}`);
                      }
                    }}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    title={`Use selected instance ID: ${selectedInstancesIds[0]}`}
                  >
                    (Use Selected: {selectedInstancesIds[0]})
                  </button>
                )}
              </label>
              <input
                type="text"
                value={deleteShapeData.node_id}
                onChange={(e) => setDeleteShapeData({ ...deleteShapeData, node_id: e.target.value })}
                placeholder={selectedInstancesIds && selectedInstancesIds.length > 0 ? "Click 'Use Selected' button above" : "Select a shape on canvas first"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleDeleteShape}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Shape'}
            </button>
          </div>
        )}

        {/* Bulk Update */}
        {activeTab === 'bulk' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={bulkUpdateProjectId}
                onChange={(e) => setBulkUpdateProjectId(e.target.value)}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updates (JSON Array)
                {selectedInstancesIds && selectedInstancesIds.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-filled {selectedInstancesIds.length} shape(s): {selectedInstancesIds.join(', ')}
                  </span>
                )}
              </label>
              <textarea
                value={bulkUpdateData}
                onChange={(e) => setBulkUpdateData(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder={selectedInstancesIds && selectedInstancesIds.length > 0 ? "Auto-filled from selected shapes" : "Select shapes on canvas first"}
              />
            </div>
            <button
              onClick={handleBulkUpdate}
              disabled={loading || !bulkUpdateProjectId || !bulkUpdateData}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Bulk Update'}
            </button>
          </div>
        )}

        {/* Discover Design System */}
        {activeTab === 'ds-discover' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={discoverDSData.project_id}
                onChange={(e) => setDiscoverDSData({ ...discoverDSData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand URL
              </label>
              <input
                type="text"
                value={discoverDSData.brand_url}
                onChange={(e) => setDiscoverDSData({ ...discoverDSData, brand_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palette Hex (JSON Array)
                {layers.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-detected from canvas ({discoverDSData.palette_hex.length} colors)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={JSON.stringify(discoverDSData.palette_hex)}
                onChange={(e) => {
                  try {
                    const palette = JSON.parse(e.target.value);
                    setDiscoverDSData({ ...discoverDSData, palette_hex: palette });
                  } catch {}
                }}
                placeholder='["#0A66C2", "#111111"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {discoverDSData.palette_hex.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-600">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typefaces (JSON Array)
                {layers.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-detected from canvas ({discoverDSData.typefaces.length} fonts)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={JSON.stringify(discoverDSData.typefaces)}
                onChange={(e) => {
                  try {
                    const typefaces = JSON.parse(e.target.value);
                    setDiscoverDSData({ ...discoverDSData, typefaces });
                  } catch {}
                }}
                placeholder='["Inter", "Roboto"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={discoverDSData.tone}
                onChange={(e) => setDiscoverDSData({ ...discoverDSData, tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="clean">Clean</option>
                <option value="bold">Bold</option>
                <option value="playful">Playful</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <button
              onClick={handleDiscoverDS}
              disabled={loading || !discoverDSData.project_id}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Discovering...' : 'Discover Design System'}
            </button>
          </div>
        )}

        {/* Propose Design System */}
        {activeTab === 'ds-propose' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={proposeDSData.project_id}
                onChange={(e) => setProposeDSData({ ...proposeDSData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base
              </label>
              <select
                value={proposeDSData.base}
                onChange={(e) => setProposeDSData({ ...proposeDSData, base: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="material3">Material 3</option>
                <option value="material2">Material 2</option>
                <option value="ios">iOS</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palette Hex (JSON Array)
                {layers.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-detected from canvas ({proposeDSData.palette_hex.length} colors)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={JSON.stringify(proposeDSData.palette_hex)}
                onChange={(e) => {
                  try {
                    const palette = JSON.parse(e.target.value);
                    setProposeDSData({ ...proposeDSData, palette_hex: palette });
                  } catch {}
                }}
                placeholder='["#0A66C2", "#111111"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {proposeDSData.palette_hex.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-600">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typefaces (JSON Array)
                {layers.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Auto-detected from canvas ({proposeDSData.typefaces.length} fonts)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={JSON.stringify(proposeDSData.typefaces)}
                onChange={(e) => {
                  try {
                    const typefaces = JSON.parse(e.target.value);
                    setProposeDSData({ ...proposeDSData, typefaces });
                  } catch {}
                }}
                placeholder='["Inter"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={proposeDSData.tone}
                onChange={(e) => setProposeDSData({ ...proposeDSData, tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="clean">Clean</option>
                <option value="bold">Bold</option>
                <option value="playful">Playful</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <button
              onClick={handleProposeDS}
              disabled={loading || !proposeDSData.project_id}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Proposing...' : 'Propose Design System'}
            </button>
          </div>
        )}

        {/* Approve Design System */}
        {activeTab === 'ds-approve' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Note:</strong> Design system must be approved before initializing canvas or creating screens.
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> You must first <strong>Propose</strong> a design system (go to "Propose DS" tab) before you can approve it.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
                {approveDSData.project_id && (
                  <span className="ml-2 text-green-600 text-xs">
                    ✓ Auto-filled from selected product
                  </span>
                )}
              </label>
              <input
                type="text"
                value={approveDSData.project_id}
                onChange={(e) => setApproveDSData({ ...approveDSData, project_id: e.target.value })}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Options
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={approveDSData.approve_palette}
                  onChange={(e) => setApproveDSData({ ...approveDSData, approve_palette: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Approve Palette</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={approveDSData.approve_tokens}
                  onChange={(e) => setApproveDSData({ ...approveDSData, approve_tokens: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Approve Tokens</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={approveDSData.approve_typography}
                  onChange={(e) => setApproveDSData({ ...approveDSData, approve_typography: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Approve Typography</span>
              </label>
            </div>
            <button
              onClick={handleApproveDS}
              disabled={loading || !approveDSData.project_id}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Approving...' : 'Approve Design System'}
            </button>
          </div>
        )}

        {/* Get Design System */}
        {activeTab === 'ds-get' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
                {getDSProjectId && (
                  <span className="ml-2 text-green-600 text-xs">
                    ✓ Auto-filled from selected product
                  </span>
                )}
              </label>
              <input
                type="text"
                value={getDSProjectId}
                onChange={(e) => setGetDSProjectId(e.target.value)}
                placeholder="veh-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleGetDS}
              disabled={loading || !getDSProjectId}
              className="w-full px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Get Design System'}
            </button>
          </div>
        )}

        {/* Response/Error Display */}
        {(response || error) && (
          <div className="mt-4 p-4 rounded-lg border">
            {error && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-red-600 mb-2">Error:</h3>
                <pre className="text-xs text-red-700 bg-red-50 p-3 rounded overflow-auto max-h-40">
                  {formatErrorForDisplay(error)}
                </pre>
              </div>
            )}
            {response && (
              <div>
                <h3 className="text-sm font-semibold text-green-600 mb-2">Response:</h3>
                <pre className="text-xs text-green-700 bg-green-50 p-3 rounded overflow-auto max-h-60 border border-green-200">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CanvasOperationsPanel;

