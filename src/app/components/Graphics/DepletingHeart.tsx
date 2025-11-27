import { anticipate, motion } from "motion/react";

export default function DepletingHeart({
  closeHeart = false,
  className,
}: {
  closeHeart: boolean;
  className?: string;
}) {
  function getAnimation(rowDelay: number) {
    const randomDelay = Math.random() * 0.03;
    return {
      initial: { opacity: 1, fill: "#0FF" },
      animate: {
        opacity: closeHeart ? 0 : 1,
        fill: closeHeart ? "#FF2E2E" : "#0FF",
        transition: {
          fill: {
            duration: 0,
          },
          opacity: {
            duration: 0.1,
            delay: rowDelay + randomDelay,
            ease: anticipate,
          },
        },
      },
    };
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 15 15"
      className={className}
    >
      <motion.g className="Frame 1321317495">
        <g className="Group 166">
          <g className="Row 11">
            <motion.path
              {...getAnimation(0.5)}
              fill="#0FF"
              d="M7 12h1v1H7z"
              className="Rectangle 144"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 10">
            <motion.path
              {...getAnimation(0.4)}
              d="M7 11h1v1H7z"
              className="Rectangle 141"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M6 11h1v1H6z"
              className="Rectangle 142"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M8 11h1v1H8z"
              className="Rectangle 143"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 9">
            <motion.path
              {...getAnimation(0.4)}
              d="M9 10h1v1H9z"
              className="Rectangle 136"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M7 10h1v1H7z"
              className="Rectangle 137"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M6 10h1v1H6z"
              className="Rectangle 138"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M8 10h1v1H8z"
              className="Rectangle 139"
            ></motion.path>
            <motion.path
              {...getAnimation(0.4)}
              d="M5 10h1v1H5z"
              className="Rectangle 140"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 8">
            <motion.path
              {...getAnimation(0.3)}
              d="M9 9h1v1H9z"
              className="Rectangle 130"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M10 9h1v1h-1z"
              className="Rectangle 153"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M4 9h1v1H4z"
              className="Rectangle 131"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M7 9h1v1H7z"
              className="Rectangle 132"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M6 9h1v1H6z"
              className="Rectangle 133"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M8 9h1v1H8z"
              className="Rectangle 134"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M5 9h1v1H5z"
              className="Rectangle 135"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 7">
            <motion.path
              {...getAnimation(0.3)}
              d="M8 8h1v1H8z"
              className="Rectangle 118"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M9 8h1v1H9z"
              className="Rectangle 152"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M3 8h1v1H3z"
              className="Rectangle 119"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M6 8h1v1H6z"
              className="Rectangle 120"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M5 8h1v1H5z"
              className="Rectangle 121"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M7 8h1v1H7z"
              className="Rectangle 122"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M4 8h1v1H4z"
              className="Rectangle 123"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M10 8h1v1h-1z"
              className="Rectangle 154"
            ></motion.path>
            <motion.path
              {...getAnimation(0.3)}
              d="M11 8h1v1h-1z"
              className="Rectangle 155"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 6">
            <motion.path
              {...getAnimation(0.2)}
              d="M7 7h1v1H7z"
              className="Rectangle 112"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M2 7h1v1H2z"
              className="Rectangle 113"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M5 7h1v1H5z"
              className="Rectangle 114"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M4 7h1v1H4z"
              className="Rectangle 115"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M6 7h1v1H6z"
              className="Rectangle 116"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M3 7h1v1H3z"
              className="Rectangle 146"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M10 7h1v1h-1z"
              className="Rectangle 147"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M9 7h1v1H9z"
              className="Rectangle 148"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M11 7h1v1h-1z"
              className="Rectangle 149"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M12 7h1v1h-1z"
              className="Rectangle 156"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M8 7h1v1H8z"
              className="Rectangle 159"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 5">
            <motion.path
              {...getAnimation(0.2)}
              d="M7 6h1v1H7z"
              className="Rectangle 106"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M2 6h1v1H2z"
              className="Rectangle 107"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M5 6h1v1H5z"
              className="Rectangle 108"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M4 6h1v1H4z"
              className="Rectangle 109"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M6 6h1v1H6z"
              className="Rectangle 110"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M3 6h1v1H3z"
              className="Rectangle 111"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M10 6h1v1h-1z"
              className="Rectangle 160"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M9 6h1v1H9z"
              className="Rectangle 161"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M11 6h1v1h-1z"
              className="Rectangle 162"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M12 6h1v1h-1z"
              className="Rectangle 163"
            ></motion.path>
            <motion.path
              {...getAnimation(0.2)}
              d="M8 6h1v1H8z"
              className="Rectangle 164"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 4">
            <motion.path
              {...getAnimation(0.1)}
              d="M10 5h1v1h-1z"
              className="Rectangle 165"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M9 5h1v1H9z"
              className="Rectangle 166"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M11 5h1v1h-1z"
              className="Rectangle 167"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M12 5h1v1h-1z"
              className="Rectangle 168"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M8 5h1v1H8z"
              className="Rectangle 169"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M7 5h1v1H7z"
              className="Rectangle 100"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M2 5h1v1H2z"
              className="Rectangle 101"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M5 5h1v1H5z"
              className="Rectangle 102"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M4 5h1v1H4z"
              className="Rectangle 103"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M6 5h1v1H6z"
              className="Rectangle 104"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M3 5h1v1H3z"
              className="Rectangle 105"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 3">
            <motion.path
              {...getAnimation(0.1)}
              d="M7 4h1v1H7z"
              className="Rectangle 94"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M2 4h1v1H2z"
              className="Rectangle 95"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M5 4h1v1H5z"
              className="Rectangle 96"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M4 4h1v1H4z"
              className="Rectangle 97"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M6 4h1v1H6z"
              className="Rectangle 98"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M3 4h1v1H3z"
              className="Rectangle 99"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M10 4h1v1h-1z"
              className="Rectangle 170"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M9 4h1v1H9z"
              className="Rectangle 171"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M11 4h1v1h-1z"
              className="Rectangle 172"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M12 4h1v1h-1z"
              className="Rectangle 173"
            ></motion.path>
            <motion.path
              {...getAnimation(0.1)}
              d="M8 4h1v1H8z"
              className="Rectangle 174"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 2">
            <motion.path
              {...getAnimation(0)}
              d="M2 3h1v1H2z"
              className="Rectangle 86"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M5 3h1v1H5z"
              className="Rectangle 88"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M4 3h1v1H4z"
              className="Rectangle 89"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M6 3h1v1H6z"
              className="Rectangle 90"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M3 3h1v1H3z"
              className="Rectangle 91"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M10 3h1v1h-1z"
              className="Rectangle 175"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M9 3h1v1H9z"
              className="Rectangle 176"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M11 3h1v1h-1z"
              className="Rectangle 177"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M12 3h1v1h-1z"
              className="Rectangle 178"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M8 3h1v1H8z"
              className="Rectangle 179"
            ></motion.path>
          </g>
          <g fill="#0FF" className="Row 1">
            <motion.path
              {...getAnimation(0)}
              d="M5 2h1v1H5z"
              className="Rectangle 84"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M4 2h1v1H4z"
              className="Rectangle 85"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M9 2h1v1H9z"
              className="Rectangle 180"
            ></motion.path>
            <motion.path
              {...getAnimation(0)}
              d="M10 2h1v1h-1z"
              className="Rectangle 181"
            ></motion.path>
          </g>
          <motion.g fill={closeHeart ? "#FF2E2E" : "#0FF"} className="Outline">
            <motion.path d="M7 3h1v1H7z" className="Rectangle 92"></motion.path>
            <motion.path d="M8 2h1v1H8z" className="Rectangle 53"></motion.path>
            <motion.path d="M9 1h1v1H9z" className="Rectangle 54"></motion.path>
            <motion.path
              d="M10 1h1v1h-1z"
              className="Rectangle 55"
            ></motion.path>
            <motion.path
              d="M13 3h1v1h-1z"
              className="Rectangle 58"
            ></motion.path>
            <motion.path
              d="M13 7h1v1h-1z"
              className="Rectangle 62"
            ></motion.path>
            <motion.path
              d="M11 9h1v1h-1z"
              className="Rectangle 64"
            ></motion.path>
            <motion.path
              d="M7 13h1v1H7z"
              className="Rectangle 68"
            ></motion.path>
            <motion.path
              d="M6 12h1v1H6z"
              className="Rectangle 69"
            ></motion.path>
            <motion.path
              d="M5 11h1v1H5z"
              className="Rectangle 71"
            ></motion.path>
            <motion.path
              d="M4 10h1v1H4z"
              className="Rectangle 70"
            ></motion.path>
            <motion.path d="M3 9h1v1H3z" className="Rectangle 72"></motion.path>
            <motion.path d="M1 7h1v1H1z" className="Rectangle 74"></motion.path>
            <motion.path d="M1 4h1v1H1z" className="Rectangle 77"></motion.path>
            <motion.path d="M1 3h1v1H1z" className="Rectangle 78"></motion.path>
            <motion.path d="M5 1h1v1H5z" className="Rectangle 82"></motion.path>
            <motion.path d="M6 2h1v1H6z" className="Rectangle 83"></motion.path>
            <motion.path d="M4 1h1v1H4z" className="Rectangle 81"></motion.path>
            <motion.path d="M3 2h1v1H3z" className="Rectangle 80"></motion.path>
            <motion.path d="M2 2h1v1H2z" className="Rectangle 79"></motion.path>
            <motion.path d="M1 6h1v1H1z" className="Rectangle 76"></motion.path>
            <motion.path d="M1 5h1v1H1z" className="Rectangle 75"></motion.path>
            <motion.path d="M2 8h1v1H2z" className="Rectangle 73"></motion.path>
            <motion.path
              d="M8 12h1v1H8z"
              className="Rectangle 67"
            ></motion.path>
            <motion.path
              d="M9 11h1v1H9z"
              className="Rectangle 66"
            ></motion.path>
            <motion.path
              d="M10 10h1v1h-1z"
              className="Rectangle 65"
            ></motion.path>
            <motion.path
              d="M12 8h1v1h-1z"
              className="Rectangle 63"
            ></motion.path>
            <motion.path
              d="M13 6h1v1h-1z"
              className="Rectangle 61"
            ></motion.path>
            <motion.path
              d="M13 5h1v1h-1z"
              className="Rectangle 60"
            ></motion.path>
            <motion.path
              d="M13 4h1v1h-1z"
              className="Rectangle 59"
            ></motion.path>
            <motion.path
              d="M12 2h1v1h-1z"
              className="Rectangle 57"
            ></motion.path>
            <motion.path
              d="M11 2h1v1h-1z"
              className="Rectangle 56"
            ></motion.path>
            <motion.path d="M7 3h1v1H7z" className="Rectangle 52"></motion.path>
          </motion.g>
        </g>
      </motion.g>
    </svg>
  );
}
