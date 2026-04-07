function signup() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  localStorage.setItem("user", user);
  localStorage.setItem("pass", pass);

  alert("Signup successful!");
  window.location.href = "index.html";
}

function login() {
  let user = document.getElementById("loginUser").value;
  let pass = document.getElementById("loginPass").value;

  let storedUser = localStorage.getItem("user");
  let storedPass = localStorage.getItem("pass");

  if (user === storedUser && pass === storedPass) {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials!");
  }
}