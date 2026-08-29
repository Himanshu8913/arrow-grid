/**
 * Animated ambient background for the main menu.
 */
export function MenuBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="menu-bg-gradient absolute inset-0" />
      <div className="menu-bg-grid absolute inset-0 opacity-40" />
      <span className="menu-bg-orb menu-bg-orb-a" />
      <span className="menu-bg-orb menu-bg-orb-b" />
      <span className="menu-bg-orb menu-bg-orb-c" />
    </div>
  );
}
