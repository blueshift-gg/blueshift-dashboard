import { getTranslations } from "next-intl/server";
import MdxLayout from "@/app/mdx-layout";
import { getChallenge, getCourse } from "@/app/utils/content";
import { getCompiledMdx } from "@/app/utils/mdx";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import ContentPagination from "@/app/components/CoursesContent/ContentPagination";
import PageHero from "@/app/components/PageHero/PageHero";
import { notFound } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { Metadata } from "next";
import { Connection, PublicKey } from "@solana/web3.js";
import { decodeCoreCollectionNumMinted } from "@/lib/nft/decodeCoreCollectionNumMinted";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";
import CourseFooter from "@/app/components/CoursesContent/CourseFooter";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface LessonPageProps {
  params: Promise<{
    courseName: string;
    lessonName: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseName, lessonName, locale } = await params;
  const t = await getTranslations({ locale });
  const pathname = getPathname({
    locale,
    href: `/courses/${courseName}/${lessonName}`,
  });

  const ogImage = {
    src: `/graphics/course-banners/${courseName}.png`,
    width: 1200,
    height: 630,
  };

  const title = `${t("metadata.title")} | ${t(`courses.${courseName}.title`)} | ${t(`courses.${courseName}.lessons.${lessonName}`)}`;

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

export default async function LessonPage({ params }: LessonPageProps) {
  const t = await getTranslations();
  const { courseName, lessonName, locale } = await params;

  let Lesson;
  let lessonLocale = locale;

  try {
    Lesson = await getCompiledMdx(
      `courses/${courseName}/${lessonName}/${locale}.mdx`
    );
  } catch {
    try {
      Lesson = await getCompiledMdx(
        `courses/${courseName}/${lessonName}/en.mdx`
      );
      lessonLocale = "en";
    } catch {
      notFound();
    }
  }

  const courseMetadata = await getCourse(courseName);
  const coursePageTitle = t(`courses.${courseMetadata.slug}.title`);

  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

  if (!rpcEndpoint) {
    throw new Error("NEXT_PUBLIC_RPC_ENDPOINT is not set");
  }

  let collectionSize: number | null = null;

  const challenge = await getChallenge(courseMetadata.challenge);
  const collectionMintAddress = challenge?.collectionMintAddress;

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

  const allLessons = courseMetadata.lessons;
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.slug === lessonName
  );
  const nextLesson = allLessons[currentLessonIndex + 1];
  const nextLessonSlug = nextLesson ? nextLesson.slug : "";

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div className="relative max-w-app mx-auto w-full app:border-x border-border-light">
        <Breadcrumbs
          items={[
            { label: t("header.courses"), href: "/courses" },
            { label: coursePageTitle },
          ]}
        />
        <PageHero
          badge={courseMetadata.language}
          title={coursePageTitle}
          badgeColor={courseMetadata.language}
          collectionSize={collectionSize}
          collectionMintAddress={collectionMintAddress}
          showBorder={false}
        />
      </div>

      <div className="max-w-app flex flex-col gap-y-8 h-full relative mx-auto w-full app:border-x border-border-light">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-14 gap-x-0">
          <ContentPagination
            type="course"
            course={courseMetadata}
            currentLesson={currentLessonIndex + 1}
          />
          <div className="py-8 order-2 lg:order-1 col-span-1 md:col-span-7 xl:col-span-8 flex flex-col gap-y-8 lg:border-border-light border-t border-t-border-light lg:border-t-0 lg:border-r xl:border-x border-border-light px-5 lg:px-6">
            <MdxLayout>
              <ContentFallbackNotice
                locale={locale}
                originalLocale={lessonLocale}
              />
              {Lesson}
            </MdxLayout>

            <CourseFooter
              nextLesson={!!nextLesson}
              courseMetadata={courseMetadata}
              nextLessonSlug={nextLessonSlug}
              challenge={challenge!}
            />
          </div>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
