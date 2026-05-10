import { Icon } from "@blueshift-gg/ui-components";
import { URLS } from "@/constants/urls";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  const twitterLink = URLS.BLUESHIFT_TWITTER;
  const discordLink = URLS.BLUESHIFT_DISCORD;
  const githubLink = URLS.BLUESHIFT_GITHUB;
  const build = process.env.NEXT_PUBLIC_COMMIT_HASH?.substring(0, 7) ?? "DEVELOPMENT";

  return (
    <div className="border-t border-t-border bg-card-solid py-8">
      <div className="wrapper">
        <div className="flex flex-col items-center justify-center gap-y-6 sm:flex-row sm:justify-between sm:gap-y-0">
          <div className="flex flex-col">
            <span className="font-mono text-sm text-shade-tertiary/75">
              Blueshift &copy; {year}
            </span>
            <span className="mt-1 text-center font-mono text-xs text-shade-tertiary/25 sm:text-left">
              Commit: {build}
            </span>
          </div>
          <div className="flex items-center gap-x-8">
            <Link
              href={twitterLink}
              className="text-shade-tertiary transition hover:text-shade-primary"
            >
              <Icon name="X"></Icon>
            </Link>
            <Link
              href={githubLink}
              className="text-shade-tertiary transition hover:text-shade-primary"
            >
              <Icon name="Github"></Icon>
            </Link>
            <Link
              href={discordLink}
              className="text-shade-tertiary transition hover:text-shade-primary"
            >
              <Icon name="Discord"></Icon>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
