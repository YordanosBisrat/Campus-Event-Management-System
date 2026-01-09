// ===============================
// STUDENT EVENTS PAGE LOGIC
// ===============================

console.log("Student events loaded");

// 1️⃣ Auth check
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "../login.html";
}

// 2️⃣ DOM elements
const eventsContainer = document.getElementById("events");
const searchInput = document.getElementById("searchInput");
const noEvents = document.getElementById("noEvents");

let allEvents = [];

// 3️⃣ Fetch approved events
fetch("http://localhost:5000/api/events", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  })
  .then(events => {
    allEvents = events;
    renderEvents(events);
  })
  .catch(err => {
    console.error(err);
    noEvents.classList.remove("hidden");
  });

// 4️⃣ Render events
function renderEvents(events) {
  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    noEvents.classList.remove("hidden");
    return;
  }

  noEvents.classList.add("hidden");

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-content">
        <h3 class="event-title">${event.title}</h3>
        <p class="event-description">${event.description}</p>

        <p class="text-muted">
          📍 ${event.location}<br/>
          📅 ${new Date(event.date).toLocaleDateString()}
        </p>

        <button class="btn btn-primary btn-sm"
          onclick="registerEvent('${event._id}')">
          Register
        </button>
      </div>
    `;

    eventsContainer.appendChild(card);
  });
}

// 5️⃣ Search filter
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = allEvents.filter(event =>
    event.title.toLowerCase().includes(keyword) ||
    event.description.toLowerCase().includes(keyword) ||
    event.location.toLowerCase().includes(keyword)
  );

  renderEvents(filtered);
});

// 6️⃣ Register for event
function registerEvent(eventId) {
  fetch(`http://localhost:5000/api/registrations/${eventId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Registered successfully");
    })
    .catch(err => {
      console.error(err);
      alert("Registration failed");
    });
}
