# Mistral AI Integration for Fraud Shield

This document explains how to set up and use the Mistral AI integration with Fraud Shield for enhanced fraud detection.

## Overview

Fraud Shield now integrates with Mistral AI's powerful language models to provide more accurate and sophisticated fraud detection. This AI-powered analysis helps identify potential scams, phishing attempts, and misleading content with higher precision.

## Features

- **Advanced Content Analysis**: Uses Mistral AI to analyze page content for fraud indicators
- **Detailed Explanations**: Provides human-readable explanations of detected issues
- **Risk Classification**: Categorizes threats as low, medium, or high risk
- **Fallback Mode**: Continues to function with basic detection if the API is unavailable

## Setup Instructions

### 1. Get a Mistral AI API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Create an account or log in
3. Navigate to the API section
4. Generate a new API key

### 2. Configure Fraud Shield

There are two ways to add your API key:

#### Option A: Through the Extension UI

1. Click on the Fraud Shield icon in your browser toolbar
2. Click the "Settings" gear icon in the popup
3. Enter your Mistral API key in the field provided
4. Click "Save API Key"
5. You'll see a confirmation message if the key was saved successfully

#### Option B: Using .env File (Development Only)

1. Copy the `.env.sample` file to a new file named `.env`
2. Replace `your_mistral_api_key_here` with your actual API key
3. Rebuild the extension if necessary

### 3. Verify Integration

After setting up your API key:

1. Visit any webpage and wait for Fraud Shield to run an automatic scan
2. Look for the "AI Powered" badge in scan results
3. The results should show detailed analysis with specific fraud indicators

## Model Information

Fraud Shield uses the **mistral-medium** model, which offers an excellent balance of accuracy and performance. 

Key capabilities:
- Detects phishing attempts
- Identifies social engineering tactics
- Recognizes deceptive practices
- Spots suspicious links and requests
- Analyzes text for urgency/threat indicators

## Troubleshooting

If you encounter issues with the Mistral AI integration:

1. **API Key Not Working**
   - Verify your API key is correct and hasn't expired
   - Check if you have sufficient credits/quota in your Mistral account
   - Try re-saving the API key in the settings panel

2. **No AI Analysis Results**
   - The extension will fall back to basic detection if AI analysis fails
   - Check your internet connection
   - Verify the content is substantial enough for analysis (very short content may be skipped)

3. **Unexpected Results**
   - AI analysis is probabilistic and may occasionally miss or misclassify content
   - You can always use the "Scan Page" button to re-run analysis
2. Click the gear icon (⚙) to open settings
3. Enter your Mistral API key in the provided field
4. Click "Save API Key"

#### Option B: Using Environment Variables

1. Create a `.env` file in the extension directory based on the `.env.sample` file
2. Add your Mistral API key: `MISTRAL_API_KEY=your_key_here`
3. Save the file

## Usage

Once configured, Fraud Shield will automatically use Mistral AI for content analysis:

1. **Automatic Scanning**: The extension periodically scans pages for potential threats
2. **Manual Scanning**: Click the "Scan Current Page" button for an immediate analysis
3. **Detailed Results**: Click "View details" on any alert to see the AI analysis breakdown

## Security & Privacy

- Your API key is stored locally in your browser's secure storage
- Content is analyzed in real-time and not stored permanently
- Only text content from web pages is sent to the Mistral AI API

## Troubleshooting

If you encounter issues with the Mistral AI integration:

1. Verify your API key is correct and has not expired
2. Check your browser console for error messages
3. Ensure your internet connection is stable
4. Try reloading the extension

The extension will automatically fall back to basic detection if the Mistral AI service is unavailable.
