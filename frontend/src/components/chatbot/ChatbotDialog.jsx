import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../../utils/api';
import { v4 as uuidv4 } from 'uuid';
import './ChatbotStyles.css';

// chatbot endpoints mounted under /chatbot on backend
const CHATBOT_BASE = import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE.replace(/\/api\/?$/,'')}/api/chatbot` : 'http://localhost:5000/api/chatbot';

// List of supported languages with flags
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
];

const ChatbotDialog = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const languageMenuRef = useRef(null);

  // Handle clicks outside the language menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Persist language preference in localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('krishiMitraLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  // Initialize with a welcome message
  useEffect(() => {
    // Create a session when component mounts
    const createSession = async () => {
      try {
        const userId = localStorage.getItem('userId') || '';
  const response = await api.post('/chatbot/session', { userId });
        const newSessionId = response.data.sessionId;
        setSessionId(newSessionId);
        
        // Add welcome message in the selected language
        const welcomeMessages = {
          en: "Hello! I'm KrishiMitra, your farming assistant powered by Google Gemini. How can I help you with your agricultural questions today?",
          hi: "नमस्ते! मैं कृषिमित्र हूँ, Google Gemini द्वारा संचालित आपका कृषि सहायक। आज मैं आपके कृषि संबंधी प्रश्नों में कैसे मदद कर सकता हूँ?",
          mr: "नमस्कार! मी कृषीमित्र आहे, Google Gemini द्वारे सक्षम आपला शेती सहाय्यक. मी आज तुमच्या शेतीविषयक प्रश्नांमध्ये कशी मदत करू शकतो?",
          te: "హలో! నేను కృషిమిత్ర, Google Gemini ద్వారా ఆధారితమైన మీ వ్యవసాయ సహాయకుడిని. నేను ఈరోజు మీ వ్యవసాయ సంబంధిత ప్రశ్నలకు ఎలా సహాయం చేయగలను?",
          ta: "வணக்கம்! நான் கிருஷிமித்ரா, Google Gemini ஆல் இயக்கப்படும் உங்கள் விவசாய உதவியாளர். இன்று உங்கள் விவசாய கேள்விகளுக்கு நான் எவ்வாறு உதவ முடியும்?",
          gu: "નમસ્તે! હું કૃષિમિત્ર છું, Google Gemini દ્વારા સંચાલિત તમારો ખેતી સહાયક. આજે હું તમારા કૃષિ સંબંધિત પ્રશ્નોમાં કેવી રીતે મદદ કરી શકું?",
          pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀਮਿਤਰ ਹਾਂ, Google Gemini ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ। ਮੈਂ ਅੱਜ ਤੁਹਾਡੇ ਖੇਤੀਬਾੜੀ ਸੰਬੰਧੀ ਸਵਾਲਾਂ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
          bn: "হ্যালো! আমি কৃষিমিত্র, Google Gemini দ্বারা পরিচালিত আপনার কৃষি সহকারী। আজ আমি আপনার কৃষি সম্পর্কিত প্রশ্নে কীভাবে সাহায্য করতে পারি?"
        };
        
        const welcomeMessage = {
          _id: uuidv4(),
          isUser: false,
          message: welcomeMessages[selectedLanguage] || welcomeMessages.en,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Error creating session:', error);
        setMessages([{
          _id: uuidv4(),
          isUser: false,
          message: "I'm having trouble connecting to the server. Please try again later.",
          timestamp: new Date(),
        }]);
      }
    };
    
    createSession();
  }, [selectedLanguage]); // Re-run when language changes

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      _id: uuidv4(),
      isUser: true,
      message: input,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId') || '';
      const response = await api.post('/chatbot/message', {
        userId,
        sessionId,
        message: input,
        language: selectedLanguage, // Send the currently selected language
      });

      const botMessage = {
        _id: uuidv4(),
        isUser: false,
        message: response.data.message,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessage = {
        _id: uuidv4(),
        isUser: false,
        message: "I'm sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    
    // Save language preference to localStorage
    localStorage.setItem('krishiMitraLanguage', langCode);
    
    // Add a system message about the language change
    const langChangeMessages = {
      en: "I've switched to English. I'm now using Google Gemini to provide you with agricultural assistance.",
      hi: "मैंने हिंदी में बदल दिया है। अब मैं Google Gemini का उपयोग करके आपको कृषि सहायता प्रदान कर रहा हूं।",
      mr: "मी मराठीमध्ये स्विच केले आहे. मी आता तुम्हाला Google Gemini वापरून शेती संबंधित मदत देत आहे.",
      te: "నేను తెలుగులోకి మారాను. ఇప్పుడు నేను వ్యవసాయ సహాయం అందించడానికి Google Gemini ని ఉపయోగిస్తున్నాను.",
      ta: "நான் தமிழுக்கு மாறினேன். இப்போது Google Gemini ஐப் பயன்படுத்தி உங்களுக்கு வேளாண்மை உதவிகளை வழங்குகிறேன்.",
      gu: "મેં ગુજરાતીમાં સ્વિચ કર્યું છે. હવે હું Google Gemini નો ઉપયોગ કરીને તમને કૃષિ સહાય પ્રદાન કરી રહ્યો છું.",
      pa: "ਮੈਂ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਗਿਆ ਹਾਂ। ਹੁਣ ਮੈਂ Google Gemini ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤੁਹਾਨੂੰ ਖੇਤੀਬਾੜੀ ਸਹਾਇਤਾ ਪ੍ਰદਾਨ ਕਰ ਰਿਹਾ ਹਾਂ।",
      bn: "আমি বাংলায় স্যুইচ করেছি। আমি এখন Google Gemini ব্যবহার করে আপনাকে কৃষি সহায়তা প্রদান করছি।"
    };
    
    // Only add language change message if there are already messages
    if (messages.length > 0) {
      const langChangeMessage = {
        _id: uuidv4(),
        isUser: false,
        message: langChangeMessages[langCode] || langChangeMessages.en,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, langChangeMessage]);
    }
  };

  const getCurrentLanguageData = () => {
    return LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];
  };

  return (
    <div className="fixed bottom-24 right-6 w-full max-w-md bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col" style={{ height: '550px' }}>
      {/* Chat Header */}
      <div className="gemini-header text-white p-4 flex justify-between items-center">
        <div className="flex items-center gemini-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <div>
            <h3 className="font-semibold">KrishiMitra - Farming Assistant</h3>
            <p className="text-xs opacity-80">Powered by Krishi-Mitra</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative mr-2">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center text-white hover:text-gray-200"
            >
              <span className="mr-1">{getCurrentLanguageData().flag}</span>
              <span className="text-sm">{getCurrentLanguageData().code.toUpperCase()}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showLanguageMenu && (
              <div
                ref={languageMenuRef}
                className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-50"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-4 flex ${
              msg.isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                msg.isUser
                  ? 'gemini-user-message rounded-br-none'
                  : 'gemini-bot-message text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
              <div
                className={`text-xs mt-1 ${
                  msg.isUser ? 'text-white opacity-80' : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              <div className="gemini-typing-indicator">
                <div className="gemini-typing-dot"></div>
                <div className="gemini-typing-dot"></div>
                <div className="gemini-typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask a farming question..."
            className="flex-grow p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:green-500"
            rows="2"
          ></textarea>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`ml-2 gemini-send-button p-2 rounded-full ${
              !input.trim() || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDialog; 