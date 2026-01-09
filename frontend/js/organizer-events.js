console.log("Organizer my-events loaded");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

fetch("http://localhost:5000/api/events/my", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(events => {
    const container = document.getElementById("events");
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>You haven't created any events yet.</p>
          <a href="create-event.html" class="btn btn-primary btn-sm">
            Create Your First Event
          </a>
        </div>
      `;
      return;
    }

    events.forEach(event => {
      const status = event.status || "pending";

      const card = document.createElement("div");
      card.className = "event-card";

      card.innerHTML = `
        <div class="event-content">

          <span class="event-badge badge-${status}">
            ${status.toUpperCase()}
          </span>

          <h3 class="event-title">${event.title}</h3>

          <p class="event-description">
            ${event.description}
          </p>

          <p class="text-muted">
            📍 ${event.location}<br/>
            📅 ${new Date(event.date).toLocaleDateString()}
          </p>

          <div class="event-actions">
            <button class="btn btn-outline btn-sm" disabled>
              Edit
            </button>
            <button class="btn btn-destructive btn-sm" disabled>
              Delete
            </button>
          </div>

        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load organizer events");
  });
