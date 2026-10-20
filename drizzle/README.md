# Drizzle migrations

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon **pooled** URL) and `DB_TABLE_PREFIX`.
2. Apply schema to the database:

   | Workflow | When to use |
   | -------- | ----------- |
   | **`pnpm db:push`** | New apps, prototypes, solo dev — syncs `schema.ts` to the DB using your current prefix. |
   | **`pnpm db:generate`** then **`pnpm db:migrate`** | Teams/CI — versioned SQL in `drizzle/`; run generate after every schema change. |

3. **Prefix:** `db:generate` bakes `${DB_TABLE_PREFIX}` into migration SQL at generate time. The sample migration in this repo uses the boiler default `simplycode_*`. If your app uses another prefix (e.g. `cc`), either run **`db:push`** or regenerate migrations after setting `.env`.

Use a **unique** `DB_TABLE_PREFIX` per app when sharing one Neon project.
