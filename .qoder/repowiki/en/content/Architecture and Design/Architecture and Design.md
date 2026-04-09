# Architecture and Design

<cite>
**Referenced Files in This Document**
- [container.ts](file://src/infrastructure/container.ts)
- [config.ts](file://src/infrastructure/config.ts)
- [client.ts](file://src/infrastructure/db/client.ts)
- [event-bus.ts](file://src/infrastructure/event-bus.ts)
- [DomainErrors.ts](file://src/domain/errors/DomainErrors.ts)
- [types.ts](file://src/domain/events/types.ts)
- [index.ts](file://src/domain/ports/index.ts)
- [ITestRunRepository.ts](file://src/domain/ports/repositories/ITestRunRepository.ts)
- [TestRunService.ts](file://src/domain/services/TestRunService.ts)
- [DrizzleTestRunRepository.ts](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts)
- [BaseLLMAdapter.ts](file://src/adapters/llm/BaseLLMAdapter.ts)
- [LLMProviderFactoryAdapter.ts](file://src/adapters/llm/LLMProviderFactoryAdapter.ts)
- [route.ts](file://app/api/runs/route.ts)
- [TestRunHeader.tsx](file://src/ui/test-run/TestRunHeader.tsx)
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
This document describes the clean architecture implementation of the Test Plan Manager. The system is organized into three primary layers:
- Domain: encapsulates core business logic and invariants.
- Adapters: translate between the domain and infrastructure, including repositories, external integrations, and UI adapters.
- Infrastructure: provides runtime support such as the IoC container, database client, configuration, and event bus.

Cross-cutting concerns include dependency injection via a singleton IoC container, repository abstraction for data access, adapter implementations for external services, factory pattern for dynamic LLM provider instantiation, event-driven architecture for decoupled integrations, robust error handling with typed domain exceptions, and centralized configuration management.

## Project Structure
The repository follows a feature-oriented separation with clear boundaries:
- app/: Next.js App Router API routes and pages.
- src/domain/: domain models, services, ports, errors, and events.
- src/adapters/: concrete implementations for persistence, LLM providers, storage, webhooks, and notifiers.
- src/infrastructure/: IoC container, database client, configuration, and event bus.
- src/ui/: React components for the frontend.

```mermaid
graph TB
subgraph "UI Layer"
UI_TestRunHeader["TestRunHeader.tsx"]
end
subgraph "App Router"
API_Runs["/app/api/runs/route.ts"]
end
subgraph "Domain"
Svc_TestRun["TestRunService.ts"]
Ports["domain/ports/*"]
Errors["domain/errors/DomainErrors.ts"]
Events["domain/events/types.ts"]
end
subgraph "Adapters"
Repo_DR["adapters/persistence/drizzle/DrizzleTestRunRepository.ts"]
LLM_Factory["adapters/llm/LLMProviderFactoryAdapter.ts"]
LLM_Base["adapters/llm/BaseLLMAdapter.ts"]
end
subgraph "Infrastructure"
Container["infrastructure/container.ts"]
Config["infrastructure/config.ts"]
DB_Client["infrastructure/db/client.ts"]
EventBus["infrastructure/event-bus.ts"]
end
UI_TestRunHeader --> API_Runs
API_Runs --> Container
Container --> Svc_TestRun
Svc_TestRun --> Repo_DR
Svc_TestRun --> LLM_Factory
LLM_Factory --> LLM_Base
Svc_TestRun --> EventBus
Container --> DB_Client
Container --> Config
```

**Diagram sources**
- [TestRunHeader.tsx:1-139](file://src/ui/test-run/TestRunHeader.tsx#L1-L139)
- [route.ts:1-26](file://app/api/runs/route.ts#L1-L26)
- [container.ts:1-126](file://src/infrastructure/container.ts#L1-L126)
- [TestRunService.ts:1-125](file://src/domain/services/TestRunService.ts#L1-L125)
- [DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)
- [LLMProviderFactoryAdapter.ts:1-43](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L1-L43)
- [BaseLLMAdapter.ts:1-26](file://src/adapters/llm/BaseLLMAdapter.ts#L1-L26)
- [event-bus.ts:1-52](file://src/infrastructure/event-bus.ts#L1-L52)
- [client.ts:1-32](file://src/infrastructure/db/client.ts#L1-L32)
- [config.ts:1-28](file://src/infrastructure/config.ts#L1-L28)

**Section sources**
- [container.ts:1-126](file://src/infrastructure/container.ts#L1-L126)
- [config.ts:1-28](file://src/infrastructure/config.ts#L1-L28)
- [client.ts:1-32](file://src/infrastructure/db/client.ts#L1-L32)
- [event-bus.ts:1-52](file://src/infrastructure/event-bus.ts#L1-L52)

## Core Components
- IoC Container: A lazy-initialized singleton that wires repositories, adapters, and domain services. It exposes named exports for use across API routes and services.
- Repository Abstraction: Interfaces define contracts for data access; concrete Drizzle implementations provide SQL-backed persistence.
- Adapter Pattern: External integrations (storage, issue tracker, notifier, webhook dispatcher) are implemented behind interfaces and injected into services.
- Factory Pattern: A factory constructs the appropriate LLM provider based on persisted settings and configuration.
- Event-Driven Architecture: Typed domain events are emitted by services and handled asynchronously by adapters.
- Error Handling: Typed domain exceptions unify error semantics across the stack.
- Configuration Management: Centralized configuration consolidates environment variables into a typed object.

**Section sources**
- [container.ts:27-91](file://src/infrastructure/container.ts#L27-L91)
- [ITestRunRepository.ts:1-12](file://src/domain/ports/repositories/ITestRunRepository.ts#L1-L12)
- [DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)
- [LLMProviderFactoryAdapter.ts:10-42](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L10-L42)
- [event-bus.ts:9-49](file://src/infrastructure/event-bus.ts#L9-L49)
- [DomainErrors.ts:7-39](file://src/domain/errors/DomainErrors.ts#L7-L39)
- [config.ts:7-27](file://src/infrastructure/config.ts#L7-L27)

## Architecture Overview
Clean architecture layers and their responsibilities:
- Domain: Business logic, services, ports, errors, and events.
- Adapters: Implementations for repositories, LLM providers, storage, webhooks, and notifiers.
- Infrastructure: IoC container, database client, configuration, and event bus.

```mermaid
graph TB
subgraph "Domain Layer"
D_Services["Domain Services"]
D_Ports["Ports (Repositories, External)"]
D_Errors["Domain Errors"]
D_Events["Domain Events"]
end
subgraph "Adapters Layer"
A_Repositories["Concrete Repositories"]
A_LLM["LLM Adapters"]
A_External["External Integrations"]
end
subgraph "Infrastructure Layer"
I_Container["IoC Container"]
I_DB["Database Client"]
I_Config["Configuration"]
I_EventBus["Event Bus"]
end
D_Services --> D_Ports
D_Services --> D_Events
A_Repositories --> D_Ports
A_LLM --> D_Ports
A_External --> D_Ports
I_Container --> D_Services
I_Container --> A_Repositories
I_Container --> A_LLM
I_Container --> A_External
I_DB --> A_Repositories
I_Config --> A_LLM
I_EventBus --> A_External
```

**Diagram sources**
- [container.ts:33-91](file://src/infrastructure/container.ts#L33-L91)
- [client.ts:6-25](file://src/infrastructure/db/client.ts#L6-L25)
- [config.ts:7-27](file://src/infrastructure/config.ts#L7-L27)
- [event-bus.ts:9-49](file://src/infrastructure/event-bus.ts#L9-L49)
- [index.ts:1-19](file://src/domain/ports/index.ts#L1-L19)

## Detailed Component Analysis

### Dependency Injection Container Pattern
The IoC container is a singleton created lazily and stored globally to avoid duplication in Next.js App Router contexts. It registers:
- Repositories: Drizzle implementations for projects, modules, test cases, test runs, test results, attachments, dashboard, and settings.
- External Adapters: Storage provider, Jira adapter, Slack notifier, webhook dispatcher, and LLM provider factory.
- Domain Services: Project, test plan, test run, attachment, dashboard, report, database, integration settings, AI test generation, and AI bug report services.

```mermaid
classDiagram
class IoCContainer {
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
class DrizzleTestRunRepository
class TestRunService
class LLMProviderFactoryAdapter
IoCContainer --> DrizzleTestRunRepository : "provides"
IoCContainer --> TestRunService : "provides"
IoCContainer --> LLMProviderFactoryAdapter : "provides"
TestRunService --> DrizzleTestRunRepository : "uses"
TestRunService --> LLMProviderFactoryAdapter : "uses"
```

**Diagram sources**
- [container.ts:33-91](file://src/infrastructure/container.ts#L33-L91)
- [DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)
- [TestRunService.ts:14-21](file://src/domain/services/TestRunService.ts#L14-L21)
- [LLMProviderFactoryAdapter.ts:15-16](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L15-L16)

**Section sources**
- [container.ts:27-91](file://src/infrastructure/container.ts#L27-L91)

### Repository Pattern for Data Access Abstraction
- Port Contract: The repository port defines the operations available to the domain service.
- Concrete Implementation: The Drizzle repository implements the port using a typed database client and joins to enrich related entities.
- Domain Service Usage: Services depend on the repository port, keeping business logic independent of the persistence technology.

```mermaid
classDiagram
class ITestRunRepository {
+findAll(projectId)
+findById(id)
+create(name, projectId)
+update(id, data)
+delete(id)
+count()
+deleteAll()
}
class DrizzleTestRunRepository {
+db
+findAll()
+findById()
+create()
+update()
+delete()
+count()
+deleteAll()
}
class TestRunService {
-testRunRepo : ITestRunRepository
-testResultRepo : ITestResultRepository
-testCaseRepo : ITestCaseRepository
-notifier : INotifier
-webhookDispatcher : IWebhookDispatcher
+getAllRuns()
+createRun()
+renameRun()
+updateResult()
+deleteRun()
+finishRun()
}
ITestRunRepository <|.. DrizzleTestRunRepository
TestRunService --> ITestRunRepository : "depends on"
TestRunService --> DrizzleTestRunRepository : "uses"
```

**Diagram sources**
- [ITestRunRepository.ts:3-11](file://src/domain/ports/repositories/ITestRunRepository.ts#L3-L11)
- [DrizzleTestRunRepository.ts:7-95](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L7-L95)
- [TestRunService.ts:14-21](file://src/domain/services/TestRunService.ts#L14-L21)

**Section sources**
- [ITestRunRepository.ts:1-12](file://src/domain/ports/repositories/ITestRunRepository.ts#L1-L12)
- [DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)
- [TestRunService.ts:1-125](file://src/domain/services/TestRunService.ts#L1-L125)

### Adapter Pattern for External Service Integration
- LLM Provider Factory: Selects the appropriate LLM adapter based on persisted settings or defaults from configuration.
- Base LLM Adapter: Defines a common interface and helper utilities for chat completion and availability checks.
- Other Adapters: Storage, issue tracker, notifier, and webhook dispatcher follow similar patterns behind typed ports.

```mermaid
classDiagram
class ILLMProviderFactory {
+create() ILLMProvider
}
class LLMProviderFactoryAdapter {
-settingsRepo : ISettingsRepository
+create() ILLMProvider
}
class ILLMProvider {
+chat(messages, options) LLMResponse
+isAvailable() boolean
}
class BaseLLMAdapter {
<<abstract>>
+name : string
+chat(...)
+isAvailable()
-createMessages(prompt, systemPrompt)
}
ILLMProviderFactory <|.. LLMProviderFactoryAdapter
ILLMProvider <|.. BaseLLMAdapter
```

**Diagram sources**
- [LLMProviderFactoryAdapter.ts:15-41](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L15-L41)
- [BaseLLMAdapter.ts:3-25](file://src/adapters/llm/BaseLLMAdapter.ts#L3-L25)
- [index.ts:12-13](file://src/domain/ports/index.ts#L12-L13)

**Section sources**
- [LLMProviderFactoryAdapter.ts:10-42](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L10-L42)
- [BaseLLMAdapter.ts:1-26](file://src/adapters/llm/BaseLLMAdapter.ts#L1-L26)
- [index.ts:12-13](file://src/domain/ports/index.ts#L12-L13)

### Factory Pattern for Dynamic LLM Provider Instantiation
The factory reads persisted settings and falls back to configuration defaults to instantiate the correct LLM provider. This keeps the domain free from concrete provider knowledge while enabling runtime selection.

```mermaid
flowchart TD
Start(["create() called"]) --> ReadProvider["Read 'llm_provider' setting<br/>or use config.default"]
ReadProvider --> ReadModel["Read 'llm_model' setting<br/>or use config.default"]
ReadProvider --> ProviderType{"Provider type?"}
ProviderType --> |ollama| BuildOllama["Construct OllamaAdapter(baseUrl, model)"]
ProviderType --> |openrouter| ReadApiKey1["Read 'llm_api_key' setting<br/>or use config.default"] --> BuildOpenRouter["Construct OpenRouterAdapter(apiKey, model)"]
ProviderType --> |openai-compatible| ReadApiKey2["Read 'llm_api_key' setting<br/>or use config.default"] --> ReadBaseUrl["Read 'llm_base_url' setting<br/>or use config.default"] --> BuildOpenAI["Construct OpenAICompatibleAdapter(baseUrl, apiKey, model)"]
ProviderType --> |default| ReadApiKey3["Read 'llm_api_key' setting<br/>or use config.default"] --> BuildGemini["Construct GeminiAdapter(apiKey, model)"]
BuildOllama --> Return["Return ILLMProvider"]
BuildOpenRouter --> Return
BuildOpenAI --> Return
BuildGemini --> Return
```

**Diagram sources**
- [LLMProviderFactoryAdapter.ts:18-41](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L18-L41)
- [config.ts:13-18](file://src/infrastructure/config.ts#L13-L18)

**Section sources**
- [LLMProviderFactoryAdapter.ts:18-41](file://src/adapters/llm/LLMProviderFactoryAdapter.ts#L18-L41)
- [config.ts:13-18](file://src/infrastructure/config.ts#L13-L18)

### Component Interaction: UI to Domain to Adapters and Infrastructure
End-to-end flow from UI components to domain services and adapters:

```mermaid
sequenceDiagram
participant UI as "TestRunHeader.tsx"
participant API as "/app/api/runs/route.ts"
participant C as "IoC Container"
participant S as "TestRunService"
participant R as "DrizzleTestRunRepository"
participant W as "WebhookDispatcherAdapter"
participant N as "SlackNotifierAdapter"
UI->>API : "PATCH /api/runs/ : id" (rename)
API->>C : "Resolve testRunService"
C-->>API : "TestRunService instance"
API->>S : "renameRun(id, name)"
S->>R : "findById(id)"
R-->>S : "TestRun"
S->>R : "update(id, {name})"
R-->>S : "Updated TestRun"
S->>W : "dispatch(testrun.updated, payload)"
W-->>S : "ok"
S-->>API : "Updated TestRun"
API-->>UI : "200 OK"
UI->>API : "POST /api/runs/ : id/finish"
API->>C : "Resolve testRunService"
C-->>API : "TestRunService instance"
API->>S : "finishRun(runId)"
S->>R : "findById(runId)"
R-->>S : "TestRunWithResults"
S->>N : "send(notification)"
N-->>S : "ok"
S->>W : "dispatch(testrun.completed, payload)"
W-->>S : "ok"
S-->>API : "void"
API-->>UI : "204 No Content"
```

**Diagram sources**
- [TestRunHeader.tsx:33-113](file://src/ui/test-run/TestRunHeader.tsx#L33-L113)
- [route.ts:8-25](file://app/api/runs/route.ts#L8-L25)
- [container.ts:117-120](file://src/infrastructure/container.ts#L117-L120)
- [TestRunService.ts:53-84](file://src/domain/services/TestRunService.ts#L53-L84)
- [DrizzleTestRunRepository.ts:16-85](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L16-L85)

**Section sources**
- [TestRunHeader.tsx:1-139](file://src/ui/test-run/TestRunHeader.tsx#L1-L139)
- [route.ts:1-26](file://app/api/runs/route.ts#L1-L26)
- [container.ts:100-126](file://src/infrastructure/container.ts#L100-L126)
- [TestRunService.ts:1-125](file://src/domain/services/TestRunService.ts#L1-L125)
- [DrizzleTestRunRepository.ts:1-96](file://src/adapters/persistence/drizzle/DrizzleTestRunRepository.ts#L1-L96)

### Cross-Cutting Concerns

#### Event-Driven Architecture
- Domain emits typed events describing state changes and lifecycle milestones.
- Infrastructure event bus handles asynchronous dispatch to adapters (e.g., Slack notifier, webhook dispatcher).
- Handlers are registered via subscription and executed asynchronously with error logging.

```mermaid
sequenceDiagram
participant S as "TestRunService"
participant E as "EventBus"
participant N as "SlackNotifierAdapter"
participant W as "WebhookDispatcherAdapter"
S->>E : "emit('testrun.completed', payload)"
E->>N : "invoke handler(payload)"
E->>W : "invoke handler(payload)"
N-->>E : "done"
W-->>E : "done"
```

**Diagram sources**
- [TestRunService.ts:101-122](file://src/domain/services/TestRunService.ts#L101-L122)
- [event-bus.ts:13-29](file://src/infrastructure/event-bus.ts#L13-L29)

**Section sources**
- [types.ts:8-58](file://src/domain/events/types.ts#L8-L58)
- [event-bus.ts:9-49](file://src/infrastructure/event-bus.ts#L9-L49)
- [TestRunService.ts:101-122](file://src/domain/services/TestRunService.ts#L101-L122)

#### Error Handling
- Domain errors are typed and map cleanly to HTTP status codes.
- Services throw domain exceptions for invalid states, missing resources, or conflicts.
- API routes can translate domain errors to appropriate HTTP responses.

```mermaid
flowchart TD
A["Service Operation"] --> B{"Validation OK?"}
B --> |No| E["Throw ValidationError"]
B --> |Yes| C["Business Logic"]
C --> D{"Resource Found?"}
D --> |No| F["Throw NotFoundError"]
D --> |Yes| G["Success"]
E --> H["API Route Handles Error"]
F --> H
G --> H
```

**Diagram sources**
- [DomainErrors.ts:18-38](file://src/domain/errors/DomainErrors.ts#L18-L38)
- [TestRunService.ts:29-57](file://src/domain/services/TestRunService.ts#L29-L57)

**Section sources**
- [DomainErrors.ts:7-39](file://src/domain/errors/DomainErrors.ts#L7-L39)
- [TestRunService.ts:23-84](file://src/domain/services/TestRunService.ts#L23-L84)

#### Configuration Management
- Centralized configuration consolidates environment variables into a typed object.
- Providers (database, LLM, storage, app) are configured via environment variables.
- Factories and adapters consume configuration defaults when settings are not persisted.

```mermaid
flowchart TD
Env["Environment Variables"] --> Config["config.ts"]
Config --> DB["DB Provider Selection"]
Config --> LLM["Default LLM Settings"]
Config --> Storage["Default File Path"]
Config --> App["App URL & Env"]
```

**Diagram sources**
- [config.ts:7-27](file://src/infrastructure/config.ts#L7-L27)

**Section sources**
- [config.ts:1-28](file://src/infrastructure/config.ts#L1-L28)

## Dependency Analysis
The IoC container orchestrates dependencies across layers, ensuring inversion of control and testability.

```mermaid
graph LR
Container["IoC Container"] --> Repos["Repositories"]
Container --> Adapters["External Adapters"]
Container --> Services["Domain Services"]
Services --> |"uses"| Repos
Services --> |"uses"| Adapters
Adapters --> |"implements"| Ports["Domain Ports"]
```

**Diagram sources**
- [container.ts:33-91](file://src/infrastructure/container.ts#L33-L91)
- [index.ts:1-19](file://src/domain/ports/index.ts#L1-L19)

**Section sources**
- [container.ts:1-126](file://src/infrastructure/container.ts#L1-L126)
- [index.ts:1-19](file://src/domain/ports/index.ts#L1-L19)

## Performance Considerations
- Database Provider Selection: The database client supports SQLite for development/electron and PostgreSQL for production, with connection pooling and pragmas optimized for performance.
- Lazy IoC Container: Prevents redundant initialization in Next.js environments.
- Asynchronous Event Dispatch: Handlers run asynchronously to avoid blocking domain logic.
- Repository Joins: Efficiently load related entities in a single query where possible.

**Section sources**
- [client.ts:6-25](file://src/infrastructure/db/client.ts#L6-L25)
- [container.ts:95-98](file://src/infrastructure/container.ts#L95-L98)
- [event-bus.ts:17-29](file://src/infrastructure/event-bus.ts#L17-L29)

## Troubleshooting Guide
- Missing Environment Variables: Ensure database provider, URLs, and LLM keys are set; otherwise, defaults may cause failures.
- Not Found Errors: When resources are missing, services throw typed errors; verify IDs and existence before invoking operations.
- Event Handler Failures: EventBus catches and logs errors from async/sync handlers; check logs for handler-specific issues.
- Repository Connectivity: Confirm database connectivity and migrations; verify provider selection matches deployment target.

**Section sources**
- [config.ts:7-27](file://src/infrastructure/config.ts#L7-L27)
- [DomainErrors.ts:18-26](file://src/domain/errors/DomainErrors.ts#L18-L26)
- [event-bus.ts:20-28](file://src/infrastructure/event-bus.ts#L20-L28)
- [client.ts:6-25](file://src/infrastructure/db/client.ts#L6-L25)

## Conclusion
The Test Plan Manager implements a clean architecture with clear separation of concerns. The IoC container enforces dependency inversion, the repository pattern abstracts persistence, the adapter pattern isolates external integrations, and the factory pattern enables dynamic LLM provider selection. The event-driven architecture and typed domain errors improve decoupling and reliability. Centralized configuration and a singleton database client streamline deployment and performance.

## Appendices
- Extension Guidelines:
  - Add new domain services under src/domain/services and expose them via the IoC container.
  - Implement new repository ports under src/domain/ports/repositories and provide a Drizzle implementation under src/adapters/persistence/drizzle.
  - Introduce new external adapters behind typed ports and register them in the IoC container.
  - Emit typed domain events and subscribe adapters to handle asynchronous integrations.
  - Keep environment variables documented and validated through the centralized configuration.