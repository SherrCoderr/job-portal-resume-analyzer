package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.service.SkillParserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class SkillParserServiceImpl implements SkillParserService {

    // Canonical display name -> List of lookup patterns/aliases
    private static final Map<String, List<String>> SKILL_DICTIONARY = new LinkedHashMap<>();

    static {
        // Backend & Languages
        addSkill("Java", "java", "core java", "java 8", "java 11", "java 17", "java 21", "j2ee");
        addSkill("Python", "python", "python3", "python 3");
        addSkill("JavaScript", "javascript", "js", "ecmascript", "es6");
        addSkill("TypeScript", "typescript", "ts");
        addSkill("C++", "c\\+\\+", "cpp");
        addSkill("C#", "c#", "csharp", "c sharp");
        addSkill("C", "\\bc\\b");
        addSkill("Go", "\\bgo\\b", "golang");
        addSkill("Rust", "\\brust\\b");
        addSkill("PHP", "\\bphp\\b", "php7", "php8");
        addSkill("Ruby", "\\bruby\\b", "ruby on rails", "rails");
        addSkill("Kotlin", "kotlin");
        addSkill("Swift", "\\bswift\\b");
        addSkill("Scala", "scala");
        addSkill("SQL", "\\bsql\\b", "t-sql", "pl-sql", "pl/sql");
        addSkill("Bash", "\\bbash\\b", "shell scripting", "shell script");

        // Web & Frontend Frameworks
        addSkill("React", "react", "react.js", "reactjs");
        addSkill("Angular", "angular", "angularjs", "angular 2+");
        addSkill("Vue.js", "vue", "vue.js", "vuejs");
        addSkill("Next.js", "next.js", "nextjs");
        addSkill("Node.js", "node", "node.js", "nodejs");
        addSkill("Express.js", "express", "express.js", "expressjs");
        addSkill("HTML", "html", "html5");
        addSkill("CSS", "css", "css3");
        addSkill("Tailwind CSS", "tailwind", "tailwindcss", "tailwind css");
        addSkill("Bootstrap", "bootstrap", "bootstrap 5");
        addSkill("Redux", "redux", "redux toolkit");
        addSkill("GraphQL", "graphql", "apollo graphql");
        addSkill("REST API", "rest", "rest api", "restful", "restful api", "rest apis");

        // Backend Frameworks
        addSkill("Spring Boot", "spring boot", "springboot");
        addSkill("Spring Framework", "spring framework", "spring mvc", "spring data", "spring security");
        addSkill("Hibernate", "hibernate", "jpa", "spring data jpa");
        addSkill("Django", "django", "django rest framework");
        addSkill("Flask", "flask");
        addSkill("FastAPI", "fastapi", "fast api");
        addSkill(".NET", "\\.net", "dotnet", "asp\\.net", "asp\\.net core", "\\.net core");
        addSkill("Laravel", "laravel");

        // Databases & Storage
        addSkill("PostgreSQL", "postgresql", "postgres", "psql");
        addSkill("MySQL", "mysql");
        addSkill("MongoDB", "mongodb", "mongo");
        addSkill("Redis", "redis");
        addSkill("Oracle DB", "oracle db", "oracle database");
        addSkill("Elasticsearch", "elasticsearch", "elastic search");
        addSkill("SQLite", "sqlite");
        addSkill("DynamoDB", "dynamodb");
        addSkill("Cassandra", "cassandra");

        // Cloud & DevOps
        addSkill("Docker", "docker", "containerization", "containers");
        addSkill("Kubernetes", "kubernetes", "k8s");
        addSkill("AWS", "\\baws\\b", "amazon web services", "amazon ec2", "aws s3", "aws lambda");
        addSkill("Microsoft Azure", "azure", "microsoft azure");
        addSkill("Google Cloud (GCP)", "gcp", "google cloud", "google cloud platform");
        addSkill("CI/CD", "ci/cd", "ci-cd", "continuous integration", "continuous deployment");
        addSkill("Jenkins", "jenkins");
        addSkill("GitHub Actions", "github actions");
        addSkill("GitLab CI", "gitlab ci");
        addSkill("Terraform", "terraform");
        addSkill("Ansible", "ansible");
        addSkill("Linux", "linux", "ubuntu", "centos", "redhat", "unix");
        addSkill("Nginx", "nginx");
        addSkill("Apache", "apache server", "apache httpd");

        // Messaging & Architecture
        addSkill("Apache Kafka", "kafka", "apache kafka");
        addSkill("RabbitMQ", "rabbitmq");
        addSkill("Microservices", "microservices", "microservice architecture", "micro-services");
        addSkill("WebSockets", "websocket", "websockets");
        addSkill("JWT", "jwt", "json web token");
        addSkill("OAuth", "oauth", "oauth2", "oauth 2.0");

        // Testing & Tools
        addSkill("Git", "\\bgit\\b", "github", "gitlab", "bitbucket");
        addSkill("Maven", "maven");
        addSkill("Gradle", "gradle");
        addSkill("JUnit", "junit", "junit 5");
        addSkill("Mockito", "mockito");
        addSkill("Jest", "\\bjest\\b");
        addSkill("Cypress", "cypress");
        addSkill("Postman", "postman");
        addSkill("Swagger/OpenAPI", "swagger", "openapi");
        addSkill("Agile/Scrum", "agile", "scrum", "kanban", "jira");
        addSkill("Object-Oriented Programming (OOP)", "oop", "object oriented programming");
        addSkill("Data Structures & Algorithms", "data structures", "algorithms", "dsa");
    }

    private static void addSkill(String canonicalName, String... patterns) {
        SKILL_DICTIONARY.put(canonicalName, Arrays.asList(patterns));
    }

    @Override
    public List<String> extractSkillsFromText(String text) {
        if (!StringUtils.hasText(text)) {
            return Collections.emptyList();
        }

        String lowerText = " " + text.toLowerCase() + " ";
        Set<String> identifiedSkills = new LinkedHashSet<>();

        for (Map.Entry<String, List<String>> entry : SKILL_DICTIONARY.entrySet()) {
            String canonicalSkill = entry.getKey();
            List<String> patterns = entry.getValue();

            for (String p : patterns) {
                // If pattern is a regex like \b...\b, use regex Matcher; otherwise use whole-word boundary
                String regex = p.startsWith("\\b") || p.contains("\\+") || p.contains("\\.")
                        ? p
                        : "(?<![a-zA-Z0-9_])" + Pattern.quote(p) + "(?![a-zA-Z0-9_])";

                Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(lowerText);

                if (matcher.find()) {
                    identifiedSkills.add(canonicalSkill);
                    break; // Move to next canonical skill once found
                }
            }
        }

        log.info("Identified {} skills from input text: {}", identifiedSkills.size(), identifiedSkills);
        return new ArrayList<>(identifiedSkills);
    }

    @Override
    public List<String> getSupportedSkills() {
        return new ArrayList<>(SKILL_DICTIONARY.keySet());
    }
}
