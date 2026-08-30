export interface HomeGreeting {
  title: string;
  subtitle: string;
}

/**
 * Time-of-day greeting for the home screen.
 */
export function getHomeGreeting(date = new Date()): HomeGreeting {
  const hour = date.getHours();

  if (hour < 12) {
    return {
      title: "Good morning",
      subtitle: "Ready to solve something?",
    };
  }

  if (hour < 18) {
    return {
      title: "Welcome back",
      subtitle: "Let's continue.",
    };
  }

  return {
    title: "One more puzzle?",
    subtitle: "The grid is waiting.",
  };
}
