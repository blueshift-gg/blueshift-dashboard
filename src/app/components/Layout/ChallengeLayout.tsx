import { getTranslations } from "next-intl/server";
import { ChallengeMetadata, challengeColors } from "@/app/utils/challenges";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import PageHero from "@/app/components/PageHero/PageHero";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import classNames from "classnames";

interface ChallengeLayoutProps {
  challengeMetadata: ChallengeMetadata;
  collectionSize: number | null;
  children: React.ReactNode;
  pagination: React.ReactNode;
  footer: React.ReactNode;
  isTestPage?: boolean;
  hideTableOfContents?: boolean;
}

export default async function ChallengeLayout({
  challengeMetadata,
  collectionSize,
  children,
  pagination,
  footer,
  isTestPage = false,
}: ChallengeLayoutProps) {
  const t = await getTranslations();
  const challengePageTitle = t(`challenges.${challengeMetadata.slug}.title`);
  const collectionMintAddress = challengeMetadata.collectionMintAddress;

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div className="w-full">
        <Breadcrumbs
          items={[
            { label: t("header.challenges"), href: "/challenges" },
            { label: challengePageTitle },
          ]}
        />
        <PageHero
          badge={challengeMetadata.language}
          title={challengePageTitle}
          badgeColor={challengeMetadata.language}
          className="border-x-0 app:border-x"
          collectionSize={collectionSize}
          collectionMintAddress={collectionMintAddress}
        />
      </div>

      <div
        className={classNames(
          "max-w-app flex flex-col gap-y-8 h-full relative mx-auto w-full",
          !isTestPage && "app:border-x border-border-light"
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-14 gap-x-0">
          {pagination}
          <div
            className={classNames(
              "py-8 order-2 lg:order-1 col-span-1 flex flex-col gap-y-8 lg:border-border-light border-t border-t-border-light lg:border-t-0 lg:border-r xl:border-x border-border-light px-5 lg:px-6",
              isTestPage
                ? "md:col-span-9 lg:col-span-10 xl:col-span-14"
                : "md:col-span-7 xl:col-span-8"
            )}
          >
            {children}

            <div className="w-full flex items-center flex-col gap-y-10">
              {footer}
            </div>
          </div>
          {!isTestPage && <TableOfContents />}
        </div>
      </div>
    </div>
  );
}
