import { Suspense } from "react";
import { getAllPaths } from "@/app/utils/content";
import PathList from "./PathList";

async function PathsContent() {
  const paths = await getAllPaths();

  return <PathList initialPaths={paths} />;
}

export default function Paths() {
  return (
    <div className="relative content-wrapper">
      <Suspense fallback={<PathList isLoading={true} />}>
        <PathsContent />
      </Suspense>
    </div>
  );
}
