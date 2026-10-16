
let cartCount = 0;

function addToCart() {
    cartCount++;
    document.getElementById("cart").textContent = cartCount;
    alert("Product added to cart!");
}
