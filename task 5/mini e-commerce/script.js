const products = [
  { name:"Smartphone", category:"electronics", price:699, rating:4.5, img:"https://picsum.photos/200?random=1" },
  { name:"Laptop", category:"electronics", price:1200, rating:4.8, img:"https://picsum.photos/200?random=2" },
  { name:"T-Shirt", category:"clothing", price:25, rating:4.2, img:"https://picsum.photos/200?random=3" },
  { name:"Jeans", category:"clothing", price:50, rating:4.0, img:"https://picsum.photos/200?random=4" },
  { name:"Novel", category:"books", price:15, rating:4.6, img:"https://picsum.photos/200?random=5" },
  { name:"Textbook", category:"books", price:80, rating:4.1, img:"https://picsum.photos/200?random=6" },
];

let cart = [];

const productGrid = document.getElementById("productGrid");
const categorySelect = document.getElementById("category");
const priceInput = document.getElementById("price");
const sortSelect = document.getElementById("sort");
const searchInput = document.getElementById("search");
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const clearFiltersBtn = document.getElementById("clearFilters");
const cartCount = document.getElementById("cartCount");

// Render products
function renderProducts(list) {
  productGrid.innerHTML = "";
  if(list.length===0){ productGrid.innerHTML="<p>No products found.</p>"; return; }
  list.forEach(p=>{
    const card=document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML=`
      <img loading="lazy" src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Category: ${p.category}</p>
      <p class="price">Rs ${p.price}</p>
      <p class="rating">${"★".repeat(Math.floor(p.rating)) + "☆".repeat(5-Math.floor(p.rating))} <span>${p.rating}</span></p>
      <button class="addCartBtn">Add to Cart</button>
    `;
    card.querySelector(".addCartBtn").addEventListener("click", ()=>addToCart(p));
    productGrid.appendChild(card);
  });
}

// Filter + Sort
function filterAndSortProducts(){
  let filtered = [...products];
  const category = categorySelect.value;
  const maxPrice = parseFloat(priceInput.value);
  const search = searchInput.value.toLowerCase();

  if(category!=="all") filtered=filtered.filter(p=>p.category===category);
  if(!isNaN(maxPrice)) filtered=filtered.filter(p=>p.price<=maxPrice);
  if(search) filtered=filtered.filter(p=>p.name.toLowerCase().includes(search));

  const sortValue = sortSelect.value;
  if(sortValue==="rating-desc") filtered.sort((a,b)=>b.rating-a.rating);
  else if(sortValue==="rating-asc") filtered.sort((a,b)=>a.rating-b.rating);
  else if(sortValue==="price-asc") filtered.sort((a,b)=>a.price-b.price);
  else if(sortValue==="price-desc") filtered.sort((a,b)=>b.price-a.price);

  renderProducts(filtered);
}

// Cart
function addToCart(product){
  cart.push(product);
  cartCount.textContent = cart.length;
  alert(`${product.name} added to cart`);
}

function renderCart(){
  cartItems.innerHTML = "";
  if(cart.length===0){ cartItems.innerHTML="<p>Cart is empty</p>"; return; }
  cart.forEach((p,i)=>{
    const div = document.createElement("div");
    div.innerHTML = `<p>${p.name} - Rs ${p.price} <button data-index="${i}">Remove</button></p>`;
    div.querySelector("button").addEventListener("click", (e)=>removeCartItem(e));
    cartItems.appendChild(div);
  });
}

function removeCartItem(e){
  const index = e.target.dataset.index;
  cart.splice(index,1);
  cartCount.textContent = cart.length;
  renderCart();
}

// Event Listeners
categorySelect.addEventListener("change", filterAndSortProducts);
priceInput.addEventListener("input",()=>{ clearTimeout(this.debounce); this.debounce=setTimeout(filterAndSortProducts,300); });
sortSelect.addEventListener("change", filterAndSortProducts);
searchInput.addEventListener("input",()=>{ clearTimeout(this.debounce); this.debounce=setTimeout(filterAndSortProducts,300); });
clearFiltersBtn.addEventListener("click", ()=>{
  categorySelect.value="all"; priceInput.value=""; sortSelect.value="rating-desc"; searchInput.value=""; filterAndSortProducts();
});
cartBtn.addEventListener("click", ()=>{ cartModal.classList.remove("hidden"); renderCart(); });
closeCartBtn.addEventListener("click", ()=>{ cartModal.classList.add("hidden"); });
checkoutBtn.addEventListener("click", ()=>{ alert("Checkout complete!"); cart=[]; cartCount.textContent=0; renderCart(); cartModal.classList.add("hidden"); });

// Initial render
renderProducts(products);
