import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

function isValidPostgresUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) return false;
  const trimmed = urlStr.trim();
  if (trimmed.includes('[') || trimmed.includes(']') || trimmed.includes('<') || trimmed.includes('>')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:';
  } catch {
    return false;
  }
}

export const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || '';

export const isPostgresConfigured = isValidPostgresUrl(databaseUrl);

let pool: pg.Pool | null = null;
if (isPostgresConfigured) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL] Unexpected pool error on idle client:', err.message);
    });
  } catch (err: any) {
    console.warn('[PostgreSQL] Failed to initialize Pool, fallback to in-memory store:', err.message);
    pool = null;
  }
}

export { pool };

/**
 * Initializes the schema tables in PostgreSQL if connected.
 * Creates tables for:
 * 1. app_state (key-value store for singletons like admin_store, atomic json state)
 * 2. leads
 * 3. consultations
 * 4. clients
 * 5. proposals
 * 6. projects
 * 7. invoices
 * 8. activity_logs
 * 9. orders
 * 10. processed_events
 */
export async function initializeDatabaseSchema(): Promise<boolean> {
  if (!pool) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Key-value store for resilient JSON snapshot backups & atomic synchronizations
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Normalized Leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        whatsapp VARCHAR(64) NOT NULL,
        phone VARCHAR(64),
        address TEXT,
        source VARCHAR(32) NOT NULL DEFAULT 'Website',
        status VARCHAR(64) NOT NULL DEFAULT 'Baru',
        assigned_marketing VARCHAR(128),
        next_follow_up_date VARCHAR(64),
        consent_given BOOLEAN NOT NULL DEFAULT true,
        consultation_id VARCHAR(64),
        client_id VARCHAR(64),
        notes JSONB DEFAULT '[]'::jsonb,
        activities JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Consultations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(64) NOT NULL,
        company VARCHAR(255),
        category VARCHAR(64),
        category_name VARCHAR(128),
        budget VARCHAR(64),
        budget_range VARCHAR(128),
        message TEXT,
        priority VARCHAR(32) DEFAULT 'Sedang',
        status VARCHAR(64) DEFAULT 'Baru Masuk',
        consultation_date VARCHAR(64),
        consultation_notes TEXT,
        assigned_to VARCHAR(128),
        client_id VARCHAR(64),
        proposal_id VARCHAR(64),
        project_id VARCHAR(64),
        history JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        industry VARCHAR(128),
        type VARCHAR(64) DEFAULT 'Calon Klien',
        address TEXT,
        portal_access_code VARCHAR(32) UNIQUE NOT NULL,
        total_value NUMERIC DEFAULT 0,
        projects_count INT DEFAULT 0,
        notes TEXT,
        meetings JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Proposals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(64) PRIMARY KEY,
        consultation_id VARCHAR(64),
        client_id VARCHAR(64) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_company VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        scope_of_work JSONB DEFAULT '[]'::jsonb,
        deliverables JSONB DEFAULT '[]'::jsonb,
        tech_stack JSONB DEFAULT '[]'::jsonb,
        total_price NUMERIC NOT NULL,
        payment_terms JSONB NOT NULL,
        timeline VARCHAR(128),
        estimated_start_date VARCHAR(64),
        status VARCHAR(64) DEFAULT 'Draft',
        revisions_count INT DEFAULT 0,
        revisions_history JSONB DEFAULT '[]'::jsonb,
        approved_at TIMESTAMPTZ,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client_id VARCHAR(64) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        proposal_id VARCHAR(64),
        pic VARCHAR(128),
        team_members JSONB DEFAULT '[]'::jsonb,
        start_date VARCHAR(64),
        deadline VARCHAR(64),
        progress_percentage INT DEFAULT 0,
        status VARCHAR(64) DEFAULT 'Kickoff',
        milestones JSONB DEFAULT '[]'::jsonb,
        tasks JSONB DEFAULT '[]'::jsonb,
        revisions JSONB DEFAULT '[]'::jsonb,
        files JSONB DEFAULT '[]'::jsonb,
        activity_log JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(64) PRIMARY KEY,
        invoice_number VARCHAR(64) NOT NULL,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        client_id VARCHAR(64) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(64) NOT NULL,
        amount NUMERIC NOT NULL,
        due_date VARCHAR(64),
        status VARCHAR(64) DEFAULT 'Menunggu Pembayaran',
        payment_url TEXT,
        payment_method VARCHAR(64),
        paid_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Activity Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(64) PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        "user" VARCHAR(128) NOT NULL,
        module VARCHAR(64) NOT NULL,
        action VARCHAR(128) NOT NULL,
        details TEXT
      );
    `);

    // Orders (ArtoPay payment gateway orders) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(64),
        items JSONB NOT NULL,
        base_amount NUMERIC NOT NULL,
        unique_code INT NOT NULL,
        gross_amount NUMERIC NOT NULL,
        currency VARCHAR(8) DEFAULT 'IDR',
        status VARCHAR(32) NOT NULL,
        payment_id VARCHAR(64),
        payment_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        paid_at TIMESTAMPTZ,
        payment_method VARCHAR(64),
        dispute_reason TEXT,
        notes TEXT
      );
    `);

    // Processed Webhook Events (Idempotency) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_events (
        event_key VARCHAR(128) PRIMARY KEY,
        processed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Database schema verified & ready.');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Failed to initialize schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Migration helper: Imports initial data from local JSON into PostgreSQL if PostgreSQL tables are empty.
 */
export async function seedPostgresFromJson(adminData: any, orders: any[], processedEvents: string[]): Promise<void> {
  if (!pool) return;
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT COUNT(*) as count FROM app_state WHERE key = $1', ['admin_store']);
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0 && adminData) {
      console.log('[PostgreSQL] Seeding PostgreSQL with existing store state...');
      await client.query(
        'INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        ['admin_store', JSON.stringify(adminData)]
      );

      // Seed orders
      if (Array.isArray(orders) && orders.length > 0) {
        for (const ord of orders) {
          await client.query(
            `INSERT INTO orders (
              order_id, customer_name, customer_email, customer_phone, items,
              base_amount, unique_code, gross_amount, currency, status,
              payment_id, payment_url, created_at, expires_at, paid_at, payment_method, dispute_reason, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (order_id) DO NOTHING`,
            [
              ord.orderId, ord.customerName, ord.customerEmail, ord.customerPhone || null, JSON.stringify(ord.items || []),
              ord.baseAmount, ord.uniqueCode, ord.grossAmount, ord.currency || 'IDR', ord.status,
              ord.paymentId || null, ord.paymentUrl || null, ord.createdAt || new Date().toISOString(), ord.expiresAt || null,
              ord.paidAt || null, ord.paymentMethod || null, ord.disputeReason || null, ord.notes || null
            ]
          );
        }
      }

      // Seed processed events
      if (Array.isArray(processedEvents) && processedEvents.length > 0) {
        for (const evt of processedEvents) {
          await client.query(
            'INSERT INTO processed_events (event_key, processed_at) VALUES ($1, NOW()) ON CONFLICT (event_key) DO NOTHING',
            [evt]
          );
        }
      }

      // Seed individual tables if available
      await syncNormalizedTables(adminData, client);

      console.log('[PostgreSQL] Seed complete.');
    }
  } catch (err) {
    console.error('[PostgreSQL] Error in seedPostgresFromJson:', err);
  } finally {
    client.release();
  }
}

/**
 * Synchronizes normalized relational tables from an adminData state snapshot.
 */
export async function syncNormalizedTables(adminData: any, existingClient?: pg.PoolClient): Promise<void> {
  if (!pool || !adminData) return;
  const client = existingClient || (await pool.connect());
  const shouldRelease = !existingClient;

  try {
    // 1. Leads
    if (Array.isArray(adminData.leads)) {
      for (const lead of adminData.leads) {
        await client.query(`
          INSERT INTO leads (
            id, name, email, whatsapp, phone, address, source, status, assigned_marketing,
            next_follow_up_date, consent_given, consultation_id, client_id, notes, activities, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            whatsapp = EXCLUDED.whatsapp,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            source = EXCLUDED.source,
            status = EXCLUDED.status,
            assigned_marketing = EXCLUDED.assigned_marketing,
            next_follow_up_date = EXCLUDED.next_follow_up_date,
            notes = EXCLUDED.notes,
            activities = EXCLUDED.activities,
            updated_at = EXCLUDED.updated_at
        `, [
          lead.id, lead.name, lead.email || null, lead.whatsapp, lead.phone || null, lead.address || null,
          lead.source || 'Website', lead.status || 'Baru', lead.assignedMarketing || null, lead.nextFollowUpDate || null,
          lead.consentGiven !== false, lead.consultationId || null, lead.clientId || null,
          JSON.stringify(lead.notes || []), JSON.stringify(lead.activities || []),
          lead.createdAt || new Date().toISOString(), lead.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 2. Consultations
    if (Array.isArray(adminData.consultations)) {
      for (const cons of adminData.consultations) {
        await client.query(`
          INSERT INTO consultations (
            id, name, email, phone, company, category, category_name, budget, budget_range,
            message, priority, status, consultation_date, consultation_notes, assigned_to,
            client_id, proposal_id, project_id, history, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            company = EXCLUDED.company,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            consultation_date = EXCLUDED.consultation_date,
            consultation_notes = EXCLUDED.consultation_notes,
            assigned_to = EXCLUDED.assigned_to,
            client_id = EXCLUDED.client_id,
            proposal_id = EXCLUDED.proposal_id,
            project_id = EXCLUDED.project_id,
            history = EXCLUDED.history,
            updated_at = EXCLUDED.updated_at
        `, [
          cons.id, cons.name, cons.email || null, cons.phone, cons.company || null,
          cons.category || null, cons.categoryName || null, cons.budget || null, cons.budgetRange || null,
          cons.message || null, cons.priority || 'Sedang', cons.status || 'Baru Masuk',
          cons.consultationDate || null, cons.consultationNotes || null, cons.assignedTo || null,
          cons.clientId || null, cons.proposalId || null, cons.projectId || null,
          JSON.stringify(cons.history || []), cons.createdAt || new Date().toISOString(), cons.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 3. Clients
    if (Array.isArray(adminData.clients)) {
      for (const c of adminData.clients) {
        await client.query(`
          INSERT INTO clients (
            id, name, company, email, phone, industry, type, address, portal_access_code,
            total_value, projects_count, notes, meetings, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            company = EXCLUDED.company,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            industry = EXCLUDED.industry,
            type = EXCLUDED.type,
            address = EXCLUDED.address,
            total_value = EXCLUDED.total_value,
            projects_count = EXCLUDED.projects_count,
            notes = EXCLUDED.notes,
            meetings = EXCLUDED.meetings,
            updated_at = EXCLUDED.updated_at
        `, [
          c.id, c.name, c.company, c.email, c.phone, c.industry || null, c.type || 'Calon Klien',
          c.address || null, c.portalAccessCode, c.totalValue || 0, c.projectsCount || 0,
          c.notes || null, JSON.stringify(c.meetings || []),
          c.createdAt || new Date().toISOString(), c.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 4. Proposals
    if (Array.isArray(adminData.proposals)) {
      for (const prop of adminData.proposals) {
        await client.query(`
          INSERT INTO proposals (
            id, consultation_id, client_id, client_name, client_company, title, summary,
            scope_of_work, deliverables, tech_stack, total_price, payment_terms, timeline,
            estimated_start_date, status, revisions_count, revisions_history, approved_at,
            rejection_reason, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            scope_of_work = EXCLUDED.scope_of_work,
            deliverables = EXCLUDED.deliverables,
            tech_stack = EXCLUDED.tech_stack,
            total_price = EXCLUDED.total_price,
            payment_terms = EXCLUDED.payment_terms,
            timeline = EXCLUDED.timeline,
            status = EXCLUDED.status,
            revisions_count = EXCLUDED.revisions_count,
            revisions_history = EXCLUDED.revisions_history,
            approved_at = EXCLUDED.approved_at,
            rejection_reason = EXCLUDED.rejection_reason,
            updated_at = EXCLUDED.updated_at
        `, [
          prop.id, prop.consultationId || null, prop.clientId, prop.clientName, prop.clientCompany || null,
          prop.title, prop.summary || null, JSON.stringify(prop.scopeOfWork || []), JSON.stringify(prop.deliverables || []),
          JSON.stringify(prop.techStack || []), prop.totalPrice, JSON.stringify(prop.paymentTerms || {}),
          prop.timeline || null, prop.estimatedStartDate || null, prop.status || 'Draft', prop.revisionsCount || 0,
          JSON.stringify(prop.revisionsHistory || []), prop.approvedAt || null, prop.rejectionReason || null,
          prop.createdAt || new Date().toISOString(), prop.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 5. Projects
    if (Array.isArray(adminData.projects)) {
      for (const p of adminData.projects) {
        await client.query(`
          INSERT INTO projects (
            id, name, client_id, client_name, client_email, proposal_id, pic, team_members,
            start_date, deadline, progress_percentage, status, milestones, tasks, revisions,
            files, activity_log, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            pic = EXCLUDED.pic,
            team_members = EXCLUDED.team_members,
            deadline = EXCLUDED.deadline,
            progress_percentage = EXCLUDED.progress_percentage,
            status = EXCLUDED.status,
            milestones = EXCLUDED.milestones,
            tasks = EXCLUDED.tasks,
            revisions = EXCLUDED.revisions,
            files = EXCLUDED.files,
            activity_log = EXCLUDED.activity_log,
            updated_at = EXCLUDED.updated_at
        `, [
          p.id, p.name, p.clientId, p.clientName, p.clientEmail || null, p.proposalId || null,
          p.pic || null, JSON.stringify(p.teamMembers || []), p.startDate || null, p.deadline || null,
          p.progressPercentage || 0, p.status || 'Kickoff', JSON.stringify(p.milestones || []),
          JSON.stringify(p.tasks || []), JSON.stringify(p.revisions || []), JSON.stringify(p.files || []),
          JSON.stringify(p.activityLog || []), p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 6. Invoices
    if (Array.isArray(adminData.invoices)) {
      for (const inv of adminData.invoices) {
        await client.query(`
          INSERT INTO invoices (
            id, invoice_number, project_id, project_name, client_id, client_name, client_email,
            title, type, amount, due_date, status, payment_url, payment_method, paid_at, notes,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            payment_url = EXCLUDED.payment_url,
            payment_method = EXCLUDED.payment_method,
            paid_at = EXCLUDED.paid_at,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at
        `, [
          inv.id, inv.invoiceNumber, inv.projectId || null, inv.projectName || null,
          inv.clientId, inv.clientName, inv.clientEmail || null, inv.title, inv.type,
          inv.amount, inv.dueDate || null, inv.status || 'Menunggu Pembayaran',
          inv.paymentUrl || null, inv.paymentMethod || null, inv.paidAt || null, inv.notes || null,
          inv.createdAt || new Date().toISOString(), inv.updatedAt || new Date().toISOString()
        ]);
      }
    }

    // 7. Activity Logs
    if (Array.isArray(adminData.activityLogs)) {
      for (const log of adminData.activityLogs.slice(0, 50)) {
        await client.query(`
          INSERT INTO activity_logs (id, timestamp, "user", module, action, details)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [
          log.id, log.timestamp || new Date().toISOString(), log.user, log.module, log.action, log.details || null
        ]);
      }
    }
  } catch (err: any) {
    console.error('[PostgreSQL] Error syncing normalized tables:', err.message);
  } finally {
    if (shouldRelease) {
      client.release();
    }
  }
}
