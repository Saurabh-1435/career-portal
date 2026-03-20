package com.careerportal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotAnalyticsService {

    // In-memory storage for analytics (in production, use Redis or database)
    private final Map<String, ConversationAnalytics> activeConversations = new ConcurrentHashMap<>();
    private final Map<String, UserAnalytics> userAnalytics = new ConcurrentHashMap<>();
    private final List<ConversationEvent> conversationEvents = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, PerformanceMetrics> performanceMetrics = new ConcurrentHashMap<>();

    public static class ConversationAnalytics {
        private String conversationId;
        private String userId;
        private LocalDateTime startTime;
        private LocalDateTime lastActivity;
        private int messageCount;
        private int userMessageCount;
        private int botMessageCount;
        private Map<String, Integer> intentCounts;
        private Map<String, Double> averageConfidenceByIntent;
        private long totalResponseTime;
        private List<String> topicsDiscussed;
        private Map<String, Integer> featureUsage;
        private String userLanguage;
        private boolean usedVoiceInput;
        private boolean usedTranslation;
        private int satisfactionScore; // 1-5 scale, -1 if not rated

        public ConversationAnalytics(String conversationId, String userId) {
            this.conversationId = conversationId;
            this.userId = userId;
            this.startTime = LocalDateTime.now();
            this.lastActivity = LocalDateTime.now();
            this.intentCounts = new HashMap<>();
            this.averageConfidenceByIntent = new HashMap<>();
            this.topicsDiscussed = new ArrayList<>();
            this.featureUsage = new HashMap<>();
            this.satisfactionScore = -1; // Not rated
        }

        // Getters and setters
        public String getConversationId() { return conversationId; }
        public String getUserId() { return userId; }
        public LocalDateTime getStartTime() { return startTime; }
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        public int getMessageCount() { return messageCount; }
        public void setMessageCount(int messageCount) { this.messageCount = messageCount; }
        public int getUserMessageCount() { return userMessageCount; }
        public void setUserMessageCount(int userMessageCount) { this.userMessageCount = userMessageCount; }
        public int getBotMessageCount() { return botMessageCount; }
        public void setBotMessageCount(int botMessageCount) { this.botMessageCount = botMessageCount; }
        public Map<String, Integer> getIntentCounts() { return intentCounts; }
        public Map<String, Double> getAverageConfidenceByIntent() { return averageConfidenceByIntent; }
        public long getTotalResponseTime() { return totalResponseTime; }
        public void setTotalResponseTime(long totalResponseTime) { this.totalResponseTime = totalResponseTime; }
        public List<String> getTopicsDiscussed() { return topicsDiscussed; }
        public Map<String, Integer> getFeatureUsage() { return featureUsage; }
        public String getUserLanguage() { return userLanguage; }
        public void setUserLanguage(String userLanguage) { this.userLanguage = userLanguage; }
        public boolean isUsedVoiceInput() { return usedVoiceInput; }
        public void setUsedVoiceInput(boolean usedVoiceInput) { this.usedVoiceInput = usedVoiceInput; }
        public boolean isUsedTranslation() { return usedTranslation; }
        public void setUsedTranslation(boolean usedTranslation) { this.usedTranslation = usedTranslation; }
        public int getSatisfactionScore() { return satisfactionScore; }
        public void setSatisfactionScore(int satisfactionScore) { this.satisfactionScore = satisfactionScore; }

        public long getDurationMinutes() {
            return ChronoUnit.MINUTES.between(startTime, lastActivity);
        }

        public double getAverageResponseTime() {
            return botMessageCount > 0 ? (double) totalResponseTime / botMessageCount : 0;
        }
    }

    public static class UserAnalytics {
        private String userId;
        private LocalDateTime firstInteraction;
        private LocalDateTime lastInteraction;
        private int totalConversations;
        private int totalMessages;
        private Map<String, Integer> preferredIntents;
        private Map<String, Integer> featureUsage;
        private String primaryLanguage;
        private double averageSatisfaction;
        private List<String> interests;
        private Map<String, Integer> interactionPatterns; // hour -> count

        public UserAnalytics(String userId) {
            this.userId = userId;
            this.firstInteraction = LocalDateTime.now();
            this.lastInteraction = LocalDateTime.now();
            this.preferredIntents = new HashMap<>();
            this.featureUsage = new HashMap<>();
            this.interests = new ArrayList<>();
            this.interactionPatterns = new HashMap<>();
        }

        // Getters and setters
        public String getUserId() { return userId; }
        public LocalDateTime getFirstInteraction() { return firstInteraction; }
        public LocalDateTime getLastInteraction() { return lastInteraction; }
        public void setLastInteraction(LocalDateTime lastInteraction) { this.lastInteraction = lastInteraction; }
        public int getTotalConversations() { return totalConversations; }
        public void setTotalConversations(int totalConversations) { this.totalConversations = totalConversations; }
        public int getTotalMessages() { return totalMessages; }
        public void setTotalMessages(int totalMessages) { this.totalMessages = totalMessages; }
        public Map<String, Integer> getPreferredIntents() { return preferredIntents; }
        public Map<String, Integer> getFeatureUsage() { return featureUsage; }
        public String getPrimaryLanguage() { return primaryLanguage; }
        public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }
        public double getAverageSatisfaction() { return averageSatisfaction; }
        public void setAverageSatisfaction(double averageSatisfaction) { this.averageSatisfaction = averageSatisfaction; }
        public List<String> getInterests() { return interests; }
        public Map<String, Integer> getInteractionPatterns() { return interactionPatterns; }
    }

    public static class ConversationEvent {
        private String eventId;
        private String conversationId;
        private String userId;
        private String eventType;
        private LocalDateTime timestamp;
        private Map<String, Object> metadata;

        public ConversationEvent(String eventId, String conversationId, String userId, String eventType) {
            this.eventId = eventId;
            this.conversationId = conversationId;
            this.userId = userId;
            this.eventType = eventType;
            this.timestamp = LocalDateTime.now();
            this.metadata = new HashMap<>();
        }

        // Getters and setters
        public String getEventId() { return eventId; }
        public String getConversationId() { return conversationId; }
        public String getUserId() { return userId; }
        public String getEventType() { return eventType; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public Map<String, Object> getMetadata() { return metadata; }
    }

    public static class PerformanceMetrics {
        private String metricName;
        private LocalDateTime periodStart;
        private LocalDateTime periodEnd;
        private int totalConversations;
        private int totalMessages;
        private double averageResponseTime;
        private double averageConfidence;
        private Map<String, Integer> intentDistribution;
        private Map<String, Integer> featureUsage;
        private Map<String, Double> satisfactionByIntent;
        private double fallbackRate;

        public PerformanceMetrics(String metricName, LocalDateTime periodStart) {
            this.metricName = metricName;
            this.periodStart = periodStart;
            this.intentDistribution = new HashMap<>();
            this.featureUsage = new HashMap<>();
            this.satisfactionByIntent = new HashMap<>();
        }

        // Getters and setters
        public String getMetricName() { return metricName; }
        public LocalDateTime getPeriodStart() { return periodStart; }
        public LocalDateTime getPeriodEnd() { return periodEnd; }
        public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }
        public int getTotalConversations() { return totalConversations; }
        public void setTotalConversations(int totalConversations) { this.totalConversations = totalConversations; }
        public int getTotalMessages() { return totalMessages; }
        public void setTotalMessages(int totalMessages) { this.totalMessages = totalMessages; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public double getAverageConfidence() { return averageConfidence; }
        public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }
        public Map<String, Integer> getIntentDistribution() { return intentDistribution; }
        public Map<String, Integer> getFeatureUsage() { return featureUsage; }
        public Map<String, Double> getSatisfactionByIntent() { return satisfactionByIntent; }
        public double getFallbackRate() { return fallbackRate; }
        public void setFallbackRate(double fallbackRate) { this.fallbackRate = fallbackRate; }
    }

    /**
     * Start tracking a new conversation
     */
    public String startConversation(String userId) {
        String conversationId = UUID.randomUUID().toString();
        ConversationAnalytics analytics = new ConversationAnalytics(conversationId, userId);
        activeConversations.put(conversationId, analytics);

        // Update user analytics
        UserAnalytics userStats = userAnalytics.computeIfAbsent(userId, UserAnalytics::new);
        userStats.setLastInteraction(LocalDateTime.now());
        userStats.setTotalConversations(userStats.getTotalConversations() + 1);

        // Log event
        logEvent(conversationId, userId, "conversation_started");

        return conversationId;
    }

    /**
     * Record a message in the conversation
     */
    public void recordMessage(String conversationId, String sender, String message, String intent,
                             double confidence, long responseTime) {
        ConversationAnalytics analytics = activeConversations.get(conversationId);
        if (analytics == null) return;

        analytics.setLastActivity(LocalDateTime.now());
        analytics.setMessageCount(analytics.getMessageCount() + 1);

        if ("user".equals(sender)) {
            analytics.setUserMessageCount(analytics.getUserMessageCount() + 1);
        } else {
            analytics.setBotMessageCount(analytics.getBotMessageCount() + 1);
            analytics.setTotalResponseTime(analytics.getTotalResponseTime() + responseTime);
        }

        // Track intents
        if (intent != null) {
            analytics.getIntentCounts().merge(intent, 1, Integer::sum);

            // Update average confidence for this intent
            double currentAvg = analytics.getAverageConfidenceByIntent().getOrDefault(intent, 0.0);
            int count = analytics.getIntentCounts().get(intent);
            double newAvg = (currentAvg * (count - 1) + confidence) / count;
            analytics.getAverageConfidenceByIntent().put(intent, newAvg);
        }

        // Extract topics
        extractTopicsFromMessage(message, analytics.getTopicsDiscussed());

        // Update user analytics
        UserAnalytics userStats = userAnalytics.get(analytics.getUserId());
        if (userStats != null) {
            userStats.setTotalMessages(userStats.getTotalMessages() + 1);
            if (intent != null) {
                userStats.getPreferredIntents().merge(intent, 1, Integer::sum);
            }
        }

        // Log event
        logEvent(conversationId, analytics.getUserId(), "message_sent",
                Map.of("sender", sender, "intent", intent, "confidence", confidence));
    }

    /**
     * Record feature usage
     */
    public void recordFeatureUsage(String conversationId, String featureName) {
        ConversationAnalytics analytics = activeConversations.get(conversationId);
        if (analytics != null) {
            analytics.getFeatureUsage().merge(featureName, 1, Integer::sum);
        }

        // Special handling for certain features
        if ("voice_input".equals(featureName)) {
            analytics.setUsedVoiceInput(true);
        } else if ("translation".equals(featureName)) {
            analytics.setUsedTranslation(true);
        }

        // Update user analytics
        if (analytics != null) {
            UserAnalytics userStats = userAnalytics.get(analytics.getUserId());
            if (userStats != null) {
                userStats.getFeatureUsage().merge(featureName, 1, Integer::sum);
            }
        }

        logEvent(conversationId, analytics != null ? analytics.getUserId() : null,
                "feature_used", Map.of("feature", featureName));
    }

    /**
     * Record user satisfaction
     */
    public void recordSatisfaction(String conversationId, int satisfactionScore) {
        ConversationAnalytics analytics = activeConversations.get(conversationId);
        if (analytics != null) {
            analytics.setSatisfactionScore(satisfactionScore);

            // Update user analytics
            UserAnalytics userStats = userAnalytics.get(analytics.getUserId());
            if (userStats != null) {
                double currentAvg = userStats.getAverageSatisfaction();
                int totalRatings = userStats.getTotalConversations();
                userStats.setAverageSatisfaction((currentAvg * (totalRatings - 1) + satisfactionScore) / totalRatings);
            }
        }

        logEvent(conversationId, analytics != null ? analytics.getUserId() : null,
                "satisfaction_rated", Map.of("score", satisfactionScore));
    }

    /**
     * End conversation and archive analytics
     */
    public ConversationAnalytics endConversation(String conversationId) {
        ConversationAnalytics analytics = activeConversations.remove(conversationId);
        if (analytics != null) {
            analytics.setLastActivity(LocalDateTime.now());
            logEvent(conversationId, analytics.getUserId(), "conversation_ended");
        }
        return analytics;
    }

    /**
     * Get comprehensive analytics dashboard
     */
    public Map<String, Object> getAnalyticsDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Real-time metrics
        dashboard.put("activeConversations", activeConversations.size());
        dashboard.put("totalUsers", userAnalytics.size());

        // Conversation metrics
        List<ConversationAnalytics> allConversations = getAllConversationAnalytics();
        dashboard.put("totalConversations", allConversations.size());

        if (!allConversations.isEmpty()) {
            double avgDuration = allConversations.stream()
                .mapToLong(ConversationAnalytics::getDurationMinutes)
                .average()
                .orElse(0.0);
            dashboard.put("averageConversationDuration", avgDuration);

            double avgResponseTime = allConversations.stream()
                .mapToDouble(ConversationAnalytics::getAverageResponseTime)
                .average()
                .orElse(0.0);
            dashboard.put("averageResponseTime", avgResponseTime);

            double avgSatisfaction = allConversations.stream()
                .filter(c -> c.getSatisfactionScore() > 0)
                .mapToInt(ConversationAnalytics::getSatisfactionScore)
                .average()
                .orElse(0.0);
            dashboard.put("averageSatisfaction", avgSatisfaction);
        }

        // Intent distribution
        Map<String, Integer> intentDistribution = allConversations.stream()
            .flatMap(c -> c.getIntentCounts().entrySet().stream())
            .collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.summingInt(Map.Entry::getValue)
            ));
        dashboard.put("intentDistribution", intentDistribution);

        // Feature usage
        Map<String, Integer> featureUsage = allConversations.stream()
            .flatMap(c -> c.getFeatureUsage().entrySet().stream())
            .collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.summingInt(Map.Entry::getValue)
            ));
        dashboard.put("featureUsage", featureUsage);

        // Language distribution
        Map<String, Integer> languageDistribution = userAnalytics.values().stream()
            .filter(u -> u.getPrimaryLanguage() != null)
            .collect(Collectors.groupingBy(
                UserAnalytics::getPrimaryLanguage,
                Collectors.summingInt(u -> 1)
            ));
        dashboard.put("languageDistribution", languageDistribution);

        // Top topics
        List<String> topTopics = allConversations.stream()
            .flatMap(c -> c.getTopicsDiscussed().stream())
            .collect(Collectors.groupingBy(
                topic -> topic,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        dashboard.put("topTopics", topTopics);

        return dashboard;
    }

    /**
     * Get user-specific analytics
     */
    public Map<String, Object> getUserAnalytics(String userId) {
        UserAnalytics userStats = userAnalytics.get(userId);
        if (userStats == null) {
            return Map.of("error", "User not found");
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalConversations", userStats.getTotalConversations());
        analytics.put("totalMessages", userStats.getTotalMessages());
        analytics.put("preferredIntents", userStats.getPreferredIntents());
        analytics.put("featureUsage", userStats.getFeatureUsage());
        analytics.put("primaryLanguage", userStats.getPrimaryLanguage());
        analytics.put("averageSatisfaction", userStats.getAverageSatisfaction());
        analytics.put("interests", userStats.getInterests());
        analytics.put("interactionPatterns", userStats.getInteractionPatterns());

        // Calculate engagement metrics
        long daysSinceFirstInteraction = ChronoUnit.DAYS.between(
            userStats.getFirstInteraction(), LocalDateTime.now());
        analytics.put("engagementRate", daysSinceFirstInteraction > 0 ?
            (double) userStats.getTotalConversations() / daysSinceFirstInteraction : 0);

        return analytics;
    }

    /**
     * Get performance insights for improvement
     */
    public Map<String, Object> getPerformanceInsights() {
        Map<String, Object> insights = new HashMap<>();

        List<ConversationAnalytics> conversations = getAllConversationAnalytics();

        // Response time analysis
        List<Double> responseTimes = conversations.stream()
            .map(ConversationAnalytics::getAverageResponseTime)
            .filter(time -> time > 0)
            .sorted()
            .collect(Collectors.toList());

        if (!responseTimes.isEmpty()) {
            insights.put("responseTimeP50", responseTimes.get(responseTimes.size() / 2));
            insights.put("responseTimeP95", responseTimes.get((int) (responseTimes.size() * 0.95)));
            insights.put("slowResponseRate", responseTimes.stream().filter(time -> time > 3000).count() * 100.0 / responseTimes.size());
        }

        // Intent confidence analysis
        Map<String, Double> avgConfidenceByIntent = conversations.stream()
            .flatMap(c -> c.getAverageConfidenceByIntent().entrySet().stream())
            .collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.averagingDouble(Map.Entry::getValue)
            ));
        insights.put("intentConfidenceAnalysis", avgConfidenceByIntent);

        // Fallback rate analysis
        long totalIntents = conversations.stream()
            .mapToInt(c -> c.getIntentCounts().values().stream().mapToInt(Integer::intValue).sum())
            .sum();

        long unknownIntents = conversations.stream()
            .mapToInt(c -> c.getIntentCounts().getOrDefault("UNKNOWN", 0))
            .sum();

        insights.put("fallbackRate", totalIntents > 0 ? (double) unknownIntents / totalIntents : 0);

        // Feature adoption analysis
        Map<String, Double> featureAdoption = conversations.stream()
            .flatMap(c -> c.getFeatureUsage().entrySet().stream())
            .collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.summingInt(Map.Entry::getValue)
            ))
            .entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> (double) entry.getValue() / conversations.size()
            ));
        insights.put("featureAdoptionRates", featureAdoption);

        // Recommendations for improvement
        List<String> recommendations = generateImprovementRecommendations(insights);
        insights.put("improvementRecommendations", recommendations);

        return insights;
    }

    // Private helper methods

    private void logEvent(String conversationId, String userId, String eventType) {
        logEvent(conversationId, userId, eventType, null);
    }

    private void logEvent(String conversationId, String userId, String eventType, Map<String, Object> metadata) {
        ConversationEvent event = new ConversationEvent(
            UUID.randomUUID().toString(), conversationId, userId, eventType);

        if (metadata != null) {
            event.getMetadata().putAll(metadata);
        }

        conversationEvents.add(event);

        // Keep only last 10000 events (circular buffer)
        if (conversationEvents.size() > 10000) {
            conversationEvents.remove(0);
        }
    }

    private void extractTopicsFromMessage(String message, List<String> topics) {
        String lowerMessage = message.toLowerCase();

        // Career-related topics
        String[] careerTopics = {
            "job", "career", "resume", "interview", "salary", "skills",
            "company", "application", "profile", "experience", "education"
        };

        for (String topic : careerTopics) {
            if (lowerMessage.contains(topic) && !topics.contains(topic)) {
                topics.add(topic);
            }
        }
    }

    private List<ConversationAnalytics> getAllConversationAnalytics() {
        // In production, this would query a database
        // For now, return recent conversations
        return new ArrayList<>(activeConversations.values());
    }

    private List<String> generateImprovementRecommendations(Map<String, Object> insights) {
        List<String> recommendations = new ArrayList<>();

        // Response time recommendations
        Double slowResponseRate = (Double) insights.get("slowResponseRate");
        if (slowResponseRate != null && slowResponseRate > 10) {
            recommendations.add("Optimize AI response times - consider implementing response caching");
        }

        // Fallback rate recommendations
        Double fallbackRate = (Double) insights.get("fallbackRate");
        if (fallbackRate != null && fallbackRate > 0.3) {
            recommendations.add("Improve intent recognition - add more training data for common queries");
        }

        // Feature adoption recommendations
        @SuppressWarnings("unchecked")
        Map<String, Double> featureAdoption = (Map<String, Double>) insights.get("featureAdoptionRates");
        if (featureAdoption != null) {
            if (featureAdoption.getOrDefault("voice_input", 0.0) < 0.1) {
                recommendations.add("Promote voice input feature - add tutorials and improve visibility");
            }
            if (featureAdoption.getOrDefault("translation", 0.0) < 0.1) {
                recommendations.add("Increase translation feature awareness - add language selector prominently");
            }
        }

        // Intent confidence recommendations
        @SuppressWarnings("unchecked")
        Map<String, Double> intentConfidence = (Map<String, Double>) insights.get("intentConfidenceAnalysis");
        if (intentConfidence != null) {
            intentConfidence.entrySet().stream()
                .filter(entry -> entry.getValue() < 0.7)
                .limit(3)
                .forEach(entry -> recommendations.add(
                    String.format("Improve confidence for %s intent (currently %.2f)",
                        entry.getKey(), entry.getValue())
                ));
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Chatbot performance is excellent! Continue monitoring for optimization opportunities.");
        }

        return recommendations;
    }

    /**
     * Clean up old analytics data (call periodically)
     */
    public void cleanupOldData(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);

        // Remove old conversation events
        conversationEvents.removeIf(event -> event.getTimestamp().isBefore(cutoffDate));

        // Archive old user analytics (in production, move to long-term storage)
        userAnalytics.entrySet().removeIf(entry ->
            entry.getValue().getLastInteraction().isBefore(cutoffDate));

        log.info("Cleaned up analytics data older than {} days", daysToKeep);
    }
}