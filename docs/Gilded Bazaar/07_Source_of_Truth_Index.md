# 07 Source of Truth Index

## Purpose

This document acts as the navigation index for The Gilded Bazaar documentation set.

The goal is to keep the project understandable, maintainable and safe to continue after long breaks.

## Documentation Philosophy

The Gilded Bazaar should be documented like a real product, not a loose app experiment.

Every major decision should be written down.
Every major system should have a specification.
Every AI coding agent should be able to understand the intended architecture before touching code.

## Current Specification Set

### Foundation

- 00 Vision
- 01 Product Specification
- 02 Architecture
- 03 Authentication and User Management
- 04 Campaign System
- 05 Roles and Permissions
- 06 Onboarding and First Run
- 07 Source of Truth Index
- 08 Architecture Decision Records

### Planned Core Systems

- 09 Database Schema
- 10 Supabase Security and RLS
- 11 Service Layer Specification
- 12 Navigation and App Structure
- 13 UI Design System
- 14 Design Tokens
- 15 Player Backpack
- 16 Shop and Merchant Engine
- 17 Purchase Request Workflow
- 18 Campaign Feed
- 19 Wallet and Currency System
- 20 AI Shop Generator

### Planned Expansion Systems

- 21 Living World Engine
- 22 Downtime Engine
- 23 Town Crier Notifications
- 24 Secret Whispers
- 25 NPC Directory
- 26 Location and Settlement System
- 27 Campaign Journal
- 28 Bestiary and Collections
- 29 Credit Economy
- 30 RevenueCat Integration
- 31 Web Shell and Deep Links
- 32 Support Portal
- 33 Analytics and Telemetry
- 34 Testing Strategy
- 35 Deployment and Release Process
- 36 Security Model
- 37 Prompt Library
- 38 Glossary

## Documentation Rules

1. Keep docs modular.
2. Avoid repeating implementation details across many files.
3. Update the source-of-truth when code changes.
4. Mark planned features clearly as planned.
5. Mark implemented features clearly as implemented.
6. Do not claim a feature is complete until it exists in the repository and has been tested.
7. Record major decisions in ADRs.

## Completion Status Labels

Use these labels throughout the documentation:

```text
Status: Planned
Status: In Progress
Status: Implemented
Status: Needs Refactor
Status: Deprecated
```

## Repository Structure Target

```text
The-Gilded-Bazaar/
├── docs/
│   ├── 00_Vision.md
│   ├── 01_Product_Specification.md
│   ├── 02_Architecture.md
│   └── ...
├── src/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── lib/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── theme/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── assets/
├── scripts/
├── .github/
└── README.md
```

## Agent Instruction

Before making changes, an AI coding agent should read:

1. 00 Vision
2. 01 Product Specification
3. 02 Architecture
4. The relevant feature specification
5. The relevant ADRs

After making changes, the agent should update:

- build checklist
- implementation status
- affected specification files
- known issues
