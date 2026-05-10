import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NFTGeneratorScene from "./NFTGeneratorScene";

interface NFTGeneratorPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: NFTGeneratorPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = `${t("title")} | NFT Generator`;

  return {
    title,
    description: "Internal NFT generation tool.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function NFTGeneratorPage() {
  return <NFTGeneratorScene />;
}
