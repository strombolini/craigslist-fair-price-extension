document.getElementById('analyze-button').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "analyze" }, (response) => {
      if (response) {
        processImages(response.images).then(encodedImages => {
          analyzeDeal(response, encodedImages);
        });
      } else {
        document.getElementById('result').innerText = 'Failed to retrieve listing details.';
      }
    });
  });
});

async function processImages(imageUrls) {
  const encodedImages = await Promise.all(imageUrls.map(async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    return `data:${blob.type};base64,${base64}`;
  }));
  return encodedImages;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function analyzeDeal(data, encodedImages) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const apiKey = 'YOUR_OPENAI_KEY_HERE';
  const imagePayloads = encodedImages.map(base64 => ({
    "type": "image_url",
    "image_url": {
      "url": base64
    }
  }));
  const prompt = [
    {
      "type": "text",
      "text": `Analyze the following Craigslist listing for a price estimate. You MUST mention the images in your response and do not repeat any obvious information the user would know about the listing. Format your response in normal english paragraph text without any strange symbols like hashtags, and keep the final response to about 1 short paragraph with the end of the paragraph being the comparison between your own price estimate and the listing price. Keep your response to about 60 words.:\n
      Title: ${data.title}\n
      Price: ${data.price}\n
      Description: ${data.description}\n
      Images:`
    },
    ...imagePayloads
  ];

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    })
  })
  .then(response => response.json())
  .then(data => {
    const priceEstimate = data.choices[0].message.content;
    document.getElementById('result').innerText = `Estimated Price: ${priceEstimate}`;
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('result').innerText = 'Error analyzing the deal.';
  });
}