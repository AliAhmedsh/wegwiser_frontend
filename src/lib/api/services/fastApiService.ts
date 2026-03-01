import axios from '@/lib/config/axiosConfig';
import { API_CONFIG, getCookie } from '@/lib/config/api';

interface ExternalAPIRequest {
  api_name: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
}

interface ExternalAPIResponse {
  success: boolean;
  status: number;
  data: any;
  headers?: Record<string, string>;
}

class FastApiService {
  private static _instance: FastApiService | null = null;
  private baseURL = API_CONFIG.FASTAPI_URL;

  private constructor() {}

  static getInstance(): FastApiService {
    if (!FastApiService._instance) {
      FastApiService._instance = new FastApiService();
    }
    return FastApiService._instance;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = getCookie('access_token') || getCookie('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async callExternalAPI(request: ExternalAPIRequest): Promise<ExternalAPIResponse> {
    const response = await axios.post(
      `${this.baseURL}/api/external`,
      {
        api_name: request.api_name,
        method: request.method || 'POST',
        url: request.url,
        headers: request.headers,
        body: request.body,
        params: request.params,
        timeout: request.timeout || 30000,
      },
      {
        headers: this.getAuthHeaders(),
        timeout: (request.timeout || 30000) + 5000,
      }
    );
    return response.data;
  }

  async refineDoc(userId: string, files: File[]): Promise<any> {
    console.log('[FastAPI] Calling /pm/refine-doc with userId:', userId, 'files:', files.length);
    const formData = new FormData();
    formData.append('user_id', userId);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(
        `${this.baseURL}/pm/refine-doc`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
        }
      );
      console.log('[FastAPI] /pm/refine-doc response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /pm/refine-doc error:', error.response?.data || error.message);
      throw error;
    }
  }

  async submitWorkflow(title: string, content: string, userId: string, productId?: number): Promise<any> {
    const payload: any = {
      title,
      content,
      user_id: userId,
    };
    
    if (productId) {
      payload.product_id = productId;
    }
    
    const response = await axios.post(
      `${this.baseURL}/workflow/submit`,
      payload,
      {
        headers: this.getAuthHeaders(),
        timeout: 30000,
      }
    );
    return response.data;
  }

  async vehicleStep1Basics(userId: string, prdId: string, productId: number, createdBy: number): Promise<any> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    params.append('product_id', productId.toString());
    params.append('created_by', createdBy.toString());
    params.append('prd_id', prdId);

    const response = await axios.post(
      `${this.baseURL}/vehicle/step1-basics`,
      params.toString(),
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000,
      }
    );
    return response.data;
  }

  async vehicleStep2Assumptions(userId: string, vehicleId: number = 0): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/vehicle/step2-assumptions`,
      {
        user_id: userId,
        vehicle_id: vehicleId,
      },
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );
    return response.data;
  }

  async vehicleStep3Finalize(userId: string, vehicleId: number, feedback?: string, files?: File[]): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('vehicle_id', vehicleId.toString());
    
    if (feedback) {
      formData.append('feedback', feedback);
    }
    
    console.log('FastAPI Service - Files received:', files);
    console.log('FastAPI Service - Files count:', files?.length || 0);
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        console.log(`FastAPI Service - Appending file ${index + 1}:`, file.name, file.size, file.type);
        formData.append('files', file);
      });
    } else {
      console.log('FastAPI Service - No files to append');
    }

    console.log('FastAPI Service - FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const response = await axios.post(
      `${this.baseURL}/vehicle/step3-finalize`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      }
    );
    return response.data;
  }

  async vehiclePersist(prdId: string, vehicles: any[], productId: number, createdBy: number): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/vehicle/persist`,
      {
        prd_id: prdId,
        vehicles: vehicles,
        product_id: productId,
        created_by: createdBy,
      },
      {
        headers: this.getAuthHeaders(),
        timeout: 180000,
      }
    );
    return response.data;
  }

  async getVehiclesByIds(ids: number[]): Promise<any> {
    console.log('[FastAPI] Calling /vehicle/by-ids with ids:', ids);
    const idsParam = ids.join(',');
    try {
      const response = await axios.get(
        `${this.baseURL}/vehicle/by-ids`,
        {
          params: {
            ids: idsParam,
          },
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] /vehicle/by-ids response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/by-ids error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getVehiclesByProduct(productId: number, page: number = 1, pageSize: number = 5): Promise<any> {
    console.log('[FastAPI] Calling /vehicle/by-product with product_id:', productId, 'page:', page, 'page_size:', pageSize);
    try {
      const response = await axios.get(
        `${this.baseURL}/vehicle/by-product/${productId}`,
        {
          params: {
            page: Math.max(1, page),
            page_size: Math.min(100, Math.max(1, pageSize)),
          },
          headers: this.getAuthHeaders(),
          timeout: 60000,
        }
      );
      console.log('[FastAPI] /vehicle/by-product response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/by-product error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateCodeByVehicle(
    prdId: string,
    vehicleId: number,
    filename: string,
    target?: string,
    instruction?: string,
    language?: string,
    framework?: string
  ): Promise<any> {
    const payload: any = {
      prd_id: prdId,
      vehicle_id: vehicleId,
      filename: filename,
    };

    if (target) payload.target = target;
    if (instruction) payload.instruction = instruction;
    if (language) payload.language = language;
    if (framework) payload.framework = framework;

    const response = await axios.post(
      `${this.baseURL}/engineering/generate-by-vehicle`,
      payload,
      {
        headers: this.getAuthHeaders(),
        timeout: 120000,
      }
    );
    return response.data;
  }

  async evaluateCode(
    userId: number,
    vehicleId: number,
    code: Array<{ language: string; snippet: string }>,
    role: string,
    timeRange: { startTime: number; endTime: number }
  ): Promise<any> {
    console.log('[FastAPI] Calling POST /evaluation/evaluate:', {
      user_id: userId,
      vehicle_id: vehicleId,
      code_count: code.length,
      role,
      time_range: timeRange
    });
    
    try {
      const response = await axios.post(
        `${this.baseURL}/evaluation/evaluate`,
        {
          user_id: userId,
          vehicle_id: vehicleId,
          code: code,
          role: role,
          time_range: timeRange,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 120000,
        }
      );
      console.log('[FastAPI] /evaluation/evaluate response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /evaluation/evaluate error:', error.response?.data || error.message);
      throw error;
    }
  }

  async evaluateByVehicle(prdId: string, vehicleId: number): Promise<any> {
    console.log('[FastAPI] Calling POST /evaluation/evaluate:', {
      prd_id: prdId,
      vehicle_id: vehicleId
    });
    try {
      const response = await axios.post(
        `${this.baseURL}/evaluation/evaluate`,
        {
          prd_id: prdId,
          vehicle_id: vehicleId,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 120000,
        }
      );
      console.log('[FastAPI] /evaluation/evaluate response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /evaluation/evaluate error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPrdByProduct(productId: number): Promise<any> {
    console.log('[FastAPI] Calling GET /prd/by-product/{product_id} with product_id:', productId);
    try {
      const response = await axios.get(
        `${this.baseURL}/prd/by-product/${productId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 60000, // Increased to 60 seconds
        }
      );
      console.log('[FastAPI] /prd/by-product/{product_id} response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      const errorCode = error.code || error.response?.status;
      console.error('[FastAPI] /prd/by-product/{product_id} error:', errorMessage);
      console.error('[FastAPI] Error code/status:', errorCode);
      console.error('[FastAPI] Full error:', error);
      
      // Provide more specific error information
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('[FastAPI] Request timed out after 60 seconds');
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error('[FastAPI] Network error - check connection or FastAPI server status');
      }
      
      throw error;
    }
  }

  async getWorkflowStatus(prdId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/workflow/status/${prdId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /workflow/status error:', error.response?.data || error.message);
      throw error;
    }
  }

  async workflowPrdUpdate(data: WorkflowPrdUpdateRequest): Promise<WorkflowPrdUpdateResponse> {
    const body: Record<string, unknown> = {
      prd_id: data.prd_id,
      change_request: data.change_request,
      changed_by: data.changed_by,
    };
    if (data.change_reason != null && data.change_reason !== '') body.change_reason = data.change_reason;
    if (data.session_id != null && data.session_id !== '') body.session_id = data.session_id;
    if (data.insist_original === true) body.insist_original = true;
    try {
      const response = await axios.post(
        `${this.baseURL}/workflow/prd-update`,
        body,
        {
          headers: this.getAuthHeaders(),
          timeout: 60000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('[FastAPI] /workflow/prd-update timeout');
      } else if (error.code === 'ERR_CANCELED') {
        console.warn('[FastAPI] /workflow/prd-update cancelled');
      } else {
        console.error('[FastAPI] /workflow/prd-update error:', error.response?.data || error.message);
      }
      throw error;
    }
  }

  async workflowPrdUpdateApprove(data: { prd_id: string; change_batch_id?: string; approved: boolean }): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/workflow/prd-update/approve`,
      data,
      { headers: this.getAuthHeaders(), timeout: 30000 }
    );
    return response.data;
  }

  async workflowPrdManualUpdate(data: {
    prd_id: string;
    new_content: string;
    user_id: string;
    created_by: number;
    product_id?: number;
  }): Promise<PrdManualUpdateResponse> {
    const response = await axios.post(
      `${this.baseURL}/workflow/prd-manual-update`,
      data,
      {
        headers: this.getAuthHeaders(),
        timeout: 30000,
        validateStatus: (status) => status === 200 || status === 202,
      }
    );
    return response.data;
  }

  async getVehicleLeadMembers(vehicleId: number): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/vehicle/${vehicleId}/lead-members`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/{vehicleId}/lead-members error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Helper function to normalize role to API format
  private normalizeRoleForAPI(role: string | null | undefined): 'product_manager' | 'engineer' | 'designer' | null {
    if (!role) return null;
    
    const roleLower = role.toLowerCase().trim();
    
    // Map to API expected roles
    if (
      roleLower === 'product_manager' || 
      roleLower === 'product manager' || 
      roleLower === 'pm' ||
      (roleLower.includes('product') && roleLower.includes('manager'))
    ) {
      return 'product_manager';
    }
    
    if (
      roleLower === 'engineer' || 
      roleLower === 'eng' ||
      roleLower === 'engineer/qa' ||
      roleLower === 'qa'
    ) {
      return 'engineer';
    }
    
    if (
      roleLower === 'designer' || 
      roleLower === 'design' ||
      roleLower === 'ux/ui' ||
      roleLower === 'ux' ||
      roleLower === 'ui'
    ) {
      return 'designer';
    }
    
    return null;
  }

  async aiPartnerChat(data: {
    message: string;
    conversation_id?: number;
    product_id?: number;
    vehicle_id?: number;
    context_mode?: 'full' | 'compact';
  }): Promise<any> {
    const { context_mode, ...body } = data;
    const params = context_mode ? { context_mode } : {};
    try {
      const response = await axios.post(
        `${this.baseURL}/ai-partner/chat`,
        body,
        {
          params,
          headers: this.getAuthHeaders(),
          timeout: 120000,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /ai-partner/chat error:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  }

  async getAiPartnerConversations(limit: number = 50, offset: number = 0): Promise<any> {
    console.log('[FastAPI] Calling GET /ai-partner/conversations with limit:', limit, 'offset:', offset);
    try {
      const response = await axios.get(
        `${this.baseURL}/ai-partner/conversations`,
        {
          params: {
            limit: Math.min(Math.max(limit, 1), 200), // Clamp between 1 and 200
            offset: Math.max(offset, 0), // Ensure non-negative
          },
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] /ai-partner/conversations response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /ai-partner/conversations error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAiPartnerConversation(conversationId: number): Promise<any> {
    console.log('[FastAPI] Calling GET /ai-partner/conversations/' + conversationId);
    try {
      const response = await axios.get(
        `${this.baseURL}/ai-partner/conversations/${conversationId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] /ai-partner/conversations/' + conversationId + ' response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /ai-partner/conversations/' + conversationId + ' error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateAiPartnerConversationTitle(conversationId: number, title: string): Promise<any> {
    console.log('[FastAPI] Calling PUT /ai-partner/conversations/' + conversationId + ' with title:', title);
    
    // Validate title length (1-200 characters as per API)
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (title.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }
    
    try {
      const response = await axios.put(
        `${this.baseURL}/ai-partner/conversations/${conversationId}`,
        {
          title: title.trim(),
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] PUT /ai-partner/conversations/' + conversationId + ' response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] PUT /ai-partner/conversations/' + conversationId + ' error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteAiPartnerConversation(conversationId: number): Promise<any> {
    console.log('[FastAPI] Calling DELETE /ai-partner/conversations/' + conversationId);
    try {
      const response = await axios.delete(
        `${this.baseURL}/ai-partner/conversations/${conversationId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] DELETE /ai-partner/conversations/' + conversationId + ' response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] DELETE /ai-partner/conversations/' + conversationId + ' error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getVehicleMemberSkillMatch(vehicleId: number, order: 'asc' | 'desc' = 'desc'): Promise<any> {
    console.log('[FastAPI] Calling POST /member-skill-scores/vehicle-member-skill-match with vehicle_id:', vehicleId);
    try {
      const response = await axios.post(
        `${this.baseURL}/member-skill-scores/vehicle-member-skill-match`,
        {
          vehicle_id: vehicleId,
          order: order,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] /member-skill-scores/vehicle-member-skill-match response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      console.error('[FastAPI] /member-skill-scores/vehicle-member-skill-match error:', errorMessage);
      console.error('[FastAPI] Full error object:', error);
      // Don't throw for 404 errors (vehicle might not have members yet)
      if (error.response?.status === 404) {
        console.warn('[FastAPI] Vehicle member skill match returned 404, vehicle may not have members yet');
        return null;
      }
      throw error;
    }
  }

  async approveVehicle(vehicleId: number, userId: number, approvalType: string = 'vehicle', decision: string = 'approved'): Promise<any> {
    console.log('[FastAPI] Calling POST /vehicle/approve with vehicle_id:', vehicleId, 'user_id:', userId);
    try {
      const response = await axios.post(
        `${this.baseURL}/vehicle/approve`,
        {
          vehicle_id: vehicleId,
          user_id: userId,
          approval_type: approvalType,
          decision: decision,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        }
      );
      console.log('[FastAPI] /vehicle/approve response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/approve error:', error.response?.data || error.message);
      throw error;
    }
  }

  async analyzeVehicleImpact(vehicleIds: number[]): Promise<any> {
    console.log('[FastAPI] Calling POST /impact/analyze-vehicle with vehicle_ids:', vehicleIds);
    try {
      const response = await axios.post(
        `${this.baseURL}/impact/analyze-vehicle`,
        {
          vehicle_ids: vehicleIds,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 120000, // 2 minutes timeout for impact analysis
        }
      );
      console.log('[FastAPI] /impact/analyze-vehicle response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /impact/analyze-vehicle error:', error.response?.data || error.message);
      throw error;
    }
  }

  // POST /vehicle/assumption-conversation - Multi-turn conversation to refine Step 2 assumption text
  async vehicleAssumptionConversation(data: {
    conversation_id?: string;
    assumption_text?: string;
    user_message: string;
  }): Promise<{
    conversation_id: string;
    revised_assumption: string;
    status: 'COMPLETE' | 'PENDING';
  }> {
    console.log('[FastAPI] Calling POST /vehicle/assumption-conversation with data:', {
      conversation_id: data.conversation_id,
      has_assumption_text: !!data.assumption_text,
      user_message: data.user_message.substring(0, 50) + '...',
    });
    
    // Validate: assumption_text is required on first turn (when conversation_id is not provided)
    if (!data.conversation_id && !data.assumption_text) {
      throw new Error('assumption_text is required when starting a new conversation (no conversation_id provided)');
    }
    
    // Validate: user_message is required
    if (!data.user_message || data.user_message.trim().length === 0) {
      throw new Error('user_message is required');
    }
    
    try {
      const response = await axios.post(
        `${this.baseURL}/vehicle/assumption-conversation`,
        {
          conversation_id: data.conversation_id,
          assumption_text: data.assumption_text,
          user_message: data.user_message,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 120000, // 2 minutes timeout
        }
      );
      console.log('[FastAPI] /vehicle/assumption-conversation response:', {
        conversation_id: response.data.conversation_id,
        status: response.data.status,
        revised_assumption_length: response.data.revised_assumption?.length || 0,
      });
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/assumption-conversation error:', error.response?.data || error.message);
      throw error;
    }
  }

  async vehicleAssumptionConversationComplete(conversationId: string): Promise<{
    conversation_id: string;
    revised_assumption: string;
    status: 'COMPLETE' | 'PENDING';
  }> {
    console.log('[FastAPI] Calling POST /vehicle/assumption-conversation/complete with conversation_id:', conversationId);
    
    if (!conversationId || conversationId.trim().length === 0) {
      throw new Error('conversation_id is required');
    }
    
    try {
      const response = await axios.post(
        `${this.baseURL}/vehicle/assumption-conversation/complete`,
        {
          conversation_id: conversationId,
        },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000, // 30 seconds timeout
        }
      );
      console.log('[FastAPI] /vehicle/assumption-conversation/complete response:', {
        conversation_id: response.data.conversation_id,
        status: response.data.status,
        revised_assumption_length: response.data.revised_assumption?.length || 0,
      });
      return response.data;
    } catch (error: any) {
      console.error('[FastAPI] /vehicle/assumption-conversation/complete error:', error.response?.data || error.message);
      throw error;
    }
  }

  async vehicleElaborate(description: string): Promise<{ elaborated_description: string }> {
    if (!description || description.trim().length === 0) {
      throw new Error('description is required');
    }

    const response = await axios.post(
      `${this.baseURL}/vehicle/elaborate`,
      { description: description.trim() },
      {
        headers: this.getAuthHeaders(),
        timeout: 60000,
      }
    );
    return response.data;
  }

  async deleteVehicle(vehicleId: number): Promise<{ status: string; vehicle_id: number }> {
    const response = await axios.delete(
      `${this.baseURL}/vehicle/${vehicleId}`,
      {
        headers: this.getAuthHeaders(),
        timeout: 30000,
      }
    );
    return response.data;
  }

  async learningPsqlQuery(data: {
    product_id: number;
    topic: string;
    context?: string;
    k?: number;
    explanation_mode?: 'iconography' | 'symbolism' | 'semiotics';
  }): Promise<LearningPsqlQueryResponse> {
    if (!data.topic || data.topic.trim().length < 2) {
      throw new Error('topic is required and must be at least 2 characters');
    }
    const body: Record<string, unknown> = {
      product_id: data.product_id,
      topic: data.topic.trim(),
    };
    if (data.context != null && data.context !== '') body.context = data.context;
    if (data.k != null && data.k >= 1) body.k = data.k;
    if (data.explanation_mode) body.explanation_mode = data.explanation_mode;

    const response = await axios.post(
      `${this.baseURL}/learning/psql-query`,
      body,
      {
        headers: this.getAuthHeaders(),
        timeout: 60000,
      }
    );
    return response.data;
  }

  async contextAnalyze(data: ContentContextRequest): Promise<ContentContextResponse> {
    const response = await axios.post(
      `${this.baseURL}/context/analyze`,
      data,
      { headers: this.getAuthHeaders(), timeout: 60000 }
    );
    return response.data;
  }

  async contextExpand(data: ContentContextRequest): Promise<ContentContextResponse> {
    const response = await axios.post(
      `${this.baseURL}/context/expand`,
      data,
      { headers: this.getAuthHeaders(), timeout: 60000 }
    );
    return response.data;
  }

  async contextAsk(data: ContentContextRequest & { user_input: string }): Promise<ContentContextResponse> {
    if (!data.user_input || data.user_input.trim().length === 0) {
      throw new Error('user_input is required for /context/ask');
    }
    const response = await axios.post(
      `${this.baseURL}/context/ask`,
      data,
      { headers: this.getAuthHeaders(), timeout: 60000 }
    );
    return response.data;
  }
}

export interface ContentContextRequest {
  selected_content: string;
  product_id: number;
  vehicle_id?: number;
  current_context?: string;
  debug?: boolean;
}

export interface ContentContextResponse {
  result: string;
  action?: string;
  selected_content?: string;
  current_context?: string | null;
  background?: Record<string, unknown> | null;
  prd_document_id?: string | null;
  prd_title?: string | null;
  message?: string | null;
}

export interface PrdManualUpdateResponse {
  status: string;
  task_id: string;
  prd_id: string;
  message: string;
}

export interface WorkflowPrdUpdateRequest {
  prd_id: string;
  change_request: string;
  changed_by: number;
  change_reason?: string;
  session_id?: string;
  insist_original?: boolean;
}

export interface AiDecision {
  outcome: 'approved' | 'suggest_alternatives';
  reason: string;
  alternatives?: string[];
}

export interface WorkflowPrdUpdateResponse {
  status: 'PENDING' | 'accepted_alternatives' | 'pending';
  session_id?: string;
  ai_decision?: AiDecision;
  change_batch_id?: string | null;
  total_changes?: number;
  plans?: Record<string, unknown>;
  summary?: string;
  affected_plans?: string[];
  proposed_prd_content?: string;
  message?: string;
}

export interface LearningPsqlQueryBullet {
  bullet: string;
  source_id: string;
  metadata: { plan_type: string; plan_id: number; prd_id: string };
}

export interface LearningPsqlQueryResponse {
  topic: string;
  bullets: LearningPsqlQueryBullet[];
  note: string;
  prd_ref: { prd_id: string; snippet: string } | null;
  explanation_mode: string;
}

export const fastApiService = FastApiService.getInstance();
export type { ExternalAPIRequest, ExternalAPIResponse };
