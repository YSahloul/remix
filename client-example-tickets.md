## Directory Structure
```
"client_example_javascript_next"
├── README.md
├── components.json
├── example.env
assistants
│   └── assistant.ts
components
│   ├── app
│   │   ├── assistant.tsx
│   │   ├── assistantButton.tsx
│   │   ├── display.tsx
│   │   ├── shows.tsx
│   │   └── ticket.tsx
config
│   └── env.config.ts
data
│   └── shows.ts
hooks
│   └── useVapi.ts
lib
│   ├── utils.ts
│   ├── vapi.sdk.ts
│   ├── types
│   │   └── conversation.type.ts
pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── api
│   │   └── webhook.ts
public
│   ├── favicon.ico
│   ├── next.svg
│   └── vercel.svg
styles
│   └── globals.css
```

# client-example-javascript-next

* `README.md`

## README.md

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

* `components.json`

## components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "styles/globals.css",
    "baseColor": "slate",
    "cssVariables": false,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}

```

# assistants

│   * `assistant.ts`

## assistant.ts

```ts
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { shows } from "../data/shows";

export const assistant: CreateAssistantDTO | any = {
  name: "Paula-broadway",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    systemPrompt: `You're Paula, an AI assistant who can help the user decide what do he/she wants to watch on Broadway. User can ask you to suggest shows and book tickets. You can get the list of available shows from broadway and show them to the user, and then you can help user decide which ones to choose and which broadway theatre they can visit. After this confirm the details and book the tickets. `,
    // Upcoming Shows are ${JSON.stringify(
    //   shows
    // )}
    // `,
    functions: [
      {
        name: "suggestShows",
        async: true,
        description: "Suggests a list of broadway shows to the user.",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description:
                "The location for which the user wants to see the shows.",
            },
            date: {
              type: "string",
              description:
                "The date for which the user wants to see the shows.",
            },
          },
        },
      },
      {
        name: "confirmDetails",
        async: true, // remove async to wait for BE response.
        description: "Confirms the details provided by the user.",
        parameters: {
          type: "object",
          properties: {
            show: {
              type: "string",
              description: "The show for which the user wants to book tickets.",
            },
            date: {
              type: "string",
              description:
                "The date for which the user wants to book the tickets.",
            },
            location: {
              type: "string",
              description:
                "The location for which the user wants to book the tickets.",
            },
            numberOfTickets: {
              type: "number",
              description: "The number of tickets that the user wants to book.",
            },
          },
        },
      },
      {
        name: "bookTickets",
        async: true, // remove async to wait for BE response.
        description: "Books tickets for the user.",
        parameters: {
          type: "object",
          properties: {
            show: {
              type: "string",
              description: "The show for which the user wants to book tickets.",
            },
            date: {
              type: "string",
              description:
                "The date for which the user wants to book the tickets.",
            },
            location: {
              type: "string",
              description:
                "The location for which the user wants to book the tickets.",
            },
            numberOfTickets: {
              type: "number",
              description: "The number of tickets that the user wants to book.",
            },
          },
        },
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  firstMessage:
    "Hi. I'm Paula, Welcome to Broadway Shows! How are u feeling today?",
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : "https://08ae-202-43-120-244.ngrok-free.app/api/webhook",
};

```

# components


# app

│   │   * `assistant.tsx`

## assistant.tsx

```tsx
"use client";

import { useVapi } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import { Display } from "./display";

function Assistant() {
  const { toggleCall, callStatus, audioLevel } = useVapi();
  return (
    <>
      <div className="chat-history">
        <Display />
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        ></AssistantButton>
      </div>
    </>
  );
}

export { Assistant };

```
│   │   * `assistantButton.tsx`

## assistantButton.tsx

```tsx
import { CALL_STATUS, useVapi } from "@/hooks/useVapi";
import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "../ui/button";

const AssistantButton = ({
  toggleCall,
  callStatus,
  audioLevel = 0,
}: Partial<ReturnType<typeof useVapi>>) => {
  const color =
    callStatus === CALL_STATUS.ACTIVE
      ? "red"
      : callStatus === CALL_STATUS.LOADING
      ? "orange"
      : "green";
  const buttonStyle = {
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    color: "white",
    border: "none",
    boxShadow: `1px 1px ${10 + audioLevel * 40}px ${
      audioLevel * 10
    }px ${color}`,
    backgroundColor:
      callStatus === CALL_STATUS.ACTIVE
        ? "red"
        : callStatus === CALL_STATUS.LOADING
        ? "orange"
        : "green",
    cursor: "pointer",
  };

  return (
    <Button
      style={buttonStyle}
      className={`transition ease-in-out ${
        callStatus === CALL_STATUS.ACTIVE
          ? "bg-red-500 hover:bg-red-700"
          : callStatus === CALL_STATUS.LOADING
          ? "bg-orange-500 hover:bg-orange-700"
          : "bg-green-500 hover:bg-green-700"
      } flex items-center justify-center`}
      onClick={toggleCall}
    >
      {callStatus === CALL_STATUS.ACTIVE ? (
        <Square />
      ) : callStatus === CALL_STATUS.LOADING ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Mic />
      )}
    </Button>
  );
};

export { AssistantButton };

```
│   │   * `display.tsx`

## display.tsx

```tsx
import { shows } from "@/data/shows";
import { Message, MessageTypeEnum } from "@/lib/types/conversation.type";
import { vapi } from "@/lib/vapi.sdk";
import React, { useEffect } from "react";
import { ShowsComponent } from "./shows";
import { Ticket } from "./ticket";

function Display() {
  const [showList, setShowList] = React.useState<Array<(typeof shows)[number]>>(
    []
  );

  const [status, setStatus] = React.useState<"show" | "confirm" | "ticket">(
    "show"
  );

  const [selectedShow, setSelectedShow] = React.useState<
    (typeof shows)[number] | null
  >(null);

  const [confirmDetails, setConfirmDetails] = React.useState<{}>();

  useEffect(() => {
    const onMessageUpdate = (message: Message) => {
      if (
        message.type === MessageTypeEnum.FUNCTION_CALL &&
        message.functionCall.name === "suggestShows"
      ) {
        setStatus("show");
        vapi.send({
          type: MessageTypeEnum.ADD_MESSAGE,
          message: {
            role: "system",
            content: `Here is the list of suggested shows: ${JSON.stringify(
              shows.map((show) => show.title)
            )}`,
          },
        });
        setShowList(shows);
      } else if (
        message.type === MessageTypeEnum.FUNCTION_CALL &&
        (message.functionCall.name === "confirmDetails" ||
          message.functionCall.name === "bookTickets")
      ) {
        const params = message.functionCall.parameters;

        setConfirmDetails(params);
        console.log("parameters", params);

        const result = shows.find(
          (show) => show.title.toLowerCase() == params.show.toLowerCase()
        );
        setSelectedShow(result ?? shows[0]);

        setStatus(
          message.functionCall.name === "confirmDetails" ? "confirm" : "ticket"
        );
      }
    };

    const reset = () => {
      setStatus("show");
      setShowList([]);
      setSelectedShow(null);
    };

    vapi.on("message", onMessageUpdate);
    vapi.on("call-end", reset);
    return () => {
      vapi.off("message", onMessageUpdate);
      vapi.off("call-end", reset);
    };
  }, []);

  return (
    <>
      {showList.length > 0 && status == "show" ? (
        <ShowsComponent showList={showList} />
      ) : null}
      {status !== "show" ? (
        <Ticket
          type={status}
          show={selectedShow ?? shows[0]}
          params={confirmDetails}
        />
      ) : null}
    </>
  );
}

export { Display };

```
│   │   * `shows.tsx`

## shows.tsx

```tsx
import React, { useEffect } from "react";
import { Message, MessageTypeEnum } from "@/lib/types/conversation.type";
import { shows } from "@/data/shows";
import { vapi } from "@/lib/vapi.sdk";

interface ShowsComponentProps {
  showList: Array<(typeof shows)[number]>;
}

function ShowsComponent({ showList = [] }: ShowsComponentProps) {
  return (
    <div className="flex gap-8 py-4">
      {showList.map((show) => (
        <div key={show.title}>
          <img
            className="h-auto my-4 w-full rounded-lg object-cover transition-all hover:scale-105 aspect-[3/4]"
            src={show.img}
            alt={show.title}
          />
          <h2 className="text-xl font-bold">{show.title}</h2>
          <p className="text-gray-500 font-bold"> {show.theatre}</p>
          {/* <p className="text-gray-500">{show.date.toLocaleString()}</p> */}
          <p className="text-gray-500">$ {show.price}</p>
        </div>
      ))}
    </div>
  );
}

export { ShowsComponent };

```
│   │   * `ticket.tsx`

## ticket.tsx

```tsx
import { shows } from "@/data/shows";
import { vapi } from "../../lib/vapi.sdk";
import { MessageTypeEnum } from "../../lib/types/conversation.type";

interface TicketProps {
  type: "confirm" | "ticket";
  show: (typeof shows)[0];
  params: any;
}

function Ticket({
  type = "confirm",
  show = shows[0],
  params = {},
}: TicketProps) {
  const confirmDetails = () => {
    vapi.send({
      type: MessageTypeEnum.ADD_MESSAGE,
      message: {
        role: "user",
        content: `Looks good to me. Lets go ahead.`,
      },
    });
  };
  return (
    <div className={`bg-slate-100  rounded-xl`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-8 lg:mb-0">
            <img
              className="w-full rounded-lg shadow-lg"
              src={show.img}
              alt="Concert Image"
              width={200}
            />
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <h1 className="text-3xl font-bold mb-4">{show.title}</h1>

            {type === "ticket" ? (
              <p className="bg-green-500 text-white rounded-md w-full px-4 py-3 mb-6">
                Your ticket has been booked successfully.
              </p>
            ) : null}
            <p className="text-lg mb-6">{show.description}</p>
            <div className="mb-6">
              <p className="text-xl font-bold mb-2">When:</p>
              <p className="text-lg">
                {new Date(params.date ?? show.date).toLocaleString()}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-xl font-bold mb-2">Where:</p>
              <p className="text-lg">{show.theatre}</p>
              <p className="text-lg">{show.venue}</p>
            </div>
            <div className="mb-6">
              <p className="text-xl font-bold mb-2">Tickets:</p>
              <p className="text-lg">${show.price} - General Admission</p>
            </div>
            {type == "confirm" ? (
              <button
                onClick={confirmDetails}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Confirm Bookings
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Ticket };

```

# config

│   * `env.config.ts`

## env.config.ts

```ts
export const envConfig = {
  vapi: {
    apiUrl: process.env.NEXT_PUBLIC_VAPI_API_URL ?? "https://api.vapi.ai",
    token: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ?? "vapi-web-token",
  },
};

```

# data

│   * `shows.ts`

## shows.ts

```ts
export const shows = [
  {
    title: "The Notebook",
    description:
      "The musical adaptation of Nicholas Sparks' novel comes to Broadway, featuring music by Ingrid Michaelson.",
    img: "https://imaging.broadway.com/images/poster-178275/w230/222222/126908-15.jpg",
    theatre: "Schoenfeld Theatre",
    venue: "236 West 45th Street, New York, NY 10036",
    story:
      "Allie and Noah, both from different worlds, share a lifetime of love despite the forces that threaten to pull them apart. With a book that has sold millions of copies worldwide and a film that’s one of the highest-grossing romantic dramas of all-time, the musical adaptation of Nicholas Sparks’s The Notebook comes to Broadway following a critically acclaimed world premiere engagement at Chicago Shakespeare Theater in the fall of 2022.",
    price: 72.89,
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within the next month
  },
  {
    title: "The Lion King",
    description: "Pride Rock comes to life in Disney’s long-running hit.",
    img: "https://imaging.broadway.com/images/poster-178275/w230/222222/123802-3.jpg",
    theatre: "Minskoff Theatre",
    venue: "200 West 45th Street, New York, NY 10036",
    story: `A lively stage adaptation of the Academy Award-winning 1994 Disney film, The Lion King is the story of a young lion prince living in the flourishing African Pride Lands.

When an unthinkable tragedy, orchestrated by Simba’s wicked uncle, Scar, takes his father’s life, Simba flees the Pride Lands, leaving his loss and the life he knew behind. Eventually companioned by two hilarious and unlikely friends, Simba starts anew. But when weight of responsibility and a desperate plea from the now ravaged Pride Lands come to find the adult prince, Simba must take on a formidable enemy, and fulfill his destiny to be king.`,
    price: 103.45,
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within the next month
  },

  {
    title: "Aladdin",
    description:
      "The beloved Disney story is brought to thrilling theatrical life.",
    img: "https://imaging.broadway.com/images/poster-178275/w230/222222/111616-4.jpg",
    theatre: "New Amsterdam Theatre",

    venue: "214 West 42nd Street, New York, NY 10036",
    story: `In the middle-eastern town of Agrabah, Princess Jasmine is feeling hemmed in by her father’s desire to find her a royal groom. Meanwhile, the Sultan’s right-hand man, Jafar, is plotting to take over the throne. When Jasmine sneaks out of the palace incognito, she forms an instant connection with Aladdin, a charming street urchin and reformed thief.

 

    After being discovered together, Aladdin is sentenced to death, but Jafar saves him by ordering him to fetch a lamp from the Cave of Wonders. Where there’s a lamp, there’s a Genie, and once Aladdin unwittingly lets this one out, anything can happen! Will Aladdin’s new identity as “Prince Ali” help him win Jasmine’s heart and thwart Jafar’s evil plans? Will the Genie’s wish for freedom ever come true?`,
    price: 69.62,
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within the next month
  },
  {
    title: "Days of Wine and Roses",
    description:
      "Kelli O'Hara and Brian d'Arcy James star in the Broadway premiere of Adam Guettel and Craig Lucas' new musical.",
    img: "https://imaging.broadway.com/images/poster-178275/w230/222222/126426-15.jpg",
    theatre: "Studio 54",
    venue: "254 West 54th Street, New York, NY 10019",
    story: `Kelli O’Hara and Brian d’Arcy James star in a searing new musical about a couple falling in love in 1950s New York and struggling against themselves to build their family. The New York Times calls Days of Wine and Roses “a jazzy, aching new musical with wells of compassion!” (Critic’s Pick) and The Washington Post raves, “Kelli O’Hara and Brian d’Arcy James soar! One of the best new musicals this year.”
      
      Adapted from JP Miller’s 1962 film and original 1958 teleplay, composer & lyricist Adam Guettel (Floyd Collins) and playwright Craig Lucas (An American in Paris) reunite in their first collaboration since their acclaimed The Light in the Piazza. Directed by Michael Greif (Dear Evan Hansen).`,
    price: 69.62,
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within the next month
  },
];

```

# hooks

│   * `useVapi.ts`

## useVapi.ts

```ts
"use client";

import { assistant } from "@/assistants/assistant";

import {
  Message,
  MessageTypeEnum,
  TranscriptMessage,
  TranscriptMessageTypeEnum,
} from "@/lib/types/conversation.type";
import { useEffect, useState } from "react";
// import { MessageActionTypeEnum, useMessages } from "./useMessages";
import { vapi } from "@/lib/vapi.sdk";

export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export function useVapi() {
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CALL_STATUS>(
    CALL_STATUS.INACTIVE
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const [activeTranscript, setActiveTranscript] =
    useState<TranscriptMessage | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const onSpeechStart = () => setIsSpeechActive(true);
    const onSpeechEnd = () => {
      console.log("Speech has ended");
      setIsSpeechActive(false);
    };

    const onCallStartHandler = () => {
      console.log("Call has started");
      setCallStatus(CALL_STATUS.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call has stopped");
      setCallStatus(CALL_STATUS.INACTIVE);
    };

    const onVolumeLevel = (volume: number) => {
      setAudioLevel(volume);
    };

    const onMessageUpdate = (message: Message) => {
      console.log("message", message);
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType === TranscriptMessageTypeEnum.PARTIAL
      ) {
        setActiveTranscript(message);
      } else {
        setMessages((prev) => [...prev, message]);
        setActiveTranscript(null);
      }
    };

    const onError = (e: any) => {
      setCallStatus(CALL_STATUS.INACTIVE);
      console.error(e);
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("call-start", onCallStartHandler);
    vapi.on("call-end", onCallEnd);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("message", onMessageUpdate);
    vapi.on("error", onError);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("call-start", onCallStartHandler);
      vapi.off("call-end", onCallEnd);
      vapi.off("volume-level", onVolumeLevel);
      vapi.off("message", onMessageUpdate);
      vapi.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setCallStatus(CALL_STATUS.LOADING);
    const response = vapi.start(assistant);

    response.then((res) => {
      console.log("call", res);
    });
  };

  const stop = () => {
    setCallStatus(CALL_STATUS.LOADING);
    vapi.stop();
  };

  const toggleCall = () => {
    if (callStatus == CALL_STATUS.ACTIVE) {
      stop();
    } else {
      start();
    }
  };

  return {
    isSpeechActive,
    callStatus,
    audioLevel,
    activeTranscript,
    messages,
    start,
    stop,
    toggleCall,
  };
}

```

# lib

│   * `utils.ts`

## utils.ts

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```
│   * `vapi.sdk.ts`

## vapi.sdk.ts

```ts
import Vapi from "@vapi-ai/web";
import { envConfig } from "@/config/env.config";

export const vapi = new Vapi(envConfig.vapi.token);

```

# types

│   │   * `conversation.type.ts`

## conversation.type.ts

```ts
export enum MessageTypeEnum {
  TRANSCRIPT = "transcript",
  FUNCTION_CALL = "function-call",
  FUNCTION_CALL_RESULT = "function-call-result",
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

export interface TranscriptMessage extends BaseMessage {
  type: MessageTypeEnum.TRANSCRIPT;
  role: MessageRoleEnum;
  transcriptType: TranscriptMessageTypeEnum;
  transcript: string;
}

export interface FunctionCallMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL;
  functionCall: {
    name: string;
    parameters: any;
  };
}

export interface FunctionCallResultMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL_RESULT;
  functionCallResult: {
    forwardToClientEnabled?: boolean;
    result: any;
    [a: string]: any;
  };
}

export interface BaseMessage {
  type: MessageTypeEnum;
}

export type Message =
  | TranscriptMessage
  | FunctionCallMessage
  | FunctionCallResultMessage;

```

# pages

│   * `_app.tsx`

## _app.tsx

```tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

```
│   * `_document.tsx`

## _document.tsx

```tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

```
│   * `index.tsx`

## index.tsx

```tsx
import Image from "next/image";
import { Inter } from "next/font/google";
import { Assistant } from "@/components/app/assistant";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-12 ${inter.className}`}
    >
      <div className="text-center">
        <h1 className="text-3xl">Welcome to Broadway Show Assistant</h1>
        <p className="text-slate-600">
          Talk with Paula to explore upcoming shows and book tickets.
        </p>
      </div>
      <Assistant />
    </main>
  );
}

```

# api

│   │   * `webhook.ts`

## webhook.ts

```ts
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      const { message } = req.body;

      const { type = "function-call", functionCall = {}, call } = message;
      console.log("payload message", message);

      if (type === "function-call") {
        if (functionCall?.name === "suggestShows") {
          const parameters = functionCall?.parameters;

          return res.status(201).json({
            result:
              "You can see the upcoming shows on the screen. Select which ones you want to choose.",
          });
        }

        return res.status(201).json({ data: functionCall?.parameters });
      }

      return res.status(201).json({});
    }

    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

```

# public


# styles

