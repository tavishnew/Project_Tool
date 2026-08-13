import { db } from '../db.js';

/**
 * Records a project-scoped activity event. The caller supplies only non-sensitive,
 * display-safe metadata because audit metadata may be shown to project administrators.
 */
export async function logProjectActivity({ projectId, actorId, action, entityType, entityId = null, metadata = {} }) {
  await db.query(
    `INSERT INTO project_audit_logs (project_id, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [projectId, actorId || null, action, entityType, entityId == null ? null : String(entityId), JSON.stringify(metadata)]
  );
}
