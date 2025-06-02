import { Link } from "@/i18n/navigation";
import Icon from "../Icon/Icon";

export default function Footer() {
  const year = new Date().getFullYear();

  const twitterLink = process.env.NEXT_PUBLIC_TWITTER_LINK ?? "";
  const discordLink = process.env.NEXT_PUBLIC_DISCORD_LINK ?? "";
  const githubLink = process.env.NEXT_PUBLIC_GITHUB_LINK ?? "";
  const build =
    process.env.NEXT_PUBLIC_COMMIT_HASH?.substring(0, 7) ?? "DEVELOPMENT";
  
  return (
    <div className="border-t border-t-border bg-background-card py-8">
      <div className="wrapper">
        <div className="flex flex-col sm:gap-y-0 gap-y-6 justify-center sm:flex-row items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-tertiary/75 font-mono text-sm">
              Blueshift &copy; {year}
            </span>
            <span className="text-tertiary/25 font-mono text-xs text-center sm:text-left mt-1">
              Commit: {build}
            </span>
          </div>
          <div className="flex items-center gap-x-8">
            <Link
              href={twitterLink}
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="X"></Icon>
            </Link>
            <Link
              href={githubLink}
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="Github"></Icon>
            </Link>
            <Link
              href={discordLink}
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="Discord"></Icon>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
