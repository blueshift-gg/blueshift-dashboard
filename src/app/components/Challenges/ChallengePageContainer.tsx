import { getTranslations } from "next-intl/server";
import { getChallenge } from "@/app/utils/mdx";
import { notFound } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { decodeCoreCollectionNumMinted } from "@/lib/nft/decodeCoreCollectionNumMinted";
import ContentPagination from "@/app/components/CoursesContent/ContentPagination";
import { Link } from "@/i18n/navigation";
import Button from "@/app/components/Button/Button";
import Icon from "@/app/components/Icon/Icon";
import ChallengeLayout from "@/app/components/Layout/ChallengeLayout";
import MdxLayout from "@/app/mdx-layout";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";

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
      (p) => p.slug === pageSlug,
    );
    if (!pageExists) {
      notFound();
    }
    try {
      const mdxModule = await import(
        `@/app/content/challenges/${challengeSlug}/${locale}/pages/${pageSlug}.mdx`
      );
      MdxComponent = mdxModule.default;
    } catch (error) {
      try {
        const mdxModule = await import(
          `@/app/content/challenges/${challengeSlug}/en/pages/${pageSlug}.mdx`
        );
        MdxComponent = mdxModule.default;
        challengeLocale = "en";
      } catch (error) {
        notFound();
      }
    }
  } else {
    try {
      const mdxModule = await import(
        `@/app/content/challenges/${challengeSlug}/${locale}/challenge.mdx`
      );
      MdxComponent = mdxModule.default;
    } catch (error) {
      try {
        const mdxModule = await import(
          `@/app/content/challenges/${challengeSlug}/en/challenge.mdx`
        );
        MdxComponent = mdxModule.default;
        challengeLocale = "en";
      } catch (error) {
        notFound();
      }
    }
  }

  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
  if (!rpcEndpoint) {
    throw new Error("NEXT_PUBLIC_RPC_ENDPOINT is not set");
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
            `Failed to decode num_minted for collection ${collectionMintAddress}`,
          );
        }
      } else {
        console.error(
          `Failed to fetch account info for ${collectionMintAddress}`,
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch collection details for ${collectionMintAddress}:`,
        error,
      );
    }
  }

  let nextPage;
  if (pageSlug) {
    const currentPageIndex = challengeMetadata.pages?.findIndex(
      (p) => p.slug === pageSlug,
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

  const footer = nextPage ? (
    <>
      <Link
        href={`/challenges/${challengeMetadata.slug}/${nextPage.slug}`}
        className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
      >
        <div className="flex items-center gap-x-2">
          <span className="text-mute text-sm font-mono pt-1">Next Page</span>
          <span className="font-medium text-primary">
            {t(
              `challenges.${challengeMetadata.slug}.pages.${nextPage.slug}.title`,
            )}
          </span>
        </div>
        <Icon
          name="ArrowRight"
          className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
        />
      </Link>
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-mute font-mono">
            {t("lessons.skip_lesson_divider_title").toUpperCase()}
          </span>
        </div>
      </div>
      <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group px-8">
        <span className="text-primary w-auto flex-shrink-0 font-mono">
          {t("lessons.take_challenge_cta")}
        </span>
        <Link
          href={`/challenges/${challengeSlug}/verify`}
          className="w-max"
        >
          <Button
            variant="primary"
            size="lg"
            label={t("lessons.take_challenge")}
            icon="Challenge"
            className="disabled:opacity-40 w-full disabled:cursor-default"
          ></Button>
        </Link>
      </div>
    </>
  ) : (
    <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
      <span className="text-primary w-auto flex-shrink-0 font-mono">
        {t("lessons.take_challenge_cta")}
      </span>
      <Link
        href={`/challenges/${challengeSlug}/verify`}
        className="w-max"
      >
        <Button
          variant="primary"
          size="lg"
          label={t("lessons.take_challenge")}
          icon="Challenge"
          className="disabled:opacity-40 w-full disabled:cursor-default"
        ></Button>
      </Link>
    </div>
  );

  return (
    <ChallengeLayout
      challengeMetadata={challengeMetadata}
      collectionSize={collectionSize}
      pagination={pagination}
      footer={footer}
    >
      <MdxLayout>
        <ContentFallbackNotice locale={locale} originalLocale={challengeLocale} />
        <MdxComponent />
      </MdxLayout>
    </ChallengeLayout>
  );
}
