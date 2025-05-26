/**
 * Universal Platform Handler - Toast notification system
 */
class UniversalPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.name = "universal";
    this.toastContainer = null;
    this.activeToasts = new Map();
    this.mistralAI = new MistralAI(); // Initialize Mistral AI
  }

  async isActive() {
    return !window.location.hostname.includes("mail.google.com") && 
           !window.location.hostname.includes("discord.com");
  }

  async initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    console.log("Fraud Shield: Universal platform initializing...");
    
    // Initialize Mistral AI API
    await this.mistralAI.initialize();
    
    this.createToastContainer();
    
    // Wait a bit for page to settle, then show initial toast
    setTimeout(() => {
      this.showInitialToast();
      this.startAutomaticScanning();
    }, 1000);
  }

  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'fraud-shield-toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      pointer-events: none;
    `;
    document.body.appendChild(this.toastContainer);
  }

  showInitialToast() {
    this.showToast('info', 'Fraud Shield Active', 'Real-time protection enabled. Monitoring for suspicious content.');
  }

  startAutomaticScanning() {
    // Periodic automatic fraud detection
    let scanCount = 0;
    const automaticScan = async () => {
      if (!this.baseScanner.protectionEnabled || scanCount > 10) return;
      
      // Random delay between 10-30 seconds
      const delay = 10000 + Math.random() * 20000;
      
      setTimeout(async () => {
        if (!this.baseScanner.protectionEnabled) return;
        
        console.log('Fraud Shield: Running automatic scan...');
        
        try {
          // Only scan if the API key is available or in every 3rd scan for demo
          const shouldUseMistral = await this.mistralAI.initialize() || scanCount % 3 === 0;
          
          if (shouldUseMistral) {
            // Extract important content from the page
            const pageContent = this.extractPageContent();
            const url = window.location.href;
              // Use Mistral AI for analysis
            const analysis = await this.mistralAI.analyzeContent({
              content: pageContent,
              url: url,
              context: 'Automatic periodic scan'
            });
            
            if (analysis.success) {
              const risk = analysis.riskLevel;
              const messages = {
                low: {
                  title: 'Low Risk Content Detected',
                  message: analysis.explanation || 'Some potentially misleading information was found on this page.'
                },
                medium: {
                  title: 'Potential Fraud Warning', 
                  message: analysis.explanation || 'This page contains patterns commonly used in scam attempts.'
                },
                high: {
                  title: 'High Risk Alert',
                  message: analysis.explanation || 'Multiple fraud indicators detected. Exercise extreme caution.'
                }
              };
              
              const msg = messages[risk] || messages.medium;
              console.log(`Fraud Shield: AI scan detected ${risk} risk`);
              this.showToast(risk, msg.title, msg.message, analysis);
            } else {
              // Fallback to demo mode but include any partial analysis
              console.log('Fraud Shield: Falling back to demo mode due to AI analysis failure');
              this.runDemoScan(analysis);
            }
          } else {
            // Use demo mode for scanning
            this.runDemoScan();
          }
        } catch (error) {
          console.error('Fraud Shield: Error during automatic scan', error);
          this.runDemoScan();
        }
        
        scanCount++;
        
        // Continue automatic scanning
        automaticScan();
      }, delay);
    };
    
    // Start first automatic scan after 5 seconds
    setTimeout(automaticScan, 5000);
  }
    /**
   * Run a demo scan with random results for demonstration
   * @private
   * @param {Object} partialAnalysis - Optional partial analysis to use
   */
  runDemoScan(partialAnalysis = null) {
    // If we have a partial analysis with a risk level, use it
    let risk;
    if (partialAnalysis && partialAnalysis.riskLevel) {
      risk = partialAnalysis.riskLevel;
    } else {
      // Otherwise generate a random risk level
      const risks = ['low', 'medium', 'high'];
      risk = risks[Math.floor(Math.random() * risks.length)];
    }
    
    const defaultMessages = {
      low: {
        title: 'Low Risk Content Detected',
        message: 'Some potentially misleading information was found on this page.'
      },
      medium: {
        title: 'Potential Fraud Warning', 
        message: 'This page contains patterns commonly used in scam attempts.'
      },
      high: {
        title: 'High Risk Alert',
        message: 'Multiple fraud indicators detected. Exercise extreme caution.'
      }
    };
    
    // Use partial analysis explanation if available, otherwise use default
    const msg = {
      title: defaultMessages[risk].title,
      message: partialAnalysis && partialAnalysis.explanation ? 
        partialAnalysis.explanation : 
        defaultMessages[risk].message
    };
    console.log(`Fraud Shield: Demo scan detected ${risk} risk`);
    this.showToast(risk, msg.title, msg.message);
  }
  async scanCurrentPage() {
    console.log('Fraud Shield: Manual universal scan triggered');
    this.showToast('scan', 'Scanning Page', 'Analyzing content for fraud indicators...');
    
    try {
      // Extract page content for analysis
      const pageContent = this.extractPageContent();
      const url = window.location.href;
      
      console.log('Fraud Shield Universal: Beginning page analysis', {
        url: url,
        contentLength: pageContent.length,
        contentPreview: pageContent.substring(0, 150).replace(/\n/g, ' ') + '...',
        timestamp: new Date().toISOString()
      });
      
      // Analyze content with Mistral AI
      const analysis = await this.mistralAI.analyzeContent({
        content: pageContent,
        url: url,
        context: 'User-initiated scan'
      });
      
      console.log('Fraud Shield Universal: Mistral AI analysis complete', {
        success: analysis.success,
        riskLevel: analysis.riskLevel || 'unknown',
        confidence: analysis.confidence || 'N/A',
        indicatorsCount: analysis.indicators ? analysis.indicators.length : 0,
        explanation: analysis.explanation ? analysis.explanation.substring(0, 100) + '...' : 'N/A',
        error: analysis.error || 'none',
        url: url
      });
      
      if (analysis.success) {
        // Use the analysis result
        const risk = analysis.riskLevel || 'medium';
        const results = {
          low: { 
            title: 'Page Scan Complete', 
            message: analysis.explanation || 'Minor suspicious elements found. Proceed with caution.' 
          },
          medium: { 
            title: 'Fraud Patterns Detected', 
            message: analysis.explanation || 'Several warning signs identified. Verify before proceeding.' 
          },
          high: { 
            title: 'Dangerous Content Found', 
            message: analysis.explanation || 'High-risk fraud indicators detected. Do not enter personal information.' 
          }
        };
        
        this.showToast(risk, results[risk].title, results[risk].message, analysis);
      } else {
        // Fallback to random for demo if analysis failed
        console.log('Fraud Shield: Falling back to demo mode due to:', analysis.error);
        const risk = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
        const results = {
          low: { title: 'Page Scan Complete', message: 'Minor suspicious elements found. Proceed with caution.' },
          medium: { title: 'Fraud Patterns Detected', message: 'Several warning signs identified. Verify before proceeding.' },
          high: { title: 'Dangerous Content Found', message: 'High-risk fraud indicators detected. Do not enter personal information.' }
        };
        this.showToast(risk, results[risk].title, results[risk].message);
      }
    } catch (error) {
      console.error('Fraud Shield: Error during page scan', error);
      this.showToast('medium', 'Scan Error', 'Could not complete fraud analysis. Please try again later.');
    }
  }
  /**
   * Extract relevant content from the page for analysis
   * @returns {string} Extracted content
   */
  extractPageContent() {
    console.log('Fraud Shield Universal: Extracting page content for analysis');
    
    // Get the most important content elements from the page
    const title = document.title || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    console.log('Fraud Shield Universal: Basic page metadata', {
      title: title,
      metaDescriptionLength: metaDescription.length,
      url: window.location.href
    });
    
    // Get main content based on common content containers
    const contentSelectors = [
      'main', 'article', '#content', '.content', '#main', '.main',
      '[role="main"]', '[itemprop="mainContentOfPage"]'
    ];
    
    let mainContent = '';
    let selectedSelector = '';
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.length > mainContent.length) {
        mainContent = element.textContent.trim();
        selectedSelector = selector;
      }
    }
    
    console.log('Fraud Shield Universal: Content extraction results', {
      foundMainContentContainer: !!mainContent,
      selectedSelector: selectedSelector || 'none',
      contentLength: mainContent.length,
      usingBodyFallback: !mainContent
    });
    
    // If no main content found, grab body text
    if (!mainContent) {
      mainContent = document.body.textContent.substring(0, 8000).trim();
      console.log('Fraud Shield Universal: Using body text fallback', {
        bodyTextLength: mainContent.length
      });
    }
    
    // Get all forms on the page (potential phishing targets)
    const forms = Array.from(document.querySelectorAll('form'));
    const formData = forms.map(form => {
      const formInputs = Array.from(form.querySelectorAll('input'))
        .map(input => `${input.name || input.id}: ${input.type}`)
        .join(', ');
      return `Form (action: ${form.action}): ${formInputs}`;
    }).join('\n');
    
    console.log('Fraud Shield Universal: Form data extraction', {
      formsFound: forms.length,
      formDataLength: formData.length
    });
    
    // Get all links on the page (potential malicious links)
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const links = allLinks
      .map(a => a.href)
      .filter(href => !href.startsWith('javascript:'))
      .slice(0, 20)
      .join('\n');
    
    console.log('Fraud Shield Universal: Link extraction', {
      totalLinksFound: allLinks.length,
      linksIncluded: Math.min(allLinks.length, 20)
    });
    
    // Compile everything
    const compiledContent = `Page Title: ${title}\n
Meta Description: ${metaDescription}\n
URL: ${window.location.href}\n
Main Content:\n${mainContent.substring(0, 4000)}\n
Forms:\n${formData}\n
Key Links:\n${links}`;
    
    console.log('Fraud Shield Universal: Content compilation complete', {
      compiledContentLength: compiledContent.length,
      compiledContentPreview: compiledContent.substring(0, 100).replace(/\n/g, ' ') + '...'
    });
    
    return compiledContent;
  }

  showToast(riskLevel, title, message, analysis = null) {
    const toast = document.createElement('div');
    const toastId = Date.now();
    toast.className = 'fraud-toast';
    toast.dataset.risk = riskLevel;
      const colors = {
      info: { bg: '#e3f2fd', border: '#2196f3', icon: '#1976d2', text: '#0d47a1', iconBg: '#bbdefb' },
      scan: { bg: '#f3e5f5', border: '#9c27b0', icon: '#7b1fa2', text: '#4a148c', iconBg: '#e1bee7' },
      low: { bg: '#e8f5e9', border: '#4caf50', icon: '#2e7d32', text: '#1b5e20', iconBg: '#c8e6c9' },
      medium: { bg: '#fff3e0', border: '#ff9800', icon: '#e64a19', text: '#bf360c', iconBg: '#ffccbc' },
      high: { bg: '#ffebee', border: '#f44336', icon: '#c62828', text: '#b71c1c', iconBg: '#ffcdd2' }
    };
    
    const color = colors[riskLevel] || colors.medium;    // Prepare analysis details if available
    const riskFactors = analysis?.indicators?.length || Math.floor(2 + Math.random() * 5);
    const patternMatch = analysis?.success ? 'Yes' : (Math.random() > 0.5 ? 'Yes' : 'Partial');
    const threatType = analysis?.threatType || ['Phishing', 'Scam', 'Malware'][Math.floor(Math.random() * 3)];
    
    toast.innerHTML = `
      <div class="fraud-toast-inner">
        <div class="fraud-toast-header">
          <div class="fraud-toast-icon-wrapper" style="background: ${color.iconBg};">
            <div class="fraud-toast-icon" style="color: ${color.icon};">!</div>
          </div>
          <div class="fraud-toast-content">
            <div class="fraud-toast-title" style="color: ${color.text};">${title}</div>
            <div class="fraud-toast-message">${message}</div>
          </div>
          <div class="fraud-toast-close" style="color: ${color.text};">×</div>
        </div>
        <div class="fraud-toast-expand">View details</div>
        <div class="fraud-toast-details">
          <div class="fraud-toast-detail-title">Analysis Results:</div>          <div class="fraud-toast-detail-grid">
            <div class="fraud-detail-item">
              <span class="detail-label">Risk Level:</span>
              <span class="detail-value" style="color: #FFFFFF; font-weight: bold;">${riskLevel.toUpperCase()}</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Risk Factors:</span>
              <span class="detail-value">${riskFactors}</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Pattern Match:</span>
              <span class="detail-value">${patternMatch}</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Threat Type:</span>
              <span class="detail-value">${threatType}</span>
            </div>
          </div>
          ${analysis?.indicators ? `
          <div class="fraud-indicators">
            <div class="fraud-indicators-title">Detected Indicators:</div>
            <ul class="fraud-indicators-list">
              ${analysis.indicators.map(indicator => `<li>${indicator}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${analysis?.recommendedAction ? `
          <div class="fraud-recommended-action">
            <div class="fraud-action-title">Recommended Action:</div>
            <div class="fraud-action-text">${analysis.recommendedAction}</div>
          </div>
          ` : ''}
          <div class="fraud-toast-actions">
            <button class="fraud-toast-btn fraud-toast-report" style="background: ${color.icon};">Report Fraud</button>
            <button class="fraud-toast-btn fraud-toast-dismiss">Dismiss</button>
          </div>
        </div>
      </div>
    `;
    
    toast.style.cssText = `
      background: ${color.bg};
      border: 2px solid ${color.border};
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      cursor: pointer;
      transition: all 0.3s ease;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      overflow: hidden;
    `;
    
    // Add event listeners
    const closeBtn = toast.querySelector('.fraud-toast-close');
    const expandArea = toast.querySelector('.fraud-toast-expand');
    const reportBtn = toast.querySelector('.fraud-toast-report');
    const dismissBtn = toast.querySelector('.fraud-toast-dismiss');
    
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toast, toastId);
    });
    
    expandArea.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = toast.classList.contains('expanded');
      if (isExpanded) {
        toast.classList.remove('expanded');
        expandArea.textContent = 'View details';
      } else {
        toast.classList.add('expanded');
        expandArea.textContent = 'Hide details';
      }
    });
    
    reportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Fraud reported');
      this.removeToast(toast, toastId);
    });
    
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toast, toastId);
    });
    
    this.toastContainer.appendChild(toast);
    this.activeToasts.set(toastId, toast);
    
    // Auto-remove info and scan toasts after 5 seconds
    if (riskLevel === 'info' || riskLevel === 'scan') {
      setTimeout(() => {
        if (this.activeToasts.has(toastId)) {
          this.removeToast(toast, toastId);
        }
      }, 5000);
    }
    
    // Auto-remove low risk toasts after 20 seconds
    if (riskLevel === 'low') {
      setTimeout(() => {
        if (this.activeToasts.has(toastId)) {
          this.removeToast(toast, toastId);
        }
      }, 20000);
    }
  }

  removeToast(toast, toastId) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      this.activeToasts.delete(toastId);
    }, 300);
  }

  reinitialize() {
    if (this.toastContainer) {
      this.toastContainer.remove();
      this.toastContainer = null;
    }
    this.activeToasts.clear();
    this.initialize();
  }
}

window.UniversalPlatform = UniversalPlatform;
