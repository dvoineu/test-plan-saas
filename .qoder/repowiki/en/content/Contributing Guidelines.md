# Contributing Guidelines

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [.eslintrc.json](file://.eslintrc.json)
- [eslint.config.mjs](file://eslint.config.mjs)
- [tsconfig.json](file://tsconfig.json)
- [next.config.ts](file://next.config.ts)
- [postcss.config.mjs](file://postcss.config.mjs)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)
- [playwright.config.ts](file://playwright.config.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [electron/main.ts](file://electron/main.ts)
- [electron/preload.ts](file://electron/preload.ts)
- [electron/tsconfig.json](file://electron/tsconfig.json)
- [src/domain/services/TestRunService.ts](file://src/domain/services/TestRunService.ts)
- [src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts)
- [src/infrastructure/container.ts](file://src/infrastructure/container.ts)
- [src/infrastructure/state/store.ts](file://src/infrastructure/state/store.ts)
- [src/ui/shared/Button.tsx](file://src/ui/shared/Button.tsx)
- [lib/utils.ts](file://lib/utils.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Development Environment Setup](#development-environment-setup)
3. [Development Workflow](#development-workflow)
4. [Code Standards and Linting](#code-standards-and-linting)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Standards](#documentation-standards)
7. [Review Process](#review-process)
8. [Project Structure Conventions](#project-structure-conventions)
9. [Naming Patterns](#naming-patterns)
10. [Architectural Guidelines](#architectural-guidelines)
11. [Issue Reporting and Feature Requests](#issue-reporting-and-feature-requests)
12. [Community Interaction Guidelines](#community-interaction-guidelines)
13. [Types of Contributions](#types-of-contributions)
14. [Debugging and Local Testing](#debugging-and-local-testing)
15. [Troubleshooting Guide](#troubleshooting-guide)
16. [Conclusion](#conclusion)

## Introduction
Thank you for considering a contribution to Test Plan Manager. This document provides comprehensive guidance for contributors, covering development workflow, code standards, testing, documentation, review processes, and project conventions. The project is a Next.js application with optional Electron desktop packaging, uses Drizzle ORM with SQLite for development and PostgreSQL in containers, and includes Playwright E2E tests.

## Development Environment Setup
Follow these steps to prepare your local development environment:
- Install dependencies using the project's package manager scripts.
- Configure environment variables as required by the application (for example, API keys).
- Run the Next.js development server for the web app.
- Optionally run the Electron desktop app locally using the provided script.

Key commands and environment details:
- Install dependencies and run the development server for the web app.
- Run the Electron desktop app locally with automatic Next.js startup.
- Database management commands for schema generation, migration, pushing, and opening the Drizzle Studio GUI.
- Docker and docker-compose configurations for containerized deployment and database services.

Environment and tooling specifics:
- Next.js configuration enables standalone output and sets watch options to exclude development database and Electron files during development.
- PostCSS/Tailwind configuration is provided for styling.
- TypeScript strict mode and path aliases are configured for consistent builds.

**Section sources**
- [README.md:11-47](file://README.md#L11-L47)
- [package.json:7-27](file://package.json#L7-L27)
- [next.config.ts:22-50](file://next.config.ts#L22-L50)
- [postcss.config.mjs:1-10](file://postcss.config.mjs#L1-L10)
- [tsconfig.json:11-31](file://tsconfig.json#L11-L31)

## Development Workflow
Recommended workflow for contributors:
- Fork the repository and create a dedicated feature branch for your work.
- Keep commits focused and atomic; avoid mixing unrelated changes.
- Follow commit message standards to improve readability and automation support.
- Open a pull request early to gather feedback and keep branches aligned with upstream.

Branch management and collaboration:
- Use descriptive branch names indicating the feature or fix.
- Rebase or merge frequently with upstream to minimize conflicts.
- Keep pull requests scoped to a single concern to facilitate review.

Commit message standards:
- Use imperative mood and concise subject lines.
- Reference related issues or PRs when applicable.
- Include a brief body explaining the change and its motivation.

Pull request procedures:
- Provide a clear description of the problem being solved and the proposed solution.
- Link related issues and include screenshots or videos for UI changes.
- Respond promptly to review comments and update the PR accordingly.

[No sources needed since this section provides general guidance]

## Code Standards and Linting
The project enforces code quality through ESLint and TypeScript configurations:
- ESLint configuration extends the Next.js recommended rules and supports modern JavaScript/TypeScript environments.
- TypeScript strict mode is enabled with path aliases and incremental compilation.
- Next.js configuration disables ESLint during builds to speed up CI while still allowing local linting.

Linting and type checking:
- Run the linter to catch style and type issues before committing.
- Ensure TypeScript compilation passes locally to avoid CI failures.
- Use the provided TypeScript configuration for consistent builds across environments.

**Section sources**
- [.eslintrc.json:1-4](file://.eslintrc.json#L1-L4)
- [eslint.config.mjs:1-12](file://eslint.config.mjs#L1-L12)
- [tsconfig.json:11-24](file://tsconfig.json#L11-L24)
- [next.config.ts:5-10](file://next.config.ts#L5-L10)

## Testing Requirements
The project includes Playwright E2E tests and supports local test execution:
- Playwright configuration defines test directory, parallelization, retries, and device targets.
- Tests automatically start the Next.js dev server and run against localhost.
- Use the provided scripts to run tests in headless mode, with UI, or to view reports.

Local testing procedures:
- Run E2E tests using the provided npm scripts.
- Use the UI mode for interactive debugging of failing tests.
- Review HTML reports to analyze test outcomes and traces.

**Section sources**
- [playwright.config.ts:1-45](file://playwright.config.ts#L1-L45)
- [package.json:24-26](file://package.json#L24-L26)

## Documentation Standards
Documentation contributions should:
- Align with the project’s existing structure and terminology.
- Include clear explanations of new features or changes to existing behavior.
- Reference relevant source files and maintain consistency with code examples.

[No sources needed since this section provides general guidance]

## Review Process
Review expectations:
- Pull requests should include sufficient context and rationale for changes.
- Reviewers may request changes; address feedback promptly and update the PR.
- Automated checks (linting, type checking, tests) must pass before merging.

[No sources needed since this section provides general guidance]

## Project Structure Conventions
The project follows a layered architecture with clear separation of concerns:
- app/: Next.js app directory containing API routes and pages.
- src/: Core application code organized by domain, adapters, infrastructure, and UI.
- lib/: Shared utilities and helpers.
- electron/: Electron main process, preload script, and TypeScript configuration.
- Infrastructure and configuration files for database, linting, testing, and building.

Key conventions:
- Path aliases (@/*) simplify imports across the project.
- Domain-driven design separates business logic from infrastructure concerns.
- Dependency injection via a central container manages service lifecycles.

**Section sources**
- [tsconfig.json:26-31](file://tsconfig.json#L26-L31)
- [src/infrastructure/container.ts:1-126](file://src/infrastructure/container.ts#L1-L126)

## Naming Patterns
Follow consistent naming conventions:
- Interfaces prefixed with I (for example, ITestRunRepository).
- Classes use PascalCase and represent domain concepts (for example, TestRunService).
- Files and directories use kebab-case or PascalCase depending on content type.
- Constants and enums use UPPER_SNAKE_CASE where appropriate.

**Section sources**
- [src/domain/services/TestRunService.ts:1-125](file://src/domain/services/TestRunService.ts#L1-L125)
- [src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)

## Architectural Guidelines
Contributors should adhere to the following architectural principles:
- Maintain separation between domain services and infrastructure adapters.
- Use dependency injection to decouple components and enable testability.
- Keep UI components small, reusable, and declarative.
- Ensure database schema changes are managed via Drizzle migrations.

Domain and adapter boundaries:
- Domain services encapsulate business logic and orchestrate operations.
- Adapters abstract external systems (persistence, notifications, LLM providers).
- Infrastructure modules handle configuration, state management, and runtime concerns.

**Section sources**
- [src/domain/services/TestRunService.ts:14-21](file://src/domain/services/TestRunService.ts#L14-L21)
- [src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)
- [src/infrastructure/container.ts:27-91](file://src/infrastructure/container.ts#L27-L91)

## Issue Reporting and Feature Requests
Guidelines for submitting issues and feature requests:
- Search existing issues to avoid duplicates.
- Provide clear descriptions, reproduction steps, and expected vs. actual behavior.
- For feature requests, explain the use case and potential impact.
- Use appropriate labels and assignees when possible.

[No sources needed since this section provides general guidance]

## Community Interaction Guidelines
Community guidelines:
- Be respectful and inclusive in discussions.
- Provide constructive feedback and acknowledge good contributions.
- Use GitHub Discussions or Issues for questions and proposals.

[No sources needed since this section provides general guidance]

## Types of Contributions
Contributions are welcome across areas:
- Bug fixes: Include minimal repro steps and targeted tests.
- Feature additions: Provide design docs, API changes, and migration notes.
- Documentation improvements: Clarify usage, add examples, and update diagrams.
- Performance enhancements: Benchmark changes and document trade-offs.

[No sources needed since this section provides general guidance]

## Debugging and Local Testing
Debugging techniques:
- Use the Next.js dev server with hot reload for rapid iteration.
- Enable DevTools in the Electron main window for desktop debugging.
- Inspect database state using Drizzle Studio or CLI commands.
- Leverage Playwright UI mode for interactive test debugging.

Local testing procedures:
- Run E2E tests locally to validate UI flows and integrations.
- Use database commands to reset or seed data for testing scenarios.
- Verify TypeScript types and ESLint rules locally before committing.

**Section sources**
- [README.md:11-47](file://README.md#L11-L47)
- [electron/main.ts:98-107](file://electron/main.ts#L98-L107)
- [playwright.config.ts:15-19](file://playwright.config.ts#L15-L19)

## Troubleshooting Guide
Common issues and resolutions:
- Database connectivity: Ensure environment variables match the configured provider and credentials.
- Migration errors: Use the provided database commands to generate, migrate, and push schema changes.
- Build failures: Confirm TypeScript strictness and path alias configuration are consistent.
- Electron packaging: Verify main process and preload script compilation and resource paths.

**Section sources**
- [drizzle.config.ts:3-10](file://drizzle.config.ts#L3-L10)
- [package.json:20-23](file://package.json#L20-L23)
- [tsconfig.json:11-31](file://tsconfig.json#L11-L31)
- [electron/main.ts:23-60](file://electron/main.ts#L23-L60)

## Conclusion
By following these guidelines, contributors can efficiently collaborate on Test Plan Manager while maintaining code quality, consistency, and reliability. Thank you for helping improve the project!

[No sources needed since this section summarizes without analyzing specific files]