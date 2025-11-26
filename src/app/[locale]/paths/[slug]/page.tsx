import PageHero from "@/app/components/PageHero/PageHero";

interface PathPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PathPage({ params }: PathPageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-col w-full gap-y-0 px-3 sm:px-4">
      <PageHero badge="Path" title={slug} />
      <div className="flex flex-col gap-y-4 px-6 py-8 md:px-12">
        <p className="text-shade-secondary">
          Path content for {slug} coming soon...
        </p>
      </div>
    </div>
  );
}
