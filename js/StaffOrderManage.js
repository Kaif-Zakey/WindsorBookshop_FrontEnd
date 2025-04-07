$(document).ready(function () {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        Swal.fire({
            title: "Unauthorized",
            text: "You need to log in to access this page.",
            icon: "warning",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "login.html"; // Redirect to login page
        });
    }






    const token = localStorage.getItem("token");

    // Load all orders for staff
    function loadAllOrders() {


        Swal.fire({
            title: "Loading Orders...",
            text: "Please wait while orders are being fetched.",
            icon: "info",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: "http://localhost:8080/api/v1/orders/all",
            type: "GET",
            dataType: "json",
            headers: { Authorization: "Bearer " + token },
            success: function (response) {
                Swal.close(); // Close loading alert
                $("#order-table-body").empty();

                if (Array.isArray(response) && response.length > 0) {
                    response.forEach(order => {
                        let statusBadge = getStatusBadge(order.status);

                        const orderRow = `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.customerName || "N/A"}</td>
                            <td>${order.bookTitle || "N/A"}</td>
                            <td>${order.quantity || 0}</td>
                            <td>$${(order.totalPrice || 0).toFixed(2)}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <button class="btn btn-outline-info btn-sm" onclick="viewOrderDetails(${order.id})">
                                    <i class="fa fa-eye"></i> View
                                </button>
                                <button class="btn btn-outline-primary btn-sm" onclick="openUpdateStatusModal(${order.id})">
                                    <i class="fa fa-edit"></i> Update
                                </button>
                            </td>
                        </tr>
                    `;
                        $("#order-table-body").append(orderRow);
                    });
                } else {
                    $("#order-table-body").html("<tr><td colspan='7' class='text-center text-muted'>No orders found.</td></tr>");
                }
            },
            error: function (err) {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load orders. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        });
    }

    //  Helper function to get status badge
    function getStatusBadge(status) {
        switch (status) {
            case "PENDING":
                return `<span class="badge bg-warning text-dark">PENDING</span>`;
            case "SHIPPED":
                return `<span class="badge bg-success">SHIPPED</span>`;
            case "CANCELLED":
                return `<span class="badge bg-danger">CANCELLED</span>`;
            default:
                return `<span class="badge bg-secondary">UNKNOWN</span>`;
        }
    }

    // View Order Details
    window.viewOrderDetails = function (orderId) {
        $.ajax({
            url: `http://localhost:8080/api/v1/orders/${orderId}`,
            type: "GET",
            dataType: "json",
            headers: { Authorization: "Bearer " + token },
            success: function (response) {
                if (response) {
                    // Populate modal with order details
                    $("#order-id-details").text(response.id);
                    $("#customer-name").text(response.customerName);
                    $("#book-title").text(response.bookTitle);
                    $("#order-quantity").text(response.quantity);
                    $("#total-price").text(response.totalPrice);
                    $("#order-status").text(response.status);

                    // Show the modal
                    $("#orderDetailsModal").modal("show");
                }
            },
            error: function (err) {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load order details.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        });
    };

    //  Open Update Status Modal
    window.openUpdateStatusModal = function (orderId) {
        $.ajax({
            url: `http://localhost:8080/api/v1/orders/${orderId}/status`,
            type: "GET",
            dataType: "json",
            headers: { Authorization: "Bearer " + token },
            success: function (response) {
                if (response) {
                    console.log("Order id response:", response.id);
                    $("#order-id-status").text(response.id);
                    $("#new-status").val(response.status); // Set current status in the select field
                    $("#updateStatusModal").modal("show");
                }
            },
            error: function (err) {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load order for status update.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        });
    };

    // Update Order Status
    $("#updateStatusBtn").on("click", function () {
        const orderId = $("#order-id-status").text();
        const newStatus = $("#new-status").val();

        Swal.fire({
            title: "Are you sure?",
            text: `You are about to update order #${orderId} to ${newStatus}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/v1/orders/${orderId}/status/${newStatus}`,
                    type: "PUT",
                    dataType: "json",
                    headers: { Authorization: "Bearer " + token },
                    success: function (response) {
                        Swal.fire({
                            title: "Updated!",
                            text: "Order status updated successfully.",
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                        $("#updateStatusModal").modal("hide");
                        loadAllOrders();
                    },
                    error: function (err) {
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to update order status.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                });
            }
        });
    });

    loadAllOrders();
});
