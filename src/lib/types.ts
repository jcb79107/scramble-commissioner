export type SideGameKind = "closest_to_pin" | "long_drive";

export type MoneyStatus = "owed" | "paid" | "refunded";

export type AccessRole =
  | "admin"
  | "commissioner"
  | "contest_marker"
  | "team_scorer"
  | "proxy_marker"
  | "public_viewer";

export type Player = {
  id: string;
  name: string;
  sideGames: SideGameKind[];
  moneyStatus: MoneyStatus;
};

export type Team = {
  id: string;
  name: string;
  teeTime: string;
  accessToken: string;
  captainPlayerId?: string;
  players: Player[];
};

export type HoleConfig = {
  number: number;
  par?: number;
  teeYardage?: number;
  sideGame?: SideGameKind;
  label?: string;
  contestAccessToken?: string;
};

export type TeamScore = {
  teamId: string;
  hole: number;
  strokes: number | null;
};

export type ProxyEntry = {
  id: string;
  kind: SideGameKind;
  hole: number;
  playerId: string;
  measuredDistance: number | null;
  unit: "feet" | "yards";
  isValid: boolean;
  note?: string;
};

export type EventMoney = {
  roundCostEstimate: number;
  scrambleBuyIn: number;
  closestToPinBuyInPerHole: number;
  longDriveBuyInPerHole: number;
};

export type ScrambleEvent = {
  id: string;
  name: string;
  date: string;
  venue: string;
  address: string;
  commissionerToken: string;
  publicToken: string;
  proxyToken: string;
  teams: Team[];
  holes: HoleConfig[];
  scores: TeamScore[];
  proxyEntries: ProxyEntry[];
  money: EventMoney;
  rules: string[];
};

export type LeaderboardRow = {
  teamId: string;
  teamName: string;
  teeTime: string;
  total: number;
  holesComplete: number;
  thru: string;
};

export type ProxyWinner = {
  kind: SideGameKind;
  hole: number;
  playerId: string;
  playerName: string;
  measuredDistance: number;
  unit: "feet" | "yards";
};

export type PlayerBalance = {
  playerId: string;
  playerName: string;
  teamName: string;
  buyInTotal: number;
  payoutTotal: number;
  net: number;
  status: MoneyStatus;
};
