// Check if the script is already injected
if (!window.depopFollowManager) {
  // Create a namespace for our extension
  window.depopFollowManager = {
    isFollowing: false,
    isUnfollowing: false,
    
    // Helper function to sleep
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Smooth scroll function
    smoothScroll: async function() {
      try {
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollStep = viewportHeight / 4; // Scroll 1/4 viewport height at a time
        
        let currentScroll = window.scrollY;
        while (currentScroll < scrollHeight - viewportHeight) {
          if (!this.isFollowing && !this.isUnfollowing) break;
          
          currentScroll += scrollStep;
          window.scrollTo({
            top: currentScroll,
            behavior: 'smooth'
          });
          await this.sleep(1000); // Wait 1 second between scrolls
        }
      } catch (error) {
        console.error('Scroll error:', error);
      }
    },

    // Function to handle following
    handleFollow: async function() {
      try {
        let followCount = 0;
        while (this.isFollowing) {
          const followButtons = document.querySelectorAll('button._buttonWrapper_n6h1p_5._padding--sm_n6h1p_60._colorStyles--blue_n6h1p_100');
          let foundButtons = false;
          
          for (const button of followButtons) {
            if (!this.isFollowing) break;
            
            const buttonText = button.querySelector('span._text_bevez_41');
            if (buttonText && buttonText.textContent === 'Follow') {
              foundButtons = true;
              button.click();
              followCount++;
              console.log(`Followed User (${followCount}/29)`);
              
              // If we've reached 29 follows, wait for 2 minutes
              if (followCount >= 29) {
                console.log('Reached 29 follows - Taking a 2 minute break...');
                await this.sleep(120000); // 2 minutes in milliseconds
                followCount = 0; // Reset counter
                console.log('Break finished - Resuming follows');
              } else {
                await this.sleep(8250); // Normal 8.25 second delay between follows
              }
            }
          }
          
          if (foundButtons) {
            await this.smoothScroll();
          } else {
            await this.sleep(2000);
          }
        }
      } catch (error) {
        console.error('Follow error:(probably already following)', error);
        this.isFollowing = false;
      }
    },

    // Function to handle unfollowing
    handleUnfollow: async function() {
      try {
        while (this.isUnfollowing) {
          const followingButtons = document.querySelectorAll('button._buttonWrapper_n6h1p_5._padding--sm_n6h1p_60._colorStyles--green_n6h1p_86');
          let foundButtons = false;
          
          for (const button of followingButtons) {
            if (!this.isUnfollowing) break;
            
            const buttonText = button.querySelector('span._text_bevez_41');
            if (buttonText && buttonText.textContent === 'Following') {
              foundButtons = true;
              button.click();
              console.log('Unfollowed User');
              await this.sleep(6500); // 6.5 second delay between unfollows
            }
          }
          
          if (foundButtons) {
            await this.smoothScroll();
          } else {
            await this.sleep(2000);
          }
        }
      } catch (error) {
        console.error('Unfollow error:', error);
        this.isUnfollowing = false;
      }
    }
  };

  // Listen for messages from popup
  var countformsg = 0;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    countformsg++;
    if (countformsg == 1) {
      console.log('This application follows the Depop guidelines and API restrictions as of 2/23/2025.');
      console.log('Made with love by @ev');
    }
    console.log('Toggling:', request);

    
    if (request.action === 'toggleFollow') {
      window.depopFollowManager.isFollowing = request.value;
      window.depopFollowManager.isUnfollowing = false;
      if (window.depopFollowManager.isFollowing) {
        window.depopFollowManager.handleFollow().catch(console.error);
      }
      sendResponse({ success: true });
    } else if (request.action === 'toggleUnfollow') {
      window.depopFollowManager.isUnfollowing = request.value;
      window.depopFollowManager.isFollowing = false;
      if (window.depopFollowManager.isUnfollowing) {
        window.depopFollowManager.handleUnfollow().catch(console.error);
      }
      sendResponse({ success: true });
    }
    
    return true; // Required to use sendResponse asynchronously
  });
} 