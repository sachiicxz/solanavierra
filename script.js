// Open and Close Modal
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const bookingModal = document.getElementById('bookingModal');

openModal.addEventListener('click', function () {
    bookingModal.style.display = 'flex';
});

closeModal.addEventListener('click', function () {
    bookingModal.style.display = 'none';
});

window.addEventListener('click', function (e) {
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
    }
});


//calendar script
const unavailableDates = ["2025-05-15", "2025-05-17", "2025-05-22", "2025-05-25"];

flatpickr("#appointment", {
    dateFormat: "Y-m-d h:i K", // Format for 12-hour time + AM/PM
    enableTime: true,
    time_24hr: false, // Switch to 12-hour format
    minTime: "09:00",
    maxTime: "20:00",
    minDate: "today",
    disable: unavailableDates,
    minuteIncrement: 15,

    onDayCreate: function (_, __, ___, dayElem) {
        const date = dayElem.dateObj?.toISOString().split("T")[0];
        if (!date) return;

        if (unavailableDates.includes(date)) {
            dayElem.classList.add("unavailable");
        } else {
            dayElem.classList.add("available");
        }
    },

    onChange: function (selectedDates) {
        if (selectedDates.length) {
            const date = selectedDates[0];
            const formattedDate = date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            document.getElementById("appointment-confirmation").textContent =
                `Appointment schedule: 
                ${formattedDate} at ${formattedTime}`;
        }
    }
});




//animation on scroll
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.header-content, .features, .feature, .text-title, .text-paragraph, .room-info, .amenities-list div, .services-list div, .nearby-list, .reviews');

    elements.forEach((element) => {
        if (isInViewport(element)) {
            element.classList.add('animate-on-scroll');
        }
    });
}

animateOnScroll();

window.addEventListener('scroll', animateOnScroll);


//guesst script
const guestCountEl = document.getElementById('guest-count');
const btnMinus = document.querySelector('.btn-minus');
const btnPlus = document.querySelector('.btn-plus');
const guestAlert = document.getElementById('guest-alert');

let guestCount = 1;
const minGuests = 1;
const maxGuests = 5;

function updateButtons() {
    btnMinus.disabled = guestCount <= minGuests;
    btnPlus.disabled = guestCount >= maxGuests;

    if (guestCount >= maxGuests) {
        guestAlert.textContent = '! Maximum number of guests is 5.';
        guestAlert.style.display = 'block';
    } else {
        guestAlert.style.display = 'none';
    }
}

btnPlus.addEventListener('click', () => {
    if (guestCount < maxGuests) {
        guestCount++;
        guestCountEl.textContent = guestCount;
        updateButtons();
    }
});

btnMinus.addEventListener('click', () => {
    if (guestCount > minGuests) {
        guestCount--;
        guestCountEl.textContent = guestCount;
        updateButtons();
    }
});

updateButtons(); // Initialize state

//review modal
document.addEventListener("DOMContentLoaded", () => {
    const badWords = ["wtf", "horrible", "awful", "sucks", "terrible"];
    const reviewForm = document.getElementById("reviewForm");
    const reviewList = document.getElementById("reviewList");
    const stars = document.querySelectorAll("#starRating .bi");
    const ratingInput = document.getElementById("reviewRating");
    const reviewModalEl = document.getElementById("reviewModal");
    const reviewModal = new bootstrap.Modal(reviewModalEl);
    const successAlert = document.getElementById("reviewSuccessAlert");
    const currentUser = { name: "Jane Doe" };

    function censorText(text) {
        return badWords.reduce((acc, word) => {
            const regex = new RegExp(word, "gi");
            return acc.replace(regex, match => "*".repeat(match.length));
        }, text);
    }

    function saveReview(review) {
        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.push(review);
        localStorage.setItem("reviews", JSON.stringify(reviews));
    }

    document.addEventListener("DOMContentLoaded", () => {
        const reviewList = document.getElementById("reviewList");

        function loadReviews(limit = 4) {
            const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviewList.innerHTML = "";

        let row = null;
            reviews.slice(0, limit).forEach((review, index) => {
                if (index % 2 === 0) {
            row = document.createElement("div");
        row.className = "row mb-3";
        reviewList.appendChild(row);
                }

        const col = document.createElement("div");
        col.className = "col-md-6";
        col.innerHTML = `
        <div class="review-card shadow-sm p-3">
            <h6>${review.name}</h6>
            <div class="text-warning mb-2">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p>${review.comment}</p>
        </div>
        `;
        row.appendChild(col);
            });

            if (reviews.length > limit) {
                const btnRow = document.createElement("div");
        btnRow.className = "text-center mt-4";
        btnRow.innerHTML = `
        <a href="reviews.html" class="btn btn-outline-primary">View All Reviews</a>
        `;
        reviewList.appendChild(btnRow);
            }
        }

        loadReviews();
    });


    // Star click
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = parseInt(star.dataset.value);
            ratingInput.value = value;
            stars.forEach((s, i) => {
                s.className = i < value ? "bi bi-star-fill" : "bi bi-star";
            });
        });
    });

    // Form submission
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const rating = parseInt(ratingInput.value);
        const comment = censorText(document.getElementById("reviewText").value.trim());
        const isAnon = document.getElementById("anonymousCheck").checked;
        const name = isAnon ? "Anonymous" : currentUser.name;

        if (!rating || !comment) {
            alert("Please provide both a rating and a review.");
            return;
        }

        const review = { name, rating, comment };
        saveReview(review);
        loadReviews();

        reviewForm.querySelector(".modal-body-content").classList.add("d-none");
        reviewForm.querySelector(".confirmation-message").classList.remove("d-none");

        setTimeout(() => {
            reviewModal.hide();
        }, 1000);
    });

    reviewModalEl.addEventListener("hidden.bs.modal", () => {
        reviewForm.reset();
        ratingInput.value = "";
        stars.forEach(s => s.className = "bi bi-star");
        reviewForm.querySelector(".modal-body-content").classList.remove("d-none");
        reviewForm.querySelector(".confirmation-message").classList.add("d-none");

        successAlert.classList.remove("d-none");
        setTimeout(() => successAlert.classList.add("d-none"), 3000);
    });

    loadReviews(); // Initial load
});



