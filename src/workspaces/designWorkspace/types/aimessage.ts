export interface BaseAIMsg {
  id: string;
  kind: string;
  createdAt?: number;
  specialId?: string;
}

export interface TextAIMsg extends BaseAIMsg {
  kind: 'text';
  text: string;
}

export interface OptionsAIMsg extends BaseAIMsg {
  kind: 'options';
  text: string;
  options: string[];
}

export type AIMsg = TextAIMsg | OptionsAIMsg;
export type AIMessages = AIMsg[];
