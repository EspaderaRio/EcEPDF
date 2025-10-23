import { supabase } from "./auth.js";

const profileTab = document.getElementById("profileTab");
const yearTab = document.getElementById("yearTab");
const profileSection = document.getElementById("profileSection");
const yearSection = document.getElementById("yearSection");
const yearButtons = document.getElementById("yearButtons");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");
const pdfList = document.getElementById("pdfList");
const recentList = document.getElementById("recentList");

let currentUser = null;
let allPDFs = [];
let yearLevels = [];

// Watch for auth
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user ?? null;
  if (currentUser) loadYears();
});

profileTab.addEventListener("click", () => showTab("profile"));
yearTab.addEventListener("click", () => showTab("year"));
searchInput.addEventListener("input", handleSearch);

function showTab(tab) {
  profileSection.classList.toggle("hidden", tab !== "profile");
  yearSection.classList.toggle("hidden", tab !== "year");
  if (tab === "profile") loadRecent();
}

async function loadYears() {
  const { data, error } = await supabase.from("pdfs").select("year_level");
  if (error) return console.error(error);
  yearLevels = [...new Set(data.map((d) => d.year_level))];
  renderYearButtons();
}

function renderYearButtons() {
  yearButtons.innerHTML = "";
  yearLevels.forEach((year) => {
    const btn = document.createElement("button");
    btn.textContent = year;
    btn.onclick = () => loadPDFsByYear(year);
    yearButtons.appendChild(btn);
  });
}

async function loadPDFsByYear(year) {
  const { data, error } = await supabase
    .from("pdfs")
    .select("*")
    .eq("year_level", year)
    .order("subject", { ascending: true });

  if (error) return console.error(error);
  allPDFs = data;
  searchContainer.classList.remove("hidden");
  renderPDFList(data);
}

function renderPDFList(pdfs) {
  pdfList.innerHTML = "";
  pdfs.forEach((pdf) => {
    const div = document.createElement("div");
    div.classList.add("pdf-item");
    div.textContent = `${pdf.subject} — ${pdf.title}`;
    div.onclick = () => openInMozillaViewer(pdf);
    pdfList.appendChild(div);
  });
}

function handleSearch() {
  const query = searchInput.value.toLowerCase();
  const filtered = allPDFs.filter((pdf) =>
    pdf.title.toLowerCase().includes(query)
  );
  renderPDFList(filtered);
}

async function openInMozillaViewer(pdf) {
  const mozillaViewer = "https://mozilla.github.io/pdf.js/web/viewer.html?file=";
  const pdfUrl = encodeURIComponent(pdf.file_url);
  window.open(mozillaViewer + pdfUrl, "_blank");

  // Save to Supabase recent_views
  if (!currentUser) return;
  await supabase.from("recent_views").insert({
    user_id: currentUser.id,
    pdf_id: pdf.id,
  });
}

async function loadRecent() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("recent_views")
    .select("*, pdfs(title, subject, year_level, file_url)")
    .eq("user_id", currentUser.id)
    .order("viewed_at", { ascending: false })
    .limit(10);

  if (error) return console.error(error);

  recentList.innerHTML = "";
  if (!data.length) {
    recentList.textContent = "No recently viewed PDFs.";
    return;
  }

  data.forEach((r) => {
    const pdf = r.pdfs;
    const div = document.createElement("div");
    div.classList.add("recent-item");
    div.textContent = `${pdf.year_level} | ${pdf.subject} — ${pdf.title}`;
    div.onclick = () => openInMozillaViewer(pdf);
    recentList.appendChild(div);
  });
}
