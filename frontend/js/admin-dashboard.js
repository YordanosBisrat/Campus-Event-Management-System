console.log("Admin dashboard loaded");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

fetch("http://localhost:5000/api/admin/stats", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(stats => {
    document.getElementById("totalEvents").textContent = stats.totalEvents ?? 0;
    document.getElementById("pendingEvents").textContent = stats.pendingEvents ?? 0;
    document.getElementById("approvedEvents").textContent = stats.approvedEvents ?? 0;
    document.getElementById("rejectedEvents").textContent = stats.rejectedEvents ?? 0;
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load admin stats");
  });
