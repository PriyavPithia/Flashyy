export interface Card {
  id: string;
  question: string;
  answer: string;
  group_id: string;
  user_id: string;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  color: GroupColor;
}

export const GROUP_COLORS = {
  // Original soft colors
  softGreen: "#F2FCE2",
  softYellow: "#FEF7CD",
  softOrange: "#FEC6A1",
  softPeach: "#FDE1D3",
  softGray: "#F1F0FB",
  softPurple: "#E5DEFF",
  softPink: "#FFDEE2",
  softBlue: "#D3E4FD",
  neutralGray: "#F3F4F6",

  // Light earthy & muted tones
  sage: "#E9EFE6",      // Lighter sage
  clay: "#F5F0E6",      // Light clay
  terracotta: "#FAE6D9", // Light terracotta
  moss: "#EDF2E9",      // Light moss
  wheat: "#F7EDE2",     // Light wheat
  coffee: "#F2ECE4",    // Light coffee
  forest: "#E8EDDE",    // Light forest
  olive: "#F4F1E8",     // Light olive
  sand: "#F6F0E8",      // Light sand
  stone: "#EDECEA",     // Light stone
  autumn: "#F9EDE4"     // Light autumn
} as const;

export type GroupColor = typeof GROUP_COLORS[keyof typeof GROUP_COLORS];
