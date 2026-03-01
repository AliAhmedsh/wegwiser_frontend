import { Node } from '@/lib/api/services/designAIService';
import { CanvasInstance, CanvasGroup, CanvasRectInstance, CanvasTextInstance } from '@/workspaces/designWorkspace/types';

/**
 * Converts gradient to Konva format
 * Returns object with fillLinearGradientColorStops, fillLinearGradientStartPoint, fillLinearGradientEndPoint
 */
const getGradientFill = (gradient: any, width: number, height: number): any => {
  if (!gradient || gradient.type !== 'linear' || !gradient.stops || !Array.isArray(gradient.stops)) {
    return null;
  }

  // Convert angle (degrees) to radians
  const angleRad = (gradient.angle || 0) * (Math.PI / 180);
  
  // Calculate start and end points based on angle
  // For 135 degrees (diagonal from top-left to bottom-right)
  const centerX = width / 2;
  const centerY = height / 2;
  const length = Math.sqrt(width * width + height * height);
  
  const startX = centerX - (length / 2) * Math.cos(angleRad);
  const startY = centerY - (length / 2) * Math.sin(angleRad);
  const endX = centerX + (length / 2) * Math.cos(angleRad);
  const endY = centerY + (length / 2) * Math.sin(angleRad);

  // Build color stops array: [position, color, position, color, ...]
  const colorStops: (number | string)[] = [];
  gradient.stops.forEach((stop: any) => {
    const position = stop.position !== undefined ? stop.position / 100 : 0; // Convert 0-100 to 0-1
    colorStops.push(position, stop.color || '#000000');
  });

  return {
    fillLinearGradientColorStops: colorStops,
    fillLinearGradientStartPoint: { x: startX, y: startY },
    fillLinearGradientEndPoint: { x: endX, y: endY },
  };
};

/**
 * Converts a color token or hex to a hex color string
 * Handles both old format {token, hex} and new format {color, hex, token, gradient}
 * Returns either a string (hex color) or an object (gradient config)
 */
const getColorValue = (fill?: { 
  token?: string | null; 
  hex?: string | null;
  color?: string | null;
  gradient?: any | null;
}, width?: number, height?: number): string | any => {
  if (!fill) return '#000000';
  
  // Check for gradient first (before other color values)
  if (fill.gradient && width && height) {
    const gradientConfig = getGradientFill(fill.gradient, width, height);
    if (gradientConfig) {
      return gradientConfig;
    }
  }
  
  // New API format: {color, hex, token, gradient}
  if (fill.color) return fill.color;
  if (fill.hex) return fill.hex;
  if (fill.token) {
    // Map common tokens to colors (can be expanded)
    const tokenMap: Record<string, string> = {
      'color.primary': '#0A66C2',
      'color.primary.light': '#E3F2FD',
      'color.primary.dark': '#084F95',
      'color.surface': '#FFFFFF',
      'color.text': '#000000',
      'color.text.secondary': '#666666',
      'color.neutral': '#F3F4F6',
      'color.success': '#4CAF50',
      'color.error': '#F44336',
      'color.warning': '#FF9800',
      'primary.500': '#6750A4',
      'background': '#FFFFFF',
      'background.50': '#FAFAFA',
      'background.main': '#FFFFFF',
      'gray.50': '#F9FAFB',
      'gray.100': '#F3F4F6',
      'gray.200': '#E5E7EB',
      'gray.300': '#D1D5DB',
      // Error tokens
      'error.main': '#F44336', // Red color
      'error': '#F44336',
      // Success tokens
      'success.main': '#4CAF50',
      'success': '#4CAF50',
      // Warning tokens
      'warning.main': '#FF9800',
      'warning': '#FF9800',
      // Primary tokens
      'primary.main': '#0A66C2',
      'primary': '#0A66C2',
    };
    return tokenMap[fill.token] || '#FFFFFF';
  }
  return '#000000';
};

/**
 * Gets stroke color from stroke object
 */
const getStrokeColor = (stroke?: { 
  width?: number;
  color?: { token?: string; hex?: string };
  token?: string;
  hex?: string;
} | null): string | undefined => {
  if (!stroke) return undefined;
  
  // New API format: {width, color: {token}}
  if (stroke.color) {
    if (stroke.color.hex) return stroke.color.hex;
    if (stroke.color.token) {
      const tokenMap: Record<string, string> = {
        'gray.300': '#D1D5DB',
        'gray.400': '#9CA3AF',
      };
      return tokenMap[stroke.color.token] || '#CCCCCC';
    }
  }
  
  // Old format: {width, token, hex}
  if (stroke.hex) return stroke.hex;
  if (stroke.token) {
    const tokenMap: Record<string, string> = {
      'gray.300': '#D1D5DB',
    };
    return tokenMap[stroke.token] || '#CCCCCC';
  }
  
  return undefined;
};

/**
 * Gets corner radius from border_radius string
 */
const getCornerRadius = (borderRadius?: string | null): number => {
  if (!borderRadius) return 0;
  const radiusMap: Record<string, number> = {
    'sm': 2,
    'md': 4,
    'lg': 8,
    'xl': 12,
  };
  return radiusMap[borderRadius] || 4;
};

/**
 * Converts a Node from the Design AI API to a CanvasInstance (for edit operations)
 * Uses the node exactly as returned by FastAPI without any filtering
 */
export const convertNodeToCanvasInstanceForEdit = (node: any): CanvasInstance => {
  try {
    // Validate node structure
    if (!node || !node.id || !node.type) {
      console.error('[Node Converter] Invalid node:', node);
      return {
        id: node?.id || 'invalid',
        name: node?.name || 'Invalid',
        type: 'rectangle',
        object: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fill: '#CCCCCC',
        },
      } as CanvasRectInstance;
    }
    
    const { 
      id, 
      name, 
      type, 
      bounds = { x: 0, y: 0, w: 100, h: 100 }, 
      fill, 
      stroke, 
      text, 
      font_token, 
      typography, 
      children, 
      visible, 
      border_radius,
      placeholder,
    } = node;
    
    const safeBounds = {
      x: bounds?.x ?? 0,
      y: bounds?.y ?? 0,
      w: bounds?.w ?? 100,
      h: bounds?.h ?? 100,
    };

    // Handle frames - convert to groups with all children (no filtering)
    if (type === 'frame') {
      const convertedChildren = children
        ? children
            .map((child: any) => {
              try {
                return convertNodeToCanvasInstanceForEdit(child);
              } catch (error) {
                console.error('[Node Converter] Error converting child:', error, child);
                return null;
              }
            })
            .filter((child): child is CanvasInstance => child !== null && child !== undefined)
        : [];
      
      const fillValue = getColorValue(fill, safeBounds.w, safeBounds.h);
      const isGradient = fillValue && typeof fillValue === 'object' && fillValue.fillLinearGradientColorStops;
      
      const frameGroup: CanvasGroup = {
        id,
        name,
        type: 'group',
        isOpen: true,
        children: [
          ...(convertedChildren.length > 0 ? [{
            id: `${id}-bg`,
            name: `${name} Background`,
            type: 'rectangle',
            object: {
              x: safeBounds.x,
              y: safeBounds.y,
              width: safeBounds.w,
              height: safeBounds.h,
              fill: isGradient ? undefined : (fillValue as string || '#FFFFFF'),
              ...(isGradient ? fillValue : {}),
              stroke: getStrokeColor(stroke),
              strokeWidth: stroke?.width || 0,
              cornerRadius: getCornerRadius(border_radius),
            },
          } as CanvasRectInstance] : []),
          ...convertedChildren,
        ],
      };
      return frameGroup;
    }

    // Handle groups - convert all children (no filtering)
    if (type === 'group') {
      const convertedChildren = children
        ? children
            .map((child: any) => {
              try {
                return convertNodeToCanvasInstanceForEdit(child);
              } catch (error) {
                console.error('[Node Converter] Error converting group child:', error, child);
                return null;
              }
            })
            .filter((child): child is CanvasInstance => child !== null && child !== undefined)
        : [];
      
      const group: CanvasGroup = {
        id,
        name,
        type: 'group',
        isOpen: true,
        children: convertedChildren,
      };
      return group;
    }

    // Handle rectangles
    if (type === 'rect') {
      const fillValue = getColorValue(fill, safeBounds.w, safeBounds.h);
      const isGradient = fillValue && typeof fillValue === 'object' && fillValue.fillLinearGradientColorStops;
      
      const rect: CanvasRectInstance = {
        id,
        name,
        type: 'rectangle',
        object: {
          x: safeBounds.x,
          y: safeBounds.y,
          width: safeBounds.w,
          height: safeBounds.h,
          fill: isGradient ? undefined : (fillValue as string || '#000000'),
          ...(isGradient ? fillValue : {}),
          stroke: stroke?.hex || stroke?.token ? getStrokeColor(stroke) : undefined,
          strokeWidth: stroke?.width || 0,
          cornerRadius: getCornerRadius(border_radius),
        },
      };
      return rect;
    }

    // Handle buttons
    if (type === 'button') {
      if (text) {
        const buttonGroup: CanvasGroup = {
          id,
          name,
          type: 'group',
          isOpen: true,
          children: [
            {
              id: `${id}-rect`,
              name: `${name} Background`,
              type: 'rectangle',
              object: {
                x: safeBounds.x,
                y: safeBounds.y,
                width: safeBounds.w,
                height: safeBounds.h,
                fill: getColorValue(fill),
                stroke: stroke?.hex || stroke?.token ? getColorValue({ hex: stroke.hex, token: stroke.token }) : undefined,
                strokeWidth: stroke?.width || 1,
                cornerRadius: getCornerRadius(border_radius) || 4,
              },
            } as CanvasRectInstance,
            {
              id: `${id}-text`,
              name: `${name} Text`,
              type: 'text',
              object: {
                x: safeBounds.x,
                y: safeBounds.y,
                width: safeBounds.w,
                height: safeBounds.h,
                text: text,
                fontSize: 16,
                fill: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'normal',
                align: 'center',
                verticalAlign: 'middle',
              },
            } as CanvasTextInstance,
          ],
        };
        return buttonGroup;
      }
      
      const button: CanvasRectInstance = {
        id,
        name,
        type: 'rectangle',
        object: {
          x: safeBounds.x,
          y: safeBounds.y,
          width: safeBounds.w,
          height: safeBounds.h,
          fill: getColorValue(fill),
          stroke: stroke?.hex || stroke?.token ? getColorValue({ hex: stroke.hex, token: stroke.token }) : undefined,
          strokeWidth: stroke?.width || 1,
          cornerRadius: 4,
        },
      };
      return button;
    }

    // Handle text and headings
    if (type === 'text' || type === 'heading') {
      let fontSize = 16;
      let fontFamily = 'Inter, sans-serif';
      let fontStyle: 'normal' | 'bold' = 'normal';
      let textAlign: 'left' | 'center' | 'right' = 'left';
      
      if (typography) {
        const fontSizeValue = typography.font_size;
        if (typeof fontSizeValue === 'number') {
          fontSize = fontSizeValue;
        }
        fontFamily = typography.font_family || 'Inter, sans-serif';
        fontStyle = typography.font_weight && typography.font_weight >= 600 ? 'bold' : 'normal';
        textAlign = (typography.text_align as any) || 'left';
      } else if (font_token) {
        const sizeMatch = font_token.match(/type_scale\.(\w+)/);
        if (sizeMatch) {
          const sizeMap: Record<string, number> = {
            'xs': 12, 'sm': 14, 'md': 16, 'lg': 20, 'xl': 24, '2xl': 32, '3xl': 40
          };
          fontSize = sizeMap[sizeMatch[1]] || 16;
        }
      }
      
      const textInstance: CanvasTextInstance = {
        id,
        name,
        type: 'text',
        object: {
          x: safeBounds.x,
          y: safeBounds.y,
          width: safeBounds.w,
          height: safeBounds.h,
          text: text || placeholder || name || '',
          fontSize,
          fill: getColorValue(fill),
          fontFamily,
          fontStyle,
          align: textAlign,
          verticalAlign: 'middle',
        },
      };
      return textInstance;
    }

    // Handle inputs
    if (type === 'input') {
      const placeholderText = placeholder || 'Enter text...';
      const inputGroup: CanvasGroup = {
        id,
        name,
        type: 'group',
        isOpen: true,
        children: [
          {
            id: `${id}-rect`,
            name: `${name} Background`,
            type: 'rectangle',
            object: {
              x: safeBounds.x,
              y: safeBounds.y,
              width: safeBounds.w,
              height: safeBounds.h,
              fill: getColorValue(fill) || '#FFFFFF',
              stroke: stroke?.hex || stroke?.token ? getColorValue({ hex: stroke.hex, token: stroke.token }) : '#CCCCCC',
              strokeWidth: stroke?.width || 1,
              cornerRadius: getCornerRadius(border_radius) || 4,
            },
          } as CanvasRectInstance,
          {
            id: `${id}-placeholder`,
            name: `${name} Placeholder`,
            type: 'text',
            object: {
              x: safeBounds.x + (fill?.padding?.left || 16),
              y: safeBounds.y,
              width: safeBounds.w - ((fill?.padding?.left || 16) + (fill?.padding?.right || 16)),
              height: safeBounds.h,
              text: placeholderText,
              fontSize: 16,
              fill: '#999999',
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'normal',
              align: 'left',
              verticalAlign: 'middle',
            },
          } as CanvasTextInstance,
        ],
      };
      return inputGroup;
    }

    // Default: convert to rectangle
    const rect: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w,
        height: safeBounds.h,
        fill: getColorValue(fill),
        stroke: stroke?.hex || stroke?.token ? getStrokeColor(stroke) : undefined,
        strokeWidth: stroke?.width || 0,
        cornerRadius: getCornerRadius(border_radius),
      },
    };
    return rect;
  } catch (error) {
    console.error('[Node Converter] Error converting node:', error, node);
    return {
      id: node?.id || 'error',
      name: node?.name || 'Error',
      type: 'rectangle',
      object: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#CCCCCC',
      },
    } as CanvasRectInstance;
  }
};

/**
 * Converts a Node from the Design AI API to a CanvasInstance
 * Wrapped in try-catch for safety
 * NOTE: This version filters out placeholders and fallbacks (for design generation)
 * For edit operations, use convertNodeToCanvasInstanceForEdit instead
 */
export const convertNodeToCanvasInstance = (node: any): CanvasInstance => {
  try {
    // Validate node structure
    if (!node || !node.id || !node.type) {
      console.error('[Node Converter] Invalid node:', node);
      // Return a minimal safe instance
      return {
        id: node?.id || 'invalid',
        name: node?.name || 'Invalid',
        type: 'rectangle',
        object: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fill: '#CCCCCC',
        },
      } as CanvasRectInstance;
    }
    
    // Safely destructure with defaults to avoid undefined errors
    const { 
      id, 
      name, 
      type, 
      bounds = { x: 0, y: 0, w: 100, h: 100 }, 
      fill, 
      stroke, 
      text, 
      font_token, 
      typography, 
      children, 
      visible, 
      border_radius,
    } = node;
    
    // Safely get placeholder - it might not exist in all nodes
    const placeholder = node.placeholder;
    
    // Ensure bounds has all required properties
    const safeBounds = {
      x: bounds?.x ?? 0,
      y: bounds?.y ?? 0,
      w: bounds?.w ?? 100,
      h: bounds?.h ?? 100,
    };
    
    // Skip invisible nodes
    if (visible === false) {
    // Return a minimal placeholder that won't render
    return {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: 0,
        height: 0,
        fill: 'transparent',
        visible: false,
      },
    } as CanvasRectInstance;
  }

  if (type === 'frame') {
    const isRootFrame = id.includes('root') || (safeBounds.x === 0 && safeBounds.y === 0 && safeBounds.w >= 1000);
    
    if (isRootFrame && children && children.length > 0) {
      const convertedChildren = children
        .map((child, index) => {
          try {
            return convertNodeToCanvasInstance(child);
          } catch (error) {
            console.error(`[Node Converter] Error converting child ${index}:`, error, child);
            return null;
          }
        })
        .filter((child): child is CanvasInstance => {
          if (!child) return false;
          
          const childId = child.id || '';
          const childName = child.name || '';
          
          const isBackgroundFrame = (childId.includes('background') || childName.toLowerCase().includes('background')) &&
                                    child.type === 'group' &&
                                    (child as CanvasGroup).children &&
                                    (child as CanvasGroup).children.length > 0 &&
                                    (child as CanvasGroup).children.every((grandchild: CanvasInstance) => 
                                      grandchild.id === 'placeholder' || 
                                      grandchild.name === 'Placeholder' ||
                                      (grandchild.type === 'text' && (grandchild as any).object?.text?.includes('Add your content'))
                                    );
          
          if (isBackgroundFrame) {
            return false;
          }
          
          const isFallback = childId.includes('fallback') || 
                            childName.toLowerCase().includes('error') ||
                            childName.toLowerCase().includes('fallback') ||
                            childName.toLowerCase().includes('encountered errors');
          
          if (isFallback) {
            return false;
          }
          
          if (child.type === 'rectangle') {
            const rect = child as CanvasRectInstance;
            if (rect.object && rect.object.width === 0 && rect.object.height === 0) {
              return false;
            }
          }
          if (!child.id || !child.type) {
            return false;
          }
          return true;
        });
      
      // Create a group with all children
      const frameGroup: CanvasGroup = {
        id,
        name,
        type: 'group',
        isOpen: true,
        children: convertedChildren,
      };
      return frameGroup;
    }
    
    const isBackgroundFrame = (id.includes('background') || name.toLowerCase().includes('background')) &&
                              children && children.length > 0 &&
                              children.every((child: any) => 
                                child.id === 'placeholder' || 
                                child.name === 'Placeholder' ||
                                (child.type === 'text' && (child.text === 'Add your content here' || child.text?.includes('Add your content')))
                              );
    
    if (isBackgroundFrame) {
      return null as any;
    }
    
    const fillValue = getColorValue(fill, safeBounds.w, safeBounds.h);
    const isGradient = fillValue && typeof fillValue === 'object' && fillValue.fillLinearGradientColorStops;
    
    const convertedChildren = children
      ? children
          .map((child, index) => {
            try {
              return convertNodeToCanvasInstance(child);
            } catch (error) {
              console.error(`[Node Converter] Error converting nested frame child ${index}:`, error, child);
              return null;
            }
          })
          .filter((child): child is CanvasInstance => {
            if (!child) return false;
            
            // Filter out invisible children (zero-sized rectangles)
            if (child.type === 'rectangle') {
              const rect = child as CanvasRectInstance;
              if (rect.object && rect.object.width === 0 && rect.object.height === 0) {
                return false;
              }
            }
            
            if (child.id === 'placeholder' || child.name === 'Placeholder') {
              return false;
            }
            
            // Ensure child has valid id and type
            if (!child.id || !child.type) {
              return false;
            }
            
            return true;
          })
      : [];
    
    const hasRealContent = convertedChildren.length > 0;
    
    const frameGroup: CanvasGroup = {
      id,
      name,
      type: 'group',
      isOpen: true,
      children: [
        ...(hasRealContent ? [{
          id: `${id}-bg`,
          name: `${name} Background`,
          type: 'rectangle',
          object: {
            x: safeBounds.x,
            y: safeBounds.y,
            width: safeBounds.w,
            height: safeBounds.h,
            fill: isGradient ? undefined : (fillValue as string || '#FFFFFF'),
            ...(isGradient ? fillValue : {}), // Spread gradient config if it's a gradient
            stroke: getStrokeColor(stroke),
            strokeWidth: stroke?.width || 0,
            cornerRadius: getCornerRadius(border_radius),
          },
        } as CanvasRectInstance] : []),
        ...convertedChildren,
      ],
    };
    return frameGroup;
  }

  // Handle groups
  if (type === 'group') {
    const convertedChildren = children
      ? children
          .map((child, index) => {
            try {
              return convertNodeToCanvasInstance(child);
            } catch (error) {
              console.error(`[Node Converter] Error converting group child ${index}:`, error, child);
              return null;
            }
          })
          .filter((child): child is CanvasInstance => child !== null && child !== undefined)
      : [];
    
    const group: CanvasGroup = {
      id,
      name,
      type: 'group',
      isOpen: true,
      children: convertedChildren,
    };
    return group;
  }

  // Handle rectangles
  if (type === 'rect') {
    const fillValue = getColorValue(fill, safeBounds.w, safeBounds.h);
    const isGradient = fillValue && typeof fillValue === 'object' && fillValue.fillLinearGradientColorStops;
    
    // Debug logging for color conversion
    if (fill?.token) {
      console.log('[Node Converter] Converting rect fill token:', {
        token: fill.token,
        convertedHex: fillValue,
        nodeId: id,
        nodeName: name
      });
    }
    
    const rect: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w,
        height: safeBounds.h,
        fill: isGradient ? undefined : (fillValue as string || '#000000'),
        ...(isGradient ? fillValue : {}), // Spread gradient config if it's a gradient
        stroke: stroke?.hex || stroke?.token ? getStrokeColor(stroke) : undefined,
        strokeWidth: stroke?.width || 0,
        cornerRadius: getCornerRadius(border_radius),
      },
    };
    return rect;
  }

  // Handle buttons (as rectangles, or groups with text if text is provided)
  if (type === 'button') {
    // If button has text, create a group with rectangle and text
    if (text) {
      const buttonGroup: CanvasGroup = {
        id,
        name,
        type: 'group',
        isOpen: true,
        children: [
          {
            id: `${id}-rect`,
            name: `${name} Background`,
            type: 'rectangle',
            object: {
              x: safeBounds.x,
              y: safeBounds.y,
              width: safeBounds.w,
              height: safeBounds.h,
              fill: getColorValue(fill),
              stroke: stroke?.hex || stroke?.token ? getColorValue({ hex: stroke.hex, token: stroke.token }) : undefined,
              strokeWidth: stroke?.width || 1,
              cornerRadius: getCornerRadius(border_radius) || 4,
            },
          } as CanvasRectInstance,
          {
            id: `${id}-text`,
            name: `${name} Text`,
            type: 'text',
            object: {
              x: safeBounds.x,
              y: safeBounds.y,
              width: safeBounds.w,
              height: safeBounds.h,
              text: text,
              fontSize: 16,
              fill: '#FFFFFF', // Default white text on buttons
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'normal',
              align: 'center',
              verticalAlign: 'middle',
            },
          } as CanvasTextInstance,
        ],
      };
      return buttonGroup;
    }
    
    // Button without text - just a rectangle
    const button: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w,
        height: safeBounds.h,
        fill: getColorValue(fill),
        stroke: stroke?.hex || stroke?.token ? getColorValue({ hex: stroke.hex, token: stroke.token }) : undefined,
        strokeWidth: stroke?.width || 1,
        cornerRadius: 4,
      },
    };
    return button;
  }

  // Handle text and headings
  if (type === 'text' || type === 'heading') {
    // Calculate font size from typography, font_token, or use default
    let fontSize = 16;
    let fontFamily = 'Inter, sans-serif';
    let fontStyle: 'normal' | 'bold' = 'normal';
    let textAlign: 'left' | 'center' | 'right' = 'left';
    
    if (typography) {
      // Handle font_size - can be number or string like "xl"
      const fontSizeValue = typography.font_size;
      if (typeof fontSizeValue === 'number') {
        fontSize = fontSizeValue;
      } else if (typeof fontSizeValue === 'string') {
        // Map string values to numbers
        const sizeMap: Record<string, number> = {
          'xs': 12,
          'sm': 14,
          'md': 16,
          'lg': 20,
          'xl': 24,
          '2xl': 32,
          '3xl': 40,
        };
        fontSize = sizeMap[fontSizeValue.toLowerCase()] || parseInt(fontSizeValue) || 16;
      } else {
        fontSize = 16;
      }
      
      fontFamily = typography.font_family === 'sans' ? 'Inter, sans-serif' : 'Inter, sans-serif';
      fontStyle = (typography.font_weight && typography.font_weight >= 600) ? 'bold' : 'normal';
      textAlign = (typography.text_align as any) || 'left';
    } else if (font_token) {
      const sizeMatch = font_token.match(/\d+/);
      if (sizeMatch) {
        fontSize = parseInt(sizeMatch[0]);
      } else {
        // Map common tokens
        const tokenSizeMap: Record<string, number> = {
          'type_scale.xs': 12,
          'type_scale.sm': 14,
          'type_scale.md': 16,
          'type_scale.lg': 20,
          'type_scale.xl': 24,
          'type_scale.2xl': 32,
        };
        fontSize = tokenSizeMap[font_token] || 16;
      }
    }
    
    // For headings, use larger default font
    if (type === 'heading' && !typography && !font_token) {
      fontSize = 24;
      fontStyle = 'bold';
    }
    
    // Get text content - prioritize text field, then placeholder, then name
    const textContent = (
      (text !== undefined && text !== null && String(text).trim()) ||
      (placeholder !== undefined && placeholder !== null && String(placeholder).trim()) ||
      (name && String(name).trim()) ||
      ''
    );
    
    // Get fill color - handle both old and new format
    const textFill = getColorValue(fill) || '#000000';
    
    const textInstance: CanvasTextInstance = {
      id,
      name,
      type: 'text',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w || 200,
        height: safeBounds.h || fontSize + 4,
        text: textContent,
        fontSize: fontSize,
        fill: typeof textFill === 'string' ? textFill : '#000000', // Ensure it's a string for text
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        align: textAlign,
        verticalAlign: 'top',
      },
    };
    return textInstance;
  }

  // Handle inputs (as groups with rectangle and placeholder text)
  if (type === 'input') {
    // Get placeholder text - API doesn't always provide it, so use name or default
    // Safely access placeholder - it might not exist in the node object
    // placeholder is already defined above from node.placeholder
    const placeholderText = (
      (text && String(text).trim()) || 
      (placeholder !== undefined && placeholder !== null && String(placeholder).trim()) || 
      (name && String(name).trim()) || 
      'Enter text...'
    );
    
    // Get fill color from API response
    const inputFill = getColorValue(fill) || '#FFFFFF';
    const inputStroke = getStrokeColor(stroke) || '#CCCCCC';
    
    // Get font size from typography if available
    const inputFontSize = typography?.font_size || 16;
    
    const inputGroup: CanvasGroup = {
      id,
      name,
      type: 'group',
      isOpen: true,
      children: [
        {
          id: `${id}-rect`,
          name: `${name} Input Field`,
          type: 'rectangle',
          object: {
            x: safeBounds.x,
            y: safeBounds.y,
            width: safeBounds.w,
            height: safeBounds.h,
            fill: inputFill,
            stroke: inputStroke,
            strokeWidth: stroke?.width || 1,
            cornerRadius: 4,
          },
        } as CanvasRectInstance,
        {
          id: `${id}-text`,
          name: `${name} Placeholder`,
          type: 'text',
          object: {
            x: safeBounds.x + 8,
            y: safeBounds.y + safeBounds.h / 2,
            width: safeBounds.w - 16,
            height: safeBounds.h,
            text: placeholderText,
            fontSize: inputFontSize,
            fill: '#999999',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'normal',
            align: 'left',
            verticalAlign: 'middle',
          },
        } as CanvasTextInstance,
      ],
    };
    return inputGroup;
  }

  // Handle icons (as small rectangles for now - can be enhanced later)
  if (type === 'icon') {
    const icon: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w || 24,
        height: safeBounds.h || 24,
        fill: getColorValue(fill),
      },
    };
    return icon;
  }

  // Handle images (as rectangles for now - can be enhanced to load actual images)
  if (type === 'image') {
    const image: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w,
        height: safeBounds.h,
        fill: '#E0E0E0',
        stroke: '#CCCCCC',
        strokeWidth: 1,
      },
    };
    return image;
  }

  // Handle checkboxes and radio buttons (as small rectangles)
  if (type === 'checkbox' || type === 'radio') {
    const checkbox: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w || 20,
        height: safeBounds.h || 20,
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeWidth: 1,
      },
    };
    return checkbox;
  }

    // Default: convert to rectangle
    const defaultRect: CanvasRectInstance = {
      id,
      name,
      type: 'rectangle',
      object: {
        x: safeBounds.x,
        y: safeBounds.y,
        width: safeBounds.w,
        height: safeBounds.h,
        fill: getColorValue(fill),
      },
    };
    return defaultRect;
  } catch (error: any) {
    console.error('[Node Converter] ❌ Error converting node:', error, node);
    // Return a safe fallback instance
    return {
      id: node?.id || 'error-' + Date.now(),
      name: node?.name || 'Error',
      type: 'rectangle',
      object: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FF0000', // Red to indicate error
      },
    } as CanvasRectInstance;
  }
};

