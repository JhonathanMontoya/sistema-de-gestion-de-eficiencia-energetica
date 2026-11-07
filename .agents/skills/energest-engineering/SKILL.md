---
name: energest-engineering
description: Plan, design, implement, or review changes in the EnerGest application across its React interface, Express API, MongoDB data model, security boundaries, and user experience.
---

# EnerGest engineering

Use this skill for changes to this repository. First inspect the relevant current code and documentation; treat code as authoritative when it conflicts with stale notes. Keep the app's existing Spanish product language and preserve the user’s requested scope.

## Project shape

- Frontend: React 19, Vite, React Router, Axios, plain JSX/CSS. Entry is `frontend/src/main.jsx`; routes are in `frontend/src/App.jsx`; API client and bearer-token injection are in `frontend/src/services/api.js`; auth state is in `frontend/src/context/AuthContext.jsx`.
- Backend: Express 4 and Mongoose 8, CommonJS. `backend/server.js` sets middleware and mounts routes; `backend/routes` declares endpoints and auth/role checks; `backend/controllers` implements request behavior; `backend/models` defines MongoDB documents.
- Domain: user accounts with `cliente`, `analista`, and `administrador` roles; personal devices and consumption readings; public/admin editorial content; registration-domain configuration; administrative audit records. Read `README.md` and `docs/contrato-api-frontend.md` when touching product scope or API behavior.
- UI routes include public Inicio, Login/Register, protected Consumo and Dispositivos, and Administrar. The public/editorial and admin portal are implemented in `frontend/src/pages/PortalEnergest.jsx`.
- Device estimates use watts × daily hours / 1000 for kWh/day. Usage readings derive kWh from device watts and recorded hours. Preserve units and communicate estimates as estimates.

## Work across layers

1. Identify the user need, affected role, route, data ownership, and expected empty, loading, success, validation, and failure states. Ask only when a missing product rule materially changes behavior.
2. Trace the existing path from UI to Axios service, API route, middleware, controller, and model before editing. Keep route authorization in the backend; frontend route guards are usability, not security.
3. Preserve the API contract. When a request/response or validation rule changes, update both the backend and frontend and revise `docs/contrato-api-frontend.md` where it describes the affected behavior.
4. Keep each user’s devices and readings scoped by the authenticated user ID. Admin-only operations must have server-side role checks and should retain audit behavior where applicable. Never accept a role or owner identity from untrusted client input as authorization.
5. Follow the repository’s existing patterns and avoid adding architectural layers, dependencies, or broad refactors unless the requested change needs them. Keep business rules out of presentation markup when an existing controller/service/domain utility is the natural home.

## UX and accessibility

- Match the existing EnerGest visual language and Spanish terminology. Prefer clear labels, explicit units, helpful examples, and understandable validation messages over placeholder-only instructions.
- Design the whole interaction: keyboard operation, visible focus, semantic headings and controls, labelled inputs, accessible status/error announcements, responsive layout, and reduced-motion behavior.
- For dialogs and destructive actions, preserve clear cancellation, confirmation, and feedback. For data screens, handle no data, loading, failed requests, and stale or unavailable related records.
- Avoid implying measured precision where values are estimated. State the period and unit on consumption summaries and charts.

## Validation

- Follow the user’s verification request. If asked to verify, prefer the narrow relevant checks: `npm.cmd run lint` and `npm.cmd run build` in `frontend`, and focused API/manual-flow checks for backend behavior. Do not claim checks were run if they were not.
- Review `git diff` for scope, secrets, accidental generated files, and consistency across affected layers. Never inspect or expose `.env` values; use `.env.example` as the configuration reference.
- Do not run production-data scripts or change shared Atlas data unless the user explicitly asks for that specific operation.
