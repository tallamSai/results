# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Ports 1433, 7500, and 6100 available

## Quick Start

### 1. Start All Services

```bash
docker-compose up --build
```

This will:
- Build the backend (C# ASP.NET Core)
- Build the frontend (React + Vite)
- Start SQL Server database
- Initialize the database with schemas
- Start all services

### 2. Access the Application

- **Frontend:** http:
- **Backend API:** http:
- **Database:** localhost:1433

### 3. Default Credentials

**Admin Account:**
- Email: `admin@workflow.com`
- Password: `Admin@123`

## Management Commands

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Fresh Start)

```bash
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuild Services

```bash
# Rebuild all
docker-compose up --build --force-recreate

# Rebuild specific service
docker-compose up --build backend
```

### Access Database

```bash
# Using docker exec
docker exec -it workflow_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C

# Or use any SQL client:
# Server: localhost,1433
# Username: sa
# Password: YourStrong@Passw0rd
# Database: WorkflowDB
```

## Services

### 1. Database (db)
- **Image:** mcr.microsoft.com/mssql/server:2022-latest
- **Port:** 1433
- **Health Check:** Ensures database is ready before other services start

### 2. Database Init (db-init)
- **Purpose:** Runs init.sql to create tables and seed data
- **Runs once:** Completes and exits after initialization

### 3. Backend (backend)
- **Technology:** C# ASP.NET Core 8.0
- **Port:** 7500
- **Features:**
  - JWT Authentication
  - SignalR for real-time notifications
  - Workflow management
  - Role-based access control

### 4. Frontend (frontend)
- **Technology:** React + Vite + Tailwind CSS
- **Port:** 6100
- **Features:**
  - Modern responsive UI
  - Real-time notifications
  - Dynamic form routing
  - Protected routes

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the port
netstat -ano | findstr :6100
netstat -ano | findstr :7500
netstat -ano | findstr :1433

# Stop the process or change ports in docker-compose.yml
```

### Clean Restart

For a completely fresh start:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose up --build
```

### Backend Build Errors

```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend only
docker-compose up --build backend
```

### Frontend Build Errors

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend only
docker-compose up --build frontend
```

## Development vs Production

### Development Mode

For development, you might want to use volume mounts for hot reload:

```yaml
services:
  backend:
    volumes:
      - ./backend:/app
      
  frontend:
    volumes:
      - ./frontend:/app
```

### Production Mode

Current configuration is optimized for production with:
- Multi-stage Docker builds
- Optimized images
- Health checks
- Restart policies

## Network

All services communicate through the `workflow_network` bridge network:
- Services can reference each other by service name
- Frontend -> Backend: `http:
- Backend -> Database: `Server=db;...`

## Volumes

- `sqlserver_data`: Persistent storage for SQL Server database

To backup the database:

```bash
docker run --rm --volumes-from workflow_db -v $(pwd):/backup ubuntu tar cvf /backup/backup.tar /var/opt/mssql
```

## Security Notes

**Important:** Change these before deploying to production:

1. Database password in `docker-compose.yml`
2. JWT secret key in backend `appsettings.json`
3. Admin default password

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check network connectivity between services
