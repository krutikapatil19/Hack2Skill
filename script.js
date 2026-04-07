function generate() {
  let input = document.getElementById("input").value.toLowerCase();
  let chat = document.getElementById("chat");

  if (input.trim() === "") return;

  // User message
  let userMsg = `<p><b>You:</b> ${input}</p>`;

  // AI response logic
  let response = "";

  if (input.includes("tired")) {
    response = "🥗 You should have a light meal with fruits and protein.";
  } else if (input.includes("happy")) {
    response = "🍛 Enjoy a balanced meal with carbs and protein!";
  } else if (input.includes("lazy")) {
    response = "🍲 Try something quick like soup or salad.";
  } else if (input.includes("stressed")) {
    response = "🍫 Dark chocolate and nuts can help reduce stress.";
  } else {
    response = "🍎 Eat a healthy balanced meal!";
  }

  // Random health tips
  const tips = [
    "💡 Drink enough water daily.",
    "💡 Avoid skipping meals.",
    "💡 Include fruits and vegetables.",
    "💡 Maintain regular eating habits."
  ];

  let tip = tips[Math.floor(Math.random() * tips.length)];

  // AI message
  let botMsg = `<p><b>🤖 AI:</b> ${response}</p>`;
  let tipMsg = `<p><i>${tip}</i></p>`;

  // Add to chat
  chat.innerHTML += userMsg + botMsg + tipMsg;

  // Clear input
  document.getElementById("input").value = "";

  // Auto scroll
  chat.scrollTop = chat.scrollHeight;
}