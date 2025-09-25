
  // Toggle profile dropdown
  document.getElementById("profileBtn").addEventListener("click", function () {
    const menu = document.getElementById("profileMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // Toggle sidebar (optional)
  document.getElementById("menuToggle").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  });

  // Close dropdown when clicking outside
  window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("profileMenu");
    if (!document.getElementById("profileBtn").contains(e.target)) {
      dropdown.style.display = "none";
    }
  });




