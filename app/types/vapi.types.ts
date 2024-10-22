/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";


// Tool interfaces
export interface BaseTool {
  type: string;
}

export interface FunctionTool extends BaseTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
}

export type Tool = FunctionTool;

// Model interface
export interface Model {
  provider: 'custom-llm';
  url: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  metadataSendMode?: 'off' | 'variable' | 'destructured';
  messages?: Array<{ role: string; content: string }>;
  tools?: Tool[];
  toolIds?: string[];
  knowledgeBase?: {
    // Define knowledge base properties if needed
  };
  emotionRecognitionEnabled?: boolean;
  numFastTurns?: number;
}

const PLAY_HT_EMOTIONS = [
  "female_happy",
  "female_sad",
  "female_angry",
  "female_fearful",
  "female_disgust",
  "female_surprised",
] as const;
type PlayHTEmotion = (typeof PLAY_HT_EMOTIONS)[number];

export interface Voice {
  provider: '11labs';
  model: 'eleven_multilingual_v2' | 'eleven_turbo_v2' | 'eleven_turbo_v2_5' | 'eleven_monolingual_v1';
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  optimizeStreamingLatency?: number;
  fillerInjectionEnabled?: boolean;
  enableSsmlParsing?: boolean;
  language?: string;
}

export interface Transcriber {
  provider: 'deepgram';
  model?: string;
  language?: string;
  endpointing?: number;
  smartFormat?: boolean;
  keywords?: string[];
}

export type FirstMessageMode = 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message';

export interface Assistant {
  name?: string;
  model: Model;
  voice: Voice;
  messagePlan?: {
    idleTimeoutSeconds?: number;
    idleMessageMaxSpokenCount?: number;
  };
  transcriber: Transcriber;
  firstMessageMode?: FirstMessageMode;
  backgroundSound?: 'off' | 'office';
  startSpeakingPlan?: {
    waitSeconds?: number;
  };
  maxDurationSeconds?: number;
  backchannelingEnabled?: boolean;
  silenceTimeoutSeconds?: number;
  backgroundDenoisingEnabled?: boolean;
  firstMessage?: string;
  analysisPlan?: AnalysisPlan;
}

export const VAPI_CALL_STATUSES = [
  "queued",
  "ringing",
  "in-progress",
  "forwarding",
  "ended",
] as const;
export type VapiCallStatus = (typeof VAPI_CALL_STATUSES)[number];

export enum VapiWebhookEnum {
  ASSISTANT_REQUEST = "assistant-request",
  STATUS_UPDATE = "status-update",
  END_OF_CALL_REPORT = "end-of-call-report",
  HANG = "hang",
  SPEECH_UPDATE = "speech-update",
  TRANSCRIPT = "transcript",
  CONVERSATION_UPDATE = "conversation-update",
  TOOL_CALLS = "tool-calls",
  USER_INTERRUPTED = "user-interrupted",
}

export interface ConversationMessage {
  role: "user" | "system" | "bot" | "function_call" | "function_result";
  message?: string;
  name?: string;
  args?: string;
  result?: string;
  time: number;
  endTime?: number;
  secondsFromStart: number;
}

interface BaseVapiPayload {
  type: VapiWebhookEnum;
  call: VapiCall;
}

export interface AssistantRequestPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.ASSISTANT_REQUEST;
}

export interface StatusUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.STATUS_UPDATE;
  status: VapiCallStatus;
  messages?: ChatCompletionMessageParam[];
}

export interface EndOfCallReportPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.END_OF_CALL_REPORT;
  endedReason: EndedReason;
  cost?: number;
  costs?: Array<(TransportCost | TranscriberCost | ModelCost | VoiceCost | VapiCost | AnalysisCost)>;
  timestamp?: string;
  artifact: Artifact;
  analysis: Analysis;
  startedAt?: string;
  endedAt?: string;
}

export type EndedReason = 
  | 'assistant-error'
  | 'assistant-not-found'
  | 'db-error'
  | 'no-server-available'
  | 'license-check-failed'
  // ... add other reasons as needed

export interface Artifact {
  messages?: Message[];
  messagesOpenAIFormatted?: Array<any>; // Replace 'any' with OpenAIMessage type if available
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  videoRecordingUrl?: string;
  videoRecordingStartDelaySeconds?: number;
  transcript?: string;
}

export interface Analysis {
  /**
   * This is the summary of the call. Customize by setting `assistant.analysisPlan.summaryPrompt`.
   */
  summary?: string;
  /**
   * This is the structured data extracted from the call. Customize by setting `assistant.analysisPlan.structuredDataPrompt` and/or `assistant.analysisPlan.structuredDataSchema`.
   */
  structuredData?: Record<string, any>;
  /**
   * This is the evaluation of the call. Customize by setting `assistant.analysisPlan.successEvaluationPrompt` and/or `assistant.analysisPlan.successEvaluationRubric`.
   */
  successEvaluation?: string;
}

export interface TransportCost {
  // Define properties for TransportCost
}

export interface TranscriberCost {
  // Define properties for TranscriberCost
}

export interface ModelCost {
  // Define properties for ModelCost
}

export interface VoiceCost {
  // Define properties for VoiceCost
}

export interface VapiCost {
  // Define properties for VapiCost
}

export interface AnalysisCost {
  // Define properties for AnalysisCost
}

export interface HangPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.HANG;
}

export interface SpeechUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.SPEECH_UPDATE;
  status: "started" | "stopped";
  role: "assistant" | "user";
}

export interface TranscriptPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.TRANSCRIPT;
  role: "assistant" | "user";
  transcriptType: "partial" | "final";
  transcript: string;
}

export interface ConversationUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.CONVERSATION_UPDATE;
  messages: ConversationMessage[];
}

export interface VapiCall {}

export type VapiPayload =
  | AssistantRequestPayload
  | StatusUpdatePayload
  | EndOfCallReportPayload
  | SpeechUpdatePayload
  | TranscriptPayload
  | HangPayload
  | ConversationUpdatePayload
  | ToolCallsPayload
  | ServerMessageUserInterrupted;

export interface ToolCallsPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.TOOL_CALLS;
  toolCalls: ToolCall[];
}

export interface AssistantRequestMessageResponse {
  assistant?: Assistant;
  error?: string;
}

export interface StatusUpdateMessageResponse {}
export interface SpeechUpdateMessageResponse {}
export interface TranscriptMessageResponse {}
export interface HangMessageResponse {}
export interface EndOfCallReportMessageResponse {}
export interface ConversationUpdateMessageResponse {}

export type VapiResponse =
  | AssistantRequestMessageResponse
  | EndOfCallReportMessageResponse
  | HangMessageResponse
  | StatusUpdateMessageResponse
  | SpeechUpdateMessageResponse
  | TranscriptMessageResponse
  | ConversationUpdateMessageResponse
  | ToolCallsMessageResponse
  | UserInterruptedMessageResponse;

export interface CreateAssistantDTO {
  name?: string;
  model?: Model;
  voice?: Voice;
  transcriber?: Transcriber;
  firstMessageMode?: 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message';
  hipaaEnabled?: boolean;
  clientMessages?: Array<'conversation-update' | 'function-call' | 'function-call-result' | 'hang' | 'language-changed' | 'metadata' | 'model-output' | 'speech-update' | 'status-update' | 'transcript' | 'tool-calls' | 'tool-calls-result' | 'user-interrupted' | 'voice-input'>;
  serverMessages?: Array<'conversation-update' | 'end-of-call-report' | 'function-call' | 'hang' | 'language-changed' | 'model-output' | 'phone-call-control' | 'speech-update' | 'status-update' | 'transcript' | 'tool-calls' | 'transfer-destination-request' | 'transfer-update' | 'user-interrupted' | 'voice-input'>;
  silenceTimeoutSeconds?: number;
  maxDurationSeconds?: number;
  backgroundSound?: 'off' | 'office';
  backchannelingEnabled?: boolean;
  backgroundDenoisingEnabled?: boolean;
  modelOutputInMessagesEnabled?: boolean;
  firstMessage?: string;
  endCallMessage?: string;
  endCallPhrases?: Array<string>;
  metadata?: Record<string, any>;
  serverUrl?: string;
  serverUrlSecret?: string;
  analysisPlan?: AnalysisPlan;
  messagePlan?: MessagePlan;
  startSpeakingPlan?: StartSpeakingPlan;
  stopSpeakingPlan?: StopSpeakingPlan;
  monitorPlan?: MonitorPlan;
  credentialIds?: Array<string>;
}

export interface TransferDestinationNumber {
  type: 'number';
  number: string;
}

export interface TransferDestinationSip {
  type: 'sip';
  uri: string;
}

export interface AssistantOverrides {
  // Define properties for assistant overrides if needed
}

export interface CreateSquadDTO {
  // Define properties for squad creation if needed
}

export interface ServerMessageResponseAssistantRequest {
  destination?: TransferDestinationNumber | TransferDestinationSip;
  assistantId?: string | null;
  assistant?: CreateAssistantDTO;
  assistantOverrides?: AssistantOverrides;
  squadId?: string;
  squad?: CreateSquadDTO;
  error?: string;
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

export interface ToolCallResult {
  message?: Array<any>; // You might want to define specific message types
  name: string;
  toolCallId: string;
  result?: string;
  error?: string;
}

export interface ToolCallsMessageResponse {
  results?: ToolCallResult[];
  error?: string;
}

export interface FunctionToolWithToolCall {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
  toolCall: ToolCall;
}

export interface ServerMessageUserInterrupted extends BaseVapiPayload {
  type: VapiWebhookEnum.USER_INTERRUPTED;
  timestamp?: string;
  artifact?: any; // Replace 'any' with a more specific type if available
}

export interface UserInterruptedMessageResponse {}



export interface AnalysisPlan {
    summaryPlan?: SummaryPlan;
    structuredDataPlan?: StructuredDataPlan;
    successEvaluationPlan?: SuccessEvaluationPlan;
}

export interface SummaryPlan {
    messages?: Array<Record<string, any>>;
    enabled?: boolean;
    timeoutSeconds?: number;
}

export interface StructuredDataPlan {
    messages?: Array<Record<string, any>>;
    enabled?: boolean;
    schema?: JsonSchema;
    timeoutSeconds?: number;
}

export interface SuccessEvaluationPlan {
    rubric?: SuccessEvaluationPlanRubric;
    messages?: Array<Record<string, any>>;
    enabled?: boolean;
    timeoutSeconds?: number;
}

export enum SuccessEvaluationPlanRubric {
    NUMERIC_SCALE = 'NumericScale',
    DESCRIPTIVE_SCALE = 'DescriptiveScale',
    CHECKLIST = 'Checklist',
    MATRIX = 'Matrix',
    PERCENTAGE_SCALE = 'PercentageScale',
    LIKERT_SCALE = 'LikertScale',
    AUTOMATIC_RUBRIC = 'AutomaticRubric',
    PASS_FAIL = 'PassFail',
}

// Add JsonSchema from the generated file
export interface JsonSchema {
    type: JsonSchemaType;
    items?: Record<string, any>;
    properties?: Record<string, any>;
    description?: string;
    required?: Array<string>;
}

export enum JsonSchemaType {
    STRING = 'string',
    NUMBER = 'number',
    INTEGER = 'integer',
    BOOLEAN = 'boolean',
    ARRAY = 'array',
    OBJECT = 'object',
}

export interface MessagePlan {
    /**
     * These are the messages that the assistant will speak when the user hasn't responded for `idleTimeoutSeconds`. Each time the timeout is triggered, a random message will be chosen from this array.
     */
    idleMessages?: Array<string>;
    /**
     * This determines the maximum number of times `idleMessages` can be spoken during the call.
     * @default 3
     */
    idleMessageMaxSpokenCount?: number;
    /**
     * This is the timeout in seconds before a message from `idleMessages` is spoken. The clock starts when the assistant finishes speaking and remains active until the user speaks.
     * @default 10
     */
    idleTimeoutSeconds?: number;
}

export interface StartSpeakingPlan {
    /**
     * This is how long assistant waits before speaking. Defaults to 0.4.
     * @default 0.4
     */
    waitSeconds?: number;
    /**
     * This determines if a customer speech is considered done (endpointing) using the VAP model on customer's speech. This is good for middle-of-thought detection.
     * @default false
     */
    smartEndpointingEnabled?: boolean;
    /**
     * This determines how a customer speech is considered done (endpointing) using the transcription of customer's speech.
     */
    transcriptionEndpointingPlan?: TranscriptionEndpointingPlan;
}

// You might need to define TranscriptionEndpointingPlan if it's used in your application
export interface TranscriptionEndpointingPlan {
    // Add properties as needed
}

export interface StopSpeakingPlan {
    /**
     * This is the number of words that the customer has to say before the assistant will stop talking.
     *
     * Words like "stop", "actually", "no", etc. will always interrupt immediately regardless of this value.
     *
     * Words like "okay", "yeah", "right" will never interrupt.
     *
     * When set to 0, `voiceSeconds` is used in addition to the transcriptions to determine the customer has started speaking.
     *
     * Defaults to 0.
     *
     * @default 0
     */
    numWords?: number;
    /**
     * This is the seconds customer has to speak before the assistant stops talking. This uses the VAD (Voice Activity Detection) spike to determine if the customer has started speaking.
     *
     * Considerations:
     * - A lower value might be more responsive but could potentially pick up non-speech sounds.
     * - A higher value reduces false positives but might slightly delay the detection of speech onset.
     *
     * This is only used if `numWords` is set to 0.
     *
     * Defaults to 0.2
     *
     * @default 0.2
     */
    voiceSeconds?: number;
    /**
     * This is the seconds to wait before the assistant will start talking again after being interrupted.
     *
     * Defaults to 1.
     *
     * @default 1
     */
    backoffSeconds?: number;
}

export interface MonitorPlan {
    /**
     * This determines whether the assistant's calls allow live listening. Defaults to true.
     *
     * Fetch `call.monitor.listenUrl` to get the live listening URL.
     *
     * @default true
     */
    listenEnabled?: boolean;
    /**
     * This determines whether the assistant's calls allow live control. Defaults to true.
     *
     * Fetch `call.monitor.controlUrl` to get the live control URL.
     *
     * To use, send any control message via a POST request to `call.monitor.controlUrl`. Here are the types of controls supported: https://docs.vapi.ai/api-reference/messages/client-inbound-message
     *
     * @default true
     */
    controlEnabled?: boolean;
}

// Message types
export interface UserMessage {
  role: 'user';
  message: string;
  time: number;
  endTime?: number;
  secondsFromStart: number;
}

export interface SystemMessage {
  role: 'system';
  message: string;
  time: number;
  secondsFromStart: number;
}

export interface BotMessage {
  role: 'bot';
  message: string;
  time: number;
  endTime?: number;
  secondsFromStart: number;
}

export interface ToolCallMessage {
  role: 'tool_call';
  toolCalls: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  message: string;
  time: number;
  secondsFromStart: number;
}

export interface ToolCallResultMessage {
  role: 'tool_call_result';
  name: string;
  result: string;
  toolCallId: string;
  time: number;
  secondsFromStart: number;
}

export type Message = UserMessage | SystemMessage | BotMessage | ToolCallMessage | ToolCallResultMessage;


