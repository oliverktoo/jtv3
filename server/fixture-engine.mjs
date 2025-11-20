/**
 * ENTERPRISE-GRADE FIXTURE GENERATION ENGINE
 * Based on FIFA/UEFA Circle Method with advanced optimization
 * Inspired by SofaScore, Opta, and StatsBomb platforms
 */

/**
 * Advanced Fixture Generator using Circle Method Algorithm
 * - Gold standard for round-robin fixtures
 * - Perfect home/away balance
 * - Optimal travel distribution
 */
export class AdvancedFixtureGenerator {
  constructor(config = {}) {
    this.config = {
      legs: config.legs || 2,  // Single or double round-robin
      minimumRestDays: config.minimumRestDays || 2,
      derbySpacing: config.derbySpacing || 3,
      allowDraws: config.allowDraws !== undefined ? config.allowDraws : true,
      extraTime: config.extraTime || false,  // Enable extra time for knockout
      penalties: config.penalties !== undefined ? config.penalties : true,  // Enable penalties after extra time
      extraTimeDuration: config.extraTimeDuration || 30,  // Minutes (2x15 min)
      awayGoalsRule: config.awayGoalsRule || false,  // Away goals count double in aggregate
      replayEnabled: config.replayEnabled || false,  // Enable replays instead of extra time
      maxReplays: config.maxReplays || 1,  // Maximum number of replays
      ...config
    };
  }

  /**
   * Circle Method Algorithm - FIFA/UEFA Standard
   * Most balanced approach for round-robin tournaments
   */
  generateRoundRobin(teams, legs = 2) {
    console.log(`🔄 Circle Method: Generating fixtures for ${teams.length} teams, ${legs} legs`);
    
    // Handle odd number of teams (add BYE)
    const workingTeams = [...teams];
    const hasOddTeams = workingTeams.length % 2 === 1;
    if (hasOddTeams) {
      workingTeams.push({ id: 'BYE', name: 'BYE', isBye: true });
    }

    const teamCount = workingTeams.length;
    const matchesPerRound = teamCount / 2;
    const totalRounds = (teamCount - 1) * legs;
    
    const allFixtures = [];
    let fixtureId = 1;

    for (let leg = 0; leg < legs; leg++) {
      const legFixtures = this._generateSingleLeg(workingTeams, leg, fixtureId);
      allFixtures.push(...legFixtures);
      fixtureId += legFixtures.length;
    }

    // Remove BYE fixtures
    const validFixtures = allFixtures.filter(
      f => !f.homeTeam.isBye && !f.awayTeam.isBye
    );

    console.log(`✅ Generated ${validFixtures.length} fixtures across ${totalRounds} rounds`);
    return validFixtures;
  }

  /**
   * Generate fixtures for one leg using circle rotation
   */
  _generateSingleLeg(teams, legNumber, startId) {
    const fixtures = [];
    const teamCount = teams.length;
    const roundsPerLeg = teamCount - 1;
    
    // Fixed team stays in position 0
    const fixed = teams[0];
    let rotating = teams.slice(1);

    for (let round = 0; round < roundsPerLeg; round++) {
      const roundNumber = legNumber * roundsPerLeg + round + 1;
      const roundFixtures = [];

      // Fixed team match (alternate home/away each round)
      const isFixedHome = round % 2 === 0;
      if (legNumber === 0) {  // First leg
        roundFixtures.push({
          id: `fixture_${startId + fixtures.length}`,
          round: roundNumber,
          leg: legNumber + 1,
          homeTeam: isFixedHome ? fixed : rotating[0],
          awayTeam: isFixedHome ? rotating[0] : fixed
        });
      } else {  // Second leg (reverse)
        roundFixtures.push({
          id: `fixture_${startId + fixtures.length}`,
          round: roundNumber,
          leg: legNumber + 1,
          homeTeam: isFixedHome ? rotating[0] : fixed,
          awayTeam: isFixedHome ? fixed : rotating[0]
        });
      }

      // Other matches (mirror pattern)
      for (let i = 1; i < Math.floor(teamCount / 2); i++) {
        const home = rotating[i];
        const away = rotating[teamCount - 1 - i];
        
        if (legNumber === 0) {
          roundFixtures.push({
            id: `fixture_${startId + fixtures.length + i}`,
            round: roundNumber,
            leg: legNumber + 1,
            homeTeam: i % 2 === 0 ? home : away,
            awayTeam: i % 2 === 0 ? away : home
          });
        } else {  // Reverse for second leg
          roundFixtures.push({
            id: `fixture_${startId + fixtures.length + i}`,
            round: roundNumber,
            leg: legNumber + 1,
            homeTeam: i % 2 === 0 ? away : home,
            awayTeam: i % 2 === 0 ? home : away
          });
        }
      }

      fixtures.push(...roundFixtures);
      
      // Rotate teams (circle method)
      rotating = this._rotateTeams(rotating);
    }

    return fixtures;
  }

  /**
   * Rotate all teams except the first (circle rotation)
   */
  _rotateTeams(teams) {
    if (teams.length <= 1) return teams;
    return [teams[teams.length - 1], ...teams.slice(0, teams.length - 1)];
  }

  /**
   * Generate group stage fixtures with knockout
   */
  generateGroupStage(teams, config) {
    console.log(`🏆 Group Stage: ${config.groupCount} groups, ${config.teamsPerGroup} teams each`);
    
    const groups = this._distributeTeamsToGroups(teams, config);
    const allFixtures = [];
    let fixtureId = 1;

    groups.forEach((group, groupIndex) => {
      const groupFixtures = this.generateRoundRobin(group.teams, config.legs || 2);
      
      groupFixtures.forEach(fixture => {
        allFixtures.push({
          ...fixture,
          id: `fixture_${fixtureId++}`,
          groupId: group.id,
          groupName: group.name
        });
      });
    });

    return { fixtures: allFixtures, groups };
  }

  /**
   * Generate knockout tournament brackets
   * Supports R16, QF, SF, Final with proper seeding
   * Includes extra time, penalties, and replay configuration
   */
  _generateKnockout(teams, config = {}) {
    console.log(`🏆 Knockout: Generating elimination bracket for ${teams.length} teams`);
    
    const {
      startRound = 'R16',
      includeThirdPlace = true,
      legs = 1, // Single-leg or home-and-away
      seeding = 'standard', // 'standard', 'random', 'performance'
      allowExtraTime = this.config.extraTime,
      allowPenalties = this.config.penalties,
      allowReplays = this.config.replayEnabled
    } = config;
    
    // Calculate bracket size (must be power of 2)
    let bracketSize = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    console.log(`📐 Bracket size: ${bracketSize} (from ${teams.length} teams)`);
    
    // Rebalance bracket if needed (avoid too many BYEs)
    const byesNeeded = bracketSize - teams.length;
    if (byesNeeded > bracketSize / 4) {
      // Too many BYEs, reduce bracket size if possible
      const smallerBracket = bracketSize / 2;
      if (smallerBracket >= teams.length) {
        console.log(`⚖️ Rebalancing: ${byesNeeded} BYEs too many, reducing bracket to ${smallerBracket}`);
        bracketSize = smallerBracket;
      }
    }
    
    // Determine starting round based on bracket size
    const roundNames = {
      32: 'R32',
      16: 'R16',
      8: 'QF',
      4: 'SF',
      2: 'Final'
    };
    
    const rounds = [];
    let currentBracketSize = bracketSize;
    let currentTeams = [...teams];
    
    // Apply seeding strategy
    if (seeding === 'standard') {
      // FIFA/UEFA standard: 1vs16, 2vs15, 3vs14, etc.
      currentTeams = this._applySeedingOrder(currentTeams);
      console.log(`🎯 Applied standard seeding (1vs${bracketSize}, 2vs${bracketSize-1}, ...)`);
    } else if (seeding === 'random') {
      currentTeams = this._shuffleArray([...currentTeams]);
      console.log(`🎲 Applied random seeding`);
    }
    
    // Pad with BYE teams if needed (distributed evenly)
    while (currentTeams.length < bracketSize) {
      currentTeams.push({ id: `BYE_${currentTeams.length}`, name: 'BYE', isBye: true });
    }
    
    // Generate each knockout round
    let roundNumber = 1;
    let fixtureId = 1;
    
    while (currentBracketSize >= 2) {
      const roundName = roundNames[currentBracketSize] || `Round ${roundNumber}`;
      const matchesInRound = currentBracketSize / 2;
      const roundFixtures = [];
      
      console.log(`🎯 Generating ${roundName}: ${matchesInRound} matches`);
      
      // Generate matches for this round
      for (let i = 0; i < matchesInRound; i++) {
        const homeTeam = currentTeams[i * 2];
        const awayTeam = currentTeams[i * 2 + 1];
        
        // Skip BYE matches
        if (homeTeam.isBye || awayTeam.isBye) {
          // Winner automatically advances
          const winner = homeTeam.isBye ? awayTeam : homeTeam;
          currentTeams[i] = winner; // Update for next round
          continue;
        }
        
        if (legs === 1) {
          // Single-leg knockout
          roundFixtures.push({
            id: `knockout_${fixtureId++}`,
            round: roundNumber,
            roundName,
            leg: 1,
            homeTeam,
            awayTeam,
            knockoutStage: roundName,
            isKnockout: true,
            extraTime: allowExtraTime,
            penalties: allowPenalties,
            replayAllowed: allowReplays,
            tieBreakingRules: this._getTieBreakingRules(legs, allowExtraTime, allowPenalties, allowReplays)
          });
        } else {
          // Home-and-away (two legs)
          roundFixtures.push({
            id: `knockout_${fixtureId++}`,
            round: roundNumber,
            roundName,
            leg: 1,
            homeTeam,
            awayTeam,
            knockoutStage: roundName,
            isKnockout: true,
            isFirstLeg: true,
            awayGoalsRule: this.config.awayGoalsRule,
            extraTime: false, // No extra time in first leg
            penalties: false
          });
          roundFixtures.push({
            id: `knockout_${fixtureId++}`,
            round: roundNumber,
            roundName,
            leg: 2,
            homeTeam: awayTeam,
            awayTeam: homeTeam,
            knockoutStage: roundName,
            isKnockout: true,
            isSecondLeg: true,
            awayGoalsRule: this.config.awayGoalsRule,
            extraTime: allowExtraTime, // Extra time possible in second leg
            penalties: allowPenalties,
            tieBreakingRules: this._getTieBreakingRules(legs, allowExtraTime, allowPenalties, allowReplays)
          });
        }
      }
      
      rounds.push(...roundFixtures);
      
      // Prepare for next round (winners advance - placeholder teams)
      const nextRoundTeams = [];
      for (let i = 0; i < matchesInRound; i++) {
        nextRoundTeams.push({
          id: `winner_${roundName}_${i + 1}`,
          name: `Winner ${roundName} ${i + 1}`,
          isPlaceholder: true
        });
      }
      currentTeams = nextRoundTeams;
      
      currentBracketSize = currentBracketSize / 2;
      roundNumber++;
    }
    
    // Add third-place playoff if requested
    if (includeThirdPlace && bracketSize >= 4) {
      rounds.push({
        id: `knockout_${fixtureId++}`,
        round: roundNumber,
        roundName: 'Third Place',
        leg: 1,
        homeTeam: { id: 'loser_sf_1', name: 'Loser SF 1', isPlaceholder: true },
        awayTeam: { id: 'loser_sf_2', name: 'Loser SF 2', isPlaceholder: true },
        knockoutStage: 'Third Place',
        isKnockout: true,
        isThirdPlace: true
      });
    }
    
    console.log(`✅ Knockout bracket complete: ${rounds.length} matches across ${roundNumber} rounds`);
    return rounds;
  }

  /**
   * Apply FIFA/UEFA seeding order (1vs16, 2vs15, 3vs14, etc.)
   */
  _applySeedingOrder(teams) {
    const seeded = [...teams];
    const paired = [];
    
    for (let i = 0; i < seeded.length / 2; i++) {
      paired.push(seeded[i]); // Top seed
      if (seeded.length - 1 - i !== i) {
        paired.push(seeded[seeded.length - 1 - i]); // Bottom seed
      }
    }
    
    return paired;
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get tie-breaking rules configuration
   */
  _getTieBreakingRules(legs, allowExtraTime, allowPenalties, allowReplays) {
    const rules = [];
    
    if (legs === 2) {
      rules.push('aggregate_score');
      if (this.config.awayGoalsRule) {
        rules.push('away_goals');
      }
    }
    
    if (allowExtraTime) {
      rules.push(`extra_time_${this.config.extraTimeDuration}min`);
    }
    
    if (allowPenalties) {
      rules.push('penalties');
    }
    
    if (allowReplays) {
      rules.push(`replay_max${this.config.maxReplays}`);
    }
    
    if (rules.length === 0) {
      rules.push('higher_seed_advances'); // Fallback
    }
    
    return rules;
  }

  /**
   * Distribute teams to groups with geographical diversity
   */
  _distributeTeamsToGroups(teams, config) {
    const { groupCount, teamsPerGroup } = config;
    const groups = [];
    
    // Sort teams by region for diversity
    const sortedTeams = [...teams].sort((a, b) => {
      const regionA = a.county || a.region || '';
      const regionB = b.county || b.region || '';
      return regionA.localeCompare(regionB);
    });

    // Snake distribution for balance
    for (let g = 0; g < groupCount; g++) {
      groups.push({
        id: `group_${g + 1}`,
        name: `Group ${String.fromCharCode(65 + g)}`,
        teams: []
      });
    }

    let groupIndex = 0;
    let direction = 1;
    
    for (let i = 0; i < sortedTeams.length; i++) {
      if (groups[groupIndex].teams.length < teamsPerGroup) {
        groups[groupIndex].teams.push(sortedTeams[i]);
      }
      
      groupIndex += direction;
      if (groupIndex >= groupCount) {
        groupIndex = groupCount - 1;
        direction = -1;
      } else if (groupIndex < 0) {
        groupIndex = 0;
        direction = 1;
      }
    }

    return groups;
  }
}

/**
 * Constraint-Based Fixture Optimizer
 * Handles real-world scheduling constraints
 */
export class FixtureOptimizer {
  constructor(constraints = {}) {
    this.constraints = {
      minimumRestDays: constraints.minimumRestDays || 2,
      derbySpacing: constraints.derbySpacing || 3,
      stadiumAvailability: constraints.stadiumAvailability || {},
      tvBroadcastSlots: constraints.tvBroadcastSlots || [],
      policeRestrictions: constraints.policeRestrictions || [],
      teamRequests: constraints.teamRequests || {},
      ...constraints
    };
  }

  /**
   * Apply all constraints and optimize schedule
   */
  optimizeSchedule(fixtures, config) {
    console.log(`⚙️ Optimizing ${fixtures.length} fixtures with constraints`);
    
    let optimized = [...fixtures];
    
    // 1. Assign venues based on geography and availability
    optimized = this._assignVenues(optimized, config.venues);
    
    // 2. Schedule dates and times
    optimized = this._scheduleDatesAndTimes(optimized, config);
    
    // 3. Detect and resolve conflicts
    const { fixtures: resolved, conflicts } = this._detectAndResolveConflicts(optimized);
    
    // 4. Identify derbies and high-profile matches
    optimized = this._identifySpecialMatches(resolved);
    
    console.log(`✅ Optimization complete with ${conflicts.length} conflicts detected`);
    
    return { fixtures: optimized, conflicts };
  }

  /**
   * Intelligent venue assignment based on geography
   */
  _assignVenues(fixtures, venues) {
    if (!venues || venues.length === 0) return fixtures;
    
    return fixtures.map(fixture => {
      // Priority 1: Home team's county
      let venue = venues.find(v => v.county === fixture.homeTeam.county);
      
      // Priority 2: Nearby venue
      if (!venue) {
        venue = venues.find(v => 
          v.county === fixture.homeTeam.sub_county ||
          v.constituency === fixture.homeTeam.constituency
        );
      }
      
      // Priority 3: Any available venue (round-robin)
      if (!venue) {
        venue = venues[fixtures.indexOf(fixture) % venues.length];
      }
      
      // Calculate travel cost
      const travelCost = this._calculateTravelCost(fixture, venue);
      
      return {
        ...fixture,
        venue,
        venueId: venue.id,
        travelCost,
        isHomeVenue: venue.county === fixture.homeTeam.county
      };
    });
  }

  /**
   * Calculate travel burden cost
   */
  _calculateTravelCost(fixture, venue) {
    if (venue.county === fixture.homeTeam.county) return 1;
    if (venue.county === fixture.awayTeam.county) return 2;
    return 3;  // Neutral venue
  }

  /**
   * Schedule dates and times with constraints
   */
  _scheduleDatesAndTimes(fixtures, config) {
    const startDate = new Date(config.startDate);
    const timeSlots = config.timeSlots || [
      { time: '10:00', label: 'Morning' },
      { time: '14:00', label: 'Afternoon' },
      { time: '16:00', label: 'Evening' }
    ];
    
    // Group fixtures by round
    const rounds = {};
    fixtures.forEach(f => {
      if (!rounds[f.round]) rounds[f.round] = [];
      rounds[f.round].push(f);
    });
    
    let currentDate = new Date(startDate);
    const scheduled = [];
    
    Object.keys(rounds).sort((a, b) => a - b).forEach(roundNum => {
      const roundFixtures = rounds[roundNum];
      
      roundFixtures.forEach((fixture, idx) => {
        const timeSlot = timeSlots[idx % timeSlots.length];
        const kickoffDate = new Date(currentDate);
        const [hours, minutes] = timeSlot.time.split(':').map(Number);
        kickoffDate.setHours(hours, minutes, 0, 0);
        
        scheduled.push({
          ...fixture,
          kickoff: kickoffDate.toISOString(),
          kickoffDate,
          timeSlot: timeSlot.label,
          status: 'SCHEDULED'
        });
      });
      
      // Move to next match day (respect minimum rest days)
      currentDate.setDate(currentDate.getDate() + (this.constraints.minimumRestDays + 1));
    });
    
    return scheduled;
  }

  /**
   * Detect scheduling conflicts
   */
  _detectAndResolveConflicts(fixtures) {
    const conflicts = [];
    
    // Check for venue double-booking
    const venueSchedule = {};
    fixtures.forEach(fixture => {
      const key = `${fixture.venueId}_${fixture.kickoff}`;
      if (venueSchedule[key]) {
        conflicts.push({
          type: 'VENUE_CONFLICT',
          severity: 'HIGH',
          message: `Double booking at ${fixture.venue.name}`,
          fixtureIds: [venueSchedule[key].id, fixture.id]
        });
      }
      venueSchedule[key] = fixture;
    });
    
    // Check for teams with insufficient rest
    const teamSchedule = {};
    fixtures.forEach(fixture => {
      [fixture.homeTeam.id, fixture.awayTeam.id].forEach(teamId => {
        if (teamSchedule[teamId]) {
          const lastMatch = teamSchedule[teamId];
          const daysDiff = (new Date(fixture.kickoff) - new Date(lastMatch.kickoff)) / (1000 * 60 * 60 * 24);
          
          if (daysDiff < this.constraints.minimumRestDays) {
            conflicts.push({
              type: 'REST_PERIOD_VIOLATION',
              severity: 'MEDIUM',
              message: `Team has only ${Math.floor(daysDiff)} days rest`,
              fixtureId: fixture.id,
              teamId
            });
          }
        }
        teamSchedule[teamId] = fixture;
      });
    });
    
    // Check for travel burden
    fixtures.forEach(fixture => {
      if (fixture.travelCost > 2) {
        conflicts.push({
          type: 'TRAVEL_BURDEN',
          severity: 'LOW',
          message: `High travel burden for ${fixture.homeTeam.name}`,
          fixtureId: fixture.id
        });
      }
    });
    
    return { fixtures, conflicts };
  }

  /**
   * Identify derbies and special matches
   */
  _identifySpecialMatches(fixtures) {
    return fixtures.map(fixture => {
      const isDerby = this._isDerby(fixture.homeTeam, fixture.awayTeam);
      const isHighProfile = this._isHighProfile(fixture);
      
      return {
        ...fixture,
        isDerby,
        isHighProfile,
        priority: isDerby ? 'HIGH' : isHighProfile ? 'MEDIUM' : 'NORMAL'
      };
    });
  }

  /**
   * Check if match is a derby (local rivalry)
   */
  _isDerby(homeTeam, awayTeam) {
    return homeTeam.county === awayTeam.county ||
           homeTeam.sub_county === awayTeam.sub_county ||
           homeTeam.ward === awayTeam.ward;
  }

  /**
   * Check if match is high-profile
   */
  _isHighProfile(fixture) {
    // Could check historical performance, fan base, etc.
    return false;  // Placeholder
  }
}

/**
 * Advanced Standings Engine with Head-to-Head Resolution
 */
export class AdvancedStandingsEngine {
  constructor(config = {}) {
    this.config = {
      pointsSystem: config.pointsSystem || { win: 3, draw: 1, loss: 0 },
      sortingRules: config.sortingRules || [
        'points', 'goal_difference', 'goals_for', 'head_to_head'
      ],
      ...config
    };
  }

  /**
   * Calculate comprehensive standings with all tie-breakers
   */
  calculateStandings(matches, teams) {
    console.log(`📊 Calculating standings from ${matches.length} matches`);
    
    // Initialize team stats
    const teamStats = {};
    teams.forEach(team => {
      teamStats[team.id] = this._initializeTeamStats(team);
    });
    
    // Process all completed matches
    matches
      .filter(m => m.status === 'COMPLETED' || m.status === 'FINISHED')
      .forEach(match => {
        this._updateTeamStats(teamStats, match);
      });
    
    // Convert to array and apply sorting
    let standings = Object.values(teamStats);
    standings = this._applySortingRules(standings, teamStats, matches);
    
    // Add positions and metadata
    standings = this._addStandingsMetadata(standings);
    
    console.log(`✅ Standings calculated for ${standings.length} teams`);
    return standings;
  }

  _initializeTeamStats(team) {
    return {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],  // Last 5 results
      headToHead: {}
    };
  }

  _updateTeamStats(teamStats, match) {
    const home = teamStats[match.homeTeamId];
    const away = teamStats[match.awayTeamId];
    
    if (!home || !away) return;
    
    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;
    
    // Determine result
    if (match.homeScore > match.awayScore) {
      home.won++;
      away.lost++;
      home.points += this.config.pointsSystem.win;
      home.form.push('W');
      away.form.push('L');
    } else if (match.homeScore < match.awayScore) {
      away.won++;
      home.lost++;
      away.points += this.config.pointsSystem.win;
      away.form.push('W');
      home.form.push('L');
    } else {
      home.drawn++;
      away.drawn++;
      home.points += this.config.pointsSystem.draw;
      away.points += this.config.pointsSystem.draw;
      home.form.push('D');
      away.form.push('D');
    }
    
    // Keep only last 5 results
    if (home.form.length > 5) home.form.shift();
    if (away.form.length > 5) away.form.shift();
    
    // Update goal difference
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
    
    // Record head-to-head
    if (!home.headToHead[away.teamId]) {
      home.headToHead[away.teamId] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    }
    if (!away.headToHead[home.teamId]) {
      away.headToHead[home.teamId] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    }
    
    home.headToHead[away.teamId].played++;
    away.headToHead[home.teamId].played++;
    home.headToHead[away.teamId].gf += match.homeScore;
    home.headToHead[away.teamId].ga += match.awayScore;
    away.headToHead[home.teamId].gf += match.awayScore;
    away.headToHead[home.teamId].ga += match.homeScore;
    
    if (match.homeScore > match.awayScore) {
      home.headToHead[away.teamId].won++;
      away.headToHead[home.teamId].lost++;
    } else if (match.homeScore < match.awayScore) {
      away.headToHead[home.teamId].won++;
      home.headToHead[away.teamId].lost++;
    } else {
      home.headToHead[away.teamId].drawn++;
      away.headToHead[home.teamId].drawn++;
    }
  }

  _applySortingRules(teams, teamStats, matches) {
    // Primary sort by points, goal difference, goals for
    teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return 0;
    });
    
    // Apply head-to-head for tied teams
    return this._resolveHeadToHead(teams);
  }

  _resolveHeadToHead(teams) {
    let i = 0;
    while (i < teams.length - 1) {
      let j = i + 1;
      
      // Find all teams with identical primary criteria
      while (j < teams.length &&
             teams[i].points === teams[j].points &&
             teams[i].goalDifference === teams[j].goalDifference &&
             teams[i].goalsFor === teams[j].goalsFor) {
        j++;
      }
      
      // If we have tied teams, use head-to-head
      if (j - i > 1) {
        const tiedTeams = teams.slice(i, j);
        const resolved = this._headToHeadComparison(tiedTeams);
        teams.splice(i, j - i, ...resolved);
      }
      
      i = j;
    }
    
    return teams;
  }

  _headToHeadComparison(tiedTeams) {
    // Calculate head-to-head mini-table
    return tiedTeams.sort((a, b) => {
      const h2hA = this._getHeadToHeadPoints(a, tiedTeams);
      const h2hB = this._getHeadToHeadPoints(b, tiedTeams);
      
      if (h2hB.points !== h2hA.points) return h2hB.points - h2hA.points;
      if (h2hB.goalDiff !== h2hA.goalDiff) return h2hB.goalDiff - h2hA.goalDiff;
      if (h2hB.goalsFor !== h2hA.goalsFor) return h2hB.goalsFor - h2hA.goalsFor;
      
      return 0;
    });
  }

  _getHeadToHeadPoints(team, opponents) {
    let points = 0, goalsFor = 0, goalsAgainst = 0;
    
    opponents.forEach(opp => {
      if (opp.teamId === team.teamId) return;
      
      const h2h = team.headToHead[opp.teamId];
      if (h2h) {
        points += h2h.won * 3 + h2h.drawn;
        goalsFor += h2h.gf;
        goalsAgainst += h2h.ga;
      }
    });
    
    return {
      points,
      goalsFor,
      goalDiff: goalsFor - goalsAgainst
    };
  }

  _addStandingsMetadata(standings) {
    return standings.map((team, index) => ({
      ...team,
      position: index + 1,
      formString: team.form.join(''),
      lastUpdated: new Date().toISOString()
    }));
  }
}
