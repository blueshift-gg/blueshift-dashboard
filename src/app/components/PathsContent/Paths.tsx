import { getAllPaths } from "@/app/utils/content";
import PathList from "./PathList";
import { Suspense } from "react";

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
