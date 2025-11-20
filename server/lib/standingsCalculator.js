const DEFAULT_OPTIONS = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  tiebreakers: ["POINTS", "GD", "GF", "H2H"],
};

/**
 * Calculate standings from completed matches
 */
export function calculateStandings(teams, matches, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Filter only completed matches
  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED" && m.homeScore !== null && m.awayScore !== null
  );

  // Initialize standings
  const standings = new Map();
  teams.forEach((team) => {
    standings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      position: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    });
  });

  // Calculate stats from matches
  completedMatches.forEach((match) => {
    const homeTeam = standings.get(match.homeTeamId);
    const awayTeam = standings.get(match.awayTeamId);

    if (!homeTeam || !awayTeam) return;

    const homeScore = match.homeScore;
    const awayScore = match.awayScore;

    // Update matches played
    homeTeam.played++;
    awayTeam.played++;

    // Update goals
    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;
    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;

    // Update results
    if (homeScore > awayScore) {
      homeTeam.won++;
      homeTeam.points += opts.pointsWin;
      homeTeam.form?.unshift("W");
      awayTeam.lost++;
      awayTeam.points += opts.pointsLoss;
      awayTeam.form?.unshift("L");
    } else if (homeScore < awayScore) {
      awayTeam.won++;
      awayTeam.points += opts.pointsWin;
      awayTeam.form?.unshift("W");
      homeTeam.lost++;
      homeTeam.points += opts.pointsLoss;
      homeTeam.form?.unshift("L");
    } else {
      homeTeam.drawn++;
      homeTeam.points += opts.pointsDraw;
      homeTeam.form?.unshift("D");
      awayTeam.drawn++;
      awayTeam.points += opts.pointsDraw;
      awayTeam.form?.unshift("D");
    }

    // Limit form to last 5 matches
    if (homeTeam.form && homeTeam.form.length > 5) homeTeam.form = homeTeam.form.slice(0, 5);
    if (awayTeam.form && awayTeam.form.length > 5) awayTeam.form = awayTeam.form.slice(0, 5);
  });

  // Calculate goal difference
  standings.forEach((team) => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  });

  // Sort standings
  const sorted = Array.from(standings.values()).sort((a, b) => {
    return applyTiebreakers(a, b, opts.tiebreakers, completedMatches);
  });

  // Assign positions
  sorted.forEach((team, index) => {
    team.position = index + 1;
  });

  return sorted;
}

/**
 * Apply tiebreaker rules
 */
function applyTiebreakers(a, b, tiebreakers, matches) {
  for (const rule of tiebreakers) {
    let comparison = 0;

    switch (rule) {
      case "POINTS":
        comparison = b.points - a.points;
        break;
      case "GD":
        comparison = b.goalDifference - a.goalDifference;
        break;
      case "GF":
        comparison = b.goalsFor - a.goalsFor;
        break;
      case "H2H":
        comparison = compareHeadToHead(a, b, matches);
        break;
    }

    if (comparison !== 0) return comparison;
  }

  return 0;
}

/**
 * Compare head-to-head record between two teams
 */
function compareHeadToHead(a, b, matches) {
  const h2hMatches = matches.filter(
    (m) =>
      m.status === "COMPLETED" &&
      ((m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
        (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId))
  );

  if (h2hMatches.length === 0) return 0;

  let aPoints = 0;
  let bPoints = 0;

  h2hMatches.forEach((match) => {
    const homeScore = match.homeScore;
    const awayScore = match.awayScore;

    if (match.homeTeamId === a.teamId) {
      if (homeScore > awayScore) aPoints += 3;
      else if (homeScore === awayScore) aPoints += 1;
      if (awayScore > homeScore) bPoints += 3;
      else if (homeScore === awayScore) bPoints += 1;
    } else {
      if (awayScore > homeScore) aPoints += 3;
      else if (homeScore === awayScore) aPoints += 1;
      if (homeScore > awayScore) bPoints += 3;
      else if (homeScore === awayScore) bPoints += 1;
    }
  });

  return bPoints - aPoints;
}
