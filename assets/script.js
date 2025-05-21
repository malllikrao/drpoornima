document.addEventListener('DOMContentLoaded', function () {
    // === Popup Modal Logic ===
    if (!localStorage.getItem('popupShown')) {
        setTimeout(function () {
            document.getElementById('consultation-popup').style.display = 'block';
            localStorage.setItem('popupShown', 'true');
            localStorage.setItem('popupTimestamp', Date.now().toString());
        }, 3000);
    }

    const lastPopupTime = localStorage.getItem('popupTimestamp');
    if (lastPopupTime && (Date.now() - parseInt(lastPopupTime)) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('popupShown');
    }

    document.querySelector('.close-btn').addEventListener('click', function () {
        document.getElementById('consultation-popup').style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === document.getElementById('consultation-popup')) {
            document.getElementById('consultation-popup').style.display = 'none';
        }
    });
    
    document.querySelector('.popup-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Form submitted successfully!');
        document.getElementById('consultation-popup').style.display = 'none';
    });

    // === Testimonial Slider ===
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');

    function showTestimonial(index) {
        testimonials.forEach(t => t.classList.remove('active'));
        testimonials[index].classList.add('active');
    }

    showTestimonial(currentTestimonial);

    const nextButton = document.querySelector('.next-testimonial');
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }

    const prevButton = document.querySelector('.prev-testimonial');
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }

    setInterval(function () {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);

    // === Gallery Filtering ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            galleryItems.forEach(item => {
                item.style.display = (filterValue === 'all' || item.classList.contains(filterValue)) ? 'block' : 'none';
            });
        });
    });

    // === Image Slide Show ===
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }

    function changeSlide(direction) {
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    showSlide(currentSlide);

    // Optional: bind changeSlide(-1/1) to prev/next buttons if you have them
});
