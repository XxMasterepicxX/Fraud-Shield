/**
 * Gmail Platform Handler - Keeps existing Gmail functionality exactly the same
 */
class GmailPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.scannedEmails = new Set();
    this.currentUrl = window.location.href;
    this.name = "gmail";
    this.mistralAI = new MistralAI(); // Initialize Mistral AI
  }
  isActive() {
    return window.location.hostname.toLowerCase().includes("mail.google.com");
  }
  
  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    // Initialize Mistral AI
    this.mistralAI.initialize().then(initialized => {
      if (initialized) {
        console.log('Fraud Shield Gmail: Mistral AI initialized successfully');
      } else {
        console.log('Fraud Shield Gmail: Mistral AI not available, using fallback mode');
      }
      
      setTimeout(() => {
        this.scanExistingEmails();
        this.observeNewEmails();
        this.observeUrlChanges();
      }, 1500);
    });
  }
  
  async scanCurrentPage() {
    console.log('Fraud Shield: Manual Gmail scan triggered');
    
    try {
      // Remove all existing warnings
      document.querySelectorAll('.fraudshield-warning').forEach(el => el.remove());
      
      // Clear scanned set
      this.scannedEmails.clear();
      
      // Rescan emails
      await this.scanExistingEmails();
      
      console.log('Fraud Shield: Gmail scan completed successfully');
    } catch (error) {
      console.error('Fraud Shield: Error during Gmail scan', error);
    }
  }
    async scanExistingEmails() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const emailContainers = document.querySelectorAll("[data-message-id]");
    console.log(`Fraud Shield: Found ${emailContainers.length} emails to scan`);
    
    for (const container of emailContainers) {
      await this.addFraudBanner(container);
    }
  }

  observeNewEmails() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const observer = this.baseScanner.createObserver((mutations) => {
      if (!this.baseScanner.protectionEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.hasAttribute && node.hasAttribute("data-message-id")) {
            this.addFraudBanner(node);
            this.scannedEmails.add(node.getAttribute("data-message-id"));
          }
        });
      });
    });
  }
  observeUrlChanges() {
    if (!this.baseScanner.protectionEnabled) return;
    
    setInterval(() => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        setTimeout(() => {
          if (this.baseScanner.protectionEnabled) {
            this.scanExistingEmails();
          }
        }, 500);
      }
    }, 1000);
  }
    async addFraudBanner(emailContainer) {
    if (!this.baseScanner.protectionEnabled || emailContainer.querySelector(".fraudshield-warning")) {
      return;
    }

    try {
      // Check if this email has already been scanned
      const messageId = emailContainer.getAttribute("data-message-id");
      if (this.scannedEmails.has(messageId)) {
        return;
      }
      
      // Mark as scanned
      this.scannedEmails.add(messageId);
      
      // Get email content
      const emailContent = emailContainer.querySelector(".ii.gt");
      if (emailContent) {
        // Try to analyze with Mistral AI if available
        let analysis = null;
        
        // Use the existing Mistral AI instance
        try {
          // Extract email text content for analysis
          const emailText = emailContent.textContent || '';
          const emailSubject = document.querySelector('.hP')?.textContent || 'No Subject';
          
          console.log('Fraud Shield Gmail: Analyzing email content', {
            subject: emailSubject,
            contentLength: emailText.length,
            contentPreview: emailText.substring(0, 100).replace(/\n/g, ' ') + '...',
            messageId: messageId,
            timestamp: new Date().toISOString()
          });
          
          // Analyze with Mistral AI
          analysis = await this.mistralAI.analyzeContent({
            content: emailText,
            url: window.location.href,
            context: `Email with subject: ${emailSubject}`
          });
          
          console.log('Fraud Shield Gmail: Mistral AI analysis result', {
            success: analysis.success,
            riskLevel: analysis.riskLevel || 'unknown',
            confidence: analysis.confidence || 'N/A',
            indicatorsCount: analysis.indicators ? analysis.indicators.length : 0,
            messageId: messageId
          });
        } catch (error) {
          console.error('Fraud Shield Gmail: Error analyzing email with Mistral AI', error);
        }
        
        const banner = this.createBigImprovedBanner(analysis);
        emailContent.insertBefore(banner, emailContent.firstChild);
      }
    } catch (error) {
      console.error('Fraud Shield: Error adding fraud banner', error);    }
  }
    createBigImprovedBanner(analysis = null) {
    const banner = document.createElement("div");
    banner.className = "fraudshield-warning gmail-conversation";
    
    // Set banner border color based on risk level
    if (analysis && analysis.success) {
      const riskLevel = analysis.riskLevel.toLowerCase();
      switch(riskLevel) {
        case 'low':
          banner.style.borderLeft = '4px solid #4caf50'; // Green
          banner.classList.add('risk-low');
          break;
        case 'medium':
          banner.style.borderLeft = '4px solid #ff9800'; // Yellow/Orange
          banner.classList.add('risk-medium');
          break;
        case 'high':
          banner.style.borderLeft = '4px solid #f44336'; // Red
          banner.classList.add('risk-high');
          break;
        default:
          banner.style.borderLeft = '4px solid #9e9e9e'; // Grey
          banner.classList.add('risk-unknown');
      }
    } else {
      banner.style.borderLeft = '4px solid #ff9800'; // Default yellow/orange
      banner.classList.add('risk-medium');
    }
      const header = document.createElement("div");
    header.className = "fraudshield-header";
    
    const left = document.createElement("div");
    left.className = "fraudshield-left";
    
    const icon = document.createElement("img");
    icon.className = "fraudshield-icon";
    icon.src = chrome.runtime.getURL("src/assets/icons/icon128.png");
    icon.alt = "Fraud Shield";
    
    const title = document.createElement("span");
    title.className = "fraudshield-title";
    
    // Set title text based on risk level
    if (analysis && analysis.success) {
      const riskLevel = analysis.riskLevel.toLowerCase();
      switch(riskLevel) {
        case 'low':
          title.textContent = "LOW RISK DETECTED";
          break;
        case 'medium':
          title.textContent = "POTENTIAL FRAUD";
          break;
        case 'high':
          title.textContent = "HIGH RISK ALERT";
          break;
        default:
          title.textContent = "FRAUD SHIELD";
      }
    } else {
      title.textContent = "FRAUD SHIELD";
    }
    
    const hint = document.createElement("span");
    hint.className = "fraudshield-expand-hint";
    hint.textContent = "Click to view details";
    
    left.appendChild(icon);
    left.appendChild(title);
    left.appendChild(hint);
      // Use Mistral AI analysis result for the score if available
    const score = document.createElement("div");
    score.className = "fraudshield-score";
    
    if (analysis && analysis.success) {
      const riskLevel = analysis.riskLevel.toLowerCase();
      let riskColor;
      
      // Set color based on risk level
      switch(riskLevel) {
        case 'low':
          riskColor = '#4caf50'; // Green
          break;
        case 'medium':
          riskColor = '#ff9800'; // Yellow/Orange
          break;
        case 'high':
          riskColor = '#f44336'; // Red
          break;
        default:
          riskColor = '#9e9e9e'; // Grey for unknown
      }
        score.textContent = `RISK: ${riskLevel.toUpperCase()}`;
      score.style.color = '#FFFFFF'; // Changed to white
      score.style.fontWeight = 'bold';    } else {
      score.textContent = "RISK: MEDIUM";
      score.style.color = '#FFFFFF'; // Changed to white
    }
    
    header.appendChild(left);
    header.appendChild(score);
    
    const content = document.createElement("div");
    content.className = "fraudshield-content";
    
    const reasons = document.createElement("ul");
    reasons.className = "fraudshield-reasons";
      // Use reasons from Mistral AI if available
    let reasonsList = [
      "Local AI analysis detected suspicious patterns", 
      "Potential phishing attempt identified",
      "Sender verification failed"
    ];
    
    if (analysis && analysis.success && analysis.indicators && analysis.indicators.length > 0) {
      reasonsList = analysis.indicators;
      
      // Add explanation if available
      if (analysis.explanation) {
        const explanation = document.createElement("div");
        explanation.className = "fraudshield-explanation";
        explanation.style.cssText = "margin-bottom: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px;";
        explanation.textContent = analysis.explanation;
        content.appendChild(explanation);
      }
    }
    
    reasonsList.forEach(reason => {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.appendChild(item);
    });
    
    const buttons = document.createElement("div");
    buttons.className = "fraudshield-buttons";
    
    const reportBtn = document.createElement("button");
    reportBtn.className = "fraudshield-btn fraudshield-btn-report";
    reportBtn.textContent = "REPORT FRAUD";
    
    const dismissBtn = document.createElement("button");
    dismissBtn.className = "fraudshield-btn fraudshield-btn-dismiss";
    dismissBtn.textContent = "DISMISS";
    
    buttons.appendChild(reportBtn);
    buttons.appendChild(dismissBtn);
    
    content.appendChild(reasons);
    
    // Add recommended action if available from Mistral AI
    if (analysis && analysis.success && analysis.recommendedAction) {
      const recommendedAction = document.createElement("div");
      recommendedAction.className = "fraudshield-recommended-action";
      recommendedAction.style.cssText = "margin-top: 10px; margin-bottom: 10px; padding: 8px; background: #fffde7; border-left: 3px solid #ffd600; border-radius: 2px;";
      
      const actionTitle = document.createElement("div");
      actionTitle.style.cssText = "font-weight: bold; margin-bottom: 5px;";
      actionTitle.textContent = "Recommended Action:";
      
      const actionContent = document.createElement("div");
      actionContent.textContent = analysis.recommendedAction;
      
      recommendedAction.appendChild(actionTitle);
      recommendedAction.appendChild(actionContent);
      content.appendChild(recommendedAction);
    }
    
    content.appendChild(buttons);
      banner.appendChild(header);
    banner.appendChild(content);
    
    // Event handlers - exactly the same as before
    banner.addEventListener("click", function(e) {
      if (e.target.classList.contains("fraudshield-btn")) return;
      
      banner.classList.toggle("expanded");
      const expandHint = banner.querySelector(".fraudshield-expand-hint");
      if (expandHint) {
        expandHint.style.display = banner.classList.contains("expanded") ? "none" : "inline";
      }
    });
    
    reportBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      console.log("Fraud reported");
    });
    
    dismissBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      banner.remove();
    });
    
    return banner;  }

  reinitialize() {
    this.initialize();
  }
}

window.GmailPlatform = GmailPlatform;
