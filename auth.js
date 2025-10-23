import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

const SUPABASE_URL = "https://xkrsudwjbeaizzygggvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnN1ZHdqYmVhaXp6eWdnZ3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTk1MjIsImV4cCI6MjA3Njc5NTUyMn0.sKxiPDLQZDYoxyffwlu8bO-Kcbazm0pt_EL1gaJslMc";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const googleSignInBtn = document.getElementById("googleSignInBtn");
const authMessage = document.getElementById("authMessage");
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

// Google Sign-In
googleSignInBtn.addEventListener("click", async () => {
  // Show initial message
  authMessage.textContent = "Redirecting to Google...";
  authMessage.classList.remove("hidden");
  authMessage.classList.add("visible");

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      authMessage.textContent = `Error: ${error.message}`;
    } else {
      // Show message instructing user to check their email (if confirmation is required)
      authMessage.textContent = "Please check your email to confirm your account before continuing.";
    }
  } catch (err) {
    authMessage.textContent = `Error: ${err.message}`;
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  loginSection.classList.remove("hidden");
  appSection.classList.add("hidden");
});

// Auth session listener
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userInfo.textContent = session.user.email;

    // Hide auth message after successful login
    authMessage.classList.remove("visible");
    authMessage.classList.add("hidden");
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});
