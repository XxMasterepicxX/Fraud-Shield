/**
 * Mistral AI API Integration for Fraud Shield
 * This module handles communication with the Mistral AI API for fraud detection
 */

class MistralAI {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint = 'https://api.mistral.ai/v1/chat/completions';
    this.modelName = 'mistral-medium'; // Using mistral-medium model which is widely available and more affordable
    this.initialized = false;
  }
  /**
   * Initialize the Mistral API with credentials
   */
  async initialize() {
    // Don't re-initialize if already initialized with a valid API key
    if (this.initialized && this.apiKey) {
      console.log('Mistral AI API already initialized');
      return true;
    }
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['mistralApiKey'], (result) => {
        if (result.mistralApiKey) {
          this.apiKey = result.mistralApiKey;
          this.initialized = true;
          console.log('Mistral AI API initialized successfully');
          resolve(true);
        } else {
          console.log('Mistral AI API key not found');
          this.initialized = false;
          resolve(false);
        }
      });
    });
  }
  /**
   * Save API key to storage
   * @param {string} apiKey - The Mistral API key
   */
  async saveApiKey(apiKey) {
    return new Promise((resolve) => {
      chrome.storage.local.set({mistralApiKey: apiKey}, () => {
        this.apiKey = apiKey;
        this.initialized = true;
        console.log('Mistral AI API key saved');
        console.log('Loaded API Key:', this.apiKey);
        resolve(true);
      });
    });
  }  /**
   * Analyze content for potential fraud using Mistral AI
   * @param {Object} params - Analysis parameters
   * @param {string} params.content - The content to analyze
   * @param {string} params.url - The URL of the content
   * @param {string} params.context - Additional context for the analysis
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeContent({content, url, context = ''}) {
    console.log('Mistral AI: Beginning content analysis', {
      contentLength: content.length,
      url,
      context
    });
    
    // Check if we have valid content to analyze
    if (!content || content.trim().length < 50) {
      console.log('Mistral AI: Content too short for analysis, skipping');
      return {
        success: false,
        error: 'Content too short for meaningful analysis',
        fallbackMode: true,
        riskLevel: 'medium',
        confidence: 50,
        explanation: 'The content is too brief for detailed analysis.'
      };
    }
    
    // Make sure we have API key
    if (!this.apiKey) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.log('Mistral AI: API key not configured, falling back to demo mode');
        return {
          success: false,
          error: 'API key not configured',
          fallbackMode: true,
          riskLevel: 'medium',
          confidence: 50,
          explanation: 'API key not configured, using fallback detection.'
        };
      }
    }

    try {
      const prompt = this.buildPrompt(content, url, context);
      console.log('Mistral AI: Sending prompt to API', {
        modelName: this.modelName,
        systemMessage: prompt[0].content.substring(0, 100) + '...',
        userMessagePreview: prompt[1].content.substring(0, 100) + '...',
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      const response = await this.callMistralAPI(prompt);
      console.log('Mistral AI: Received raw API response', {
        status: 'success',
        responseLength: JSON.stringify(response).length,
        usageTokens: response.usage?.total_tokens || 'N/A',
        messageContent: response.choices[0].message.content.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
      
      const parsedResponse = this.parseResponse(response);
      console.log('Mistral AI: Parsed analysis result', parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error('Mistral AI analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallbackMode: true,
        riskLevel: 'medium',
        confidence: 50,
        explanation: `Error during analysis: ${error.message}`,
        recommendedAction: 'Please use your own judgment when interacting with this content.'
      };
    }
  }/**
   * Build the prompt for Mistral AI
   * @private
   */
  buildPrompt(content, url, context) {
    // Mistral has a context window limit, so we need to truncate long content
    // Mistral Medium has a context window of about 32k tokens
    const truncatedContent = content.length > 7000 ? content.substring(0, 7000) + '...' : content;
    
    // Create a structured system prompt that's clear and specific
    const systemPrompt = `You are a fraud detection expert specializing in identifying scams, phishing attempts, and misleading content online. 
Your task is to analyze the provided content and determine if it contains signs of fraud or deception.

You MUST respond in the following JSON format ONLY:
{
  "riskLevel": "LOW|MEDIUM|HIGH", 
  "confidence": number between 0-100,
  "indicators": ["indicator1", "indicator2", ...], 
  "explanation": "Clear explanation of your analysis",
  "recommendedAction": "What the user should do"
}`;
    
    // Create a specific user prompt that provides context
    const userPrompt = `Analyze this content from ${url || 'an unknown source'} for potential fraud indicators:

CONTENT TO ANALYZE:
${truncatedContent}

ADDITIONAL CONTEXT: 
${context || 'No additional context provided'}

Focus on detecting:
- Phishing attempts
- Scams
- Social engineering
- Deceptive practices
- False urgency or threats
- Suspicious links or requests

Respond ONLY with a JSON object as specified. Do not include any other text outside the JSON.`;
    
    console.log('Mistral AI: Building prompt', {
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      contentPreview: truncatedContent.substring(0, 200).replace(/\n/g, ' ') + '...',
      url: url,
      context: context
    });
    
    return [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
  }/**
   * Call the Mistral AI API
   * @private
   */
  async callMistralAPI(messages) {
    console.log('Mistral AI: Making API request', {
      endpoint: this.apiEndpoint,
      model: this.modelName,
      messageCount: messages.length,
      apiKeyConfigured: !!this.apiKey,
      timestamp: new Date().toISOString()
    });
    
    const requestStart = performance.now();
    
    try {
      // Prepare request according to Mistral's API specifications
      const requestBody = {
        model: this.modelName,
        messages: messages,
        temperature: 0.1, // Low temperature for more deterministic responses
        max_tokens: 1024,  // Increased token limit for more detailed responses
        response_format: { type: "text" } // Ensure text response
      };
      
      console.log('Mistral AI: Request payload structure', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        temperature: requestBody.temperature,
        max_tokens: requestBody.max_tokens
      });
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const requestDuration = performance.now() - requestStart;
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: { message: await response.text() || response.statusText } };
        }
        
        console.error('Mistral AI: API Error Response', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          requestDurationMs: requestDuration
        });
        throw new Error(`Mistral API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
      
      const jsonResponse = await response.json();
      
      console.log('Mistral AI: API Response', {
        status: 'success',
        requestDurationMs: requestDuration,
        responseSize: JSON.stringify(jsonResponse).length,
        usage: jsonResponse.usage,
        modelUsed: jsonResponse.model,
        firstChoiceFinishReason: jsonResponse.choices[0]?.finish_reason
      });
      
      return jsonResponse;
    } catch (error) {
      console.error('Mistral AI: API Call Failed', {
        error: error.message,
        stack: error.stack,
        requestDurationMs: performance.now() - requestStart
      });
      throw error;
    }
  }  /**
   * Parse the Mistral AI response
   * @private
   */
  parseResponse(apiResponse) {
    try {
      const responseText = apiResponse.choices[0].message.content;
      console.log('Mistral AI: Full response text', responseText);
      
      // Try to extract JSON from the response
      // This improved regex will find JSON even with line breaks and spaces
      const jsonMatch = responseText.match(/\{[\s\S]*?\}(?!\s*[,\]}])/);
      
      if (jsonMatch) {
        console.log('Mistral AI: Found JSON in response', jsonMatch[0]);
        
        try {
          const resultJson = JSON.parse(jsonMatch[0]);
          console.log('Mistral AI: Parsed JSON successfully', resultJson);
          
          // Validate and normalize the parsed JSON
          const riskLevel = (resultJson.riskLevel || '').toLowerCase();
          const normalizedRiskLevel = ['low', 'medium', 'high'].includes(riskLevel) 
            ? riskLevel 
            : 'medium';
          
          // Ensure confidence is a number between 0-100
          let confidence = parseFloat(resultJson.confidence);
          if (isNaN(confidence) || confidence < 0) confidence = 50;
          if (confidence > 100) confidence = 100;
          
          return {
            success: true,
            riskLevel: normalizedRiskLevel,
            confidence: confidence,
            indicators: Array.isArray(resultJson.indicators) ? resultJson.indicators : [],
            explanation: resultJson.explanation || 'No detailed explanation provided.',
            recommendedAction: resultJson.recommendedAction || 'Exercise caution when interacting with this content.',
            rawResponse: responseText
          };
        } catch (jsonError) {
          console.error('Mistral AI: Error parsing JSON response', jsonError);
          // Continue to fallback parsing
        }
      }
      
      // Fallback parsing if JSON structure not found or parsing failed
      console.log('Mistral AI: No valid JSON found in response, using fallback parsing');
      const riskLevelMatch = responseText.match(/risk(?:\s+level)?:?\s*(low|medium|high)/i);
      const confidenceMatch = responseText.match(/confidence:?\s*(\d+)/i);
      
      let riskLevel = 'medium';
      if (riskLevelMatch) {
        console.log('Mistral AI: Found risk level in text', riskLevelMatch[1]);
        riskLevel = riskLevelMatch[1].toLowerCase();
      } else {
        console.log('Mistral AI: Could not find risk level in text, defaulting to medium');
      }
      
      let confidence = 70;
      if (confidenceMatch) {
        confidence = parseInt(confidenceMatch[1]);
        if (isNaN(confidence) || confidence < 0) confidence = 70;
        if (confidence > 100) confidence = 100;
      }
      
      return {
        success: true,
        riskLevel: riskLevel,
        confidence: confidence,
        indicators: [],
        explanation: responseText.substring(0, 300),
        recommendedAction: 'Review this content carefully before proceeding.',
        rawResponse: responseText
      };    } catch (error) {
      console.error('Mistral AI: Error parsing response', {
        error: error.message,
        stack: error.stack,
        rawResponse: apiResponse.choices && apiResponse.choices[0] ? 
          apiResponse.choices[0].message.content : 
          'No response content available'
      });
      
      return {
        success: false,
        error: 'Failed to parse AI response: ' + error.message,
        fallbackMode: true,
        riskLevel: 'medium',
        confidence: 50,
        indicators: ['Error in AI analysis'],
        explanation: 'The fraud detection system encountered an error while analyzing this content.',
        recommendedAction: 'Proceed with caution and use your best judgment.',
        rawResponse: apiResponse.choices && apiResponse.choices[0] ? 
          apiResponse.choices[0].message.content : 
          'No response content'
      };
    }
  }
}

// Make available globally
window.MistralAI = MistralAI;
