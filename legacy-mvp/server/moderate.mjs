// Operator-only command. Requires direct access to the database host.
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.env.DATABASE_PATH || "data/luvbird.sqlite");
db.exec("PRAGMA foreign_keys=ON");
const [command, id] = process.argv.slice(2);
if (command === "list")
  console.table(
    db
      .prepare(
        "SELECT id,reporter,target,reason,created FROM reports WHERE status='open' ORDER BY created",
      )
      .all(),
  );
else if (command === "resolve" && id) {
  const r = db
    .prepare("UPDATE reports SET status='resolved' WHERE id=?")
    .run(id);
  console.log({ resolved: r.changes });
} else if (
  command === "remove-account" &&
  id &&
  process.env.CONFIRM_REMOVE === id
) {
  const r = db.prepare("DELETE FROM users WHERE id=?").run(id);
  console.log({ removed: r.changes });
} else
  console.log(
    "Usage: node moderate.mjs list | resolve REPORT_ID | remove-account USER_ID (requires CONFIRM_REMOVE=USER_ID)",
  );
db.close();
