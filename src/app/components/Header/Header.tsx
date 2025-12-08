"use client";

import classNames from "classnames";
import { Icon, Logo } from "@blueshift-gg/ui-components";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useOnClickOutside, useWindowSize } from "usehooks-ts";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { localeNames, routing } from "@/i18n/routing";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { usePersistentStore } from "@/stores/store";

// import Logo from "../Logo/Logo";
import { Button, Tabs, DropdownMenu } from "@blueshift-gg/ui-components";
// import LogoGlyph from "../Logo/LogoGlyph";
import MarketingBanner from "../MarketingBanner/MarketingBanner";
import { URLS } from "@/constants/urls";

export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const currentLocale = useLocale();
  const { locales } = routing;
  const { marketingBannerViewed, _hasHydrated } = usePersistentStore();
  const { width } = useWindowSize();

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

  useEffect(() => {
    if (width >= 768) {
      setIsOpen(false);
    }
  }, [width]);

  const twitterLink = URLS.BLUESHIFT_TWITTER;
  const discordLink = URLS.BLUESHIFT_DISCORD;
  const githubLink = URLS.BLUESHIFT_GITHUB;

  return (
    <motion.div
      initial={{ paddingBottom: 0 }}
      className={classNames("relative transition-all", {
        "pb-[60px]! sm:pb-[40px]!": _hasHydrated && !marketingBannerViewed,
      })}
    >
      <div className="fixed w-full flex flex-col z-40">
        <div className="bg-background/80 backdrop-blur-lg z-40 w-full border-b border-b-border-light">
          <div className="flex w-full items-center justify-between max-w-app mx-auto py-4 pl-4 pr-2.5 lg:pr-5 lg:pl-5">
            <div className="flex gap-x-8 xl:gap-x-12 items-center">
              <Link
                href="/"
                className="sm:hidden flex overflow-hidden w-[25px]"
              >
                <Logo hideText height={18} />
              </Link>

              <Link href="/" className="hidden sm:flex">
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
              <div
                className="relative hidden lg:block"
                ref={languageDropdownRef}
              >
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
              <WalletMultiButton className={isOpen ? "hidden" : "flex"} />

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                icon={{ name: isOpen ? "Cross" : "Table", size: 18 }}
                className="p-3! flex lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
                crosshairProps={{
                  size: 0,
                }}
              />
              {/* Mobile Menu Panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="no-scroll bg-background flex flex-col justify-between h-[calc(100dvh-75px)] fixed pb-8 left-0 top-[75px] z-50 w-full"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "calc(100dvh - 75px)" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15, ease: anticipate }}
                  >
                    <Tabs
                      variant="tab"
                      theme="primary"
                      size="lg"
                      className="flex-col! w-full! gap-y-1.5!"
                      items={[
                        {
                          label: t("header.paths"),
                          value: "paths",
                          icon: { name: "Path", size: 18 },
                          className: "justify-start! py-4!",
                          onClick: () => {
                            router.push("/");
                            setIsOpen(false);
                          },
                          selected: isPaths,
                        },
                        {
                          label: t("header.courses"),
                          value: "courses",
                          icon: { name: "Lessons", size: 18 },
                          className: "justify-start! py-4!",
                          onClick: () => {
                            router.push("/courses");
                            setIsOpen(false);
                          },
                          selected: isCourses,
                        },
                        {
                          label: t("header.challenges"),
                          value: "challenges",
                          icon: { name: "Challenge", size: 18 },
                          className: "justify-start! py-4!",
                          onClick: () => {
                            router.push("/challenges");
                            setIsOpen(false);
                          },
                          selected: isChallenges,
                        },
                        {
                          label: t("header.perks"),
                          value: "perks",
                          icon: { name: "Perks", size: 18 },
                          className: "justify-start! py-4!",
                          onClick: () => {
                            router.push("/perks");
                            setIsOpen(false);
                          },
                          selected: pathname === "/perks",
                        },
                      ]}
                    />
                    <div className="flex flex-col gap-y-8 px-4 items-center w-full">
                      <div
                        className="relative w-full"
                        ref={languageDropdownRef}
                      >
                        <Button
                          variant="outline"
                          icon={{ name: "Globe", size: 18 }}
                          size="lg"
                          className="w-full!"
                          label={
                            localeNames[
                              currentLocale as keyof typeof localeNames
                            ]
                          }
                          onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                        />
                        <DropdownMenu
                          isOpen={isLanguageOpen}
                          items={locales.map((locale) => ({
                            label: localeNames[locale],
                            value: locale,
                          }))}
                          menuClassName="top-auto! bottom-[calc(100%+6px)]! origin-bottom! w-full!"
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
                      <div className="flex items-center gap-x-8">
                        <Link
                          href={twitterLink}
                          className="text-shade-tertiary hover:text-shade-primary transition"
                        >
                          <Icon name="X"></Icon>
                        </Link>
                        <Link
                          href={githubLink}
                          className="text-shade-tertiary hover:text-shade-primary transition"
                        >
                          <Icon name="Github"></Icon>
                        </Link>
                        <Link
                          href={discordLink}
                          className="text-shade-tertiary hover:text-shade-primary transition"
                        >
                          <Icon name="Discord"></Icon>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
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
