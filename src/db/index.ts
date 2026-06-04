/*
  Database initialization is disabled.

  Reason: The application currently uses Zustand + localStorage for persisting history.
  The drizzle-orm + mysql2 setup was prepared but never activated.

  To enable it later:
  1. npm install drizzle-orm mysql2
  2. Replace this file with proper drizzle initialization
  3. Update schema.ts if needed
*/

export const db = null;
