import { Connection, PublicKey } from "@solana/web3.js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ClientChallengesContent from "@/app/components/Challenges/ClientChallengesContent";
import ProgramChallengesContent from "@/app/components/Challenges/ProgramChallengesContent";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";
import ChallengeLayout from "@/app/components/Layout/ChallengeLayout";
import MdxLayout from "@/app/mdx-layout";
import { getChallenge } from "@/app/utils/content";
import { getCompiledMdx } from "@/app/utils/mdx";
import { getPathname } from "@/i18n/navigation";
import { decodeCoreCollectionNumMinted } from "@/lib/nft/decodeCoreCollectionNumMinted";
import type { JSX } from "react/jsx-runtime";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { challengeSlug, locale } = await params;
  const t = await getTranslations({ locale });
  const pathname = getPathname({
    locale,
    href: `/challenges/${challengeSlug}/verify`,
  });

  const ogImage = {
    src: `/graphics/challenge-banners/${challengeSlug}.png`,
    width: 1200,
    height: 630,
  };

  const title = `${t("metadata.title")} | ${t(`challenges.${challengeSlug}.title`)} | ${t(`lessons.take_challenge`)}`;

  return {
    title: title,
    description: t("metadata.description"),
    openGraph: {
      title: title,
      type: "website",
      description: t("metadata.description"),
      siteName: title,
      url: pathname,
      images: [
        {
          url: ogImage.src,
          width: ogImage.width,
          height: ogImage.height,
        },
      ],
    },
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { challengeSlug, locale } = await params;
  const challengeMetadata = await getChallenge(challengeSlug);

  if (!challengeMetadata) {
    notFound();
  }

  let ChallengeContent: JSX.Element;
  let challengeLocale = locale;
  try {
    ChallengeContent = await getCompiledMdx(
      `challenges/${challengeMetadata.slug}/${locale}/verify.mdx`,
    );
  } catch {
    try {
      ChallengeContent = await getCompiledMdx(`challenges/${challengeMetadata.slug}/en/verify.mdx`);
      challengeLocale = "en";
    } catch {
      notFound();
    }
  }

  const rpcEndpoint = process.env.NEXT_PUBLIC_MAINNET_RPC_ENDPOINT;
  if (!rpcEndpoint) {
    throw new Error("NEXT_PUBLIC_MAINNET_RPC_ENDPOINT is not set");
  }

  let collectionSize: number | null = null;
  const collectionMintAddress = challengeMetadata.collectionMintAddress;
  if (collectionMintAddress) {
    try {
      const connection = new Connection(rpcEndpoint, { httpAgent: false });
      const collectionPublicKey = new PublicKey(collectionMintAddress);
      const accountInfo = await connection.getAccountInfo(collectionPublicKey);
      if (accountInfo) {
        collectionSize = decodeCoreCollectionNumMinted(accountInfo.data);
        if (collectionSize === null) {
          console.error(`Failed to decode num_minted for collection ${collectionMintAddress}`);
        }
      } else {
        console.error(`Failed to fetch account info for ${collectionMintAddress}`);
      }
    } catch (error) {
      console.error(`Failed to fetch collection details for ${collectionMintAddress}:`, error);
    }
  }

  return (
    <ChallengeLayout
      challengeMetadata={challengeMetadata}
      collectionSize={collectionSize}
      pagination={null}
      footer={null}
      isTestPage={true}
    >
      <div className="flex w-full flex-col">
        {challengeMetadata.language === "Typescript" ? (
          <ClientChallengesContent
            currentChallenge={challengeMetadata}
            content={
              <MdxLayout>
                <ContentFallbackNotice locale={locale} originalLocale={challengeLocale} />
                {ChallengeContent}
              </MdxLayout>
            }
          />
        ) : (
          <ProgramChallengesContent
            currentChallenge={challengeMetadata}
            content={
              <MdxLayout>
                <ContentFallbackNotice locale={locale} originalLocale={challengeLocale} />
                {ChallengeContent}
              </MdxLayout>
            }
          />
        )}
      </div>
    </ChallengeLayout>
  );
}
