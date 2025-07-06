import React, { useMemo } from "react";
import { getRankBadgeProps } from "./rankUtils";

const RankBadge = ({ rankName, size = "md", className = "" }) => {
  const { rankInfo, style: textStyle } = useMemo(
    () => getRankBadgeProps(rankName, size),
    [rankName, size]
  );

  const isGlowing = rankInfo?.id >= 4;

  return (
    <>
      <style>
        {`
          @keyframes breathe {
            0%, 100% {
              filter: drop-shadow(0 0 3px var(--glow-color));
            }
            50% {
              filter: drop-shadow(0 0 8px var(--glow-color));
            }
          }
          .breathing-glow {
            animation: breathe 2.5s ease-in-out infinite;
          }
        `}
      </style>
      <div className="flex gap-3">
        <span className="w-25 font-bold">{rankName}</span>
        <svg
          className={`w-6 h-6 ${isGlowing ? "breathing-glow" : ""}`}
          viewBox="0 0 24 24"
          fill={rankInfo?.color || "#FFFFFF"}
          xmlns="http://www.w3.org/2000/svg"
          style={
            isGlowing
              ? {
                  "--glow-color": rankInfo.color,
                }
              : {}
          }
        >
          <path d="M12 22L2 15.5V2H22V15.5L12 22Z" />
        </svg>
      </div>
    </>
  );
};

export default RankBadge;
