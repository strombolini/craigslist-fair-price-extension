// Placeholder for background tasks or event listeners

chrome.runtime.onInstalled.addListener(() => {
  console.log('Craigslist Deal Analyzer extension installed.');
});

// Optional: Listener for when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked.');
  // Additional actions can be added here if needed
});
