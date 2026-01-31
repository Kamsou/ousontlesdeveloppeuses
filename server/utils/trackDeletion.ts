import { sql } from 'drizzle-orm'

export async function trackDeletion(deletedBy: 'self' | 'admin') {
  const db = useDrizzle()
  const month = new Date().toISOString().slice(0, 7)

  await db.run(sql`
    INSERT INTO account_deletion_stats (month, deleted_by, count)
    VALUES (${month}, ${deletedBy}, 1)
    ON CONFLICT(month, deleted_by) DO UPDATE SET count = count + 1
  `)
}
