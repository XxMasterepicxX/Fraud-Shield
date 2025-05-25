/**
 * Discord Platform Handler - Native Discord-style warnings
 */
class DiscordPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.scannedMessages = new Set();
    this.name = "discord";
    this.checkInterval = null;
  }

  isActive() {
    return window.location.hostname.includes("discord.com");
  }

  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    console.log("Fraud Shield: Discord platform initializing...");
    
    this.injectDiscordStyles();
    
    // Wait for Discord to load, then start monitoring
    setTimeout(() => {
      this.startMonitoring();
      this.observeNewMessages();
    }, 2000);
  }

  startMonitoring() {
    // Check for messages every 2 seconds
    this.checkInterval = setInterval(() => {
      if (!this.baseScanner.protectionEnabled) {
        clearInterval(this.checkInterval);
        return;
      }
      
      const messages = this.getVisibleMessages();
      if (messages.length > 0) {
        console.log(`Fraud Shield: Found ${messages.length} visible messages`);
        this.scanMessages(messages);
      }
    }, 2000);
  }

  scanMessages(messages) {
    messages.forEach((msg, index) => {
      const messageId = msg.id || msg.getAttribute('id') || Math.random().toString();
      
      if (!this.scannedMessages.has(messageId) && !msg.dataset.fraudChecked) {
        this.scannedMessages.add(messageId);
        msg.dataset.fraudChecked = 'true';
        
        // Add warnings to some messages (30% chance in testing mode)
        if (Math.random() < 0.3) {
          const warning = this.createDiscordWarning(this.getRandomRiskLevel());
          this.insertWarning(msg, warning);
        }
      }
    });
  }

  injectDiscordStyles() {
    if (document.getElementById('fraud-shield-discord-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fraud-shield-discord-styles';
    style.textContent = `
      .fraud-discord-warning {
        background: #2b2d31;
        border-left: 4px solid #f23f43;
        margin: 8px 16px;
        padding: 12px 16px;
        border-radius: 4px;
        font-family: var(--font-primary);
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        max-width: 800px;
      }
      
      .fraud-discord-warning:hover {
        background: #32353b;
      }
      
      .fraud-discord-header {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #b5bac1;
        font-size: 14px;
      }
      
      .fraud-discord-icon {
        width: 20px;
        height: 20px;
        background: #f23f43;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .fraud-discord-icon::after {
        content: "!";
        color: white;
        font-weight: bold;
        font-size: 14px;
      }
      
      .fraud-discord-title {
        color: #f23f43;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
      }
      
      .fraud-discord-time {
        color: #949ba4;
        font-size: 12px;
        margin-left: auto;
      }
      
      .fraud-discord-risk {
        background: #f23f43;
        color: white;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 500;
      }
      
      .fraud-discord-content {
        margin-top: 8px;
        color: #dbdee1;
        font-size: 14px;
        line-height: 1.5;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .fraud-discord-warning.expanded .fraud-discord-content {
        max-height: 200px;
      }
      
      .fraud-discord-warning.risk-low {
        border-left-color: #f0b232;
      }
      
      .fraud-discord-warning.risk-low .fraud-discord-icon,
      .fraud-discord-warning.risk-low .fraud-discord-risk {
        background: #f0b232;
      }
      
      .fraud-discord-warning.risk-low .fraud-discord-title {
        color: #f0b232;
      }
      
      .fraud-discord-warning.risk-medium {
        border-left-color: #f57731;
      }
      
      .fraud-discord-warning.risk-medium .fraud-discord-icon,
      .fraud-discord-warning.risk-medium .fraud-discord-risk {
        background: #f57731;
      }
      
      .fraud-discord-warning.risk-medium .fraud-discord-title {
        color: #f57731;
      }
    `;
    document.head.appendChild(style);
  }

  getVisibleMessages() {
    // Try multiple selectors to find messages
    const selectors = [
      '[id^="message-content-"]',
      '[class*="messageContent-"]',
      '[class*="message-"][class*="groupStart-"]',
      '[class*="message-"][class*="cozyMessage-"]',
      '[data-list-item-id*="chat-messages"]',
      'li[id*="chat-messages-"]'
    ];
    
    let messages = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        messages = Array.from(elements);
        break;
      }
    }
    
    // Filter to only visible messages
    const viewport = {
      top: window.scrollY,
      bottom: window.scrollY + window.innerHeight
    };
    
    return messages.filter(msg => {
      const rect = msg.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      return top >= viewport.top - 100 && top <= viewport.bottom + 100;
    });
  }

  observeNewMessages() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const observer = this.baseScanner.createObserver((mutations) => {
      if (!this.baseScanner.protectionEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this is a message or contains messages
            const isMessage = node.id && (node.id.includes('message') || node.id.includes('chat-messages'));
            const hasMessages = node.querySelector && node.querySelector('[id*="message-content-"], [class*="messageContent-"]');
            
            if (isMessage || hasMessages) {
              setTimeout(() => {
                const messages = this.getVisibleMessages();
                this.scanMessages(messages);
              }, 100);
            }
          }
        });
      });
    });
  }

  insertWarning(messageElement, warning) {
    try {
      // Try to find the best container for the warning
      let container = messageElement;
      
      // Look for parent li or article element
      const parentLi = messageElement.closest('li');
      const parentArticle = messageElement.closest('article');
      
      if (parentLi) {
        container = parentLi;
      } else if (parentArticle) {
        container = parentArticle;
      }
      
      // Insert after the message container
      if (container.parentElement) {
        container.parentElement.insertBefore(warning, container.nextSibling);
      }
    } catch (e) {
      console.error('Fraud Shield: Error inserting warning', e);
    }
  }

  scanCurrentPage() {
    console.log('Fraud Shield: Manual Discord scan triggered');
    // Clear existing checks to rescan
    this.scannedMessages.clear();
    document.querySelectorAll('[data-fraud-checked]').forEach(el => {
      delete el.dataset.fraudChecked;
    });
    
    const messages = this.getVisibleMessages();
    console.log(`Fraud Shield: Manual scan found ${messages.length} messages`);
    
    // Force scan all visible messages with higher chance
    messages.forEach((msg, index) => {
      if (index < 5) { // Show warnings on first 5 messages
        const warning = this.createDiscordWarning(this.getRandomRiskLevel());
        this.insertWarning(msg, warning);
      }
    });
  }

  getRandomRiskLevel() {
    const rand = Math.random();
    if (rand < 0.3) return 'low';
    if (rand < 0.7) return 'medium';
    return 'high';
  }

  createDiscordWarning(riskLevel) {
    const warning = document.createElement('div');
    warning.className = `fraud-discord-warning risk-${riskLevel}`;
    
    const header = document.createElement('div');
    header.className = 'fraud-discord-header';
    
    const icon = document.createElement('div');
    icon.className = 'fraud-discord-icon';
    
    const title = document.createElement('span');
    title.className = 'fraud-discord-title';
    title.textContent = 'Fraud Shield Alert';
    
    const time = document.createElement('span');
    time.className = 'fraud-discord-time';
    const now = new Date();
    time.textContent = `Today at ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const risk = document.createElement('span');
    risk.className = 'fraud-discord-risk';
    risk.textContent = `${riskLevel.toUpperCase()} RISK`;
    
    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(risk);
    header.appendChild(time);
    
    const content = document.createElement('div');
    content.className = 'fraud-discord-content';
    content.innerHTML = this.getRiskContent(riskLevel);
    
    warning.appendChild(header);
    warning.appendChild(content);
    
    warning.addEventListener('click', () => {
      warning.classList.toggle('expanded');
    });
    
    return warning;
  }
  getRiskContent(level) {
    const contents = {
      low: `<strong>Suspicious Pattern Detected</strong><br>
            - Generic greeting with urgent request<br>
            - Unverified external link detected<br>
            - Click to see full analysis`,
      medium: `<strong>Potential Scam Detected</strong><br>
               - Cryptocurrency investment promise<br>
               - Pressure tactics identified<br>
               - Unverified sender<br>
               - Click to see full analysis`,
      high: `<strong>High Risk Fraud Alert</strong><br>
             - Multiple fraud indicators detected<br>
             - Known scam pattern matched<br>
             - DO NOT click any links<br>
             - Report this message immediately`
    };
    return contents[level];
  }

  reinitialize() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.scannedMessages.clear();
    this.initialize();
  }
}

window.DiscordPlatform = DiscordPlatform;
