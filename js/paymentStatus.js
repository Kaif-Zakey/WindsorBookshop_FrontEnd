$(document).ready(function () {
    // Load payment status
    function loadPaymentStatus() {
        $.ajax({
            url: "/api/payments/status",  // Backend API endpoint for payment status
            type: "GET",
            success: function (data) {
                const paymentStatusContainer = $("#payment-status-list");
                paymentStatusContainer.empty();
                if (data.length > 0) {
                    data.forEach(payment => {
                        const paymentHtml = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Payment for Order #${payment.orderId}</h5>
                                    <p class="card-text">Amount: $${payment.amount}</p>
                                    <p class="card-text">Status: ${payment.paymentStatus}</p>
                                    <p class="card-text">Date: ${payment.paymentDate}</p>
                                </div>
                            </div>
                        `;
                        paymentStatusContainer.append(paymentHtml);
                    });
                } else {
                    paymentStatusContainer.append('<p>No payment details found.</p>');
                }
            },
            error: function (error) {
                console.error("Error fetching payment status:", error);
            }
        });
    }

    // Call function to load payment status
    loadPaymentStatus();
});
