import classNames from "classnames";
import { anticipate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";

interface ModalProps {
  width?: number;
  children: React.ReactNode;
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  onClose?: () => void;
  isOpen: boolean;
  className?: string;
  cardClassName?: string;
  isResponsive?: boolean;
  showBackdrop?: boolean;
  closeOnClickOutside?: boolean;
}

export default function Modal({
  width = 350,
  children,
  position,
  onClose,
  isOpen,
  className,
  cardClassName,
  isResponsive = true,
  showBackdrop = true,
  closeOnClickOutside = true,
}: ModalProps) {
  const cardRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;

  useOnClickOutside(cardRef, () => {
    if (closeOnClickOutside) {
      onClose?.();
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: anticipate }}
          className={classNames(
            "fixed inset-0 h-screen w-full z-30 items-center justify-center flex flex-col",
            className,
            isOpen && "no-scroll"
          )}
        >
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: anticipate, delay: 0.05 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2, delay: 0.05, ease: anticipate },
              }}
              className="w-full fixed h-screen inset-0 bg-background/80 backdrop-blur-[3px]"
            />
          )}
          <motion.div
            ref={cardRef as React.RefObject<HTMLDivElement>}
            className={classNames(
              "relative bg-card-solid justify-center items-center flex flex-col px-6 pt-8 pb-6 gradient-border before:[background:linear-gradient(180deg,rgba(173,185,210,0.1),rgba(173,185,210,0.05))]",
              position !== null && "!absolute",
              cardClassName,
              "max-w-[calc(100dvw-16px)]",
              isResponsive &&
                "absolute h-max left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:top-auto !top-20 min-w-[calc(100dvw-16px)] sm:min-w-min"
            )}
            style={{
              width: width ? `${width}px` : "auto",
              top: position?.top && `${position.top}px`,
              left: position?.left && `${position.left}px`,
              right: position?.right && `${position.right}px`,
              bottom: position?.bottom && `${position.bottom}px`,
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: anticipate }}
            exit={{ opacity: 0, scale: 0.7 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
