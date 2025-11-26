import { getTranslations } from "next-intl/server";
import { ChallengeMetadata, challengeColors } from "@/app/utils/challenges";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import { Link } from "@/i18n/navigation";
import LessonTitle from "@/app/components/LessonTitle/LessonTitle";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";
import MdxLayout from "@/app/mdx-layout";

interface ChallengeLayoutProps {
  challengeMetadata: ChallengeMetadata;
  collectionSize: number | null;
  children: React.ReactNode;
  pagination: React.ReactNode;
  footer: React.ReactNode;
}

export default async function ChallengeLayout({
  challengeMetadata,
  collectionSize,
  children,
  pagination,
  footer,
}: ChallengeLayoutProps) {
  const t = await getTranslations();
  const challengePageTitle = t(`challenges.${challengeMetadata.slug}.title`);
  const collectionMintAddress = challengeMetadata.collectionMintAddress;

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${
            challengeColors[challengeMetadata.language]
          },0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 lg:pb-20 md:px-8 lg:px-14 max-w-app w-full mx-auto flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2 relative w-max">
              <CrosshairCorners
                size={5}
                spacingY={2}
                spacingX={6}
                style={{
                  color: `rgb(${
                    challengeColors[challengeMetadata.language]
                  },1)`,
                }}
                baseDelay={0}
              />
              <div
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center text-brand-primary"
                style={{
                  backgroundColor: `rgb(${
                    challengeColors[challengeMetadata.language]
                  },0.10)`,
                }}
              >
                <Icon name={challengeMetadata.language} size={16 as 14} />
              </div>
              <span
                className="font-medium text-lg font-mono relative top-0.25"
                style={{
                  color: `rgb(${challengeColors[challengeMetadata.language]})`,
                }}
              >
                {challengeMetadata.language}
              </span>
            </div>
            <span className="sr-only">
              {t(`challenges.${challengeMetadata.slug}.title`)}
            </span>
            <LessonTitle title={challengePageTitle} />
            {collectionMintAddress && typeof collectionSize === "number" && (
              <Link
                href={`https://solana.fm/address/${collectionMintAddress}`}
                target="_blank"
              >
                <p
                  className="text-shade-secondary mt-1 text-sm"
                  style={{
                    color: `rgb(${
                      challengeColors[challengeMetadata.language]
                    })`,
                  }}
                >
                  {collectionSize.toString()} Graduates
                </p>
              </Link>
            )}
          </div>
        </div>{" "}
      </div>

      <Divider />

      <div className="max-w-app flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-13 gap-y-24 lg:gap-y-0 gap-x-0 lg:gap-x-6">
          {pagination}
          <div className="pb-8 pt-[36px] -mt-[36px] order-2 lg:order-1 col-span-1 md:col-span-7 flex flex-col gap-y-8 lg:border-border lg:border-x border-border lg:px-6">
            <MdxLayout>{children}</MdxLayout>

            <div className=" w-full flex items-center flex-col gap-y-10">
              {footer}
            </div>
          </div>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
