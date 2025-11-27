"use client";

import Modal from "./Modal";
import { useStore } from "@/stores/store";
import { useTranslations } from "next-intl";
import { Button } from "@blueshift-gg/ui-components";
export default function ShiftGoal() {
  const t = useTranslations();
  const { openedModal, closeModal } = useStore();

  return (
    <Modal
      position={{ top: 86, right: 200 }}
      isOpen={openedModal === "shift-goal"}
      onClose={closeModal}
      showBackdrop={false}
    >
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-2 text-center">
          <div className="text-xl font-medium">{t("shift_goal.title")}</div>
          <span className="text-shade-secondary">
            {t("shift_goal.description")}
          </span>
        </div>
        <Button
          label={t("shift_goal.connect_discord")}
          variant="outline"
          icon={{ name: "Discord" }}
          size="lg"
          className="!w-full"
          onClick={closeModal}
        />
      </div>
    </Modal>
  );
}
