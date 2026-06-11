create extension if not exists pgcrypto;

create type access_role as enum (
  'admin',
  'commissioner',
  'contest_marker',
  'team_scorer',
  'proxy_marker',
  'public_viewer'
);

create type side_game_kind as enum (
  'closest_to_pin',
  'long_drive'
);

create type money_status as enum (
  'owed',
  'paid',
  'refunded'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  venue text not null,
  address text,
  round_cost_estimate numeric(8, 2) default 0 not null,
  scramble_buy_in numeric(8, 2) default 0 not null,
  closest_to_pin_buy_in_per_hole numeric(8, 2) default 0 not null,
  long_drive_buy_in_per_hole numeric(8, 2) default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table access_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  team_id uuid,
  role access_role not null,
  token text unique not null,
  hole_number integer check (hole_number between 1 and 18),
  side_game side_game_kind,
  created_at timestamptz default now() not null,
  expires_at timestamptz
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  tee_time time,
  captain_player_id uuid,
  display_order integer default 0 not null
);

alter table access_links
  add constraint access_links_team_id_fkey
  foreign key (team_id) references teams(id) on delete cascade;

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  money_status money_status default 'owed' not null,
  display_order integer default 0 not null
);

alter table teams
  add constraint teams_captain_player_id_fkey
  foreign key (captain_player_id) references players(id) on delete set null;

create table player_side_games (
  player_id uuid references players(id) on delete cascade not null,
  kind side_game_kind not null,
  primary key (player_id, kind)
);

create table holes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  number integer not null check (number between 1 and 18),
  par integer check (par between 3 and 6),
  tee_yardage integer,
  side_game side_game_kind,
  label text,
  unique (event_id, number)
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
  hole_number integer not null check (hole_number between 1 and 18),
  strokes integer check (strokes > 0),
  updated_at timestamptz default now() not null,
  unique (team_id, hole_number)
);

create table proxy_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  hole_number integer not null check (hole_number between 1 and 18),
  kind side_game_kind not null,
  measured_distance numeric(8, 2),
  unit text not null check (unit in ('feet', 'yards')),
  is_valid boolean default true not null,
  note text,
  created_at timestamptz default now() not null
);

create index scores_event_id_idx on scores(event_id);
create index proxy_entries_event_hole_kind_idx on proxy_entries(event_id, hole_number, kind);
create index teams_event_id_idx on teams(event_id);
create index players_team_id_idx on players(team_id);
create index access_links_event_role_idx on access_links(event_id, role);

alter publication supabase_realtime add table scores;
alter publication supabase_realtime add table proxy_entries;

alter table events enable row level security;
alter table access_links enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table player_side_games enable row level security;
alter table holes enable row level security;
alter table scores enable row level security;
alter table proxy_entries enable row level security;

-- V1 uses opaque access tokens checked by server actions/API routes.
-- Public event data can be read by anonymous users for the live event board.
-- Access tokens remain server-only.
create policy "Public read events" on events for select using (true);
create policy "Public read teams" on teams for select using (true);
create policy "Public read players" on players for select using (true);
create policy "Public read player side games" on player_side_games for select using (true);
create policy "Public read holes" on holes for select using (true);
create policy "Public read scores" on scores for select using (true);
create policy "Public read proxy entries" on proxy_entries for select using (true);
