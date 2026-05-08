import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  isHovering?: boolean;
}

export default function DecryptedText({
  text,
  speed = 20,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  isHovering = false,
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const shuffleText = (
      currentRevealed: Set<number>,
      isExiting: boolean = false,
    ): string => {
      const positions = text.split("").map((char, i) => ({
        char,
        isSpace: char === " ",
        index: i,
        isRevealed: isExiting
          ? !currentRevealed.has(i)
          : currentRevealed.has(i),
      }));

      const nonSpaceChars = positions
        .filter((p) => !p.isSpace && !p.isRevealed)
        .map((p) => p.char);

      for (let i = nonSpaceChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonSpaceChars[i], nonSpaceChars[j]] = [
          nonSpaceChars[j],
          nonSpaceChars[i],
        ];
      }

      let charIndex = 0;
      return positions
        .map((p) => {
          if (p.isSpace) return " ";
          if (p.isRevealed) return text[p.index];
          return nonSpaceChars[charIndex++];
        })
        .join("");
    };

    if (isHovering) {
      setIsExiting(false);
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices((prevRevealed) => {
          if (prevRevealed.size < text.length) {
            const nextIndex = prevRevealed.size;
            const newRevealed = new Set(prevRevealed);
            newRevealed.add(nextIndex);
            setDisplayText(shuffleText(newRevealed));
            return newRevealed;
          } else {
            clearInterval(interval);
            setIsScrambling(false);
            return prevRevealed;
          }
        });
      }, speed);
    } else if (revealedIndices.size > 0) {
      setIsExiting(true);
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices((prevRevealed) => {
          if (prevRevealed.size > 0) {
            const newRevealed = new Set(prevRevealed);
            newRevealed.delete(prevRevealed.size - 1);
            setDisplayText(shuffleText(newRevealed, true));
            return newRevealed;
          } else {
            clearInterval(interval);
            setIsScrambling(false);
            setIsExiting(false);
            return prevRevealed;
          }
        });
      }, speed);
    } else {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
      setIsExiting(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering, text, speed]);

  return (
    <motion.span
      className={`inline-block whitespace-pre-wrap pt-0.5 ${parentClassName}`}
      {...props}
    >
      <span className="sr-only">{displayText}</span>

      <span aria-hidden="true" className="inline-flex tracking-tight">
        {displayText.split("").map((char, index) => {
          const isRevealedOrDone =
            (isExiting
              ? !revealedIndices.has(index)
              : revealedIndices.has(index)) ||
            !isScrambling ||
            (!isHovering && !isExiting);

          return (
            <span
              key={index}
              className={isRevealedOrDone ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
