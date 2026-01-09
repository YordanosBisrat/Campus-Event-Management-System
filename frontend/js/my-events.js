// ===============================
// STUDENT MY EVENTS PAGE
// ===============================

console.log("Student my-events loaded");

// 1️⃣ Auth check
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "../login.html";
}

const container = document.getElementById("myEvents");
const noEvents = document.getElementById("noEvents");

// 2️⃣ Fetch my registrations
fetch("http://localhost:5000/api/registrations/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch registrations");
    return res.json();
  })
  .then(registrations => {
    container.innerHTML = "";

    if (registrations.length === 0) {
      noEvents.classList.remove("hidden");
      return;
    }

    noEvents.classList.add("hidden");

    registrations.forEach(reg => {
      const event = reg.event;

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

          <span class="event-badge badge-approved">
            Registered
          </span>
        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load registered events");
  });
