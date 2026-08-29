export interface PlayerProfile {
  displayName: string;
}

export function createDefaultProfile(): PlayerProfile {
  return {
    displayName: "Guest Player",
  };
}
