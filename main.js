
                   // 🔐 Login Page Script


// document.addEventListener("DOMContentLoaded", function () {
//   const userOptions = document.querySelectorAll(".user-option");
//   const userTypeInput = document.getElementById("userType");
//   const errorMsg = document.getElementById("error");

//   // Switch Login Type (Admin / Student)
//   userOptions.forEach(button => {
//     button.addEventListener("click", function(){
//       userOptions.forEach(btn => btn.classList.remove("active"));
//       this.classList.add("active");
//       userTypeInput.value = this.getAttribute("data-role");
//     });
//   });

//   // Login Submit
//   document.getElementById("loginForm").addEventListener("submit", function(e){
//     e.preventDefault();

//     let email = document.getElementById("email").value;
//     let password = document.getElementById("password").value;
//     let role = document.getElementById("userType").value; // admin / student

//     // DEMO LOGIN (You can replace with database later)
//     if(role == "admin"){
//       if(email === "admin@gmail.com" && password === "admin123"){
//         window.location.href = "admin_portal.html";
//       }else{
//         errorMsg.style.display="block";
//         errorMsg.innerText="Invalid credentials!";
//       }
//     }

//     if(role == "student"){
//       if(email === "student@gmail.com" && password === "student123"){
//         window.location.href = "dashboard.html";
//       }else{
//         errorMsg.style.display="block";
//         errorMsg.innerText="Invalid credentials!";
//       }
//     }

//    });
//   });




// ============ Login Script ===========

const loginForm = document.getElementById("loginForm");

if(loginForm){
  const errorMsg = document.getElementById("error");

  // Switch role (click, not change)
  const userOptions = document.querySelectorAll(".user-option");
  const userTypeInput = document.getElementById("userType");

  userOptions.forEach(button => {
    button.addEventListener("click", function(){
      userOptions.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      userTypeInput.value = this.dataset.role;
      errorMsg.textContent = "";
    });
  });

  loginForm.addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const role = userTypeInput.value;

    errorMsg.style.display = "none";

    // Admin login
    if(role === "admin"){
      if(email === "admin@gmail.com" && password === "admin123"){
        window.location.href = "admin_portal.html";
      } else {
        errorMsg.style.display = "block";
        errorMsg.innerText = "Admin Invalid credentials!";
      }
      return;
    }

    // Student login
    if(role === "student"){
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find(s => s.email === email && s.password === password);

      if(student){
        window.location.href = "dashboard.html";
      } else {
        errorMsg.style.display = "block";
        errorMsg.innerText = "Student Invalid credentials!";
      }
    }
  });
}



// =========  Admin / Student Toggle Buttons ===========

document.addEventListener("DOMContentLoaded", function () {
  const userOptions = document.querySelectorAll(".user-option");
  const userTypeInput = document.getElementById("userType");
  const errorMsg = document.getElementById("error");

  userOptions.forEach(button => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      userOptions.forEach(btn => btn.classList.remove("active"));
      
      // Add active class to clicked button
      this.classList.add("active");

      // Update hidden input value
      userTypeInput.value = this.dataset.role;

      // Clear any previous error
      errorMsg.textContent = "";
    });
  });
});


// -----------------------------------------------------------------------------------


  // ========= 📊 Dashboard Page Script =================

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


// =============== 👁️ Password Icon - show / hide password =================

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


//      //register popup alerts
//      // Handle form submission


// const registerForm = document.getElementById("registerForm");

// if (registerForm) {
//   registerForm.addEventListener("submit", function (e) {
//     e.preventDefault(); // stop form refresh

//     const passwordInput = document.getElementById("password");
//     const password = passwordInput.value;

//     const mobileInput = document.getElementById("mobile");
//     const mobile = mobileInput.value;

//     // Mobile number regex - Indian format
//     const mobileRegex = /^[6-9]\d{9}$/;

//     if (!mobileRegex.test(mobile)) {
//       Swal.fire({
//         title: "Invalid Mobile Number!",
//         text: "Please enter a valid 10-digit mobile number starting with 6–9.",
//         icon: "error",
//         confirmButtonColor: "#d33",
//         background: "#f8d7da",
//         color: "#721c24",
//         width: 380,
//         customClass: {
//         title: "swal-title",
//         htmlContainer: "swal-text",
//         confirmButton: "swal-btn",
//       },
//     });
//     return; // ❌ Stop further execution
//  }


//     // Strong password regex
//     const strongPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

//     // ❌ If password format is wrong → STOP and show SWEETALERT error popup
//     if (!strongPass.test(password)) {
//       Swal.fire({
//         title: "Invalid Password!",
//         text: "Password must be at least 8 characters with uppercase, lowercase, special character & number.",
//         icon: "error",
//         confirmButtonColor: "#d33",
//         background: "#f8d7da",
//         color: "#721c24",
//         width: 380,

//         customClass: {
//           title: "swal-title",
//           htmlContainer: "swal-text",
//           confirmButton: "swal-btn",
//         },
//       });
//       return; // ❌ Stop here (no success popup)
//     }


//     // ✅ If password is correct → show success popup
//     Swal.fire({
//       title: "🎉 Registration Successful!",
//       text: "Your account has been created successfully.",
//       icon: "success",
//       confirmButtonText: "Go to Login",
//       confirmButtonColor: "#3085d6",
//       background: "#f0f2f5",
//       color: "#333",
//       width: 380,
//       padding: "-5em",

//       customClass: {
//         title: "swal-title",
//         htmlContainer: "swal-text",
//         confirmButton: "swal-btn",
//         icon: "swal-small-icon",
//       },
//     }).then((result) => {
//       if (result.isConfirmed) {
//         window.location.href = "login.html";
//       }
//     });

//     // Reset form after success
//     registerForm.reset();
//     password.setAttribute("type", "password");
//     togglePassword.classList.add("fa-eye");
//     togglePassword.classList.remove("fa-eye-slash");

//   });
// }



                  // ===== Register Script =====

const registerForm = document.getElementById("registerForm");

if(registerForm){
  registerForm.addEventListener("submit", async function(e){ // Make async
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const mobile = document.getElementById("registerMobile").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if(!mobileRegex.test(mobile)){
      Swal.fire({
        title: "Invalid Mobile Number!",
        text: "Enter a valid 10-digit mobile number starting with 6-9.",
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#f8d7da",
        color: "#721c24",
        width: 380,
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-btn",
      },
     });
      return;
    }

    // Password validation
    const strongPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if(!strongPass.test(password)){
      Swal.fire({
        title: "Invalid Password!",
        text: "Password must have 8+ characters, uppercase, lowercase, number & special character.",
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#f8d7da",
        color: "#721c24",
        width: 380,
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text",
          confirmButton: "swal-btn",
        },
      });
      return;
    }

    // SEND TO BACKEND ONLY IF VALID
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password })
      });

      const result = await res.json();

      if (result.success) {
        // Save to localStorage only on success
        let students = JSON.parse(localStorage.getItem("students") || "[]");
        students.push({name, email, mobile, password});
        localStorage.setItem("students", JSON.stringify(students));

       Swal.fire({
        title: "🎉 Registration Successful!",
        text: result.message,
        icon: "success",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#3085d6",
        background: "#f0f2f5",
        color: "#333",
        width: 380,
        padding: "-5em",
 
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-btn",
        icon: "swal-small-icon",
      },

        }).then(() => {
          window.location.href = "login.html";
        });

      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong!", "error");
    }
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



  //=============  Enquiry Form - Home Page ==================

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
      alert("Thank you !  Your enquiry has been submitted.");
    });0
  });

// ------------------------------------------------------------------


                  // ========= About page ==========
          // =============== OUR MILESTONES AND ACHIEVEMENTS =================    


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


                // ========= About Page -- FAQS ==========

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


          // ========= Home Page - OUR ACHIEVERS ==========


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


// -----------------------------------------------------------------------------------------------------------



                        // ========= Our Motto  -- Home Page ==========
   
      const tabs = document.querySelectorAll(".motto-tab-btn");
      const contents = document.querySelectorAll(".motto-tab-content");

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((btn) => btn.classList.remove("active"));
          tab.classList.add("active");

          contents.forEach((content) => content.classList.remove("active"));
          document.getElementById(tab.dataset.tab).classList.add("active");
        });
      });


 
//  --------------------------------------------------------------------------------------------------------     


        /* ========== Admin Portal -- Grant Access to Students ========== */


async function approveAccess() {
  let email = document.getElementById("email").value;
  let msg = document.getElementById("Admin-msg");

  if (!email) {
    msg.innerText = "Enter user email!";
    msg.style.color = "red";

    setTimeout(() => { msg.innerText = ""; }, 5000);
    return;
  }

  let fd = new FormData();
  fd.append("email", email);

  let res = await fetch("/grant-access", {
    method: "POST",
    body: fd
  });

  let text = (await res.text()).trim();

  if (text === "GRANTED_AND_NOTIFIED") {
    msg.style.color = "green";
    msg.innerText = "Access granted ! User notified.";

    // ✅ CLEAR INPUT BOX (RESET)
    document.getElementById("email").value = "";

  } else if (text === "MISSING_EMAIL") {
    msg.style.color = "red";
    msg.innerText = "Email missing!";
  } else {
    msg.style.color = "red";
    msg.innerText = "Error sending email!";
  }

  // ⏳ Auto clear message after 5 seconds
  setTimeout(() => {
    msg.innerText = "";
  }, 5000);
}
                    


// ----------------------------------------------------------------------------------------------------------



   

     







       



    




   


              