document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    renderCart();
});

async function loadProducts() {
    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (!response.ok) throw new Error("❌ Failed to fetch products.");

        const products = await response.json();
        console.log("📦 Products from DB:", products);
        renderProducts(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

function renderProducts(products) {
    const containers = {
        "playing-cards": document.getElementById("playing-cards"),
        "poker-chips": document.getElementById("poker-chips"),
        "accessories": document.getElementById("accessories")
    };

    Object.values(containers).forEach(container => container.innerHTML = "");

    products.forEach((product) => {
        const category = product.category?.toLowerCase() || "accessories";
        const imageUrl = product.images?.[0] || "placeholder.jpg";

        const targetContainer = containers[category] || containers["accessories"];

        const productHTML = `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='placeholder.jpg';"
                    onclick="goToProductDetails('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
                <h3>${product.name}</h3>
                <p>₱${product.price.toFixed(2)}</p>
            </div>`;

        targetContainer.insertAdjacentHTML("beforeend", productHTML);
    });
}

function goToProductDetails(id, name, price, image) {
    window.location.href = `product-details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}`;
}

document.getElementById("order-form")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname")?.value.trim();
    const gcash = document.getElementById("gcash")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const orderTotal = document.getElementById("order-total")?.value;
    const paymentProof = document.getElementById("payment-proof")?.files[0];

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!fullname || !gcash || !address || cart.length === 0 || !orderTotal || !paymentProof) {
        alert("❌ Please complete all fields.");
        return;
    }

    const submitButton = document.getElementById("submit-order");
    if (submitButton.disabled) return;

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("gcash", gcash);
    formData.append("address", address);
    formData.append("items", JSON.stringify(cart));
    formData.append("total", parseFloat(orderTotal).toFixed(2));
    formData.append("paymentProof", paymentProof);

    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            body: formData,
        });

        const responseData = await response.json();
        console.log("📦 Server Response:", responseData);

        if (!response.ok) throw new Error(responseData.error || "❌ Failed to place order.");

        alert("✅ Order placed successfully!");
        await updateStock(cart);
        localStorage.removeItem("cart");
        renderCart();
        document.getElementById("order-form")?.reset();
    } catch (error) {
        alert(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Place Order";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart-dropdown");

    cartIcon.addEventListener("click", (event) => {
        event.preventDefault();
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = "none";
        }
    });
});

document.getElementById("checkout-button")?.addEventListener("click", function () {
    window.location.href = "checkout.html"; // ✅ Redirect to checkout page
});

// ✅ Add item to cart
function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
    renderCart();
}

// ✅ Render the cart in the dropdown
function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan) {
        console.error("❌ Cart elements not found!");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">❌</button>
        `;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ✅ Remove an item from the cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

// ✅ Cart dropdown toggle logic
function setupCartDropdown() {
    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart-dropdown");

    if (!cartIcon || !cartDropdown) {
        console.error("❌ Cart dropdown elements not found!");
        return;
    }

    cartIcon.addEventListener("click", (event) => {
        event.preventDefault();
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = "none";
        }
    });
}

// ✅ Checkout button redirect
document.getElementById("checkout-button")?.addEventListener("click", function () {
    window.location.href = "checkout.html";
});
