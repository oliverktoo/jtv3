import { db } from "./db";
import {
  organizations,
  sports,
  counties,
  subCounties,
  wards,
  tournaments,
  teams,
  stages,
  leagueDivisions,
  groups,
  teamGroups,
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create default organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Jamii Sports Federation",
      slug: "jamii-sports",
    })
    .returning();

  console.log("✓ Created organization");

  // Create sports
  const sportsList = await db
    .insert(sports)
    .values([
      { name: "Football", slug: "football" },
      { name: "Basketball", slug: "basketball" },
      { name: "Volleyball", slug: "volleyball" },
      { name: "Rugby", slug: "rugby" },
      { name: "Netball", slug: "netball" },
    ])
    .returning();

  console.log("✓ Created sports");

  // Create key Kenyan counties
  const countiesList = await db
    .insert(counties)
    .values([
      { name: "Nairobi", code: "047" },
      { name: "Mombasa", code: "001" },
      { name: "Kisumu", code: "042" },
      { name: "Nakuru", code: "032" },
      { name: "Kiambu", code: "022" },
      { name: "Machakos", code: "016" },
      { name: "Uasin Gishu", code: "027" },
      { name: "Kakamega", code: "037" },
    ])
    .returning();

  console.log("✓ Created counties");

  // Create sub-counties for Nairobi
  const nairobiCounty = countiesList.find((c) => c.name === "Nairobi");
  if (nairobiCounty) {
    const subCountiesList = await db
      .insert(subCounties)
      .values([
        { countyId: nairobiCounty.id, name: "Westlands" },
        { countyId: nairobiCounty.id, name: "Dagoretti North" },
        { countyId: nairobiCounty.id, name: "Dagoretti South" },
        { countyId: nairobiCounty.id, name: "Langata" },
        { countyId: nairobiCounty.id, name: "Kibra" },
        { countyId: nairobiCounty.id, name: "Roysambu" },
        { countyId: nairobiCounty.id, name: "Kasarani" },
        { countyId: nairobiCounty.id, name: "Ruaraka" },
        { countyId: nairobiCounty.id, name: "Embakasi South" },
        { countyId: nairobiCounty.id, name: "Embakasi North" },
      ])
      .returning();

    console.log("✓ Created sub-counties for Nairobi");

    // Create wards for Westlands
    const westlands = subCountiesList.find((sc) => sc.name === "Westlands");
    if (westlands) {
      await db.insert(wards).values([
        { subCountyId: westlands.id, name: "Kitisuru" },
        { subCountyId: westlands.id, name: "Parklands/Highridge" },
        { subCountyId: westlands.id, name: "Karura" },
        { subCountyId: westlands.id, name: "Kangemi" },
        { subCountyId: westlands.id, name: "Mountain View" },
      ]);

      console.log("✓ Created wards for Westlands");
    }
  }

  // Create sample tournament
  const footballSport = sportsList.find((s) => s.slug === "football");
  if (footballSport && nairobiCounty) {
    const [tournament] = await db
      .insert(tournaments)
      .values({
        orgId: org.id,
        sportId: footballSport.id,
        name: "Nairobi County Football Championship",
        slug: "nairobi-county-championship-2025",
        season: "2025/26",
        tournamentModel: "ADMINISTRATIVE_COUNTY",
        status: "ACTIVE",
        federationType: "FKF",
        startDate: "2025-10-11",
        endDate: "2026-07-26",
        countyId: nairobiCounty.id,
        customRules: {
          kickoffTime: "13:00",
          weekendsOnly: true,
        },
        isPublished: true,
      })
      .returning();

    console.log("✓ Created sample tournament");

    // Create stage and division
    const [stage] = await db
      .insert(stages)
      .values({
        tournamentId: tournament.id,
        name: "League Stage",
        stageType: "LEAGUE",
        seq: 1,
      })
      .returning();

    const [division] = await db
      .insert(leagueDivisions)
      .values({
        stageId: stage.id,
        name: "Division 1",
        level: 1,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        tiebreakers: ["POINTS", "GD", "GF", "H2H"],
      })
      .returning();

    console.log("✓ Created stage and division");

    // Create sample teams
    const teamNames = [
      "Tusker FC",
      "Gor Mahia",
      "AFC Leopards",
      "KCB FC",
      "Ulinzi Stars",
      "Bandari FC",
      "Kakamega Homeboyz",
      "Sofapaka",
      "Posta Rangers",
      "Nzoia Sugar",
      "Kariobangi Sharks",
      "Mathare United",
      "Vihiga Bullets",
      "Wazito FC",
    ];

    const teamRecords = await db
      .insert(teams)
      .values(
        teamNames.map((name) => ({
          tournamentId: tournament.id,
          name,
          code: name.substring(0, 3).toUpperCase(),
          countyId: nairobiCounty.id,
        }))
      )
      .returning();

    console.log("✓ Created sample teams");

    // Assign teams to division
    await db.insert(teamGroups).values(
      teamRecords.map((team) => ({
        teamId: team.id,
        divisionId: division.id,
      }))
    );

    console.log("✓ Assigned teams to division");
  }

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
