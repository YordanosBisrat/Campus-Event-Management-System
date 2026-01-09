const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  message.textContent = "Logging in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.message || "Invalid credentials";
      return;
    }

    // ✅ Save JWT token
    localStorage.setItem("token", data.token);

    // ✅ Decode JWT payload to get role
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    const role = payload.role;

    message.textContent = "Login successful";

    // ✅ Role-based redirect
    if (role === "admin") {
      window.location.href = "admin/dashboard.html";
    } else if (role === "organizer") {
      window.location.href = "organizer/create-event.html";
    } else {
      window.location.href = "student/events.html";
    }

  } catch (error) {
    console.error("Login error:", error);
    message.textContent = "Server error. Try again.";
  }
});
