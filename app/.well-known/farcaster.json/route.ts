export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://your-app.com";
  const appName = process.env.NEXT_PUBLIC_PROJECT_NAME || "GoalPledge";

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIwNDk1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NDQyMTcwMGI3M2I3YjUyOEE1YWIzODYyMkIxZGNlODgwRGY5YjBDNiJ9",
      payload: "eyJkb21haW4iOiJnb2FscGxlZGdlLnZlcmNlbC5hcHAifQ",
      signature: "MHhlYjZlMTJiOTliYmQyOGZkNDc5YTRiZTlmY2M1NTJmZDRjMTBlNGI1ZjQ1Y2UwMGY4OGRiYTI5ZjNmMDE1ODBlNmUyNDRiZTE5ZTAzY2MzMTRjYjEyZTE1MjczMDI4MWExYzZkYmQxMzU1YjJkMzNhYTRkYjY2NDMzYjQ1MTk2OTFi",
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


