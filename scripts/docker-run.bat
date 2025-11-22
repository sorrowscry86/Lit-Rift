@echo off
REM Docker Run Script for Lit-Rift (Windows)
REM Manages Docker Compose operations for different environments

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=lit-rift
set ENV_FILE=.env

REM Colors (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Parse arguments
set COMMAND=%1
set ENVIRONMENT=%2
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev

REM Validate environment
if not "%ENVIRONMENT%"=="dev" if not "%ENVIRONMENT%"=="prod" (
    echo %RED%[ERROR]%NC% Invalid environment: %ENVIRONMENT%
    echo Valid environments: dev, prod
    exit /b 1
)

REM Main command router
if "%COMMAND%"=="start" goto start
if "%COMMAND%"=="stop" goto stop
if "%COMMAND%"=="restart" goto restart
if "%COMMAND%"=="logs" goto logs
if "%COMMAND%"=="status" goto status
if "%COMMAND%"=="exec" goto exec_cmd
if "%COMMAND%"=="cleanup" goto cleanup
if "%COMMAND%"=="help" goto help
if "%COMMAND%"=="-h" goto help
if "%COMMAND%"=="--help" goto help

echo %RED%[ERROR]%NC% Invalid command: %COMMAND%
goto help

REM Start services
:start
echo %GREEN%[INFO]%NC% Starting services in %ENVIRONMENT% mode...

if not exist "docker-compose.%ENVIRONMENT%.yml" (
    echo %RED%[ERROR]%NC% Compose file not found: docker-compose.%ENVIRONMENT%.yml
    exit /b 1
)

docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% up -d

echo %GREEN%[INFO]%NC% Services started successfully
if "%ENVIRONMENT%"=="dev" (
    echo %GREEN%[INFO]%NC% Access the application at:
    echo %GREEN%[INFO]%NC%   - Frontend: http://localhost:3000
    echo %GREEN%[INFO]%NC%   - Backend: http://localhost:5000
) else (
    echo %GREEN%[INFO]%NC% Access the application at:
    echo %GREEN%[INFO]%NC%   - Frontend: http://localhost
    echo %GREEN%[INFO]%NC%   - Backend: http://localhost:5000
)
goto end

REM Stop services
:stop
echo %BLUE%[STEP]%NC% Stopping services in %ENVIRONMENT% mode...
docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% down
echo %GREEN%[INFO]%NC% Services stopped successfully
goto end

REM Restart services
:restart
echo %BLUE%[STEP]%NC% Restarting services...
call :stop
call :start
goto end

REM View logs
:logs
set SERVICE=%3
echo %BLUE%[STEP]%NC% Viewing logs...
if "%SERVICE%"=="" (
    docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% logs -f
) else (
    docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% logs -f %SERVICE%
)
goto end

REM Show status
:status
echo %BLUE%[STEP]%NC% Service status:
docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% ps
goto end

REM Execute command
:exec_cmd
set SERVICE=%3
if "%SERVICE%"=="" (
    echo %RED%[ERROR]%NC% Please specify a service name
    exit /b 1
)

echo %BLUE%[STEP]%NC% Executing command in %SERVICE%...
shift
shift
shift

docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% exec %SERVICE% %*
goto end

REM Cleanup
:cleanup
echo %BLUE%[STEP]%NC% Cleaning up %ENVIRONMENT% environment...
docker compose -f docker-compose.%ENVIRONMENT%.yml -p %PROJECT_NAME%-%ENVIRONMENT% down -v --remove-orphans
echo %GREEN%[INFO]%NC% Cleanup completed
goto end

REM Help
:help
echo Docker Run Script for Lit-Rift (Windows)
echo.
echo Usage: %~nx0 ^<command^> ^<environment^> [options]
echo.
echo Commands:
echo     start       Start services
echo     stop        Stop services
echo     restart     Restart services
echo     logs        View logs
echo     status      Show service status
echo     exec        Execute command in container
echo     cleanup     Stop services and remove volumes
echo     help        Show this help message
echo.
echo Environments:
echo     dev         Development environment (hot reload enabled)
echo     prod        Production environment (optimized builds)
echo.
echo Examples:
echo     %~nx0 start dev                    # Start development environment
echo     %~nx0 stop prod                    # Stop production environment
echo     %~nx0 logs dev backend             # View backend logs in dev
echo     %~nx0 exec dev frontend sh         # Open shell in frontend container
echo     %~nx0 cleanup dev                  # Clean up development environment
echo.
goto end

:end
endlocal
