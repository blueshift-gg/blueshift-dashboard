import { Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";

interface PathItemDividerProps {
  status?: "completed" | "incomplete";
  className?: string;
}

export default function PathItemDivider({
  status,
  className,
}: PathItemDividerProps) {
  return (
    <div
      className={classNames(
        "w-24 shrink-0 flex items-center justify-center",
        className
      )}
    >
      <div
        className={classNames(
          "h-px w-full shrink border-t",
          status === "completed" && "border-brand-primary",
          status === "incomplete" && "border-border border-dashed"
        )}
      />
      <div
        className={classNames(
          "w-[56px] h-[56px] flex items-center justify-center shrink-0 border",
          status === "completed" &&
            "bg-brand-primary/5 border-brand-primary/25 shadow-[inset_0px_0px_32px] shadow-brand-primary/15",
          status === "incomplete" && "bg-card-solid/50 border-border"
        )}
      >
        <Icon
          name={status === "completed" ? "Success" : "General"}
          size={20}
          className={classNames(
            status === "completed" ? "text-brand-primary" : "text-shade-mute!"
          )}
        />
      </div>
      <div
        className={classNames(
          "h-px w-full shrink border-t",
          status === "completed" && "border-brand-primary",
          status === "incomplete" && "border-border border-dashed"
        )}
      />
    </div>
  );
}
