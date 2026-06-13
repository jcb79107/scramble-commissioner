import type { ScrambleEvent, SideGameKind, Team } from "./types";

const longDrivePlayers = new Set([
  "Joey Saslow",
  "Harrison Eisberg",
  "Isaac Jolcover",
  "Sam Isaacson",
  "Jason Baer",
  "Josh Wasserman",
  "Sam Sherman",
  "Noah Reimer",
  "Jason Taitz",
  "Jon Stone",
  "Ross Agins",
  "Ryan Rabin",
]);

const closestToPinPlayers = new Set([
  "Blake Schwartz",
  "Michael Levin",
  "Jacob Daitch",
  "Jonah Abrahams",
  "Peter Barsi",
  "Brandon Grant",
  "Joey Saslow",
  "Harrison Eisberg",
  "Isaac Jolcover",
  "Sam Isaacson",
  "Jason Baer",
  "Josh Wasserman",
  "Sam Sherman",
  "Noah Reimer",
  "Jason Taitz",
  "Jon Stone",
  "Ross Agins",
  "Ryan Rabin",
]);

function player(id: string, name: string) {
  const sideGames: SideGameKind[] = [];

  if (closestToPinPlayers.has(name)) {
    sideGames.push("closest_to_pin");
  }

  if (longDrivePlayers.has(name)) {
    sideGames.push("long_drive");
  }

  return {
    id,
    name,
    sideGames,
    moneyStatus: "owed" as const,
  };
}

const teams: Team[] = [
  {
    id: "team-930",
    name: "Team Grant",
    teeTime: "9:30 AM",
    accessToken: "team-930-preview-token",
    captainPlayerId: "brandon-grant",
    players: [
      player("peter-barsi", "Peter Barsi"),
      player("joey-saslow", "Joey Saslow"),
      player("blake-schwartz", "Blake Schwartz"),
      player("brandon-grant", "Brandon Grant"),
    ],
  },
  {
    id: "team-940",
    name: "Team Weinberger",
    teeTime: "9:40 AM",
    accessToken: "team-940-preview-token",
    captainPlayerId: "jason-weinberger",
    players: [
      player("josh-kravitz", "Josh Kravitz"),
      player("sam-isaacson", "Sam Isaacson"),
      player("jon-stone", "Jon Stone"),
      player("jason-weinberger", "Jason Weinberger"),
    ],
  },
  {
    id: "team-950",
    name: "Team Agins",
    teeTime: "9:50 AM",
    accessToken: "team-950-preview-token",
    captainPlayerId: "ross-agins",
    players: [
      player("ap", "AP"),
      player("jason-baer", "Jason Baer"),
      player("michael-levin", "Michael Levin"),
      player("ross-agins", "Ross Agins"),
    ],
  },
  {
    id: "team-1000",
    name: "Team Abrahams",
    teeTime: "10:00 AM",
    accessToken: "team-1000-preview-token",
    captainPlayerId: "jonah-abrahams",
    players: [
      player("adam-erickson", "Adam Erickson"),
      player("sam-sherman", "Sam Sherman"),
      player("josh-wasserman", "Josh Wasserman"),
      player("jonah-abrahams", "Jonah Abrahams"),
    ],
  },
  {
    id: "team-1010",
    name: "Team Daitch",
    teeTime: "10:10 AM",
    accessToken: "team-1010-preview-token",
    captainPlayerId: "jacob-daitch",
    players: [
      player("jackson-kramer", "Jackson Kramer"),
      player("noah-reimer", "Noah Reimer"),
      player("harrison-eisberg", "Harrison Eisberg"),
      player("jacob-daitch", "Jacob Daitch"),
    ],
  },
  {
    id: "team-1020",
    name: "Team Rabin",
    teeTime: "10:20 AM",
    accessToken: "team-1020-preview-token",
    captainPlayerId: "ryan-rabin",
    players: [
      player("dylan-brown", "Dylan Brown"),
      player("isaac-jolcover", "Isaac Jolcover"),
      player("jason-taitz", "Jason Taitz"),
      player("ryan-rabin", "Ryan Rabin"),
    ],
  },
];

const burntRedParByHole: Record<number, number> = {
  1: 4,
  2: 5,
  3: 4,
  4: 5,
  5: 4,
  6: 3,
  7: 4,
  8: 4,
  9: 3,
  10: 4,
  11: 4,
  12: 4,
  13: 3,
  14: 4,
  15: 5,
  16: 3,
  17: 4,
  18: 5,
};

// Traditions at Chevy Chase publishes Burnt Red hole-by-hole scorecard yardages.
// USGA NCRDB lists the Burnt Red men's course at Par 72, 69.4/126, length 6046;
// the app uses the course scorecard yardages below for long-drive measurements.
const burntRedYardageByHole: Record<number, number> = {
  1: 359,
  2: 453,
  3: 379,
  4: 485,
  5: 406,
  6: 117,
  7: 336,
  8: 375,
  9: 157,
  10: 369,
  11: 322,
  12: 405,
  13: 156,
  14: 319,
  15: 484,
  16: 132,
  17: 307,
  18: 517,
};

export const chevyChaseSeed: ScrambleEvent = {
  id: "chevy-chase-2026",
  name: "Chevy Chase Country Club Scramble",
  date: "2026-06-13",
  venue: "Traditions at Chevy Chase",
  address: "1000 N Milwaukee Ave, Wheeling, IL 60090",
  commissionerToken: "commissioner-preview-token",
  publicToken: "public-preview-token",
  proxyToken: "proxy-preview-token",
  teams,
  holes: Array.from({ length: 18 }, (_, index) => {
    const number = index + 1;
    const par = burntRedParByHole[number];
    const teeYardage = burntRedYardageByHole[number];

    if ([6, 9, 13, 16].includes(number)) {
      return {
        number,
        par,
        teeYardage,
        sideGame: "closest_to_pin" as const,
        label: `Closest to the Pin (${teeYardage} yards)`,
        contestAccessToken: `contest-hole-${number}-preview-token`,
      };
    }

    if ([2, 4, 15, 18].includes(number)) {
      return {
        number,
        par,
        teeYardage,
        sideGame: "long_drive" as const,
        label: "Long Drive",
        contestAccessToken: `contest-hole-${number}-preview-token`,
      };
    }

    return { number, par, teeYardage };
  }),
  scores: teams.flatMap((team) =>
    Array.from({ length: 18 }, (_, index) => ({
      teamId: team.id,
      hole: index + 1,
      strokes: null,
    })),
  ),
  proxyEntries: [],
  money: {
    roundCostEstimate: 90,
    scrambleBuyIn: 25,
    closestToPinBuyInPerHole: 5,
    longDriveBuyInPerHole: 5,
  },
  rules: [
    "Normal scramble rules; no restrictions.",
    "Tee markers: Burnt Red.",
    "Closest to the Pin entries require distance to the hole or flag.",
    "Long Drive entries require distance from ball to flag, subtracted from scorecard tee yardage.",
    "Proxy entries without measured distance do not count.",
    "Closest to the Pin must be on green; Long Drive must be in fairway.",
    "Money back if no one reaches the designated area.",
    "One winner per proxy hole.",
  ],
};
