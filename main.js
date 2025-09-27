     // 🔐 Login Page Script
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginErrorDiv = document.getElementById("error");

  const users = [
    { email: "vignesh@gmail.com", password: "123456" },
    { email: "student@test.com", password: "password" },
  ];

  if (loginForm) {
    // ✅ only run if login form exists
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault(); // stop page reload

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        if (loginErrorDiv) loginErrorDiv.style.display = "none";
        alert("Login successful!");
        window.location.href = "dashboard.html"; // redirect
      } else {
        if (loginErrorDiv) {
          loginErrorDiv.style.display = "block";
          loginErrorDiv.textContent = "Invalid credentials!";
        }
      }
    });
  }
});




    // 📊 Dashboard Page Script
document.addEventListener("DOMContentLoaded", function () {
  const bodyClass = document.body.className;
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
        sidebar.style.display =
          sidebar.style.display === "none" ? "block" : "none";
      });
    }

    // Close dropdown when clicking outside
    window.addEventListener("click", function (e) {
      if (
        profileBtn &&
        !profileBtn.contains(e.target) &&
        !menu.contains(e.target)
      ) {
        menu.style.display = "none";
      }
    });
  }
});





    // 👁️ Password Icon - show / hide password
const toggleIcons = document.querySelectorAll(".toggle-password");

toggleIcons.forEach((icon) => {
  icon.addEventListener("click", function () {
    const input = this.parentElement.querySelector("input"); // find input in same wrapper
    const type =
      input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);

    // toggle icon
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
});





     //register popup alerts
     // Handle form submission
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  // ✅ only run if registerForm exists
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default page refresh

    const password = document.getElementById("password"); // make sure you get the password input
    const confirmPassword = document.getElementById("confirm").value;

    if (password.value !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Show success popup using SweetAlert2
    Swal.fire({
      title: "🎉 Registration Successful!",
      text: "Your account has been created successfully.",
      icon: "success", // success, error, warning, info, question
      confirmButtonText: "Go to Login",
      confirmButtonColor: "#3085d6", // Button color
      background: "#f0f2f5", // Popup background color
      color: "#333", // Text color
      width: 380, // Popup width
      padding: "-5em",

      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-btn",
        icon: "swal-small-icon",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to login page
        window.location.href = "login.html";
      }
    });

    // Reset form
    registerForm.reset();
    password.setAttribute("type", "password");
    togglePassword.classList.add("fa-eye");
    togglePassword.classList.remove("fa-eye-slash");
  });
}
