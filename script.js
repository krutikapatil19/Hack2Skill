function generate() {
  let input = document.getElementById("input").value.toLowerCase();
  let chat = document.getElementById("chat");

  let userMsg = `<p><b>You:</b> ${input}</p>`;
  let response = "";

  if (input.includes("tired")) {
    response = "🥗 Eat fruits and protein-rich food.";
  } else if (input.includes("happy")) {
    response = "🍛 Enjoy a balanced healthy meal!";
  } else if (input.includes("lazy")) {
    response = "🍲 Try quick meals like soup or salad.";
  } else if (input.includes("stressed")) {
    response = "🍫 Dark chocolate and nuts can help.";
  } else {
    response = "🍎 Eat a balanced meal!";
  }

  let botMsg = `<p><b>AI:</b> ${response}</p>`;

  chat.innerHTML += userMsg + botMsg;
}