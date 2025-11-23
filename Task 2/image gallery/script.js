const gallery = document.getElementById("gallery");
const addBtn = document.getElementById("addBtn");
const imgUrl = document.getElementById("imgUrl");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

// Extract real image URL from Google Image links
function extractRealImageURL(url) {
  try {
    const urlObj = new URL(url);

    // Google Image link usually contains the "imgurl" parameter
    const realImage = urlObj.searchParams.get("imgurl");

    // If Google redirect found → return actual image URL
    if (realImage) return realImage;

    // Otherwise return original
    return url;
  } catch {
    return url; // fallback for invalid URL
  }
}

// ADD IMAGE
addBtn.addEventListener("click", () => {
  let url = imgUrl.value.trim();
  if (!url) return;

  // Fix Google redirect links
  url = extractRealImageURL(url);

  // Create gallery item
  const div = document.createElement("div");
  div.className = "item";

  div.innerHTML = `
    <img src="${url}" onerror="this.parentElement.remove(); alert('Invalid image URL');">
    <button class="remove-btn">X</button>
  `;

  gallery.appendChild(div);

  imgUrl.value = "";
});

// REMOVE IMAGE
gallery.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    e.target.parentElement.remove();
  }
});

// OPEN LIGHTBOX
gallery.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    lightboxImg.src = e.target.src;
    lightbox.style.display = "flex";
  }
});

// CLOSE LIGHTBOX
lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
});
