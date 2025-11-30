"use client";

import classNames from "classnames";
import { Icon, Logo } from "@blueshift-gg/ui-components";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { localeNames, routing } from "@/i18n/routing";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { usePersistentStore } from "@/stores/store";

// import Logo from "../Logo/Logo";
import { Button, Tabs, DropdownMenu } from "@blueshift-gg/ui-components";
// import LogoGlyph from "../Logo/LogoGlyph";
import MarketingBanner from "../MarketingBanner/MarketingBanner";

export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const currentLocale = useLocale();
  const { locales } = routing;
  const { marketingBannerViewed, _hasHydrated } = usePersistentStore();

  const router = useRouter();

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(languageDropdownRef as React.RefObject<HTMLElement>, () => {
    setIsLanguageOpen(false);
  });

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const isCourses =
    pathname.startsWith("/courses") ||
    pathname.startsWith(`/${currentLocale}/courses`);

  const isChallenges =
    pathname.startsWith("/challenges") ||
    pathname.startsWith(`/${currentLocale}/challenges`);

  const isPaths =
    pathname === "/" ||
    pathname === `/${currentLocale}` ||
    pathname.startsWith("/paths") ||
    pathname.startsWith(`/${currentLocale}/paths`);

  return (
    <motion.div
      initial={{ paddingBottom: 0 }}
      className={classNames("relative transition-all", {
        "pb-[60px]! sm:pb-[40px]!": _hasHydrated && !marketingBannerViewed,
      })}
    >
      <div className="fixed w-full flex flex-col z-40">
        <div className="bg-background/80 backdrop-blur-lg z-40 w-full border-b border-b-border-light">
          <div className="flex w-full items-center justify-between max-w-app mx-auto py-4 px-4 lg:px-5">
            <div className="flex gap-x-8 xl:gap-x-12 items-center">
              <Link href="/" className="lg:hidden flex">
                <Logo hideText height={18} />
              </Link>
              <Link href="/" className="hidden lg:flex">
                <Logo height={18} />
              </Link>

              <Tabs
                items={[
                  {
                    label: t("header.paths"),
                    value: "paths",
                    icon: { name: "Path", size: 18 },
                    selected: isPaths,
                    onClick: () => router.push("/"),
                  },
                  {
                    label: t("header.courses"),
                    value: "courses",
                    icon: { name: "Lessons", size: 18 },
                    selected: isCourses,
                    onClick: () => router.push("/courses"),
                  },
                  {
                    label: t("header.challenges"),
                    value: "challenges",
                    icon: { name: "Challenge", size: 18 },
                    selected: isChallenges,
                    onClick: () => router.push("/challenges"),
                  },
                  {
                    label: t("header.perks"),
                    value: "perks",
                    icon: { name: "Perks", size: 18 },
                    selected: pathname === "/perks",
                    onClick: () => router.push("/perks"),
                  },
                ]}
                variant="tab"
                theme="primary"
                className="hidden lg:flex"
              />
            </div>

            <div className="flex gap-x-2 md:gap-x-3 items-center">
              {/* Language Switcher */}
              <div className="relative" ref={languageDropdownRef}>
                <Button
                  variant="outline"
                  icon={{ name: "Globe", size: 18 }}
                  size="md"
                  hideLabel
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                />
                <DropdownMenu
                  isOpen={isLanguageOpen}
                  items={locales.map((locale) => ({
                    label: localeNames[locale],
                    value: locale,
                  }))}
                  selectedItem={currentLocale}
                  handleChange={(item) => {
                    if (typeof item === "string") {
                      handleLanguageChange(item);
                    } else if (
                      Array.isArray(item) &&
                      typeof item[0] === "string"
                    ) {
                      handleLanguageChange(item[0]);
                    }
                    setIsLanguageOpen(false);
                  }}
                />
              </div>

              {/* Wallet Multi Button and Error Display */}
              <div className="relative">
                <WalletMultiButton />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                icon={{ name: "Table", size: 18 }}
                className="p-3! flex lg:hidden"
                onClick={() => setIsOpen(true)}
                crosshairProps={{
                  size: 0,
                }}
              />
              {/* Mobile Menu Panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="before:absolute before:-left-36 before:top-0 before:w-36 before:h-full before:bg-linear-to-r before:from-transparent before:to-background before:z-10 justify-between left-0 flex md:hidden absolute w-full h-full z-10 bg-background py-3 px-4"
                    initial={{ x: "100dvw" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100dvw" }}
                    transition={{ duration: 0.15, ease: anticipate }}
                  ></motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <MarketingBanner />
      </div>
    </motion.div>
  );
}
