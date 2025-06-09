import noviceIcon from '../assets/rankIcons/novice.png';
import learnerIcon from '../assets/rankIcons/learner.png';
import coderIcon from '../assets/rankIcons/coder.png';
import problemSolverIcon from '../assets/rankIcons/problemsolver.png';
import algorithmistIcon from '../assets/rankIcons/algorithmist.png';
import hackerMageIcon from '../assets/rankIcons/hackermage.png';
import challengerIcon from '../assets/rankIcons/challenger.png';
import codeMasterIcon from '../assets/rankIcons/codemaster.png';
import finkiRoyaltyIcon from '../assets/rankIcons/royalty.png';
import finkiLegendIcon from '../assets/rankIcons/finkilegend.png';

export const RANK_DATA = {
  "Novice": {
    id: 1,
    title: "Novice",
    requiredPoints: 0,
    icon: noviceIcon,
    color: "#A0AEC0"
  },
  "Learner": {
    id: 2,
    title: "Learner",
    requiredPoints: 300,
    icon: learnerIcon,
    color: "#4299E1"
  },
  "Coder": {
    id: 3,
    title: "Coder",
    requiredPoints: 800,
    icon: coderIcon,
    color: "#48BB78"
  },
  "Problem Solver": {
    id: 4,
    title: "Problem Solver",
    requiredPoints: 1500,
    icon: problemSolverIcon,
    color: "#38B2AC"
  },
  "Algorithmist": {
    id: 5,
    title: "Algorithmist",
    requiredPoints: 2500,
    icon: algorithmistIcon,
    color: "#805AD5"
  },
  "Hacker Mage": {
    id: 6,
    title: "Hacker Mage",
    requiredPoints: 4000,
    icon: hackerMageIcon,
    color: "#D69E2E"
  },
  "Challenger": {
    id: 7,
    title: "Challenger",
    requiredPoints: 6000,
    icon: challengerIcon,
    color: "#F56565"
  },
  "Code Master": {
    id: 8,
    title: "Code Master",
    requiredPoints: 8500,
    icon: codeMasterIcon,
    color: "#ED8936"
  },
  "FINKI Royalty": {
    id: 9,
    title: "FINKI Royalty",
    requiredPoints: 12000,
    icon: finkiRoyaltyIcon,
    color: "#ECC94B"
  },
  "FINKI Legend": {
    id: 10,
    title: "FINKI Legend",
    requiredPoints: 16000,
    icon: finkiLegendIcon,
    color: "#9F7AEA"
  }
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
export const getRankByPoints = (points) => {
  const ranks = Object.values(RANK_DATA).sort((a, b) => b.requiredPoints - a.requiredPoints);
  
  for (const rank of ranks) {
    if (points >= rank.requiredPoints) {
      return rank;
    }
  }
  
  return RANK_DATA["Novice"];
};

/**
 * Create a rank badge component props
 * @param {string} rankName - The name of the rank
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @returns {object} Props for styling the rank badge
 */
export const getRankBadgeProps = (rankName, size = 'md') => {
  const rankInfo = getRankInfo(rankName);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return {
    rankInfo,
    className: `inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]}`,
    style: {
      backgroundColor: rankInfo.color,
      color: '#FFFFFF'
    },
    iconClassName: iconSizes[size]
  };
};