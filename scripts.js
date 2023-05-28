// Create button
const button = document.createElement('button');
button.innerText = 'Submit File';
button.tabIndex = 3;
button.style.backgroundColor = 'rgba(32, 33, 35, 1)';
button.style.color = 'rgba(255, 255, 255, 1)';
button.style.padding = '10px 20px';
button.style.minWidth = 'max-content';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
button.style.transition = 'background-color 0.3s, box-shadow 0.3s';

// Hover effects
button.addEventListener('mouseenter', () => {
  button.style.backgroundColor = 'rgba(32, 33, 35, 0.8)';
  button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
});

button.addEventListener('mouseleave', () => {
  button.style.backgroundColor = 'rgba(32, 33, 35, 1)';
  button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
});

// Create the <div> element
const divElement = document.createElement('div');
divElement.classList.add('flex', 'flex-col', 'w-full', 'py-2', 'flex-grow', 'md:py-3', 'md:pl-4', 'relative', 'border', 'border-black/10', 'bg-white', 'dark:border-gray-900/50', 'dark:text-white', 'dark:bg-gray-700', 'rounded-md', 'shadow-[0_0_10px_rgba(0,0,0,0.10)]', 'dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]');

// Create the <textarea> element
const textareaElement = document.createElement('textarea');
textareaElement.id = 'prompt-textarea';
textareaElement.tabIndex = 2;
textareaElement.dataset.id = 'request-:R1dd6:-0';
textareaElement.rows = 1;
textareaElement.placeholder = 'Prompt for the file...';
textareaElement.classList.add('m-0', 'w-full', 'resize-none', 'border-0', 'bg-transparent', 'p-0', 'pr-7', 'focus:ring-0', 'focus-visible:ring-0', 'dark:bg-transparent', 'pl-2', 'md:pl-0');
textareaElement.style.maxHeight = '200px';
textareaElement.style.height = '24px';
textareaElement.style.overflowY = 'hidden';

divElement.appendChild(textareaElement);

// Set up container div
const container = document.createElement('div');
container.classList = 'stretch mx-2 flex gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl';
container.style.alignItems = 'center';
container.style.marginBottom = '10px';

// Set up progress element
const progressElement = document.createElement('div');
progressElement.classList = 'mx-2 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl';
progressElement.style.height = 'min-content';
progressElement.style.marginBottom = '10px';
progressElement.style.backgroundColor = 'rgb(205, 205, 205)';
progressElement.style.borderRadius = '5px';
progressElement.style.overflow = 'hidden';

// Create progress bar
const progressBar = document.createElement('div');
progressBar.style.width = '0%';
progressBar.style.height = '100%';
progressBar.style.backgroundColor = 'rgb(114, 114, 114)';
progressBar.style.transition = 'width 0.3s ease-in-out';
progressBar.style.color = '#fff';
progressBar.style.textAlign = 'center';

// Update pattern in the progress bar
progressBar.style.backgroundImage = 'linear-gradient(259deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.2) 75%)';
progressBar.style.backgroundSize = '10px 10px';

// Append progress bar to progress element
progressElement.appendChild(progressBar);

// Append input, button, and progress element to the container div
container.appendChild(divElement);
container.appendChild(button);
// container.appendChild(progressElement);

// Find target element
const targetElement = document.querySelector('form.stretch.mx-2.flex.flex-row.gap-3.last\\:mb-2.md\\:mx-4.md\\:last\\:mb-6.lg\\:mx-auto.lg\\:max-w-2xl.xl\\:max-w-3xl');

// Insert container div before the target element
targetElement.parentNode.insertBefore(container, targetElement);
targetElement.parentNode.insertBefore(progressElement, targetElement);


// Button click event handler
button.addEventListener('click', async () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';

  // File selected event handler
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const fileSize = file.size;
    const chunkSize = 13000;
    const numChunks = Math.ceil(fileSize / chunkSize);
    const promptText = textareaElement.value || "Describe the file contents"

    let progress = 0;

    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = file.slice(start, end);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target.result;
        const message = generatePrompt(promptText, text, i + 1, numChunks, file.name)
        await submitConversation(message);

        progress++;
        progressBar.style.width = `${(progress / numChunks) * 100}%`;
        progressBar.innerText = `${progress} / ${numChunks}`

        if (progress === numChunks) {
          progressBar.style.backgroundColor = 'rgb(84, 84, 84)';
        }
      };

      reader.readAsText(chunk);
      await waitForChatGPTReady();
    }
  });

  fileInput.click();
});

const generatePrompt = (promptText, text, part, partCount, filename) => {
    if (partCount == 1) {
        return `I have a file called ${filename}. 
        Here are the contents: \n\n ${text} \n\n
        Can you do / answer this based on the file contents: ${promptText}`
    }
    message = part == 1 ? `` : `Recap: `

    message += `I will send you file contents in multiple parts. 
    I want you to wait until all the parts are uploaded before responding.
    Until all parts are uploaded, just respond with "Waiting for file to upload" 
    I will let you know when all file parts are uploaded. 
    Once you've recieved all the parts, I want you to do / answer this based on the file contents: ${promptText} \n\n`

    message += `Part ${part} / ${partCount} of ${filename}: \n\n ${text} \n\n`

    message += part == partCount ? 
    `The file has been fully uploaded!
    Please respond to this based on the file contents: ${promptText}`
    :
    `The file hasn't been fully uploaded yet,
     please remember the contents of this message
     and respond with "Waiting for file to upload"`

    return message
}

// Function to submit conversation
async function submitConversation(message) {
  const textarea = document.querySelector("textarea[tabindex='0']");
  const enterKeyEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
  });
  textarea.value = message;
  textarea.dispatchEvent(enterKeyEvent);
}

// Function to wait for ChatGPT to be ready
async function waitForChatGPTReady() {
  let chatGPTReady = false;
  while (!chatGPTReady) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    chatGPTReady = !document.querySelector('.text-2xl > span:not(.invisible)');
  }
}