function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// Image preview
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.style.display = "none";
  }
});

// Form submission
const form = document.getElementById("createEventForm");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  message.textContent = "Creating event...";
  message.className = "";
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value.trim());
  formData.append("description", document.getElementById("description").value.trim());
  formData.append("date", document.getElementById("date").value);
  formData.append("location", document.getElementById("location").value.trim());

  // Add image if selected
  const imageFile = imageInput.files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const res = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
        // Note: Do NOT set Content-Type manually when using FormData → browser sets it with boundary
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create event");
    }

    message.textContent = "Event created successfully! Awaiting admin approval.";
    message.className = "success";

    setTimeout(() => {
      window.location.href = "my-events.html";
    }, 1800);

  } catch (err) {
    console.error(err);
    message.textContent = err.message || "Something went wrong. Please try again.";
    message.className = "error";
    submitBtn.disabled = false;
  }
});