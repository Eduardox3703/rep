// DOM Elements for Product Detail Page
const mainProductImage = document.getElementById('main-product-image');
const productThumbnails = document.getElementById('product-thumbnails');
const productCategory = document.getElementById('product-category');
const productName = document.getElementById('product-name');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const productFeatures = document.getElementById('product-features');
const fullDescription = document.getElementById('full-description');
const specificationsBody = document.getElementById('specifications-body');
const userReviews = document.getElementById('user-reviews');
const relatedProductsContainer = document.getElementById('related-products');
const productBreadcrumb = document.getElementById('product-breadcrumb');
const quantityInput = document.getElementById('quantity-input');
const decreaseQuantityBtn = document.getElementById('decrease-quantity');
const increaseQuantityBtn = document.getElementById('increase-quantity');
const addToCartDetailBtn = document.getElementById('add-to-cart-detail');
const tabHeaders = document.querySelectorAll('.tab-header');
const tabPanels = document.querySelectorAll('.tab-panel');

// Get product ID from URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load product details
function loadProductDetails() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        window.location.href = 'index.html'; // Redirect to home if no ID
        return;
    }
    
    const product = getProductById(productId);
    
    if (!product) {
        window.location.href = 'index.html'; // Redirect if product not found
        return;
    }
    
    // Update page title
    document.title = `${product.name} - ReptileNutrition`;
    
    // Update breadcrumb
    productBreadcrumb.textContent = product.name;
    
    // Update main product image
    mainProductImage.src = product.images[0];
    mainProductImage.alt = product.name;
    
    // Create thumbnails
    product.images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('product-thumbnail');
        if (index === 0) thumbnail.classList.add('active');
        
        thumbnail.innerHTML = `<img src="${image}" alt="${product.name} thumbnail ${index + 1}">`;
        
        thumbnail.addEventListener('click', () => {
            // Update main image
            mainProductImage.src = image;
            
            // Update active thumbnail
            document.querySelectorAll('.product-thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            thumbnail.classList.add('active');
        });
        
        productThumbnails.appendChild(thumbnail);
    });
    
    // Update product info
    productCategory.textContent = capitalizeFirstLetter(product.category) + ' Food';
    productName.textContent = product.name;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    productDescription.textContent = product.shortDescription;
    
    // Update features list
    const featuresList = document.createElement('ul');
    product.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    productFeatures.appendChild(featuresList);
    
    // Update full description tab
    fullDescription.innerHTML = product.fullDescription;
    
    // Update specifications tab
    product.specifications.forEach(spec => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${spec.name}</td>
            <td>${spec.value}</td>
        `;
        specificationsBody.appendChild(row);
    });
    
    // Update reviews tab
    product.reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');
        
        // Create stars HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="reviewer-name">${review.name}</div>
                <div class="review-date">${review.date}</div>
            </div>
            <div class="review-rating">
                <div class="stars">${starsHtml}</div>
            </div>
            <div class="review-content">${review.content}</div>
        `;
        
        userReviews.appendChild(reviewItem);
    });
    
    // Load related products
    loadRelatedProducts(product.relatedProducts);
    
    // Set up add to cart button
    addToCartDetailBtn.dataset.id = product.id;
    addToCartDetailBtn.dataset.name = product.name;
    addToCartDetailBtn.dataset.price = product.price;
    
    // Add event listener for add to cart button
    addToCartDetailBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        addToCartWithQuantity(product.id, product.name, product.price, quantity);
    });
}

// Load related products
function loadRelatedProducts(relatedIds) {
    const relatedProducts = getRelatedProducts(relatedIds);
    
    relatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.category = product.category;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
                ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.shortDescription}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <a href="product-detail.html?id=${product.id}" class="add-to-cart-btn">View Details</a>
            </div>
        `;
        
        relatedProductsContainer.appendChild(productCard);
    });
}

// Add to cart with quantity
function addToCartWithQuantity(id, name, price, quantity) {
    // Check if item is already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const newItem = {
            id,
            name,
            price: parseFloat(price),
            quantity
        };
        cart.push(newItem);
    }
    
    // Show success message
    showNotification(`${quantity} ${name} added to cart!`);
    
    // Update cart
    updateCart();
    saveCart();
}

// Handle quantity input
function handleQuantityInput() {
    // Decrease quantity button
    decreaseQuantityBtn.addEventListener('click', () => {
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
            quantityInput.value = quantity - 1;
        }
    });
    
    // Increase quantity button
    increaseQuantityBtn.addEventListener('click', () => {
        let quantity = parseInt(quantityInput.value);
        quantityInput.value = quantity + 1;
    });
    
    // Validate input to ensure it's a number and at least 1
    quantityInput.addEventListener('change', () => {
        let quantity = parseInt(quantityInput.value);
        if (isNaN(quantity) || quantity < 1) {
            quantityInput.value = 1;
        }
    });
}

// Handle tabs
function handleTabs() {
    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Remove active class from all headers and panels
            tabHeaders.forEach(h => h.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked header
            header.classList.add('active');
            
            // Add active class to corresponding panel
            const tabId = header.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize product detail page
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    handleQuantityInput();
    handleTabs();
});