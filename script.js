import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

const SUPABASE_URL = "https://xkrsudwjbeaizzygggvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnN1ZHdqYmVhaXp6eWdnZ3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTk1MjIsImV4cCI6MjA3Njc5NTUyMn0.sKxiPDLQZDYoxyffwlu8bO-Kcbazm0pt_EL1gaJslMc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const profileTab = document.getElementById("profileTab");
const yearTab = document.getElementById("yearTab");
const profileSection = document.getElementById("profileSection");
const yearSection = document.getElementById("yearSection");
const yearButtons = document.getElementById("yearButtons");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");
const pdfList = document.getElementById("pdfList");

let allPDFs = [];
let yearLevels = [];

profileTab.addEventListener("click", () => showTab("profile"));
yearTab.addEventListener("click", () => showTab("year"));
searchInput.addEventListener("input", handleSearch);

function showTab(tab) {
  profileSection.classList.toggle("hidden", tab !== "profile");
  yearSection.classList.toggle("hidden", tab !== "year");
}

async function loadYears() {
  const { data, error } = await supabase.from("pdf_files").select("year_level");
  if (error) {
    console.error(error);
    return;
  }
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
    .from("pdf_files")
    .select("*")
    .eq("year_level", year)
    .order("subject", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

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

// Opens PDF in Mozilla's online viewer
function openInMozillaViewer(pdf) {
  // Ensure file_url exists or build it manually if only subject/year are stored
  let fileUrl = pdf.file_url;
  if (!fileUrl) {
    const safeSubject = pdf.subject.toLowerCase().replace(/\s+/g, "_");
    const safeYear = pdf.year_level.toLowerCase().replace(/\s+/g, "");
    fileUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/${safeYear}/${safeSubject}.pdf`;
  }

  const mozillaViewer = "https://mozilla.github.io/pdf.js/web/viewer.html?file=";
  window.open(mozillaViewer + encodeURIComponent(fileUrl), "_blank");
}

// Initialize app
loadYears();
