document.addEventListener("DOMContentLoaded", () => {
  // ================================
  // Auth Tabs & Forms
  // ================================
  const tabs = document.querySelectorAll(".auth-tabs .tab");
  const forms = document.querySelectorAll(".auth-form");
  const estimateSection = document.getElementById("estimate-section");
  const signinBtn = document.getElementById("signin-btn");
  const signupBtn = document.getElementById("signup-btn");
  const googleBtns = document.querySelectorAll(".btn[id^='google']");
  const sign_login_container = document.querySelector(".sign-login-container");


  // ================================
  // Logout (fixed, single definition)
  // ================================
  function handleLogout() {
    localStorage.removeItem("loggedInUser"); // clear user
    if (estimateSection) {
      estimateSection.classList.remove("show");
      estimateSection.classList.add("hidden");
    }

    tabs.forEach(t => t.classList.remove("active"));
    forms.forEach(f => f.classList.remove("active"));

    const signinTab = document.querySelector('[data-tab="signin"]');
    const signinForm = document.getElementById("signin-form");

    if (signinTab) signinTab.classList.add("active");
    if (signinForm) signinForm.classList.add("active");

    alert("You have logged out.");

    sign_login_container.innerHTML = `
    <div class="sign-login-container auth-box p-3 bg-white rounded shadow-sm">
          <div class="auth-tabs d-flex border-bottom mb-3">
            <button class="tab active btn flex-fill" data-tab="signin">Sign In</button>
            <button class="tab btn flex-fill" data-tab="signup">Sign Up</button>
          </div>

          <!-- Sign In -->
          <form id="signin-form" class="auth-form active">
            <div class="mb-2">
              <input type="email" name="email" class="form-control" placeholder="Email address" required>
            </div>
            <div class="mb-2">
              <input type="password" name="password" class="form-control" placeholder="Password" required>
            </div>
            <button type="button" class="btn btn-primary w-100 mb-2" id="signin-btn">Sign In</button>
            <button type="button" class="btn btn-danger w-100 mb-2 google" id="google-btn">Sign in with Google</button>
            <button type="button" class="btn btn-dark w-100" id="logout">Logout</button>
          </form>

          <!-- Sign Up -->
          <form id="signup-form" class="auth-form">
            <div class="mb-2">
              <input type="text" name="name" class="form-control" placeholder="Full Name" required>
            </div>
            <div class="mb-2">
              <input type="email" name="email" class="form-control" placeholder="Email address" required>
            </div>
            <div class="mb-2">
              <input type="password" name="password" class="form-control" placeholder="Password" required>
            </div>
            <div class="mb-2">
              <input type="password" name="confirmPassword" class="form-control" placeholder="Confirm Password" required>
            </div>
            <button type="button" class="btn btn-primary w-100 mb-2" id="signup-btn">Sign Up</button>
            <button type="button" class="btn btn-danger w-100 google" id="google-signup-btn">Sign up with Google</button>
          </form>
        </div>
    `
  }

  // Attach listener once (delegation)
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "logout") {
      handleLogout();
    }
  });

  // ================================
  // Show logged-in state
  // ================================
  function showLoggedIn(user) {
    if (estimateSection) {
      estimateSection.classList.remove("hidden");
      estimateSection.classList.add("show");
    }

    sign_login_container.innerHTML = `
      <div class="sign-login-container auth-box p-3 bg-white rounded shadow-sm">
        <p class="mb-2">👋 Welcome, <strong>${user}</strong></p>
        <button type="button" class="btn btn-dark w-100" id="logout">Logout</button>
      </div>
    `;
  }

  // ================================
  // Check localStorage for login
  // ================================
  const savedUser = localStorage.getItem("loggedInUser");
  if (savedUser) {
    showLoggedIn(savedUser);
  } else {
    const signinForm = document.getElementById("signin-form");
    if (signinForm) signinForm.classList.add("active");
  }

  // ================================
  // Tab switching
  // ================================
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      forms.forEach(f => f.classList.remove("active"));

      tab.classList.add("active");
      const target = tab.getAttribute("data-tab") + "-form";
      const targetForm = document.getElementById(target);
      if (targetForm) targetForm.classList.add("active");

      if (tab.getAttribute("data-tab") === "signup" && estimateSection) {
        estimateSection.classList.remove("show");
        estimateSection.classList.add("hidden");
      }
    });
  });

  // ================================
  // Sign In
  // ================================
  signinBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.querySelector("#signin-form input[name='email']").value;
    const password = document.querySelector("#signin-form input[name='password']").value;

    fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("✅ Welcome back " + data.user + "!");
          localStorage.setItem("loggedInUser", data.user); // save login
          showLoggedIn(data.user);
        } else {
          alert("❌ " + data.message);
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        alert("Something went wrong during login.");
      });
  });

  // ================================
  // Sign Up
  // ================================
  signupBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const name = document.querySelector("#signup-form input[name='name']").value;
    const email = document.querySelector("#signup-form input[name='email']").value;
    const password = document.querySelector("#signup-form input[name='password']").value;
    const confirmPassword = document.querySelector("#signup-form input[name='confirmPassword']").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          tabs.forEach(t => t.classList.remove("active"));
          forms.forEach(f => f.classList.remove("active"));
          const signinTab = document.querySelector('[data-tab="signin"]');
          const signinForm = document.getElementById("signin-form");
          if (signinTab) signinTab.classList.add("active");
          if (signinForm) signinForm.classList.add("active");
          alert("✅ Account created successfully! Please sign in.");
        } else {
          alert("❌ Sign up failed: " + data.message);
        }
      })
      .catch(err => {
        console.error("Signup error:", err);
        alert("Something went wrong during sign up.");
      });
  });

  // ================================
  // Confirm Design → Go to Sign In
  // ================================
  const confirmBtn = document.querySelector(".confirm-btn");
  confirmBtn?.addEventListener("click", () => {
    if (estimateSection) {
      estimateSection.classList.remove("show");
      estimateSection.classList.add("hidden");
    }
    tabs.forEach(t => t.classList.remove("active"));
    forms.forEach(f => f.classList.remove("active"));
    const signinTab = document.querySelector('[data-tab="signin"]');
    const signinForm = document.getElementById("signin-form");
    if (signinTab) signinTab.classList.add("active");
    if (signinForm) signinForm.classList.add("active");
    alert("Please sign in to proceed with the estimate.");
  });

  // ================================
  // 3D House Preview (Three.js)
  // ================================
  const house3DContainer = document.getElementById("house-3d");
  if (house3DContainer) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f6fa);

    const camera = new THREE.PerspectiveCamera(
      50,
      house3DContainer.clientWidth / house3DContainer.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 3, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(house3DContainer.clientWidth, house3DContainer.clientHeight);
    house3DContainer.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(
      "model/house.glb",
      function (gltf) {
        const model = gltf.scene;
        console.log("Model loaded:", model);
        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(0, 0, 0);
        scene.add(model);
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.error("Error loading model:", error);
      }
    );

    window.addEventListener("resize", () => {
      camera.aspect = house3DContainer.clientWidth / house3DContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(house3DContainer.clientWidth, house3DContainer.clientHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }
});
