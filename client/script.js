import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// Fuction to load the messages with 3 dots
function loader(element){
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

 // If the loading indicator has reached three dots, reset it

        if (element.textContent === '....') {
            element.textContent = ''; 
        }
    }, 300) // repeats every 300 milliseconds
}

// Function to implement typing functionality in app 
// This prevents the generated text to appear as a whole and improves the overall user experience.
function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index); // a character is returned at a specific intex from the text ganarated by AI.
            index++;
        } else {
            clearInterval(interval); // when we reach the end of the text clear interval
        }
    }, 20) // repeats after every 20 milliseconds
}

// Function to generated uniqueID for every single generated message
//This helps to map over them easily without any ambiguity.
function generateUniqueId() {
    const timestamp = Date.now(); // date is always unique
    const randomNumber = Math.random(); // makes it more random
    const hexadecimalString = randomNumber.toString(16); // makes it even more random

    return `id-${timestamp}-${hexadecimalString}`;
}

// Function to create chat stripes to differentiate whether user has written the message or the AI Teacher.
function chatStripe (isAi, value, uniqueID){
    return (
      `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueID}>${value}</div>
            </div>
        </div>
    `
    )
}

// Function used as trigger to get AI generated response.
const handleSubmit = async (e) => {
    e.preventDefault() // prevents default behaviour of browser

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    // bot's chatstripe
    const uniqueID = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueID);

    loader(messageDiv);
     
    //fetch data from server -> bot's response
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json(); // gives actual response from backend
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

// handling the submit button and accepting submit when enter is pressed in keyboard
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
