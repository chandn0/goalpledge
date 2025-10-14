export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://your-app.com";
  const appName = process.env.NEXT_PUBLIC_PROJECT_NAME || "GoalPledge";

  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    baseBuilder: {
      allowedAddresses: [""],
    },
    miniapp: {
      version: "1",
      name: appName,
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#FFFFFF",
      subtitle: "Pledge to your goals onchain",
      description: "Stake USDC towards your goals and reclaim on success.",
      screenshotUrls: [
        `${appUrl}/s1.png`,
        `${appUrl}/s2.png`,
      ],
      primaryCategory: "social",
      tags: ["goals", "miniapp", "baseapp"],
      heroImageUrl: `${appUrl}/og.png`,
      tagline: "Commit. Achieve. Reclaim.",
      ogTitle: appName,
      ogDescription: "Set goals, pledge, and stay accountable.",
      ogImageUrl: `${appUrl}/og.png`,
      noindex: true,
    },
  };

  return Response.json(manifest);
}


