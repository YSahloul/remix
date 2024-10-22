import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Assistant } from "~/components/Assistant";
import { initializeVapi } from "~/lib/vapi.sdk";

// Define the type for the loader data
type LoaderData = {
  vapiWebToken: string;
};

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.cloudflare.env as Env;
  return json<LoaderData>({
    vapiWebToken: env.VAPI_WEB_TOKEN,
  });
};

export default function Index() {
  const { vapiWebToken } = useLoaderData<LoaderData>();

  useEffect(() => {
    initializeVapi(vapiWebToken);
  }, [vapiWebToken]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
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
