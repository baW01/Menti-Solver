document.getElementById('save-key').addEventListener('click', () => {
  const apiKey = document.getElementById('api-key').value;
  chrome.storage.sync.set({ apiKey }, () => {
    console.log('API Key saved');
    document.getElementById('chatgpt-status').innerHTML = 'Connection to ChatGPT: <span style="color: orange;">Not Checked</span>';
  });
});

document.getElementById('check-key').addEventListener('click', () => {
  chrome.storage.sync.get('apiKey', ({ apiKey }) => {
    if (apiKey) {
      testChatGPTConnection(apiKey);
    } else {
      document.getElementById('chatgpt-status').innerHTML = 'Connection to ChatGPT: <span style="color: red;">Invalid</span>';
    }
  });
});

function testChatGPTConnection(apiKey) {
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'Test' }, { role: 'user', content: 'Test' }],
      max_tokens: 5,
      temperature: 0
    })
  })
  .then(response => {
    if (response.ok) {
      response.json().then(data => {
        document.getElementById('chatgpt-status').innerHTML = 'Connection to ChatGPT: <span style="color: green;">Valid</span>';
        document.getElementById('logs').innerText = JSON.stringify(data, null, 2); // Formatowanie JSON
      });
    } else {
      response.text().then(text => {
        document.getElementById('chatgpt-status').innerHTML = 'Connection to ChatGPT: <span style="color: red;">Invalid</span>';
        document.getElementById('logs').innerText = text;
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('chatgpt-status').innerHTML = 'Connection to ChatGPT: <span style="color: red;">Invalid</span>';
    document.getElementById('logs').innerText = error.toString();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url);
    if (url.hostname === 'www.menti.com') {
      document.getElementById('menti-status').innerHTML = 'Connection to Menti: <span style="color: green;">Valid</span>';
    } else {
      document.getElementById('menti-status').innerHTML = 'Connection to Menti: <span style="color: red;">Invalid (Go to Menti.com)</span>';
    }
  });

  chrome.storage.sync.get('apiKey', ({ apiKey }) => {
    if (apiKey) {
      document.getElementById('api-key').value = apiKey;
    }
  });
});
