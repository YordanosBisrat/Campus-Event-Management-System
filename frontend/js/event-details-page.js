// Get event ID from URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

if (!eventId) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorMessage").textContent = "No event ID provided in URL.";
} else {
  loadEventDetails(eventId);
}

function loadEventDetails(id) {
  fetch(`http://localhost:5000/api/events/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    })
    .then(event => {
      document.getElementById("loading").style.display = "none";
      renderEvent(event);
      document.getElementById("eventContainer").style.display = "block";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("loading").style.display = "none";
      document.getElementById("errorMessage").style.display = "block";
    });
}

function renderEvent(event) {
  const container = document.getElementById("eventContainer");

  const imageUrl = event.image 
    ? `http://localhost:5000${event.image}` 
    : "https://via.placeholder.com/1200x600?text=No+Event+Image";

  const statusClass = `status-${event.status || 'pending'}`;
  const statusText = (event.status || 'pending').toUpperCase();

  const isLoggedIn = !!localStorage.getItem("token");

  container.innerHTML = `
    <div class="event-hero">
      <img src="${imageUrl}" alt="${event.title}" onerror="this.outerHTML='<div class=\"no-image\"></div>
    </div>

    <div class="event-content">
      <h1 class="event-title">${event.title}</h1>

      <div class="event-meta">
        <p><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
        <p><i class="fas fa-user"></i> Organized by ${event.createdBy?.name || 'Unknown'}</p>
      </div>

      <span class="event-status ${statusClass}">${statusText}</span>

      <div class="event-description">
        ${event.description || 'No description available.'}
      </div>

      <button class="btn btn-primary ${isLoggedIn ? '' : 'btn-disabled'}" 
        id="registerBtn" 
        ${isLoggedIn ? '' : 'disabled title="Login to register"'}>
        Register for this Event
      </button>

      <button class="btn btn-outline" onclick="window.location.href='events-page.html'">
        Back to All Events
      </button>

      <div id="message" class="message"></div>
    </div>
  `;

  // Register button handler (only if logged in)
  if (isLoggedIn) {
    document.getElementById("registerBtn").addEventListener("click", () => {
      registerEvent(event._id);
    });
  }
}

function registerEvent(eventId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to register for events");
    window.location.href = "login.html";
    return;
  }

  const message = document.getElementById("message");
  const btn = document.getElementById("registerBtn");

  btn.disabled = true;
  message.textContent = "Registering...";
  message.className = "message";

  fetch(`http://localhost:5000/api/registrations/${eventId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.message?.includes("already")) {
        message.textContent = "You are already registered for this event.";
        message.className = "message error";
      } else {
        message.textContent = data.message || "Registered successfully!";
        message.className = "message success";
      }
      btn.disabled = false;
    })
    .catch(err => {
      console.error(err);
      message.textContent = "Registration failed. Please try again.";
      message.className = "message error";
      btn.disabled = false;
    });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}