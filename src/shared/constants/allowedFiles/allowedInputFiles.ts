export const ALLOWED_INPUT_FIELDS = {
  text: ['.docx', '.txt', '.pdf', '.doc'],
  images: ['.png', '.jpg', '.gif', '.svg'],
  sheets: ['.csv', '.xlsx'],
} as const;

export type InputFileCategory = keyof typeof ALLOWED_INPUT_FIELDS;
