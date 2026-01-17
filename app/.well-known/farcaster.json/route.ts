import type { NextRequest } from "next/server";

const DOMAIN = "https://farcaster-miniapp-template-blond.vercel.app";

export async function GET(_req: NextRequest) {
  const manifest = {
    frame: {
      version: "1",
      name: "Flip Flop",
      iconUrl: `${DOMAIN}/icon.png`,
      homeUrl: DOMAIN,
      // КЛЮЧЕВАЯ СТРОКА — новая картинка для превью в Farcaster
      imageUrl: `${DOMAIN}/og-flipflop-v2.png?cachebust=${Date.now()}`,
      buttonTitle: "Flip",
      splashImageUrl: `${DOMAIN}/splash.png`,
      splashBackgroundColor: "#ffffff",
      tags: ["Base", "Farcaster", "Mini App", "Game"],
      primaryCategory: "games",
    },
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}
