import React from "react";
import { getRankBadgeProps } from "./rankUtils";

const RankBadge = ({ rankName, size = "md", className = "" }) => {
  const {
    rankInfo,
    className: badgeClassName,
    style,
    iconClassName,
  } = getRankBadgeProps(rankName, size);

  return (
    <div className={`${badgeClassName} ${className}`} style={style}>
      <img
        src={rankInfo.icon}
        alt={rankInfo.title}
        className={iconClassName}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "inline";
        }}
      />
      <span style={{ display: "none" }}>{rankInfo.emoji}</span>
      <span>{rankName}</span>
    </div>
  );
};

export default RankBadge;
