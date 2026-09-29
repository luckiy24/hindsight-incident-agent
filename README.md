# CausalOps — Causal Incident Memory & Response System

> AI-assisted incident-response system that constructs and maintains a **causal memory of production incidents**: what happened, what intervention was attempted, whether it worked, under what conditions it worked, and what side effects occurred.

---

## 1. Problem

Traditional incident-response systems and post-mortem repositories merely store text logs and search for superficially similar incidents. However, in distributed software production environments:

- **Similar symptoms do not imply the same root cause** (e.g. database connection exhaustion can be caused by traffic spikes, unindexed queries, or an application-level handle leak).
- **Intervention failures are forgotten**: Teams frequently repeat failed actions (such as restarting pods or scaling capacity) because historical records only highlight what eventually fixed the issue.
- **Operating conditions are unlinked**: An intervention that succeeds during a transient deadlock will fail catastrophically during an active connection leak.

---

## 2. Solution

**CausalOps** creates a structured causal operational memory connecting:

```text
incident
  ├── conditions (e.g. recent deployment, connection growth)
  ├── symptoms (e.g. DB saturation, latency spikes, 504 timeouts)
  ├── causes (e.g. unclosed ORM session handles)
  ├── interventions (e.g. rollback, restart, capacity scale)
  ├── outcomes (e.g. successful in 28s, temporary recovery, failed)
  └── learnings (e.g. "scaling DB does not resolve code connection leaks")
```

When a new incident occurs, CausalOps:
1. Ingests incident telemetry.
2. Builds a structured incident state.
3. Searches historical memory using a 5-factor contextual relevance algorithm.
4. Visualizes the suspected causal chain with interactive React Flow graph.
5. Evaluates counterfactual interventions against past successes AND failures.
6. Enforces mandatory human approval before simulated dry-run execution.
7. Simulates recovery progression in real-time.
8. Automatically writes post-incident learnings back into operational memory.

---

## 3. Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       CAUSALOPS UI                          │
│     Next.js 14 App Router + Tailwind CSS + Lucide Icons     │
├──────────────────────────────┬──────────────────────────────┤
│ Interactive React Flow Graph │ Recharts Telemetry Trends    │
├──────────────────────────────┼──────────────────────────────┤
│ Counterfactual Reasoning     │ Human-in-the-Loop Approval   │
└──────────────────────────────┴──────────────────────────────┘
                              │
                    Next.js API Layer
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
  Contextual Relevance    AI Engine            Prisma ORM
   Scoring Algorithm   OpenAI + Fallback       SQLite DB
                              │                    │
                    Operational Memory     Causal Graphs &
                    & Learned Rules        Decision Ledger
```

### Contextual Relevance Scoring Algorithm

For any candidate historical intervention, relevance to current incident state is computed as:

$$\text{Relevance} = 0.35 \cdot S_{\text{conditions}} + 0.20 \cdot S_{\text{service}} + 0.15 \cdot S_{\text{deployment}} + 0.20 \cdot S_{\text{causal}} + 0.10 \cdot R_{\text{recency}}$$

Normalized strictly between `0.00` and `1.00`.

---

## 4. Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Mission-critical SRE dark console aesthetic)
- **Database**: SQLite
- **ORM**: Prisma
- **Graph Visualization**: React Flow (`reactflow`)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod
- **AI Engine**: OpenAI API (`gpt-4o-mini`) with built-in deterministic causal fallback

---

## 5. Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Synchronize database schema
npx prisma db push

# 4. Seed operational database (8 incidents, 12 interventions, 8 learned rules)
npm run seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Demo Walkthrough (The INC-1042 Scenario)

1. **Step 1 — Overview Dashboard**:
   - Open `http://localhost:3000`.
   - See top flashing alert: `CRITICAL ALERT: SEV-1 INCIDENT INC-1042`.
   - Review KPI cards: MTTR (4.2m), 8 successful interventions, 4 failed interventions preserved in memory, 8 active operational rules.
   - Click **"Investigate Incident"**.

2. **Step 2 — Incident Console & Causal Chain**:
   - Telemetry shows: Error Rate **37% ↑**, P95 Latency **4.8s ↑**, DB Connections **96% ↑**, Trigger: `checkout v4.7.2`.
   - The interactive React Flow causal chain visualizes:
     $$\text{checkout v4.7.2} \to \text{connection leak} \to \text{DB connection exhaustion} \to \text{query latency} \to \text{checkout timeout} \to \text{payment failures}$$
   - Click on any node to view entity role, telemetry verification, and blast radius.

3. **Step 3 — Run AI Causal Analysis**:
   - Click **"Analyze Incident"**.
   - The AI engine generates:
     - Suspected root cause with confidence score (**0.94**).
     - Epistemic uncertainty bounds.
     - Contextual relevance scores across historical incidents.

4. **Step 4 — Historical Operational Memory**:
   - 3 relevant incidents retrieved:
     - `INC-0981`: **Rollback checkout deployment** (✓ Successful, MTTR 4m 12s, Relevance 0.94).
     - `INC-0873`: **Restart pods** (⚠ Temporary recovery, recurred in 11 minutes).
     - `INC-0762`: **Scale database** (✕ Failed, leak consumed added capacity).

5. **Step 5 — Counterfactual Comparison**:
   - Inspect the 4 intervention branches: **Rollback**, **Restart**, **Scale DB**, and **Do Nothing**.
   - Notice safety disclaimers: system uses probabilistic language (*"historical evidence suggests"*, *"estimated"*).

6. **Step 6 — Human-in-the-Loop Approval & Dry-Run Simulation**:
   - Click **"Review rollback"**.
   - The **APPROVAL REQUIRED** modal displays proposed action, causal rationale, risk assessment (`LOW`), and safety guarantee.
   - Click **"[ Approve & Simulate ]"**.
   - Real-time simulation ticker streams:
     ```text
     14:41:03 Rollback initiated
     14:41:05 Pods terminating
     14:41:12 New version healthy
     14:41:19 Error rate decreasing
     14:41:31 Recovery confirmed: 28 seconds
     ```

7. **Step 7 — Incident Resolution & Operational Learning**:
   - Incident state transitions to **RESOLVED** (error rate drops to 0.2%, latency to 185ms).
   - **Post-Incident Learning Engine** synthesizes a new operational rule:
     ```json
     {
       "rule": "Rollback is effective when checkout deployment is followed by rapid DB connection growth.",
       "conditions": ["recent deployment", "connection growth", "checkout latency increase"],
       "negative_conditions": ["database-only saturation"],
       "confidence": 0.88
     }
     ```
   - Rule is persisted in the database and audit record is committed to the **Decision Ledger**.

---

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | List all production incidents |
| `GET` | `/api/incidents/:id` | Fetch incident state, telemetry, and causal edges |
| `POST` | `/api/incidents` | Create a new incident |
| `POST` | `/api/incidents/:id/analyze` | Run AI analysis with historical memory matching |
| `GET` | `/api/memory` | Retrieve scored historical intervention experiences |
| `GET` | `/api/memory/:id` | Get individual memory card details |
| `GET` | `/api/graph/:incidentId` | Get React Flow node and edge definitions |
| `GET` | `/api/interventions` | List interventions catalog |
| `POST` | `/api/interventions/:id/simulate` | Execute dry-run simulation and update memory |
| `GET` | `/api/decisions` | Audit log of human approvals & execution outcomes |
| `POST` | `/api/decisions` | Create decision record |
| `GET` | `/api/learnings` | List extracted operational rules |
| `POST` | `/api/learnings` | Save post-incident learning rule |

---

## 8. Safety & Simulation Policy

CausalOps explicitly **does not modify cloud infrastructure, execute shell commands, or perform autonomous remediation**. All actions are executed against a safe dry-run simulation sandbox to evaluate cognitive reasoning without risk to production environments.
