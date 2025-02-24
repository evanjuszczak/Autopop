document.addEventListener('DOMContentLoaded', function() {
  const followToggle = document.getElementById('followToggle');
  const unfollowToggle = document.getElementById('unfollowToggle');
  const followStatus = document.getElementById('followStatus');
  const unfollowStatus = document.getElementById('unfollowStatus');

  // Function to check if we're on a Depop page
  async function isOnDepopPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.url.includes('depop.com');
  }

  // Function to send message to content script
  async function sendMessage(action, value) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on a Depop page
      if (!tab.url.includes('depop.com')) {
        followStatus.textContent = 'Error: Please use on Depop.com';
        unfollowStatus.textContent = 'Error: Please use on Depop.com';
        followToggle.checked = false;
        unfollowToggle.checked = false;
        return;
      }

      // Inject content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }).catch(() => {}); // Ignore if already injected

      // Send message with retry
      const response = await chrome.tabs.sendMessage(tab.id, { action, value })
        .catch(async (err) => {
          console.error('Send message failed:', err);
          // If sending failed, try re-injecting the content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Try sending the message again
          return chrome.tabs.sendMessage(tab.id, { action, value });
        });

      return response;
    } catch (error) {
      console.error('Error:', error);
      followStatus.textContent = 'Error: Please refresh the page';
      unfollowStatus.textContent = 'Error: Please refresh the page';
      followToggle.checked = false;
      unfollowToggle.checked = false;
    }
  }

  followToggle.addEventListener('change', async function() {
    const isActive = this.checked;
    
    if (isActive && !(await isOnDepopPage())) {
      followStatus.textContent = 'Error: Please use on Depop.com';
      this.checked = false;
      return;
    }
    
    followStatus.textContent = `Status: ${isActive ? 'Active' : 'Inactive'}`;
    
    if (isActive) {
      unfollowToggle.checked = false;
      unfollowStatus.textContent = 'Status: Inactive';
    }
    
    sendMessage('toggleFollow', isActive);
  });

  unfollowToggle.addEventListener('change', async function() {
    const isActive = this.checked;
    
    if (isActive && !(await isOnDepopPage())) {
      unfollowStatus.textContent = 'Error: Please use on Depop.com';
      this.checked = false;
      return;
    }
    
    unfollowStatus.textContent = `Status: ${isActive ? 'Active' : 'Inactive'}`;
    
    if (isActive) {
      followToggle.checked = false;
      followStatus.textContent = 'Status: Inactive';
    }
    
    sendMessage('toggleUnfollow', isActive);
  });

  // Check if we're on Depop.com when popup opens
  isOnDepopPage().then(onDepop => {
    if (!onDepop) {
      followStatus.textContent = 'Error: Please use on Depop.com';
      unfollowStatus.textContent = 'Error: Please use on Depop.com';
    }
  });
}); 