import { createFileRoute } from "@tanstack/react-router";
import { GameRoot } from "@/components/game/GameRoot";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Campus Life (OOPOLY Edition) — Student life sim prototype" },
      { name: "description", content: "Explore an illustrative polytechnic campus in Aba: attend lectures, hustle for virtual naira, eat, rest and level up. Unofficial fan prototype." },
      { property: "og:title", content: "Campus Life (OOPOLY Edition)" },
      { property: "og:description", content: "A browser life-sim prototype about student life — lectures, hustles and jollof on an illustrative Aba campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameRoot,
});
