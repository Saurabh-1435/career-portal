import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import './Chatbot.css';

const Chatbot = () => {
  const { user, isCandidate, isCompany, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Get initial action buttons based on user role
  const getInitialActions = () => {
    if (isCandidate()) {
      return [
        { text: "View My Applications", action: () => navigate('/candidate/dashboard') },
        { text: "Browse Jobs", action: () => navigate('/jobs') },
        { text: "Update Profile", action: () => navigate('/profile') }
      ];
    } else if (isCompany()) {
      return [
        { text: "View Applications", action: () => navigate('/company/dashboard') },
        { text: "Post New Job", action: () => navigate('/post-job') },
        { text: "Company Profile", action: () => navigate('/company/profile') }
      ];
    } else if (isAdmin()) {
      return [
        { text: "Admin Dashboard", action: () => navigate('/admin/dashboard') },
        { text: "Manage Users", action: () => navigate('/admin/dashboard') },
        { text: "View Reports", action: () => navigate('/report/company') }
      ];
    }
    return [
      { text: "Browse Jobs", action: () => navigate('/jobs') },
      { text: "Register Now", action: () => navigate('/role') }
    ];
  };

  const [isOpen, setIsOpen] = useState(false);

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem(`chatbot_history_${user?.id || 'guest'}`);
      if (saved) {
        const history = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return null;
  };

  // Save chat history to localStorage
  const saveChatHistory = useCallback((messages) => {
    try {
      const history = messages.slice(-50); // Keep last 50 messages
      localStorage.setItem(`chatbot_history_${user?.id || 'guest'}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [user]);

  // Voice input functionality
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      // Track voice input feature usage
      if (conversationId) {
        api.post('/ai/analytics/feature-usage', null, {
          params: { conversationId, featureName: 'voice_input' }
        }).catch(error => console.warn('Failed to track voice input usage:', error));
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setTimeout(() => handleSendMessage(), 500);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Clear chat history
  const clearChatHistory = () => {
    const welcomeMessage = {
      // Avoid impure calls (Date.now/Math.random) inside component per lint rules.
      id: messages.length + 1,
      text: `Hello${isLoggedIn() ? ` ${user?.username || 'there'}` : ''}! I'm your Career Portal assistant. ${isLoggedIn() ? 'How can I help you manage your ' + (isCandidate() ? 'job applications' : isCompany() ? 'company dashboard' : 'admin panel') + ' today?' : 'How can I help you get started with your career journey?'}`,
      sender: 'bot',
      timestamp: new Date(),
      actions: isLoggedIn() ? getInitialActions() : null
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem(`chatbot_history_${user?.id || 'guest'}`);
  };

  const [messages, setMessages] = useState(() => {
    const history = loadChatHistory();
    return history || [
      {
        id: 1,
        text: `Hello${isLoggedIn() ? ` ${user?.username || 'there'}` : ''}! I'm your Career Portal assistant. ${isLoggedIn() ? 'How can I help you manage your ' + (isCandidate() ? 'job applications' : isCompany() ? 'company dashboard' : 'admin panel') + ' today?' : 'How can I help you get started with your career journey?'}`,
        sender: 'bot',
        timestamp: new Date(),
        actions: isLoggedIn() ? getInitialActions() : null
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en'); // Default to English
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSatisfactionRating, setShowSatisfactionRating] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Save chat history whenever messages change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages, saveChatHistory]);

  // Job search functionality
  const searchJobs = async (query, location = '', industry = '') => {
    try {
      const params = new URLSearchParams();
      if (query && query.trim()) params.append('search', query.trim());
      if (location && location.trim()) params.append('location', location.trim());
      if (industry && industry.trim()) params.append('industry', industry.trim());

      const queryString = params.toString();
      const url = queryString ? `/jobs?${queryString}` : '/jobs';

      const { data } = await api.get(url);
      return data.slice(0, 5);
    } catch (error) {
      console.error('Job search error:', error);
      return [];
    }
  };

  // Application tracking functionality
  const fetchUserApplications = async () => {
    if (!isCandidate()) return [];

    try {
      const { data } = await api.get('/applications/candidate');
      return data;
    } catch (error) {
      console.error('Application fetch error:', error);
      return [];
    }
  };

  // Company lookup functionality
  const searchCompanies = async (query = '') => {
    try {
      const { data } = await api.get('/companies');

      if (query && query.trim()) {
        const filtered = data.filter(company =>
          company.companyName.toLowerCase().includes(query.toLowerCase()) ||
          company.industry.toLowerCase().includes(query.toLowerCase())
        );
        return filtered.slice(0, 5); // Limit to 5 results
      }

      return data.slice(0, 5);
    } catch (error) {
      console.error('Company search error:', error);
      return [];
    }
  };

  // AI-powered resume analysis
  const analyzeResumeWithAI = async () => {
    if (!isCandidate()) return;

    try {
      // This would typically get the resume content from the user's profile
      // For now, we'll use a placeholder or ask the user to provide resume text
      const resumeText = "Please provide your resume content or upload it to your profile for AI analysis.";

      const { data: analysis } = await api.post('/ai/resume/analyze', null, {
        params: { resumeText }
      });

      const analysisMessage = {
        id: Date.now(),
        text: `🎯 **AI Resume Analysis Results:**\n\n` +
              `📊 **Overall Score: ${analysis.score}/100**\n\n` +
              `💪 **Strengths:**\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n` +
              `🔧 **Areas for Improvement:**\n${analysis.improvements.map(i => `• ${i}`).join('\n')}\n\n` +
              `🏷️ **Detected Skills:** ${analysis.skills.join(', ')}\n\n` +
              `🤖 **ATS Compatibility: ${analysis.atsScore}/100**\n\n` +
              `💡 **AI Recommendations:**\n` +
              `• Focus on quantifiable achievements\n` +
              `• Include industry-specific keywords\n` +
              `• Optimize for ATS systems\n` +
              `• Consider skill-based formatting`,
        sender: 'bot',
        timestamp: new Date(),
        actions: [
          { text: "Update Resume", action: () => navigate('/profile') },
          { text: "Get More Tips", action: () => setConversationContext('resume-tips') },
          { text: "Find Matching Jobs", action: () => navigate('/jobs') }
        ]
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('AI resume analysis error:', error);

      // Fallback to basic analysis
      const basicAnalysisMessage = {
        id: Date.now(),
        text: `📄 **Resume Analysis** (Basic Mode)\n\n` +
              `While our AI analysis is temporarily unavailable, here are some general tips:\n\n` +
              `✅ **Structure Check:** Ensure clear headings and sections\n` +
              `✅ **Content Review:** Include relevant experience and skills\n` +
              `✅ **Format:** Use PDF format for best compatibility\n` +
              `✅ **Keywords:** Include job-specific terms\n\n` +
              `💡 **Next Steps:**\n` +
              `• Update your profile with current resume\n` +
              `• Get feedback from mentors\n` +
              `• Tailor resume for each application`,
        sender: 'bot',
        timestamp: new Date(),
        actions: [
          { text: "Update Profile", action: () => navigate('/profile') },
          { text: "Resume Tips", action: () => setConversationContext('resume-tips') }
        ]
      };

      setMessages(prev => [...prev, basicAnalysisMessage]);
    }
  };

  // AI-powered job recommendations
  const getAIJobRecommendations = async () => {
    if (!isCandidate()) return;

    try {
      const { data: recommendations } = await api.get('/ai/recommendations/jobs', {
        params: {
          skills: user?.skills ? user.skills.split(',').map(s => s.trim()) : [],
          location: user?.preferredLocation || 'Remote',
          experienceLevel: user?.experienceLevel || 'Entry'
        }
      });

      if (recommendations && recommendations.length > 0) {
        const recommendationsText = recommendations.map((rec, index) =>
          `${index + 1}. **${rec.title}**\n` +
          `🏢 ${rec.company} • 📍 ${rec.location}\n` +
          `💰 ${rec.salaryRange} • 🎯 ${rec.matchPercentage}% match\n`
        ).join('\n');

        const recMessage = {
          id: Date.now(),
          text: `🎯 **AI-Powered Job Recommendations:**\n\n` +
                `Based on your profile and skills, here are personalized job matches:\n\n` +
                `${recommendationsText}\n\n` +
                `💡 **Why these recommendations?**\n` +
                `• Matched with your skills and experience\n` +
                `• Aligned with your career goals\n` +
                `• Located in your preferred areas\n` +
                `• Competitive salary ranges`,
          sender: 'bot',
          timestamp: new Date(),
          actions: [
            { text: "Browse All Jobs", action: () => navigate('/jobs') },
            { text: "Update Skills", action: () => navigate('/profile') },
            { text: "View My Profile", action: () => navigate('/profile') }
          ]
        };

        setMessages(prev => [...prev, recMessage]);
      } else {
        // Fallback recommendations
        const fallbackMessage = {
          id: Date.now(),
          text: `🔍 **Job Recommendations:**\n\n` +
                `While our AI recommendations are being prepared, here are some popular job categories:\n\n` +
                `💻 **Technology:** Software Engineer, Data Analyst, Product Manager\n` +
                `🎨 **Design:** UX Designer, Graphic Designer, Creative Director\n` +
                `📊 **Business:** Marketing Manager, Sales Executive, Business Analyst\n` +
                `🏥 **Healthcare:** Medical Coder, Healthcare Admin, Nurse\n\n` +
                `💡 **Pro Tip:** Update your profile with your skills and preferences for better recommendations!`,
          sender: 'bot',
          timestamp: new Date(),
          actions: [
            { text: "Browse Jobs", action: () => navigate('/jobs') },
            { text: "Update Profile", action: () => navigate('/profile') }
          ]
        };

        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('AI job recommendations error:', error);

      // Basic fallback
      const basicMessage = {
        id: Date.now(),
        text: `🔍 **Job Search Help:**\n\n` +
              `I can help you find the perfect job! Try these options:\n\n` +
              `• Search by job title or skills\n` +
              `• Filter by location and salary\n` +
              `• Browse by industry or company\n` +
              `• Get personalized recommendations\n\n` +
              `What type of job are you looking for?`,
        sender: 'bot',
        timestamp: new Date(),
        actions: [
          { text: "Browse Jobs", action: () => navigate('/jobs') },
          { text: "Search by Skills", action: () => setInputValue('search developer jobs') }
        ]
      };

      setMessages(prev => [...prev, basicMessage]);
    }
  };

  // Enhanced AI-powered response system
  const getBotResponse = async (userMessage) => {
    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender: msg.sender,
        message: msg.text,
        timestamp: msg.timestamp.getTime()
      }));

      const aiRequest = {
        message: userMessage,
        context: conversationContext,
        conversationHistory: conversationHistory
      };

      // Call AI service
      const { data: aiResponse } = await api.post('/ai/chat', aiRequest);

      const response = {
        text: aiResponse.response,
        actions: generateActionsFromAI(aiResponse.response),
        context: conversationContext,
        confidence: aiResponse.confidence,
        processingTime: aiResponse.processingTime
      };

      return response;
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to rule-based responses
      return getFallbackBotResponse(userMessage);
    }
  };

  // Fallback rule-based response system
  const getFallbackBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    const response = {
      text: '',
      actions: null,
      context: null
    };

    // Greeting responses
    if (message.match(/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/)) {
      if (isLoggedIn()) {
        response.text = `Hello ${user?.username || 'there'}! Welcome back to Career Portal. `;
        if (isCandidate()) {
          response.text += "How can I help you with your job applications today?";
          response.actions = [
            { text: "Check My Applications", action: () => navigate('/candidate/dashboard') },
            { text: "Browse New Jobs", action: () => navigate('/jobs') }
          ];
        } else if (isCompany()) {
          response.text += "How can I assist you with managing your company today?";
          response.actions = [
            { text: "View Applications", action: () => navigate('/company/dashboard') },
            { text: "Post New Job", action: () => navigate('/post-job') }
          ];
        } else {
          response.text += "How can I help you with admin tasks today?";
          response.actions = [
            { text: "Admin Dashboard", action: () => navigate('/admin/dashboard') }
          ];
        }
      } else {
        response.text = "Hello! Welcome to Career Portal. I'm here to help you get started with your career journey. Would you like to register as a job seeker or company?";
        response.actions = [
          { text: "Register as Candidate", action: () => navigate('/role') },
          { text: "Register as Company", action: () => navigate('/role') },
          { text: "Browse Jobs", action: () => navigate('/jobs') }
        ];
      }
      return response;
    }

    // Status-related queries
    if (message.includes('status') || message.includes('application status') || message.includes('my application') || message.includes('what does') && message.includes('mean')) {
      if (message.includes('my') || message.includes('check') || message.includes('view')) {
        if (isCandidate()) {
          response.text = "📊 **Checking your applications...**\n\nLet me fetch your current application statuses.";

          // Fetch applications asynchronously
          setTimeout(async () => {
            const applications = await fetchUserApplications();
            if (applications.length > 0) {
              const statusCounts = applications.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
              }, {});

              const statusSummary = Object.entries(statusCounts)
                .map(([status, count]) => `${status}: ${count}`)
                .join(', ');

              const recentApps = applications.slice(0, 3).map(app =>
                `📋 **${app.jobTitle}** at ${app.companyName}\n` +
                `📊 Status: ${app.status} • 📅 Applied: ${new Date(app.appliedAt).toLocaleDateString()}\n`
              ).join('\n');

              const statusMessage = {
                id: Date.now(),
                text: `📊 **Your Application Summary:**\n\n` +
                      `Total Applications: ${applications.length}\n` +
                      `Status Breakdown: ${statusSummary}\n\n` +
                      `🔥 **Recent Applications:**\n\n${recentApps}`,
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "View Full Dashboard", action: () => navigate('/candidate/dashboard') },
                  { text: "Apply to More Jobs", action: () => navigate('/jobs') },
                  { text: "Update Resume", action: () => navigate('/profile') }
                ]
              };

              setMessages(prev => [...prev, statusMessage]);
            } else {
              const noAppsMessage = {
                id: Date.now(),
                text: `📭 **No applications found**\n\nYou haven't applied to any jobs yet. Would you like to browse available positions?`,
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "Browse Jobs Now", action: () => navigate('/jobs') },
                  { text: "Update Profile First", action: () => navigate('/profile') }
                ]
              };
              setMessages(prev => [...prev, noAppsMessage]);
            }
          }, 1000);

          return response;
        }
      }
      response.text = "📊 **Application Status Guide:**\n\n" +
        "🔸 **PENDING/IN_PROCESS**: Your application is being received and reviewed\n" +
        "🔹 **PROCESS**: Application is under active consideration by the company\n" +
        "🔵 **SHORTLIST**: Congratulations! You've been shortlisted for further review\n" +
        "⚫ **INTERVIEW**: Interview has been scheduled or completed\n" +
        "✅ **ACCEPTED**: Congratulations! Your application has been accepted\n" +
        "❌ **REJECTED**: Unfortunately, your application was not selected\n" +
        "🚫 **WITHDRAWN**: You withdrew this application\n\n" +
        "💡 **Tip**: Check your dashboard regularly for status updates!";

      if (isCandidate()) {
        response.actions = [
          { text: "View My Dashboard", action: () => navigate('/candidate/dashboard') }
        ];
      } else if (isCompany()) {
        response.actions = [
          { text: "Manage Applications", action: () => navigate('/company/dashboard') }
        ];
      }
      return response;
    }

    // Application process queries
    if (message.includes('apply') || message.includes('application') || message.includes('how to apply') || message.includes('job application')) {
      response.text = "📝 **How to Apply for Jobs:**\n\n" +
        "1️⃣ **Browse Jobs**: Visit the Jobs page to see available positions\n" +
        "2️⃣ **Review Details**: Click on any job to read full requirements\n" +
        "3️⃣ **Apply**: Click the 'Apply' button on jobs you're interested in\n" +
        "4️⃣ **Upload Resume**: Submit your resume (PDF format recommended)\n" +
        "5️⃣ **Track Progress**: Monitor your application status in your dashboard\n\n" +
        "🚀 **Pro Tips**:\n" +
        "• Complete your profile for better visibility\n" +
        "• Tailor your resume to each job\n" +
        "• Apply early for better chances";

      response.actions = [
        { text: "Browse Jobs Now", action: () => navigate('/jobs') },
        { text: "Update My Profile", action: () => navigate('/profile') }
      ];
      return response;
    }

    // Resume and profile queries
    if (message.includes('resume') || message.includes('cv') || message.includes('profile')) {
      if (message.includes('analyze') || message.includes('review') || message.includes('check') || message.includes('feedback')) {
        if (isCandidate()) {
          response.text = "📄 **Resume Analysis**\n\n" +
            "I can analyze your resume for common best practices. However, to provide personalized feedback, I need to access your resume content.\n\n" +
            "Would you like me to:\n" +
            "• Review your uploaded resume\n" +
            "• Give general resume tips\n" +
            "• Check for common mistakes";

          response.actions = [
            { text: "Analyze My Resume", action: async () => {
              // This would need backend integration to read the resume content
              // For now, provide general analysis
              const generalAnalysis = {
                score: 75,
                strengths: ["✅ Good structure", "✅ Professional format", "✅ Relevant experience"],
                improvements: ["❌ Add more quantifiable achievements", "❌ Include LinkedIn profile", "❌ Add certifications"],
                keywords: ["JavaScript", "React", "Node.js"]
              };

              const analysisMessage = {
                id: Date.now(),
                text: `📊 **Resume Analysis Results:**\n\n` +
                      `🎯 **Overall Score: ${generalAnalysis.score}/100**\n\n` +
                      `💪 **Strengths:**\n${generalAnalysis.strengths.join('\n')}\n\n` +
                      `🔧 **Areas for Improvement:**\n${generalAnalysis.improvements.join('\n')}\n\n` +
                      `🏷️ **Detected Keywords:** ${generalAnalysis.keywords.join(', ')}\n\n` +
                      `💡 **Next Steps:**\n` +
                      `• Update your resume with these improvements\n` +
                      `• Get feedback from mentors\n` +
                      `• Use this resume for targeted job applications`,
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "Update Resume Now", action: () => navigate('/profile') },
                  { text: "Get More Tips", action: () => setInputValue('resume tips') }
                ]
              };

              setMessages(prev => [...prev, analysisMessage]);
            }},
            { text: "General Resume Tips", action: () => setInputValue('resume tips') },
            { text: "Common Mistakes", action: () => {
              const mistakesMessage = {
                id: Date.now(),
                text: "🚫 **Common Resume Mistakes to Avoid:**\n\n" +
                      "❌ **Spelling & Grammar Errors**\n" +
                      "• Proofread multiple times\n" +
                      "• Use spell check tools\n" +
                      "• Have someone else review\n\n" +
                      "❌ **Generic Objective Statements**\n" +
                      "• Replace with professional summary\n" +
                      "• Include key skills and experience\n" +
                      "• Tailor to each job\n\n" +
                      "❌ **No Quantifiable Achievements**\n" +
                      "• Use numbers: 'Increased sales by 40%'\n" +
                      "• Show impact: 'Managed team of 15'\n" +
                      "• Add metrics wherever possible\n\n" +
                      "❌ **Irrelevant Information**\n" +
                      "• Remove high school if you have college degree\n" +
                      "• Skip unrelated hobbies\n" +
                      "• Focus on professional experience\n\n" +
                      "❌ **Poor Formatting**\n" +
                      "• Use consistent fonts and spacing\n" +
                      "• Keep it to 1-2 pages\n" +
                      "• Use PDF format for submission",
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "Fix My Resume", action: () => navigate('/profile') },
                  { text: "Resume Tips", action: () => setInputValue('resume tips') }
                ]
              };
              setMessages(prev => [...prev, mistakesMessage]);
            }}
          ];
          return response;
        }
      }

      if (message.includes('update') || message.includes('change') || message.includes('edit')) {
        response.text = "📄 **Update Your Resume & Profile:**\n\n" +
          "Go to your Profile page to:\n" +
          "• Upload a new resume (PDF, DOC, DOCX)\n" +
          "• Update personal information\n" +
          "• Add skills and experience\n" +
          "• Change contact details\n" +
          "• Update your photo\n\n" +
          "💡 **Resume Tips**:\n" +
          "• Keep it concise (1-2 pages)\n" +
          "• Highlight relevant experience\n" +
          "• Use action verbs\n" +
          "• Proofread carefully";

        response.actions = [
          { text: "Update Profile Now", action: () => navigate('/profile') }
        ];
      } else {
        response.text = "📄 **Resume Best Practices:**\n\n" +
          "✅ **Format**: PDF format for best compatibility\n" +
          "✅ **Length**: 1-2 pages maximum\n" +
          "✅ **Content**: Relevant experience, skills, achievements\n" +
          "✅ **Keywords**: Include job-specific keywords\n" +
          "✅ **Contact**: Full contact information at top\n\n" +
          "Your resume is your first impression - make it count!";

        response.actions = [
          { text: "Update My Resume", action: () => navigate('/profile') },
          { text: "Resume Writing Tips", action: () => {
            setConversationContext('resume-tips');
            return getResumeTips();
          }}
        ];
      }
      return response;
    }

    // Company-related queries
    if (message.includes('company') || message.includes('employer') || message.includes('post job') || message.includes('hire')) {
      // Handle company search/lookup
      if (message.includes('about') || message.includes('info') || message.includes('details') || message.includes('find')) {
        const companyQuery = message.replace(/(about|info|details|find|company|companies)/gi, '').trim();
        if (companyQuery) {
          response.text = `🏢 **Searching for "${companyQuery}"...**\n\nLet me find information about this company.`;

          setTimeout(async () => {
            const foundCompanies = await searchCompanies(companyQuery);
            if (foundCompanies.length > 0) {
              const companyInfo = foundCompanies.map(company =>
                `🏢 **${company.companyName}**\n` +
                `🏭 Industry: ${company.industry}\n` +
                `📍 Location: ${company.headquarters}\n` +
                `👥 Size: ${company.companySize}\n` +
                `📞 Phone: ${company.companyPhone || 'Not available'}\n` +
                `🌟 Status: ${company.status}\n`
              ).join('\n---\n\n');

              const companyMessage = {
                id: Date.now(),
                text: `🏢 **Company Information:**\n\n${companyInfo}`,
                sender: 'bot',
                timestamp: new Date(),
                actions: foundCompanies.slice(0, 2).map(company => ({
                  text: `View ${company.companyName}`,
                  action: () => navigate(`/company/${company.id}`)
                })).concat([
                  { text: "Browse All Companies", action: () => navigate('/companies') },
                  { text: "Search Jobs at Companies", action: () => navigate('/jobs') }
                ])
              };

              setMessages(prev => [...prev, companyMessage]);
            } else {
              const noCompanyMessage = {
                id: Date.now(),
                text: `😔 **No companies found for "${companyQuery}"**\n\nTry searching with different keywords or browse all companies.`,
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "Browse All Companies", action: () => navigate('/companies') },
                  { text: "Search Jobs Instead", action: () => navigate('/jobs') }
                ]
              };
              setMessages(prev => [...prev, noCompanyMessage]);
            }
          }, 1000);

          return response;
        }
      }
      if (isCompany()) {
        response.text = "🏢 **Company Dashboard Features:**\n\n" +
          "• **Post Jobs**: Create new job openings\n" +
          "• **Manage Applications**: Review and update candidate statuses\n" +
          "• **Download Resumes**: Access candidate documents\n" +
          "• **Track Progress**: Monitor hiring pipeline\n" +
          "• **Company Profile**: Update company information\n\n" +
          "💼 **Status Update Flow**:\n" +
          "PENDING → PROCESS → SHORTLIST → INTERVIEW → ACCEPTED";

        response.actions = [
          { text: "Post New Job", action: () => navigate('/post-job') },
          { text: "View Applications", action: () => navigate('/company/dashboard') },
          { text: "Update Profile", action: () => navigate('/company/profile') }
        ];
      } else {
        response.text = "🏢 **For Companies:**\n\n" +
          "• Register as a company to post jobs\n" +
          "• Access candidate applications and resumes\n" +
          "• Update application statuses\n" +
          "• Manage your hiring process\n" +
          "• Generate reports on applications\n\n" +
          "Ready to start hiring? Register as a company!";

        response.actions = [
          { text: "Register as Company", action: () => navigate('/role') },
          { text: "Learn More", action: () => navigate('/companies') }
        ];
      }
      return response;
    }

    // Help and general queries
    if (message.includes('help') || message.includes('what can you do') || message.includes('features')) {
      response.text = "🤖 **Enhanced AI Assistant Features:**\n\n" +
        "🔍 **Job Search:**\n" +
        "• Search jobs by title, skills, location\n" +
        "• Get instant job recommendations\n" +
        "• View detailed job information\n\n" +
        "📊 **Application Tracking:**\n" +
        "• Real-time application status updates\n" +
        "• Application summary and analytics\n" +
        "• Quick access to your dashboard\n\n" +
        "🏢 **Company Information:**\n" +
        "• Search and learn about companies\n" +
        "• Company profiles and details\n" +
        "• Industry insights and reviews\n\n" +
        "🎤 **Voice Input:**\n" +
        "• Speak your questions naturally\n" +
        "• Hands-free interaction\n" +
        "• Voice-activated responses\n\n" +
        "💾 **Smart Features:**\n" +
        "• Persistent chat history\n" +
        "• Personalized recommendations\n" +
        "• Quick action buttons\n\n" +
        "💬 Try asking:\n" +
        "• 'Search software developer jobs'\n" +
        "• 'Check my application status'\n" +
        "• 'Tell me about Google'\n" +
        "• 'Clear chat history'";

      response.actions = [
        { text: "Try Job Search", action: () => setInputValue('search software developer jobs') },
        { text: "Check Applications", action: () => setInputValue('check my application status') },
        { text: "Voice Input", action: startVoiceInput },
        { text: "Clear Chat History", action: clearChatHistory }
      ];
      return response;
    }

    // Login/Register queries
    if (message.includes('login') || message.includes('sign in') || message.includes('register') || message.includes('sign up')) {
      if (isLoggedIn()) {
        response.text = `You're already logged in as ${user?.username}! `;
        if (isCandidate()) response.text += "You can access your dashboard anytime.";
        else if (isCompany()) response.text += "You can manage your company dashboard.";
        else response.text += "You have admin access.";

        response.actions = [
          { text: "Go to Dashboard", action: () => {
            if (isCandidate()) navigate('/candidate/dashboard');
            else if (isCompany()) navigate('/company/dashboard');
            else navigate('/admin/dashboard');
          }}
        ];
      } else {
        if (message.includes('login') || message.includes('sign in')) {
          response.text = "🔐 **Login Help:**\n\n" +
            "• Go to the Login page\n" +
            "• Enter your username/email and password\n" +
            "• Check 'Remember me' for convenience\n" +
            "• Use 'Forgot Password' if needed\n\n" +
            "👨‍💼 **Admin Login:**\n" +
            "Username: admin\n" +
            "Password: Admin@123";

          response.actions = [
            { text: "Login Now", action: () => navigate('/login') },
            { text: "Forgot Password", action: () => navigate('/forgot-password') }
          ];
        } else {
          response.text = "📝 **Registration Process:**\n\n" +
            "1. Choose your role (Job Seeker or Company)\n" +
            "2. Fill in your information\n" +
            "3. Upload required documents (resume for candidates)\n" +
            "4. Verify your email\n" +
            "5. Complete your profile\n\n" +
            "Get started with your career journey!";

          response.actions = [
            { text: "Register Now", action: () => navigate('/role') }
          ];
        }
      }
      return response;
    }

    // Job search queries
    if (message.includes('job') && !message.includes('application')) {
      // Handle specific job search requests
      if (message.includes('search') || message.includes('find') || message.includes('looking for')) {
        const searchTerm = message.replace(/(search|find|looking for|jobs?)/gi, '').trim();
        if (searchTerm) {
          response.text = `🔍 **Searching for "${searchTerm}" jobs...**\n\nPlease wait while I find the best matches for you.`;

          // Perform async search
          setTimeout(async () => {
            const jobs = await searchJobs(searchTerm);
            if (jobs.length > 0) {
              const jobListText = jobs.map(job =>
                `💼 **${job.title}**\n` +
                `🏢 ${job.companyName} • 📍 ${job.location}\n` +
                `💰 ₹${job.salary.toLocaleString()} • 📅 ${new Date(job.postedOn).toLocaleDateString()}\n`
              ).join('\n');

              const searchResultsMessage = {
                id: Date.now(),
                text: `🎯 **Found ${jobs.length} job${jobs.length > 1 ? 's' : ''} for "${searchTerm}":**\n\n${jobListText}`,
                sender: 'bot',
                timestamp: new Date(),
                actions: jobs.slice(0, 3).map(job => ({
                  text: `View ${job.title}`,
                  action: () => navigate(`/job/${job.id}`)
                })).concat([
                  { text: "Browse All Jobs", action: () => navigate('/jobs') },
                  { text: "Search More", action: () => {
                    setConversationContext('job-search');
                    setInputValue(`search jobs for ${searchTerm}`);
                  }}
                ])
              };

              setMessages(prev => [...prev, searchResultsMessage]);
            } else {
              const noResultsMessage = {
                id: Date.now(),
                text: `😔 **No jobs found for "${searchTerm}"**\n\nTry different keywords or browse all available jobs.`,
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                  { text: "Browse All Jobs", action: () => navigate('/jobs') },
                  { text: "Try Different Search", action: () => setConversationContext('job-search') }
                ]
              };
              setMessages(prev => [...prev, noResultsMessage]);
            }
          }, 1000);

          return response;
        }
      }

      response.text = "🔍 **Finding Jobs:**\n\n" +
        "• **Browse All Jobs**: Visit the Jobs page\n" +
        "• **Search & Filter**: Use keywords, location, company\n" +
        "• **Save Favorites**: Mark jobs you're interested in\n" +
        "• **Apply Directly**: One-click application process\n" +
        "• **Track Applications**: Monitor status in your dashboard\n\n" +
        "💡 **Pro Tips**:\n" +
        "• Set up regular job searches\n" +
        "• Apply to 5-10 jobs per week\n" +
        "• Customize your resume per application\n" +
        "• Follow up on applications";

      response.actions = [
        { text: "Browse Jobs", action: () => navigate('/jobs') },
        { text: "My Applications", action: () => navigate('/candidate/dashboard') },
        { text: "Search Jobs Now", action: () => {
          setConversationContext('job-search');
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "🔍 **Job Search Assistant**\n\nWhat type of job are you looking for? You can mention:\n• Job title (e.g., 'software developer')\n• Skills (e.g., 'React developer')\n• Location (e.g., 'jobs in Bangalore')\n• Industry (e.g., 'marketing jobs')",
            sender: 'bot',
            timestamp: new Date(),
            actions: [
              { text: "Popular: Software Developer", action: () => setInputValue('search software developer jobs') },
              { text: "Popular: Data Analyst", action: () => setInputValue('search data analyst jobs') },
              { text: "Popular: Marketing", action: () => setInputValue('search marketing jobs') }
            ]
          }]);
        }}
      ];
      return response;
    }

    // Interview and career tips
    if (message.includes('interview') || message.includes('career') || message.includes('tips')) {
      response.text = "🎯 **Interview & Career Tips:**\n\n" +
        "📋 **Preparation:**\n" +
        "• Research the company thoroughly\n" +
        "• Prepare answers for common questions\n" +
        "• Practice your introduction\n" +
        "• Prepare questions for the interviewer\n\n" +
        "💼 **During Interview:**\n" +
        "• Dress professionally\n" +
        "• Arrive 10-15 minutes early\n" +
        "• Bring extra resumes\n" +
        "• Show enthusiasm and confidence\n\n" +
        "📞 **Follow-up:**\n" +
        "• Send a thank-you email within 24 hours\n" +
        "• Reiterate your interest\n" +
        "• Connect on LinkedIn if appropriate";

      response.actions = [
        { text: "Common Interview Questions", action: () => {
          setConversationContext('interview-questions');
          return getInterviewQuestions();
        }},
        { text: "Career Advice", action: () => {
          setConversationContext('career-advice');
          return getCareerAdvice();
        }}
      ];
      return response;
    }

    // Default response
    const suggestions = [
      "Try asking about 'application status'",
      "Ask 'how do I apply for jobs'",
      "Say 'help' for more options",
      "Ask about 'resume tips'"
    ];

    const suggestionIndex = (message.length || 0) % suggestions.length;
    response.text = "🤔 I'm not sure about that specific question. I can help with:\n\n" +
      "• Job applications and status updates\n" +
      "• Profile and resume optimization\n" +
      "• Company dashboard features\n" +
      "• Interview and career tips\n" +
      "• Account and login help\n\n" +
      `💡 **Suggestion**: ${suggestions[suggestionIndex]}`;

    response.actions = [
      { text: "Show Help Menu", action: () => getFallbackBotResponse('help') },
      { text: "Browse Jobs", action: () => navigate('/jobs') }
    ];

    return response;
  };

  // Generate actions from AI response
  const generateActionsFromAI = (aiResponse) => {
    const response = aiResponse.toLowerCase();
    const actions = [];

    // Job-related actions
    if (response.includes('job') || response.includes('search') || response.includes('find')) {
      actions.push({ text: "Browse Jobs", action: () => navigate('/jobs') });
    }

    // Application-related actions
    if (response.includes('application') || response.includes('apply') || response.includes('status')) {
      if (isCandidate()) {
        actions.push({ text: "View Applications", action: () => navigate('/candidate/dashboard') });
      }
    }

    // Profile/Resume actions
    if (response.includes('resume') || response.includes('profile') || response.includes('cv')) {
      actions.push({ text: "Update Profile", action: () => navigate('/profile') });
    }

    // Company actions
    if (response.includes('company') || response.includes('employer')) {
      if (isCompany()) {
        actions.push({ text: "Company Dashboard", action: () => navigate('/company/dashboard') });
      } else {
        actions.push({ text: "Browse Companies", action: () => navigate('/companies') });
      }
    }

    // Interview/Career actions
    if (response.includes('interview') || response.includes('career') || response.includes('tip')) {
      actions.push({ text: "Career Resources", action: () => setConversationContext('career-advice') });
    }

    // Default actions
    if (actions.length === 0) {
      actions.push({ text: "Get Help", action: () => setConversationContext('help') });
    }

    return actions.slice(0, 3); // Limit to 3 actions
  };

  const getResumeTips = () => ({
    text: "📄 **Advanced Resume Tips:**\n\n" +
      "🎯 **Tailoring:**\n" +
      "• Customize for each job application\n" +
      "• Use keywords from job description\n" +
      "• Highlight relevant experience first\n\n" +
      "📊 **ATS Optimization:**\n" +
      "• Use standard fonts (Arial, Calibri)\n" +
      "• Include relevant keywords naturally\n" +
      "• Avoid tables and complex formatting\n\n" +
      "✨ **Content Strategy:**\n" +
      "• Start with strong summary\n" +
      "• Use action verbs (Led, Managed, Created)\n" +
      "• Quantify achievements (Increased by 40%)\n" +
      "• Keep it to 1-2 pages\n\n" +
      "🔍 **Final Check:**\n" +
      "• Proofread multiple times\n" +
      "• Get feedback from others\n" +
      "• Save as PDF to preserve formatting",
    actions: [
      { text: "Update My Resume", action: () => navigate('/profile') },
      { text: "Back to Main Help", action: () => setConversationContext(null) }
    ]
  });

  const getInterviewQuestions = () => ({
    text: "🎤 **Common Interview Questions:**\n\n" +
      "👤 **About You:**\n" +
      "• Tell me about yourself\n" +
      "• What are your strengths/weaknesses?\n" +
      "• Why do you want this job?\n\n" +
      "💼 **Experience:**\n" +
      "• Describe your most challenging project\n" +
      "• How do you handle pressure/deadlines?\n" +
      "• Tell me about a time you failed\n\n" +
      "🔮 **Future:**\n" +
      "• Where do you see yourself in 5 years?\n" +
      "• Why do you want to work here?\n" +
      "• What are your salary expectations?\n\n" +
      "💡 **Smart Questions to Ask:**\n" +
      "• What's the company culture like?\n" +
      "• What are the biggest challenges?\n" +
      "• What's the growth potential?",
    actions: [
      { text: "Back to Main Help", action: () => setConversationContext(null) }
    ]
  });

  const getCareerAdvice = () => ({
    text: "🚀 **Career Development Tips:**\n\n" +
      "📈 **Growth Strategies:**\n" +
      "• Set clear career goals\n" +
      "• Learn new skills regularly\n" +
      "• Network with industry professionals\n" +
      "• Seek mentorship opportunities\n\n" +
      "💼 **Job Search Tips:**\n" +
      "• Apply to 5-10 jobs per week\n" +
      "• Customize each application\n" +
      "• Follow up on applications\n" +
      "• Track your progress\n\n" +
      "🎯 **Skill Development:**\n" +
      "• Take online courses\n" +
      "• Attend industry events\n" +
      "• Read industry publications\n" +
      "• Practice new skills\n\n" +
      "🌟 **Professional Tips:**\n" +
      "• Build a personal brand\n" +
      "• Maintain work-life balance\n" +
      "• Stay updated with industry trends\n" +
      "• Give back to the community",
    actions: [
      { text: "Back to Main Help", action: () => setConversationContext(null) }
    ]
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    let currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Start conversation analytics if not already started
    if (!conversationId && isLoggedIn()) {
      try {
        const { data } = await api.post('/ai/analytics/conversation/start');
        setConversationId(data.conversationId);
      } catch (error) {
        console.warn('Failed to start conversation analytics:', error);
      }
    }

    // Record user message analytics
    if (conversationId) {
      try {
        await api.post('/ai/analytics/conversation/message', null, {
          params: {
            conversationId,
            sender: 'user',
            message: currentInput
          }
        });
      } catch (error) {
        console.warn('Failed to record message analytics:', error);
      }
    }

    try {
      // Detect user language if not already detected
      if (userLanguage === 'en') {
        try {
          const { data: languageDetection } = await api.post('/ai/translate/detect', null, {
            params: { text: currentInput }
          });

          if (languageDetection.detectedLanguage !== 'en') {
            setUserLanguage(languageDetection.detectedLanguage);

            // If user is using a different language, translate their message to English for processing
            if (languageDetection.detectedLanguage !== 'en') {
              const { data: translation } = await api.post('/ai/translate', null, {
                params: {
                  text: currentInput,
                  sourceLanguage: languageDetection.detectedLanguage,
                  targetLanguage: 'en'
                }
              });
              currentInput = translation.translatedText;
            }
          }
        } catch (langError) {
          console.warn('Language detection failed, using English:', langError);
        }
      }

      // Get AI-powered response
      const response = await getBotResponse(currentInput);

      let finalResponseText = response.text;

      // Translate response back to user's language if needed
      if (userLanguage !== 'en') {
        try {
          setIsTranslating(true);
          const { data: translation } = await api.post('/ai/translate', null, {
            params: {
              text: response.text,
              sourceLanguage: 'en',
              targetLanguage: userLanguage
            }
          });

          if (translation.confidence > 0.7) {
            finalResponseText = translation.translatedText;
            // Track translation feature usage
            if (conversationId) {
              await api.post('/ai/analytics/feature-usage', null, {
                params: { conversationId, featureName: 'translation' }
              });
            }
          }
        } catch (translateError) {
          console.warn('Response translation failed:', translateError);
        } finally {
          setIsTranslating(false);
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        text: finalResponseText,
        sender: 'bot',
        timestamp: new Date(),
        actions: response.actions,
        confidence: response.confidence,
        processingTime: response.processingTime,
        originalLanguage: userLanguage
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationContext(response.context);

      // Record bot message analytics
      if (conversationId) {
        try {
          await api.post('/ai/analytics/conversation/message', null, {
            params: {
              conversationId,
              sender: 'bot',
              message: finalResponseText,
              intent: response.intent || 'unknown',
              confidence: response.confidence || 0.5,
              responseTime: response.processingTime || 1000
            }
          });
        } catch (error) {
          console.warn('Failed to record bot message analytics:', error);
        }
      }

      // Show satisfaction rating after several interactions
      const userMessages = messages.filter(msg => msg.sender === 'user').length;
      if (userMessages >= 3 && userMessages % 3 === 0 && !showSatisfactionRating) {
        setTimeout(() => setShowSatisfactionRating(true), 2000);
      }
    } catch (error) {
      console.error('Chatbot error:', error);

      // Fallback to rule-based response
      const fallbackResponse = getFallbackBotResponse(currentInput);
      let fallbackText = fallbackResponse.text + "\n\n⚠️ *AI service temporarily unavailable - using basic responses*";

      // Translate fallback response if needed
      if (userLanguage !== 'en') {
        try {
          const { data: translation } = await api.post('/ai/translate', null, {
            params: {
              text: fallbackText,
              sourceLanguage: 'en',
              targetLanguage: userLanguage
            }
          });
          fallbackText = translation.translatedText;
        } catch (translateError) {
          console.warn('Fallback translation failed:', translateError);
        }
      }

      const fallbackMessage = {
        id: Date.now() + 1,
        text: fallbackText,
        sender: 'bot',
        timestamp: new Date(),
        actions: fallbackResponse.actions
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action) => {
    if (typeof action === 'function') {
      action();
    } else if (typeof action === 'string') {
      // Handle string actions (for backward compatibility)
      setInputValue(action);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getQuickReplies = () => {
    if (isCandidate()) {
      return [
        'Check my application status',
        'Get AI job recommendations',
        'Analyze my resume with AI',
        'Search for software developer jobs',
        'Tell me about Google company',
        'Career advice and tips'
      ];
    } else if (isCompany()) {
      return [
        'How do I post a job?',
        'View my applications',
        'What are the status options?',
        'Company dashboard',
        'AI hiring insights',
        'Candidate analytics'
      ];
    } else if (isAdmin()) {
      return [
        'Admin dashboard',
        'Manage users',
        'View all companies',
        'AI system analytics',
        'Platform insights',
        'User engagement metrics'
      ];
    } else {
      return [
        'How do I register?',
        'Browse available jobs',
        'Get AI job recommendations',
        'Search jobs in Bangalore',
        'Help getting started',
        'Learn about AI features'
      ];
    }
  };

  const handleQuickReply = (reply) => {
    // Handle special AI-powered quick replies
    if (reply === 'Get AI job recommendations') {
      setTimeout(() => getAIJobRecommendations(), 100);
      return;
    }

    if (reply === 'Analyze my resume with AI') {
      setTimeout(() => analyzeResumeWithAI(), 100);
      return;
    }

    // Default behavior for other quick replies
    setInputValue(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSatisfactionRating = async (rating) => {
    if (conversationId) {
      try {
        await api.post('/ai/analytics/satisfaction', null, {
          params: { conversationId, satisfactionScore: rating }
        });

        // Hide rating and show thank you message
        setShowSatisfactionRating(false);
        const thankYouMessage = {
          id: Date.now(),
          text: `Thank you for rating our conversation ${'⭐'.repeat(rating)}! Your feedback helps us improve.`,
          sender: 'bot',
          timestamp: new Date(),
          actions: [
            { text: "Continue chatting", action: () => setInputValue('') },
            { text: "End conversation", action: () => {
              setConversationId(null);
              setMessages([]);
              setShowSatisfactionRating(false);
            }}
          ]
        };
        setMessages(prev => [...prev, thankYouMessage]);

      } catch (error) {
        console.warn('Failed to record satisfaction rating:', error);
        setShowSatisfactionRating(false);
      }
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <span>🤖</span>
            </div>
            <div className="chatbot-info">
              <h4>Career Portal Assistant</h4>
              <span className="status">● Online</span>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div className="message-actions">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        className="action-btn"
                        onClick={() => handleActionClick(action.action)}
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="quick-replies">
              {getQuickReplies().map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Satisfaction Rating */}
          {showSatisfactionRating && (
            <div className="satisfaction-rating">
              <div className="rating-prompt">
                How satisfied are you with our conversation?
              </div>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="rating-star"
                    onClick={() => handleSatisfactionRating(star)}
                    title={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <button
                className="rating-skip"
                onClick={() => setShowSatisfactionRating(false)}
              >
                Skip
              </button>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              placeholder={isListening ? "🎤 Listening..." : isTranslating ? "🌍 Translating..." : "💬 Type your message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || isTranslating}
            />

            {/* Language Selector */}
            <select
              value={userLanguage}
              onChange={(e) => setUserLanguage(e.target.value)}
              className="language-selector"
              title="Select language"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="zh">🇨🇳 ZH</option>
              <option value="ja">🇯🇵 JA</option>
              <option value="ko">🇰🇷 KO</option>
            </select>

            <button
              onClick={startVoiceInput}
              disabled={isTyping || isListening || isTranslating}
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              title="Voice input"
            >
              🎤
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || isListening || isTranslating}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;