import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Assistant } from "~/components/Assistant";
import { initializeVapi } from "~/lib/vapi.sdk";
import { fetchMenu } from "~/tools/fetchMenu";
import { CategorizedMenu, MenuItem } from "~/types/menu.types";

// Update the LoaderData type to include the menu
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
      <div className="text-center">
        <h1 className="text-3xl">Welcome to Tic-Taco</h1>
        <p className="text-slate-600">
          Talk with our AI assistant to explore our menu and place an order.
        </p>
      </div>
      <Assistant initialMenu={initialMenu} />
    </main>
  );
}
