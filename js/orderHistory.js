$(document).ready(function () {
    const userId = localStorage.getItem("id");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        alert("User not logged in! Redirecting to login.");
        window.location.href = "index.html";
        return;
    }

    $("#profile-btn").click(function (event) {
        event.preventDefault();
        $("#profile-menu").toggleClass("show");
    });

    // Close dropdown when clicking outside
    $(document).click(function (e) {
        if (!$(e.target).closest("#profile-btn, #profile-menu").length) {
            $("#profile-menu").removeClass("show");
        }
    });

    // Logout functionality
    $("#logout-option").click(function () {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Logout"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("id");
                window.location.href = "login.html";
            }
        });
    });


    console.log(`Fetching orders for user ID: ${userId}`);

    loadOrders(userId, token);

    function loadOrders(userId, token) {
        $.ajax({
            url: `http://localhost:8080/api/v1/orders/history/${userId}`,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (orders) {
                console.log("Orders received:", orders);
                const tableBody = $("#order-history-table");
                tableBody.empty(); // Clear existing rows

                if (!orders || orders.length === 0) {
                    tableBody.html(`<tr><td colspan="7" class="text-center">No orders found</td></tr>`);
                    return;
                }

                orders.forEach(order => {
                    order.orderItems.forEach((item, index) => {
                        const row = $("<tr></tr>");

                        if (index === 0) {
                            row.append(`<td rowspan="${order.orderItems.length}">${order.id}</td>`);
                            row.append(`<td rowspan="${order.orderItems.length}">${new Date(order.orderDate).toLocaleDateString()}</td>`);
                        }

                        row.append(`<td>${item.book.title}</td>`);
                        row.append(`<td>${item.quantity}</td>`);
                        row.append(`<td>$${item.totalPrice.toFixed(2)}</td>`);

                        if (index === 0) {
                            row.append(`<td rowspan="${order.orderItems.length}"><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>`);

                            // Action column (delete button only for Pending or Cancelled)
                            const actionTd = $("<td></td>").attr("rowspan", order.orderItems.length).addClass("text-center");

                            if (order.status === "PENDING" || order.status === "CANCELLED") {
                                const deleteBtn = $("<button></button>")
                                    .addClass("btn btn-danger btn-sm delete-btn")
                                    .attr("data-id", order.id)
                                    .html("🗑 Delete")
                                    .on("click", function () {
                                        deleteOrder(order.id, token);
                                    });

                                actionTd.append(deleteBtn);
                            } else {
                                actionTd.html("Already Processed");
                            }

                            row.append(actionTd);
                        }

                        tableBody.append(row);
                    });
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching order history:", error);
                alert("Failed to load order history. Please try again.");
            }
        });
    }

    function deleteOrder(orderId, token) {
        if (confirm("Are you sure you want to delete this order?")) {
            $.ajax({
                url: `http://localhost:8080/api/v1/orders/${orderId}`,
                type: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                success: function () {
                    alert("Order deleted successfully!");
                    loadOrders(userId, token); // Reload order history
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting order:", error);
                    alert("Failed to delete order. Please try again.");
                }
            });
        }
    }

    function getStatusClass(status) {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'badge bg-warning text-dark';
            case 'SHIPPED': return 'badge bg-info text-white';
            case 'DELIVERED': return 'badge bg-success text-white';
            case 'CANCELLED': return 'badge bg-danger text-white';
            default: return 'badge bg-secondary text-white';
        }
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        $("#cart-count").text(cart.reduce((total, book) => total + book.quantity, 0));
    }

    $("#logout-btn").on("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        localStorage.removeItem("cart");
        window.location.href = "index.html";
    });

    updateCartCount();
});
