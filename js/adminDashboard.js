const API_BASE_URL = "http://localhost:8080/api/v1";

$(document).ready(() => {
    showSection("dashboard");
    loadDashboard();
    loadUsers();
    loadBooks();
    loadOrders();
});

function showSection(sectionId) {
    $(".section, #dashboard").hide();
    $(`#${sectionId}`).show();
}

function filterTable(tableId, searchInputId) {
    const value = $(`#${searchInputId}`).val().toLowerCase();
    $(`#${tableId} tr`).filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
}

function logout() {
    localStorage.clear();
    window.location.href = "../../front/index.html";
}

function loadDashboard() {
    $.ajax({
        url: `${API_BASE_URL}/admin/summary`,
        method: "GET",
        success: (data) => {
            const dashboard = $("#dashboard");
            dashboard.html(`
        <div class="col-md-4">
          <div class="card dash-card text-white bg-primary shadow">
            <div class="card-body text-center">
              <h5>Total Users</h5>
              <h3>${data.users}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card dash-card text-white bg-success shadow">
            <div class="card-body text-center">
              <h5>Total Books</h5>
              <h3>${data.books}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card dash-card text-white bg-warning shadow">
            <div class="card-body text-center">
              <h5>Total Orders</h5>
              <h3>${data.orders}</h3>
            </div>
          </div>
        </div>
      `);
        },
        error: (err) => {
            console.error("Dashboard load failed:", err);
        },
    });
}

function loadUsers() {
    $.get(`${API_BASE_URL}/admin/users`, (users) => {
        const tbody = $("#user-table");
        tbody.empty();
        users.forEach((u) => {
            tbody.append(`
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td><button class="btn btn-sm btn-danger">Delete</button></td>
        </tr>
      `);
        });
    });
}

function loadBooks() {
    $.get(`${API_BASE_URL}/admin/books`, (books) => {
        const tbody = $("#book-table");
        tbody.empty();
        books.forEach((b) => {
            tbody.append(`
        <tr>
          <td>${b.title}</td>
          <td>${b.author}</td>
          <td>${b.genre}</td>
          <td>$${b.price.toFixed(2)}</td>
          <td><button class="btn btn-sm btn-danger">Delete</button></td>
        </tr>
      `);
        });
    });
}

function loadOrders() {
    $.get(`${API_BASE_URL}/admin/orders`, (orders) => {
        const tbody = $("#order-table");
        tbody.empty();
        orders.forEach((o) => {
            tbody.append(`
        <tr>
          <td>${o.id}</td>
          <td>${o.userName}</td>
          <td>${o.bookTitle}</td>
          <td>$${o.price.toFixed(2)}</td>
          <td>${o.status}</td>
        </tr>
      `);
        });
    });
}
