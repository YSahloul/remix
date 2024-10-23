import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Assistant } from "~/components/Assistant";
import { initializeVapi } from "~/lib/vapi.sdk";
import { fetchMenu } from "~/tools/fetchMenu";
import { CategorizedMenu } from "~/types/menu.types";

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

  useEffect(() => {
    initializeVapi(vapiWebToken);
  }, [vapiWebToken]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <Assistant initialMenu={initialMenu} />
    </main>
  );
}
