package com.careerportal.controller;

import com.careerportal.dto.AIRequest;
import com.careerportal.dto.AIResponse;
import com.careerportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    @PostMapping("/chat")
    public ResponseEntity<AIResponse> processChatMessage(
            @RequestBody AIRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Basic fallback response without AI service
        String fallbackResponse = "I'm sorry, the AI assistant is currently unavailable. " +
                "You can still browse jobs, update your profile, and manage applications through the main interface.";

        AIResponse response = AIResponse.builder()
                .response(fallbackResponse)
                .confidence(0.5)
                .processingTime(100L)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resume/analyze")
    public ResponseEntity<Map<String, Object>> analyzeResume(
            @RequestParam String resumeText,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Basic fallback resume analysis without AI service
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("score", 70);
        analysis.put("strengths", Arrays.asList("Clear structure", "Professional format"));
        analysis.put("improvements", Arrays.asList("Add more quantifiable achievements", "Include specific skills"));
        analysis.put("skills", Arrays.asList("Communication", "Problem solving"));
        analysis.put("atsScore", 65);
        analysis.put("recommendations", Arrays.asList(
                "Focus on achievements over responsibilities",
                "Use strong action verbs",
                "Tailor resume for specific job applications"
        ));

        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/recommendations/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobRecommendations(
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String experienceLevel,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Basic fallback job recommendations without AI service
        List<Map<String, Object>> recommendations = new ArrayList<>();
        recommendations.add(Map.of(
                "title", "Software Developer",
                "company", "Tech Solutions Inc",
                "location", location != null ? location : "Remote",
                "salaryRange", "$60k-$90k",
                "matchPercentage", 75
        ));
        recommendations.add(Map.of(
                "title", "Project Manager",
                "company", "Business Corp",
                "location", location != null ? location : "On-site",
                "salaryRange", "$70k-$100k",
                "matchPercentage", 70
        ));

        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/sentiment/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSentiment(@RequestParam String text) {
        // Basic fallback sentiment analysis without AI service
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("sentiment", "NEUTRAL");
        analysis.put("confidence", 0.6);
        analysis.put("emotions", Arrays.asList("neutral"));
        analysis.put("responseTone", "professional");

        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/recommendations/career")
    public ResponseEntity<List<Map<String, Object>>> getCareerRecommendations(
            @AuthenticationPrincipal UserPrincipal principal) {
        // Basic fallback career recommendations without AI service
        List<Map<String, Object>> recommendations = new ArrayList<>();
        recommendations.add(Map.of(
                "type", "skill",
                "title", "Learn Leadership Skills",
                "description", "Develop leadership and team management skills",
                "matchPercentage", 80
        ));
        recommendations.add(Map.of(
                "type", "job",
                "title", "Senior Developer",
                "description", "Consider advancing to senior developer role",
                "matchPercentage", 75
        ));

        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/skills/match-job")
    public ResponseEntity<Map<String, Object>> matchSkillsToJob(
            @RequestParam List<String> userSkills,
            @RequestParam String jobTitle,
            @RequestParam String jobDescription,
            @RequestParam List<String> requiredSkills,
            @RequestParam String company) {
        // Basic fallback skill matching without AI service
        Map<String, Object> match = new HashMap<>();
        match.put("jobTitle", jobTitle);
        match.put("company", company);
        match.put("overallMatchScore", 65);
        match.put("matchedSkills", Arrays.asList("communication", "problem-solving"));
        match.put("missingSkills", Arrays.asList("technical-skills", "domain-expertise"));
        match.put("matchAnalysis", "Basic skill matching performed. Consider getting detailed analysis from career advisors.");

        return ResponseEntity.ok(match);
    }

    @PostMapping("/skills/analyze-gaps")
    public ResponseEntity<Map<String, Object>> analyzeSkillGaps(
            @RequestParam List<String> currentSkills,
            @RequestParam String targetRole,
            @RequestParam List<String> requiredSkills) {
        // Basic fallback skill gap analysis without AI service
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("currentSkills", currentSkills);
        analysis.put("requiredSkills", requiredSkills);
        analysis.put("skillGaps", Arrays.asList("advanced-technical-skills", "leadership"));
        analysis.put("gapPriorities", Map.of("advanced-technical-skills", 5, "leadership", 4));
        analysis.put("learningRecommendations", Arrays.asList("Take online courses", "Get mentorship", "Practice projects"));
        analysis.put("timeToCompetency", 6);

        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/skills/development-plan")
    public ResponseEntity<Map<String, Object>> generateSkillDevelopmentPlan(
            @RequestParam List<String> currentSkills,
            @RequestParam String careerGoal,
            @RequestParam(defaultValue = "6") int timeFrameMonths) {
        // Basic fallback skill development plan without AI service
        Map<String, Object> plan = new HashMap<>();
        plan.put("immediateSkills", Arrays.asList("Learn basics", "Practice fundamentals"));
        plan.put("intermediateSkills", Arrays.asList("Build projects", "Study documentation"));
        plan.put("advancedSkills", Arrays.asList("Contribute to open source", "Get mentorship"));
        plan.put("resources", Arrays.asList("Online tutorials", "Practice coding", "Join communities"));
        plan.put("milestones", Arrays.asList("Complete first project", "Get feedback", "Apply for jobs"));

        return ResponseEntity.ok(plan);
    }

    @PostMapping("/translate/detect")
    public ResponseEntity<Map<String, Object>> detectLanguage(@RequestParam String text) {
        // Basic fallback language detection without AI service
        Map<String, Object> result = new HashMap<>();
        result.put("detectedLanguage", "en");
        result.put("languageName", "English");
        result.put("confidence", 0.6);
        result.put("alternatives", Arrays.asList());
        result.put("analysis", Map.of("textLength", text.length()));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/translate")
    public ResponseEntity<Map<String, Object>> translateText(
            @RequestParam String text,
            @RequestParam String targetLanguage,
            @RequestParam(required = false) String sourceLanguage) {
        // Basic fallback translation without AI service
        Map<String, Object> result = new HashMap<>();
        result.put("originalText", text);
        result.put("translatedText", text); // Return original text as fallback
        result.put("sourceLanguage", sourceLanguage != null ? sourceLanguage : "en");
        result.put("targetLanguage", targetLanguage);
        result.put("confidence", 0.0);
        result.put("metadata", Map.of("note", "Translation service temporarily unavailable"));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/translate/localized-responses")
    public ResponseEntity<Map<String, String>> getLocalizedResponses(
            @RequestParam(defaultValue = "en") String languageCode) {
        // Basic fallback localized responses without AI service
        Map<String, String> responses = new HashMap<>();
        responses.put("greeting", "Hello! How can I help you?");
        responses.put("help", "I can help you with various tasks.");
        responses.put("error", "Sorry, something went wrong.");
        responses.put("thanks", "You're welcome!");
        responses.put("goodbye", "Goodbye!");

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/translate/supported-languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        Map<String, String> supported = Map.of(
            "en", "English",
            "es", "Spanish",
            "fr", "French",
            "de", "German",
            "hi", "Hindi",
            "zh", "Chinese",
            "ja", "Japanese",
            "ko", "Korean"
        );
        return ResponseEntity.ok(Map.of(
            "supportedLanguages", supported,
            "totalSupported", supported.size()
        ));
    }

    // Analytics Endpoints
    @PostMapping("/analytics/conversation/start")
    public ResponseEntity<Map<String, String>> startConversationAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        // Basic fallback analytics without AI service
        String conversationId = "conv_" + System.currentTimeMillis();
        return ResponseEntity.ok(Map.of("conversationId", conversationId));
    }

    @PostMapping("/analytics/conversation/message")
    public ResponseEntity<Void> recordMessageAnalytics(
            @RequestParam String conversationId,
            @RequestParam String sender,
            @RequestParam String message,
            @RequestParam(required = false) String intent,
            @RequestParam(defaultValue = "0.0") double confidence,
            @RequestParam(defaultValue = "0") long responseTime) {
        // Analytics recording disabled without AI service
        return ResponseEntity.ok().build();
    }

    @PostMapping("/analytics/feature-usage")
    public ResponseEntity<Void> recordFeatureUsageAnalytics(
            @RequestParam String conversationId,
            @RequestParam String featureName) {
        // Analytics recording disabled without AI service
        return ResponseEntity.ok().build();
    }

    @PostMapping("/analytics/satisfaction")
    public ResponseEntity<Void> recordSatisfactionAnalytics(
            @RequestParam String conversationId,
            @RequestParam int satisfactionScore) {
        // Analytics recording disabled without AI service
        return ResponseEntity.ok().build();
    }

    @PostMapping("/analytics/conversation/end")
    public ResponseEntity<Map<String, Object>> endConversationAnalytics(@RequestParam String conversationId) {
        // Basic fallback analytics summary without AI service
        Map<String, Object> summary = new HashMap<>();
        summary.put("conversationId", conversationId);
        summary.put("durationMinutes", 5);
        summary.put("messageCount", 10);
        summary.put("averageResponseTime", 2000L);
        summary.put("satisfactionScore", 4);
        summary.put("topicsDiscussed", Arrays.asList("jobs", "applications"));

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard() {
        // Basic fallback analytics dashboard without AI service
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalConversations", 150);
        dashboard.put("averageSatisfaction", 4.2);
        dashboard.put("popularTopics", Arrays.asList("jobs", "applications", "profiles"));
        dashboard.put("responseTime", 1500L);
        dashboard.put("featureUsage", Map.of("chat", 80, "resume", 60, "recommendations", 40));

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/analytics/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserAnalytics(@PathVariable String userId) {
        // Basic fallback user analytics without AI service
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("userId", userId);
        analytics.put("totalConversations", 5);
        analytics.put("averageSatisfaction", 4.5);
        analytics.put("preferredTopics", Arrays.asList("job search", "applications"));
        analytics.put("lastActivity", "2024-01-15");

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceInsights() {
        // Basic fallback performance insights without AI service
        Map<String, Object> insights = new HashMap<>();
        insights.put("averageResponseTime", 1200L);
        insights.put("successRate", 0.85);
        insights.put("userRetention", 0.75);
        insights.put("peakUsageHours", Arrays.asList(9, 10, 14, 15));
        insights.put("improvementAreas", Arrays.asList("response speed", "feature coverage"));

        return ResponseEntity.ok(insights);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAIHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "limited",
            "provider", "none",
            "features", List.of("basic_chat", "resume_analysis", "recommendations", "sentiment", "career_guidance"),
            "note", "AI service has been removed - using basic fallback responses"
        ));
    }
}