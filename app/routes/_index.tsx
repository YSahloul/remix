import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Assistant } from "~/components/Assistant";
import { initializeVapi } from "~/lib/vapi.sdk";
import { fetchMenu } from "~/tools/fetchMenu";
import { CategorizedMenu } from "~/types/menu.types";
import { VapiProvider } from "~/contexts/VapiContext";
import { MenuProvider } from "~/contexts/MenuContext";

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

export default function Index() {
  const { vapiWebToken, initialMenu } = useLoaderData<LoaderData>();
  console.log("Received vapiWebToken:", vapiWebToken);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Initializing Vapi...");
    initializeVapi(vapiWebToken)
      .then((vapi) => {
        console.log("Vapi initialized successfully", vapi);
        setIsVapiReady(true);
        
        // Set up event listeners here
        vapi.on('call-start', () => console.log("Call started"));
        vapi.on('error', (err) => console.error("Vapi error:", err));
      })
      .catch((err) => {
        console.error("Failed to initialize Vapi:", err);
        setError("Failed to initialize Vapi. Please try refreshing the page.");
      });
  }, [vapiWebToken]);

  console.log("Current isVapiReady state:", isVapiReady);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isVapiReady) {
    return <div>Loading...</div>;
  }

  return (
    <VapiProvider>
      <MenuProvider initialMenu={initialMenu}>
        <main className="flex min-h-screen flex-col items-center justify-between p-12">
          <Assistant />
        </main>
      </MenuProvider>
    </VapiProvider>
  );
}
