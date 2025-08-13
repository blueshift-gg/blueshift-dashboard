"use client";

import classNames from "classnames";
import Icon from "../Icon/Icon";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useState, useRef, RefObject } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useOnClickOutside } from "usehooks-ts";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { localeNames, routing } from "@/i18n/routing";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";

import Logo from "../Logo/Logo";
import Button from "@/app/components/Button/Button";
import LogoGlyph from "../Logo/LogoGlyph";

export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const currentLocale = useLocale();
  const { locales } = routing;

  const router = useRouter();
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(languageDropdownRef as RefObject<HTMLDivElement>, () =>
    setIsLanguageDropdownOpen(false)
  );

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLanguageDropdownOpen(false);
  };

  const isRootOrCourses =
    pathname === "/" ||
    pathname === `/${currentLocale}` ||
    pathname.startsWith("/courses") ||
    pathname.startsWith(`/${currentLocale}/courses`);

  return (
    <div className="fixed bg-background/80 backdrop-blur-lg z-40 w-full border-b border-b-border">
      <div className="flex w-full items-center justify-between max-w-app mx-auto py-3 px-4 md:px-8">
        <div className="flex gap-x-16 items-center">
          <Link href="/" className="md:hidden flex">
            <LogoGlyph height={18} />
          </Link>
          <Link href="/" className="hidden md:flex">
            <Logo showText={true} height={18} />
          </Link>

          {/* Desktop Header */}
          <motion.div
            style={{ originY: "0px" }}
            className="gap-x-6 hidden md:flex"
          >
            {/* Desktop Nav Links - Courses */}
            <Link
              className={classNames(
                "py-2.5 px-3 relative rounded-xl transition flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                {
                  " !text-brand-primary": isRootOrCourses,
                }
              )}
              href="/"
            >
              {isRootOrCourses && (
                <motion.div
                  layoutId="nav-desktop"
                  style={{ originY: "0px" }}
                  transition={{ duration: 0.4, ease: anticipate }}
                  className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                ></motion.div>
              )}
              <Icon
                name="Lessons"
                className={classNames("text-text-tertiary", {
                  "!text-brand-primary": isRootOrCourses,
                })}
              />
              <span
                className={classNames("font-mono text-[15px] pt-0.5", {
                  "text-brand-secondary": isRootOrCourses,
                })}
              >
                {t("header.courses")}
              </span>
            </Link>
            {/* Desktop Nav Links - Challenges */}
            <Link
              className={classNames(
                "py-2.5 px-3 relative transition rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                {
                  "!text-brand-primary": pathname.includes("/challenges"),
                }
              )}
              href="/challenges"
            >
              {pathname.includes("/challenges") && (
                <motion.div
                  layoutId="nav-desktop"
                  style={{ originY: "0px" }}
                  transition={{ duration: 0.4, ease: anticipate }}
                  className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                ></motion.div>
              )}
              <Icon
                name="Challenge"
                className={classNames("text-text-tertiary", {
                  "!text-brand-primary": pathname === "/challenges",
                })}
              />
              <span
                className={classNames("font-mono text-[15px] pt-0.5", {
                  "text-brand-secondary": pathname === "/challenges",
                })}
              >
                {t("header.challenges")}
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="flex gap-x-2 md:gap-x-3 items-center">
          {/* Language Switcher */}
          <div className="relative" ref={languageDropdownRef}>
            <Button
              variant="tertiary"
              icon="Globe"
              className="!w-[42px] flex"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            />
            <AnimatePresence>
              {isLanguageDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4, ease: anticipate }}
                  className="border border-border z-50 rounded-xl flex w-max flex-col gap-y-1 absolute top-[calc(100%+6px)] right-0 p-1 bg-background-card"
                >
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => handleLanguageChange(locale)}
                      className={classNames(
                        "flex items-center relative gap-x-4 py-3 px-4 rounded-lg transition hover:bg-background-card-foreground",
                        locale === currentLocale &&
                          "bg-background-card-foreground"
                      )}
                    >
                      <span
                        className={classNames(
                          "text-sm font-medium leading-none",
                          locale === currentLocale
                            ? "text-primary"
                            : "text-secondary"
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
            variant="tertiary"
            icon="Table"
            className="!px-0 !w-[42px] flex md:hidden"
            onClick={() => setIsOpen(true)}
          />
          {/* Mobile Menu Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="before:absolute before:-left-36 before:top-0 before:w-36 before:h-full before:bg-gradient-to-r before:from-transparent before:to-background before:z-10 justify-between left-0 flex md:hidden absolute w-full h-full z-10 bg-background py-3 px-4"
                initial={{ x: "100dvw" }}
                animate={{ x: isOpen ? 0 : "0dvw" }}
                exit={{ x: "100dvw" }}
                transition={{ duration: 0.15, easing: anticipate }}
              >
                <div className="flex gap-x-6 items-center">
                  {/* Mobile Nav Links - Courses */}
                  <Link
                    className={classNames(
                      "py-2.5 px-3 relative rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                      {
                        " !text-brand-primary": isRootOrCourses,
                      }
                    )}
                    href="/"
                  >
                    {isRootOrCourses && (
                      <motion.div
                        layoutId="nav-mobile"
                        transition={{ duration: 0.4, ease: anticipate }}
                        className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                      ></motion.div>
                    )}
                    <Icon
                      name="Lessons"
                      className={classNames("text-text-tertiary", {
                        "!text-brand-primary": isRootOrCourses,
                      })}
                    />
                    <span
                      className={classNames("font-mono text-[15px] pt-0.5", {
                        "text-brand-secondary": isRootOrCourses,
                      })}
                    >
                      {t("header.courses")}
                    </span>
                  </Link>
                  {/* Mobile Nav Links - Challenges */}
                  <Link
                    className={classNames(
                      "py-2.5 relative px-3 rounded-xl flex items-center text-secondary hover:text-primary justify-center gap-x-2 font-medium",
                      {
                        " !text-brand-primary": pathname === "/challenges",
                      }
                    )}
                    href="/challenges"
                  >
                    {pathname === "/challengesk" && (
                      <motion.div
                        layoutId="nav-mobile"
                        transition={{ duration: 0.4, ease: anticipate }}
                        className="w-full absolute left-0 top-0 rounded-xl h-full bg-background-primary"
                      ></motion.div>
                    )}
                    <Icon
                      name="Challenge"
                      className={classNames("text-text-tertiary", {
                        "!text-brand-primary": pathname === "/challenges",
                      })}
                    />
                    <span
                      className={classNames("font-mono text-[15px] pt-0.5", {
                        "text-brand-secondary": pathname === "/challenges",
                      })}
                    >
                      {t("header.challenges")}
                    </span>
                  </Link>
                </div>
                <Button
                  variant="tertiary"
                  icon="ArrowRight"
                  className="!px-0 !w-[42px] flex md:hidden"
                  onClick={() => setIsOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
