import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi_IwTYTpTGZW4IOLdP_7_M8Il0bwScUU",
  authDomain: "touch-8fd12.firebaseapp.com",
  projectId: "touch-8fd12",
  storageBucket: "touch-8fd12.appspot.com",
  messagingSenderId: "912867048557",
  appId: "1:912867048557:web:51499df054754298dd5364",
  measurementId: "G-2T4DF6PLQX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UNIQUE_USER_ID = "12319278";

window.currentUserTokens = 0;
window.UNIQUE_USER_ID = UNIQUE_USER_ID;

function listenForTokenChanges(userId) {
  const userDocRef = doc(db, "users", userId);

  onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      window.currentUserTokens = docSnap.data().tokens || 0;
    } else {
      window.currentUserTokens = 0;
    }
    console.log(
      `Tokens value updated in background: ${window.currentUserTokens}`
    );
  });
}

async function deductToken(userId) {
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().tokens > 0) {
      await updateDoc(userDocRef, { tokens: increment(-1) });
      console.log("Token deducted successfully.");
      return true;
    } else {
      console.log("Cannot deduct token, user has no tokens or does not exist.");
      return false;
    }
  } catch (error) {
    console.error("Error deducting token:", error);
    return false;
  }
}

window.deductToken = deductToken;

document.addEventListener("DOMContentLoaded", () => {
  listenForTokenChanges(UNIQUE_USER_ID);

  const tokensLink = document.getElementById("tokens-link");
  const tokensModal = document.getElementById("tokens-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTokenCount = document.getElementById("modal-token-count");

  tokensLink.addEventListener("click", (e) => {
    e.preventDefault();
    modalTokenCount.textContent = window.currentUserTokens;
    tokensModal.classList.remove("hidden");
  });

  modalCloseBtn.addEventListener("click", () => {
    tokensModal.classList.add("hidden");
  });

  tokensModal.addEventListener("click", (e) => {
    if (e.target === tokensModal) {
      tokensModal.classList.add("hidden");
    }
  });
});