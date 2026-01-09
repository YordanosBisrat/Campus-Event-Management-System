async function createEvent() {
  const data = {
    title: document.getElementById("title").value,
    date: document.getElementById("date").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
  };

  const res = await apiRequest("/events", "POST", data);
  alert(res.message || "Event created");
}
