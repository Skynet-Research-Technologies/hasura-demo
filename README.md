# Hasura Boilerplate

This project provides a boilerplate setup for running Hasura locally with Docker. It includes configuration files, metadata, and migrations to help you get started quickly.

## Project Structure

```
hasura-boilerplate
├── hasura
│   ├── config.yaml         # Configuration settings for the Hasura instance
│   ├── metadata             # Metadata files defining schema, relationships, and permissions
│   └── migrations           # Migration files for database schema changes
├── docker-compose.yml       # Docker Compose file for running Hasura locally
├── .env.example             # Template for environment variables
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hasura-boilerplate
   ```

2. Copy the `.env.example` to `.env` and update the environment variables as needed:
   ```
   cp .env.example .env
   ```

3. Start the Hasura instance using Docker Compose:
   ```
   docker-compose up
   ```

4. Access the Hasura console at `http://localhost:8080`.

### Configuration

- Modify `hasura/config.yaml` to set your database connection details and other settings required for the Hasura GraphQL engine.

### Metadata and Migrations

- Place your metadata files in the `hasura/metadata` directory.
- Use the `hasura/migrations` directory to manage your database schema changes.

### Contributing

Feel free to submit issues or pull requests to improve this boilerplate setup. 

### License

This project is licensed under the MIT License.