 // Fetch upcoming events from backend
  async function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const noEventsMsg = document.getElementById('noEventsMessage');

    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');

      const events = await response.json();

      // Optional: filter for upcoming (future date) events
      const upcoming = events
        .filter(event => new Date(event.date) > new Date()) // only future events
        .sort((a, b) => new Date(a.date) - new Date(b.date)) // sort by soonest first
        .slice(0, 3); // limit to 3

      container.innerHTML = ''; // clear placeholder

      if (upcoming.length === 0) {
        noEventsMsg.style.display = 'block';
        return;
      }

      noEventsMsg.style.display = 'none';

      upcoming.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const imageUrl = event.image 
          ? `http://localhost:5000${event.image}` 
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

        card.innerHTML = `
          <img src="${imageUrl}" alt="${event.title}">
          <div class="event-body">
            <span class="tag">Event</span>
            <h3>${event.title}</h3>
            <div class="event-meta">
              <p>📅 ${new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p>📍 ${event.location || 'TBD'}</p>
            </div>
            <div class="event-footer">
              <span class="capacity">${event.registeredCount || 0} registered</span>
              <div>
                <a href="event-details-page.html?id=${event._id}" class="btn-outline btn-small">Details</a>
                <a href="#" class="btn btn-small">Register</a>
              </div>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading events:', error);
      container.innerHTML = '<p class="no-events">Failed to load upcoming events. Please try again later.</p>';
    }
  }

  // Load events when page loads
  window.addEventListener('load', loadUpcomingEvents);