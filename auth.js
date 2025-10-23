import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

const SUPABASE_URL = "https://xkrsudwjbeaizzygggvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnN1ZHdqYmVhaXp6eWdnZ3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTk1MjIsImV4cCI6MjA3Njc5NTUyMn0.sKxiPDLQZDYoxyffwlu8bO-Kcbazm0pt_EL1gaJslMc";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

googleSignInBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) alert(error.message);
});

// Manage session
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userInfo.textContent = session.user.email;
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
});
