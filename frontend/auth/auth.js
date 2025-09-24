// auth.js
// Handles Register & Login using apiFetch helper
// Make sure api.js is loaded first
// Example: <script src="auth/api.js"></script>
//          <script src="auth/auth.js"></script>

const API_BASE = "http://localhost:5000/api";

// ---------- REGISTER ----------
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("registerMsg");

    if (!username || !email || !password) {
      msg.textContent = "❌ All fields are required";
      return;
    }

    try {
      const res = await apiFetch("auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      msg.textContent = res.message || "✅ Registered successfully";
      // redirect to login after 1s
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
    }
  });
}

// ---------- LOGIN ----------
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMsg");

    if (!email || !password) {
      msg.textContent = "❌ All fields are required";
      return;
    }

    try {
      const res = await apiFetch("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        msg.textContent = "✅ Login successful";
        setTimeout(() => {
          window.location.href = "../dashboard.html"; // change path if needed
        }, 500);
      }
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
    }
  });
}
