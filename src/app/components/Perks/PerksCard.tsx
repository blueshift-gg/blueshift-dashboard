import { Avatar, IconName, Button } from "@blueshift-gg/ui-components";
import { Perk } from "./Perks";

export default function PerksCard({ perk }: { perk: Perk }) {
  return (
    <div
      key={perk.productName}
      className="flex flex-col gap-y-7 p-px border border-current/15 w-full bg-current/5"
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
          <span className="text-current leading-[120%] font-medium text-lg">
            {perk.productName}
          </span>
          <span className="text-shade-primary font-mono text-2xl md:text-[28px] leading-none font-medium">
            {perk.perk}
          </span>
        </div>
      </div>

      <div className="bg-background/40 p-3 w-full flex items-center justify-center">
        <Button variant="secondary" size="lg" className="w-full">
          Claim {perk.perkType === "airdrop" ? "Airdrop" : "Perk"}
        </Button>
      </div>
    </div>
  );
}
