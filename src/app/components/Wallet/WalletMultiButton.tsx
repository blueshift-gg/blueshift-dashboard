"use client";

import React, { useCallback, useState } from "react";
import { breeze, Button, crisp } from "@blueshift-gg/ui-components";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";

interface WalletButtonProps {
  disabled?: boolean;
  className?: string;
}

export default function WalletMultiButton({
  disabled = false,
  className,
}: WalletButtonProps) {
  const [isHoveringLocal, setIsHoveringLocal] = useState<boolean>(false);
  const { status, publicKey, login, logout, isLoggingIn, isLoggingOut } =
    useAuth();
  const address = publicKey?.toBase58();

  const showDisconnectOverlay = isHoveringLocal && status === "signed-in";

  const getButtonLabel = useCallback(() => {
    if (status === "signing-in") return "Signing In...";
    if (status === "signed-in" && address) {
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    return "Connect Wallet";
  }, [address, status]);

  const buttonLabel = getButtonLabel();

  const handleClick = useCallback(() => {
    if (status === "signed-in") {
      logout();
    } else {
      login();
    }
  }, [status, login, logout]);

  return (
    <div
      onMouseEnter={() => setIsHoveringLocal(true)}
      onMouseLeave={() => setIsHoveringLocal(false)}
      className={classNames("relative", className)}
    >
      <Button
        disabled={disabled || isLoggingIn || isLoggingOut}
        label={buttonLabel}
        icon={{ name: "Wallet", size: 18 }}
        variant={status === "signed-in" ? "secondary" : "primary"}
        size="md"
        onClick={handleClick}
      />
      {showDisconnectOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-card-solid/5 backdrop-blur-[8px]">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1, ease: crisp }}
            className="flex items-center gap-x-1.5 font-mono text-[15px] font-medium leading-none text-shade-primary"
          >
            <Icon name="Disconnect" />
            <DecryptedText isHovering={isHoveringLocal} text="Disconnect" />
          </motion.span>
        </div>
      )}
    </div>
  );
}
