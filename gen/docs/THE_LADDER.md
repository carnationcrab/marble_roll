# The Ladder — design specification

**Document type:** working concept / creative direction  
**Game:** physics-based marble platformer (HTML prototype: `marble_roll`)  
**Status:** vision document — informs future levels, tone, and mechanics

---

## 1. Working concept

**The Ladder** is a physics-based marble platformer in which the player ascends an impossible corporate skyscraper, climbing from **Intern Basement** to **Executive Penthouse**.

Each level is **literally another rung** on the ladder. The office hierarchy becomes a surreal **vertical obstacle course** — readable as both **comedy** and **progression**.

### Visual and mechanical shorthand

- Cubicles suspended in the clouds  
- Glass elevator shafts as launch tubes  
- Floating conference tables as platforms  
- Spinning pie charts and KPI donuts  
- Collapsing slide decks  
- Printer-paper ramps  

The gag is immediate: corporate life reimagined as a vertical playground.

---

## 2. Core progression structure

Difficulty is **not** framed as “easy / medium / hard.” It is tied to **job titles** and **corporate rank**. That ladder is the backbone of the game.

| World | Corporate rank | Environment (broad stroke) |
|------:|------------------|----------------------------|
| 1 | Intern Basement | Storage rooms, cables, coffee spills |
| 2 | Junior Associate | Cubicle maze |
| 3 | Team Lead | Conference towers |
| 4 | Middle Management | Endless meetings zone |
| 5 | Director | Glass skybridges |
| 6 | VP | Prestige marble surfaces, executive hazards |
| 7 | C-Suite | Absurd floating luxury office |
| **Final** | **CEO Roof Helipad** | Final ascent |

**Design intent:** each promotion should introduce **new mechanics** (or new combinations), not only harder geometry. The title progression is both **funny** and **mechanically clean**.

**How we evaluate hazards:** theme-specific ideas below should be checked against **`gen/docs/LEVEL_DESIGN_AND_PROCEDURE.md`** — skills tested, pairing with traversal situations, agency, and feasibility next to the current procedural pipeline.

---

## 3. Mechanical satire (memorable systems)

These ideas are where the concept becomes distinctive; they are candidates for phased implementation after the core marble loop is stable.

### 3.1 Intern Basement

- Low ceilings, cramped routes, office clutter  

**Hazards and props (examples):**

- Rolling chairs  
- Cords  
- **Coffee puddles** — slippery surfaces (low friction)  
- **Stacks of copy paper** — bounce pads  

### 3.2 KPI rings (checkpoints / scoring)

Instead of traditional checkpoints alone, the player passes through **large rotating KPI rings**.

**Examples of ring labels:**

- Productivity %  
- Engagement score  
- Quarterly targets  

**Gameplay hook:** missing a ring might cost a **time bonus** or **score multiplier** — metrics become **literal hoops** to jump through.

### 3.3 PowerPoint collapse platforms

Platforms **animate and disappear** like slide transitions:

- Wipe  
- Dissolve  
- Fly in from left  

Genuinely funny and highly gameable timing puzzles.

### 3.4 Meeting rooms as puzzle zones

- Conference tables as **giant floating islands**  
- Office chairs as **orbiting moving hazards**  
- Laser pointers as **sweeping hazard beams**  

---

## 4. Tone direction

**Target:** stylish satire, **not** mean-spirited satire.

- The world should feel **absurd** but still **fun**.  
- Reference tone: **more** “The Office meets Portal” than bleak anti-work cynicism.  
- The player is **not suffering** — they are **gleefully climbing**.

---

## 5. Narrative hook (lightweight)

A simple framing line can carry a lot:

> “Congratulations on your promotion. Please proceed upward.”

Each completed level can unlock an **absurdly inflated** new title, for example:

- Assistant to the Regional Something  
- Senior Synergy Architect  
- Director of Vertical Alignment  
- VP of Strategic Momentum  

This adds **flavour** without a heavy story or cutscene pipeline.

---

## 6. Artistic direction

Because the building is surreal, **it does not need to obey real-world physics or architecture**. The higher the player climbs, the **less realistic** the spaces may become.

**Progression of look and feel:**

| Phase | Visual language |
|-------|------------------|
| Start | Beige office carpets, fluorescent lights |
| Mid | Glass, skybridges, floating structures |
| End | Marble floors, impossible Escher-like staircases, floating glass offices in cloudscapes, golden helipad / “throne room” energy |

The climb becomes increasingly **dreamlike**. That transformation can mirror **career ambition** without preaching — show, don’t tell.

---

## 7. Relation to the technical prototype

The current `marble_roll` build implements a **minimal technical slice** (static levels, physics marble, camera orbit, goals, fall death). This document does **not** require immediate implementation; it defines **direction** for:

- Level theming and ordering  
- Future hazard types and materials  
- UI copy (titles, promotions)  
- Art pass priorities  

When technical features (materials, moving bodies, triggers) land, map them back to the **Corporate Rank** table and the **mechanical satire** list above.

---

## 8. Revision history

| Version | Date | Notes |
|---------|------|--------|
| 1 | 2026-03-29 | Initial working concept captured from design brief |
| 2 | 2026-03-29 | Pointer to **`LEVEL_DESIGN_AND_PROCEDURE.md`** for evaluating themed hazards |
