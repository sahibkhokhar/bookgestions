# bookgestions

An AI-powered book recommendation engine built with Next.js.

## Running Locally with Docker

This project is configured to run as a Docker container, pulling the latest pre-built image from the GitHub Container Registry.

### Prerequisites

1.  **Docker & Docker Compose:** Must be installed on your system.
2.  **Environment Variables:** Copy the `.env.example` file to `.env` and fill in your secrets.

### Setup

1.  **Create `.env` file:**
    Copy the example file and populate it with your secrets:
    ```bash
    cp .env.example .env
    ```

2.  **Start the Application:**
    This command will pull the latest image and start the service.
    ```bash
    docker-compose up -d
    ```

The application will be running at `http://localhost:3020`. 