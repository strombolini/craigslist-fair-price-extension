chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze") {
    const title = document.querySelector('span#titletextonly')?.innerText || '';
    const price = document.querySelector('span.price')?.innerText || '';
    const description = document.querySelector('section#postingbody')?.innerText || '';
    const images = Array.from(document.querySelectorAll('img')).map(img => img.src);

    sendResponse({ title, price, description, images });
  }
});