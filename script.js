document.addEventListener("DOMContentLoaded", function () {
  // --- CORE UI ELEMENTS ---
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;
  const mainHeader = document.querySelector(".main-header");
  const mainContent = document.querySelector(".main-content");
  const bottomNav = document.querySelector(".bottom-nav");
  const dashboardElements = [mainHeader, mainContent, bottomNav];

  // --- PAGE ELEMENTS ---
  const messagesPage = document.getElementById("messages-page");
  const profilePage = document.getElementById("profile-page");
  const messCouponPage = document.getElementById("mess-coupon-page");
  const cameraScannerPage = document.getElementById("camera-scanner-page");
  const loadingPage = document.getElementById("loading-page");
  const messPassPage = document.getElementById("mess-pass-page");
  const allPages = [
    messagesPage,
    profilePage,
    messCouponPage,
    cameraScannerPage,
    loadingPage,
    messPassPage,
  ];

  // --- INTERACTION ELEMENTS ---
  const sidebarSearchInput = document.getElementById("sidebar-search");
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu a");
  const notificationIcon = document.querySelector(".notification-icon");
  const backToDashboardBtn = document.getElementById("back-to-dashboard");
  const sidebarProfileLink = document.getElementById("sidebar-profile-link");
  const backToDashboardFromProfile = document.getElementById(
    "back-to-dashboard-from-profile"
  );
  const messScannerLink = document.getElementById("mess-scanner-link");
  const backToDashboardFromMess = document.getElementById(
    "back-to-dashboard-from-mess"
  );
  const backToDashboardFromPass = document.getElementById(
    "back-to-dashboard-from-pass"
  );
  const mealButtons = document.querySelectorAll(".meal-button");
  const messScannerTile = document.getElementById("mess-scanner-tile");

  // --- STATE VARIABLES ---
  let countdownInterval;
  let codeReader = null;
  let videoStream = null;

  // --- HAMBURGER MENU LOGIC ---
  hamburgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
    body.classList.toggle("sidebar-open");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    body.classList.remove("sidebar-open");
  });

  // --- SIDEBAR SEARCH LOGIC ---
  sidebarSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    sidebarMenuItems.forEach((item) => {
      const itemText = item.textContent.toLowerCase();
      if (itemText.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

  // --- PAGE NAVIGATION LOGIC ---
  function showPage(pageToShow) {
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      body.classList.remove("sidebar-open");
    }
    dashboardElements.forEach((el) => el.classList.add("hidden"));
    allPages.forEach((p) => p.classList.add("hidden"));
    pageToShow.classList.remove("hidden");
  }

  function hideAllPages() {
    stopCamera();
    clearInterval(countdownInterval);
    allPages.forEach((p) => p.classList.add("hidden"));
    messCouponPage.classList.remove("content-blurred");
    dashboardElements.forEach((el) => el.classList.remove("hidden"));
  }

  notificationIcon.addEventListener("click", () => showPage(messagesPage));
  sidebarProfileLink.addEventListener("click", () => showPage(profilePage));
  messScannerLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(messCouponPage);
  });
  messScannerTile.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(messCouponPage);
  });

  backToDashboardBtn.addEventListener("click", hideAllPages);
  backToDashboardFromProfile.addEventListener("click", hideAllPages);
  backToDashboardFromMess.addEventListener("click", hideAllPages);
  backToDashboardFromPass.addEventListener("click", hideAllPages);

  // --- MESS SCANNER FLOW LOGIC ---
  function stopCamera() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
    codeReader = null;
  }

  mealButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mealType = button.querySelector("span").textContent;
      startScanFlow(mealType);
    });
  });

  function startScanFlow(mealType) {
    showPage(cameraScannerPage);
    codeReader = new ZXingBrowser.BrowserMultiFormatReader();

    codeReader
      .decodeOnceFromVideoDevice(undefined, "video-stream")
      .then((result) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            videoStream = stream;
        });
        console.log("Barcode detected:", result.getText());
        showLoadingAnimation(mealType);
      })
      .catch((err) => {
        console.error("Camera or Scan Error:", err);
        alert(
          "Could not start camera. Please check permissions and try again."
        );
        hideAllPages();
      });
  }

  function showLoadingAnimation(mealType) {
    stopCamera();
    cameraScannerPage.classList.add("hidden");
    messCouponPage.classList.remove("hidden");
    messCouponPage.classList.add("content-blurred");
    loadingPage.classList.remove("hidden");

    setTimeout(() => {
      loadingPage.classList.add("hidden");
      messCouponPage.classList.remove("content-blurred");
      messCouponPage.classList.add("hidden");
      populateAndShowMessPass(mealType);
    }, 4500);
  }

  function populateAndShowMessPass(mealType) {
    document.getElementById("pass-meal-type").textContent = mealType;
    const now = new Date();
    const dateOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    document.getElementById("pass-date").textContent = now
      .toLocaleString("en-US", dateOptions)
      .replace(/,/g, "");
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    document.getElementById("pass-time").textContent = now.toLocaleTimeString(
      "en-US",
      timeOptions
    );

    showPage(messPassPage);
    startCountdown();
  }

  function startCountdown() {
    clearInterval(countdownInterval);
    let seconds = 30;
    const countdownElement = document.getElementById("pass-countdown");
    countdownElement.textContent = seconds;
    countdownInterval = setInterval(() => {
      seconds--;
      countdownElement.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = "0";
      }
    }, 1000);
  }
});