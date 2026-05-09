import { Avatar, Button, type IconName } from "@blueshift-gg/ui-components";
import type { Perk } from "./Perks";

export default function PerksCard({ perk }: { perk: Perk }) {
  return (
    <div
      key={perk.productName}
      className="flex w-full flex-col gap-y-7 border border-current/15 bg-current/5 p-px"
      style={{ color: perk.brandColor }}
    >
      <div className="flex items-center gap-x-5 px-5 py-6">
        <Avatar
          icon={{ name: perk.icon as IconName, size: 32 }}
          thickness={1.5}
          crosshair={{
            variant: "bordered",
            animationDelay: 0,
            animationDuration: 0.01,
          }}
          className="text-current!"
        />
        <div className="flex flex-col gap-y-1.5">
          <span className="text-lg leading-[120%] font-medium text-current">
            {perk.productName}
          </span>
          <span className="font-mono text-2xl leading-none font-medium text-shade-primary md:text-[28px]">
            {perk.perk}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background/40 p-3">
        <Button variant="secondary" size="lg" className="w-full">
          Claim {perk.perkType === "airdrop" ? "Airdrop" : "Perk"}
        </Button>
      </div>
    </div>
  );
}
