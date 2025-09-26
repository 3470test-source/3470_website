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
registerForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default page refresh

  // Optional: Validate password and confirm password match
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
