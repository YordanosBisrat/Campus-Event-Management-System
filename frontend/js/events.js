// frontend/js/events.js
async function createEvent() {
  const token = localStorage.getItem("token");

  const event = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    date: document.getElementById("date").value,
    location: document.getElementById("location").value
  };

  const res = await fetch("http://localhost:5000/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(event)
  });

  const data = await res.json();

  if (res.ok) {
    alert("Event created and sent for approval");
    window.location.href = "my-events.html";
  } else {
    alert(data.message);
  }
}
