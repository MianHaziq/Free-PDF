/**
 * mammoth ships no type declarations. This is the minimal ambient shape
 * actually used by features/resume-import (docx adapter).
 */
declare module "mammoth" {
  export interface MammothMessage {
    type: string;
    message: string;
  }

  export interface ConvertToHtmlResult {
    value: string;
    messages: MammothMessage[];
  }

  export interface ConvertInput {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  export function convertToHtml(
    input: ConvertInput,
  ): Promise<ConvertToHtmlResult>;
}
