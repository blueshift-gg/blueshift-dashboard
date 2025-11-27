"use client";
import { useRef, useState, useEffect } from "react";
import { CrosshairCorners } from "@blueshift-gg/ui-components";
import NFTScene from "./NFTScene";
import { useOnClickOutside } from "usehooks-ts";
import { AnimatePresence, motion } from "motion/react";
import { anticipate } from "motion";
import { CourseDifficulty } from "@/app/utils/course";
import { CourseLanguages } from "@/app/utils/course";

export default function NFTViewer({
  isOpen = true,
  onClose,
  challengeName,
  challengeLanguage,
  challengeDifficulty,
  originPosition,
}: {
  isOpen: boolean;
  onClose: () => void;
  challengeName: string;
  challengeLanguage: CourseLanguages;
  challengeDifficulty: CourseDifficulty;
  originPosition?: { x: number; y: number } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => onClose());

  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Reset animation state when component is closed
  useEffect(() => {
    if (!isOpen) {
      setIsAnimationComplete(false);
    }
  }, [isOpen]);

  // Calculate transform-origin and initial position based on click position
  const getTransformOrigin = () => {
    if (!originPosition) return "center center";

    // Convert screen coordinates to percentages relative to the viewport
    const originX = (originPosition.x / window.innerWidth) * 100;
    const originY = (originPosition.y / window.innerHeight) * 100;

    return `${originX}% ${originY}%`;
  };

  // Calculate initial position offset from center for animation
  const getInitialPosition = () => {
    if (!originPosition) return { x: 0, y: 0 };

    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? window.innerWidth * 0.95 : 480;
    const cardHeight = isMobile ? cardWidth * (4 / 3) : 480; // aspect-[3/4] on mobile, square on desktop

    // Calculate viewport center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const clickX = originPosition.x;
    const clickY = originPosition.y;

    const relativeX = clickX / window.innerWidth;
    const relativeY = clickY / window.innerHeight;

    let cardAnchorX, cardAnchorY;

    // Horizontal positioning - more conservative thresholds
    if (relativeX < 0.35) {
      cardAnchorX = 0;
    } else if (relativeX > 0.65) {
      cardAnchorX = 1;
    } else {
      cardAnchorX = 0.5;
    }

    // Vertical positioning - more conservative thresholds
    if (relativeY < 0.35) {
      cardAnchorY = 0;
    } else if (relativeY > 0.65) {
      cardAnchorY = 1;
    } else {
      cardAnchorY = 0.5;
    }

    // Calculate the card's desired center position based on the anchor point
    const desiredCenterX = clickX - (cardAnchorX - 0.5) * cardWidth;
    const desiredCenterY = clickY - (cardAnchorY - 0.5) * cardHeight;

    // Return offset from viewport center
    return {
      x: desiredCenterX - centerX,
      y: desiredCenterY - centerY,
    };
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: anticipate }}
            className="z-100 fixed flex items-center justify-center w-screen h-screen top-0 left-0 bg-black/80 backdrop-blur-xs"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0,
                x: getInitialPosition().x,
                y: getInitialPosition().y,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.3,
                x: getInitialPosition().x,
                y: getInitialPosition().y,
                transition: { duration: 0.2 },
              }}
              transition={{
                opacity: { duration: 0.4, delay: 0, ease: anticipate },
                scale: { duration: 0.5, ease: anticipate },
                x: { duration: 0.5, ease: anticipate },
                y: { duration: 0.5, ease: anticipate },
              }}
              onAnimationComplete={() => setIsAnimationComplete(true)}
              onAnimationStart={() => setIsAnimationComplete(false)}
              className="w-max flex flex-col bg-card-solid/80 backdrop-blur-xl relative"
              ref={ref}
              style={{
                transformOrigin: getTransformOrigin(),
              }}
            >
              <CrosshairCorners animationDelay={0} />
              <div className="relative aspect-[3/4] md:aspect-square w-[95dvw] xs:w-[80dvw] md:w-[480px] md:h-[480px] overflow-hidden p-2 pb-2 col-span-3">
                <NFTScene
                  isAnimationComplete={isAnimationComplete}
                  challengeName={challengeName}
                  challengeLanguage={challengeLanguage}
                  challengeDifficulty={challengeDifficulty}
                  useAnimation={true}
                  showBackground={true}
                />
                {!isAnimationComplete && (
                  <div className="w-full h-full z-10 flex items-center justify-center bg-gradient-to-b from-[#0D0E14] to-black">
                    <div className="absolute top-1/2 -translate-y-1/2 flex h-[4px] w-[40px] items-center">
                      <div className="h-[2px] w-[60px] bg-white/10" />
                      <motion.div
                        className="absolute top-0 left-0 h-[2px] bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: "60px" }}
                        transition={{
                          duration: 0.6,
                          delay: 0.1,
                          ease: anticipate,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* <div className="overflow-hidden py-4 px-5 col-span-2 relative z-10">
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-mute">Mint Number</div>
                    <div className="font-mono text-xs text-shade-primary">4/102</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-mute">Transaction Hash</div>
                    <div className="flex items-center gap-x-1">
                      <a
                        href="#"
                        className="font-mono text-xs text-shade-primary underline underline-offset-2"
                      >
                        eee77...77eee
                      </a>
                      <Icon
                        name="Copy"
                        size={12}
                        className="text-mute hover:text-shade-primary transition cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
