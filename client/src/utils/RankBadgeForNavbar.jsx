import React, { useMemo } from 'react';
import { getRankBadgeProps } from './rankUtils';

const RankBadgeNav = ({ rankName, size = 'md', className = '' }) => {
  const {
    rankInfo,
    className: badgeClassName,
    style,
  } = useMemo(() => getRankBadgeProps(rankName, size), [rankName, size]);

  const isGlowing = rankInfo?.id >= 4;

  const finalStyle = isGlowing
    ? { ...style, boxShadow: `0 0 8px  ${rankInfo.color}` }
    : style;

  return (
    <div className={`${badgeClassName} ${className}`} style={finalStyle}>
      <span>{rankName}</span>
    </div>
  );
};

export default RankBadgeNav;
