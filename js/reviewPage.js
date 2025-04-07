$(document).ready(function () {
    // Load user reviews
    function loadReviews() {
        $.ajax({
            url: "/api/reviews",  // Backend API endpoint for reviews
            type: "GET",
            success: function (data) {
                const reviewsContainer = $("#reviews-list");
                reviewsContainer.empty();
                if (data.length > 0) {
                    data.forEach(review => {
                        const reviewHtml = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">${review.book.title}</h5>
                                    <p class="card-text">Rating: ${review.rating}/5</p>
                                    <p class="card-text">Comment: ${review.comment}</p>
                                </div>
                            </div>
                        `;
                        reviewsContainer.append(reviewHtml);
                    });
                } else {
                    reviewsContainer.append('<p>No reviews found.</p>');
                }
            },
            error: function (error) {
                console.error("Error fetching reviews:", error);
            }
        });
    }

    // Call function to load reviews
    loadReviews();
});
