FROM maven:3-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src src

# Instala as dependências e constrói o jar
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
