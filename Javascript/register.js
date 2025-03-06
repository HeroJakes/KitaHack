import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgoc4Zx064nL1iydJbccI692HDpu8gLLE",
  authDomain: "capstone-project-312dc.firebaseapp.com",
  projectId: "capstone-project-312dc",
  storageBucket: "capstone-project-312dc.firebasestorage.app",
  messagingSenderId: "82712440613",
  appId: "1:82712440613:web:124a86e48a3b9c3e6bf4cc",
  measurementId: "G-YFF9RVYJ9C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const fb_porvider = new FacebookAuthProvider();

// Debugging function to log Firestore document
async function logFirestoreDocument(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      console.log("User document data:", userDocSnap.data());
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
}

// --- Manual Registration ---
const manualSubmitBtn = document.getElementById("submit");
if (manualSubmitBtn) {
  manualSubmitBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    // Ensure that the required elements exist
    const fullnameEl = document.getElementById("fullname");
    const positionEl = document.getElementById("position");
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");

    if (!fullnameEl || !positionEl || !emailEl || !passwordEl) {
      console.error("Registration form elements are missing.");
      return;
    }

    const fullname = fullnameEl.value;
    const position = positionEl.value;
    const email = emailEl.value;
    const password = passwordEl.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional user data in Firestore with explicit fields
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        fullname: fullname,
        position: position,
        email: email,
        uid: user.uid,
        status: "Pending", 
      });

      // Log the document to verify
      await logFirestoreDocument(user.uid);

      alert("User Registered Successfully!");
      window.location.href = "login.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}

// --- Google Login ---
const googleLoginBtn = document.getElementById("google-login-btn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        window.location.href = "login.html";
      } else {
        // Create a new user document with status
        await setDoc(userDocRef, {
          fullname: user.displayName || '',
          email: user.email,
          uid: user.uid,
          status: "Pending",
        });

        // Log the document to verify
        await logFirestoreDocument(user.uid);

        window.location.href = "more_data.html";
      }
    } catch (error) {
      alert("Google sign in error: " + error.message);
    }
  });
}

// --- Facebook Login ---
const facebookLoginBtn = document.getElementById("facebook-login-btn");
if (facebookLoginBtn) {
  facebookLoginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const result = await signInWithPopup(auth, fb_porvider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        window.location.href = "login.html";
      } else {
        // Create a new user document with status
        await setDoc(userDocRef, {
          fullname: user.displayName || '',
          email: user.email,
          uid: user.uid,
          status: "Pending",
        });

        // Log the document to verify
        await logFirestoreDocument(user.uid);

        window.location.href = "more_data.html";
      }
    } catch (error) {
      alert("Facebook sign in error: " + error.message);
    }
  });
}

// --- Additional Data Form Submission ---
const moreDataForm = document.getElementById("moreDataForm");
if (moreDataForm) {
  moreDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // On the additional data page, we only need fullname and position
    const fullnameEl = document.getElementById("fullname");
    const positionEl = document.getElementById("position");

    if (!fullnameEl || !positionEl) {
      console.error("Additional data form elements are missing.");
      return;
    }

    const fullname = fullnameEl.value;
    const position = positionEl.value;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), {
            fullname: fullname,
            position: position,
            email: user.email,
            uid: user.uid,
            status: "Pending",
          });

          // Log the document to verify
          await logFirestoreDocument(user.uid);

          alert("Profile completed successfully!");
          window.location.href = "login.html";
        } catch (error) {
          alert("Error saving profile: " + error.message);
        }
      } else {
        window.location.href = "login.html";
      }
    });
  });
}