// frontend/js/organizer-create-event.js
console.log("Organizer create-event loaded");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

const form = document.getElementById("createEventForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventData = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value,
    location: document.getElementById("location").value.trim(),
  };

  if (!eventData.title || !eventData.description || !eventData.date || !eventData.location) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create event");
      return;
    }

    alert("Event submitted successfully. Awaiting admin approval.");
    window.location.href = "my-events.html";

  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  }
});
