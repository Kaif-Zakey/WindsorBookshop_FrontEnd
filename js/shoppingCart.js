const token = localStorage.getItem("token");
const userId = localStorage.getItem("id");

if (!token) {
    Swal.fire({
        title: "Session Expired!",
        text: "Please log in again.",
        icon: "warning",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK"
    }).then(() => {
        window.location.href = "login.html";
    });
}

$(document).ready(() => {
    loadCartItems();

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


    function loadCartItems() {
        $.ajax({
            url: `http://localhost:8080/api/v1/cart/${userId}`,
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: (cartData) => {
                const cartItemsContainer = $("#cart-items");
                let totalPrice = 0;

                cartItemsContainer.empty();

                if (cartData && cartData.length) {
                    cartData.forEach(item => {
                        totalPrice += item.book.price * item.quantity;

                        cartItemsContainer.append(`
                            <tr>
                                <td>
                                    <img src="http://localhost:8080/api/v1/books/${item.book.id}/image" alt="${item.book.title}" width="50" />
                                    ${item.book.title}
                                </td>
                                <td>$${item.book.price.toFixed(2)}</td>
                                <td>
                                    <input type="number" class="form-control item-quantity" data-id="${item.id}" value="${item.quantity}" min="1" />
                                </td>
                                <td>${item.book.quantity}</td>
                                <td>$${(item.book.price * item.quantity).toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">❌ Remove</button>
                                </td>
                            </tr>
                        `);
                        localStorage.setItem("qty", item.book.quantity);
                    });
                } else {
                    cartItemsContainer.html("<tr><td colspan='5' class='text-center'>Your cart is empty.</td></tr>");
                }

                $("#total-price").text(totalPrice.toFixed(2));
            },
            error: (error) => {
                console.error("Error fetching cart items:", error);
                Swal.fire("Error!", "Failed to load cart items. Please try again.", "error");
            }
        });
    }

    $(document).on("change", ".item-quantity", function () {
        const cartItemId = $(this).data("id");
        const newQuantity = parseInt($(this).val(), 10);
        const availableStock = parseInt(localStorage.getItem("qty"), 10);

        if (newQuantity <= availableStock) {
            $.ajax({
                url: `http://localhost:8080/api/v1/cart/${cartItemId}/update`,
                type: "PUT",
                data: { quantity: newQuantity },
                headers: { Authorization: "Bearer " + token },
                success: () => {
                    loadCartItems();
                    Swal.fire({
                        title: "Quantity Updated!",
                        text: "Cart quantity updated successfully.",
                        icon: "success",
                        confirmButtonColor: "#28a745"
                    });
                },
                error: (error) => {
                    console.error("Error updating quantity:", error);
                    Swal.fire("Error!", "Failed to update quantity. Please try again.", "error");
                }
            });
        } else {
            Swal.fire({
                title: "Invalid Quantity!",
                text: "Selected quantity exceeds available stock.",
                icon: "warning",
                confirmButtonColor: "#d33"
            });
            $(this).val(availableStock);
        }
    });

    $(document).on("click", ".remove-item", function () {
        const cartItemId = $(this).data("id");

        Swal.fire({
            title: "Remove Item?",
            text: "Are you sure you want to remove this item from the cart?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, remove it"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/v1/cart/${cartItemId}/remove`,
                    type: "DELETE",
                    headers: { Authorization: "Bearer " + token },
                    success: () => {
                        loadCartItems();
                        Swal.fire("Removed!", "Item has been removed from your cart.", "success");
                    },
                    error: (error) => {
                        console.error("Error removing item:", error);
                        Swal.fire("Error!", "Failed to remove item. Please try again.", "error");
                    }
                });
            }
        });
    });

    window.clearCart = () => {
        Swal.fire({
            title: "Clear Cart?",
            text: "Are you sure you want to clear your entire cart?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, clear it"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/v1/cart/clear/${userId}`,
                    type: "DELETE",
                    headers: { Authorization: "Bearer " + token },
                    success: () => {
                        loadCartItems();
                        Swal.fire("Cart Cleared!", "Your cart has been emptied.", "success");
                    },
                    error: (error) => {
                        console.error("Error clearing the cart:", error);
                        Swal.fire("Error!", "Failed to clear cart. Please try again.", "error");
                    }
                });
            }
        });
    };

    window.checkout = () => {
        const totalPrice = parseFloat($("#total-price").text());

        if (totalPrice > 0) {
            window.location.href = "checkout.html";
        } else {
            Swal.fire({
                title: "Cart is Empty!",
                text: "Add items to your cart before checking out.",
                icon: "info",
                confirmButtonColor: "#3085d6"
            });
        }
    };
});
