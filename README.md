# 2Gether

2Gether is a social sports platform designed to encourage real-world social interaction by helping people find others to play team sports with. People may want to play football, basketball, volleyball, or another team sport but struggle to find enough participants or an available venue. 2Gether aims to help users discover and organize events, connect with other players, and, as the product develops, reserve sports facilities.

The platform serves two primary audiences:

- **Sports participants** who want to discover events, meet other players, organize matches, and take part in team sports.
- **Sports facility owners** who need tools to manage venue availability and bookings.

The social purpose is central: the product is intended to help people meet and play together, not just list facilities or events.

## Product Features and Status

The repository currently contains TypeScript service-layer functionality and tests, rather than a deployed web or mobile application. Implemented functionality below is implemented at service level and verified by automated tests; it should not be read as evidence of a production deployment or user interface.

| Jira epic | Issue | Status in this repository |
| --- | --- | --- |
| **User Management & Profiles** | KAN-7 — User Registration | Implemented and tested: validates and normalizes email, hashes passwords with scrypt, and stores accounts in memory. |
| | KAN-8 — User Login | Implemented and tested: verifies credentials and creates in-memory sessions. |
| | KAN-9 — User Profile Management | Implemented and tested: creates, reads, and updates profiles for existing users; supports optional HTTPS profile-picture URLs. |
| **Sports Events & Reservations** | KAN-10 — Browse Sports Events | Implemented and tested: lists upcoming events, with sport and location filters. |
| | KAN-11 — Create Sport Event | Implemented and tested: validates and stores event details in memory. |
| | KAN-12 — Join Sports Event | Implemented and tested: joins and leaves events while enforcing capacity and start-time rules. |
| **App for Sports Facilities Owners** | KAN-13 — Register Sports Facility | Planned; no facility registration implementation is present. |
| | KAN-14 — Manage Facility Availability | Planned; no facility availability implementation is present. |
| | KAN-15 — Manage Facility Bookings | Planned; no facility booking implementation is present. |

KAN-16 adds a SQLite schema migration for user accounts and profiles, but the application does not yet connect to a database: runtime accounts, profiles, events, and sessions use in-memory repositories. The project is therefore a tested backend prototype, not a complete end-user application. Facility-owner workflows remain future development.

## Technology Stack

| Area | Technology and current use |
| --- | --- |
| Language and runtime | TypeScript on Node.js; ES modules and strict TypeScript checking. CI uses Node.js 22. |
| Application framework | No web or mobile application framework is configured. |
| Dependencies | Vitest for tests; Vite is present as a development dependency but no build script is configured. Password hashing and UUID generation use Node.js built-ins. |
| Data storage | In-memory repositories for current runtime behavior. A standalone SQLite migration defines user and profile tables; there is no configured database connection, ORM, or migration runner. |
| Package manager | npm, with the dependency lockfile in `package-lock.json`. |
| CI | GitHub Actions workflow at `.github/workflows/ci.yml`; it runs for pull requests targeting `main`. |

## Getting Started

### Prerequisites

- Node.js 22 or later.
- npm (bundled with Node.js).
- Git.

### Setup

Clone the repository and install the locked dependencies:

```sh
git clone https://github.com/pingvinoOP/2Gether.git
cd 2Gether
npm ci
```

There is no `.env` configuration or application server command at this stage. The repository contains service modules and tests, not a runnable web/mobile interface. No credentials or database connection settings are needed.

### Available commands

```sh
npm test           # Run unit and schema tests
npm run typecheck  # Type-check the TypeScript source and tests
```

There is currently no build, lint, or start script. User and event data held by in-memory repositories is lost when the process exits.

## Repository Structure

```text
.github/workflows/   GitHub Actions CI workflow
database/migrations/ Standalone SQLite schema migration
docs/                Feature and database documentation
src/                 TypeScript service modules and in-memory repositories
  sports-events/     Event creation, browsing, and participation
  user-login/        Login and in-memory sessions
  user-management/   Account/profile types and profile management
  user-registration/ Registration and in-memory user repository
tests/               Vitest unit tests and SQLite schema tests
package.json         npm scripts and dependency manifest
package-lock.json    Locked npm dependency versions
tsconfig.json        TypeScript compiler configuration
```

## Project Management with Jira

The team uses Jira with a Kanban methodology. The workflow is:

**Concept → Assessment → To Do → In Progress → In Review → Done**

| Status | Meaning |
| --- | --- |
| **Concept** | Initial ideas and proposed work. |
| **Assessment** | Requirements analysis, estimation, and prioritization. |
| **To Do** | Approved, prioritized work ready for implementation. |
| **In Progress** | Active development. |
| **In Review** | A Pull Request is open and undergoing review and validation. |
| **Done** | Work is completed and accepted, or the issue is formally closed with a documented resolution. |

The Jira board uses Work In Progress (WIP) limits to constrain how many issues should be active in a workflow column at once. The board configuration and its numeric limits are not available in this repository, so this README does not state unverified values; consult the Jira board for the current limits.

### Issue types and estimation

- **Epic:** A broad objective grouping related work, such as User Management & Profiles.
- **Story:** A user-facing requirement, commonly written as “As a [user], I want [functionality], so that [benefit].” Acceptance criteria make the expected behavior observable and testable.
- **Task:** A defined piece of technical or project work that may not describe an end-user capability.
- **Bug:** A reported defect in existing or expected behavior.
- **Subtask:** A smaller, traceable piece of work belonging to a Story, Task, or other parent issue.

Story Points express relative complexity, effort, and uncertainty, not a number of working hours. User Login (KAN-8) is the 2-point baseline. Other Stories are estimated in relation to that reference: work expected to be simpler receives fewer points, and work with more complexity or uncertainty receives more.

## Jira and GitHub Workflow

GitHub is connected to Jira using GitHub for Atlassian. The team’s ticket-to-code workflow is:

1. Select and assess a Jira ticket.
2. Move it to **To Do**, then **In Progress** when implementation begins.
3. Create a dedicated Git branch containing the Jira key.
4. Implement the ticket’s changes.
5. Commit with the Jira key in the commit message.
6. Open a Pull Request (PR) targeting `main`.
7. Move the Jira ticket to **In Review**.
8. Review the PR and validate its checks.
9. Merge the PR into `main`.
10. Move the Jira ticket to **Done**.

For example, KAN-9 was implemented on `KAN-9-user-profile-management`, committed with a KAN-9-prefixed message, and delivered through [PR #7](https://github.com/pingvinoOP/2Gether/pull/7).

```text
Branch:       KAN-9-user-profile-management
Commit:       KAN-9 Implement user profile management
Pull Request: KAN-9 User Profile Management
```

After the initial repository commit, the project history shows feature changes being delivered through Pull Requests rather than committed directly to `main`. Jira transitions are part of the documented team workflow; automated status transitions are not claimed here.

## Continuous Integration — KAN-17

GitHub Actions runs the `CI` workflow when a Pull Request targets `main`. The workflow checks out the code, sets up Node.js 22 with npm dependency caching, installs dependencies with `npm ci`, runs `npm run typecheck`, and runs `npm test`. The workflow has read-only `contents` permission.

Results appear in the Pull Request’s **Checks** tab. A failed command fails the CI check and exposes its logs; contributors should fix the failure and push an update. There are no build or lint scripts in the repository, so CI does not run separate build or lint steps.

KAN-17 was merged through [PR #8](https://github.com/pingvinoOP/2Gether/pull/8). Its CI workflow has completed successfully on that PR; future PRs targeting `main` are configured to run it as well.

## Development Progress and Backlog

The initial MVP scope focuses on user accounts, authentication, profiles, and sports-event discovery and organization. The corresponding service-level features and tests are present. Facility-owner registration, availability management, and bookings are planned work, not operational features.

Kanban tracks both completed work and future priorities. Jira issues may intentionally remain in the backlog until they are ready; they do not all need to be in **Done** for the board to represent the project accurately.

## Quality Assurance and Bug Management

The team’s defect workflow is to report a defect, investigate it during **Assessment**, attempt to reproduce it, implement a fix if confirmed, validate the fix, link the relevant Pull Request, and close the issue with an appropriate documented resolution.

- A **confirmed defect** is reproducible and has evidence of behavior that violates requirements; it is fixed and validated before closure.
- A **deferred issue** is understood but deliberately postponed, with its reason recorded; it remains open or is otherwise tracked according to the project’s Jira process.
- A **non-reproducible report** cannot be reproduced with the available information or environment; record what was attempted and request details rather than claiming a fix.

These steps describe the project process; this README does not claim that a specific bug has been reported or fixed.

## Project Links

- **GitHub repository:** [pingvinoOP/2Gether](https://github.com/pingvinoOP/2Gether)
- **Jira project:** The project key is `KAN`, but the Jira project URL is not present in this repository or available in the current project configuration. Add the verified project URL here when available; no Jira URL is fabricated.

## Further Documentation

- [User Registration](docs/user-registration.md)
- [User Login](docs/user-login.md)
- [User Profile Management](docs/user-profile-management.md)
- [Browse Sports Events](docs/browse-sports-events.md)
- [Create Sports Event](docs/create-sports-event.md)
- [Join and Leave Sports Events](docs/join-sports-event.md)
- [Database Configuration](docs/database-configuration.md)
