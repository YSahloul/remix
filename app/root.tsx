import type { LinksFunction, LoaderFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import { useEffect, useState } from "react";
import { VapiProvider } from "~/contexts/VapiContext";
import { MenuProvider } from "~/contexts/MenuContext";
import { initializeVapi } from "~/lib/vapi.sdk";
import { fetchMenu } from "~/tools/fetchMenu";
import { CategorizedMenu } from "~/types/menu.types";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

type LoaderData = {
  vapiWebToken: string;
  initialMenu: CategorizedMenu;
};

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.cloudflare.env as Env;
  const initialMenu = await fetchMenu(env);
  return json<LoaderData>({
    vapiWebToken: env.VAPI_WEB_TOKEN,
    initialMenu,
  });
};

export default function App() {
  console.log("Root: App component rendering");
  const { vapiWebToken, initialMenu } = useLoaderData<LoaderData>();
  const [isVapiReady, setIsVapiReady] = useState(false);

  useEffect(() => {
    console.log("Root: useEffect running, initializing Vapi");
    const vapi = initializeVapi(vapiWebToken);
    if (vapi) {
      console.log("Root: Vapi initialized successfully");
      setIsVapiReady(true);
    } else {
      console.error("Root: Failed to initialize Vapi");
    }
  }, [vapiWebToken]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <VapiProvider>
          <MenuProvider initialMenu={initialMenu}>
            {isVapiReady ? <Outlet /> : <div>Loading Vapi... Please wait.</div>}
          </MenuProvider>
        </VapiProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
