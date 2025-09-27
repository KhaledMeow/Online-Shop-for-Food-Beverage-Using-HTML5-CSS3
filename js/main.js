// Header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }

// Render search results on search.html
function renderSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const container = document.getElementById('products-container');
    const titleEl = document.querySelector('.section-title h2');
    if (titleEl) {
        titleEl.textContent = query ? `Search results for "${query}"` : 'Search';
    }
    if (!container) return;

    // If no query, show a hint
    if (!query) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>Please enter a search term in the header search bar.</p>
                <a href="index.html" class="btn">Back to Home</a>
            </div>`;
        return;
    }

    // Aggregate all products from all categories
    const allProducts = [];
    for (const key in products) {
        if (Array.isArray(products[key])) {
            allProducts.push(...products[key]);
        }
    }

    const q = query.toLowerCase();
    const results = allProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );

    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No results found for "${query}".</p>
                <a href="index.html" class="btn">Back to Home</a>
            </div>`;
        return;
    }

    container.innerHTML = '';
    results.forEach(product => {
        container.insertAdjacentHTML('beforeend', createProductCard(product));
    });
    setupScrollAnimations();
}
        
        if (currentScroll > lastScroll && !header.classList.contains('scrolled')) {
            header.classList.add('scrolled');
        } else if (currentScroll < lastScroll && currentScroll < 100) {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Mobile Menu Toggle with animation
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                nav.style.display = 'block';
                setTimeout(() => nav.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
                
                // Animate nav links
                navLinks.forEach((link, index) => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateX(-20px)';
                    link.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
                    
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateX(0)';
                    }, 10);
                });
            } else {
                nav.classList.remove('active');
                document.body.style.overflow = '';
                
                // Reset nav links animation
                navLinks.forEach(link => {
                    link.style.opacity = '';
                    link.style.transform = '';
                    link.style.transition = '';
                });
                
                setTimeout(() => {
                    if (!nav.classList.contains('active')) {
                        nav.style.display = '';
                    }
                }, 300);
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('#mobile-menu-btn')) {
                nav.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (!nav.classList.contains('active')) {
                        nav.style.display = '';
                    }
                }, 300);
            }
        });
    }
}

// Cart functionality
let cart = [];

// Initialize cart when the script loads
function initCart() {
    loadCart();
    
    // If on cart page, render the cart
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
            saveCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // If on cart page, update the totals
        if (window.location.pathname.includes('cart.html')) {
            updateCartTotals();
        }
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

// Update the cart counter badge in the header
function updateCartCount() {
    try {
        const el = document.querySelector('.cart-count');
        if (!el) return;
        const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        el.textContent = String(totalQty);
    } catch (e) {
        console.warn('updateCartCount error:', e);
    }
}

function addToCart(productId, quantity = 1) {
    // Ensure productId is a number
    productId = parseInt(productId);
    quantity = parseInt(quantity) || 1;
    
    // Find the product to ensure it exists
    const product = getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found!', 'error');
        return;
    }
    
    // Find existing item in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`);
    
    // If on cart page, update the cart display
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const product = getProductById(parseInt(productId));
    const initialLength = cart.length;
    cart = cart.filter(item => item.id !== parseInt(productId));
    
    if (cart.length !== initialLength) {
        saveCart();
        
        if (product) {
            showNotification(`${product.name} removed from cart`, 'error');
        }
        
        // If on cart page, update the display
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    }
}

// Update item quantity in cart
function updateCartItem(productId, quantity) {
    quantity = parseInt(quantity);
    
    if (isNaN(quantity) || quantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === parseInt(productId));
    if (item) {
        item.quantity = quantity;
        saveCart();
        
        // If on cart page, update the display
        if (window.location.pathname.includes('cart.html')) {
            updateCartTotals();
        }
    }
}

// Get product by ID from all categories
function getProductById(productId) {
    if (!productId) return null;
    
    for (const category in products) {
        if (Array.isArray(products[category])) {
            const product = products[category].find(p => p.id === parseInt(productId));
            if (product) return product;
        }
    }
    return null;
}

// Render the cart page
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet. Start shopping to add items to your cart.</p>
                <a href="index.html" class="btn">Continue Shopping</a>
            </div>
        `;
        
        if (cartSubtotal) cartSubtotal.textContent = '$0.00';
        if (cartTotal) cartTotal.textContent = '$0.00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    // Enable checkout button if there are items
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    // Render cart items
    cartItemsContainer.innerHTML = cart.map(item => {
        const product = getProductById(item.id) || {};
        // Resolve image similarly to product cards and encode spaces
        const isHttp = (url) => /^https?:/i.test(url || '');
        const basePathPrefix = window.location.pathname.includes('/categories/') ? '../' : '';
        const resolvedImage = isHttp(product.image) ? product.image : basePathPrefix + (product.image || '');
        const imageUrl = encodeURI(resolvedImage || 'https://via.placeholder.com/150');
        const price = parseFloat(product.price || 0).toFixed(2);
        const total = (price * item.quantity).toFixed(2);
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${imageUrl}" alt="${product.name || 'Product'}" class="cart-item-img">
                <div class="cart-item-details">
                    <div>
                        <div class="cart-item-header">
                            <h3 class="cart-item-title">${product.name || 'Product'}</h3>
                            <span class="cart-item-price">$${price}</span>
                        </div>
                        <p>${product.description || ''}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const input = this.parentElement.querySelector('.quantity-input');
            let quantity = parseInt(input.value) || 1;
            
            if (this.classList.contains('plus')) {
                quantity++;
            } else if (this.classList.contains('minus') && quantity > 1) {
                quantity--;
            }
            
            input.value = quantity;
            updateCartItem(productId, quantity);
        });
    });
    
    // Add event listeners for quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(this.value) || 1;
            updateCartItem(productId, quantity);
        });
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    // Update totals
    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    const subtotal = calculateSubtotal();
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`; // In a real app, you'd add shipping, tax, etc.
}

// Calculate cart subtotal
function calculateSubtotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// Handle add to cart button clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart')) {
        e.preventDefault();
        const button = e.target.closest('.add-to-cart');
        const productId = parseInt(button.getAttribute('data-id'));
        const quantity = parseInt(button.getAttribute('data-quantity') || 1);
        addToCart(productId, quantity);
    }
});

// Featured Products Data
const products = {
    featured: [
        { 
            id: 101, 
            name: 'Organic Fruit Basket', 
            price: 29.99, 
            originalPrice: 39.99,
            image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
            description: 'Assorted seasonal organic fruits, perfect for gifting or family enjoyment.',
            isFeatured: true,
            category: 'fruits'
        },
        { 
            id: 102, 
            name: 'Artisan Bread Collection', 
            price: 19.99, 
            image: 'https://media.istockphoto.com/id/1283247428/photo/table-decorated-with-various-artisan-breads-produced-with-studio-light.jpg?s=612x612&w=0&k=20&c=zN35EjW7FAiDS62LkZMW7SYB3_hW4RoP67ZFV_xB9vg=', 
            description: 'Freshly baked assortment of sourdough, baguette, and ciabatta.',
            isFeatured: true,
            category: 'bakery'
        },
        { 
            id: 103, 
            name: 'Gourmet Cheese Platter', 
            price: 34.99, 
            originalPrice: 44.99,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBtapLrQlKxPAzz8BNxTeLRLUsUwV4YO5cRg&s', 
            description: 'Selection of fine cheeses with crackers and seasonal fruits.',
            isFeatured: true,
            category: 'dairy'
        },
        { 
            id: 104, 
            name: 'Premium Coffee Sampler', 
            price: 24.99, 
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
            description: 'Selection of single-origin coffee beans from around the world.',
            isFeatured: true,
            category: 'beverages'
        },
        { 
            id: 105, 
            name: 'Organic Vegetable Box', 
            price: 39.99, 
            originalPrice: 49.99,
            image: 'https://yummify.com.au/wp-content/uploads/2020/04/veggie-box-delivery-byron-bay.jpg', 
            description: 'Fresh, seasonal organic vegetables delivered to your door.',
            isFeatured: true,
            category: 'vegetables'
        },
        { 
            id: 106, 
            name: 'Chocolate Lovers Bundle', 
            price: 27.99, 
            image: 'https://www.eatiqbar.com/cdn/shop/files/CLV_ListingImages-01.png?v=1742242628', 
            description: 'Assortment of premium Sea salt, Peanut Butter and Almond chocolates.',
            isFeatured: true,
            category: 'sweets'
        }
    ],
    fruits: [
        { 
            id: 1, 
            name: 'Organic Apples', 
            price: 4.99, 
            image: 'https://www.orgpick.com/cdn/shop/articles/Apple_1024x1024.jpg?v=1547124407', 
            description: 'Fresh, crisp organic apples from local farms.',
            isFeatured: false,
            category: 'fruits'
        },
        { 
            id: 2, 
            name: 'Fresh Bananas', 
            price: 1.99, 
            image: 'https://media.istockphoto.com/id/1494763483/photo/banana-concept.jpg?s=612x612&w=0&k=20&c=ZeVP-L6ClmyT-i0N-QAbDK7q37uHhrzg7KOzMkaOtg4=', 
            description: 'Perfectly ripe bananas, great for smoothies and snacks.',
            isFeatured: false,
            category: 'fruits'
        },
        { 
            id: 3, 
            name: 'Sweet Oranges', 
            price: 3.49, 
            image: 'https://www.allrecipes.com/thmb/y_uvjwXWAuD6T0RxaS19jFvZyFU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1205638014-2000-d0fbf9170f2d43eeb046f56eec65319c.jpg', 
            description: 'Juicy and sweet oranges, packed with vitamin C.',
            isFeatured: false,
            category: 'fruits'
        }
    ],
    vegetables: [
        { id: 4, name: 'Fresh Carrots', price: 2.49, image: 'http://t1.gstatic.com/images?q=tbn:ANd9GcTkXNKFgWAntNRItADCzB_meTucVtz9_pprBGkzX-yTcaSAuGaed2Pr2mjeJ09FRD4Om33qKnHt', description: 'Fresh and crunchy carrots, great for snacking.' },
        { id: 5, name: 'Crisp Lettuce', price: 1.99, image: 'https://cdn.mos.cms.futurecdn.net/vbaMdCVoCzWoJXxBPDjMjZ.jpg', description: 'Fresh and crisp lettuce for your salads.' },
        { id: 6, name: 'Tomatoes', price: 2.99, image: 'https://www.uvm.edu/d10-files/styles/default_1920/public/uvm-extension-cultivating-healthy-communities/tomatoes2-e.jpg?itok=menz7Vv-', description: 'Vine-ripened tomatoes, perfect for salads and sauces.' }
    ],
    dairy: [
        { id: 7, name: 'Fresh Milk', price: 3.49, image: 'https://media.istockphoto.com/id/1222018207/photo/pouring-milk-into-a-drinking-glass.jpg?s=612x612&w=0&k=20&c=eD4YHoSjKIYSPDgnM2OgWD_HVH2IcmjZSRq7IjUnH6M=', description: 'Farm-fresh milk, delivered daily.' },
        { id: 8, name: 'Farm Eggs', price: 4.99, image: 'https://nmrcdn.s3.amazonaws.com/legacy/200000/200186/white_eggs.jpg', description: ' farm eggs, packed with protein.' },
        { id: 9, name: 'Cheddar Cheese', price: 5.99, image: 'https://pearlvalleycheese.com/cdn/shop/files/sharp-cheddar-slices_1.jpg?v=1755888466&width=2400', description: 'Aged cheddar cheese, perfect for sandwiches.' }
    ],
    bakery: [
        { id: 10, name: 'Sourdough Bread', price: 4.99, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', description: 'Freshly baked sourdough bread with a crispy crust.' },
        { id: 11, name: 'Croissants', price: 3.99, image: 'https://tasteoffrancemag.com/wp-content/uploads/2021/06/bread-1284438_1280.jpg', description: 'Buttery and flaky croissants, baked fresh daily.' },
        { id: 12, name: 'Baguette', price: 2.99, image: 'https://www.kingarthurbaking.com/sites/default/files/recipe_legacy/8-3-large.jpg', description: 'Classic French baguette, perfect with any meal.' }
    ],
    beverages: [
        { id: 13, name: 'Sparkling Water', price: 1.49, image: 'https://static.independent.co.uk/2025/01/22/09/iStock-1767240913.jpg', description: 'Naturally carbonated mineral water, crisp and refreshing.' },
        { id: 14, name: 'Fresh Orange Juice', price: 3.99, image: 'https://www.thebutterhalf.com/wp-content/uploads/2022/08/Orange-Juice-13.jpg', description: '100% pure squeezed orange juice, packed with vitamin C.' },
        { id: 15, name: 'Iced Green Tea', price: 2.99, image: 'https://www.jessicagavin.com/wp-content/uploads/2014/07/iced-green-tea-lemon-lime-honey-1200.jpg', description: 'Refreshing iced green tea with a hint of honey and lemon.' }
    ],
    meat: [
        { id: 16, name: 'Grass-Fed Ribeye Steak', price: 24.99, image: 'https://whiteoakpastures.com/cdn/shop/products/20230222-_DSC8654.jpg?v=1689366244', description: 'Premium 12oz grass-fed ribeye, aged for 28 days, perfect for grilling.' },
        { id: 17, name: ' Chicken Breast', price: 12.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5lpyg2VlfgKRxoWJMd_J6H_rygAKvZO3pzQ&s', description: 'Boneless, skinless chicken breast from humanely raised, antibiotic-free chickens.' },
        { id: 18, name: 'Wild-Caught Salmon Fillet', price: 18.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcMcRLvpHHyvp5AdKxqCgMnSrUANuL7X9Rqg&s', description: 'Fresh, wild-caught Alaskan salmon fillet, rich in omega-3 fatty acids.' }
    ],
    offers: [
        { 
            id: 19, 
            name: 'Family BBQ Pack', 
            price: 59.99, 
            originalPrice: 79.99, 
            image: 'photos/Family BBQ Pack.png', 
            description: 'Special bundle: 2 ribeye steaks, 4 chicken breasts, and 2 salmon fillets. Save $20!', 
            isOffer: true,
            category: 'meat',
            isFeatured: true
        },
        { 
            id: 20, 
            name: 'Breakfast Bundle', 
            price: 14.99, 
            originalPrice: 19.99, 
            image: 'photos/Breakfast Bundle.png', 
            description: '1 dozen farm eggs, 1 loaf of sourdough, and 1L fresh orange juice. Perfect start to your day!', 
            isOffer: true,
            category: 'breakfast',
            isFeatured: true
        },
        { 
            id: 21, 
            name: 'Healthy Lunch Combo', 
            price: 12.99, 
            originalPrice: 16.97, 
            image: 'photos/Healthy Lunch Combo.png', 
            description: 'Chicken breast, mixed greens, tomatoes, and a bottle of iced green tea. Save 25%!', 
            isOffer: true,
            category: 'lunch',
            isFeatured: true
        },
        { 
            id: 22, 
            name: 'Mediterranean Feast', 
            price: 49.99, 
            originalPrice: 64.99, 
            image: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2025/11/17/fn_mezze-board-s4x3.jpg.rend.hgtvcom.616.462.suffix/1700505559832.webp', 
            description: 'Hummus, falafel, pita bread, tabbouleh, and tzatziki sauce. Perfect for sharing!', 
            isOffer: true,
            category: 'international',
            isFeatured: true
        },
        { 
            id: 23, 
            name: 'Sushi Platter', 
            price: 34.99, 
            originalPrice: 44.99, 
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
            description: 'Assorted sushi rolls with wasabi, ginger, and soy sauce. Freshly made daily.', 
            isOffer: true,
            category: 'asian',
            isFeatured: true
        }
    ],};

// Function to create product card HTML
function createProductCard(product) {
    // Resolve image path for both root and category pages and handle spaces
    const isHttp = (url) => /^https?:/i.test(url || '');
    const basePathPrefix = window.location.pathname.includes('/categories/') ? '../' : '';
    const resolvedImage = isHttp(product.image) ? product.image : basePathPrefix + (product.image || '');
    const imageUrl = encodeURI(resolvedImage || 'https://via.placeholder.com/300x200');
    const priceHtml = product.originalPrice 
        ? `<span class="price">${product.price.toFixed(2)} <span class="old-price">$${product.originalPrice.toFixed(2)}</span></span>`
        : `<span class="price">${product.price.toFixed(2)}</span>`;
        
    return `
        <div class="product-card">
            <div class="product-img">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                ${product.isOffer ? '<span class="product-badge">Special Offer</span>' : ''}
                ${product.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">
                    ${priceHtml}
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to get current category from URL
function getCurrentCategory() {
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    // Get the last part of the path
    const pathParts = path.split('/').filter(part => part);
    const filename = pathParts.pop() || '';
    
    // If we're on the index page
    if (!filename || filename === 'index.html') {
        console.log('Detected index page');
        return 'index';
    }
    
    // If we're in the categories folder
    if (path.includes('categories/')) {
        // Get the category from the filename (remove .html if present)
        const category = filename.replace('.html', '');
        console.log('Detected category page:', category);
        
        // Special case for 'meat.html' which maps to 'meat' category
        if (category === 'meat') {
            return 'meat';
        }
        
        // For other categories, just return the filename as the category
        return category;
    }
    
    console.log('Could not determine category from path');
    return null;
}

// Function to check if DOM is ready
function isDOMReady() {
    return document.readyState === 'complete' || 
           (document.readyState !== 'loading' && document.body);
}

// Function to load products for the current category
function loadProducts() {
    console.log('=== loadProducts() called ===');
    console.log('Document ready state:', document.readyState);
    console.log('Products object exists:', typeof products !== 'undefined');
    
    // Check if DOM is ready
    if (!isDOMReady()) {
        console.log('DOM not ready, retrying in 100ms...');
        setTimeout(loadProducts, 100);
        return;
    }
    
    const category = getCurrentCategory();
    const container = document.getElementById('products-container');
    const featuredContainer = document.getElementById('featured-products');
    
    console.log('Current category:', category);
    console.log('Products container:', container);
    console.log('Featured container:', featuredContainer);
    
    // If no containers found, log an error and return
    if (!container && !featuredContainer) {
        console.error('Error: No product containers found in the DOM');
        console.log('Searching for containers again...');
        
        // Try to find containers again after a short delay
        setTimeout(() => {
            const retryContainer = document.getElementById('products-container');
            const retryFeatured = document.getElementById('featured-products');
            console.log('Retry - Products container:', retryContainer);
            console.log('Retry - Featured container:', retryFeatured);
            
            if (retryContainer || retryFeatured) {
                console.log('Containers found on retry, calling loadProducts again');
                loadProducts();
            } else {
                console.error('Containers still not found after retry');
            }
        }, 200);
        return;
    }
    
    // Debug: Log all available categories
    if (typeof products !== 'undefined') {
        console.log('Available categories in products:', Object.keys(products));
        console.log('Fruits category exists:', 'fruits' in products);
        if ('fruits' in products) {
            console.log('Number of fruits:', products.fruits.length);
        }
    }
    
    // Load featured products on homepage
    if ((!category || category === 'index') && featuredContainer) {
        console.log('Loading featured products...');
        const featuredProducts = [...(products?.featured || []), ...(products?.offers || [])];
        console.log('Number of featured products:', featuredProducts.length);
        
        if (featuredProducts.length > 0) {
            featuredContainer.innerHTML = ''; // Clear existing content
            featuredProducts.forEach((product, index) => {
                console.log(`Creating card for featured product ${index + 1}:`, product.name);
                const card = createProductCard(product);
                featuredContainer.insertAdjacentHTML('beforeend', card);
            });
            console.log(`Loaded ${featuredProducts.length} featured products`);
        } else {
            console.log('No featured products found');
            featuredContainer.innerHTML = '<p class="no-products">No featured products available at the moment.</p>';
        }
    }
    
    // Load category products
    if (container && category && category !== 'index') {
        console.log('=== Loading category products ===');
        console.log('Category to load:', category);
        console.log('Products object:', products);
        
        if (!products[category]) {
            console.error(`Category '${category}' not found in products object!`);
            container.innerHTML = `
                <div class="error">
                    <p>Error: Category '${category}' not found.</p>
                    <p>Available categories: ${Object.keys(products).join(', ')}</p>
                </div>`;
            return;
        }
        
        const categoryProducts = products[category];
        console.log(`Found ${categoryProducts.length} products for category '${category}'`);
        
        if (categoryProducts && categoryProducts.length > 0) {
            container.innerHTML = ''; // Clear existing content
            categoryProducts.forEach((product, index) => {
                console.log(`Creating card for product ${index + 1}:`, product.name);
                const card = createProductCard(product);
                container.insertAdjacentHTML('beforeend', card);
            });
            console.log(`Loaded ${categoryProducts.length} products for category '${category}'`);
            
            // Debug: Check if any product cards were actually added
            setTimeout(() => {
                const productCards = container.querySelectorAll('.product-card');
                console.log(`Number of product cards in DOM: ${productCards.length}`);
                if (productCards.length === 0) {
                    console.error('No product cards were added to the DOM!');
                }
            }, 100);
            
        } else {
            console.log(`No products found for category: ${category}`);
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products found in this category.</p>
                    <a href="../index.html" class="btn">Back to Home</a>
                </div>`;
        }
    }
    // Initialize animations for product cards
    setupScrollAnimations();
    
    console.log('=== loadProducts() completed ===');
}

// (Removed duplicate handler to prevent double-adding)

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                const nav = document.querySelector('nav');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });
    });
}

// Add animation to elements when they come into view
function setupScrollAnimations() {
    const animateOnScroll = (elements, className) => {
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add(className);
            }
        });
    };
    
    // Animate product cards
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length > 0) {
        productCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        window.addEventListener('scroll', () => {
            animateOnScroll(productCards, 'animate');
        });
        
        // Initial check in case elements are already in view
        animateOnScroll(productCards, 'animate');
    }
}

// Debug function to log product data
function debugProductData() {
    console.log('=== DEBUG: Product Data ===');
    console.log('Products object:', products);
    console.log('Fruits category:', products.fruits);
    console.log('Number of fruits:', products.fruits.length);
    console.log('Products container exists:', !!document.getElementById('products-container'));
    console.log('===========================');
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    setupHeaderScroll();
    setupMobileMenu();
    setupSmoothScrolling();
    setupScrollAnimations();
    
    // Initialize cart
    initCart();
    
    // Call debug function
    debugProductData();
    
    // If on search page, render search results and skip normal product loading
    if (window.location.pathname.includes('search.html')) {
        renderSearchResults();
    } else {
        // Load products with a small delay to ensure everything is ready
        setTimeout(() => {
            loadProducts();
            // Debug: Check if any products were loaded
            setTimeout(() => {
                const productCards = document.querySelectorAll('.product-card');
                console.log(`Found ${productCards.length} product cards in the DOM`);
                if (productCards.length === 0) {
                    console.error('No product cards were added to the DOM!');
                    // Try to force reload products
                    loadProducts();
                }
            }, 300);
        }, 100);
    }
    
    // Handle search via button click and Enter key (search-bar is not a form)
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        const input = searchBar.querySelector('input');
        const btn = searchBar.querySelector('.search-btn, button[type="submit"]');
        const executeSearch = () => {
            const query = (input && input.value ? input.value : '').trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        };
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                executeSearch();
            });
        }
        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch();
                }
            });
        }
    }
    
    // Delegate click events for add to cart buttons
    // (Removed duplicate add-to-cart click delegation here; using single global delegation below)
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const nav = document.querySelector('nav');
            const menuBtn = document.getElementById('mobile-menu-btn');
            if (nav && menuBtn) {
                nav.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });
});
