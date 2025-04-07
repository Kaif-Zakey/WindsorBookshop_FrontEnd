const token = localStorage.getItem("token");

if (!token) {
    Swal.fire({
        title: "Session Expired",
        text: "Please log in again.",
        icon: "warning",
        confirmButtonText: "OK"
    }).then(() => {
        window.location.href = "login.html";
    });
}

$(document).ready(() => {
    initializeDashboard();

    // 🟢 AUTHOR MANAGEMENT
    $("#add-author-form").submit(function (e) {
        e.preventDefault();
        addAuthor();
    });

    $("#author-table-body").on("click", ".delete-author", function () {
        deleteAuthor($(this).data("id"));
    });

    $("#author-table-body").on("click", ".edit-author", function () {
        loadAuthorForEdit($(this).data("id"));
    });

    $("#edit-author-form").submit(function (e) {
        e.preventDefault();
        updateAuthor($("#edit-author-id").val());
    });

    // 🟢 BOOK MANAGEMENT
    $("#add-book-form").submit(function (e) {
        e.preventDefault();
        addBook();
    });

    $("#book-table-body").on("click", ".delete-book", function () {
        deleteBook($(this).data("id"));
    });
});

function initializeDashboard() {
    fetchCategories();
    fetchAuthors();
    fetchBooks();
    loadPendingReviews();
    fetchBookCount();
    fetchTotalOrders();
    fetchTotalAuthors();
    fetchPendingOrdersCount();
}


// UPDATE AUTHOR
function updateAuthor(authorId) {
    const authorData = {
        id: authorId,
        name: $("#edit-author-name").val(),
        bio: $("#edit-author-bio").val(),
        country: $("#edit-author-country").val(),
    };

    $.ajax({
        url: `http://localhost:8080/api/v1/author/update`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(authorData),
        headers: { Authorization: "Bearer " + token },
        success: () => {
            Swal.fire("Success", "Author updated successfully!", "success");
            $("#edit-author-form")[0].reset();
            $("#edit-author-modal").modal("hide");
            fetchAuthors();
        },
        error: (err) => {
            console.error("Error updating author:", err);
            Swal.fire("Error", "Failed to update author.", "error");
        }
    });
}

// LOAD AUTHOR FOR EDIT
function loadAuthorForEdit(authorId) {
    $.ajax({
        url: `http://localhost:8080/api/v1/author/get/${authorId}`,
        type: "GET",
        dataType: "json",
        headers: { Authorization: "Bearer " + token },
        success: (response) => {
            if (response.code === 200 && response.data) {
                const author = response.data;
                $("#edit-author-id").val(author.id);
                $("#edit-author-name").val(author.name);
                $("#edit-author-bio").val(author.bio);
                $("#edit-author-country").val(author.country);
                $("#edit-author-modal").modal("show");
            } else {
                Swal.fire("Error", "Failed to load author details.", "error");
            }
        },
        error: (err) => {
            console.error("Error loading author:", err);
            Swal.fire("Error", "Error loading author details.", "error");
        }
    });
}

function fetchAuthors() {
    $.ajax({
        url: "http://localhost:8080/api/v1/author/getAll",
        type: "GET",
        dataType: "json",
        headers: { Authorization: "Bearer " + token },
        success: (response) => {
            const tableBody = $("#author-table-body");
            const authorDropdown = $("#book-author");
            const editAuthorDropdown = $("#edit-book-author");
            tableBody.empty();
            authorDropdown.empty().append(`<option value="">Select Author</option>`);

            if (response.code === 200 && response.data.length > 0) {
                response.data.forEach((author) => {
                    tableBody.append(`
                        <tr>
                            <td>${author.id}</td>
                            <td>${author.name}</td>
                            <td>${author.bio}</td>
                            <td>${author.country}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-author" data-id="${author.id}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-author" data-id="${author.id}">Delete</button>
                            </td>
                        </tr>
                    `);
                    authorDropdown.append(`<option value="${author.id}">${author.name}</option>`);
                    editAuthorDropdown.append(`<option value="${author.id}">${author.name}</option>`);
                });
            } else {
                tableBody.append(`<tr><td colspan="5" class="text-center">No authors found.</td></tr>`);
            }
        },
        error: (err) => console.error("Error fetching authors:", err),
    });
}

// ADD AUTHOR
function addAuthor() {
    const name = $("#author-name").val();
    const bio = $("#author-bio").val();
    const country = $("#author-country").val();

    // Validation: Name should not contain numbers
    if (/\d/.test(name)) {
        $("#author-name").css("border", "2px solid red");
        $("#name-error").text("Name should not contain numbers").css("color", "red");
        return;
    } else {
        $("#author-name").css("border", ""); // Reset border
        $("#name-error").text(""); // Clear error message
    }

    const authorData = { name, bio, country };

    $.ajax({
        url: "http://localhost:8080/api/v1/author/save",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(authorData),
        headers: { Authorization: "Bearer " + token },
        success: () => {
            Swal.fire({
                title: "Success!",
                text: "Author added successfully!",
                icon: "success",
                confirmButtonText: "OK",
            });
            $("#add-author-form")[0].reset();
            fetchAuthors();
        },
        error: (err) => {
            Swal.fire({
                title: "Error!",
                text: "Failed to add author. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
            console.error("Error adding author:", err);
        },
    });
}

//DELETE AUTHOR
function deleteAuthor(authorId) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/api/v1/author/delete/${authorId}`,
                type: "DELETE",
                headers: { Authorization: "Bearer " + token },
                success: () => {
                    Swal.fire("Deleted!", "Author deleted successfully!", "success");
                    fetchAuthors();
                },
                error: () => {
                    Swal.fire("Error!", "Failed to delete author.", "error");
                },
            });
        }
    });
}



// get all CATEGORIES
function fetchCategories() {
    $.ajax({
        url: "http://localhost:8080/api/v1/category/getAll",
        type: "GET",
        dataType: "json",
        headers: { Authorization: "Bearer " + token },
        success: (response) => {
            const tableBody = $("#category-table-body");
            const categoryDropdown = $("#book-category");
            const editCategoryDropdown = $("#edit-book-category");
            tableBody.empty();
            categoryDropdown.empty().append('<option value="">Select Category</option>'); // Reset dropdown


            if (response.code === 200 && response.data.length > 0) {
                response.data.forEach((category) => {
                    tableBody.append(`
                        <tr>
                            <td>${category.id}</td>
                            <td class="category-name">${category.name}</td> <!-- ✅ Add class for search -->
                            <td>
                                <button class="btn btn-warning btn-sm edit-category" data-id="${category.id}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-category" data-id="${category.id}">Delete</button>
                            </td>
                        </tr>
                    `);
                    categoryDropdown.append(`<option value="${category.id}">${category.name}</option>`);
                    editCategoryDropdown.append(`<option value="${category.id}">${category.name}</option>`);
                });
            } else {
                tableBody.append(`<tr><td colspan="3" class="text-center">No categories found</td></tr>`);

            }
        },
        error: (err) => console.error("Error fetching categories:", err),
    });
}

// load edit category model
$(document).on("click", ".edit-category", function () {
    const id = $(this).data("id");

    $.ajax({
        url: `http://localhost:8080/api/v1/category/get/${id}`,
        type: "GET",
        dataType: "json",
        headers: { Authorization: "Bearer " + token },
        success: (response) => {
            if (response.code === 200) {
                $("#edit-category-id").val(response.data.id);
                $("#edit-category-name").val(response.data.name);
                $("#editCategoryModal").modal("show");
            } else {
                Swal.fire("Error", "Category not found.", "error");
            }
        },
        error: (err) => {
            console.error("Error fetching category:", err);
            Swal.fire("Error", "Failed to fetch category details.", "error");
        },
    });
});

// Update category
$("#edit-category-form").on("submit", function (e) {
    e.preventDefault();
    const categoryId = $("#edit-category-id").val();
    const updatedName = $("#edit-category-name").val().trim();

    if (!updatedName) {
        Swal.fire("Warning", "Category name cannot be empty.", "warning");
        return;
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/category/${categoryId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ name: updatedName }),
        headers: { Authorization: "Bearer " + token },
        success: () => {
            Swal.fire("Success", "Category updated successfully!", "success");
            $("#editCategoryModal").modal("hide");
            fetchCategories();
        },
        error: (err) => {
            console.error("Error updating category:", err);
            Swal.fire("Error", "Failed to update category.", "error");
        },
    });
});

//Search for my categories
$("#search-category").on("input", function () {
    let searchText = $(this).val().toLowerCase();
    $("#category-table-body tr").each(function () {
        let categoryName = $(this).find(".category-name").text().toLowerCase();
        $(this).toggle(categoryName.includes(searchText));
    });
});

// save category management
$("#add-category-form").submit(function (e) {
    e.preventDefault();
    const categoryData = { name: $("#category-name").val() };

    $.ajax({
        url: "http://localhost:8080/api/v1/category/save",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(categoryData),
        headers: { Authorization: "Bearer " + token },
        success: () => {
            Swal.fire("Success", "Category added successfully!", "success");
            $("#add-category-form")[0].reset();
            $("#addCategoryModel").modal("hide");
            fetchCategories();
        },
        error: (err) => {
            console.error("Error adding category:", err);
            Swal.fire("Error", "Failed to add category.", "error");
        },
    });
});

// delete CATEGORY
$(document).on("click", ".delete-category", function () {
    const categoryId = $(this).data("id");

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/api/v1/category/${categoryId}`,
                type: "DELETE",
                headers: { Authorization: "Bearer " + token },
                success: (response) => {
                    Swal.fire("Deleted!", response.message, "success");
                    fetchCategories();
                },
                error: (err) => {
                    Swal.fire("Error!", err.responseJSON?.message || "Cannot delete this category.", "error");
                },
            });
        }
    });
});




// FETCH BOOKS
function fetchBooks() {

    $.ajax({
        url: "http://localhost:8080/api/v1/books",
        type: "GET",
        headers: {
            Authorization: "Bearer " + token,
        },
        success: (response) => {

            const bookTableBody = $("#book-table-body");
            bookTableBody.empty();
            response.forEach(book => {
                const bookRow = `
                    <tr>
                        <td>${book.id}</td>
                        <td>${book.title}</td>
                        <td>${book.authors ? book.authors.name : 'N/A'}</td> 
                        <td>${book.price}</td>
                        <td>${book.quantity}</td>
                        <td>
                            ${book.imageData ?
                    `<img src="http://localhost:8080/api/v1/books/${book.id}/image" alt="${book.title} image" width="50">` :
                    'No Image'
                }
                        </td>
                        <td>
                            <button class="btn btn-warning" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                        </td>
                    </tr>
                `;
                bookTableBody.append(bookRow);
            });
        },
        error: (err) => {
            console.error("Error fetching books:", err);
            alert("Failed to fetch books.");
        }
    });
}

// ADD BOOK
function addBook() {

    const formData = new FormData();

    formData.append('title', $("#book-title").val());
    formData.append('price', $("#book-price").val());
    formData.append('quantity', $("#book-quantity").val());

    formData.append('authorId', $("#book-author").val());
    formData.append('categoryId', $("#book-category").val());


    const imageFile = $("#book-image")[0].files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }


    Swal.fire({
        title: "Adding Book...",
        text: "Please wait while the book is being added.",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });


    $.ajax({
        url: "http://localhost:8080/api/v1/books/add",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        headers: { Authorization: "Bearer " + token },
        success: (response) => {
            Swal.fire({
                title: "Success!",
                text: "Book added successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                $("#add-book-form")[0].reset();
                $("#addBookModal").modal("hide");
                fetchBooks();
            });
        },
        error: (err) => {
            Swal.fire({
                title: "Error!",
                text: "Failed to add book. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
            console.error("Error adding book:", err);
        }
    });
}


// 🟢 DELETE BOOK
function deleteBook(bookId) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/api/v1/books/${bookId}`,
                type: "DELETE",
                headers: { Authorization: "Bearer " + token },
                success: () => {
                    Swal.fire("Deleted!", "Book deleted successfully!", "success");
                    fetchBooks();
                },
                error: () => {
                    Swal.fire("Error!", "Failed to delete book.", "error");
                }
            });
        }
    });
}

// Open edit modal with book details
function editBook(bookId) {
    // Fetch the book details using the book ID
    $.ajax({
        url: `http://localhost:8080/api/v1/books/${bookId}`,
        type: "GET",
        headers: { Authorization: "Bearer " + token },
        success: (book) => {
            // Populate the modal with book details
            $("#edit-book-id").val(book.id);
            $("#edit-book-title").val(book.title);
            $("#edit-book-price").val(book.price);
            $("#edit-book-quantity").val(book.quantity);
            $("#edit-book-author").val(book.authorId);  // Set the author ID
            $("#edit-book-category").val(book.categoryId);  // Set the category ID

            // Show the edit modal
            $("#editBookModal").modal("show");
        },
        error: (err) => {
            console.error("Error fetching book details:", err);
            alert("Failed to fetch book details.");
        }
    });
}


// Update book details
function updateBook() {
    const formData = new FormData();
    formData.append('id', $("#edit-book-id").val());
    formData.append('title', $("#edit-book-title").val());
    formData.append('authorId', $("#edit-book-author").val());
    formData.append('categoryId', $("#edit-book-category").val());
    formData.append('price', $("#edit-book-price").val());
    formData.append('quantity', $("#edit-book-quantity").val());

    const imageFile = $("#edit-book-image")[0].files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this book?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/api/v1/books/update`,
                type: "PUT",
                processData: false,
                contentType: false,
                data: formData,
                headers: { Authorization: "Bearer " + token },
                success: (response) => {
                    Swal.fire("Updated!", "Book updated successfully!", "success");
                    $("#edit-book-form")[0].reset();
                    $("#editBookModal").modal("hide");
                    fetchBooks();
                },
                error: (err) => {
                    console.error("Error updating book:", err);
                    Swal.fire("Error!", "Failed to update book.", "error");
                }
            });
        }
    });
}


function loadPendingReviews() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/reviews/pending',
        type: 'GET',
        headers: { Authorization: 'Bearer ' + token },
        success: function (reviews) {
            const reviewsTableBody = $('#review-table-body');
            reviewsTableBody.empty(); // Clear existing rows

            reviews.forEach(function (review) {
                const row = `
                    <tr>
                        <td>${review.id}</td>
                        <td>${review.bookTitle}</td>
                        <td>${review.userName}</td>
                        <td>${review.rating}</td>
                        <td>${review.comment}</td>
                        <td>
                            <button class="btn btn-success" onclick="approveReview(${review.id})">Approve</button>
                            <button class="btn btn-danger" onclick="rejectReview(${review.id})">Reject</button>
                        </td>
                    </tr>
                `;
                reviewsTableBody.append(row);
            });
        },
        error: function (error) {
            console.error('Error fetching reviews:', error);
        }
    });
}
function approveReview(reviewId) {
    $.ajax({
        url: `http://localhost:8080/api/v1/reviews/approve/${reviewId}`,
        method: "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        success: function () {
            Swal.fire("Approved!", "Review has been approved.", "success");
            loadPendingReviews();
        },
        error: function () {
            Swal.fire("Error!", "Failed to approve review.", "error");
        }
    });
}

function rejectReview(reviewId) {
    $.ajax({
        url: `http://localhost:8080/api/v1/reviews/reject/${reviewId}`,
        method: "DELETE",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        success: function () {
            Swal.fire("Rejected!", "Review has been rejected.", "success");
            loadPendingReviews();
        },
        error: function () {
            Swal.fire("Error!", "Failed to reject review.", "error");
        }
    });
}

function fetchBookCount() {
    $.ajax({
        url: "http://localhost:8080/api/v1/books/count", // Adjust URL if necessary
        method: "GET",
        success: function (count) {
            $("#total-books").text(count);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching book count:", error);
        }
    });
}

function fetchTotalOrders() {
    $.ajax({
        url: "http://localhost:8080/api/v1/orders/count",
        type: "GET",
        success: function (data) {
            $("#total-orders").text(data);
        },
        error: function () {
            $("#total-orders").text("Error");
        }
    });
}

function fetchTotalAuthors() {
    $.ajax({
        url: "http://localhost:8080/api/v1/author/count",
        type: "GET",
        success: function (data) {
            $("#total-authors").text(data);
        },
        error: function () {
            $("#total-authors").text("Error");
        }
    });
}

function fetchPendingOrdersCount() {
    $.ajax({
        url: "http://localhost:8080/api/v1/orders/count/pending",
        type: "GET",
        success: function (count) {
            $("#pending-orders").text(count);
        },
        error: function () {
            $("#pending-orders").text("Error");
        }
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.container > div');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}


function fetchMessageCount() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/message/getAll', // Endpoint for getting all messages
        type: 'GET',
        success: function(messages) {
            const count = messages.length;

            if (count > 0) {
                $('#message-count').text(count).show();
            } else {
                $('#message-count').hide(); // Hide if no messages
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching message count:', error);
        }
    });
}

// Run when page loads
$(document).ready(function() {
    setInterval(fetchMessageCount, 30000); // 30 seconds
    fetchMessageCount();
});



document.addEventListener('DOMContentLoaded', function () {
    showSection('staff-dashboard');
});

