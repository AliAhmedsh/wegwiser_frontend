import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const designAIApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/design-ai`,
  timeout: 120000, // 120 seconds for AI operations
  headers: API_CONFIG.HEADERS,
});

designAIApi.interceptors.request.use((config) => {
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

designAIApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

// Type definitions
export interface Node {
  id: string;
  name: string;
  type: 'frame' | 'group' | 'button' | 'input' | 'text' | 'heading' | 'rect' | 'icon' | 'image' | 'checkbox' | 'radio';
  bounds: { x: number; y: number; w: number; h: number };
  fill?: { 
    color?: string | null; 
    hex?: string | null; 
    token?: string | null; 
    gradient?: any | null;
  };
  stroke?: { 
    width?: number;
    color?: { token?: string; hex?: string };
    token?: string;
    hex?: string;
  } | null;
  text?: string | null;
  font_token?: string | null;
  typography?: {
    font_family?: string;
    font_size?: number;
    font_weight?: number;
    line_height?: string;
    letter_spacing?: string;
    text_align?: string;
  } | null;
  placeholder?: string;
  icon?: string | null;
  icon_key?: string;
  children?: Node[];
  visible?: boolean;
  locked?: boolean;
}

export interface GenerateAIRequest {
  prompt: string;
  viewport_w?: number;
  viewport_h?: number;
  use_multi_stage?: boolean;
}

export interface GenerateAIResponse {
  status: string;
  design: Node;
  metadata?: {
    stages_completed?: string[];
    total_time_ms?: number;
    retries?: number;
  };
}

export interface EditSelectedRequest {
  project_id: string;
  instruction: string;
  selected_node: Node;
  document: { id: string; children: Node[] };
}

export interface EditSelectedResponse {
  project_id: string;
  updated_node: Node;
  changes_summary: string;
}

export interface GenerateRequest {
  project_id: string;
  prompt: string;
  viewport_w?: number;
  viewport_h?: number;
  platform?: 'web' | 'ios' | 'android';
  tone?: 'clean' | 'bold' | 'playful' | 'enterprise';
  wireframe_level?: 'low' | 'mid';
}

export interface GenerateResponse {
  project_id: string;
  artboards: Array<{
    id: string;
    name: string;
    type: string;
    bounds: { x: number; y: number; w: number; h: number };
    children: Node[];
  }>;
  tokens_ref?: any;
  ops?: any[];
}

export interface EditRequest {
  project_id: string;
  instruction: string;
  canvas: { artboards: any[] };
}

export interface EditResponse {
  project_id: string;
  ops: Array<{
    op: string;
    path: number[];
    node?: Node;
  }>;
}

export interface CritiqueElement {
  id: string;
  role: 'button' | 'input' | 'label' | 'icon' | 'heading' | 'text' | 'checkbox';
  text?: string;
  bounds: { x: number; y: number; w: number; h: number };
  color?: string;
  bg_color?: string;
  font_size_px?: number;
  tap_target_px?: number;
  aria_label?: string;
}

export interface EvaluateCritiqueRequest {
  title: string;
  viewport_w?: number;
  viewport_h?: number;
  elements: CritiqueElement[];
  design_system_tokens?: any;
}

export interface EvaluateCritiqueResponse {
  overall: number;
  scores: Array<{
    key: string;
    label: string;
    score: number;
  }>;
  issues: Array<{
    id: string;
    heuristic: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    target_id?: string;
    suggestion?: string;
    patch?: any;
  }>;
  notes?: string;
}

export interface CanvasOperation {
  op: 'create' | 'update' | 'delete';
  path: number[];
  node?: Node;
  patch?: any;
}

export interface ApplyCanvasRequest {
  project_id: string;
  ops: CanvasOperation[];
}

export interface CanvasInitResponse {
  project_id: string;
  artboards: Array<{
    id: string;
    name: string;
    type: string;
    bounds: { x: number; y: number; w: number; h: number };
    children: Node[];
  }>;
  tokens_ref?: any;
  layer_names_preserved?: boolean;
}

export interface CreateShapeRequest {
  project_id: string;
  parent_path: number[];
  shape: Node;
}

export interface UpdateShapeRequest {
  project_id: string;
  node_id: string;
  updates: Partial<Node>;
}

export interface DeleteShapeRequest {
  project_id: string;
  node_id: string;
}

export interface BulkUpdateRequest {
  node_id: string;
  changes: Partial<Node>;
}

export interface DesignSystemRequest {
  project_id: string;
  brand_url?: string;
  palette_hex?: string[];
  typefaces?: string[];
  tone?: string;
  base?: string;
}

export interface DesignSystemResponse {
  base?: string;
  tokens?: {
    spacing?: number[];
    grid?: { cols: number; gutter: number; margin: number };
    radius?: { sm: number; md: number; lg: number };
    states?: { hover: number; pressed: number; disabled: number };
    a11y?: { min_contrast: number; focus_outline: string };
    type_scale?: { xs: number; sm: number; md: number; lg: number; xl: number; '2xl': number };
  };
}

export interface QueryLearningRequest {
  topic: string;
  context?: string;
  k?: number;
}

export interface QueryLearningResponse {
  topic: string;
  bullets: Array<{
    bullet: string;
    source_id: string;
    score: number;
    metadata?: any;
  }>;
  note?: string;
}

export interface ExpandStoriesRequest {
  product: string;
  stories: Array<{
    id: string;
    as_a: string;
    i_want: string;
    so_that: string;
  }>;
}

export interface ExpandStoriesResponse {
  features: Array<{
    id: string;
    title: string;
    description: string;
    acceptance_criteria: string[];
    ux_targets: string[];
    dependencies: any[];
  }>;
  sitemap: string[];
  flow: Array<{
    id: string;
    type: string;
    label: string;
    next: string[];
  }>;
  notes?: string;
}

export interface TelemetryEvent {
  event: string;
  meta: {
    used_token?: boolean;
    contrast_ok?: boolean;
    snap_to_grid?: boolean;
    [key: string]: any;
  };
}

export interface IngestTelemetryRequest {
  project_id: string;
  events: TelemetryEvent[];
}

export interface SkillProfileResponse {
  token_discipline: number;
  a11y_awareness: number;
  layout_rigor: number;
  notes: string[];
}

export const designAIService = {
  // Design Generation APIs
  generateAI: async (data: GenerateAIRequest): Promise<GenerateAIResponse> => {
    const response = await designAIApi.post('/generate-ai', data);
    return response.data;
  },

  editSelected: async (data: EditSelectedRequest): Promise<EditSelectedResponse> => {
    const response = await designAIApi.post('/edit-selected', data);
    return response.data;
  },

  generate: async (data: GenerateRequest): Promise<GenerateResponse> => {
    const response = await designAIApi.post('/generate', data);
    return response.data;
  },

  edit: async (data: EditRequest): Promise<EditResponse> => {
    const response = await designAIApi.post('/edit', data);
    return response.data;
  },

  // Critique APIs
  evaluateCritique: async (data: EvaluateCritiqueRequest): Promise<EvaluateCritiqueResponse> => {
    const response = await designAIApi.post('/critique/evaluate', data);
    return response.data;
  },

  autofixDryrun: async (data: { doc: any }): Promise<any> => {
    const response = await designAIApi.post('/critique/autofix-dryrun', data);
    return response.data;
  },

  evaluateCritiqueStandardized: async (data: {
    title: string;
    elements: CritiqueElement[];
    user_query?: string;
    platform?: string;
  }): Promise<EvaluateCritiqueResponse> => {
    const response = await designAIApi.post('/design-ai-critique/evaluate', data);
    return response.data;
  },

  
  initCanvas: async (projectId: string): Promise<any> => {
  
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/init`,
      {},
      {
        params: { project_id: projectId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  applyCanvas: async (data: ApplyCanvasRequest): Promise<any> => {
  
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/apply`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  getCanvas: async (projectId: string): Promise<any> => {
   
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.get(
      `${fastApiUrl}/canvas/get`,
      {
        params: { project_id: projectId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  createShape: async (data: {
    project_id: string;
    parent_path: number[];
    shape: Node;
  }): Promise<any> => {

    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/create_shape`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  updateShape: async (data: {
    project_id: string;
    node_id: string;
    updates: Partial<Node>;
  }): Promise<any> => {

    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/update_shape`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  deleteShape: async (data: {
    project_id: string;
    node_id: string;
  }): Promise<any> => {
   
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/delete_shape`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  bulkUpdate: async (projectId: string, updates: Array<{
    node_id: string;
    changes: Partial<Node>;
  }>): Promise<any> => {
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/canvas/bulk_update`,
      { 
        project_id: projectId,
        updates: updates
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  // Design System APIs
  discoverDesignSystem: async (data: DesignSystemRequest): Promise<DesignSystemResponse> => {
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/ds/discover`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  proposeDesignSystem: async (data: DesignSystemRequest): Promise<DesignSystemResponse> => {
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/ds/propose`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  approveDesignSystem: async (data: {
    project_id: string;
    approve_palette?: boolean;
    approve_tokens?: boolean;
    approve_typography?: boolean;
  }): Promise<any> => {
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.post(
      `${fastApiUrl}/ds/approve`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  getDesignSystem: async (projectId: string): Promise<DesignSystemResponse> => {
    const fastApiUrl = API_CONFIG.FASTAPI_URL;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    const response = await axios.get(
      `${fastApiUrl}/ds/get`,
      {
        params: { project_id: projectId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        timeout: 120000
      }
    );
    return response.data;
  },

  // Icons APIs
  proposeIcons: async (projectId: string, style: string = 'stroke', source: string = 'lucide'): Promise<any> => {
    const response = await designAIApi.post('/icons/propose', {}, {
      params: { project_id: projectId, style, source }
    });
    return response.data;
  },

  getIcons: async (projectId: string): Promise<any> => {
    const response = await designAIApi.get('/icons/get', {
      params: { project_id: projectId }
    });
    return response.data;
  },

  // Learning (RAG) API
  queryLearning: async (data: QueryLearningRequest): Promise<QueryLearningResponse> => {
    const response = await designAIApi.post('/learning/query', data);
    return response.data;
  },

  // Stories API
  expandStories: async (data: ExpandStoriesRequest): Promise<ExpandStoriesResponse> => {
    const response = await designAIApi.post('/stories/expand', data);
    return response.data;
  },

  // Export API
  exportSVG: async (projectId: string): Promise<Blob> => {
    const response = await designAIApi.get('/export/svg.zip', {
      params: { project_id: projectId },
      responseType: 'blob'
    });
    return response.data;
  },

  // Skills & Telemetry APIs
  ingestTelemetry: async (data: IngestTelemetryRequest): Promise<any> => {
    const response = await designAIApi.post('/skills/ingest', data);
    return response.data;
  },

  getSkillProfile: async (projectId: string): Promise<SkillProfileResponse> => {
    const response = await designAIApi.get('/skills/profile', {
      params: { project_id: projectId }
    });
    return response.data;
  }
};

export default designAIService;

