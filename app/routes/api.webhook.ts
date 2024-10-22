import { json } from "@remix-run/cloudflare";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { 
  StatusUpdatePayload, 
  ToolCallsPayload,
  VapiPayload, 
  VapiWebhookEnum, 
  AssistantRequestPayload, 
  EndOfCallReportPayload, 
  TranscriptPayload, 
  HangPayload, 
  SpeechUpdatePayload,
  ConversationUpdatePayload,
  ServerMessageUserInterrupted
} from "../types/vapi.types";
import { Bindings } from "../types/hono.types";
import { assistantRequestHandler } from "../handlers/assistantRequest";
import { endOfCallReportHandler } from "../handlers/endOfCallReport";
import { toolCallsHandler } from "../handlers/toolCalls";
import { HangEventHandler } from "../handlers/hang";
import { speechUpdateHandler } from "../handlers/speechUpdateHandler";
import { statusUpdateHandler } from "../handlers/statusUpdate";
import { transcriptHandler } from "../handlers/transcript";
import { conversationUpdateHandler } from "../handlers/conversationUpdate";
import { userInterruptedHandler } from "../handlers/userInterrupted";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("GET request to /api/webhook");
  return new Response("Webhook endpoint is working", { status: 200 });
};

export const action: ActionFunction = async ({ request, context }) => {
  try {
    const reqBody: { message: VapiPayload } = await request.json();
    const payload = reqBody.message;
    const env = context.cloudflare.env as Bindings;
    
    if (!payload || typeof payload.type !== 'string') {
      throw new Error("Invalid payload structure");
    }

    switch (payload.type as VapiWebhookEnum) {
      case VapiWebhookEnum.TOOL_CALLS:
        console.log("Handling TOOL_CALLS");
        return json(await toolCallsHandler(payload as ToolCallsPayload, env), { status: 201 });
      case VapiWebhookEnum.ASSISTANT_REQUEST:
        console.log("Handling ASSISTANT_REQUEST");
        return json(await assistantRequestHandler(payload as AssistantRequestPayload, env), { status: 201 });
      case VapiWebhookEnum.CONVERSATION_UPDATE:
        console.log("Handling CONVERSATION_UPDATE");
        return json(await conversationUpdateHandler(payload as ConversationUpdatePayload), { status: 201 });
      case VapiWebhookEnum.STATUS_UPDATE:
        console.log("Handling STATUS_UPDATE");
        return json(await statusUpdateHandler(payload as StatusUpdatePayload), { status: 201 });
      case VapiWebhookEnum.END_OF_CALL_REPORT:
        if ('endedReason' in payload && 'transcript' in payload) {
          await endOfCallReportHandler(payload as EndOfCallReportPayload);
          return json({}, { status: 201 });
        }
        throw new Error("Invalid END_OF_CALL_REPORT payload");
      case VapiWebhookEnum.SPEECH_UPDATE:
        console.log("Handling SPEECH_UPDATE");
        return json(await speechUpdateHandler(payload as SpeechUpdatePayload), { status: 201 });
      case VapiWebhookEnum.TRANSCRIPT:
        console.log("Handling TRANSCRIPT");
        return json(await transcriptHandler(payload as TranscriptPayload), { status: 201 });
      case VapiWebhookEnum.HANG:
        console.log("Handling HANG");
        return json(await HangEventHandler(payload as HangPayload), { status: 201 });
      case VapiWebhookEnum.USER_INTERRUPTED:
        console.log("Handling USER_INTERRUPTED");
        return json(await userInterruptedHandler(payload as ServerMessageUserInterrupted), { status: 201 });
      default:
        throw new Error(`Unhandled message type: ${payload.type}`);
    }
  } catch (error: any) {
    console.error("Error in webhook handler:", error);
    return json({ error: error.message || "Unknown error" }, { status: 500 });
  }
};
