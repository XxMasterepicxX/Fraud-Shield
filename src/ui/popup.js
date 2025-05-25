document.addEventListener("DOMContentLoaded", function() {
  loadStats();
  
  document.getElementById("scanPage").addEventListener("click", scanCurrentPage);
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("protectionToggle").addEventListener("change", toggleProtection);
  
  // Settings panel event listeners
  document.getElementById("closeSettings").addEventListener("click", closeSettings);
  document.getElementById("toggleKeyVisibility").addEventListener("click", toggleKeyVisibility);
  document.getElementById("saveApiKey").addEventListener("click", saveApiKey);
  
  // Load protection state
  loadProtectionState();
  
  // Load Mistral API key if available
  loadMistralApiKey();
  
  setInterval(loadStats, 3000);
});

function loadStats() {
  document.getElementById("threatsBlocked").textContent = "Active";
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url);
      let hostname = url.hostname;
      
      // Truncate long hostnames
      if (hostname.length > 16) {
        hostname = hostname.substring(0, 13) + "...";
      }
      
      document.getElementById("currentSite").textContent = hostname;
    }
  });
}

function loadProtectionState() {
  chrome.storage.sync.get(['protectionEnabled'], function(result) {
    const isEnabled = result.protectionEnabled !== false; // Default to true
    document.getElementById("protectionToggle").checked = isEnabled;
    updateProtectionUI(isEnabled);
  });
}

function toggleProtection() {
  const isEnabled = document.getElementById("protectionToggle").checked;
  
  // Save state
  chrome.storage.sync.set({protectionEnabled: isEnabled});
  
  // Update UI
  updateProtectionUI(isEnabled);
  
  // Send message to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "toggleProtection", 
      enabled: isEnabled
    });
  });
}

function updateProtectionUI(isEnabled) {
  const controlRow = document.querySelector(".control-row");
  
  if (isEnabled) {
    controlRow.classList.remove("protection-off");
    document.getElementById("scanPage").disabled = false;
  } else {
    controlRow.classList.add("protection-off");
    document.getElementById("scanPage").disabled = true;
  }
}

function scanCurrentPage() {
  const btn = document.getElementById("scanPage");
  const originalText = btn.textContent;
  
  btn.textContent = "Scanning...";
  btn.disabled = true;
  
  // Send scan message to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "scanCurrentPage"
    });
  });
  
  setTimeout(() => {
    btn.textContent = "Complete";
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 800);
  }, 1200);
}

function openSettings() {
  // Display the settings panel
  document.getElementById("settingsPanel").style.display = "block";
}

function closeSettings() {
  document.getElementById("settingsPanel").style.display = "none";
}

function toggleKeyVisibility() {
  const keyInput = document.getElementById("mistralApiKey");
  const toggleBtn = document.getElementById("toggleKeyVisibility");
  
  if (keyInput.type === "password") {
    keyInput.type = "text";
    toggleBtn.textContent = "🔒";
  } else {
    keyInput.type = "password";
    toggleBtn.textContent = "👁️";
  }
}

function loadMistralApiKey() {
  chrome.storage.local.get(['mistralApiKey'], function(result) {
    if (result.mistralApiKey) {
      document.getElementById("mistralApiKey").value = "••••••••••••••••••••••";
      setApiKeyStatus("API key configured", "success");
    }
  });
}

function saveApiKey() {
  const apiKey = document.getElementById("mistralApiKey").value.trim();
  const statusElement = document.getElementById("apiKeyStatus");
  
  if (!apiKey) {
    setApiKeyStatus("Please enter a valid API key", "error");
    return;
  }
  
  // If the key is masked with bullets, don't save it again
  if (apiKey === "••••••••••••••••••••••") {
    setApiKeyStatus("No changes made to API key", "success");
    return;
  }
  
  // Simple API key format validation
  if (apiKey.length < 20) {
    setApiKeyStatus("API key appears to be too short", "error");
    return;
  }
  
  // Save the key to local storage
  chrome.storage.local.set({mistralApiKey: apiKey}, function() {
    if (chrome.runtime.lastError) {
      setApiKeyStatus("Error saving API key: " + chrome.runtime.lastError.message, "error");
    } else {
      setApiKeyStatus("API key saved successfully", "success");
      document.getElementById("mistralApiKey").value = "••••••••••••••••••••••";
      
      // Notify any open tabs to reload the Mistral API configuration
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: "reloadMistralConfig",
            success: true
          }).catch(() => {
            // Ignore errors for inactive tabs
          });
        });
      });
    }
  });
}

function setApiKeyStatus(message, type) {
  const statusElement = document.getElementById("apiKeyStatus");
  statusElement.textContent = message;
  statusElement.className = "status-message";
  
  if (type === "success") {
    statusElement.classList.add("status-success");
  } else if (type === "error") {
    statusElement.classList.add("status-error");
  }
}
