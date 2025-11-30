"use client";
import React, { useState, useEffect } from "react";

export interface AnchorDiscriminatorCalculatorProps {
  value: string;
  displayMode?: "account" | "instruction" | "both";
}

export const AnchorDiscriminatorCalculator = ({
  value,
  displayMode = "both",
}: AnchorDiscriminatorCalculatorProps) => {
  const [seed, setSeed] = useState(value);
  const [accountDiscriminator, setAccountDiscriminator] = useState("");
  const [instructionDiscriminator, setInstructionDiscriminator] = useState("");
  const [accountSeedFormatted, setAccountSeedFormatted] = useState("");
  const [instructionSeedFormatted, setInstructionSeedFormatted] = useState("");

  // SHA256 implementation for browser
  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray;
  };

  // Convert to PascalCase
  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[a-z]/, (char) => char.toUpperCase());
  };

  // Convert to snake_case
  const toSnakeCase = (str: string) => {
    return str
      .replace(/([A-Z])/g, "_$1")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .toLowerCase()
      .replace(/^_+|_+$/g, "");
  };

  const calculateDiscriminators = async (inputSeed: string) => {
    if (!inputSeed.trim()) {
      setAccountDiscriminator("");
      setInstructionDiscriminator("");
      setAccountSeedFormatted("");
      setInstructionSeedFormatted("");
      return;
    }

    try {
      // Convert seed to appropriate case
      const accountSeed = toPascalCase(inputSeed);
      const instructionSeed = toSnakeCase(inputSeed);

      setAccountSeedFormatted(accountSeed);
      setInstructionSeedFormatted(instructionSeed);

      // Account discriminator: sha256("account:" + PascalCase)[0..8]
      const accountHash = await sha256(`account:${accountSeed}`);
      const accountDisc = accountHash.slice(0, 8);

      // Instruction discriminator: sha256("global:" + snake_case)[0..8]
      const instructionHash = await sha256(`global:${instructionSeed}`);
      const instructionDisc = instructionHash.slice(0, 8);

      // Convert to hex strings
      // const accountHex = accountDisc.map(b => b.toString(16).padStart(2, '0')).join('');
      // const instructionHex = instructionDisc.map(b => b.toString(16).padStart(2, '0')).join('');

      // Also show as byte arrays
      const accountBytes = `[${accountDisc.join(", ")}]`;
      const instructionBytes = `[${instructionDisc.join(", ")}]`;

      setAccountDiscriminator(`${accountBytes}`);
      setInstructionDiscriminator(`${instructionBytes}`);
    } catch (error) {
      console.error("Error calculating discriminators:", error);
      setAccountDiscriminator("Error calculating");
      setInstructionDiscriminator("Error calculating");
    }
  };

  useEffect(() => {
    calculateDiscriminators(seed);
  }, [seed]);

  return (
    <div className="mx-auto p-6 bg-card-solid border border-border flex flex-col gap-y-4 group enabled:hover:cursor-pointer transition duration-200 enabled:hover:bg-card-solid-foreground/50">
      <div className="text-2xl font-bold">Anchor Discriminator Calculator</div>
      <label
        htmlFor="seed"
        className="block text-md font-medium text-gray-400 mb-1"
      >
        Account/Instruction Name
      </label>
      <div className="w-full group focus-within:outline transition outline-transparent focus-within:outline-border-active relative h-[50px] px-3 bg-card border border-border bg-card-solid flex items-center gap-x-3">
        <input
          id="seed"
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="e.g., MyAccount, initialize, update_data"
          className="w-full placeholder:text-mute transition leading-none h-full outline-none bg-transparent"
        />
      </div>
      <div className="flex justify-center items-center w-full">
        <div
          className={`grid ${displayMode === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4 w-full max-w-4xl`}
        >
          {(displayMode === "account" || displayMode === "both") && (
            <div className="text-center border border-border p-2 py-4">
              <div className="text-lg font-semibold">Account</div>
              <div className="text-sm text-gray-400 mb-2">
                {" "}
                {'sha256("account:" + PascalCase(seed))[0..8]'}
              </div>
              <div className="font-mono text-brand-primary text-sm">
                {accountDiscriminator || "[0, 0, 0, 0, 0, 0, 0, 0]"}
              </div>
            </div>
          )}

          {(displayMode === "instruction" || displayMode === "both") && (
            <div className="text-center border border-border p-2 py-4">
              <div className="text-lg font-semibold">Instruction</div>
              <div className="text-sm text-gray-400 mb-2">
                {'sha256("global:" + snake_case(seed))[0..8]'}
              </div>
              <div className="font-mono text-brand-primary text-sm">
                {instructionDiscriminator || "[0, 0, 0, 0, 0, 0, 0, 0]"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
