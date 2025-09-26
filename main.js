document.addEventListener("DOMContentLoaded", function () {
  const bodyClass = document.body.className;




  // 🔐 Login Page Script
 if (bodyClass.includes("login-page")) {
    const loginBtn = document.querySelector(".login-btn.primary-btn"); // select login button
    if (loginBtn) {
      loginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const error = document.getElementById("error");

        if (username === "admin" && password === "1234") {
          window.location.href = "dashboard.html"; // ✅ redirect works now
        } else {
          error.style.display = "block";
        }
      });
    }
  }





  // 📊 Dashboard Page Script
  if (bodyClass.includes("dashboard-page")) {
    const profileBtn = document.getElementById("profileBtn");
    const menu = document.getElementById("profileMenu");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    // Toggle profile dropdown
    if (profileBtn) {
      profileBtn.addEventListener("click", function () {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
      });
    }

    // Toggle sidebar
    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
      });
    }

    // Close dropdown when clicking outside
    window.addEventListener("click", function (e) {
      if (profileBtn && !profileBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  }
});



  // 👁️ Password Icon - show / hide password
  const toggleIcons = document.querySelectorAll(".toggle-password");

  toggleIcons.forEach(icon => {
    icon.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input"); // find input in same wrapper
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

    // toggle icon
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
  });
  
