$(document).ready(function () {
    // Load order tracking information
    function loadOrderTracking() {
        $.ajax({
            url: "/api/orders/tracking",  // Backend API endpoint for order tracking
            type: "GET",
            success: function (data) {
                const orderTrackingContainer = $("#order-tracking-list");
                orderTrackingContainer.empty();
                if (data.length > 0) {
                    data.forEach(order => {
                        const orderTrackingHtml = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Order #${order.id}</h5>
                                    <p class="card-text">Status: ${order.status}</p>
                                    <p class="card-text">Shipped Date: ${order.shippedDate}</p>
                                    <p class="card-text">Estimated Delivery: ${order.estimatedDelivery}</p>
                                </div>
                            </div>
                        `;
                        orderTrackingContainer.append(orderTrackingHtml);
                    });
                } else {
                    orderTrackingContainer.append('<p>No orders found for tracking.</p>');
                }
            },
            error: function (error) {
                console.error("Error fetching order tracking information:", error);
            }
        });
    }

    // Call function to load order tracking information
    loadOrderTracking();
});
