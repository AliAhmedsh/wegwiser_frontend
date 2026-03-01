import { useProductStore } from '@/entities/product/store';
import aiService, {
    ChatMessage,
    Conversation,
} from '@/lib/api/services/aiService';
import { designAIService, Node } from '@/lib/api/services/designAIService';
import { useCanvasLayersStore } from './useCanvasLayers.store';
import { convertNodeToCanvasInstance, convertNodeToCanvasInstanceForEdit } from '../utils/nodeToCanvasConverter';
import { convertCanvasInstanceToNode, buildDocumentFromLayers } from '../utils/canvasToNodeConverter';
import { useDesignWorkspaceStore } from './designWorkspace.store';
import { useSelectedInstances } from './selectedInstances.store';
import { create } from 'zustand';

const isValidProduct = (product: any): boolean => {
  return product && product.id && product.id > 0;
};

type Sender = 'AI' | 'User';

interface Message {
  sender: Sender;
  message: string;
  timestamp?: string;
  role?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  fullMessage?: string;
  attachedImages?: string[];
  attachedFiles?: Array<{ name: string; type: string; size: number }>;
}

interface DesignWorkspaceAIStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentConversationId: number | null;
  conversations: Conversation[];
  conversationsLoading: boolean;

  addMessage: (message: string, sender: Sender, role?: string) => void;
  sendMessage: (message: string, files?: File[]) => Promise<void>;
  clearMessages: () => void;
  updateTypingMessage: (messageIndex: number, newText: string) => void;

  setError: (error: string | null) => void;

  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: number) => Promise<void>;
  createNewConversation: () => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
}

const useDesignWorkspaceAIStore = create<DesignWorkspaceAIStore>((set, get) => {
  const { chosenProduct } = useProductStore.getState();
  if (chosenProduct && !isValidProduct(chosenProduct)) {
    useProductStore.getState().clearChosenProduct();
  }

  return {
    messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
    isLoading: false,
    error: null,
    currentConversationId: null,
    conversations: [],
    conversationsLoading: false,

    addMessage: (message: string, sender: Sender, role?: string) =>
      set((state) => ({
        messages: [
          ...state.messages,
          {
            message,
            sender,
            role,
            timestamp: new Date().toISOString(),
            isLoading: sender === 'AI' ? false : undefined,
          },
        ],
      })),

    sendMessage: async (message: string, files?: File[]) => {
      const state = get();
      const { chosenProduct } = useProductStore.getState();

      if (!chosenProduct || !isValidProduct(chosenProduct)) {
        set({ error: 'Please select a valid product to use AI features' });
        return;
      }

      const imageUrls: string[] = [];
      const attachedFiles: Array<{ name: string; type: string; size: number }> = [];
      
      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file.type.startsWith('image/')) {
            imageUrls.push(URL.createObjectURL(file));
          } else {
            attachedFiles.push({
              name: file.name,
              type: file.type,
              size: file.size
            });
          }
        });
      }

      set((state) => ({
        messages: [
          ...state.messages,
          {
            message,
            sender: 'User' as const,
            timestamp: new Date().toISOString(),
            attachedImages: imageUrls.length > 0 ? imageUrls : undefined,
            attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
          },
        ],
        isLoading: true,
        error: null,
      }));

      try {
        let response: any;

        // Enhanced detection for design generation requests
        const lowerMessage = message.toLowerCase().trim();
        
        // Design generation keywords and patterns
        const designGenerationKeywords = [
          'generate', 'create', 'design', 'make', 'build', 'draw', 'sketch',
          'wireframe', 'mockup', 'prototype', 'ui', 'ux', 'interface',
          'page', 'screen', 'layout', 'component', 'form', 'button',
          'login', 'dashboard', 'landing', 'homepage', 'signup', 'register'
        ];
        
        // Design generation patterns
        const designPatterns = [
          /generate.*(design|page|screen|layout|ui|interface)/i,
          /create.*(design|page|screen|layout|ui|interface)/i,
          /make.*(design|page|screen|layout|ui|interface)/i,
          /build.*(design|page|screen|layout|ui|interface)/i,
          /draw.*(design|page|screen|layout|ui|interface)/i,
          /(login|signup|dashboard|landing|homepage).*(page|screen|design)/i,
          /(form|button|input|text|heading).*(design|create|generate)/i,
        ];
        
        // Check if message contains design generation keywords
        const hasDesignKeyword = designGenerationKeywords.some(keyword => 
          lowerMessage.includes(keyword)
        );
        
        // Check if message matches design generation patterns
        const matchesDesignPattern = designPatterns.some(pattern => 
          pattern.test(message)
        );
        
        // Check if message is asking to create/generate something (not just asking a question)
        const isActionRequest = 
          lowerMessage.startsWith('generate') ||
          lowerMessage.startsWith('create') ||
          lowerMessage.startsWith('make') ||
          lowerMessage.startsWith('build') ||
          lowerMessage.startsWith('draw') ||
          lowerMessage.startsWith('design') ||
          lowerMessage.match(/^(can you|could you|please|i want|i need).*(generate|create|make|build|design)/i);
        
        // Determine if this is a design generation request
        const isDesignGenerationRequest = 
          (hasDesignKeyword && (matchesDesignPattern || isActionRequest)) ||
          matchesDesignPattern ||
          (isActionRequest && hasDesignKeyword);

        // Check if this is an edit request for selected component
        // IMPORTANT: This check must happen BEFORE design generation check
        const { selectedInstancesIds } = useSelectedInstances.getState();
        const { layers, getInstanceById } = useCanvasLayersStore.getState();
        
        // Helper function to find parent group of an instance
        const findParentGroup = (instanceId: string, allLayers: CanvasInstance[]): CanvasInstance | null => {
          for (const layer of allLayers) {
            if (layer.id === instanceId) {
              return null; // It's a root layer
            }
            if (layer.type === 'group' && layer.children) {
              // Check if instance is a direct child
              if (layer.children.some(child => child.id === instanceId)) {
                return layer;
              }
              // Recursively check nested groups
              const findInGroup = (group: CanvasInstance): CanvasInstance | null => {
                if (group.type === 'group' && group.children) {
                  if (group.children.some(child => child.id === instanceId)) {
                    return group;
                  }
                  for (const child of group.children) {
                    if (child.type === 'group') {
                      const found = findInGroup(child);
                      if (found) return found;
                    }
                  }
                }
                return null;
              };
              const found = findInGroup(layer);
              if (found) return found;
            }
          }
          return null;
        };
        
        // Check if multiple selected items belong to the same parent group
        let effectiveSelectedId: string | null = null;
        let hasSelectedComponent = false;
        
        if (selectedInstancesIds && selectedInstancesIds.length > 0) {
          if (selectedInstancesIds.length === 1) {
            // Single selection - use it directly
            effectiveSelectedId = selectedInstancesIds[0];
            hasSelectedComponent = true;
          } else {
            // Multiple selections - check if they share the same parent
            const parents = selectedInstancesIds.map(id => findParentGroup(id, layers));
            const uniqueParents = parents.filter((p, i, arr) => p && arr.indexOf(p) === i);
            
            if (uniqueParents.length === 1 && uniqueParents[0]) {
              // All selected items belong to the same parent group - use parent as selected component
              effectiveSelectedId = uniqueParents[0].id;
              hasSelectedComponent = true;
              console.log('[Design AI] Multiple items selected from same parent group, using parent:', effectiveSelectedId);
            } else {
              // Check if selected items are siblings (same parent) by checking their IDs pattern
              // For buttons: often have pattern like "button-rect" and "button-text"
              const idPatterns = selectedInstancesIds.map(id => {
                // Extract base name (e.g., "login_button" from "login_button-rect" or "login_button-text")
                const parts = id.split('-');
                if (parts.length > 1) {
                  // Remove last part (rect/text) to get base
                  return parts.slice(0, -1).join('-');
                }
                return id;
              });
              
              const uniquePatterns = [...new Set(idPatterns)];
              if (uniquePatterns.length === 1) {
                // All selected items share the same base ID pattern - likely parts of same component
                // Try to find the parent group or use the first selected item's parent
                const firstParent = findParentGroup(selectedInstancesIds[0], layers);
                if (firstParent) {
                  effectiveSelectedId = firstParent.id;
                  hasSelectedComponent = true;
                  console.log('[Design AI] Selected items are parts of same component, using parent group:', effectiveSelectedId);
                } else {
                  // If no parent found, use the base pattern as the component ID
                  // Try to find a group with similar name
                  const baseName = uniquePatterns[0];
                  const matchingGroup = layers.find(layer => 
                    layer.type === 'group' && 
                    (layer.id.includes(baseName) || layer.name?.toLowerCase().includes(baseName.toLowerCase()))
                  );
                  if (matchingGroup) {
                    effectiveSelectedId = matchingGroup.id;
                    hasSelectedComponent = true;
                    console.log('[Design AI] Found matching group for selected items:', effectiveSelectedId);
                  }
                }
              }
            }
          }
        }
        
        // Edit-related keywords - expanded list
        const editKeywords = [
          'edit', 'change', 'update', 'modify', 'adjust', 'alter', 'revise',
          'set', 'make', 'transform', 'convert', 'replace', 'switch',
          'color', 'colour', 'size', 'text', 'font', 'style', 'background',
          'border', 'shadow', 'opacity', 'width', 'height', 'position',
          'align', 'center', 'left', 'right', 'top', 'bottom', 'margin',
          'padding', 'radius', 'round', 'square'
        ];
        
        // Edit patterns - more specific matching
        const editPatterns = [
          /^(edit|change|update|modify|adjust|alter|revise|set|make|transform)/i,
          /(edit|change|update|modify|adjust|alter|revise|set|make|transform).*(this|selected|component|element|item)/i,
          /(color|colour|size|text|font|style|background|border|shadow|opacity|width|height|position|align|center|left|right|top|bottom|margin|padding|radius)/i,
        ];
        
        // Check if message contains edit keywords
        const hasEditKeyword = editKeywords.some(keyword => lowerMessage.includes(keyword));
        
        // Check if message matches edit patterns
        const matchesEditPattern = editPatterns.some(pattern => pattern.test(message));
        
        // Determine if this is an edit request
        // Priority: If component is selected AND (has edit keyword OR matches edit pattern), it's an edit request
        const isEditRequest = hasSelectedComponent && (hasEditKeyword || matchesEditPattern);

        // Enhanced debug logging - Always log to help debug
        console.log('[Design AI] 🔍 Request analysis:', {
          originalMessage: message,
          lowerMessage: lowerMessage,
          hasSelectedComponent,
          effectiveSelectedId,
          selectedInstancesIds: selectedInstancesIds || [],
          selectedCount: selectedInstancesIds?.length || 0,
          hasEditKeyword,
          editKeywordsFound: editKeywords.filter(k => lowerMessage.includes(k)),
          matchesEditPattern,
          matchedPatterns: editPatterns.filter(p => p.test(message)).map(p => p.toString()),
          isEditRequest,
          hasFiles: files && files.length > 0,
          willCallEdit: isEditRequest && !files?.length
        });

        if (isEditRequest && !files?.length) {
          console.log('[Design AI] ✅ Edit request detected - Calling edit-selected endpoint');
          
          // Set flag to prevent auto-save during edit operation
          useCanvasLayersStore.getState().setAIGenerated(true);
          
          try {
            const selectedId = effectiveSelectedId || selectedInstancesIds[0];
            console.log('[Design AI] Selected ID (effective):', selectedId, 'from', selectedInstancesIds);
            
            if (!selectedId) {
              console.error('[Design AI] ❌ No selected ID found');
              useCanvasLayersStore.getState().setAIGenerated(false);
              throw new Error('No component selected. Please select a component first.');
            }
            
            const selectedInstance = getInstanceById(selectedId);
            console.log('[Design AI] Selected instance:', selectedInstance ? 'Found' : 'Not found', {
              instanceId: selectedId,
              instanceType: selectedInstance?.type,
              instanceName: selectedInstance?.name
            });
            
            if (!selectedInstance) {
              console.error('[Design AI] ❌ Selected instance not found in canvas layers');
              useCanvasLayersStore.getState().setAIGenerated(false);
              throw new Error(`Selected component (ID: ${selectedId}) not found in canvas. It may have been deleted or the selection is stale. Please select the component again.`);
            }

            // Convert selected instance to Node format
            const selectedNode = convertCanvasInstanceToNode(selectedInstance, true);
            
            // Build document structure from all layers
            const document = buildDocumentFromLayers(layers);
            
            // Get project_id from product
            const projectId = chosenProduct?.id?.toString() || 'default-project';
            
            // Enhance instruction with color name to hex conversion for better AI understanding
            const enhanceInstructionWithColors = (instruction: string): string => {
              const colorNameMap: Record<string, string> = {
                // Basic colors
                'red': '#FF0000',
                'blue': '#0000FF',
                'green': '#00FF00',
                'yellow': '#FFFF00',
                'orange': '#FFA500',
                'purple': '#800080',
                'pink': '#FFC0CB',
                'brown': '#A52A2A',
                'black': '#000000',
                'white': '#FFFFFF',
                'gray': '#808080',
                'grey': '#808080',
                'cyan': '#00FFFF',
                'magenta': '#FF00FF',
                'lime': '#00FF00',
                'navy': '#000080',
                'maroon': '#800000',
                'olive': '#808000',
                'teal': '#008080',
                'silver': '#C0C0C0',
                'gold': '#FFD700',
                'indigo': '#4B0082',
                'violet': '#8B00FF',
                'coral': '#FF7F50',
                'salmon': '#FA8072',
                'turquoise': '#40E0D0',
                'beige': '#F5F5DC',
                'ivory': '#FFFFF0',
                'khaki': '#F0E68C',
                'lavender': '#E6E6FA',
                'plum': '#DDA0DD',
                'tan': '#D2B48C',
                'aqua': '#00FFFF',
                'fuchsia': '#FF00FF',
                // Light variations
                'light blue': '#ADD8E6',
                'light green': '#90EE90',
                'light red': '#FFB6C1',
                'light yellow': '#FFFFE0',
                'light gray': '#D3D3D3',
                'light grey': '#D3D3D3',
                // Dark variations
                'dark blue': '#00008B',
                'dark green': '#006400',
                'dark red': '#8B0000',
                'dark gray': '#A9A9A9',
                'dark grey': '#A9A9A9',
              };
              
              let enhancedInstruction = instruction;
              const lowerInstruction = instruction.toLowerCase();
              
              // First, handle multi-word colors (e.g., "light blue", "dark red")
              const multiWordColors = Object.entries(colorNameMap).filter(([name]) => name.includes(' '));
              for (const [colorName, hexCode] of multiWordColors) {
                const colorRegex = new RegExp(`\\b${colorName}\\b`, 'gi');
                if (colorRegex.test(instruction)) {
                  enhancedInstruction = enhancedInstruction.replace(
                    colorRegex,
                    (match) => `${match} (${hexCode})`
                  );
                  console.log(`[Design AI] Enhanced instruction: "${colorName}" → "${hexCode}"`);
                }
              }
              
              // Then handle single-word colors (avoid matching words already processed)
              for (const [colorName, hexCode] of Object.entries(colorNameMap)) {
                if (colorName.includes(' ')) continue; // Skip multi-word colors already processed
                
                // Match whole word color names (e.g., "red" but not "bred")
                const colorRegex = new RegExp(`\\b${colorName}\\b`, 'gi');
                if (colorRegex.test(enhancedInstruction)) {
                  // Check if already enhanced (has hex code after it)
                  const alreadyEnhanced = new RegExp(`\\b${colorName}\\s*\\(#[0-9A-F]{6}\\)`, 'gi');
                  if (!alreadyEnhanced.test(enhancedInstruction)) {
                    enhancedInstruction = enhancedInstruction.replace(
                      colorRegex,
                      (match) => `${match} (${hexCode})`
                    );
                    console.log(`[Design AI] Enhanced instruction: "${colorName}" → "${hexCode}"`);
                  }
                }
              }
              
              return enhancedInstruction;
            };
            
            const enhancedInstruction = enhanceInstructionWithColors(message);
            
            if (enhancedInstruction !== message) {
              console.log('[Design AI] Instruction enhanced:', {
                original: message,
                enhanced: enhancedInstruction
              });
            }
            
            // Call edit-selected API
            const editResponse = await designAIService.editSelected({
              project_id: projectId,
              instruction: enhancedInstruction,
              selected_node: selectedNode,
              document: document,
            });

            if (editResponse.updated_node) {
              console.log('[Design AI] Edit response received:', {
                updatedNode: editResponse.updated_node,
                changesSummary: editResponse.changes_summary
              });
              
              // Use convertNodeToCanvasInstanceForEdit to use FastAPI response exactly as-is (no filtering)
              const updatedInstance = convertNodeToCanvasInstanceForEdit(editResponse.updated_node);
              console.log('[Design AI] Converted instance (exact from FastAPI):', {
                id: updatedInstance.id,
                type: updatedInstance.type,
                fill: (updatedInstance as any).object?.fill || (updatedInstance as any).children?.[0]?.object?.fill
              });
              
              const { updateInstance, layers: currentLayers } = useCanvasLayersStore.getState();
              
              const instanceExists = currentLayers.some(layer => {
                const findInTree = (inst: any): boolean => {
                  if (inst.id === selectedInstance.id) return true;
                  if (inst.type === 'group' && inst.children) {
                    return inst.children.some(findInTree);
                  }
                  return false;
                };
                return findInTree(layer);
              });
              
              if (!instanceExists) {
                const { addInstance } = useCanvasLayersStore.getState();
                addInstance(updatedInstance, null);
              } else {
                updateInstance(selectedInstance.id, (currentInstance) => {
                  return {
                    ...updatedInstance,
                    id: currentInstance.id,
                  } as CanvasInstance;
                });
              }
              
              setTimeout(() => {
                const stage = useDesignWorkspaceStore.getState().stageRef?.current;
                if (stage) {
                  stage.batchDraw();
                }
              }, 100);

              // Add success message
              set((state) => ({
                messages: [
                  ...state.messages,
                  {
                    message: `✅ ${editResponse.changes_summary || 'Component updated successfully!'}`,
                    sender: 'AI' as const,
                    timestamp: new Date().toISOString(),
                    isLoading: false,
                  },
                ],
                isLoading: false,
              }));
              
              // Reset AI flag after a delay to allow auto-save to resume
              // This prevents immediate auto-save after edit operation
              setTimeout(() => {
                useCanvasLayersStore.getState().setAIGenerated(false);
                console.log('[Design AI] Edit operation complete, auto-save re-enabled');
              }, 3000); // 3 seconds delay to prevent immediate auto-save
              
              return;
            }
          } catch (editError: any) {
            console.error('[Design AI] ❌ Edit selected error:', editError);
            
            // Reset AI flag on error
            useCanvasLayersStore.getState().setAIGenerated(false);
            
            const errorMessage = editError?.response?.data?.error || 
                                 editError?.message || 
                                 'Failed to edit component. Please try again.';
            set((state) => ({
              messages: [
                ...state.messages,
                {
                  message: `❌ Edit failed: ${errorMessage}`,
                  sender: 'AI' as const,
                  timestamp: new Date().toISOString(),
                  isLoading: false,
                },
              ],
              isLoading: false,
            }));
            // IMPORTANT: Return early to prevent falling through to general AI
            return;
          }
        } else if (hasSelectedComponent && (hasEditKeyword || matchesEditPattern)) {
          // Component is selected and has edit keywords, but edit request failed validation
          console.warn('[Design AI] ⚠️ Edit request detected but conditions not met:', {
            hasSelectedComponent,
            hasEditKeyword,
            matchesEditPattern,
            hasFiles: files && files.length > 0,
            selectedInstancesIds
          });
          set((state) => ({
            messages: [
              ...state.messages,
              {
                message: '⚠️ Please select exactly one component to edit, and ensure no files are attached.',
                sender: 'AI' as const,
                timestamp: new Date().toISOString(),
                isLoading: false,
              },
            ],
            isLoading: false,
          }));
          return;
        }

        if (isDesignGenerationRequest && !files?.length) {
          try {
            const generateResponse = await designAIService.generateAI({
              prompt: message,
              viewport_w: 1440,
              viewport_h: 1024,
              use_multi_stage: true,
            });

            if (generateResponse.status === 'ok' && generateResponse.design) {
              // Check if this is a fallback/error design
              const designName = generateResponse.design.name || '';
              const designId = generateResponse.design.id || '';
              const isFallback = designId.includes('fallback') || 
                                designName.toLowerCase().includes('error') ||
                                designName.toLowerCase().includes('fallback');
              
              if (isFallback) {
                throw new Error('Design generation encountered errors. Please try again with a different prompt.');
              }
              
              if (generateResponse.design.children && Array.isArray(generateResponse.design.children)) {
                generateResponse.design.children = generateResponse.design.children.filter((child: any) => {
                  if (!child || !child.id) return false;
                  
                  const childId = child.id || '';
                  const childName = child.name || '';
                  const isFallbackChild = childId.includes('fallback') || 
                                         childName.toLowerCase().includes('error') ||
                                         childName.toLowerCase().includes('fallback') ||
                                         childName.toLowerCase().includes('encountered errors');
                  
                  return !isFallbackChild;
                });
                
                if (generateResponse.design.children.length === 0) {
                  throw new Error('Design generation encountered errors. All design elements were fallback. Please try again with a different prompt.');
                }
              }
              
              const canvasInstance = convertNodeToCanvasInstance(generateResponse.design);
              useCanvasLayersStore.setState({ layers: [] });
              
              let layersToAdd: CanvasInstance[] = [];
              
              if (canvasInstance.type === 'group') {
                const groupInstance = canvasInstance as CanvasGroup;
                if (groupInstance.children && groupInstance.children.length > 0) {
                  const validChildren = groupInstance.children.filter((child) => {
                    if (!child || !child.id || !child.type) return false;
                    
                    const childId = child.id || '';
                    const childName = child.name || '';
                    
                    const isBackgroundFrame = (childId.includes('background') || childName.toLowerCase().includes('background')) &&
                                             child.type === 'group' &&
                                             (child as CanvasGroup).children &&
                                             (child as CanvasGroup).children.length > 0 &&
                                             (child as CanvasGroup).children.every((grandchild: CanvasInstance) => 
                                               grandchild.id === 'placeholder' || 
                                               grandchild.name === 'Placeholder' ||
                                               (grandchild.type === 'text' && (grandchild as any).object?.text === 'Add your content here')
                                             );
                    
                    if (isBackgroundFrame) return false;
                    
                    if (child.type === 'rectangle') {
                      const rect = child as CanvasRectInstance;
                      if (rect.object && (rect.object.width === 0 || rect.object.height === 0)) {
                        return false;
                      }
                    }
                    
                    const isFallback = childId.toLowerCase().includes('fallback') && 
                                      (childName.toLowerCase().includes('error') || childName.toLowerCase().includes('fallback'));
                    
                    return !isFallback;
                  });
                  
                  if (validChildren.length === 0) {
                    layersToAdd = groupInstance.children.filter(child => child && child.id && child.type) as CanvasInstance[];
                  } else {
                    layersToAdd = validChildren;
                  }
                } else {
                  if (canvasInstance && canvasInstance.id) {
                    layersToAdd = [canvasInstance];
                  }
                }
              } else {
                if (canvasInstance && canvasInstance.id) {
                  layersToAdd = [canvasInstance];
                }
              }
              
              if (layersToAdd.length > 0) {
                useCanvasLayersStore.setState({ 
                  layers: layersToAdd,
                  isAIGenerated: true 
                });
                
                setTimeout(() => {
                  useCanvasLayersStore.setState({ isAIGenerated: false });
                }, 5000);
              } else {
                throw new Error('Failed to convert design to canvas layers. Please try again.');
              }
              
              setTimeout(() => {
                const { layers } = useCanvasLayersStore.getState();
                if (layers.length > 0) {
                  const forceRedraw = () => {
                    try {
                      const { stageRef } = useDesignWorkspaceStore.getState();
                      if (stageRef?.current) {
                        stageRef.current.batchDraw();
                        return true;
                      }
                      return false;
                    } catch (error) {
                      return false;
                    }
                  };
                  
                  forceRedraw();
                  setTimeout(() => {
                    forceRedraw();
                  }, 100);
                }
              }, 100);

              setTimeout(() => {
                try {
                  const { layers } = useCanvasLayersStore.getState();
                  
                  if (layers.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    let hasValidBounds = false;
                    
                    const calculateBounds = (instance: CanvasInstance) => {
                      if (instance.type === 'group') {
                        const group = instance as CanvasGroup;
                        if (group.children && group.children.length > 0) {
                          group.children.forEach(calculateBounds);
                        }
                      } else {
                        const obj = (instance as any).object || {};
                        const x = obj.x || 0;
                        const y = obj.y || 0;
                        const w = obj.width || 0;
                        const h = obj.height || 0;
                        
                        if (w > 0 && h > 0) {
                          minX = Math.min(minX, x);
                          minY = Math.min(minY, y);
                          maxX = Math.max(maxX, x + w);
                          maxY = Math.max(maxY, y + h);
                          hasValidBounds = true;
                        }
                      }
                    };
                    
                    layers.forEach(calculateBounds);
                    
                    if (hasValidBounds && minX !== Infinity && minY !== Infinity && maxX > minX && maxY > minY) {
                      const designBounds = {
                        x: minX,
                        y: minY,
                        w: maxX - minX,
                        h: maxY - minY,
                      };
                      
                      const { setZoom, stageSize, setStagePos } = useDesignWorkspaceStore.getState();
                      
                      if (stageSize && designBounds.w > 0 && designBounds.h > 0) {
                        const padding = 50;
                        const scaleX = (stageSize.width - padding * 2) / designBounds.w;
                        const scaleY = (stageSize.height - padding * 2) / designBounds.h;
                        const newZoom = Math.min(scaleX, scaleY, 1);
                        
                        if (newZoom < 1 && newZoom > 0.1) {
                          setZoom(newZoom);
                        }
                        
                        if (setStagePos) {
                          const designCenterX = designBounds.x + designBounds.w / 2;
                          const designCenterY = designBounds.y + designBounds.h / 2;
                          const stageCenterX = stageSize.width / 2;
                          const stageCenterY = stageSize.height / 2;
                          const finalZoom = newZoom < 1 && newZoom > 0.1 ? newZoom : 1;
                          const centeredX = stageCenterX - designCenterX * finalZoom;
                          const centeredY = stageCenterY - designCenterY * finalZoom;
                          
                          setStagePos({ x: centeredX, y: centeredY });
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error('[Design AI] Auto-fit failed:', error);
                }
              }, 400);

              // Add success message
              set((state) => ({
                messages: [
                  ...state.messages,
                  {
                    message: `✅ Design generated successfully! I've created "${generateResponse.design.name}" on the canvas. The design includes ${generateResponse.design.children?.length || 0} elements.`,
                    sender: 'AI' as const,
                    timestamp: new Date().toISOString(),
                    isLoading: false,
                  },
                ],
                isLoading: false,
              }));
              return;
            }
          } catch (generateError: any) {
            console.error('[Design AI] Design generation error:', generateError);
            // Show error message but don't fall through to general AI
            const errorMessage = generateError?.response?.data?.error || 
                                 generateError?.message || 
                                 'Failed to generate design. Please try again.';
            set((state) => ({
              messages: [
                ...state.messages,
                {
                  message: `Design generation failed: ${errorMessage}`,
                  sender: 'AI' as const,
                  timestamp: new Date().toISOString(),
                  isLoading: false,
                },
              ],
              isLoading: false,
            }));
            return;
          }
        }

        // For general messages or if design generation failed, use the general AI service
        if (files && files.length > 0) {
          const formData = new FormData();
          formData.append('message', message);
          if (chosenProduct?.id) {
            formData.append('productId', chosenProduct.id.toString());
          }
          files.forEach((file, index) => {
            formData.append(`file_${index}`, file);
          });

          response = await aiService.askAI(formData);
        } else {
          response = await aiService.askAI({
            message,
            productId: chosenProduct?.id,
            conversationId: state.currentConversationId || undefined,
          });
        }

        set((state) => ({
          messages: [
            ...state.messages,
            {
              message: response.response || 'No response received',
              sender: 'AI' as const,
              role: response.role,
              timestamp: new Date().toISOString(),
              isLoading: false,
            },
          ],
          isLoading: false,
          currentConversationId: response.conversationId || state.currentConversationId,
        }));
      } catch (error: any) {
        console.error('AI message error:', error);
        const errorMessage = error?.response?.data?.error || error?.message || 'Failed to send message';
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    clearMessages: () =>
      set({
        messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
        error: null,
      }),

    updateTypingMessage: (messageIndex: number, newText: string) =>
      set((state) => {
        const updatedMessages = [...state.messages];
        if (updatedMessages[messageIndex]) {
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            message: newText,
            isTyping: true,
          };
        }
        return { messages: updatedMessages };
      }),

    setError: (error: string | null) => set({ error }),

    loadConversations: async () => {
      set({ conversationsLoading: true });
      try {
        const { chosenProduct } = useProductStore.getState();
        const response = await aiService.getConversations(20, 0, chosenProduct?.id);
        set({
          conversations: response.conversations || [],
          conversationsLoading: false,
        });
      } catch (error) {
        console.error('Failed to load conversations:', error);
        set({ conversationsLoading: false });
      }
    },

    loadConversation: async (conversationId: number) => {
      try {
        const response = await aiService.getConversationMessages(conversationId);
        const formattedMessages: Message[] = response.messages.map((msg) => ({
          sender: msg.role === 'user' ? 'User' : 'AI',
          message: msg.content,
          timestamp: msg.createdAt,
          role: msg.metadata?.role,
        }));

        set({
          messages: formattedMessages.length > 0 ? formattedMessages : [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
          currentConversationId: conversationId,
        });
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    },

    createNewConversation: async () => {
      try {
        const { chosenProduct } = useProductStore.getState();
        const response = await aiService.createConversation({
          productId: chosenProduct?.id,
        });
        set({
          currentConversationId: response.conversation.id,
          messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
        });
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    },

    deleteConversation: async (conversationId: number) => {
      try {
        await aiService.deleteConversation(conversationId);
        const state = get();
        if (state.currentConversationId === conversationId) {
          set({
            currentConversationId: null,
            messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
          });
        }
        await state.loadConversations();
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    },
  };
});

export default useDesignWorkspaceAIStore;

