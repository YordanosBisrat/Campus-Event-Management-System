// js/dashboard.js

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

let role = "student";
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  role = (payload.role || "student").toLowerCase();
} catch (err) {
  console.error("Cannot read role from token", err);
  alert("Session error → redirecting to login");
  logout();
}

document.getElementById("roleBadge").textContent =
  role.charAt(0).toUpperCase() + role.slice(1);

document.getElementById("studentView").style.display =
  role === "student" ? "block" : "none";
document.getElementById("organizerView").style.display =
  role === "organizer" ? "block" : "none";
document.getElementById("adminView").style.display =
  role === "admin" ? "block" : "none";

if (role === "student") {
  loadStudentDashboard();
  initStudentCalendar(); // NEW: initialize calendar
} else if (role === "organizer") {
  loadOrganizerDashboard();
} else if (role === "admin") {
  loadAdminDashboard();
  loadAdminAnalytics();
}

// ────────────────────────────────────────────────
//  STUDENT CALENDAR
// ────────────────────────────────────────────────
function initStudentCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek",
    },
    height: "auto", // better for responsive
    events: [],
    eventClick: function (info) {
      alert(
        `Event: ${
          info.event.title
        }\nDate: ${info.event.start.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}\nLocation: ${info.event.extendedProps.location || "N/A"}`,
      );
    },
    eventDidMount: function (info) {
      // Add tooltip on hover
      info.el.title = `${info.event.title} - ${
        info.event.extendedProps.location || "Location TBD"
      }`;
    },
  });

  calendar.render();

  // Fetch registered events
  fetch("http://localhost:5000/api/registrations/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((registrations) => {
      const registeredEvents = registrations.map((reg) => {
        const ev = reg.event || {};
        return {
          title: ev.title || "Untitled Event",
          start: ev.date,
          extendedProps: { location: ev.location || "N/A" },
          classNames: ["fc-event-registered"],
        };
      });

      // Fetch all upcoming events
      fetch("http://localhost:5000/api/events") // or /api/events/upcoming if you have it
        .then((res) => res.json())
        .then((allEvents) => {
          const otherEvents = allEvents
            .filter((ev) => new Date(ev.date) > new Date()) // future only
            .filter((ev) => !registeredEvents.some((r) => r.title === ev.title)) // exclude duplicates
            .map((ev) => ({
              title: ev.title,
              start: ev.date,
              extendedProps: { location: ev.location || "N/A" },
              classNames: ["fc-event-other"],
            }));

          calendar.addEventSource([...registeredEvents, ...otherEvents]);
        })
        .catch((err) => console.error("Failed to load all events:", err));
    })
    .catch((err) => {
      console.error("Failed to load registrations:", err);
      calendarEl.innerHTML +=
        '<p style="text-align:center; color:#ef4444; padding:2rem;">Failed to load calendar</p>';
    });
}

// ────────────────────────────────────────────────
//  Your other functions (loadStudentDashboard, loadOrganizerDashboard, etc.)
//  remain exactly the same – paste them here from your original code
// ───────────────────────────────────────────────

function loadStudentDashboard() {
  fetch("http://localhost:5000/api/registrations/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    })
    .then((registrations) => {
      const container = document.getElementById("studentEvents");
      container.innerHTML = "";

      if (registrations.length === 0) {
        document.getElementById("noStudentEvents").style.display = "block";
        return;
      }

      registrations.forEach((reg) => {
        const event = reg.event || {};
        const isPassed = new Date(event.date) < new Date();

        const feedbackButton = isPassed
          ? `<button class="btn btn-outline btn-sm" onclick="openFeedbackModal('${
              event._id
            }', '${event.title.replace(/'/g, "\\'")}')">
               Give Feedback
             </button>`
          : "";

        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <div class="event-content">
            <h3 class="event-title">${event.title || "Untitled Event"}</h3>
            <p class="event-description">${
              event.description?.substring(0, 140) || ""
            }${event.description?.length > 140 ? "..." : ""}</p>
            <div class="event-meta">
              <p>📍 ${event.location || "—"}</p>
              <p>📅 ${
                event.date ? new Date(event.date).toLocaleDateString() : "—"
              }</p>
            </div>
            <span class="badge badge-approved">Registered</span>
            <div style="margin-top: 12px;">${feedbackButton}</div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("studentEvents").innerHTML =
        "<p style='color:#ef4444;'>Failed to load registrations</p>";
    });
}

function loadOrganizerDashboard() {
  fetch("http://localhost:5000/api/events/my", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    })
    .then((events) => {
      const container = document.getElementById("organizerEvents");
      container.innerHTML = "";

      if (events.length === 0) {
        document.getElementById("noOrganizerEvents").style.display = "block";
        return;
      }

      events.forEach((event) => {
        const status = (event.status || "pending").toLowerCase();
        const isPassed = new Date(event.date) < new Date();

        const feedbackButton = isPassed
          ? `<button class="btn btn-outline btn-sm" onclick="viewEventFeedback('${event._id}')">
               View Feedback
             </button>`
          : "";

        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <div class="event-content">
            <span class="badge badge-${status}">${status.toUpperCase()}</span>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${
              event.description?.substring(0, 120) || ""
            }${event.description?.length > 120 ? "..." : ""}</p>
            <div class="event-meta">
              <p>📍 ${event.location}</p>
              <p>📅 ${new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div class="event-actions">
              <button class="btn btn-outline btn-sm" onclick="editEvent('${
                event._id
              }', '${event.title.replace(
          /'/g,
          "\\'",
        )}', '${event.description.replace(/'/g, "\\'")}', '${
          event.date.split("T")[0]
        }', '${event.location.replace(/'/g, "\\'")}', '${event.image || ""}')">
                Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteEvent('${
                event._id
              }')">
                Delete
              </button>
              ${feedbackButton}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("organizerEvents").innerHTML =
        "<p style='color:#ef4444;'>Failed to load your events</p>";
    });
}

// ────────────────────────────────────────────────
//  EDIT EVENT MODAL
// ────────────────────────────────────────────────
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editMessage = document.getElementById("editMessage");

function editEvent(id, title, description, date, location, image) {
  document.getElementById("editEventId").value = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editDescription").value = description;
  document.getElementById("editDate").value = date;
  document.getElementById("editLocation").value = location;

  const preview = document.getElementById("currentImage");
  if (image) {
    preview.src = `http://localhost:5000${image}`;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }

  // Clear new image preview
  document.getElementById("editImagePreview").style.display = "none";

  editModal.style.display = "flex";
  editMessage.textContent = "";
}

function closeModal() {
  editModal.style.display = "none";
  editForm.reset();
  editMessage.textContent = "";
}

// Image preview for new upload
document.getElementById("editImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById("editImagePreview");
      preview.src = ev.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// Submit edit form
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editEventId").value;
  const formData = new FormData();
  formData.append("title", document.getElementById("editTitle").value.trim());
  formData.append(
    "description",
    document.getElementById("editDescription").value.trim(),
  );
  formData.append("date", document.getElementById("editDate").value);
  formData.append(
    "location",
    document.getElementById("editLocation").value.trim(),
  );

  const newImage = document.getElementById("editImage").files[0];
  if (newImage) {
    formData.append("image", newImage);
  }

  editMessage.textContent = "Updating event...";
  editMessage.className = "message";

  try {
    const res = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Update failed");

    editMessage.textContent = "Event updated successfully!";
    editMessage.className = "message success";

    setTimeout(() => {
      closeModal();
      loadOrganizerDashboard(); // Refresh list
    }, 1500);
  } catch (err) {
    console.error(err);
    editMessage.textContent = err.message || "Failed to update event";
    editMessage.className = "message error";
  }
});

// ────────────────────────────────────────────────
//  DELETE EVENT
// ────────────────────────────────────────────────
function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  fetch(`http://localhost:5000/api/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    })
    .then((data) => {
      alert(data.message || "Event deleted successfully");
      loadOrganizerDashboard(); // Refresh list
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to delete event");
    });
}
if (role === "organizer") {
  loadOrganizerDashboard();
}

function loadAdminDashboard() {
  fetch("http://localhost:5000/api/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((stats) => {
      document.getElementById("totalEvents").textContent =
        stats.totalEvents ?? 0;
      document.getElementById("pendingEvents").textContent =
        stats.pendingEvents ?? 0;
      document.getElementById("approvedEvents").textContent =
        stats.approvedEvents ?? 0;
      document.getElementById("rejectedEvents").textContent =
        stats.rejectedEvents ?? 0;
      document.getElementById("totalRegistrations").textContent =
        stats.totalUsers ?? 0;
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to load admin statistics");
    });

  fetch("http://localhost:5000/api/events/admin/pending", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Access denied");
      return res.json();
    })
    .then((events) => {
      const container = document.getElementById("pendingEventsList");
      container.innerHTML = "";

      if (events.length === 0) {
        document.getElementById("noPending").style.display = "block";
        return;
      }

      events.forEach((event) => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <div class="event-content">
            <span class="badge badge-pending">PENDING</span>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${
              event.description?.substring(0, 140) || ""
            }${event.description?.length > 140 ? "..." : ""}</p>
            <div class="event-meta">
              <p>📍 ${event.location}</p>
              <p>📅 ${new Date(event.date).toLocaleDateString()}</p>
              <p>👤 ${event.createdBy?.name || "Unknown organizer"}</p>
            </div>
            <div class="event-actions">
              <button class="btn btn-success" onclick="approveEvent('${
                event._id
              }')">Approve</button>
              <button class="btn btn-danger"    onclick="rejectEvent('${
                event._id
              }')">Reject</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("pendingEventsList").innerHTML =
        "<p style='color:#ef4444;'>Failed to load pending events</p>";
    });
}

function approveEvent(id) {
  if (!confirm("Approve this event?")) return;
  patchEventStatus(id, "approve");
}

function rejectEvent(id) {
  if (!confirm("Reject this event?")) return;
  patchEventStatus(id, "reject");
}

function patchEventStatus(id, action) {
  fetch(`http://localhost:5000/api/events/admin/${action}/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message || `Event ${action}d`);
      location.reload();
    })
    .catch((err) => {
      console.error(err);
      alert("Action failed");
    });
}

// ────────────────────────────────────────────────
//  NEW: Load Analytics Charts (only for admin)
// ────────────────────────────────────────────────
function loadAdminAnalytics() {
  fetch("http://localhost:5000/api/admin/events/analytics", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    })
    .then((data) => {
      renderEventsOverTimeChart(data.eventsByMonth || []);
      renderTopEventsChart(data.topEvents || []);
      renderStatusPieChart(data.statusBreakdown || []);
    })
    .catch((err) => {
      console.error("Analytics error:", err);
      // Optional: show fallback message in chart areas
    });
}

function renderEventsOverTimeChart(data) {
  const ctx = document.getElementById("eventsOverTimeChart")?.getContext("2d");
  if (!ctx) return;

  const labels = data.map((item) => item._id || "Unknown");
  const counts = data.map((item) => item.count || 0);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Events Created",
          data: counts,
          borderColor: "#1e40af",
          backgroundColor: "rgba(30, 64, 175, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderTopEventsChart(data) {
  const ctx = document.getElementById("topEventsChart")?.getContext("2d");
  if (!ctx) return;

  const labels = data.map((item) => item.title || "Unknown");
  const counts = data.map((item) => item.count || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Registrations",
          data: counts,
          backgroundColor: "#1e40af",
          borderColor: "#1e40af",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderStatusPieChart(data) {
  const ctx = document.getElementById("statusPieChart")?.getContext("2d");
  if (!ctx) return;

  const labels = data.map(
    (item) =>
      (item.status || "unknown").charAt(0).toUpperCase() + item.status.slice(1),
  );
  const counts = data.map((item) => item.count || 0);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

// ────────────────────────────────────────────────
//  STUDENT FEEDBACK MODAL
// ────────────────────────────────────────────────
function openFeedbackModal(eventId, eventTitle) {
  console.log('openFeedbackModal called with:', { eventId, eventTitle }); // ← debug

  const modal = document.getElementById('feedbackModal');
  const titleEl = document.getElementById('feedbackEventTitle');
  const eventIdInput = document.getElementById('feedbackEventId');
  const messageEl = document.getElementById('feedbackMessage');
  const form = document.getElementById('feedbackForm');

  if (!modal || !titleEl || !eventIdInput || !messageEl || !form) {
    console.error('Feedback modal elements missing in DOM:', {
      modal: !!modal,
      titleEl: !!titleEl,
      eventIdInput: !!eventIdInput,
      messageEl: !!messageEl,
      form: !!form
    });
    alert('Feedback modal is not properly loaded. Please refresh the page.');
    return;
  }

  eventIdInput.value = eventId;
  titleEl.textContent = eventTitle || 'Event Feedback';
  modal.style.display = 'flex';
  messageEl.textContent = '';
  form.reset();
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").style.display = "none";
}

// Submit feedback
document
  .getElementById("feedbackForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const eventId = document.getElementById("feedbackEventId").value;
    const rating = parseInt(document.getElementById("rating").value);
    const comment = document.getElementById("comment").value.trim();

    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    const feedbackMessage = document.getElementById("feedbackMessage");
    feedbackMessage.textContent = "Submitting feedback...";
    feedbackMessage.className = "message";

    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit feedback");

      feedbackMessage.textContent =
        "Thank you! Feedback submitted successfully.";
      feedbackMessage.className = "message success";

      setTimeout(() => {
        closeFeedbackModal();
        loadStudentDashboard(); // Optional: refresh list if needed
      }, 1800);
    } catch (err) {
      feedbackMessage.textContent = err.message || "Failed to submit feedback";
      feedbackMessage.className = "message error";
    }
  });

// ────────────────────────────────────────────────
//  ORGANIZER VIEW FEEDBACK MODAL
// ────────────────────────────────────────────────
function viewEventFeedback(eventId) {
  fetch(`http://localhost:5000/api/feedback/event/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load feedback");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "feedbackAverage",
      ).textContent = `Average Rating: ${data.averageRating.toFixed(1)} / 5 (${
        data.feedbackCount
      } reviews)`;

      const list = document.getElementById("feedbackList");
      list.innerHTML = "";

      if (data.feedbacks.length === 0) {
        list.innerHTML =
          '<p style="text-align:center; color:#666;">No feedback yet.</p>';
      } else {
        data.feedbacks.forEach((fb) => {
          const item = document.createElement("div");
          item.style.borderBottom = "1px solid #eee";
          item.style.padding = "1rem 0";
          item.innerHTML = `
            <strong>${fb.user.name || "Anonymous"}</strong> 
            <span style="float:right;">${fb.rating}/5</span>
            <p>${fb.comment || "No comment"}</p>
            <small>${new Date(fb.createdAt).toLocaleDateString()}</small>
          `;
          list.appendChild(item);
        });
      }

      document.getElementById("feedbackViewModal").style.display = "flex";
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to load feedback: " + err.message);
    });
}

function closeFeedbackViewModal() {
  document.getElementById("feedbackViewModal").style.display = "none";
}
