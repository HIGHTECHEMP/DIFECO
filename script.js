// JavaScript File: app.js

// State Management
const state = {
    products: [
        {
            id: 1,
            name: "Imperial Wool Overcoat",
            category: "men",
            price: 2890000.00,  // ₦2,890,000
            stock: 15,
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
            description: "Handcrafted from premium Italian wool with silk lining"
        },
        {
            id: 2,
            name: "Velvet Evening Gown",
            category: "women",
            price: 3450000.00,  // ₦3,450,000
            stock: 8,
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
            description: "Elegant velvet gown with crystal embellishments"
        },
        {
            id: 3,
            name: "Gold Chronograph Watch",
            category: "accessories",
            price: 12500000.00,  // ₦12,500,000
            stock: 5,
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
            description: "Swiss-made automatic movement with 18k gold case"
        },
        {
            id: 4,
            name: "Cashmere Turtleneck",
            category: "men",
            price: 890000.00,  // ₦890,000
            stock: 25,
            image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
            description: "Mongolian cashmere in charcoal grey"
        },
        {
            id: 5,
            name: "Silk Blouse Collection",
            category: "women",
            price: 650000.00,  // ₦650,000
            stock: 30,
            image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800&q=80",
            description: "Pure silk with mother-of-pearl buttons"
        },
        {
            id: 6,
            name: "Leather Weekender Bag",
            category: "accessories",
            price: 2100000.00,  // ₦2,100,000
            stock: 12,
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            description: "Full-grain Italian leather with brass hardware"
        }
    ],
    cart: [],
    orders: [
        {
            id: "ORD-001",
            customer: "Alexander Laurent",
            email: "alexander@difeco.com",
            date: "2024-03-08",
            items: [
                { productId: 1, name: "Imperial Wool Overcoat", qty: 1, price: 2890000.00 }
            ],
            total: 2890000.00,
            status: "delivered"
        },
        {
            id: "ORD-002",
            customer: "Alexander Laurent",
            email: "alexander@difeco.com",
            date: "2024-03-15",
            items: [
                { productId: 3, name: "Gold Chronograph Watch", qty: 1, price: 12500000.00 }
            ],
            total: 12500000.00,
            status: "shipped"
        }
    ],
    currentUser: {
        name: "Alexander Laurent",
        email: "alexander@difeco.com",
        isAdmin: true
    },
    editingProduct: null,
    editingOrder: null
};

// DOM Elements
const elements = {
    productsGrid: document.getElementById('productsGrid'),
    cartSidebar: document.getElementById('cartSidebar'),
    cartItems: document.getElementById('cartItems'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    adminPanel: document.getElementById('adminPanel'),
    userPanel: document.getElementById('userPanel'),
    searchOverlay: document.getElementById('searchOverlay'),
    productModal: document.getElementById('productModal'),
    statusModal: document.getElementById('statusModal'),
    adminProductsList: document.getElementById('adminProductsList'),
    adminOrdersList: document.getElementById('adminOrdersList'),
    userOrdersList: document.getElementById('userOrdersList'),
    toastContainer: document.getElementById('toastContainer')
};

// Currency Formatter
const formatNaira = (amount) => {
    return '₦' + amount.toLocaleString('en-NG');
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    updateAdminStats();
    renderAdminProducts();
    renderAdminOrders();
    renderUserOrders();
    setupEventListeners();
    renderNewArrivals();
});

// Event Listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.dataset.category);
        });
    });

    // Sort select
    const sortSelect = document.getElementById('sortSelect');

    if(sortSelect){
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }

    // Search input
    const searchInput = document.getElementById("searchInput");

    if(searchInput){
        searchInput.addEventListener("input", function(){
            searchProducts(this.value);
        });
    }
}

// Product Functions
function renderProducts(productsToRender = state.products) {
    elements.productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x500/2a2a2a/D4AF37?text=DIFECO'">
                <div class="product-overlay">
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatNaira(product.price)}</div>
                 <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts();
    } else {
        const filtered = state.products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

function sortProducts(sortType) {
    let sorted = [...state.products];
    switch(sortType) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            sorted.sort((a, b) => b.id - a.id);
            break;
    }
    renderProducts(sorted);
}

// ===== SEARCH SYSTEM =====

// toggle search box
function toggleSearchSimple(){
    const box = document.querySelector(".search-box");
    const input = document.getElementById("searchInput");

    box.classList.toggle("active");

    if(box.classList.contains("active")){
        input.focus();
    }
}

// live search
function searchProducts(query){
    const resultsBox = document.getElementById("searchResults");

    if(!resultsBox) return;

    const search = query.toLowerCase().trim();

    if(search === ""){
        resultsBox.innerHTML = "";
        return;
    }

    const filtered = state.products.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    if(filtered.length === 0){
        resultsBox.innerHTML = `<div class="search-item">No products found</div>`;
        return;
    }

    resultsBox.innerHTML = filtered.map(product => `
        <div class="search-item" onclick="selectSearchProduct(${product.id})">
            <img src="${product.image}" width="40">
            <div>
                <div>${product.name}</div>
                <small>${formatNaira(product.price)}</small>
            </div>
        </div>
    `).join("");
}

// click result
function selectSearchProduct(id){
    const product = state.products.find(p => p.id === id);

    if(!product) return;

    renderProducts([product]);

    document.getElementById("productsSection")
        .scrollIntoView({behavior:"smooth"});

    document.getElementById("searchResults").innerHTML = "";
    document.getElementById("searchInput").value = "";
}

function viewProduct(id) {
    showToast('Product details view coming soon', 'info');
}

// Cart Functions
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartUI();
    showToast(`${product.name} added to cart`, 'success');
    
    // Open cart automatically
    elements.cartSidebar.classList.add('active');
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    // Update count
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems;
    
    // Update items
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = '<div class="empty-cart" style="text-align: center; padding: 3rem; color: var(--light-gray);"><i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i><p>Your bag is empty</p></div>';
    } else {
        elements.cartItems.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${formatNaira(item.price)}</p>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.cartTotal.textContent = formatNaira(total);
}

function checkout() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Create order
    const newOrder = {
        id: `ORD-${String(state.orders.length + 1).padStart(3, '0')}`,
        customer: state.currentUser.name,
        email: state.currentUser.email,
        date: new Date().toISOString().split('T')[0],
        items: state.cart.map(item => ({
            productId: item.id,
            name: item.name,
            qty: item.quantity,
            price: item.price
        })),
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending'
    };
    
    state.orders.push(newOrder);
    state.cart = [];
    updateCartUI();
    renderAdminOrders();
    renderUserOrders();
    toggleCart();
    showToast('Order placed successfully!', 'success');
}

// UI Toggle Functions
function toggleCart() {
    elements.cartSidebar.classList.toggle('active');
}

function toggleSearch() {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput');
    
    if (!container) {
        console.error('searchContainer not found!');
        return;
    }
    
    container.classList.toggle('active');
    
    if (container.classList.contains('active')) {
        setTimeout(() => input.focus(), 100);
    } else {
        input.value = '';
        searchProducts('');
    }
}

function toggleAdminPanel() {
    elements.adminPanel.classList.toggle('active');
    if (elements.adminPanel.classList.contains('active')) {
        updateAdminStats();
        renderAdminProducts();
        renderAdminOrders();
    }
}

function toggleUserPanel() {
    elements.userPanel.classList.toggle('active');
    if (elements.userPanel.classList.contains('active')) {
        renderUserOrders();
    }
}

function scrollToProducts() {
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
}

// Admin Functions
function showAdminSection(section) {
    document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    
    event.target.closest('li').classList.add('active');
    document.getElementById(`admin${section.charAt(0).toUpperCase() + section.slice(1)}`).classList.add('active');
}

function updateAdminStats() {
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = formatNaira(totalRevenue);
    document.getElementById('totalOrders').textContent = state.orders.length;
    document.getElementById('totalProducts').textContent = state.products.length;
    document.getElementById('totalCustomers').textContent = new Set(state.orders.map(o => o.email)).size;
}

function renderAdminProducts() {
    elements.adminProductsList.innerHTML = state.products.map(product => `
        <tr>
            <td>
                <div class="product-thumb">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </td>
            <td>
                <strong>${product.name}</strong>
                <br><small style="color: var(--light-gray)">${product.description}</small>
            </td>
            <td><span class="status-badge status-${product.category}">${product.category}</span></td>
            <td>${formatNaira(product.price)}</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminOrders() {
    elements.adminOrdersList.innerHTML = state.orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}<br><small style="color: var(--light-gray)">${order.email}</small></td>
            <td>${order.date}</td>
            <td>${order.items.length} items</td>
            <td>${formatNaira(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="openStatusModal('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    state.editingProduct = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    elements.productModal.classList.add('active');
}

function closeProductModal() {
    elements.productModal.classList.remove('active');
    state.editingProduct = null;
}

function editProduct(id) {
    const product = state.products.find(p => p.id === id);
    state.editingProduct = product;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodImage').value = product.image;
    
    elements.productModal.classList.add('active');
}

function saveProduct(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        stock: parseInt(document.getElementById('prodStock').value),
        description: document.getElementById('prodDescription').value,
        image: document.getElementById('prodImage').value || 'https://via.placeholder.com/400x500/2a2a2a/D4AF37?text=DIFECO'
    };
    
    if (state.editingProduct) {
        // Update existing
        const index = state.products.findIndex(p => p.id === state.editingProduct.id);
        state.products[index] = { ...state.editingProduct, ...productData };
        showToast('Product updated successfully', 'success');
    } else {
        // Create new
        const newId = Math.max(...state.products.map(p => p.id)) + 1;
        state.products.push({ id: newId, ...productData });
        showToast('Product added successfully', 'success');
    }
    
    closeProductModal();
    renderAdminProducts();
    renderProducts();
    renderNewArrivals();
    updateAdminStats();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        state.products = state.products.filter(p => p.id !== id);
        renderAdminProducts();
        renderProducts();
        updateAdminStats();
        showToast('Product deleted', 'success');
    }
}

function openStatusModal(orderId) {
    state.editingOrder = orderId;
    const order = state.orders.find(o => o.id === orderId);
    document.getElementById('statusSelect').value = order.status;
    elements.statusModal.classList.add('active');
}

function closeStatusModal() {
    elements.statusModal.classList.remove('active');
    state.editingOrder = null;
}

function updateOrderStatus() {
    const newStatus = document.getElementById('statusSelect').value;
    const order = state.orders.find(o => o.id === state.editingOrder);
    if (order) {
        order.status = newStatus;
        renderAdminOrders();
        renderUserOrders();
        showToast('Order status updated', 'success');
    }
    closeStatusModal();
}

// User Functions
function showUserSection(section) {
    document.querySelectorAll('.user-menu li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.user-section').forEach(s => s.classList.remove('active'));
    
    event.target.closest('li').classList.add('active');
    document.getElementById(`user${section.charAt(0).toUpperCase() + section.slice(1)}`).classList.add('active');
}

function renderUserOrders() {
    const userOrders = state.orders.filter(o => o.email === state.currentUser.email);
    
    if (userOrders.length === 0) {
        elements.userOrdersList.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--light-gray);"><i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i><p>No orders yet</p></div>';
        return;
    }
    
    elements.userOrdersList.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-thumb">
                        <img src="${state.products.find(p => p.id === item.productId)?.image || ''}" alt="${item.name}">
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div style="color: var(--light-gray);">${order.items.length} items</div>
                <div class="order-total">${formatNaira(order.total)}</div>
            </div>
        </div>
    `).join('');
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.4s ease reverse';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

function toggleUserSidebar() {
    document.querySelector('.user-sidebar').classList.toggle('active');
}

function toggleAdminSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('active');
}

function renderNewArrivals(){
    const container = document.getElementById("newArrivalsGrid");
    
    const newest = [...state.products]
        .sort((a,b) => b.id - a.id)
        .slice(0, 8);

    container.innerHTML = newest.map((product, index) => `
        <div class="product-card" onclick="viewProduct(${product.id})" ${index < 4 ? 'data-new' : ''}>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <button class="quick-add" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${formatNaira(product.price)}</p>
            </div>
        </div>
    `).join('');
    
    initSlider();
}

function initSlider() {
    const track = document.getElementById('newArrivalsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const getScrollAmount = () => {
        const card = track.querySelector('.product-card');
        return card ? card.offsetWidth + 32 : 332;
    };
    
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });
    
    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2;
        track.scrollLeft = scrollLeft - walk;
    });
}

const slider = document.getElementById('newArrivalsGrid');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressContainer = document.getElementById('progressDots');

const getCardWidth = () => {
    const card = slider.querySelector('.new-arrival-card');
    return card ? card.offsetWidth + 25 : 305;
};

const createDots = () => {
    const cards = slider.querySelectorAll('.new-arrival-card');
    const visibleCards = Math.floor(slider.offsetWidth / getCardWidth());
    const dotCount = Math.max(1, cards.length - visibleCards + 1);
    
    progressContainer.innerHTML = '';
    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        progressContainer.appendChild(dot);
    }
};

const updateDots = () => {
    const dots = progressContainer.querySelectorAll('.progress-dot');
    const scrollLeft = slider.scrollLeft;
    const cardWidth = getCardWidth();
    const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
    const activeIndex = Math.round(scrollLeft / (cardWidth * visibleCards));
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
};

const slideNext = () => {
    const cardWidth = getCardWidth();
    const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
    slider.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
};

const slidePrev = () => {
    const cardWidth = getCardWidth();
    const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
    slider.scrollBy({ left: -(cardWidth * visibleCards), behavior: 'smooth' });
};

const goToSlide = (index) => {
    const cardWidth = getCardWidth();
    const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
    slider.scrollTo({ left: cardWidth * visibleCards * index, behavior: 'smooth' });
};

nextBtn.addEventListener('click', slideNext);
prevBtn.addEventListener('click', slidePrev);

let scrollTimeout;
slider.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateDots, 50);
});

window.addEventListener('resize', () => {
    createDots();
    updateDots();
});

// Select once
// Select elements once
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const searchBtn = document.getElementById('searchBtn');
const searchBox = document.querySelector('.search-box');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// ----- HAMBURGER MENU -----
hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active'); // X animation
    searchBox.classList.remove('active'); // close search if open
});

// Close mobile menu when clicking any link/button inside it
mobileMenu.querySelectorAll('a, button').forEach(item => {
    item.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ----- SEARCH TOGGLE -----
// searchBtn.addEventListener('click', (e) => {
//     e.stopPropagation();
//     searchBox.classList.toggle('active');
//     mobileMenu.classList.remove('active'); // close hamburger if open
//     if (searchBox.classList.contains('active')) {
//         searchInput.focus(); // autofocus
//     }
// });

// Close search when clicking a search result
searchResults.addEventListener('click', (e) => {
    searchBox.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
});

// ----- CLICK OUTSIDE TO CLOSE BOTH -----
document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
        searchBox.classList.remove('active');
    }
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});