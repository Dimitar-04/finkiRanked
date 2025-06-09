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
      />
      <span>{rankName}</span>
    </div>
  );
};

export default RankBadge;
