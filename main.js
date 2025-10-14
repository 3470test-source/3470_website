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




// -----------------------------------------------------------------------------------


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




// ---------------------------------------------------------------------


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


// -----------------------------------------------------------------------------


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


// ----------------------------------------------------------------------------------



      // // Our Placement Partners
      // const slider = document.querySelector(".partner-slider");
      // const maxMove = 150; // maximum pixels to move left/right
      // let position = 0; // start at 0 (centered)
      // let direction = 1; // 1 = move right, -1 = move left
      // const speed = 2; // pixels per frame

      // // center the slider initially
      // slider.style.transform = `translateX(${position}px)`;

      // function animateSlider() {
      //   position += direction * speed;

      //   // reverse direction at edges
      //   if (position >= maxMove) direction = -1;
      //   if (position <= -maxMove) direction = 1;

      //   slider.style.transform = `translateX(${position}px)`;
      //   requestAnimationFrame(animateSlider);
      // }
      // animateSlider();



// ---------------------------------------------------------------------------



    //  Enquiry Form - Home Page
    window.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popupForm");
    const form = document.getElementById("enquiryForm");

    // Show popup after 5 seconds if not already shown in this session
    if (!sessionStorage.getItem("formShown")) {
      setTimeout(() => {
        popup.style.display = "flex";
        document.body.classList.add("no-scroll");
        sessionStorage.setItem("formShown", "true"); // Mark as shown for this session
      }, 4000);
    }

    // Close popup
    window.closePopup = function() {
      popup.style.display = "none";
      document.body.classList.remove("no-scroll");
    }

    // Form submission
    form.addEventListener("submit", function(e) {
      e.preventDefault(); // prevent normal submit

      // Hide popup
      closePopup();

      // You can send form data here via AJAX
      alert("Thank you!  Your enquiry has been submitted.");
    });0
  });



// ------------------------------------------------------------------



              //  About page
          // OUR MILESTONES AND ACHIEVEMENTS    


document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll('.number');

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    let count = 0;
    const speed = 70; // lower = faster
    const increment = target / speed;

    const updateCount = () => {
      count += increment;

      if (count < target) {
        // Format number with commas using toLocaleString()
        counter.innerText = Math.ceil(count).toLocaleString() + suffix;
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target.toLocaleString() + suffix;
      }
    };

    updateCount();
  });
});






// ----------------------------------------------------------------------


                // About Page -- FAQS

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle the clicked item
      item.classList.toggle("active");
    });
  });


  // ------------------------------------------------------------------------


          //  Home Page - OUR ACHIEVERS 


const slideContainer = document.querySelector('.carousel-slide');
const slides = document.querySelectorAll('.carousel-slide img');
const dots = document.querySelectorAll('.dot');

const gap = 60; // gap between images
const imageWidth = 360; // width of each image
const slideWidth = imageWidth + gap; // total width including gap

// Clone first and last images for smooth infinite effect
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

slideContainer.appendChild(firstClone);
slideContainer.insertBefore(lastClone, slides[0]);

let index = 1; // start at first original image
slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;

// Update dots
function updateDots() {
  let dotIndex = index - 1;
  if(dotIndex < 0) dotIndex = slides.length - 1;
  if(dotIndex >= slides.length) dotIndex = 0;
  dots.forEach(dot => dot.classList.remove('active-dot'));
  dots[dotIndex].classList.add('active-dot');
}

// Move to next slide
function nextSlide() {
  index++;
  slideContainer.style.transition = 'transform 0.5s ease-in-out';
  slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;
  updateDots();
}

// Move to previous slide
function prevSlide() {
  index--;
  slideContainer.style.transition = 'transform 0.5s ease-in-out';
  slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;
  updateDots();
}

// Looping effect
slideContainer.addEventListener('transitionend', () => {
  if(index === 0) {
    slideContainer.style.transition = 'none';
    index = slides.length;
    slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;
  }
  if(index === slides.length + 1) {
    slideContainer.style.transition = 'none';
    index = 1;
    slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;
  }
});

// Dot click event
dots.forEach((dot, dotIndex) => {
  dot.addEventListener('click', () => {
    index = dotIndex + 1;
    slideContainer.style.transition = 'transform 0.5s ease-in-out';
    slideContainer.style.transform = `translateX(-${slideWidth * index}px)`;
    updateDots();
  });
});

// Auto slide every 3 seconds
setInterval(nextSlide, 3000);


// -------------------------------------------------------------------