import FixtureCard from "../FixtureCard";

export default function FixtureCardExample() {
  return (
    <div className="p-8 space-y-6 bg-background max-w-2xl">
      <FixtureCard
        id="1"
        homeTeam="Tusker FC"
        awayTeam="Gor Mahia"
        homeScore={2}
        awayScore={1}
        kickoff="2025-10-11T13:00:00"
        venue="Kasarani Stadium"
        status="COMPLETED"
        round="Round 5"
        stage="League"
        onClick={() => console.log("View match details")}
      />

      <FixtureCard
        id="2"
        homeTeam="AFC Leopards"
        awayTeam="Sofapaka"
        kickoff="2025-10-18T13:00:00"
        venue="Nyayo Stadium"
        status="SCHEDULED"
        round="Round 6"
        stage="League"
        onClick={() => console.log("View match details")}
      />

      <FixtureCard
        id="3"
        homeTeam="Ulinzi Stars"
        awayTeam="KCB FC"
        homeScore={1}
        awayScore={1}
        kickoff="2025-10-12T13:00:00"
        venue="Afraha Stadium"
        status="LIVE"
        round="Round 5"
        stage="League"
        onClick={() => console.log("View match details")}
      />
    </div>
  );
}
