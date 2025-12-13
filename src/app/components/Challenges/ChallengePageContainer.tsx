import { getTranslations } from "next-intl/server";
import { getChallenge } from "@/app/utils/content";
import { getCompiledMdx } from "@/app/utils/mdx";
import { notFound } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { decodeCoreCollectionNumMinted } from "@/lib/nft/decodeCoreCollectionNumMinted";
import ContentPagination from "@/app/components/CoursesContent/ContentPagination";
import { Link } from "@/i18n/navigation";
import { Button } from "@blueshift-gg/ui-components";
import { Icon } from "@blueshift-gg/ui-components";
import ChallengeLayout from "@/app/components/Layout/ChallengeLayout";
import MdxLayout from "@/app/mdx-layout";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";
import ChallengeFooter from "./ChallengeFooter";

interface ChallengePageContainerProps {
  params: Promise<{
    challengeSlug: string;
    pageSlug?: string;
    locale: string;
  }>;
}

export default async function ChallengePageContainer({
  params,
}: ChallengePageContainerProps) {
  const t = await getTranslations();
  const { challengeSlug, pageSlug, locale } = await params;

  const challengeMetadata = await getChallenge(challengeSlug);
  if (!challengeMetadata) {
    console.error(`No metadata found for challenge: ${challengeSlug}`);
    notFound();
  }

  let MdxComponent;
  let challengeLocale = locale;
  if (pageSlug) {
    const pageExists = challengeMetadata.pages?.some(
      (p) => p.slug === pageSlug
    );
    if (!pageExists) {
      notFound();
    }
    try {
      MdxComponent = await getCompiledMdx(
        `challenges/${challengeSlug}/${locale}/pages/${pageSlug}.mdx`
      );
    } catch (error) {
      try {
        MdxComponent = await getCompiledMdx(
          `challenges/${challengeSlug}/en/pages/${pageSlug}.mdx`
        );
        challengeLocale = "en";
      } catch (error) {
        notFound();
      }
    }
  } else {
    try {
      MdxComponent = await getCompiledMdx(
        `challenges/${challengeSlug}/${locale}/challenge.mdx`
      );
    } catch (error) {
      try {
        MdxComponent = await getCompiledMdx(
          `challenges/${challengeSlug}/en/challenge.mdx`
        );
        challengeLocale = "en";
      } catch (error) {
        notFound();
      }
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
          console.error(
            `Failed to decode num_minted for collection ${collectionMintAddress}`
          );
        }
      } else {
        console.error(
          `Failed to fetch account info for ${collectionMintAddress}`
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch collection details for ${collectionMintAddress}:`,
        error
      );
    }
  }

  let nextPage;
  if (pageSlug) {
    const currentPageIndex = challengeMetadata.pages?.findIndex(
      (p) => p.slug === pageSlug
    );
    nextPage =
      currentPageIndex !== undefined &&
      currentPageIndex > -1 &&
      challengeMetadata.pages
        ? challengeMetadata.pages[currentPageIndex + 1]
        : null;
  } else {
    nextPage =
      challengeMetadata.pages && challengeMetadata.pages.length > 0
        ? challengeMetadata.pages[0]
        : null;
  }

  const pagination = (
    <ContentPagination
      type="challenge"
      challenge={challengeMetadata}
      currentPageSlug={pageSlug}
    />
  );

  const footer = (
    <ChallengeFooter
      challengeMetadata={challengeMetadata}
      nextPage={nextPage}
      challengeSlug={challengeSlug}
    />
  );

  return (
    <ChallengeLayout
      challengeMetadata={challengeMetadata}
      collectionSize={collectionSize}
      pagination={pagination}
      footer={footer}
    >
      <MdxLayout>
        <ContentFallbackNotice
          locale={locale}
          originalLocale={challengeLocale}
        />
        {MdxComponent}
      </MdxLayout>
    </ChallengeLayout>
  );
}
