import { Assistant } from "~/components/Assistant";
import { useEffect } from "react";

export default function Index() {
  console.log("Index: Rendering Index component");

  useEffect(() => {
    console.log("Index: Client-side effect running");
  }, []);

  return <Assistant />;
}
