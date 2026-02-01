FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["WorkflowManagementSystem.csproj", "./"]
RUN dotnet restore "WorkflowManagementSystem.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "WorkflowManagementSystem.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WorkflowManagementSystem.csproj" -c Release -o /app/publish

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 7500

# Set environment
ENV ASPNETCORE_URLS=http://+:7500
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "WorkflowManagementSystem.dll"]
