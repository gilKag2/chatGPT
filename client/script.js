import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent.length > 3) {
      element.textContent = '';
    }
  }, 300);
}


function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaString = randomNumber.toString(16);

  return `id-${timestamp}-${hexaString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `<div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
            <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}"/>
        </div>
        <div class="message" id="${uniqueId}">
          ${value}
        </div>
      </div>
    </div>`
  );
}


const handleSubmit = async (e) => {
  e.preventDefault();

  const prompt = new FormData(form).get('prompt');
  console.log(prompt);
  // user chatstripe
  const userUniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(false, prompt, userUniqueId);

  form.reset();

  // ai chatstripe
  const aiUniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", aiUniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(aiUniqueId);

  loader(messageDiv);

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt
    })
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = "";
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  const key = e.keyCode;
  if (key === 13) {
    handleSubmit(e);
  }
});