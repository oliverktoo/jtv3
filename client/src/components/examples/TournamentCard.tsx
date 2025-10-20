import TournamentCard from "../TournamentCard";

export default function TournamentCardExample() {
  return (
    <div className="p-8 space-y-6 bg-background">
      <TournamentCard
        id="1"
        name="Nairobi County Football Championship"
        model="ADMINISTRATIVE_COUNTY"
        status="ACTIVE"
        season="2025/26"
        startDate="2025-10-11"
        endDate="2026-07-26"
        teamCount={16}
        location="Nairobi County"
        sport="Football"
        onView={() => console.log("View tournament")}
        onEdit={() => console.log("Edit tournament")}
        onDelete={() => console.log("Delete tournament")}
      />

      <TournamentCard
        id="2"
        name="Upper Rift Regional League Zone A"
        model="LEAGUE"
        status="REGISTRATION"
        season="2025"
        startDate="2025-11-01"
        endDate="2026-05-30"
        teamCount={12}
        location="Rift Valley"
        sport="Basketball"
        onView={() => console.log("View tournament")}
        onEdit={() => console.log("Edit tournament")}
        onDelete={() => console.log("Delete tournament")}
      />

      <TournamentCard
        id="3"
        name="Westlands Ward Youth Tournament"
        model="ADMINISTRATIVE_WARD"
        status="DRAFT"
        season="2025"
        startDate="2025-12-01"
        endDate="2025-12-15"
        sport="Volleyball"
        onView={() => console.log("View tournament")}
        onEdit={() => console.log("Edit tournament")}
        onDelete={() => console.log("Delete tournament")}
      />
    </div>
  );
}
