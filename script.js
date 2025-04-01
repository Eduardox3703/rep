// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const totalAmount = document.querySelector('.total-amount');
const checkoutBtn = document.querySelector('.checkout-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

// Cart array to store items
let cart = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage if available
    const storedCart = localStorage.getItem('reptileNutritionCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCart();
    }

    // Open cart sidebar
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });

    // Close cart sidebar
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Add to cart buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', addToCart);
    });

    // Filter products
    filterBtns.forEach(btn => {
        btn.addEventListener('click', filterProducts);
    });

    // Checkout button
    checkoutBtn.addEventListener('click', processCheckout);
});

// Functions
function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
}

function addToCart(e) {
    const btn = e.target;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    
    // Check if item is already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        const newItem = {
            id,
            name,
            price,
            quantity: 1
        };
        cart.push(newItem);
    }
    
    // Show success message
    showNotification(`${name} added to cart!`);
    
    // Update cart
    updateCart();
    saveCart();
}

function updateCart() {
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        // Add items to cart
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="/placeholder.svg?height=60&width=60" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            
            // Add event listeners to quantity buttons
            cartItem.querySelector('.decrease').addEventListener('click', () => {
                decreaseQuantity(item.id);
            });
            
            cartItem.querySelector('.increase').addEventListener('click', () => {
                increaseQuantity(item.id);
            });
            
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                removeItem(item.id);
            });
        });
    }
    
    // Update total amount
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    item.quantity++;
    updateCart();
    saveCart();
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    item.quantity--;
    
    if (item.quantity <= 0) {
        removeItem(id);
    } else {
        updateCart();
        saveCart();
    }
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    saveCart();
}

function saveCart() {
    localStorage.setItem('reptileNutritionCart', JSON.stringify(cart));
}

function filterProducts(e) {
    const filter = e.target.dataset.filter;
    
    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Filter products
    productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function processCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // In a real application, this would redirect to a checkout page
    // or process the payment
    showNotification('Checkout process initiated!', 'success');
    
    // Clear cart after successful checkout
    cart = [];
    updateCart();
    saveCart();
    closeCart();
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification styles to the existing CSS
document.head.insertAdjacentHTML('beforeend', `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateX(120%);
    transition: transform 0.3s ease;
    z-index: 1001;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
}

.notification i {
    margin-right: 10px;
    font-size: 1.2rem;
}

.notification.success i {
    color: #4CAF50;
}

.notification.error i {
    color: #ff6b6b;
}
</style>
`);