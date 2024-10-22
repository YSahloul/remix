export enum MessageTypeEnum {
  TRANSCRIPT = "transcript",
  TOOL_CALLS = "tool-calls",
  TOOL_CALL_RESULT = "tool-call-result",
  ADD_MESSAGE = "add-message",
}

export enum MessageRoleEnum {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
}

export enum TranscriptMessageTypeEnum {
  PARTIAL = "partial",
  FINAL = "final",
}

export interface BaseMessage {
  type: MessageTypeEnum;
}

export interface TranscriptMessage extends BaseMessage {
  type: MessageTypeEnum.TRANSCRIPT;
  role: MessageRoleEnum;
  transcriptType: TranscriptMessageTypeEnum;
  transcript: string;
}

export interface ToolCallFunction {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolCall {
  type: 'function';
  function: ToolCallFunction;
  id: string;
}

export interface ToolCallsMessage extends BaseMessage {
  type: MessageTypeEnum.TOOL_CALLS;
  toolCalls: ToolCall[];
}

export interface ToolCallResultMessage extends BaseMessage {
  type: MessageTypeEnum.TOOL_CALL_RESULT;
  role: 'tool_call_result';
  time: number;
  secondsFromStart: number;
  name: string;
  result: string;
  toolCallId: string;
}

export interface AddMessage extends BaseMessage {
  type: MessageTypeEnum.ADD_MESSAGE;
  message: {
    role: MessageRoleEnum;
    content: string;
  };
}

export type Message =
  | TranscriptMessage
  | ToolCallsMessage
  | ToolCallResultMessage
  | AddMessage;
