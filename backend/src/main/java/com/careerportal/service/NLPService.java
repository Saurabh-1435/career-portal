package com.careerportal.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
public class NLPService {

    // Intent categories
    public enum Intent {
        JOB_SEARCH, APPLICATION_STATUS, RESUME_ANALYSIS, COMPANY_INFO,
        CAREER_ADVICE, PROFILE_UPDATE, ACCOUNT_HELP, GENERAL_HELP,
        GREETING, GRATITUDE, COMPLAINT, UNKNOWN
    }

    // Entity types
    public enum EntityType {
        JOB_TITLE, SKILL, LOCATION, COMPANY, SALARY_RANGE,
        EXPERIENCE_LEVEL, INDUSTRY, DATE, EMAIL
    }

    public static class IntentResult {
        private Intent intent;
        private double confidence;
        private Map<String, Object> entities;
        private List<String> keywords;

        public IntentResult(Intent intent, double confidence, Map<String, Object> entities, List<String> keywords) {
            this.intent = intent;
            this.confidence = confidence;
            this.entities = entities;
            this.keywords = keywords;
        }

        // Getters
        public Intent getIntent() { return intent; }
        public double getConfidence() { return confidence; }
        public Map<String, Object> getEntities() { return entities; }
        public List<String> getKeywords() { return keywords; }
    }

    /**
     * Analyze user message for intent and entities
     */
    public IntentResult analyzeIntent(String message) {
        String lowerMessage = message.toLowerCase().trim();
        Map<String, Object> entities = extractEntities(lowerMessage);
        List<String> keywords = extractKeywords(lowerMessage);

        // Job search intents
        if (matchesJobSearch(lowerMessage)) {
            return new IntentResult(Intent.JOB_SEARCH, 0.9, entities, keywords);
        }

        // Application status intents
        if (matchesApplicationStatus(lowerMessage)) {
            return new IntentResult(Intent.APPLICATION_STATUS, 0.85, entities, keywords);
        }

        // Resume analysis intents
        if (matchesResumeAnalysis(lowerMessage)) {
            return new IntentResult(Intent.RESUME_ANALYSIS, 0.88, entities, keywords);
        }

        // Company information intents
        if (matchesCompanyInfo(lowerMessage)) {
            return new IntentResult(Intent.COMPANY_INFO, 0.82, entities, keywords);
        }

        // Career advice intents
        if (matchesCareerAdvice(lowerMessage)) {
            return new IntentResult(Intent.CAREER_ADVICE, 0.8, entities, keywords);
        }

        // Profile update intents
        if (matchesProfileUpdate(lowerMessage)) {
            return new IntentResult(Intent.PROFILE_UPDATE, 0.75, entities, keywords);
        }

        // Account help intents
        if (matchesAccountHelp(lowerMessage)) {
            return new IntentResult(Intent.ACCOUNT_HELP, 0.7, entities, keywords);
        }

        // Greeting intents
        if (matchesGreeting(lowerMessage)) {
            return new IntentResult(Intent.GREETING, 0.95, entities, keywords);
        }

        // Gratitude intents
        if (matchesGratitude(lowerMessage)) {
            return new IntentResult(Intent.GRATITUDE, 0.9, entities, keywords);
        }

        // Complaint intents
        if (matchesComplaint(lowerMessage)) {
            return new IntentResult(Intent.COMPLAINT, 0.8, entities, keywords);
        }

        // General help intents
        if (matchesGeneralHelp(lowerMessage)) {
            return new IntentResult(Intent.GENERAL_HELP, 0.6, entities, keywords);
        }

        return new IntentResult(Intent.UNKNOWN, 0.3, entities, keywords);
    }

    /**
     * Extract entities from message
     */
    private Map<String, Object> extractEntities(String message) {
        Map<String, Object> entities = new HashMap<>();

        // Extract job titles
        List<String> jobTitles = extractJobTitles(message);
        if (!jobTitles.isEmpty()) {
            entities.put("jobTitles", jobTitles);
        }

        // Extract skills
        List<String> skills = extractSkills(message);
        if (!skills.isEmpty()) {
            entities.put("skills", skills);
        }

        // Extract locations
        List<String> locations = extractLocations(message);
        if (!locations.isEmpty()) {
            entities.put("locations", locations);
        }

        // Extract companies
        List<String> companies = extractCompanies(message);
        if (!companies.isEmpty()) {
            entities.put("companies", companies);
        }

        // Extract salary ranges
        String salaryRange = extractSalaryRange(message);
        if (salaryRange != null) {
            entities.put("salaryRange", salaryRange);
        }

        // Extract experience levels
        String experienceLevel = extractExperienceLevel(message);
        if (experienceLevel != null) {
            entities.put("experienceLevel", experienceLevel);
        }

        return entities;
    }

    /**
     * Extract keywords from message
     */
    private List<String> extractKeywords(String message) {
        List<String> keywords = new ArrayList<>();
        String[] words = message.split("\\s+");

        // Common career-related keywords
        Set<String> careerKeywords = Set.of(
            "job", "career", "resume", "cv", "interview", "salary", "company",
            "application", "hiring", "skills", "experience", "profile", "account",
            "help", "support", "find", "search", "apply", "update", "create",
            "view", "check", "status", "dashboard", "login", "register"
        );

        for (String word : words) {
            String cleanWord = word.replaceAll("[^a-zA-Z]", "").toLowerCase();
            if (cleanWord.length() > 2 && careerKeywords.contains(cleanWord)) {
                keywords.add(cleanWord);
            }
        }

        return keywords.stream().distinct().toList();
    }

    // Intent matching methods
    private boolean matchesJobSearch(String message) {
        return Pattern.compile("\\b(find|search|looking|browse|jobs?|positions?|opportunities?)\\b").matcher(message).find() ||
               message.contains("hire") || message.contains("work") || message.contains("employment");
    }

    private boolean matchesApplicationStatus(String message) {
        return message.contains("status") || message.contains("application") ||
               message.contains("applied") || message.contains("progress") ||
               Pattern.compile("\\b(my|check|view)\\b.*\\b(application|job|position)\\b").matcher(message).find();
    }

    private boolean matchesResumeAnalysis(String message) {
        return message.contains("resume") || message.contains("cv") ||
               message.contains("analyze") || message.contains("review") ||
               message.contains("feedback") || message.contains("improve");
    }

    private boolean matchesCompanyInfo(String message) {
        return message.contains("company") || message.contains("employer") ||
               message.contains("organization") || message.contains("about") ||
               Pattern.compile("\\btell me about\\b").matcher(message).find();
    }

    private boolean matchesCareerAdvice(String message) {
        return message.contains("career") || message.contains("advice") ||
               message.contains("tips") || message.contains("guidance") ||
               message.contains("help me") || message.contains("interview");
    }

    private boolean matchesProfileUpdate(String message) {
        return message.contains("profile") || message.contains("update") ||
               message.contains("change") || message.contains("edit") ||
               message.contains("modify");
    }

    private boolean matchesAccountHelp(String message) {
        return message.contains("login") || message.contains("password") ||
               message.contains("account") || message.contains("register") ||
               message.contains("sign up") || message.contains("forgot");
    }

    private boolean matchesGreeting(String message) {
        return Pattern.compile("\\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\\b").matcher(message).find();
    }

    private boolean matchesGratitude(String message) {
        return Pattern.compile("\\b(thank|thanks|appreciate|grateful)\\b").matcher(message).find();
    }

    private boolean matchesComplaint(String message) {
        return message.contains("problem") || message.contains("issue") ||
               message.contains("wrong") || message.contains("error") ||
               message.contains("bad") || message.contains("terrible");
    }

    private boolean matchesGeneralHelp(String message) {
        return message.contains("help") || message.contains("assist") ||
               message.contains("support") || message.contains("guide");
    }

    // Entity extraction methods
    private List<String> extractJobTitles(String message) {
        List<String> jobTitles = new ArrayList<>();

        // Common job titles and patterns
        String[] commonTitles = {
            "software engineer", "software developer", "web developer", "full stack developer",
            "frontend developer", "backend developer", "data analyst", "data scientist",
            "product manager", "project manager", "designer", "ux designer", "ui designer",
            "marketing manager", "sales representative", "business analyst", "devops engineer",
            "system administrator", "database administrator", "mobile developer", "ios developer",
            "android developer", "qa engineer", "quality assurance", "tester"
        };

        for (String title : commonTitles) {
            if (message.contains(title)) {
                jobTitles.add(title);
            }
        }

        return jobTitles.stream().distinct().toList();
    }

    private List<String> extractSkills(String message) {
        List<String> skills = new ArrayList<>();

        // Common technical skills
        String[] technicalSkills = {
            "javascript", "python", "java", "c++", "c#", "php", "ruby", "go", "rust",
            "react", "angular", "vue", "node.js", "express", "django", "spring boot",
            "sql", "mysql", "postgresql", "mongodb", "redis", "aws", "azure", "docker",
            "kubernetes", "git", "jenkins", "html", "css", "sass", "typescript"
        };

        for (String skill : technicalSkills) {
            if (message.contains(skill)) {
                skills.add(skill);
            }
        }

        return skills.stream().distinct().toList();
    }

    private List<String> extractLocations(String message) {
        List<String> locations = new ArrayList<>();

        // Common locations
        String[] commonLocations = {
            "new york", "san francisco", "los angeles", "chicago", "houston", "phoenix",
            "philadelphia", "san antonio", "san diego", "dallas", "bangalore", "mumbai",
            "delhi", "chennai", "pune", "hyderabad", "remote", "work from home"
        };

        for (String location : commonLocations) {
            if (message.contains(location)) {
                locations.add(location);
            }
        }

        return locations.stream().distinct().toList();
    }

    private List<String> extractCompanies(String message) {
        List<String> companies = new ArrayList<>();

        // Well-known companies
        String[] knownCompanies = {
            "google", "microsoft", "amazon", "apple", "facebook", "meta", "netflix",
            "uber", "airbnb", "spotify", "twitter", "linkedin", "instagram", "tiktok",
            "tesla", "ford", "toyota", "bmw", "mercedes"
        };

        for (String company : knownCompanies) {
            if (message.contains(company)) {
                companies.add(company);
            }
        }

        return companies.stream().distinct().toList();
    }

    private String extractSalaryRange(String message) {
        // Simple salary extraction - can be enhanced with more sophisticated parsing
        if (message.contains("$") || message.contains("salary") || message.contains("pay")) {
            if (message.contains("100k") || message.contains("100000")) return "$100,000+";
            if (message.contains("80k") || message.contains("80000")) return "$80,000 - $120,000";
            if (message.contains("60k") || message.contains("60000")) return "$60,000 - $90,000";
            if (message.contains("40k") || message.contains("40000")) return "$40,000 - $70,000";
        }
        return null;
    }

    private String extractExperienceLevel(String message) {
        if (message.contains("senior") || message.contains("experienced") || message.contains("expert")) {
            return "SENIOR";
        }
        if (message.contains("junior") || message.contains("entry") || message.contains("beginner")) {
            return "ENTRY";
        }
        if (message.contains("mid") || message.contains("intermediate")) {
            return "MID";
        }
        return null;
    }

    /**
     * Generate contextual responses based on intent
     */
    public String generateContextualResponse(Intent intent, Map<String, Object> entities, String originalMessage) {
        switch (intent) {
            case JOB_SEARCH:
                return generateJobSearchResponse(entities);
            case APPLICATION_STATUS:
                return "I'll help you check your application status. Let me fetch your current applications.";
            case RESUME_ANALYSIS:
                return "I can analyze your resume and provide detailed feedback. Would you like me to review your current resume or give general tips?";
            case COMPANY_INFO:
                return generateCompanyInfoResponse(entities);
            case CAREER_ADVICE:
                return "I'd be happy to provide career advice! What specific aspect would you like guidance on - interviews, skill development, or career planning?";
            case PROFILE_UPDATE:
                return "I can guide you through updating your profile. What would you like to update - resume, skills, experience, or contact information?";
            case ACCOUNT_HELP:
                return "I can help with account-related issues. Are you having trouble logging in, need to reset your password, or have questions about registration?";
            case GREETING:
                return "Hello! I'm here to help you with your career journey. What can I assist you with today?";
            case GRATITUDE:
                return "You're welcome! I'm glad I could help. Is there anything else you'd like assistance with?";
            case COMPLAINT:
                return "I'm sorry to hear you're experiencing issues. Let me help resolve this. Can you tell me more about what's not working?";
            default:
                return "I'm here to help! You can ask me about job searching, application tracking, resume advice, company information, or career guidance.";
        }
    }

    private String generateJobSearchResponse(Map<String, Object> entities) {
        StringBuilder response = new StringBuilder("I'll help you find the perfect job! ");

        if (entities.containsKey("jobTitles") && !((List<?>) entities.get("jobTitles")).isEmpty()) {
            List<String> titles = (List<String>) entities.get("jobTitles");
            response.append("I see you're interested in ").append(String.join(", ", titles)).append(" positions. ");
        }

        if (entities.containsKey("skills") && !((List<?>) entities.get("skills")).isEmpty()) {
            List<String> skills = (List<String>) entities.get("skills");
            response.append("Your skills in ").append(String.join(", ", skills)).append(" are valuable. ");
        }

        if (entities.containsKey("locations") && !((List<?>) entities.get("locations")).isEmpty()) {
            List<String> locations = (List<String>) entities.get("locations");
            response.append("I can search for opportunities in ").append(String.join(", ", locations)).append(". ");
        }

        response.append("Let me search for matching jobs for you.");
        return response.toString();
    }

    private String generateCompanyInfoResponse(Map<String, Object> entities) {
        if (entities.containsKey("companies") && !((List<?>) entities.get("companies")).isEmpty()) {
            List<String> companies = (List<String>) entities.get("companies");
            return "I'd be happy to tell you about " + String.join(", ", companies) + ". Let me fetch the latest information about these companies.";
        }
        return "I'd be happy to provide information about companies. Which company are you interested in learning about?";
    }
}