import { breeze, glide, nova, silk } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const ProgressCircle = ({
  percentFilled,
  className,
  innerClassName,
}: {
  percentFilled: number;
  className?: string;
  innerClassName?: string;
}) => {
  const [showTick, setShowTick] = useState(false);
  // Always show a minimum of 5% progress, even if percentFilled is 0
  const safePercentFilled = Math.max(percentFilled, 5);
  const angleDegrees = safePercentFilled * 3.6;
  const isFull = percentFilled >= 100;

  useEffect(() => {
    if (!isFull) {
      setShowTick(false);
    }
  }, [isFull]);

  return (
    <div
      className={classNames(
        "w-[16px] h-[16px] flex items-center relative justify-center border-[1.5px] border-shade-secondary rounded-full",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {showTick ? (
          <motion.svg
            className="will-change-contents absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            key="tick"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15, ease: glide }}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 12 12"
          >
            <path
              d="m6,0C2.691,0,0,2.691,0,6s2.691,6,6,6,6-2.691,6-6S9.309,0,6,0Zm2.853,4.45l-3.003,4c-.13.174-.329.282-.546.298-.019.001-.036.002-.054.002-.198,0-.389-.078-.53-.219l-1.503-1.5c-.293-.292-.293-.768,0-1.061s.768-.294,1.062,0l.892.89,2.484-3.31c.248-.331.718-.4,1.05-.149.331.249.398.719.149,1.05Z"
              strokeWidth="0"
              fill="currentColor"
            ></path>
          </motion.svg>
        ) : (
          <motion.div
            key="circle"
            initial={{ ["--percentFilled" as string]: "0deg" }}
            animate={{ ["--percentFilled" as string]: `${angleDegrees}deg` }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
            transition={{ duration: 1.25, ease: nova }}
            onAnimationComplete={() => {
              if (isFull) {
                setShowTick(true);
              }
            }}
            className={classNames(
              "h-[8px] w-[8px] shrink-0 rounded-full bg-[conic-gradient(#ced5e4_var(--percentFilled),transparent_0)]",
              innerClassName
            )}
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressCircle;
