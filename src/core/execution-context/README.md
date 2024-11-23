# Execution Context Utilities

Provides utilities for managing execution context using Node.js's `async_hooks`, enabling context propagation across asynchronous operations. It includes a middleware for setting up the execution context in web applications and utility functions for creating, retrieving, and managing context.

---

## Features

1. **Execution Context Management**:
    - Automatically propagates context across asynchronous operations.
    - Stores request-specific metadata (e.g., URL, method, parameters).

2. **Transaction ID Generation**:
    - Generates a unique `trxId` (UUID) for each request.

3. **Middleware for Express.js**:
    - Captures request metadata and initializes the execution context.

4. **Utility Functions**:
    - Create and retrieve context (`createCtx`, `getCtx`).
    - Retrieve the unique `trxId` for tracing (`getTransactionId`).

---

## Modules

### 1. **Middleware: `executionContextMiddleware`**
Middleware for Express.js that captures HTTP request details and initializes the execution context.

#### **File: `executionContextMiddleware.js`**

#### **Usage:**
Integrate the middleware into an Express.js application to set up execution context for each request.

---

### 2. **Execution Context Utilities**
Utility functions for managing execution context with `async_hooks`.

#### **File: `executionContextUtil.js`**

---

## How It Works

1. **`async_hooks` Integration**:
    - Uses `async_hooks` to maintain a `Map` that propagates context across asynchronous operations.

2. **Transaction ID**:
    - Each context includes a `trxId` (UUID) for request tracing.

3. **Lifecycle Management**:
    - Context is automatically initialized with `createCtx`.
    - Context is cleaned up when the asynchronous operation is destroyed.

---
