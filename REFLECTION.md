Reflection: AI Agents in a Full-Stack Hexagonal Architecture

This assignment wasn’t just about building a full-stack app—it was a stress test of architectural discipline and an experiment in how well a developer can collaborate with AI. Working under a strict hexagonal (Ports & Adapters) pattern on both the frontend and backend, and finishing everything within 72 hours, made it even more interesting. Using AI agents like GitHub Copilot and Cursor became central to my workflow, and through this, I saw huge efficiency boosts, some frustrating limitations, and a lot of valuable lessons.

What I Learned About AI Agents

My biggest realization is that AI agents work like "System 1" thinkers—fast, intuitive, and pattern-based—but struggle at "System 2" tasks like deep reasoning or solving unfamiliar problems.

Where AI excelled

On the backend, whenever I gave the AI something highly structured—like a Prisma schema or a repository interface—it immediately recognized the pattern and produced clean, accurate code. For example:

Generating Prisma repository implementations

Creating CRUD adapters

Writing basic Jest tests or Supertest integration tests

These tasks were almost instant, and the output was usually correct. This was AI operating in its comfort zone: familiar patterns and repetitive structure.

Where AI failed

The moment the task required genuine reasoning, it fell apart.

Hexagonal architecture was the biggest struggle.
The AI constantly tried to sneak framework-specific imports (like Express' Request/Response) into my core layer. It kept breaking dependency rules for the sake of convenience. I started to feel like my job wasn’t writing code but protecting the architecture from the AI.

Complex business logic was another weak point.
My CreatePoolUseCase included multiple validation rules and a custom greedy allocation algorithm. The AI repeatedly produced code that looked right on the surface but failed logically and couldn’t pass tests. In the end, AI could outline the class, but I had to write the entire algorithm myself.

Where AI Saved Time vs. Where It Didn’t
Huge Time Savings (Boilerplate & Patterns)

Project setup: configs for TypeScript, Tailwind, Jest, package scripts—done instantly.

Translating database models: schema.prisma → domain entities → API types → Prisma adapters.

Frontend scaffolding: tables, forms, components, KPIs—all generated super fast.

These tasks would normally eat hours. With AI, they took minutes.

Moderate Gains (Refactoring & Tests)

Clean refactors (like turning ApiClient into a singleton).

Excellent at test scaffolding—mocking, setup, boilerplate.

No Gains (Core Logic & Architecture)

Anything involving:

Real reasoning

Non-standard architectural rules

Complex algorithms

Anything that required understanding why

…was still a 100% manual job.

AI dramatically compressed the “getting started” part but couldn’t replace actual thought.

How I’ll Use AI Better Next Time

This project taught me how to integrate AI agents more intelligently.

1. More intentional prompting

I’ll give stronger architectural guardrails from the beginning, especially in Cursor. For example:

“You are a software architect building a Hexagonal system. The core directory must never import frameworks or adapters. With that rule in mind, implement the IRouteRepository using Prisma.”

More context upfront = fewer architectural violations later.

2. Use a “Test-First AI” approach

Instead of asking the AI to create the logic, I’ll:

Write the unit tests first

Give the AI both the tests and the empty function

Tell it: “Write code that makes these tests pass.”

This keeps the AI inside a predefined boundary of correctness.

Final Takeaway

This assignment proved a clear split:
AI is a force-multiplier for scaffolding and pattern-based work, but the architecture and core logic still need human reasoning.

With the right strategy, AI doesn’t replace developers—it frees us to focus on the hard, meaningful parts of development while it handles the repetitive ones.