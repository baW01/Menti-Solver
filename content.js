let isProcessing = false;

const observer = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const questionElement = document.querySelector('h1[data-testid="voting-title"]');
      const answersElements = document.querySelectorAll('button[type="submit"][aria-label]');
      
      if (questionElement && answersElements.length > 0 && !isProcessing) {
        isProcessing = true;
        const question = questionElement.innerText;
        const answers = Array.from(answersElements).map(el => el.getAttribute('aria-label'));

        chrome.runtime.sendMessage({ type: "question_detected", question, answers });
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "answer_received") {
    alert(`Answer: ${message.answer}`);
    isProcessing = false; // Reset processing flag to allow detecting new questions
  }
});
