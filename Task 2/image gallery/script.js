const gallery = document.getElementById("gallery");
const addBtn = document.getElementById("addBtn");
const imgUrl = document.getElementById("imgUrl");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");


function extractRealImageURL(url) {
  try {
    const urlObj = new URL(url);
    const realImage = urlObj.searchParams.get("imgurl");

    if (realImage) return realImage;

    
    return url;
  } catch {
    return url; 
  }
}


addBtn.addEventListener("click", () => {
  let url = imgUrl.value.trim();
  if (!url) return;

  
  url = extractRealImageURL(url);

  
  const div = document.createElement("div");
  div.className = "item";

  div.innerHTML = `
    <img src="${url}" onerror="this.parentElement.remove(); alert('Invalid image URL');">
    <button class="remove-btn">X</button>
  `;

  gallery.appendChild(div);

  imgUrl.value = "";
});


gallery.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    e.target.parentElement.remove();
  }
});


gallery.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    lightboxImg.src = e.target.src;
    lightbox.style.display = "flex";
  }
});


lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
});
