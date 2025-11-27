"use client";
import Modal from "./Modal";
import { useStore, usePersistentStore } from "@/stores/store";
import { useTranslations } from "next-intl";
import { Button } from "@blueshift-gg/ui-components";
import classNames from "classnames";
export default function ConnectWalletRecommended() {
  const t = useTranslations();
  const { openedModal, closeModal } = useStore();
  const { setConnectionRecommendedViewed } = usePersistentStore();
  const { marketingBannerViewed } = usePersistentStore();

  return (
    <Modal
      position={{ top: 86, right: 32 }}
      isOpen={openedModal === "connect-wallet-recommended"}
      onClose={closeModal}
      showBackdrop={true}
      width={360}
      closeOnClickOutside={false}
      cardClassName={classNames("!top-20", {
        "sm:!top-32 !top-36": !marketingBannerViewed,
      })}
    >
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-2 text-center">
          <img
            src="/graphics/connect-wallet.svg"
            className="h-28 mx-auto"
          ></img>
          <div className="text-xl font-medium">
            {t("wallet_recommended.title")}
          </div>
          <span className="text-shade-secondary">
            {t("wallet_recommended.description")}
          </span>
        </div>
        <div className="flex flex-col gap-y-4">
          <Button
            label={t("wallet_recommended.connect_wallet")}
            variant="primary"
            size="lg"
            className="!w-full"
            icon={{ name: "Wallet" }}
            onClick={closeModal}
          />
          <div
            className="text-mute transition hover:text-shade-tertiary text-sm font-medium mx-auto cursor-pointer"
            onClick={() => {
              setConnectionRecommendedViewed(true);
              closeModal();
            }}
          >
            {t("wallet_recommended.dont_show_again")}
          </div>
        </div>
      </div>
    </Modal>
  );
}
