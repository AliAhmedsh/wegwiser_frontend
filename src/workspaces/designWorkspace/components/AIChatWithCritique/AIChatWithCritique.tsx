'use client';

import DesignWorkspaceAIChat from '@/workspaces/designWorkspace/components/DesignWorkspaceAIChat/DesignWorkspaceAIChat';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import { useProductStore } from '@/entities/product/store';
import designAIService from '@/lib/api/services/designAIService';
import useDesignWorkspaceAIStore from '@/workspaces/designWorkspace/store/designWorkspaceAIStore';
import { useState } from 'react';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useDesignWorkspaceStore as useDesignWorkspaceAPIStore } from '@/entities/designWorkspace/store/designWorkspaceStore';
import { designWorkspaceService } from '@/entities/designWorkspace/api/designWorkspaceService';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

// Helper function to convert backend elements to critique elements
const convertBackendElementsToCritique = (backendElements: any[]): any[] => {
  const elements: any[] = [];

  backendElements.forEach((element) => {
    const properties = element.properties || {};
    const position = element.position || { x: 0, y: 0 };
    const size = element.size || { width: 0, height: 0 };

    let bounds = {
      x: position.x || 0,
      y: position.y || 0,
      w: size.width || 100,
      h: size.height || 100
    };

    let role: string = 'text';
    let text: string | undefined;
    let color: string | undefined;
    let bg_color: string | undefined;
    let font_size_px: number | undefined;

    // Determine role based on element type
    if (element.type === 'text') {
      role = 'text';
      text = properties.text || element.name || 'Text';
      font_size_px = properties.fontSize || 16;
      color = properties.fill || properties.color || '#000000';
      bounds.h = bounds.h || 20;
    } else if (element.type === 'rectangle' || element.type === 'ellipse') {
      role = 'rect';
      bg_color = properties.fill || properties.bg_color || '#CCCCCC';
      bounds.w = bounds.w || 100;
      bounds.h = bounds.h || 100;
    } else if (element.type === 'button') {
      role = 'button';
      text = properties.text || element.name || 'Button';
      bg_color = properties.fill || properties.bg_color || '#627899';
      color = properties.stroke || properties.color || '#FFFFFF';
      font_size_px = properties.fontSize || 14;
      bounds.w = bounds.w || 120;
      bounds.h = bounds.h || 40;
    } else if (element.type === 'input') {
      role = 'input';
      text = properties.placeholder || element.name || 'Input';
      bg_color = properties.fill || '#FFFFFF';
      color = properties.stroke || '#000000';
      font_size_px = properties.fontSize || 14;
      bounds.w = bounds.w || 200;
      bounds.h = bounds.h || 40;
    } else if (element.type === 'heading') {
      role = 'heading';
      text = properties.text || element.name || 'Heading';
      font_size_px = properties.fontSize || 24;
      color = properties.fill || properties.color || '#000000';
      bounds.w = bounds.w || 300;
      bounds.h = bounds.h || 30;
    } else {
      // Generic element
      role = 'text';
      text = element.name || element.type;
      bg_color = properties.fill || undefined;
      color = properties.stroke || properties.color || undefined;
    }

    // Only add element if it has meaningful data
    if (role && (text || bounds.w > 0 || bounds.h > 0)) {
      elements.push({
        id: `element-${element.id || Date.now()}-${Math.random()}`,
        role,
        text: text || undefined, // Only include if present
        bounds: {
          x: bounds.x,
          y: bounds.y,
          w: Math.max(bounds.w, 1), // Ensure non-zero width
          h: Math.max(bounds.h, 1)  // Ensure non-zero height
        },
        color: color || undefined,
        bg_color: bg_color || undefined,
        font_size_px: font_size_px || undefined,
        tap_target_px: Math.max(bounds.w, bounds.h, 44) // Minimum 44px for accessibility
      });
    }
  });

  return elements;
};

// Helper function to convert canvas instances to critique elements
const convertCanvasToCritiqueElements = (layers: CanvasInstance[]): any[] => {
  const elements: any[] = [];

  const processInstance = (instance: CanvasInstance) => {
    if (instance.type === 'group') {
      // Process group children
      instance.children.forEach(child => processInstance(child));
      return;
    }

    // Get bounds from object
    const obj = instance.object;
    if (!obj) return;

    let bounds = { x: 0, y: 0, w: 0, h: 0 };
    let role: string = 'text';
    let text: string | undefined;
    let color: string | undefined;
    let bg_color: string | undefined;
    let font_size_px: number | undefined;

    // Extract bounds and properties based on type
    if ('x' in obj && 'y' in obj) {
      bounds.x = obj.x || 0;
      bounds.y = obj.y || 0;
    }

    if (instance.type === 'text') {
      role = 'text';
      text = obj.text || instance.name;
      font_size_px = obj.fontSize || 16;
      color = typeof obj.fill === 'string' ? obj.fill : undefined;
      if ('width' in obj) bounds.w = obj.width || 100;
      if ('height' in obj) bounds.h = obj.height || 20;
    } else if (instance.type === 'rectangle' || instance.type === 'ellipse') {
      role = 'rect';
      bg_color = typeof obj.fill === 'string' ? obj.fill : undefined;
      if ('width' in obj) bounds.w = obj.width || 100;
      if ('height' in obj) bounds.h = obj.height || 100;
    } else if (instance.type === 'button') {
      role = 'button';
      text = instance.name;
      bg_color = typeof obj.fill === 'string' ? obj.fill : undefined;
      color = typeof obj.stroke === 'string' ? obj.stroke : undefined;
      if ('width' in obj) bounds.w = obj.width || 100;
      if ('height' in obj) bounds.h = obj.height || 40;
    } else {
      // For other types, use generic properties
      if ('width' in obj) bounds.w = obj.width || 50;
      if ('height' in obj) bounds.h = obj.height || 50;
    }

    // Only add element if it has meaningful bounds or text
    if (bounds.w > 0 && bounds.h > 0) {
      elements.push({
        id: instance.id || `canvas-${Date.now()}-${Math.random()}`,
        role,
        text: text || undefined, // Only include if present
        bounds: {
          x: bounds.x,
          y: bounds.y,
          w: Math.max(bounds.w, 1), // Ensure non-zero width
          h: Math.max(bounds.h, 1)  // Ensure non-zero height
        },
        color: color || undefined,
        bg_color: bg_color || undefined,
        font_size_px: font_size_px || undefined,
        tap_target_px: Math.max(bounds.w, bounds.h, 44)
      });
    }
  };

  layers.forEach(layer => processInstance(layer));
  return elements;
};

interface AIChatWithCritiqueProps {
  onClose?: () => void;
}

export default function AIChatWithCritique({ onClose }: AIChatWithCritiqueProps) {
  const { layers } = useCanvasLayersStore();
  const { stageSize } = useDesignWorkspaceStore();
  const { chosenProduct } = useProductStore();
  const { sendMessage, addMessage, isLoading } = useDesignWorkspaceAIStore();
  const { currentPage, currentPageId } = useDesignWorkspaceAPIStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const [isCritiquing, setIsCritiquing] = useState(false);

  const handleAskCritique = async () => {
    if (!chosenProduct || isCritiquing || isLoading) return;

    setIsCritiquing(true);

    try {
      let elements: any[] = [];

      // First, try to get elements from backend (more reliable)
      if (currentPageId) {
        try {
          const backendResponse = await designWorkspaceService.getPageAllLayersElements(currentPageId);
          if (backendResponse.success && backendResponse.elements && backendResponse.elements.length > 0) {
            console.log('📦 Fetched elements from backend:', backendResponse.elements.length);
            elements = convertBackendElementsToCritique(backendResponse.elements);
          }
        } catch (error) {
          console.warn('Failed to fetch from backend, trying canvas store:', error);
        }
      }

      // Fallback: Use canvas layers store if backend fetch failed or returned empty
      if (elements.length === 0 && layers.length > 0) {
        console.log('📦 Using canvas layers store:', layers.length);
        elements = convertCanvasToCritiqueElements(layers);
      }

      if (elements.length === 0) {
        addMessage('No design elements found on canvas. Please add some elements (text, buttons, shapes, etc.) to your design first, then try asking for critique again.', 'AI');
        setIsCritiquing(false);
        return;
      }

      // Validate and enrich elements before sending
      const enrichedElements = elements.map((el, index) => {
        // Ensure all required fields are present
        return {
          id: el.id || `element-${index}`,
          role: el.role || 'text',
          text: el.text || el.label || '',
          bounds: el.bounds || { x: 0, y: 0, w: 100, h: 100 },
          color: el.color,
          bg_color: el.bg_color,
          font_size_px: el.font_size_px,
          tap_target_px: el.tap_target_px || Math.max(el.bounds?.w || 100, el.bounds?.h || 100, 44),
          ...el // Include any other fields
        };
      });

      console.log('✅ Converted elements for critique:', {
        count: enrichedElements.length,
        elements: enrichedElements,
        sample: enrichedElements[0]
      });

      // Get current page name or use default
      const title = currentPage?.name || 'Design Canvas';
      
      // Build a comprehensive user query that helps the AI understand the context
      const userQuery = `Review and critique the design "${title}". Analyze usability, accessibility, visual hierarchy, spacing, color contrast, and overall design best practices. Provide specific, actionable feedback.`;
      
      // Add user message first
      addMessage('Review this design', 'User');

      // Call critique API with enriched data
      const critiqueResponse = await designAIService.evaluateCritiqueStandardized({
        title,
        elements: enrichedElements,
        user_query: userQuery,
        platform: 'web'
      });

      // Format the critique response with proper structure
      const overallScore = (critiqueResponse.overall * 100).toFixed(0);
      const scoreNum = parseFloat(overallScore);
      
      // Build formatted message with proper markdown-like structure
      let critiqueMessage = `## Design Critique Results\n\n`;
      
      // Overall Score section with professional styling
      const scoreStatus = scoreNum >= 70 ? 'Excellent' : scoreNum >= 50 ? 'Needs Improvement' : 'Critical';
      critiqueMessage += `### Overall Score: **${overallScore}%** (${scoreStatus})\n\n`;

      // Scores section with better formatting
      if (critiqueResponse.scores && critiqueResponse.scores.length > 0) {
        critiqueMessage += `### Detailed Scores\n\n`;
        critiqueResponse.scores.forEach(score => {
          const scorePercent = (score.score * 100).toFixed(0);
          const scoreValue = parseFloat(scorePercent);
          const scoreStatus = scoreValue >= 70 ? 'Good' : scoreValue >= 50 ? 'Fair' : 'Poor';
          critiqueMessage += `**${score.label}:** ${scorePercent}% (${scoreStatus})\n`;
        });
        critiqueMessage += `\n`;
      } else {
        // If no scores, add a note
        critiqueMessage += `### Detailed Scores\n\n`;
        critiqueMessage += `No detailed scores available for this critique.\n\n`;
      }

      // Issues section - handle long detailed messages with better formatting
      if (critiqueResponse.issues && critiqueResponse.issues.length > 0) {
        critiqueMessage += `### Issues Found (${critiqueResponse.issues.length})\n\n`;
        critiqueResponse.issues.forEach((issue, index) => {
          const severityText = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
          critiqueMessage += `#### ${index + 1}. ${issue.heuristic} - **${severityText} Severity**\n\n`;
          
          // Format the issue message - preserve markdown formatting
          if (issue.message) {
            // Split long messages into paragraphs for better readability
            const messageLines = issue.message.split('\n\n');
            messageLines.forEach((line: string) => {
              if (line.trim()) {
                critiqueMessage += `${line.trim()}\n\n`;
              }
            });
          }
          
          if (issue.suggestion && issue.suggestion.trim()) {
            critiqueMessage += `**Suggestion:** ${issue.suggestion}\n\n`;
          }
        });
      } else {
        critiqueMessage += `### Issues Found\n\n`;
        critiqueMessage += `No issues detected. The design meets all quality standards.\n\n`;
      }

      // Next Steps section with better formatting
      if (critiqueResponse.next_steps && critiqueResponse.next_steps.length > 0) {
        critiqueMessage += `### Recommended Next Steps\n\n`;
        critiqueResponse.next_steps.forEach((step, index) => {
          critiqueMessage += `${index + 1}. ${step}\n`;
        });
        critiqueMessage += `\n`;
      }

      // Send critique as AI message
      addMessage(critiqueMessage, 'AI');

    } catch (error: any) {
      console.error('Critique error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to get design critique';
      addMessage(
        `Sorry, I couldn't analyze your design. Error: ${errorMessage}`,
        'AI'
      );
    } finally {
      setIsCritiquing(false);
    }
  };

  return (
    <div className="relative h-full">
      <DesignWorkspaceAIChat 
        onAskCritique={handleAskCritique}
        isCritiquing={isCritiquing}
        onClose={onClose}
      />
    </div>
  );
}

