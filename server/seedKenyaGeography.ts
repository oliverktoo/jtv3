import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface CSVRow {
  countyId: string;
  countyName: string;
  constituencyId: string;
  constituencyName: string;
  wardId: string;
  wardName: string;
}

async function seedKenyaGeography() {
  console.log("Starting Kenya geography seeding...");

  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), '..', 'docs', 'csv-Kenya-Counties-Constituencies-Wards (1).csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV (skip header)
    const lines = csvContent.split('\n').slice(1);
    const rows: CSVRow[] = lines
      .filter(line => line.trim())
      .map(line => {
        const [countyId, countyName, constituencyId, constituencyName, wardId, wardName] = 
          line.split(',').map(field => field.trim());
        
        return {
          countyId,
          countyName,
          constituencyId,
          constituencyName,
          wardId,
          wardName
        };
      });

    console.log(`Parsed ${rows.length} rows from CSV`);

    // Group data for efficient insertion
    const countiesMap = new Map();
    const subCountiesMap = new Map();
    const wardsData: Array<{
      sub_county_name: string;
      county_name: string;
      name: string;
    }> = [];

    rows.forEach(row => {
      // Counties (using constituency as sub-county)
      if (!countiesMap.has(row.countyId)) {
        countiesMap.set(row.countyId, {
          name: row.countyName,
          code: row.countyId.padStart(3, '0'),
        });
      }

      // Sub-counties (constituencies)
      const subCountyKey = `${row.countyId}-${row.constituencyId}`;
      if (!subCountiesMap.has(subCountyKey)) {
        subCountiesMap.set(subCountyKey, {
          county_name: row.countyName, // We'll match by name
          name: row.constituencyName,
        });
      }

      // Wards (we'll store temp data and process after sub-counties are created)
      wardsData.push({
        sub_county_name: row.constituencyName,
        county_name: row.countyName,
        name: row.wardName,
      });
    });

    // Insert counties (let Supabase generate UUIDs)
    const counties = Array.from(countiesMap.values());
    console.log(`Inserting ${counties.length} counties...`);
    
    const { data: insertedCounties, error: countiesError } = await supabase
      .from('counties')
      .insert(counties)
      .select('id, name');
    
    if (countiesError) {
      console.error('Counties error:', countiesError);
      throw countiesError;
    }
    console.log('✓ Counties inserted successfully');

    // Create county lookup map
    const countyLookup = new Map();
    insertedCounties?.forEach(county => {
      countyLookup.set(county.name, county.id);
    });

    // Insert sub-counties with proper county_id references
    const subCountiesToInsert = Array.from(subCountiesMap.values()).map(sc => ({
      name: sc.name,
      county_id: countyLookup.get(sc.county_name),
    })).filter(sc => sc.county_id); // Only include if county exists

    console.log(`Inserting ${subCountiesToInsert.length} sub-counties...`);
    
    const { data: insertedSubCounties, error: subCountiesError } = await supabase
      .from('sub_counties')
      .insert(subCountiesToInsert)
      .select('id, name');
    
    if (subCountiesError) {
      console.error('Sub-counties error:', subCountiesError);
      throw subCountiesError;
    }
    console.log('✓ Sub-counties inserted successfully');

    // Create sub-county lookup map
    const subCountyLookup = new Map();
    insertedSubCounties?.forEach(subCounty => {
      subCountyLookup.set(subCounty.name, subCounty.id);
    });

    // Insert wards with proper sub_county_id references
    const wardsToInsert = wardsData.map(ward => ({
      name: ward.name,
      sub_county_id: subCountyLookup.get(ward.sub_county_name),
    })).filter(ward => ward.sub_county_id); // Only include if sub-county exists

    console.log(`Inserting ${wardsToInsert.length} wards...`);
    const batchSize = 100;
    
    for (let i = 0; i < wardsToInsert.length; i += batchSize) {
      const batch = wardsToInsert.slice(i, i + batchSize);
      
      const { error: wardsError } = await supabase
        .from('wards')
        .insert(batch);
      
      if (wardsError) {
        console.error(`Wards batch ${i}-${i + batchSize} error:`, wardsError);
        throw wardsError;
      }
      
      console.log(`✓ Inserted wards batch ${i + 1}-${Math.min(i + batchSize, wardsToInsert.length)}`);
    }

    console.log('🎉 Kenya geography seeded successfully!');
    console.log(`Summary:
    - Counties: ${counties.length}
    - Sub-counties: ${subCountiesToInsert.length}  
    - Wards: ${wardsToInsert.length}`);

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// Run the seeding
seedKenyaGeography()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

export { seedKenyaGeography };