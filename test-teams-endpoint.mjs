// Quick test of teams endpoint
const response = await fetch('http://127.0.0.1:5000/api/teams');
const teams = await response.json();

console.log(`Found ${teams.length} teams:`);
teams.slice(0, 5).forEach(team => {
  console.log(`- ${team.name} (Org: ${team.organizations?.name || 'Independent'})`);
});

console.log('\nSample team structure:');
console.log(JSON.stringify(teams[0], null, 2));