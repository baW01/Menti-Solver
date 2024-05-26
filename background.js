chrome.runtime.onInstalled.addListener(() => {
    console.log("Menti Question Detector installed");
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "question_detected") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon48.png",
        title: "Question Detected",
        message: "A new question was detected on Menti."
      });
  
      chrome.storage.sync.get('apiKey', ({ apiKey }) => {
        if (!apiKey) {
          console.error('API Key is not set');
          chrome.tabs.sendMessage(sender.tab.id, { type: "answer_received", answer: "API Key is not set" });
          return;
        }
  
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `Pytanie: ${message.question}\n${message.answers.map((ans, i) => `Odp ${i + 1}: ${ans}`).join('\n')}` }
            ],
            max_tokens: 150,
            temperature: 0
          })
        })
        .then(response => response.json())
        .then(data => {
          const answer = data.choices[0].message.content.trim();
          chrome.tabs.sendMessage(sender.tab.id, { type: "answer_received", answer });
        })
        .catch(error => {
          console.error('Error:', error);
          chrome.tabs.sendMessage(sender.tab.id, { type: "answer_received", answer: "Error fetching response from API" });
        });
      });
    }
  });
  