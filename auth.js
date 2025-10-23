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

// Replace with your GitHub Pages repo path
const BASE_PATH = "/EcEPDF/";

// Check if user is already logged in on page load
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    showApp(session.user);
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  loginSection.classList.remove("hidden");
  appSection.classList.add("hidden");
}

// Show main app
function showApp(user) {
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  userInfo.textContent = user.email;

  // Clean OAuth tokens from URL
  if (window.location.hash.includes("access_token")) {
    history.replaceState(null, null, BASE_PATH);
  }
}

// Google Sign-In
googleSignInBtn.addEventListener("click", async () => {
  authMessage.textContent = "Redirecting to Google...";
  authMessage.classList.remove("hidden");
  authMessage.classList.add("visible");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + BASE_PATH }
  });

  if (error) {
    authMessage.textContent = `Error: ${error.message}`;
  } else {
    // Optional: message while waiting for login
    authMessage.textContent = "Logging you in… please wait.";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) showApp(session.user);
  else showLogin();
});

// Run on page load
checkSession();
