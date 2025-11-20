# 🚨 FIX: Apply Live Match Migration

## The Error
```
ERROR: 42703: column "event_type" does not exist
```

This means the `match_events` table hasn't been created in your Supabase database yet.

---

## ✅ Solution (2 Minutes)

### **Step 1: Open Supabase SQL Editor**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Copy & Run Migration**
1. Open the file: `APPLY_THIS_MIGRATION.sql`
2. Copy **ALL contents** (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **RUN** button (bottom right)

### **Step 3: Verify Success**
You should see:
```
status: "Migration completed successfully!"
```

### **Step 4: Run Tests**
```powershell
node test-live-match-features.mjs
```

---

## 📋 What This Creates

**Tables:**
- ✅ `match_events` - Stores goals, cards, substitutions
- ✅ `match_statistics` - Stores possession, shots, corners, fouls

**Indexes:**
- ✅ Fast queries on match_id, event_type, player_id

---

## 🔍 Manual Verification (Optional)

After running migration, test in SQL Editor:

```sql
-- Check table exists
SELECT * FROM match_events LIMIT 1;

-- Check statistics table
SELECT * FROM match_statistics LIMIT 1;
```

Both should return empty results (not errors).

---

## ⚡ Quick Summary

1. **Open:** Supabase Dashboard → SQL Editor
2. **Copy:** All of `APPLY_THIS_MIGRATION.sql`
3. **Paste:** Into SQL Editor
4. **Run:** Click RUN button
5. **Test:** `node test-live-match-features.mjs`

**Done!** Your live match tracking is ready. 🎉
