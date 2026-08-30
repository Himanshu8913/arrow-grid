import { beforeEach, describe, expect, it } from "vitest";

import { useProfileStore } from "@/state/profile-store";
import { installTestStorage } from "@/test/test-storage";

describe("profile store", () => {
  beforeEach(() => {
    installTestStorage();
    useProfileStore.getState().resetProfile();
  });

  it("spends coins when the balance is sufficient", () => {
    useProfileStore.setState({ totalCoins: 120 });

    const spent = useProfileStore.getState().trySpendCoins(100);

    expect(spent).toBe(true);
    expect(useProfileStore.getState().totalCoins).toBe(20);
  });

  it("rejects spending more coins than available", () => {
    useProfileStore.setState({ totalCoins: 40 });

    const spent = useProfileStore.getState().trySpendCoins(100);

    expect(spent).toBe(false);
    expect(useProfileStore.getState().totalCoins).toBe(40);
  });
});
