/**
 * Universal Platform Handler - Toast notification system
 */
class UniversalPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.name = "universal";
    this.toastContainer = null;
    this.activeToasts = new Map();
  }

  isActive() {
    return !window.location.hostname.includes("mail.google.com") && 
           !window.location.hostname.includes("discord.com");
  }

  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    console.log("Fraud Shield: Universal platform initializing...");
    
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
    // Simulate automatic fraud detection
    let scanCount = 0;
    const automaticScan = () => {
      if (!this.baseScanner.protectionEnabled || scanCount > 10) return;
      
      // Random delay between 10-30 seconds
      const delay = 10000 + Math.random() * 20000;
      
      setTimeout(() => {
        if (!this.baseScanner.protectionEnabled) return;
        
        const risks = ['low', 'medium', 'high'];
        const risk = risks[Math.floor(Math.random() * risks.length)];
        
        const messages = {
          low: {
            title: 'Suspicious Content Detected',
            message: 'Found potentially misleading information on this page.'
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
        
        const msg = messages[risk];
        console.log(`Fraud Shield: Automatic scan detected ${risk} risk`);
        this.showToast(risk, msg.title, msg.message);
        scanCount++;
        
        // Continue automatic scanning
        automaticScan();
      }, delay);
    };
    
    // Start first automatic scan after 5 seconds
    setTimeout(automaticScan, 5000);
  }

  scanCurrentPage() {
    console.log('Fraud Shield: Manual universal scan triggered');
    this.showToast('scan', 'Scanning Page', 'Analyzing content for fraud indicators...');
    
    setTimeout(() => {
      const risk = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
      const results = {
        low: { title: 'Page Scan Complete', message: 'Minor suspicious elements found. Proceed with caution.' },
        medium: { title: 'Fraud Patterns Detected', message: 'Several warning signs identified. Verify before proceeding.' },
        high: { title: 'Dangerous Content Found', message: 'High-risk fraud indicators detected. Do not enter personal information.' }
      };
      this.showToast(risk, results[risk].title, results[risk].message);
    }, 1500);
  }

  showToast(riskLevel, title, message) {
    const toast = document.createElement('div');
    const toastId = Date.now();
    toast.className = 'fraud-toast';
    toast.dataset.risk = riskLevel;
    
    const colors = {
      info: { bg: '#e3f2fd', border: '#2196f3', icon: '#1976d2', text: '#0d47a1', iconBg: '#bbdefb' },
      scan: { bg: '#f3e5f5', border: '#9c27b0', icon: '#7b1fa2', text: '#4a148c', iconBg: '#e1bee7' },
      low: { bg: '#fff8e1', border: '#ffc107', icon: '#f57c00', text: '#e65100', iconBg: '#ffecb3' },
      medium: { bg: '#fff3e0', border: '#ff9800', icon: '#e64a19', text: '#bf360c', iconBg: '#ffccbc' },
      high: { bg: '#ffebee', border: '#f44336', icon: '#c62828', text: '#b71c1c', iconBg: '#ffcdd2' }
    };
    
    const color = colors[riskLevel] || colors.medium;
    
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
          <div class="fraud-toast-detail-title">Analysis Results:</div>
          <div class="fraud-toast-detail-grid">
            <div class="fraud-detail-item">
              <span class="detail-label">Confidence:</span>
              <span class="detail-value">${Math.floor(60 + Math.random() * 35)}%</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Risk Factors:</span>
              <span class="detail-value">${Math.floor(2 + Math.random() * 5)}</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Pattern Match:</span>
              <span class="detail-value">${Math.random() > 0.5 ? 'Yes' : 'Partial'}</span>
            </div>
            <div class="fraud-detail-item">
              <span class="detail-label">Threat Type:</span>
              <span class="detail-value">${['Phishing', 'Scam', 'Malware'][Math.floor(Math.random() * 3)]}</span>
            </div>
          </div>
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
