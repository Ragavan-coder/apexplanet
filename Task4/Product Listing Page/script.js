const products = [
  { name: "Smartphone", category: "electronics", price: 699, rating: 4.5 },
  { name: "Laptop", category: "electronics", price: 1200, rating: 4.8 },
  { name: "T-Shirt", category: "clothing", price: 25, rating: 4.2 },
  { name: "Jeans", category: "clothing", price: 50, rating: 4.0 },
  { name: "Novel", category: "books", price: 15, rating: 4.6 },
  { name: "Textbook", category: "books", price: 80, rating: 4.1 },
];

const productGrid = document.getElementById("productGrid");
const categorySelect = document.getElementById("category");
const priceInput = document.getElementById("price");
const sortSelect = document.getElementById("sort");

function renderProducts(list) {
  productGrid.innerHTML = "";
  if (list.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    return;
  }
  list.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p class="price">Price: Rs${product.price}</p>
      <p class="rating">Rating: <span>${product.rating}</span></p>
    `;
    productGrid.appendChild(card);
  });
}

function filterAndSortProducts() {
  let filtered = [...products];

  const category = categorySelect.value;
  if (category !== "all") filtered = filtered.filter(p => p.category === category);

  const maxPrice = parseFloat(priceInput.value);
  if (!isNaN(maxPrice)) filtered = filtered.filter(p => p.price <= maxPrice);

  const sortValue = sortSelect.value;
  if (sortValue === "rating-desc") filtered.sort((a,b) => b.rating - a.rating);
  else if (sortValue === "rating-asc") filtered.sort((a,b) => a.rating - b.rating);
  else if (sortValue === "price-asc") filtered.sort((a,b) => a.price - b.price);
  else if (sortValue === "price-desc") filtered.sort((a,b) => b.price - a.price);

  renderProducts(filtered);
}

renderProducts(products);
categorySelect.addEventListener("change", filterAndSortProducts);
priceInput.addEventListener("input", filterAndSortProducts);
sortSelect.addEventListener("change", filterAndSortProducts);
