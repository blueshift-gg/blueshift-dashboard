"use client";
import { Button } from "@blueshift-gg/ui-components";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const t = useTranslations();

  const isChallengesRoute = pathname.includes("/challenges");
  const isCoursesRoute = pathname.includes("/courses");

  // Set appropriate content based on the route
  let message: string;
  let buttons: React.ReactNode;

  if (isChallengesRoute) {
    message = "The challenge you are looking for doesn't exist.";
    buttons = (
      <Link href="/challenges">
        <Button icon={{ name: "ArrowLeft" }} label={t("ChallengePage.head_to_challenges")} />
      </Link>
    );
  } else if (isCoursesRoute) {
    message = "The course or lesson you are looking for doesn't exist.";
    buttons = (
      <Link href="/">
        <Button icon={{ name: "ArrowLeft" }} label={t("ChallengePage.back_to_lessons")} />
      </Link>
    );
  } else {
    message = "The page you are looking for doesn't exist.";
    buttons = (
      <Link href="/">
        <Button icon={{ name: "ArrowLeft" }} label={t("ChallengePage.back_to_homepage")} />
      </Link>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="flex flex-col items-center justify-center gap-y-2">
        <div className="font-mono text-9xl text-brand-primary">
          4<span className="animate-pulse">0</span>4
        </div>
        <p className="font-medium text-shade-secondary">{message}</p>
      </div>
      {buttons}
    </div>
  );
}
