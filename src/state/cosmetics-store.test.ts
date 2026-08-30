import { beforeEach, describe, expect, it } from "vitest";

import { useAchievementStore } from "@/state/achievement-store";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import { installTestStorage } from "@/test/test-storage";

describe("cosmetics store", () => {
  beforeEach(() => {
    installTestStorage();
    useProfileStore.getState().resetProfile();
    useAchievementStore.getState().resetAchievements();
    useCosmeticsStore.getState().resetCosmetics();
  });

  it("starts with default cosmetics owned and equipped", () => {
    const state = useCosmeticsStore.getState();

    expect(state.ownedIds).toContain("board-default");
    expect(state.equipped.board).toBe("board-default");
    expect(state.equipped.orb).toBe("orb-default");
  });

  it("purchases a cosmetic when the player has enough coins", () => {
    useProfileStore.setState({ totalCoins: 200 });

    const purchased = useCosmeticsStore.getState().purchase("orb-ember");

    expect(purchased).toBe(true);
    expect(useCosmeticsStore.getState().ownedIds).toContain("orb-ember");
    expect(useCosmeticsStore.getState().equipped.orb).toBe("orb-ember");
    expect(useProfileStore.getState().totalCoins).toBe(0);
  });

  it("rejects purchases when coins are insufficient", () => {
    useProfileStore.setState({ totalCoins: 50 });

    const purchased = useCosmeticsStore.getState().purchase("orb-ember");

    expect(purchased).toBe(false);
    expect(useCosmeticsStore.getState().ownedIds).not.toContain("orb-ember");
    expect(useProfileStore.getState().totalCoins).toBe(50);
  });

  it("unlocks achievement-gated cosmetics when syncing", () => {
    useAchievementStore.getState().unlockAchievements(["daily-challenge-winner"]);

    useCosmeticsStore.getState().syncAchievementUnlocks();

    expect(useCosmeticsStore.getState().ownedIds).toContain("board-aurora");
  });

  it("equips owned cosmetics without spending coins again", () => {
    useProfileStore.setState({ totalCoins: 500 });
    useCosmeticsStore.getState().purchase("orb-ember");
    useCosmeticsStore.getState().equip("orb-default");

    const equippedAgain = useCosmeticsStore.getState().purchase("orb-ember");

    expect(equippedAgain).toBe(true);
    expect(useCosmeticsStore.getState().equipped.orb).toBe("orb-ember");
    expect(useProfileStore.getState().totalCoins).toBe(300);
  });
});
