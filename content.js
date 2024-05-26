let isProcessing = false;
let lastProcessedQuestion = '';

function createAnswerPopup() {
  const existingPopup = document.getElementById('chatgpt-answer-popup');
  if (existingPopup) {
    return; // Okienko już istnieje
  }

  const popup = document.createElement('div');
  popup.id = 'chatgpt-answer-popup';
  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.left = '20px';
  popup.style.padding = '10px';
  popup.style.backgroundColor = 'white';
  popup.style.border = '2px solid green';
  popup.style.borderRadius = '5px';
  popup.style.zIndex = '1000';
  popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
  popup.style.width = '300px';
  popup.style.height = '100px';
  popup.style.overflow = 'auto';

  // Dodaj popup do body
  document.body.appendChild(popup);
}

function displayAnswer(answer) {
  const popup = document.getElementById('chatgpt-answer-popup');
  if (popup) {
    popup.innerHTML = `<p>Correct Answer: ${answer}</p>`;
  }
}

const observer = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const questionElement = document.querySelector('h1[data-testid="voting-title"]');
      const answersElements = document.querySelectorAll('button[type="submit"][aria-label]');
      
      if (questionElement && answersElements.length > 0 && !isProcessing) {
        const question = questionElement.innerText;

        if (question !== lastProcessedQuestion) {
          isProcessing = true;
          lastProcessedQuestion = question;
          const answers = Array.from(answersElements).map(el => el.getAttribute('aria-label'));

          chrome.runtime.sendMessage({ type: "question_detected", question, answers });
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "answer_received") {
    displayAnswer(message.answer);
    isProcessing = false; // Reset processing flag to allow detecting new questions
  }
});

createAnswerPopup();
