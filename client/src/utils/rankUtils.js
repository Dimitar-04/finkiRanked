import noviceIcon from "../assets/rankIcons/novice.png";
import learnerIcon from "../assets/rankIcons/learner.png";
import coderIcon from "../assets/rankIcons/coder.png";
import problemSolverIcon from "../assets/rankIcons/problemsolver.png";
import algorithmistIcon from "../assets/rankIcons/algorithmist.png";
import hackerMageIcon from "../assets/rankIcons/hackermage.png";
import challengerIcon from "../assets/rankIcons/challenger.png";
import codeMasterIcon from "../assets/rankIcons/codemaster.png";
import finkiRoyaltyIcon from "../assets/rankIcons/royalty.png";
import finkiLegendIcon from "../assets/rankIcons/finkilegend.png";

export const RANK_DATA = {
  Novice: {
    id: 1,
    title: "Novice",
    requiredPoints: 0,
    icon: noviceIcon,
    color: "	#e4b685", // Bronze
  },
  Learner: {
    id: 2,
    title: "Learner",
    requiredPoints: 300,
    icon: learnerIcon,
    color: "#ac4f00", // Slightly darker Bronze
  },
  "Junior Developer": {
    id: 3,
    title: "Junior Developer",
    requiredPoints: 800,
    icon: coderIcon,
    color: "#7e3a06", // Darker Bronze / Sienna
  },
  Developer: {
    id: 4,
    title: "Developer",
    requiredPoints: 1500,
    icon: problemSolverIcon,
    color: "#cccccc", // Silver
  },
  "Senior Developer": {
    id: 5,
    title: "Senior Developer",
    requiredPoints: 2500,
    icon: algorithmistIcon,
    color: "#a4a4a4", // Slightly darker Silver
  },
  Expert: {
    id: 6,
    title: "Expert",
    requiredPoints: 4000,
    icon: hackerMageIcon,
    color: "#6a6a6a", // Darker Silver
  },
  Master: {
    id: 7,
    title: "Master",
    requiredPoints: 6000,
    icon: challengerIcon,
    color: "#eddd82", // Gold
  },
  "Grand Master": {
    id: 8,
    title: "Grand Master",
    requiredPoints: 8500,
    icon: codeMasterIcon,
    color: "#F4C430", // Saffron / Richer Gold
  },
  "FINKI Royalty": {
    id: 9,
    title: "FINKI Royalty",
    requiredPoints: 11000,
    icon: finkiRoyaltyIcon,
    color: "#E5B80B", // Darker Gold
  },
  "FINKI Legend": {
    id: 10,
    title: "FINKI Legend",
    requiredPoints: 16000,
    icon: finkiLegendIcon,
    color: "#00BFFF", // Bright Blue (DeepSkyBlue)
  },
};

/**
 * Get rank information by rank name
 * @param {string} rankName - The name of the rank
 * @returns {object} Rank data object
 */
export const getRankInfo = (rankName) => {
  return RANK_DATA[rankName] || RANK_DATA["Novice"];
};

/**
 * Get rank information by points
 * @param {number} points - User's current points
 * @returns {object} Rank data object
 */

/**
 * Create a rank badge component props
 * @param {string} rankName - The name of the rank
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @returns {object} Props for styling the rank badge
 */
export const getRankBadgeProps = (rankName, size = "md") => {
  const rankInfo = getRankInfo(rankName);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return {
    rankInfo,
    className: `inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]}`,
    style: {
      backgroundColor: rankInfo.color,
      color: "#FFFFFF",
    },
    iconClassName: iconSizes[size],
  };
};
