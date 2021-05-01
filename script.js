// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

// loads in image when one is selected
document.getElementById('image-input').onchange = function(ev) {
  var rdr = new FileReader();

  // loads in img
  rdr.onload = function(ev) {
    img.src = rdr.result;
  };
  rdr.readAsDataURL(this.files[0]);
  
  // set img alt as filename
  img.alt = this.files[0]['name'].replace(/\.[^/.]+$/, "");
};

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  var c = document.getElementById("user-image");
  var ctx = c.getContext("2d");

  // clear form
  document.getElementById("generate-meme").reset();
  
  // fill canvas with black
  ctx.beginPath();
  ctx.rect(0, 0, c.width, c.height);
  ctx.fillStyle = "black";
  ctx.fill();

  // draw image in center of canvas
  var dim = getDimmensions(c.width, c.height, img.width, img.height);
  ctx.drawImage(img, dim['startX'], dim['startY'], dim['width'], dim['height']);

  // toggles needed buttons 
  document.querySelector("[type='submit']").removeAttribute("disabled");
  document.querySelector("[type='reset']").setAttribute("disabled", "true");
  document.querySelector("[type='button']").setAttribute("disabled", "true");

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// get clear button
const clear = document.querySelector("[type='reset']")

// clear canvas on click
clear.addEventListener('click', event => {
  var c = document.getElementById("user-image");
  var ctx = c.getContext("2d");

  // clear canvas
  ctx.clearRect(0, 0, c.width, c.height);

  // toggle relevant buttons
  document.querySelector("[type='submit']").removeAttribute("disabled");
  document.querySelector("[type='reset']").setAttribute("disabled", "true");
  document.querySelector("[type='button']").setAttribute("disabled", "true");
  event.preventDefault();
});

// get volume control slider
const slider = document.querySelector("[type='range']");

// get volume icon
const volIcon = document.querySelector('#volume-group > img');

// when slider changed, update volume levels
slider.addEventListener('input', () => {
  if (slider.value >= 67) {
    volIcon.src="./icons/volume-level-3.svg";
  } else if (slider.value >= 34) {
    volIcon.src="./icons/volume-level-2.svg";
  } else if (slider.value >= 1) {
    volIcon.src="./icons/volume-level-1.svg";
  } else {
    volIcon.src="./icons/volume-level-0.svg";
  }
});

// gets voice select dropdown list
const list = document.getElementById('voice-selection');
let voices = [];

// populates voice select dropdown list
window.speechSynthesis.onvoiceschanged = function() {
  voices = window.speechSynthesis.getVoices();
  list.remove(0);
  list.removeAttribute("disabled");
  for (var i = 0; i<voices.length; i++){
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    list.appendChild(option);
  }
};

// gets read text  button
const read = document.querySelector("[type='button']");

// reads inputted text when button is clicked
read.addEventListener('click', event => {
  // gets top and bottom text input values
  var top = document.getElementById('text-top').value;
  var bottom = document.getElementById('text-bottom').value;

  // instantiates speak utterances
  var speakTop = new SpeechSynthesisUtterance(top);
  var speakBottom = new SpeechSynthesisUtterance(bottom);

  // sets voice to selected one from dropdown
  var selectedOption = list.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      speakTop.voice = voices[i];
      speakBottom.voice = voices[i];
    }
  }

  // sets volume of voice from slider
  speakTop.volume = slider.value/100;
  speakBottom.volume = slider.value/100;

  // speaks text
  window.speechSynthesis.speak(speakTop);
  window.speechSynthesis.speak(speakBottom);
});

// links writing text to canvas once generate is pressed
const form = document.getElementById('generate-meme');
form.addEventListener('submit', formSubmit);


// writes inputted text to canvas 
function formSubmit(event) {
  // gets top and bottom text input values
  var top = document.getElementById('text-top').value;
  var bottom = document.getElementById('text-bottom').value;

  // gets canvas
  var c = document.getElementById("user-image");
  var ctx = c.getContext("2d");

  // sets style of text font
  ctx.font = "30px Comic Sans MS";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";

  // writes text to canvas
  ctx.fillText(top, c.width/2, 50);
  ctx.fillText(bottom, c.width/2, c.height - 30);

  // toggles needed buttons 
  document.querySelector("[type='submit']").setAttribute("disabled", "true");
  document.querySelector("[type='reset']").removeAttribute("disabled");
  document.querySelector("[type='button']").removeAttribute("disabled");
  event.preventDefault();
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
