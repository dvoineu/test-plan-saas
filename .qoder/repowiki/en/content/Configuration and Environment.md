# Configuration and Environment

<cite>
**Referenced Files in This Document**
- [next.config.ts](file://next.config.ts)
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)
- [package.json](file://package.json)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [IntegrationSettingsService.ts](file://src/domain/services/IntegrationSettingsService.ts)
- [DrizzleSettingsRepository.ts](file://src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts)
- [JiraAdapter.ts](file://src/adapters/issue-tracker/JiraAdapter.ts)
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)
- [route.ts](file://app/api/settings/integrations/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains how the application loads and validates configuration, how environment variables are used, and how runtime configuration options are applied. It covers the configuration hierarchy from environment variables to application defaults, security considerations for API keys and sensitive data, dependency injection container configuration and service registration patterns, configuration-driven service selection, Next.js configuration options and build optimizations, and deployment-specific settings for development, staging, and production. It also includes examples of environment configurations and guidance for validating and troubleshooting configuration issues.

## Project Structure
The configuration system spans several layers:
- Next.js configuration defines build-time and runtime behavior.
- A centralized configuration object consolidates environment variables into typed groups.
- A dependency injection container registers services and adapters, wiring them to configuration and persisted settings.
- Drizzle ORM configuration reads database provider and credentials from environment variables.
- Docker and docker-compose define production and local orchestration settings.
- API routes and adapters demonstrate runtime configuration usage and error handling.

```mermaid
graph TB
subgraph "Next.js Build/Runtime"
NC["next.config.ts"]
PKG["package.json scripts"]
end
subgraph "Infrastructure"
CFG["src/infrastructure/config.ts"]
CTN["src/infrastructure/container.ts"]
DCFG["drizzle.config.ts"]
end
subgraph "Domain & Adapters"
ISS["src/domain/services/IntegrationSettingsService.ts"]
LLMF["src/adapters/llm/LLMProviderFactoryAdapter.ts"]
JIRA["src/adapters/issue-tracker/JiraAdapter.ts"]
DS["src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts"]
end
subgraph "Deployment"
DKR["Dockerfile"]
DCOM["docker-compose.yml"]
end
subgraph "API Layer"
APIH["app/api/_lib/withApiHandler.ts"]
APIR["app/api/settings/integrations/route.ts"]
end
NC --> CTN
PKG --> NC
CFG --> CTN
CFG --> DCFG
CFG --> LLMF
ISS --> DS
LLMF --> DS
LLMF --> CFG
JIRA --> ISS
APIR --> ISS
APIH --> APIR
DKR --> NC
DCOM --> DKR
```

**Diagram sources**
- [next.config.ts](file://next.config.ts)
- [package.json](file://package.json)
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [IntegrationSettingsService.ts](file://src/domain/services/IntegrationSettingsService.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [DrizzleSettingsRepository.ts](file://src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts)
- [JiraAdapter.ts](file://src/adapters/issue-tracker/JiraAdapter.ts)
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)
- [route.ts](file://app/api/settings/integrations/route.ts)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)

**Section sources**
- [next.config.ts](file://next.config.ts)
- [package.json](file://package.json)
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)

## Core Components
- Centralized configuration object: Consolidates environment variables into typed groups for database, LLM, storage, and app settings.
- Dependency injection container: Registers repositories, adapters, and services, wiring them to configuration and persisted settings.
- Configuration-driven service selection: The LLM provider factory chooses providers based on persisted settings or defaults.
- Next.js configuration: Controls strict mode, ESLint and TypeScript behavior, remote image patterns, output mode, transpilation, and Webpack watch options.
- Drizzle configuration: Selects dialect and credentials based on environment variables.
- Deployment configuration: Dockerfile sets production environment and runtime command; docker-compose orchestrates app and database services.

**Section sources**
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [next.config.ts](file://next.config.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)

## Architecture Overview
The configuration architecture follows a layered approach:
- Environment variables feed a centralized configuration object.
- The container uses configuration defaults and persisted settings to instantiate services and adapters.
- Next.js and Drizzle consume environment variables for build/runtime behavior and database connectivity.
- API routes and adapters validate and apply configuration at runtime, with standardized error handling.

```mermaid
sequenceDiagram
participant Env as "Environment Variables"
participant Cfg as "Centralized Config"
participant Ctn as "IoC Container"
participant LLMF as "LLMProviderFactoryAdapter"
participant Repo as "DrizzleSettingsRepository"
participant App as "Next.js App"
Env->>Cfg : "Load DB_PROVIDER, DATABASE_URL,<br/>LLM_PROVIDER, LLM_API_KEY,<br/>FILES_PATH, APP_URL, NODE_ENV"
Cfg-->>Ctn : "Provide defaults and typed config"
Ctn->>LLMF : "Instantiate with settingsRepo"
LLMF->>Repo : "Read persisted settings (llm_provider, llm_model, llm_base_url, llm_api_key)"
Repo-->>LLMF : "Resolved values or defaults"
Ctn->>App : "Expose services/adapters via named exports"
```

**Diagram sources**
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [DrizzleSettingsRepository.ts](file://src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts)

## Detailed Component Analysis

### Centralized Configuration
The centralized configuration consolidates environment variables into typed groups:
- Database: provider, URL, and path with sensible defaults.
- LLM: provider, API key fallbacks, base URL, and model with defaults.
- Storage: file path with a default inside the project directory.
- App: URL and environment with defaults.

Security considerations:
- API keys are loaded from environment variables and can fall back to legacy keys for compatibility.
- Sensitive data should never be logged or exposed; the API error handler centralizes error responses.

**Section sources**
- [config.ts](file://src/infrastructure/config.ts)

### Dependency Injection Container
The container lazily initializes a singleton via a global scope to avoid duplication in Next.js App Router contexts. It wires:
- Repositories for persistence.
- External adapters (storage, Jira, Slack, webhooks, LLM provider factory).
- Domain services (project, test plan, test run, attachment, dashboard, report, database, integration settings, AI services).

The container reads the file storage path from environment variables and passes it to the storage adapter. Integration settings are resolved via the IntegrationSettingsService, which reads from the DrizzleSettingsRepository.

```mermaid
classDiagram
class Container {
+projectRepo
+settingsRepo
+moduleRepo
+testCaseRepo
+testRunRepo
+testResultRepo
+attachmentRepo
+dashboardRepo
+storageProvider
+jiraAdapter
+slackNotifier
+webhookDispatcher
+llmProviderFactory
+integrationSettingsService
+projectService
+aiTestGenerationService
+testPlanService
+testRunService
+aiBugReportService
+attachmentService
+dashboardService
+reportService
+databaseService
}
class LLMProviderFactoryAdapter {
+create() ILLMProvider
}
class IntegrationSettingsService {
+getSettings() Map
+updateSettings(data) void
}
class DrizzleSettingsRepository {
+get(key) string?
+set(key,value) void
+getAll(keys) Map
}
Container --> LLMProviderFactoryAdapter : "instantiates"
Container --> IntegrationSettingsService : "instantiates"
LLMProviderFactoryAdapter --> DrizzleSettingsRepository : "uses"
```

**Diagram sources**
- [container.ts](file://src/infrastructure/container.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [IntegrationSettingsService.ts](file://src/domain/services/IntegrationSettingsService.ts)
- [DrizzleSettingsRepository.ts](file://src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts)

**Section sources**
- [container.ts](file://src/infrastructure/container.ts)
- [IntegrationSettingsService.ts](file://src/domain/services/IntegrationSettingsService.ts)
- [DrizzleSettingsRepository.ts](file://src/adapters/persistence/drizzle/DrizzleSettingsRepository.ts)

### Configuration-Driven Service Selection
The LLM provider factory selects the appropriate adapter based on persisted settings or centralized configuration defaults:
- Provider resolution order: persisted setting overrides centralized config.
- Model and base URL are resolved similarly.
- Default provider is Gemini when no persisted setting exists.

This pattern enables runtime configuration changes without redeployment.

```mermaid
flowchart TD
Start(["create()"]) --> GetProv["Read persisted 'llm_provider' or use config default"]
GetProv --> CheckOllama{"Provider == 'ollama'?"}
CheckOllama --> |Yes| MakeOllama["Construct OllamaAdapter with base URL and model"]
CheckOllama --> |No| CheckOpenRouter{"Provider == 'openrouter'?"}
CheckOpenRouter --> |Yes| MakeOpenRouter["Construct OpenRouterAdapter with API key and model"]
CheckOpenRouter --> |No| CheckOpenAICompat{"Provider == 'openai-compatible'?"}
CheckOpenAICompat --> |Yes| MakeOpenAI["Construct OpenAICompatibleAdapter with base URL and API key"]
CheckOpenAICompat --> |No| MakeGemini["Construct GeminiAdapter with API key and model (default)"]
MakeOllama --> End(["Return ILLMProvider"])
MakeOpenRouter --> End
MakeOpenAI --> End
MakeGemini --> End
```

**Diagram sources**
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [config.ts](file://src/infrastructure/config.ts)

**Section sources**
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [config.ts](file://src/infrastructure/config.ts)

### Next.js Configuration Options and Build Optimizations
Key configuration highlights:
- Strict mode enabled for React components.
- ESLint ignores build-time errors; TypeScript build errors are not ignored.
- Remote image patterns allow fetching images from a specific host.
- Output mode is set to standalone for containerized deployments.
- Transpiles Motion for compatibility.
- Webpack watch options adjust file watching behavior in development and exclude specific paths.

Runtime environment variables:
- DISABLE_HMR toggles hot module replacement behavior in development.

**Section sources**
- [next.config.ts](file://next.config.ts)

### Drizzle ORM Configuration
Drizzle Kit configuration reads:
- Schema path and output directory.
- Dialect selection based on DB_PROVIDER (postgresql vs sqlite).
- Database credentials URL from DATABASE_URL with a default for local development.

**Section sources**
- [drizzle.config.ts](file://drizzle.config.ts)

### Deployment-Specific Settings
Dockerfile:
- Multi-stage build for dependencies, build, and runtime.
- Sets NODE_ENV to production.
- Copies standalone Next.js output and static assets.
- Exposes port 3000 and starts with node server.js.

docker-compose:
- Defines app and db services.
- Passes DB_PROVIDER and DATABASE_URL to the app.
- Mounts volumes for database data and uploaded files.
- Ensures the database service is healthy before starting the app.

**Section sources**
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)

### API Routes and Runtime Configuration Usage
API routes demonstrate:
- Centralized error handling with structured responses for validation, domain, and internal errors.
- Integration settings retrieval and updates via the IoC container.
- Zod schema validation for incoming requests.

**Section sources**
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)
- [route.ts](file://app/api/settings/integrations/route.ts)

## Dependency Analysis
The configuration system exhibits low coupling and high cohesion:
- Centralized configuration decouples environment variables from application logic.
- The container encapsulates instantiation and wiring, reducing direct dependencies in API routes.
- Drizzle configuration is independent of application logic, relying solely on environment variables.
- Next.js configuration is isolated and does not depend on application services.

```mermaid
graph LR
ENV["Environment Variables"] --> CFG["Centralized Config"]
CFG --> CTN["IoC Container"]
CTN --> SRV["Domain Services"]
CTN --> ADP["Adapters"]
CFG --> DCFG["Drizzle Config"]
DCFG --> DB["Database"]
CTN --> API["API Routes"]
API --> ERR["Error Handler"]
```

**Diagram sources**
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)

**Section sources**
- [config.ts](file://src/infrastructure/config.ts)
- [container.ts](file://src/infrastructure/container.ts)
- [drizzle.config.ts](file://drizzle.config.ts)
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)

## Performance Considerations
- Centralized configuration reduces repeated environment lookups and improves readability.
- The IoC container avoids redundant instantiations by using a singleton pattern with a global scope.
- Next.js standalone output minimizes runtime overhead in containerized environments.
- Drizzle’s dialect selection based on environment variables ensures optimal database driver usage.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common configuration issues and resolutions:
- Missing database URL or provider:
  - Verify DATABASE_URL and DB_PROVIDER environment variables.
  - Confirm Drizzle configuration dialect matches the provider.
- LLM provider misconfiguration:
  - Ensure persisted settings for llm_provider, llm_model, llm_base_url, and llm_api_key are set appropriately.
  - Fall back to centralized config defaults if persisted values are missing.
- API key exposure or invalid keys:
  - Store API keys in environment variables; avoid logging sensitive values.
  - Use the centralized error handler to surface meaningful messages without exposing internals.
- Development hot module replacement issues:
  - Set DISABLE_HMR to true to disable HMR in development if needed.
- Integration settings not applied:
  - Confirm IntegrationSettingsService retrieves and updates settings correctly.
  - Validate that Jira adapter receives required settings and throws descriptive errors when missing.

**Section sources**
- [drizzle.config.ts](file://drizzle.config.ts)
- [config.ts](file://src/infrastructure/config.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [IntegrationSettingsService.ts](file://src/domain/services/IntegrationSettingsService.ts)
- [JiraAdapter.ts](file://src/adapters/issue-tracker/JiraAdapter.ts)
- [withApiHandler.ts](file://app/api/_lib/withApiHandler.ts)
- [next.config.ts](file://next.config.ts)

## Conclusion
The application employs a robust configuration system that:
- Centralizes environment variables into a typed configuration object.
- Uses a dependency injection container to wire services and adapters with configuration defaults and persisted settings.
- Applies configuration-driven service selection for LLM providers.
- Leverages Next.js configuration for build optimizations and runtime behavior.
- Provides deployment-specific settings via Docker and docker-compose.
- Implements standardized error handling for configuration-related failures.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Configuration Hierarchy and Examples
- Environment variables override defaults.
- Persisted settings override centralized configuration for runtime decisions.
- Defaults ensure minimal setup for local development.

Example environments:
- Development:
  - NODE_ENV=development
  - DATABASE_URL=file:./dev.db
  - DB_PROVIDER=sqlite
  - FILES_PATH=./public/uploads
  - APP_URL=http://localhost:3000
- Staging:
  - NODE_ENV=staging
  - DATABASE_URL=postgresql://user:pass@host:5432/db
  - DB_PROVIDER=postgresql
  - FILES_PATH=/var/www/uploads
  - APP_URL=https://staging.example.com
- Production:
  - NODE_ENV=production
  - DATABASE_URL=DATABASE_URL from secrets
  - DB_PROVIDER=postgresql
  - FILES_PATH=/var/www/uploads
  - APP_URL=https://app.example.com

[No sources needed since this section provides general guidance]