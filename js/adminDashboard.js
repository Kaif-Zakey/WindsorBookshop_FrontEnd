// Dashboard Data
const dashboardData = {
    users: 100,
    books: 50,
    orders: 200
};

// Users Data
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Staff' },
    { id: 3, name: 'Michael Brown', email: 'mike@example.com', role: 'Admin' }
];

// Books Data
const books = [
    { id: 1, title: 'Book 1', author: 'Author A', genre: 'Fiction', price: '$15' },
    { id: 2, title: 'Book 2', author: 'Author B', genre: 'Non-fiction', price: '$20' },
    { id: 3, title: 'Book 3', author: 'Author C', genre: 'Science', price: '$30' }
];

// Orders Data
const orders = [
    { id: 1, user: 'John Doe', book: 'Book 1', price: '$15', status: 'Shipped' },
    { id: 2, user: 'Jane Smith', book: 'Book 2', price: '$20', status: 'Pending' },
    { id: 3, user: 'Michael Brown', book: 'Book 3', price: '$30', status: 'Delivered' }
];

// Display Dashboard Data
function loadDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="card dashboard-card">
            <div class="card-body">
                <h4>Total Users</h4>
                <p>${dashboardData.users}</p>
            </div>
        </div>
        <div class="card dashboard-card">
            <div class="card-body">
                <h4>Total Books</h4>
                <p>${dashboardData.books}</p>
            </div>
        </div>
        <div class="card dashboard-card">
            <div class="card-body">
                <h4>Total Orders</h4>
                <p>${dashboardData.orders}</p>
            </div>
        </div>
    `;
}


function loadUsers() {
    const userTable = document.getElementById('user-table');
    userTable.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button></td>
        </tr>
    `).join('');
}


function loadBooks() {
    const bookTable = document.getElementById('book-table');
    bookTable.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.price}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button></td>
        </tr>
    `).join('');
}


function loadOrders() {
    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.user}</td>
            <td>${order.book}</td>
            <td>${order.price}</td>
            <td>${order.status}</td>
        </tr>
    `).join('');
}


function filterTable(tableId, searchInputId) {
    const filter = document.getElementById(searchInputId).value.toLowerCase();
    const rows = document.getElementById(tableId).getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let show = false;
        for (let j = 0; j < cells.length; j++) {
            if (cells[j]) {
                const text = cells[j].textContent || cells[j].innerText;
                if (text.toLowerCase().indexOf(filter) > -1) {
                    show = true;
                }
            }
        }
        rows[i].style.display = show ? '' : 'none';
    }
}


function deleteUser(id) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        loadUsers();
        alert(`User with ID ${id} has been deleted.`);
    }
}


function deleteBook(id) {
    const bookIndex = books.findIndex(book => book.id === id);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        loadBooks();
        alert(`Book with ID ${id} has been deleted.`);
    }
}


function logout() {
    alert("You have been logged out.");
    window.location.href = 'index.html';
}


function showSection(sectionId) {
    const sections = ['dashboard', 'manage-users', 'manage-books', 'orders'];
    sections.forEach(section => {
        document.getElementById(section).style.display = section === sectionId ? 'block' : 'none';
    });

    if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'manage-users') {
        loadUsers();
    } else if (sectionId === 'manage-books') {
        loadBooks();
    } else if (sectionId === 'orders') {
        loadOrders();
    }
}


window.onload = function () {
    loadDashboard();
    showSection('dashboard');
};
