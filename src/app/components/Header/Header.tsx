"use client";

import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useState, useRef, RefObject } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useOnClickOutside } from "usehooks-ts";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { localeNames, routing } from "@/i18n/routing";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { usePersistentStore } from "@/stores/store";

import Logo from "../Logo/Logo";
import { Button, Tabs } from "@blueshift-gg/ui-components";
import LogoGlyph from "../Logo/LogoGlyph";
import MarketingBanner from "../MarketingBanner/MarketingBanner";

export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const currentLocale = useLocale();
  const { locales } = routing;
  const { marketingBannerViewed, _hasHydrated } = usePersistentStore();

  const router = useRouter();
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(languageDropdownRef as RefObject<HTMLDivElement>, () =>
    setIsLanguageDropdownOpen(false)
  );

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLanguageDropdownOpen(false);
  };

  const isCourses =
    pathname.startsWith("/courses") ||
    pathname.startsWith(`/${currentLocale}/courses`);

  const isPaths =
    pathname === "/" ||
    pathname === `/${currentLocale}` ||
    pathname.startsWith("/paths") ||
    pathname.startsWith(`/${currentLocale}/paths`);

  return (
    <motion.div
      initial={{ paddingBottom: 0 }}
      className={classNames("relative transition-all", {
        "!pb-[60px] sm:!pb-[40px]": _hasHydrated && !marketingBannerViewed,
      })}
    >
      <div className="fixed w-full flex flex-col z-40">
        <div className="bg-background/80 backdrop-blur-lg z-40 w-full border-b border-b-border-light">
          <div className="flex w-full items-center justify-between max-w-[1440px] mx-auto py-5 px-4 lg:px-8">
            <div className="flex gap-x-8 lg:gap-x-12 items-center">
              <Link href="/" className="lg:hidden flex">
                <LogoGlyph height={18} />
              </Link>
              <Link href="/" className="hidden lg:flex">
                <Logo showText={true} height={18} />
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
                    selected: pathname === "/challenges",
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
                  className="!p-3 flex"
                  crosshairProps={{
                    size: 0,
                  }}
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                />
                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: anticipate }}
                      className="border border-border z-50 rounded-xl flex w-max flex-col gap-y-1 absolute top-[calc(100%+6px)] right-0 p-1 bg-card-solid"
                    >
                      {locales.map((locale) => (
                        <button
                          key={locale}
                          onClick={() => handleLanguageChange(locale)}
                          className={classNames(
                            "flex items-center relative gap-x-4 py-3 px-4 rounded-lg transition hover:bg-card-solid-foreground",
                            locale === currentLocale &&
                              "bg-card-solid-foreground"
                          )}
                        >
                          <span
                            className={classNames(
                              "text-sm font-medium leading-none",
                              locale === currentLocale
                                ? "text-shade-primary"
                                : "text-shade-secondary"
                            )}
                          >
                            {localeNames[locale]}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wallet Multi Button and Error Display */}
              <div className="relative">
                <WalletMultiButton />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                icon={{ name: "Table", size: 18 }}
                className="!p-3 flex md:hidden"
                onClick={() => setIsOpen(true)}
                crosshairProps={{
                  size: 0,
                }}
              />
              {/* Mobile Menu Panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="before:absolute before:-left-36 before:top-0 before:w-36 before:h-full before:bg-gradient-to-r before:from-transparent before:to-background before:z-10 justify-between left-0 flex md:hidden absolute w-full h-full z-10 bg-background py-3 px-4"
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
