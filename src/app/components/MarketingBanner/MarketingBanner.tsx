"use client";
import { Button, CrosshairCorners, Icon } from "@blueshift-gg/ui-components";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { URLS } from "@/constants/urls";
import { usePersistentStore } from "@/stores/store";
import DepletingHeart from "../Graphics/DepletingHeart";

export default function MarketingBanner() {
  const t = useTranslations();
  const { setMarketingBannerViewed, _hasHydrated, marketingBannerViewed } = usePersistentStore();

  const stakingUrl = URLS.BLUESHIFT_STAKING;

  const [closeHeart, setCloseHeart] = useState(false);

  function handleCloseBanner() {
    setCloseHeart(true);
    setTimeout(() => {
      setMarketingBannerViewed(true);
    }, 500);
  }
  return (
    <AnimatePresence>
      {_hasHydrated && !marketingBannerViewed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: [0.8, 0, 0.6, 0, 0.4, 0, 0.2, 0], height: 40 }}
          transition={{ duration: 1, ease: anticipate }}
          className="relative h-[60px] w-full items-center justify-center border-y border-brand-primary/15 bg-[#102127] backdrop-blur-xl sm:h-[40px]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.2, 1, 0.4, 1, 0.6, 1, 0.8, 1] }}
            transition={{ duration: 1, ease: anticipate, delay: 0.3 }}
            className="relative mx-auto flex h-full w-full flex-col justify-center gap-x-5 gap-y-1 px-4 sm:w-max sm:flex-row sm:gap-y-0 md:items-center"
          >
            <div className="relative flex gap-x-1.5 sm:items-center sm:gap-x-1.5">
              <DepletingHeart closeHeart={closeHeart} className="mt-[3px] sm:mt-0" />
              <span className="hidden text-sm font-medium text-brand-secondary sm:block">
                {t("marketing_banner.title")}
              </span>
              <span className="relative z-10 inline-block max-w-[80%] text-sm font-medium text-brand-secondary sm:hidden">
                {t.rich("marketing_banner.mobile", {
                  link: (chunks) => (
                    <a
                      href={stakingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary underline"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </span>
            </div>

            <a
              href={stakingUrl}
              target="_blank"
              className="hidden font-medium text-brand-primary sm:block"
              rel="noopener"
            >
              <Button
                size="xs"
                crosshairProps={{ size: 0 }}
                className="px-2! py-0.5! text-xs! font-medium!"
                label={t("marketing_banner.button")}
              />
            </a>
          </motion.div>
          <button
            type="button"
            onClick={() => handleCloseBanner()}
            className="absolute top-1/2 right-3 z-10 flex h-[32px] w-[32px] -translate-y-1/2 items-center justify-center bg-background/60 text-brand-secondary transition hover:cursor-pointer hover:bg-background/60 hover:text-brand-primary sm:bg-transparent"
          >
            <Icon name="Close" size={14 as 18} />
          </button>
          <motion.div
            className="pointer-events-none absolute inset-0 mx-auto flex h-full w-full items-center justify-center"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.3, ease: anticipate }}
          >
            <CrosshairCorners
              thickness={1.5}
              size={6}
              animationDuration={0}
              animationDelay={0}
              variant="bordered"
              className="text-brand-primary"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
