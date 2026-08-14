# ============================================
# Stage 1 — Build do backend Java/Spring Boot
# ============================================
FROM eclipse-temurin:21-jdk-jammy AS build

# Instalar Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar ficheiros Maven primeiro (melhor cache de camadas)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código-fonte e compilar
COPY src ./src
RUN mvn package -DskipTests -B

# ============================================
# Stage 2 — Runtime leve com JRE 21
# ============================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Criar utilizador não-root para segurança
RUN groupadd -r spring && useradd -r -g spring spring

COPY --from=build /app/target/*.jar app.jar

# Criar directório para uploads
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
