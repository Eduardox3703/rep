// DOM Elements for Checkout Page
const checkoutItemsContainer = document.getElementById('checkout-items');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutShipping = document.getElementById('checkout-shipping');
const checkoutTax = document.getElementById('checkout-tax');
const checkoutTotal = document.getElementById('checkout-total');
const confirmationTotal = document.getElementById('confirmation-total');

// Form elements
const shippingForm = document.getElementById('shipping-form');
const paymentForm = document.getElementById('payment-form');
const confirmation = document.getElementById('confirmation');
const shippingNextBtn = document.getElementById('shipping-next');
const paymentBackBtn = document.getElementById('payment-back');
const paymentNextBtn = document.getElementById('payment-next');
const sameAsShippingCheckbox = document.getElementById('same-as-shipping');
const billingAddressForm = document.getElementById('billing-address-form');

// Credit card elements
const cardNumberInput = document.getElementById('card-number');
const cardNameInput = document.getElementById('card-name');
const expiryDateInput = document.getElementById('expiry-date');
const cvvInput = document.getElementById('cvv');
const cardContainer = document.querySelector('.card-container');
const cardNumberDisplay = document.querySelector('.card-number-display');
const cardHolderValue = document.querySelector('.card-holder .value');
const cardExpiresValue = document.querySelector('.card-expires .value');
const cvvBox = document.querySelector('.cvv-box');
const cardIcons = document.querySelectorAll('.card-type i');
const cardIcon = document.querySelector('.card-icon');

// Payment processing overlay
const paymentProcessingOverlay = document.getElementById('payment-processing');

// Confirmation elements
const orderNumber = document.getElementById('order-number');
const transactionId = document.getElementById('transaction-id');
const orderDate = document.getElementById('order-date');
const confirmationEmail = document.getElementById('confirmation-email');

// Steps
const steps = document.querySelectorAll('.checkout-step');

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items from localStorage
    const storedCart = localStorage.getItem('reptileNutritionCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCheckoutSummary();
    } else {
        // Redirect to home if cart is empty
        window.location.href = 'index.html';
    }

    // Event listeners for navigation
    shippingNextBtn.addEventListener('click', () => {
        if (validateShippingForm()) {
            goToStep('payment');
        }
    });

    paymentBackBtn.addEventListener('click', () => {
        goToStep('shipping');
    });

    paymentNextBtn.addEventListener('click', () => {
        if (validatePaymentForm()) {
            processPayment();
        }
    });

    // Same as shipping checkbox
    sameAsShippingCheckbox.addEventListener('change', () => {
        if (sameAsShippingCheckbox.checked) {
            billingAddressForm.classList.add('hidden');
        } else {
            billingAddressForm.classList.remove('hidden');
        }
    });

    // Credit card input formatting and validation
    setupCreditCardInteraction();
});

// Update checkout summary
function updateCheckoutSummary() {
    // Clear checkout items container
    checkoutItemsContainer.innerHTML = '';
    
    // Add items to checkout summary
    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.classList.add('checkout-item');
        checkoutItem.innerHTML = `
            <div class="checkout-item-image">
                <img src="/placeholder.svg?height=60&width=60" alt="${item.name}">
            </div>
            <div class="checkout-item-details">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-price">$${item.price.toFixed(2)}</div>
                <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
            </div>
        `;
        checkoutItemsContainer.appendChild(checkoutItem);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shipping + tax;
    
    // Update totals in the DOM
    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    checkoutTax.textContent = `$${tax.toFixed(2)}`;
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
    confirmationTotal.textContent = `$${total.toFixed(2)}`;
}

// Validate shipping form
function validateShippingForm() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value.trim();
    
    // Simple validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    // Store email for confirmation
    confirmationEmail.textContent = email;
    
    return true;
}

// Validate payment form
function validatePaymentForm() {
    const cardNumber = cardNumberInput.value.trim().replace(/\s/g, '');
    const cardName = cardNameInput.value.trim();
    const expiryDate = expiryDateInput.value.trim();
    const cvv = cvvInput.value.trim();
    
    // Simple validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Please fill in all payment details.');
        return false;
    }
    
    // Card number validation (Luhn algorithm)
    if (!validateCardNumber(cardNumber)) {
        alert('Please enter a valid credit card number.');
        return false;
    }
    
    // Expiry date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY).');
        return false;
    }
    
    // Check if card is expired
    const [month, year] = expiryDate.split('/');
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
    const currentYear = now.getFullYear();
    
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        alert('Your card has expired.');
        return false;
    }
    
    // CVV validation
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) {
        alert('Please enter a valid CVV (3 or 4 digits).');
        return false;
    }
    
    // If billing address is different, validate it
    if (!sameAsShippingCheckbox.checked) {
        const billingAddress = document.getElementById('billing-address').value.trim();
        const billingCity = document.getElementById('billing-city').value.trim();
        const billingState = document.getElementById('billing-state').value;
        const billingZip = document.getElementById('billing-zip').value.trim();
        
        if (!billingAddress || !billingCity || !billingState || !billingZip) {
            alert('Please fill in all billing address fields.');
            return false;
        }
    }
    
    return true;
}

// Luhn algorithm for credit card validation
function validateCardNumber(number) {
    // Remove non-digit characters
    number = number.replace(/\D/g, '');
    
    // Check if the number is of valid length
    if (number.length < 13 || number.length > 19) {
        return false;
    }
    
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i));
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
}

// Process payment
function processPayment() {
    // Show payment processing overlay
    paymentProcessingOverlay.classList.add('active');
    
    // Simulate payment processing
    setTimeout(() => {
        // Generate random success/failure (90% success rate)
        const isSuccess = Math.random() < 0.9;
        
        if (isSuccess) {
            // Generate order number and transaction ID
            const orderNum = 'RN-' + Math.floor(10000 + Math.random() * 90000);
            const txnId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000);
            
            // Set confirmation details
            orderNumber.textContent = orderNum;
            transactionId.textContent = txnId;
            orderDate.textContent = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Hide payment processing overlay
            paymentProcessingOverlay.classList.remove('active');
            
            // Go to confirmation step
            goToStep('confirmation');
            
            // Clear cart
            cart = [];
            localStorage.removeItem('reptileNutritionCart');
            
            // Update cart count in header
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = '0';
            }
        } else {
            // Hide payment processing overlay
            paymentProcessingOverlay.classList.remove('active');
            
            // Show error message
            alert('Payment failed. Please check your payment details and try again.');
        }
    }, 2000); // Simulate 2 second processing time
}

// Navigate between steps
function goToStep(stepId) {
    // Update active step
    steps.forEach(step => {
        if (step.dataset.step === stepId) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Hide all forms
    document.querySelectorAll('.checkout-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show active form
    if (stepId === 'shipping') {
        shippingForm.classList.add('active');
    } else if (stepId === 'payment') {
        paymentForm.classList.add('active');
    } else if (stepId === 'confirmation') {
        confirmation.classList.add('active');
    }
}

// Setup credit card interaction
function setupCreditCardInteraction() {
    // Format card number with spaces
    cardNumberInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        this.value = formattedValue;
        
        // Update card display
        cardNumberDisplay.textContent = formattedValue || '•••• •••• •••• ••••';
        
        // Detect card type
        detectCardType(value);
    });
    
    // Update card holder name
    cardNameInput.addEventListener('input', function() {
        cardHolderValue.textContent = this.value.toUpperCase() || 'YOUR NAME';
    });
    
    // Format expiry date
    expiryDateInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            this.value = value;
        }
        
        // Update card display
        cardExpiresValue.textContent = this.value || 'MM/YY';
    });
    
    // Flip card when focusing on CVV
    cvvInput.addEventListener('focus', function() {
        cardContainer.classList.add('flip');
    });
    
    cvvInput.addEventListener('blur', function() {
        cardContainer.classList.remove('flip');
    });
    
    // Update CVV display
    cvvInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        this.value = value;
        
        // Update card display
        cvvBox.textContent = value || '•••';
    });
}

// Detect credit card type
function detectCardType(number) {
    // Reset all card icons
    cardIcons.forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Remove current card icon class
    cardIcon.className = 'card-icon fab';
    
    // Visa
    if (number.startsWith('4')) {
        cardIcons[0].classList.add('active');
        cardIcon.classList.add('fa-cc-visa');
        return 'visa';
    }
    
    // Mastercard
    if (/^5[1-5]/.test(number)) {
        cardIcons[1].classList.add('active');
        cardIcon.classList.add('fa-cc-mastercard');
        return 'mastercard';
    }
    
    // Amex
    if (/^3[47]/.test(number)) {
        cardIcons[2].classList.add('active');
        cardIcon.classList.add('fa-cc-amex');
        return 'amex';
    }
    
    // Discover
    if (/^6(?:011|5)/.test(number)) {
        cardIcons[3].classList.add('active');
        cardIcon.classList.add('fa-cc-discover');
        return 'discover';
    }
    
    // Default to Visa icon if no match
    cardIcon.classList.add('fa-credit-card');
    return 'unknown';
}