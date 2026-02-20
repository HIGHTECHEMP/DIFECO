// Admin Authentication
const adminUser = JSON.parse(sessionStorage.getItem("DIFECO_user") || "null");
if(!adminUser || !adminUser.isAdmin) {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
}

// Data Storage
let products = JSON.parse(localStorage.getItem("DIFECO_products")) || [...featuredProducts];
let orders = JSON.parse(localStorage.getItem("DIFECO_orders")) || [];
let customers = JSON.parse(localStorage.getItem("DIFECO_customers")) || [];

// ================= NAVIGATION =================
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}-section`).classList.add('active');
    
    document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    if(section === 'products') loadProductsTable();
    if(section === 'orders') loadOrdersTable();
    if(section === 'customers') loadCustomersTable();
    if(section === 'dashboard') loadDashboard();
}

// ================= DASHBOARD =================
function loadDashboard() {
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-customers').textContent = customers.length;
    
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('total-revenue').textContent = `₦${revenue.toLocaleString()}`;
    
    // Recent orders
    const recentOrders = orders.slice(-5).reverse();
    document.getElementById('recent-orders-list').innerHTML = recentOrders.map(o => `
        <div class="recent-order-item">
            <div>
                <strong>#${o.id}</strong>
                <span>${o.customer}</span>
            </div>
            <span class="status-badge ${o.status.toLowerCase()}">${o.status}</span>
        </div>
    `).join('') || '<p>No orders yet</p>';
    
    // Low stock
    const lowStock = products.filter(p => p.stock < 5);
    document.getElementById('low-stock-list').innerHTML = lowStock.map(p => `
        <div class="low-stock-item">
            <img src="${p.image}" alt="${p.name}">
            <div>
                <strong>${p.name}</strong>
                <span>Only ${p.stock} left</span>
            </div>
        </div>
    `).join('') || '<p>No low stock items</p>';
}

// ================= PRODUCTS =================
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" class="table-img" alt="${p.name}"></td>
            <td>
                <strong>${p.name}</strong>
                <p class="text-muted">${p.description?.substring(0, 50) || ''}...</p>
            </td>
            <td>${p.category}</td>
            <td>₦${p.price.toLocaleString()}</td>
            <td>${p.stock}</td>
            <td><span class="status-badge ${p.stock > 0 ? 'active' : 'inactive'}">${p.stock > 0 ? 'Active' : 'Out of Stock'}</span></td>
            <td>
                <button onclick="editProduct(${p.id})" class="btn-icon"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct(${p.id})" class="btn-icon danger"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    if(productId) {
        const product = products.find(p => p.id === productId);
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image-base64').value = product.image;
        
        // Show image preview
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${product.image}" style="max-width: 100%; max-height: 200px;">`;
    } else {
        title.textContent = 'Add New Product';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('image-preview').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop image here or click to browse</p>
            <span>Supports: JPG, PNG, WEBP (Max 5MB)</span>
        `;
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function handleImageUpload(input) {
    const file = input.files[0];
    if(!file) return;
    
    if(file.size > 5 * 1024 * 1024) {
        alert('File too large. Max 5MB allowed.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        document.getElementById('product-image-base64').value = base64;
        
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${base64}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
}

// Drag and drop
document.addEventListener('DOMContentLoaded', () => {
    const uploadContainer = document.querySelector('.image-upload-container');
    if(uploadContainer) {
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });
        
        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });
        
        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if(files.length) {
                document.getElementById('product-image-file').files = files;
                handleImageUpload(document.getElementById('product-image-file'));
            }
        });
        
        uploadContainer.addEventListener('click', () => {
            document.getElementById('product-image-file').click();
        });
    }
});

document.getElementById('product-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        id: document.getElementById('product-id').value || Date.now(),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image-base64').value || 'assets/images/placeholder.jpg',
        date: new Date()
    };
    
    const existingIndex = products.findIndex(p => p.id == productData.id);
    if(existingIndex >= 0) {
        products[existingIndex] = {...products[existingIndex], ...productData};
        alert('Product updated successfully!');
    } else {
        products.push(productData);
        alert('Product added successfully!');
    }
    
    localStorage.setItem("DIFECO_products", JSON.stringify(products));
    closeProductModal();
    loadProductsTable();
    loadDashboard();
});

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if(confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem("DIFECO_products", JSON.stringify(products));
        loadProductsTable();
        loadDashboard();
    }
}

// ================= ORDERS =================
function loadOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    const filter = document.getElementById('order-status-filter')?.value || 'all';
    
    let filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    
    tbody.innerHTML = filteredOrders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>
                <strong>${o.customer}</strong>
                <p class="text-muted">${o.email}</p>
            </td>
            <td>${o.items?.length || 0} items</td>
            <td>₦${(o.total || 0).toLocaleString()}</td>
            <td>${new Date(o.date).toLocaleDateString()}</td>
            <td><span class="status-badge ${o.status.toLowerCase()}">${o.status}</span></td>
            <td>
                <button onclick="viewOrder(${o.id})" class="btn-icon"><i class="fas fa-eye"></i></button>
                <select onchange="updateOrderStatus(${o.id}, this.value)" class="status-select">
                    <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
}

function filterOrders() {
    loadOrdersTable();
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if(!order) return;
    
    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-detail-content');
    
    content.innerHTML = `
        <div class="order-detail-grid">
            <div class="order-info">
                <h4>Order Information</h4>
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></p>
            </div>
            <div class="customer-info">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> ${order.customer}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
            </div>
        </div>
        <div class="order-items-detail">
            <h4>Order Items</h4>
            ${order.items?.map(item => `
                <div class="order-item-row">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <strong>${item.name}</strong>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                    <span class="item-price">₦${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('') || ''}
        </div>
        <div class="order-total">
            <strong>Total: ₦${(order.total || 0).toLocaleString()}</strong>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if(order) {
        order.status = newStatus;
        localStorage.setItem("DIFECO_orders", JSON.stringify(orders));
        loadOrdersTable();
        loadDashboard();
    }
}

// ================= CUSTOMERS =================
function loadCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.orders || 0}</td>
            <td>₦${(c.totalSpent || 0).toLocaleString()}</td>
            <td>${new Date(c.joinDate).toLocaleDateString()}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align: center;">No customers yet</td></tr>';
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-name').textContent = adminUser.username;
    loadDashboard();
});