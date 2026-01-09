console.log("Admin pending events loaded");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

fetch("http://localhost:5000/api/events/admin/pending", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(res => {
    if (!res.ok) throw new Error("Access denied");
    return res.json();
  })
  .then(events => {
    const container = document.getElementById("events");
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No pending events to review 🎉</p>
        </div>
      `;
      return;
    }

    events.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";

      card.innerHTML = `
        <div class="event-content">

          <span class="event-badge badge-pending">
            PENDING
          </span>

          <h3 class="event-title">${event.title}</h3>

          <p class="event-description">
            ${event.description}
          </p>

          <p class="text-muted">
            📍 ${event.location}<br/>
            📅 ${new Date(event.date).toLocaleDateString()}<br/>
            👤 ${event.createdBy?.name || "Organizer"}
          </p>

          <div class="event-actions">
            <button class="btn btn-success btn-sm"
              onclick="approveEvent('${event._id}')">
              Approve
            </button>

            <button class="btn btn-destructive btn-sm"
              onclick="rejectEvent('${event._id}')">
              Reject
            </button>
          </div>

        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load pending events");
  });

// Approve
function approveEvent(id) {
  if (!confirm("Approve this event?")) return;

  fetch(`http://localhost:5000/api/events/admin/approve/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Event approved");
      location.reload();
    });
}

// Reject
function rejectEvent(id) {
  if (!confirm("Reject this event?")) return;

  fetch(`http://localhost:5000/api/events/admin/reject/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Event rejected");
      location.reload();
    });
}
