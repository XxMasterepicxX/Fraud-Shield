// Test script for Mistral AI integration in Fraud Shield

async function testMistralIntegration() {
  console.log("Testing Mistral AI Integration");
  
  // Check if MistralAI class is available
  if (typeof MistralAI !== 'function') {
    console.error("❌ MistralAI class not found - ensure mistral-api.js is loaded");
    return;
  }
  
  console.log("✅ MistralAI class found");
  
  // Create instance
  const mistral = new MistralAI();
  console.log("✅ Created MistralAI instance");
  
  // Initialize and check for API key
  const initialized = await mistral.initialize();
  if (initialized) {
    console.log("✅ API key found and loaded");
  } else {
    console.warn("⚠️ No API key configured - some tests will be skipped");
  }
  
  // Test with sample content (safe for testing)
  const sampleContent = `
    Hello! This is a test email to verify the Mistral AI fraud detection.
    Please transfer $5000 to my new account immediately.
    Your account will be suspended if you don't comply within 24 hours.
    Click here: https://totally-not-suspicious.example.com
  `;
  
  console.log("Running analysis on sample content...");
  
  try {
    const result = await mistral.analyzeContent({
      content: sampleContent,
      url: "test-environment",
      context: "Integration test"
    });
    
    console.log("✅ Analysis completed");
    console.log("Result:", result);
    
    if (result.success) {
      console.log(`✅ Risk level: ${result.riskLevel}`);
      console.log(`✅ Confidence: ${result.confidence}%`);
      console.log(`✅ Indicators: ${result.indicators.length} found`);
      
      if (result.riskLevel === 'high' || result.riskLevel === 'medium') {
        console.log("✅ Correctly identified test content as risky");
      }
    } else if (result.fallbackMode) {
      console.log("⚠️ Test running in fallback mode - API key may be missing or invalid");
    } else {
      console.error("❌ Analysis failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error during analysis:", error);
  }
  
  console.log("Mistral AI integration test complete");
}

// Run the test
testMistralIntegration();
