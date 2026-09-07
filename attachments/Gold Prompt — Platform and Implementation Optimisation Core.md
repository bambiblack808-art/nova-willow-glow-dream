# PLATFORM OPTIMISATION CORE

Design and implement the North Star architecture **Linux-first**.

## PRIMARY TARGET

**Ubuntu LTS / modern Linux**

Treat Linux as the canonical development, testing, deployment, container, automation, and production environment.

Support:

**x86_64 + ARM64**

## APPLE SILICON

Provide first-class compatibility with Apple Silicon through:

**Metal / MLX**

MLX is an acceleration backend, not the architectural foundation.

The inference abstraction must permit:

`CPU → Metal/MLX → CUDA → Remote GPU → Cloud`

without changing application-level ontology or routing logic.

---

# LANGUAGE SELECTION

Use the smallest set of languages capable of delivering the highest system leverage.

### Python
Primary language for:

- AI orchestration
- ontology
- agents
- experimentation
- data processing
- graph analysis
- model integration
- research
- automation

### Rust
Use selectively for:

- high-throughput services
- performance-critical pipelines
- system utilities
- concurrency
- resource-efficient services
- security-sensitive low-level components

### TypeScript
Use only where a browser/UI/control surface materially improves capability.

Do not create a second application architecture merely for presentation.

---

# IMPLEMENTATION PRINCIPLE

Optimise:

**maximum capability / minimum complexity**

Specifically minimise:

- dependencies
- moving parts
- duplicate logic
- language count
- infrastructure cost
- network dependence
- token usage
- latency
- memory use
- energy use
- operational burden

while maximising:

- reuse
- composability
- observability
- portability
- reversibility
- automation
- capability extraction
- compounding effects

---

# ARCHITECTURAL PRIORITY

Prefer:

**standard library > existing dependency > new dependency**

and:

**local computation > remote computation**

when capability, cost, privacy, and latency justify it.

Prefer:

**small model → larger model**

only when the smaller model is insufficient.

Prefer:

**deterministic code → agentic reasoning**

where deterministic logic is sufficient.

Prefer:

**one reusable primitive → many specialised implementations**

---

# HARDWARE ABSTRACTION

Create one hardware capability layer:

`/HARDWARE.STATUS`

`/HARDWARE.CAPACITY`

`/HARDWARE.ACCELERATOR`

`/HARDWARE.THERMAL`

`/HARDWARE.MEMORY`

`/HARDWARE.COMPUTE`

`/HARDWARE.ROUTE`

The Router determines the best execution target based on:

**capability × latency × cost × availability × energy × privacy**

---

# RESOURCE-AWARE EXECUTION

Every significant workload should be capable of answering:

`WHY THIS MODEL?`

`WHY THIS DEVICE?`

`WHY THIS ROUTE?`

`WHY THIS DEPENDENCY?`

`WHY THIS COST?`

`WHY NOW?`

If a cheaper or simpler route produces equivalent sufficient capability, prefer it.

---

# TOKEN EFFICIENCY

Treat context and tokens as computational resources.

Optimise:

**meaning / token**

Use:

- canonical vocabulary
- compact schemas
- structured state
- indexed retrieval
- summaries
- deltas
- reusable instructions
- programmatic state rather than repeated prose

Do not repeatedly send information that already exists in canonical state.

---

# COMMAND EFFICIENCY

Commands should be:

**short + composable + deterministic + auditable**

Example:

`/WASTE.SCAN → /CAPABILITY.SCAN → /COMPOUND.SCAN → /TINKA.NEXT`

Avoid verbose command syntax where semantics remain unambiguous.

---

# STATE EFFICIENCY

Do not place everything into one context window.

Separate:

`STATIC`

`PERSISTENT`

`RUNTIME`

`EPHEMERAL`

Retrieve only what is required for the current operation.

---

# DEPENDENCY PRINCIPLE

Every dependency must justify itself through measurable capability.

Maintain:

`dependency → capability → cost → risk → replacement`

Remove dependencies whose capability can be reproduced more simply or safely.

---

# DEVELOPMENT DEFAULT

Canonical local stack:

**Ubuntu/Linux  
Python  
Rust  
Git  
containers  
SQLite/PostgreSQL as justified  
local filesystem/object storage as justified  
Open-source models where sufficient  
MLX on Apple Silicon  
CUDA when available  
remote cloud only when local capacity is insufficient**

Do not over-engineer the first implementation.

Start as a **modular monolith** where possible.

Extract services only when measurable constraints justify extraction.

---

# FINAL OPTIMISATION RULE

At every architectural decision evaluate:

> **What is the smallest implementation that creates the greatest durable increase in capability?**

Then evaluate:

> **Does this capability compound?**

Then:

> **Can the same mechanism unlock multiple future capabilities?**

The preferred solution is therefore not the one with the most features.

It is the one with the greatest:

**CAPABILITY DENSITY**

defined as:

**useful capability created / complexity introduced**

The North Star system must continuously maximise capability density.