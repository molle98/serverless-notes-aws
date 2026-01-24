# Serverless Notes API

This is a small **serverless backend API** built with **AWS CDK**, **API Gateway**, **AWS Lambda**, and **DynamoDB**.

The project is intentionally limited in scope. The goal is not to build a full CRUD application, but to show **solid architectural foundations** and **clear technical decisions**.

## 🎯 Project goals

- Design a realistic but minimal serverless API
- Apply good practices around **AWS**, **IAM**, **serverless architecture**, and **TypeScript**
- Keep the system simple while still making deliberate technical choices
- Build something small, but at a level that reflects solid fundamentals

## 🧱 High-level architecture

The system is composed of:

- **AWS CDK (TypeScript)** for infrastructure as code
- **API Gateway (REST)** as the HTTP entry point
- **AWS Lambda (Node.js 24)** for business logic
- **DynamoDB** as the persistence layer

Each component has a clear responsibility, and nothing is coupled unnecessarily.

## 🗂️ Repository structure

```
serverless-notes-aws/
│
├── infra/                # Infrastructure (AWS CDK)
│   ├── lib/
│   │   └── notes-stack.ts
│   └── bin/
│       └── infra.ts
│
├── backend/              # Lambda functions
│   ├── src/
│   │   ├── health.ts     # GET /health
│   │   ├── create.ts     # POST /notes
│   │   └── list.ts       # GET /notes
│   └── package.json
│
└── README.md
```

## 🔌 Available endpoints

### `GET /health`

Simple health-check endpoint.

- Does not access DynamoDB
- Does not require any extra IAM permissions
- Useful to verify that the API and Lambda runtime are up

**Response:**

```json
{ "status": "ok" }
```

---

### `POST /notes`

Creates a new note.

- Generates a `noteId` using `crypto.randomUUID()`
- Writes the item to DynamoDB using AWS SDK v3
- Table name is injected via environment variables

**Key decisions:**

- Input validation is intentionally minimal and manual
- No external validation libraries
- IAM permissions are restricted to **write-only** access

The idea here is to keep the Lambda lightweight and predictable.

---

### `GET /notes`

Lists notes from DynamoDB.

- Uses **cursor-based pagination** via `LastEvaluatedKey`

**Why cursor-based pagination:**

- DynamoDB does not support real offset-based pagination
- Cursor-based pagination is more efficient and consistent
- Scales better as the dataset grows

## 🗄️ DynamoDB – data model

Table name: `Notes`

- **Partition key:** `noteId` (string)
- **Billing mode:** `PAY_PER_REQUEST`
- No secondary indexes

**Intentional trade-off:**
This project does not model complex access patterns. The focus is on clarity and correctness, not premature flexibility.

## 🔐 Security and IAM

Each Lambda function has only the permissions it actually needs:

- `health` → no DynamoDB access
- `create` → write permissions only
- `list` → read permissions only

**Why this matters:**

- Follows the principle of least privilege
- Reduces blast radius in case of bugs or misconfiguration
- Makes the security model easier to reason about

## ⚙️ Runtime and bundling

- **Runtime:** Node.js 24
- **Bundling:** CDK `NodejsFunction`

**Why:**

- Modern, stable runtime
- Minimal setup
- Fewer moving parts and dependencies

## 🧠 Key technical decisions

### AWS CDK vs Serverless Framework / Terraform

CDK allows me to define infrastructure using TypeScript, close to the application code. For a project of this size, that improves readability and reduces context switching.

### DynamoDB vs SQL

A NoSQL database fits better with a serverless architecture:

- Automatic scaling
- No connection management
- Lower operational overhead

### One Lambda per responsibility

Each Lambda handles a single concern. This keeps the codebase easier to test, reason about, and explain.

## 🚧 What this project intentionally does NOT include

- Authentication or authorization
- Update or delete operations
- Secondary indexes
- Advanced validation libraries
- Automated tests

**Reasoning:**
The goal is not feature completeness. The goal is to demonstrate sound decision-making and solid fundamentals.

## 🧪 Testing

- Manual testing using `curl`
- Direct verification against API Gateway endpoints

## 📌 Possible next steps

- `GET /notes/{id}` endpoint
- Stronger input validation
- Consistent error handling
- Structured logging
- Unit tests for Lambdas

## Final note

This project is designed to be **small, understandable, and defensible**.

Every choice was made consciously, with the intention of being able to explain not only _what_ was built, but _why_ it was built that way.
