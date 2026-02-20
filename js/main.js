// ================= GLOBAL DATA =================
const featuredProducts = [
    { id:1, name:"Gold Necklace", category:"Jewelry", price:45000, image:"assets/images/product1.jpg", stock:10, description:"Elegant 18k gold necklace", date: new Date('2024-01-15') },
    { id:2, name:"Luxury Watch", category:"Watches", price:120000, image:"assets/images/watch1.jpg", stock:5, description:"Premium Swiss movement watch", date: new Date('2024-01-10') },
    { id:3, name:"Designer Bag", category:"Bags", price:80000, image:"assets/images/product3.jpg", stock:8, description:"Italian leather designer bag", date: new Date('2024-01-20') },
    { id:4, name:"Perfume Set", category:"Perfumes", price:35000, image:"assets/images/product4.jpg", stock:15, description:"Luxury fragrance collection", date: new Date('2024-01-18') },
    { id:5, name:"Running Shoes", category:"Shoes", price:65000, image:"assets/images/shoes1.jpg", stock:12, description:"Premium athletic footwear", date: new Date('2024-02-01') },
    { id:6, name:"Silk Dress", category:"Clothing", price:95000, image:"assets/images/dress1.jpg", stock:7, description:"Pure silk evening dress", date: new Date('2024-02-05') },
    { id:7, name:"Diamond Ring", category:"Jewelry", price:250000, image:"assets/images/ring1.jpg", stock:3, description:"1 carat diamond solitaire", date: new Date('2024-02-10') },
    { id:8, name:"Smart Watch", category:"Watches", price:85000, image:"assets/images/smartwatch1.jpg", stock:20, description:"Latest generation smart watch", date: new Date('2024-02-12') }
];

// Load cart from localStorage (persist across sessions)
let cart = JSON.parse(localStorage.getItem("DIFECO_cart") || "[]");
let currentUser = JSON.parse(sessionStorage.getItem("DIFECO_user") || "null");

// ================= AUTHENTICATION =================
const adminAccount = {
    email: "oparahraymond72@gmail.com",
    password: "Triceand i11$",
    username: "Difeco"
};

// Generate avatar URL for user
function generateAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=004d43&color=fff&size=128`;
}

function handleLogin(email, password) {
    if(email === adminAccount.email && password === adminAccount.password) {
        currentUser = {
            email: email,
            username: "Difeco",
            isAdmin: true,
            avatar: generateAvatar("Difeco Admin")
        };
        sessionStorage.setItem("DIFECO_user", JSON.stringify(currentUser));
        alert("Admin login successful!");
        window.location.href = "admin.html";
        return;
    }

    // Check registered users
    const users = JSON.parse(localStorage.getItem("DIFECO_users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    
    if(user) {
        currentUser = {
            ...user, 
            isAdmin: false,
            avatar: user.avatar || generateAvatar(user.name)
        };
        sessionStorage.setItem("DIFECO_user", JSON.stringify(currentUser));
        alert("Login successful!");
        window.location.href = "shop.html";
    } else {
        alert("Invalid credentials!");
    }
}

function logout() {
    sessionStorage.removeItem("DIFECO_user");
    window.location.href = "index.html";
}

// ================= CART FUNCTIONS =================
function saveCart() {
    localStorage.setItem("DIFECO_cart", JSON.stringify(cart));
}

function addToCart(productId, qty = 1) {
    if(!currentUser) {
        alert("Please login to add items to cart");
        window.location.href = "login.html";
        return;
    }

    const product = featuredProducts.find(p => p.id === productId);
    if(!product) return;

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if(existingItemIndex >= 0) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + qty;
    } else {
        // Item doesn't exist, add new item with quantity
        cart.push({...product, quantity: qty});
    }

    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function displayCart() {
    const cartItemsSection = document.getElementById('cart-items');
    if(!cartItemsSection) return;
    
    cartItemsSection.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsSection.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items yet.</p>
                <a href="shop.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        updateSummary(0);
        return;
    }

    cart.forEach((item, index) => {
        // Ensure quantity exists
        if (!item.quantity) item.quantity = 1;
        
        subtotal += (item.price * item.quantity);

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-category">${item.category}</p>
                    <p class="item-price">₦${item.price.toLocaleString()} each</p>
                </div>
                <div class="cart-controls-wrapper">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity(${index}, -1)">−</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="item-total">
                        <strong>₦${(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                    <button class="delete-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsSection.appendChild(div);
    });

    updateSummary(subtotal);
}

function updateCartCount() {
    // Count unique items (different products), not total quantity
    const uniqueItems = cart.length;
    
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = uniqueItems;
        el.classList.add('bounce');
        setTimeout(() => el.classList.remove('bounce'), 300);
    });
}

function showNotification(message) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ================= SEARCH FUNCTIONALITY =================
function initSearch() {
    const searchInput = document.getElementById('hero-search');
    if(!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const suggestions = document.getElementById('search-suggestions');
        
        if(query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }

        const matches = featuredProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, 5);

        if(matches.length > 0) {
            suggestions.innerHTML = matches.map(p => `
                <div class="suggestion-item" onclick="window.location.href='product.html?id=${p.id}'">
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong>
                        <span>${p.category} - ₦${p.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.innerHTML = '<div class="suggestion-item">No products found</div>';
            suggestions.style.display = 'block';
        }
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.search-container')) {
            const suggestions = document.getElementById('search-suggestions');
            if(suggestions) suggestions.style.display = 'none';
        }
    });
}

function performSearch() {
    const query = document.getElementById('hero-search')?.value;
    if(query.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
}

function initShopSearch() {
    const searchInput = document.getElementById('shop-search');
    if(!searchInput) return;

    // Check for search param
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if(searchQuery) {
        searchInput.value = searchQuery;
        filterProducts();
    }

    searchInput.addEventListener('input', debounce(() => {
        filterProducts();
    }, 300));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ================= SHOP FUNCTIONS =================
let currentProducts = [...featuredProducts];
let currentPage = 1;
const itemsPerPage = 8;

function initShop() {
    filterProducts();
    updateCartCount();
    updateUserMenu();
}

function filterProducts() {
    const searchQuery = document.getElementById('shop-search')?.value.toLowerCase() || '';
    const checkedCategories = Array.from(document.querySelectorAll('#category-filters input:checked')).map(cb => cb.value);
    const maxPrice = document.getElementById('price-range')?.value || 500000;

    currentProducts = featuredProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                             product.category.toLowerCase().includes(searchQuery);
        const matchesCategory = checkedCategories.includes('All') || checkedCategories.includes(product.category);
        const matchesPrice = product.price <= maxPrice;
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    sortProducts();
    displayProducts();
    updateResultsCount();
}

function sortProducts() {
    const sortValue = document.getElementById('sort-select')?.value || 'newest';
    
    switch(sortValue) {
        case 'price-low':
            currentProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            currentProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            currentProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            currentProducts.sort((a, b) => b.date - a.date);
    }
    displayProducts();
}

function displayProducts() {
    const grid = document.getElementById('shop-products');
    if(!grid) return;

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = currentProducts.slice(start, start + itemsPerPage);

    if(paginated.length === 0) {
        grid.innerHTML = '';
        const noResults = document.getElementById('no-results');
        if(noResults) noResults.style.display = 'block';
        const pagination = document.getElementById('pagination');
        if(pagination) pagination.innerHTML = '';
        return;
    }

    const noResults = document.getElementById('no-results');
    if(noResults) noResults.style.display = 'none';
    
    grid.innerHTML = paginated.map(product => `
        <div class="product-card-modern">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.stock < 5 ? '<span class="stock-badge low">Low Stock</span>' : ''}
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="action-btn" title="Add to Cart">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button onclick="quickView(${product.id})" class="action-btn" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="toggleWishlist(${product.id})" class="action-btn" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info-modern">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₦${product.price.toLocaleString()}</span>
                </div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span>(4.5)</span>
                </div>
            </div>
        </div>
    `).join('');

    displayPagination();
}

function displayPagination() {
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if(!pagination || totalPages <= 1) {
        if(pagination) pagination.innerHTML = '';
        return;
    }

    let html = '';
    if(currentPage > 1) html += `<button onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    
    for(let i = 1; i <= totalPages; i++) {
        if(i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if(i === currentPage - 2 || i === currentPage + 2) {
            html += `<span>...</span>`;
        }
    }
    
    if(currentPage < totalPages) html += `<button onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    displayProducts();
    document.getElementById('shop-products')?.scrollIntoView({ behavior: 'smooth' });
}

function updateResultsCount() {
    const el = document.getElementById('results-count');
    if(el) el.textContent = `Showing ${currentProducts.length} product${currentProducts.length !== 1 ? 's' : ''}`;
}

function updatePriceLabel() {
    const value = document.getElementById('price-range')?.value;
    const label = document.getElementById('price-value');
    if(label && value) label.textContent = `₦${parseInt(value).toLocaleString()}`;
}

function resetFilters() {
    const searchInput = document.getElementById('shop-search');
    if(searchInput) searchInput.value = '';
    
    document.querySelectorAll('#category-filters input').forEach(cb => cb.checked = cb.value === 'All');
    
    const priceRange = document.getElementById('price-range');
    if(priceRange) {
        priceRange.value = 500000;
        updatePriceLabel();
    }
    filterProducts();
}

function setView(view) {
    const grid = document.getElementById('shop-products');
    if(!grid) return;
    
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button')?.classList.add('active');
    
    if(view === 'list') {
        grid.classList.remove('product-grid-modern');
        grid.classList.add('product-list-view');
    } else {
        grid.classList.remove('product-list-view');
        grid.classList.add('product-grid-modern');
    }
}

// ================= HOMEPAGE FUNCTIONS =================
function populateNewArrivals() {
    const grid = document.getElementById('new-arrivals-grid');
    if(!grid) return;
    
    const newProducts = [...featuredProducts].sort((a, b) => b.date - a.date).slice(0, 4);
    grid.innerHTML = newProducts.map(product => createProductCard(product)).join('');
}

function populateTrending() {
    const grid = document.getElementById('trending-grid');
    if(!grid) return;
    
    // Simulate trending (random selection for demo)
    const trending = featuredProducts.slice(0, 4);
    grid.innerHTML = trending.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="product-card-modern">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="action-btn">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button onclick="quickView(${product.id})" class="action-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info-modern">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="product-price">₦${product.price.toLocaleString()}</div>
            </div>
        </div>
    `;
}

function quickView(productId) {
    const product = featuredProducts.find(p => p.id === productId);
    if(!product) return;
    
    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    if(!modal || !content) return;
    
    content.innerHTML = `
        <div class="quick-view-grid">
            <img src="${product.image}" alt="${product.name}">
            <div class="quick-view-info">
                <span class="category">${product.category}</span>
                <h2>${product.name}</h2>
                <div class="price">₦${product.price.toLocaleString()}</div>
                <p class="description">${product.description}</p>
                <div class="quantity-selector">
                    <button onclick="adjustQty(-1)">-</button>
                    <input type="number" id="qv-qty" value="1" min="1">
                    <button onclick="adjustQty(1)">+</button>
                </div>
                <button onclick="addToCart(${product.id}, parseInt(document.getElementById('qv-qty').value)); closeQuickView()" class="btn-primary btn-large">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if(modal) modal.style.display = 'none';
}

function adjustQty(delta) {
    const input = document.getElementById('qv-qty');
    if(input) input.value = Math.max(1, parseInt(input.value) + delta);
}

function startCountdown() {
    const timer = document.getElementById('countdown');
    if(!timer) return;
    
    let hours = 4, minutes = 23, seconds = 59;
    
    setInterval(() => {
        seconds--;
        if(seconds < 0) { seconds = 59; minutes--; }
        if(minutes < 0) { minutes = 59; hours--; }
        if(hours < 0) { hours = 4; minutes = 23; seconds = 59; }
        
        timer.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    }, 1000);
}

// ================= UTILITY FUNCTIONS =================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if(menu) menu.classList.toggle('active');
}

function updateUserMenu() {
    const menu = document.getElementById('user-menu');
    if(!menu) return;
    
    if(currentUser) {
        menu.innerHTML = `
            <div class="user-dropdown">
                <img src="${currentUser.avatar || generateAvatar(currentUser.name || currentUser.username)}" 
                     class="user-avatar" 
                     alt="User"
                     onclick="toggleUserDropdown()">
                <div class="dropdown-menu" id="user-dropdown-menu">
                    <div class="dropdown-header">
                        <strong>${currentUser.name || currentUser.username}</strong>
                        <span>${currentUser.email}</span>
                    </div>
                    <a href="#profile"><i class="fas fa-user"></i> Profile</a>
                    <a href="#orders"><i class="fas fa-box"></i> My Orders</a>
                    ${currentUser.isAdmin ? '<a href="admin.html"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.user-dropdown')) {
                const dropdown = document.getElementById('user-dropdown-menu');
                if(dropdown) dropdown.classList.remove('active');
            }
        });
    } else {
        menu.innerHTML = `<a href="login.html" class="icon-btn"><i class="fas fa-user"></i></a>`;
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if(dropdown) dropdown.classList.toggle('active');
}

function toggleWishlist(productId) {
    showNotification('Added to wishlist!');
}

// ================= CART PAGE FUNCTIONS =================
function initCartPage() {
    displayCart();
    updateCartCount();
    updateUserMenu();
}

function displayCart() {
    const cartItemsSection = document.getElementById('cart-items');
    if(!cartItemsSection) return;
    
    cartItemsSection.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsSection.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items yet.</p>
                <a href="shop.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        updateSummary(0);
        return;
    }

    cart.forEach((item, index) => {
        if (!item.quantity) item.quantity = 1;
        subtotal += (item.price * item.quantity);

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-category">${item.category}</p>
                    <p class="item-price">₦${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-controls-wrapper">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity(${index}, -1)">−</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="delete-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsSection.appendChild(div);
    });

    updateSummary(subtotal);
}

function changeQuantity(index, delta) {
    if (cart[index].quantity + delta > 0) {
        cart[index].quantity += delta;
    } else {
        cart.splice(index, 1);
    }
    syncAndRefresh();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    syncAndRefresh();
}

function syncAndRefresh() {
    saveCart();
    updateCartCount();
    displayCart();
}

function updateSummary(subtotal) {
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("final-total");
    
    if(subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    if(totalEl) totalEl.textContent = `₦${subtotal.toLocaleString()}`;
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateUserMenu();
    
    // Initialize cart page if on cart.html
    if(document.getElementById('cart-items')) {
        initCartPage();
    }
    
    // Newsletter form
    const newsletter = document.getElementById('newsletter-form');
    if(newsletter) {
        newsletter.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Thank you for subscribing!');
            newsletter.reset();
        });
    }
});