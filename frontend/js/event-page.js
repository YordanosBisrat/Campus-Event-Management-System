  console.log("Public events page loaded");

    const eventsContainer = document.getElementById("events");
    const loading = document.getElementById("loading");
    const noEvents = document.getElementById("noEvents");
    const showingText = document.getElementById("showingText");
    const searchInput = document.getElementById("searchInput");

    let allEvents = [];
    const token = localStorage.getItem("token"); // optional – only for registration

    // Show loading
    loading.style.display = "block";

    // Fetch public approved events (no token required)
    fetch("http://localhost:5000/api/events")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(events => {
        allEvents = events;
        loading.style.display = "none";
        renderEvents(events);
      })
      .catch(err => {
        console.error(err);
        loading.style.display = "none";
        noEvents.style.display = "block";
        noEvents.textContent = "Failed to load events. Please try again later.";
      });

    // Render events with image support
    function renderEvents(events) {
      eventsContainer.innerHTML = "";
      showingText.textContent = `Showing ${events.length} events`;

      if (events.length === 0) {
        noEvents.style.display = "block";
        return;
      }

      noEvents.style.display = "none";

      events.forEach(event => {
        const card = document.createElement("div");
        card.className = "event-card";

        // Use real image from backend if available
        const imageUrl = event.image 
          ? `http://localhost:5000${event.image}` 
          : "https://via.placeholder.com/800x400?text=No+Image";

        // Tag logic
        let tag = "Event";
        const titleLower = event.title.toLowerCase();
        if (titleLower.includes("workshop")) tag = "Workshop";
        else if (titleLower.includes("seminar")) tag = "Seminar";
        else if (titleLower.includes("competition")) tag = "Competition";
        else if (titleLower.includes("festival") || titleLower.includes("cultural")) tag = "Cultural";
        else if (titleLower.includes("sports")) tag = "Sports";

        card.innerHTML = `
          <div class="event-image-wrapper">
            <img src="${imageUrl}" alt="${event.title}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'">
            <span class="event-tag">${tag}</span>
          </div>
          <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</p>
            <div class="event-meta">
              <p>📅 ${new Date(event.date).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}</p>
              <p>📍 ${event.location}</p>
            </div>
            <div class="event-actions">
              <button class="btn btn-outline" onclick="window.location.href='event-details-page.html?id=${event._id}'">
                Details
              </button>
              <button class="btn btn-primary" 
                ${token ? `onclick="registerEvent('${event._id}')"` : `disabled title="Login to register"`}>
                Register
              </button>
            </div>
          </div>
        `;

        eventsContainer.appendChild(card);
      });
    }

    // Search filter (client-side)
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase().trim();
      const filtered = allEvents.filter(event =>
        event.title.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword)
      );
      renderEvents(filtered);
    });

    // Register function (only works if logged in)
    function registerEvent(eventId) {
      if (!token) {
        alert("Please login to register for events");
        window.location.href = "login.html";
        return;
      }

      fetch(`http://localhost:5000/api/registrations/${eventId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "Registered successfully!");
        })
        .catch(err => {
          console.error(err);
          alert("Registration failed");
        });
    }