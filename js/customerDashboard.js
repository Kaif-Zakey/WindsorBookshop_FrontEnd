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


    loadBooks();
    fetchCategoriesForCustomer();

    // Function to load books based on category and sort filter
    function loadBooks(categoryId = "", sortBy = "default") {
        let url = "http://localhost:8080/api/v1/books";
        if (categoryId) {
            url = `http://localhost:8080/api/v1/books/category/${categoryId}`;
        }

        $.ajax({
            url: url,
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: (data) => {
                let bookContainer = $("#books-list");
                bookContainer.empty();

                if (data && data.length) {
                    if (sortBy === "price-low") {
                        data.sort((a, b) => a.price - b.price);
                    } else if (sortBy === "price-high") {
                        data.sort((a, b) => b.price - a.price);
                    } else if (sortBy === "title") {
                        data.sort((a, b) => a.title.localeCompare(b.title));
                    }

                    data.forEach(book => {
                        bookContainer.append(`
                            <div class="col-md-4 mb-4">
                                <div class="card shadow-sm">
                                    <img src="http://localhost:8080/api/v1/books/${book.id}/image" class="card-img-top" alt="${book.title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${book.title}</h5>
                                        <p class="text-muted">${book.categoryName || "Unknown"}</p>
                                        <p class="card-text"><strong>$${book.price.toFixed(2)}</strong></p>
                                        <button class="btn btn-success add-to-cart" data-id="${book.id}" data-title="${book.title}" data-price="${book.price}">🛒 Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    bookContainer.html("<p class='text-center'>No books available.</p>");
                }
            },
            error: (error) => {
                console.error("Error fetching books:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load books. Please try again later.",
                    icon: "error",
                    confirmButtonColor: "#d33"
                });
            }
        });
    }

    // Fetching categories for the filter dropdown
    function fetchCategoriesForCustomer() {
        $.ajax({
            url: "http://localhost:8080/api/v1/category/getAll",
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: (response) => {
                const categoryDropdown = $("#category-filter");
                categoryDropdown.empty().append(`<option value="">📂 All Categories</option>`);

                if (response.data.length > 0) {
                    response.data.forEach((category) => {
                        categoryDropdown.append(`<option value="${category.id}">${category.name}</option>`);
                    });
                } else {
                    categoryDropdown.append(`<option disabled>No categories available</option>`);
                }
            },
            error: (err) => {
                console.error("Error fetching categories:", err);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load categories. Please try again.",
                    icon: "error",
                    confirmButtonColor: "#d33"
                });
            }
        });
    }

    // Search functionality: Filtering books based on the title
    $("#search-input").on("keyup", function () {
        let searchTerm = $(this).val().toLowerCase();
        $(".card").each(function () {
            let title = $(this).find(".card-title").text().toLowerCase();
            $(this).toggle(title.includes(searchTerm));
        });
    });

    // Handling category and sort filter changes
    $("#category-filter, #sort-filter").change(function () {
        loadBooks($("#category-filter").val(), $("#sort-filter").val());
    });

    // Add book to cart
    $(document).on("click", ".add-to-cart", function () {
        const bookId = $(this).data("id");
        const title = $(this).data("title");
        const price = $(this).data("price");

        $.ajax({
            url: "http://localhost:8080/api/v1/cart/add",
            type: "POST",
            headers: { Authorization: "Bearer " + token },
            data: {
                userId: userId,
                bookId: bookId,
                quantity: 1
            },
            success: (data) => {
                Swal.fire({
                    title: "Added to Cart!",
                    text: `"${title}" has been added to your cart.`,
                    icon: "success",
                    confirmButtonColor: "#28a745",
                    timer: 2000
                });
                updateCartCount();
            },
            error: (error) => {
                console.error("Error adding to cart:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to add to cart. Please try again.",
                    icon: "error",
                    confirmButtonColor: "#d33"
                });
            }
        });
    });

    // Update cart count in the navigation bar
    function updateCartCount() {
        $.ajax({
            url: `http://localhost:8080/api/v1/cart/${userId}`,
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: (cartData) => {
                const cartCount = cartData ? cartData.length : 0;
                $("#cart-count").text(cartCount);
            },
            error: (error) => {
                console.error("Error fetching cart:", error);
            }
        });
    }

    // Initialize the cart count on page load
    updateCartCount();

    // Logout functionality with confirmation
    $("#logout-btn").click(() => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, logout!"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("id");
                window.location.href = "index.html";
            }
        });
    });
});
