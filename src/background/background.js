console.log('ScamDetect background script loaded');

let stats = {
  threatsBlocked: 0,
  emailsScanned: 0,
  messagesScanned: 0
};

chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    stats = result.stats;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'scanContent':
      handleContentScan(message, sendResponse);
      return true;
    
    case 'updateStats':
      updateStats(message.type);
      sendResponse({ success: true });
      break;
    
    case 'getStats':
      sendResponse(stats);
      break;
  }
});

function handleContentScan(message, sendResponse) {
  const { content, type, sender } = message;
  
  const result = {
    isScam: true,
    riskLevel: 'high',
    riskScore: 95,
    reasons: [
      'TESTING MODE: All content flagged as fraud',
      'Suspicious content detected',
      'Potential phishing attempt',
      'Unverified sender'
    ],
    confidence: 0.95
  };
  
  updateStats(type);
  
  sendResponse(result);
}

function updateStats(type) {
  stats.threatsBlocked++;
  
  if (type === 'email') {
    stats.emailsScanned++;
  } else if (type === 'message') {
    stats.messagesScanned++;
  }
  
  chrome.storage.local.set({ stats });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('ScamDetect extension installed');
  
  chrome.storage.local.set({
    stats: {
      threatsBlocked: 0,
      emailsScanned: 0,
      messagesScanned: 0
    }
  });
});
