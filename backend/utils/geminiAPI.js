const httpClient = require('./httpClient');
const cache = require('./cache');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Basic function to generate content with Gemini
exports.generateContent = async (prompt, systemPrompt = '', model = 'gemini-2.0-flash') => {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key is not configured');

  const endpoint = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [ { role: 'user', parts: [{ text: prompt }] } ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
  };

  if (systemPrompt) requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };

  const response = await httpClient.post(endpoint, requestBody);

  if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts && response.data.candidates[0].content.parts[0]) {
    return response.data.candidates[0].content.parts[0].text;
  }
  throw new Error('Invalid response structure from Gemini API');
};

// Function to translate text using Gemini with caching
exports.translateText = async (text, targetLanguage) => {
  if (targetLanguage === 'en' || text.length < 5) return text;
  const key = `translate:${targetLanguage}:${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const prompt = `Translate the following text to ${getLangName(targetLanguage)}. Only provide the translation without any explanation or additional text.\n\nText: "${text}"`;
    const translated = await exports.generateContent(prompt);
    cache.set(key, translated, 1000 * 60 * 60); // cache 1 hour
    return translated;
  } catch (error) {
    console.error('Error translating text with Gemini:', error);
    return text;
  }
};

// Function to detect language with caching
exports.detectLanguage = async (text) => {
  const key = `detect:${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const prompt = `Detect the language of this text and respond with only the language code from this list: en, hi, mr, te, ta, gu, pa, bn. Don't explain.\n\nText: "${text}"`;
    const response = await exports.generateContent(prompt);
    const langCode = response.trim().toLowerCase();
    const supportedCodes = ['en','hi','mr','te','ta','gu','pa','bn'];
    const code = supportedCodes.includes(langCode) ? langCode : 'en';
    cache.set(key, code, 1000 * 60 * 60);
    return code;
  } catch (error) {
    console.error('Error detecting language with Gemini:', error);
    return 'en';
  }
};

function getLangName(code) {
  const languages = { en:'English', hi:'Hindi', mr:'Marathi', te:'Telugu', ta:'Tamil', gu:'Gujarati', pa:'Punjabi', bn:'Bengali' };
  return languages[code] || 'English';
}