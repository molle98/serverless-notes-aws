# Serverless Notes API

Minimal serverless API for managing personal notes.

## Overview

This project implements a simple, production-oriented serverless backend
focused on clarity, maintainability and scalability.

## Tech Stack

- AWS API Gateway
- AWS Lambda (Node.js, TypeScript)
- Amazon DynamoDB
- AWS CDK

## Architecture

Client → API Gateway → Lambda → DynamoDB

## Scope

- Create a note
- List notes
- Update a note
- Delete a note
- User-based data isolation

## Design Principles

- Minimal infrastructure
- Explicit and readable code
- Serverless scalability by default
- Low operational overhead
