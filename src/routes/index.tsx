import { createFileRoute } from "@tanstack/react-router";
import { GameRoot } from "@/components/game/GameRoot";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Campus Life (OOPOLY Edition) — Student Life Game" },
      { name: "description", content: "Explore a stylized polytechnic campus in Aba: attend lectures, hustle for virtual naira, eat, rest and level up. An unofficial fan-made campus life game." },
      { property: "og:title", content: "Campus Life (OOPOLY Edition)" },
      { property: "og:description", content: "A campus life game about student life — lectures, hustles and jollof on a stylized Aba campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameRoot,
});
