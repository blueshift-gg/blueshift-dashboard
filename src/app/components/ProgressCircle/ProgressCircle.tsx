import classNames from "classnames";
import { motion } from "motion/react";

const ProgressCircle = ({
  percentFilled,
  className,
  innerClassName,
}: {
  percentFilled: number;
  className?: string;
  innerClassName?: string;
}) => {
  // Always show a minimum of 5% progress, even if percentFilled is 0
  const safePercentFilled = Math.max(percentFilled, 5);
  const angleDegrees = safePercentFilled * 3.6;
  return (
    <div
      className={classNames(
        "w-[16px] h-[16px] flex items-center justify-center border-[1.5px] border-shade-secondary rounded-full",
        className
      )}
    >
      <motion.div
        initial={{ ["--percentFilled" as string]: "0deg" }}
        animate={{ ["--percentFilled" as string]: `${angleDegrees}deg` }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={classNames(
          "h-[8px] w-[8px] flex-shrink-0 rounded-full bg-[conic-gradient(#ced5e4_var(--percentFilled)_,transparent_0)]",
          innerClassName
        )}
      ></motion.div>
    </div>
  );
};

export default ProgressCircle;
