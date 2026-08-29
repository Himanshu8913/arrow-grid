export interface PlayerProfile {
  displayName: string;
  totalXp: number;
  totalCoins: number;
}

export function createDefaultProfile(): PlayerProfile {
  return {
    displayName: "Guest Player",
    totalXp: 0,
    totalCoins: 0,
  };
}
