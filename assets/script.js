document.addEventListener('DOMContentLoaded', function () {
    // === Hamburger Menu and Mobile Navigation Logic ===
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const html = document.documentElement; // For scroll-padding-top

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            hamburgerMenu.querySelector('i').classList.toggle('fa-bars');
            hamburgerMenu.querySelector('i').classList.toggle('fa-times'); // Change icon to 'X'

            // Prevent body scrolling when mobile menu is open
            if (navLinks.classList.contains('active')) {
                body.style.overflowY = 'hidden';
                // Dynamically adjust scroll-padding-top for the fixed header
                // Calculate total height of top-bar and navbar for scroll-padding-top
                const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                html.style.scrollPaddingTop = `${topBarHeight + navbarHeight}px`;

            } else {
                body.style.overflowY = ''; // Restore scrolling
                html.style.scrollPaddingTop = '150px'; // Revert to default for desktop (or adjust as needed)
            }
        });
    }

    // === Mobile Dropdown/Submenu Toggle Logic ===
    // This makes the dropdowns and submenus toggle on click/tap on mobile, instead of hover
    const dropdowns = document.querySelectorAll('.nav-links .dropdown > a');
    const submenuDropdowns = document.querySelectorAll('.nav-links .dropdown-submenu > a');

    dropdowns.forEach(dropdownLink => {
        dropdownLink.addEventListener('click', function (event) {
            // Only activate this logic on smaller screens where the mobile menu is active
            // and the display property of .nav-links is not 'flex' (for desktop)
            const navLinksComputedStyle = window.getComputedStyle(navLinks);
            if (navLinksComputedStyle.display === 'flex' && window.innerWidth > 992) {
                // If navLinks is displayed as flex AND it's a large screen, let CSS hover handle it.
                // Do nothing here, allow default behavior (if it has an href)
                return;
            }

            const parentLi = this.closest('li.dropdown');
            if (parentLi) {
                event.preventDefault(); // Prevent default link navigation for the main dropdown
                // Toggle 'active' class on the parent <li> to show/hide its content
                parentLi.classList.toggle('active');

                // Close other open dropdowns at the same level
                document.querySelectorAll('.nav-links .dropdown.active').forEach(openDropdown => {
                    if (openDropdown !== parentLi) {
                        openDropdown.classList.remove('active');
                        // Also close any active submenus within this closed dropdown
                        openDropdown.querySelectorAll('.submenu-content.active').forEach(activeSub => {
                            activeSub.classList.remove('active');
                            activeSub.closest('.dropdown-submenu')?.classList.remove('active');
                        });
                    }
                });

                // For the dropdown arrow: find the arrow element inside this dropdownLink and toggle its rotation
                const arrow = this.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = parentLi.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });

    submenuDropdowns.forEach(submenuLink => {
        submenuLink.addEventListener('click', function (event) {
            // Similar check for mobile vs desktop behavior
            const navLinksComputedStyle = window.getComputedStyle(navLinks);
            if (navLinksComputedStyle.display === 'flex' && window.innerWidth > 992) {
                return;
            }

            const parentLi = this.closest('li.dropdown-submenu');
            if (parentLi) {
                event.preventDefault(); // Prevent default link navigation for the submenu link
                parentLi.classList.toggle('active');

                // Close other open submenus at the same level within this parent dropdown
                parentLi.closest('.dropdown-content').querySelectorAll('.dropdown-submenu.active').forEach(openSubmenu => {
                    if (openSubmenu !== parentLi) {
                        openSubmenu.classList.remove('active');
                    }
                });

                // For the submenu arrow: find the arrow element inside this submenuLink and toggle its rotation
                const arrow = this.querySelector('.submenu-arrow');
                if (arrow) {
                    arrow.style.transform = parentLi.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0deg)';
                }
            }
        });
    });


    // === Popup Modal Logic ===
    const consultationPopup = document.getElementById('consultation-popup');
    const closeBtn = document.querySelector('.close-btn');

    const popupShownKey = 'popupShown';
    const popupTimestampKey = 'popupTimestamp';
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check and reset 'popupShown' after 24 hours if timestamp exists
    const lastPopupTimestamp = localStorage.getItem(popupTimestampKey);
    if (lastPopupTimestamp) {
        if ((Date.now() - parseInt(lastPopupTimestamp)) > twentyFourHours) {
            localStorage.removeItem(popupShownKey);
            localStorage.removeItem(popupTimestampKey); // Clear both to ensure a fresh start
        }
    }

    // Show popup only if it hasn't been shown (or was reset after 24 hours)
    if (consultationPopup && !localStorage.getItem(popupShownKey)) {
        setTimeout(function () {
            if (consultationPopup) {
                consultationPopup.style.display = 'flex'; // Use flex to center with updated CSS
                localStorage.setItem(popupShownKey, 'true');
                localStorage.setItem(popupTimestampKey, Date.now().toString());
            }
        }, 3000); // Show popup after 3 seconds
    }

    // Close popup when 'x' button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            if (consultationPopup) {
                consultationPopup.style.display = 'none';
                // Ensure form section is visible if it was hidden by success message
                const popupFormSection = document.getElementById('consultation-form-section');
                if (popupFormSection) popupFormSection.style.display = 'block';
                const popupSuccessMessage = document.getElementById('consultation-success-message');
                if (popupSuccessMessage) popupSuccessMessage.style.display = 'none';
            }
        });
    }

    // Close popup when clicking outside the modal content
    if (consultationPopup) {
        window.addEventListener('click', function (event) {
            // Check if the click target is the overlay itself, not its children
            if (event.target === consultationPopup) {
                consultationPopup.style.display = 'none';
                // Ensure form section is visible if it was hidden by success message
                const popupFormSection = document.getElementById('consultation-form-section');
                if (popupFormSection) popupFormSection.style.display = 'block';
                const popupSuccessMessage = document.getElementById('consultation-success-message');
                if (popupSuccessMessage) popupSuccessMessage.style.display = 'none';
            }
        });
    }

    // === Universal Form Submission Handler ===
    // Function to display messages within the form
    function showFormMessage(formElement, message, isSuccess) {
        const messageDiv = formElement.querySelector('.form-message');
        // For popup form, use the specific success message div
        const popupSuccessDiv = document.getElementById('consultation-success-message');

        if (formElement.classList.contains('popup-form') && popupSuccessDiv) {
            // If it's the popup form and successful, show the dedicated success message
            if (isSuccess) {
                const popupFormSection = document.getElementById('consultation-form-section');
                if (popupFormSection) popupFormSection.style.display = 'none';
                popupSuccessDiv.style.display = 'block';
                popupSuccessDiv.textContent = message; // Update message content

                setTimeout(() => {
                    popupSuccessDiv.style.display = 'none';
                    if (consultationPopup) consultationPopup.style.display = 'none';
                    if (popupFormSection) popupFormSection.style.display = 'block'; // Reset form section for next open
                }, 5000);
            } else if (messageDiv) {
                // If it's the popup form but an error, use the general messageDiv for error
                messageDiv.textContent = message;
                messageDiv.style.color = 'red';
                messageDiv.style.display = 'block';
                messageDiv.style.fontWeight = 'bold';
                messageDiv.style.marginTop = '10px';
                messageDiv.style.marginBottom = '10px';

                setTimeout(() => {
                    messageDiv.textContent = '';
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        } else if (messageDiv) {
            // For other forms (like the main consultation form)
            messageDiv.textContent = message;
            messageDiv.style.color = isSuccess ? 'green' : 'red';
            messageDiv.style.display = 'block';
            messageDiv.style.fontWeight = 'bold';
            messageDiv.style.marginTop = '10px';
            messageDiv.style.marginBottom = '10px';

            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Google Apps Script Web App URL (This is YOUR Confirmed, Working URL)
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxrUjW7Lqr1yz_5Fq1Jtks6uFU9WGtPqr3vYQ4PJ4kB565yY4Ljl3qqHQgzKvTsLVhW/exec';

    // --- UPDATED FORM SUBMISSION LOGIC USING URLSearchParams ---
    // This function now handles both forms by extracting data manually
    // and sending it as 'application/x-www-form-urlencoded'
    async function submitForm(formElement) {
        const fullNameInput = formElement.querySelector('[name="fullName"]');
        const mobileNumberInput = formElement.querySelector('[name="mobileNumber"]');
        const sourceInput = formElement.querySelector('[name="source"]'); // The hidden input

        // Get values and trim whitespace
        const fullName = fullNameInput ? fullNameInput.value.trim() : '';
        const mobileNumber = mobileNumberInput ? mobileNumberInput.value.trim() : '';
        const source = sourceInput ? sourceInput.value.trim() : 'Unknown'; // Default if source not found

        // Basic client-side validation (optional, but good practice)
        if (!fullName || !mobileNumber) {
            showFormMessage(formElement, 'Please fill in your Full Name and Mobile Number.', false);
            return; // Stop if validation fails
        }

        // Create URLSearchParams object from the form fields
        // This is the key change to ensure data is correctly interpreted by Apps Script
        const params = new URLSearchParams();
        params.append('fullName', fullName);
        params.append('mobileNumber', mobileNumber);
        params.append('source', source);

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Essential for cross-origin Apps Script deployments
                headers: {
                    // CRITICAL: Explicitly set the content type for URL-encoded data
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString() // Send the URL-encoded string as the body
            });

            // Handle success message and form reset based on which form was submitted
            if (formElement.classList.contains('popup-form')) {
                // Now handled by showFormMessage function
                showFormMessage(formElement, 'Thank you! Your consultation request has been received.', true);
            } else { // This handles the main consultation form
                showFormMessage(formElement, 'Your booking request has been sent. We will contact you shortly!', true);
            }
            formElement.reset(); // Clear the form fields for both cases

        } catch (error) {
            console.error('Error submitting form (client-side fetch):', error);
            showFormMessage(formElement, 'There was a problem sending your request. Please try again later.', false);
        }
    }

    // Attach submit listener for the Popup Form
    const popupForm = document.querySelector('.popup-form');
    if (popupForm) {
        popupForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default browser form submission
            submitForm(popupForm); // Call our universal submit function
        });
    }

    // Attach submit listener for the Main Consultation Form
    const mainConsultationForm = document.querySelector('.consultation-form');
    if (mainConsultationForm) {
        mainConsultationForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default browser form submission
            submitForm(mainConsultationForm); // Call our universal submit function
        });
    }

    // === Testimonial Slider ===
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');
    const nextButton = document.querySelector('.next-testimonial');
    const prevButton = document.querySelector('.prev-testimonial');

    function showTestimonial(index) {
        if (testimonials.length === 0) return;
        testimonials.forEach(t => t.classList.remove('active'));
        testimonials[index].classList.add('active');
    }

    if (testimonials.length > 0) {
        showTestimonial(currentTestimonial);
    }
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }
    if (testimonials.length > 1) {
        setInterval(function () {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // === Gallery Filtering ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            galleryItems.forEach(item => {
                // Using flex for gallery grid, so toggle display based on filter
                item.style.display = (filterValue === 'all' || item.classList.contains(filterValue)) ? 'block' : 'none';
            });
        });
    });

    // === Image Slide Show (Hero Section) ===
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");
    const leftArrow = document.querySelector(".arrow.left");
    const rightArrow = document.querySelector(".arrow.right");

    function showSlide(index) {
        if (slides.length === 0) return;
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }
    function changeSlide(direction) {
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    if (slides.length > 0) {
        showSlide(currentSlide);
    }
    if (leftArrow) {
        leftArrow.addEventListener('click', () => changeSlide(-1));
    }
    if (rightArrow) {
        rightArrow.addEventListener('click', () => changeSlide(1));
    }
    if (slides.length > 1) {
        setInterval(() => changeSlide(1), 10000);
    }

    // === Search Functionality ===
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsOverlay = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');
    const treatmentKeywords = [
        { keyword: "infertility services", url: "infertility-services.html", description: "Comprehensive services for infertility diagnosis and treatment." },
        { keyword: "pre-marital assessment", url: "infertility-services.html#pre-martial-assesment", description: "Pre-marital fertility assessment and counselling for both partners." },
        { keyword: "ovulation induction", url: "infertility-services.html#ovulation-induction", description: "OI (Ovulation Induction) for enhancing egg release." },
        { keyword: "iui", url: "infertility-services.html#iui", description: "Intrauterine Insemination (IUI) procedures." },
        { keyword: "intrauterine insemination", url: "infertility-services.html#iui", description: "Intrauterine Insemination (IUI) procedures." },
        { keyword: "unexplained infertility", url: "infertility-services.html#unexplained-fertility", description: "Treatment for unexplained infertility." },
        { keyword: "pre-conception counselling", url: "infertility-services.html#pre-conception-counselling", description: "Pre-conception Counselling for future parents." },
        { keyword: "psychological counselling", url: "infertility-services.html#psychological-counselling", description: "Supportive psychological counselling services." },
        { keyword: "fertility evaluation", url: "infertility-services.html#fertility-evaluation", description: "Comprehensive fertility evaluation for individuals and couples." },
        { keyword: "ivf", url: "ivf-services.html#ivf", description: "In Vitro Fertilization (IVF) and advanced ART." },
        { keyword: "in vitro fertilization", url: "ivf-services.html#ivf", description: "In Vitro Fertilization (IVF) and advanced ART." },
        { keyword: "icsi", url: "ivf-services.html#icsi", description: "Intracytoplasmic Sperm Injection (ICSI) for male factor infertility." },
        { keyword: "intracytoplasmic sperm injection", url: "ivf-services.html#icsi", description: "Intracytoplasmic Sperm Injection (ICSI) for male factor infertility." },
        { keyword: "embryo freezing", url: "ivf-services.html#embryo-freezing", description: "Embryo freezing for future use." },
        { keyword: "frozen embryo transfer", url: "ivf-services.html#frozen-embryo-transfer", description: "FET (Frozen Embryo Transfer) procedures." },
        { keyword: "fresh embryo transfer", url: "ivf-services.html#fresh-embryo-transfer", description: "Fresh Embryo Transfer options." },
        { keyword: "sequential embryo transfer", url: "ivf-services.html#sequential-embryo-transfer", description: "Sequential Embryo Transfer techniques." },
        { keyword: "oocyte freezing", url: "ivf-services.html#oocyte-freezing", description: "OOCYTE freezing for fertility preservation." },
        { keyword: "sperm freezing", url: "ivf-services.html#sperm-freezing", description: "Sperm freezing for fertility preservation." },
        { keyword: "single embryo transfer", url: "ivf-services.html#single-embryo-transfer", description: "Single Embryo Transfer for reduced multiple pregnancy risks." },
        // Endoscopy Services
        { keyword: "endoscopy services", url: "endoscopy-services.html", description: "Advanced endoscopic procedures for fertility." },
        { keyword: "diagnostic hysteroscopy", url: "endoscopy-services.html#Diagnostic Hysteroscopy", description: "Diagnostic Hysteroscopy for uterine conditions." },
        { keyword: "diagnostic laparoscopy", url: "endoscopy-services.html#Diagnostic Laparoscopy", description: "Diagnostic Laparoscopy for pelvic conditions." },
        { keyword: "theraputic hysterolaparoscopy", url: "endoscopy-services.html#Theratapic Hysterolaprososcopy", description: "Therapeutic Hysterolaparoscopy for surgical interventions." },
        { keyword: "fibroids treatment", url: "endoscopy-services.html#fibriods", description: "Treatment for uterine fibroids." },
        { keyword: "pid treatment", url: "endoscopy-services.html#fibriods", description: "Treatment for Pelvic Inflammatory Disease (PID)." },
        { keyword: "hernia septum treatment", url: "endoscopy-services.html#fibriods", description: "Treatment for uterine septum." },
        { keyword: "post tubal ligation cases", url: "endoscopy-services.html#fibriods", description: "Treatment for post-tubal ligation cases." },
        { keyword: "endometriosis treatment", url: "endoscopy-services.html#fibriods", description: "Treatment for endometriosis." },
        { keyword: "ovarian cysts treatment", url: "endoscopy-services.html#fibriods", description: "Treatment for ovarian cysts." },
        // Male Infertility Services
        { keyword: "male infertility", url: "male-infertility-services.html", description: "Specialized services for male infertility." },
        { keyword: "semen analysis", url: "male-infertility-services.html#semen-analysis", description: "Detailed semen analysis for male fertility assessment." },
        { keyword: "dna fragmentation index", url: "male-infertility-services.html#dfi", description: "DNA Fragmentation Index (DFI) testing." },
        { keyword: "low sperm", url: "male-infertility-services.html#low-sperm", description: "Treatment for low sperm count." },
        { keyword: "low sperm motility", url: "male-infertility-services.html#low-sperm-evaluation", description: "Evaluation and treatment for low sperm motility and morphology." },
        { keyword: "azoospermia evaluation", url: "male-infertility-services.html#Azoospermia evaluation", description: "Evaluation for azoospermia (absence of sperm)." },
        { keyword: "macs", url: "male-infertility-services.html#macs", description: "Microfluidics and Magnetic Activated Cell Sorting (MACS) for sperm selection." },
        { keyword: "microfluidics activated cell sorting", url: "male-infertility-services.html#macs", description: "Microfluidics and Magnetic Activated Cell Sorting (MACS) for sperm selection." },
        { keyword: "tesa", url: "male-infertility-services.html#tesa", description: "Testicular Sperm Aspiration (TESA)." },
        { keyword: "testicular sperm aspiration", url: "male-infertility-services.html#tesa", description: "Testicular Sperm Aspiration (TESA)." },
        { keyword: "tese", url: "male-infertility-services.html#tese", description: "Testicular Sperm Extraction (TESE)." },
        { keyword: "testicular sperm extraction", url: "male-infertility-services.html#tese", description: "Testicular Sperm Extraction (TESE)." },
        { keyword: "micro tese", url: "male-infertility-services.html#micro-tese", description: "Micro TESE for advanced sperm retrieval." },
        // Advanced IVF Services
        { keyword: "advanced ivf services", url: "advanced-ivf-services.html", description: "Cutting-edge advanced IVF treatments." },
        { keyword: "blastocyst culture", url: "advanced-ivf-services.html#blastocyst-culture", description: "Blastocyst Culture for improved embryo selection." },
        { keyword: "endometrial receptivity array", url: "advanced-ivf-services.html#era", description: "Endometrial Receptivity Array (ERA) testing." },
        { keyword: "pgt", url: "advanced-ivf-services.html#pgt", description: "Pre-implantation Genetic Testing (PGT)." },
        { keyword: "pgt-a", url: "advanced-ivf-services.html#pgt", description: "Pre-implantation Genetic Testing for Aneuploidy (PGT-A)." },
        { keyword: "pgt-m", url: "advanced-ivf-services.html#pgt", description: "Pre-implantation Genetic Testing for Monogenic/Single Gene Defects (PGT-M)." },
        { keyword: "pgt-s", url: "advanced-ivf-services.html#pgt", description: "Pre-implantation Genetic Testing for Chromosomal Structural Rearrangements (PGT-S)." },
        { keyword: "assisted hatching", url: "advanced-ivf-services.html#assisted-hatching", description: "Assisted Hatching to aid embryo implantation." },
        { keyword: "ovarian prp", url: "advanced-ivf-services.html#ovarian-prp", description: "Ovarian PRP (Platelet-Rich Plasma) for low AMH." },
        { keyword: "endometrial prp", url: "advanced-ivf-services.html#endometrial-prp", description: "Endometrial PRP for thin endometrium." },
        { keyword: "stem cell therapy", url: "advanced-ivf-services.html#prp-stem-cell", description: "Stem Cell Therapy for fertility issues." },
        // Fertility Preservation
        { keyword: "fertility preservation", url: "fertility-preservation-services.html", description: "Options to preserve fertility for the future." },
        { keyword: "cancer patients", url: "fertility-preservation-services.html#cancer-patients", description: "Fertility preservation for cancer patients." },
        { keyword: "rheumatology patients", url: "fertility-preservation-services.html#Rheumatology", description: "Fertility preservation for Rheumatology and SLE (Lupus) patients." },
        { keyword: "sle patients", url: "fertility-preservation-services.html#Rheumatology", description: "Fertility preservation for SLE (Lupus) patients." },
        { keyword: "industrial workers", url: "fertility-preservation-services.html#Industrial", description: "Fertility preservation for industrial and coal mine workers." },
        { keyword: "coal mine workers", url: "fertility-preservation-services.html#Industrial", description: "Fertility preservation for industrial and coal mine workers." },
        { keyword: "delayed child bearing", url: "fertility-preservation-services.html#personal-reasons", description: "Fertility preservation for personal reasons (delayed childbearing)." },
        { keyword: "genetic conditions preservation", url: "fertility-preservation-services.html#Genetic conditions", description: "Fertility preservation for individuals with genetic conditions." },
        // Third-Party Reproduction
        { keyword: "third-party reproduction", url: "third-party-reproduction-services.html", description: "Options involving third-party reproduction." },
        { keyword: "donor egg", url: "third-party-reproduction-services.html#donor-egg", description: "Donor egg programs." },
        { keyword: "donor sperm", url: "third-party-reproduction-services.html#donor-sperm", description: "Donor sperm programs." },
        { keyword: "surrogacy", url: "third-party-reproduction-services.html#surrogacy", description: "Surrogacy services." },
        // Add more general keywords that might link to main sections
        { keyword: "about us", url: "about-dr.html", description: "Learn more about Dr. Poornima Fertility Centre." },
        { keyword: "contact", url: "index.html#book", description: "Contact us to book a consultation." },
        { keyword: "gallery", url: "gallery.html", description: "View our clinic and success stories in the gallery." },
        { keyword: "faq", url: "index.html#faq", description: "Frequently Asked Questions about fertility treatment." }
    ];

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (searchResultsContent) { // Null check for safety
            searchResultsContent.innerHTML = ''; // Clear previous results
        }

        if (query === "") {
            if (searchResultsOverlay) { // Null check for safety
                searchResultsOverlay.style.display = 'none'; // Hide if search is empty
                searchResultsOverlay.removeAttribute('aria-live'); // Remove aria-live when hidden
            }
            return;
        }

        const filteredResults = treatmentKeywords.filter(item =>
            item.keyword.includes(query)
        );

        if (filteredResults.length > 0) {
            if (searchResultsOverlay) { // Null check for safety
                searchResultsOverlay.style.display = 'block'; // Show results overlay
                searchResultsOverlay.setAttribute('aria-live', 'polite'); // For accessibility
            }
            filteredResults.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');

                // Determine if it's an internal anchor on the *current page* or a link to another page/external
                const isCurrentPageAnchor = window.location.pathname.endsWith(result.url.split('#')[0]) && result.url.includes('#');

                resultItem.innerHTML = `
                    <h3><a href="${result.url}" ${isCurrentPageAnchor ? 'data-internal-link="true"' : 'target="_self"'} >${result.keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</a></h3>
                    <p>${result.description}</p>
                    <a href="${result.url}" class="learn-more-link" ${isCurrentPageAnchor ? 'data-internal-link="true"' : 'target="_self"'}>Learn More</a>
                `;
                if (searchResultsContent) { // Null check for safety
                    searchResultsContent.appendChild(resultItem);
                }
            });
        } else {
            if (searchResultsOverlay) { // Null check for safety
                searchResultsOverlay.style.display = 'block'; // Show overlay even for no match
                searchResultsOverlay.setAttribute('aria-live', 'polite'); // For accessibility
            }
            if (searchResultsContent) { // Null check for safety
                searchResultsContent.innerHTML = '<p class="no-match-found">No matching treatments found. Please try a different keyword.</p>';
            }
        }
    }

    // Attach to 'input' event for live search
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    // Keep 'click' event for the button
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    // Keep 'keypress' for Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Close search results when clicking outside or pressing Escape
    document.addEventListener('click', function (event) {
        // Check if the click is outside the search input, button, and results overlay
        const isClickInsideSearch = (searchInput && searchInput.contains(event.target)) ||
            (searchButton && searchButton.contains(event.target)) ||
            (searchResultsOverlay && searchResultsOverlay.contains(event.target));

        if (!isClickInsideSearch && searchResultsOverlay) {
            searchResultsOverlay.style.display = 'none';
            searchResultsOverlay.removeAttribute('aria-live'); // Remove aria-live when hidden
        }
    });

    // Close results when an internal link within the search results is clicked
    if (searchResultsContent) {
        searchResultsContent.addEventListener('click', function (event) {
            const targetLink = event.target.closest('a[data-internal-link="true"]');
            if (targetLink) {
                if (searchResultsOverlay) { // Null check for safety
                    searchResultsOverlay.style.display = 'none'; // Hide results
                    searchResultsOverlay.removeAttribute('aria-live'); // Remove aria-live when hidden
                }
                // If it's an internal anchor on the current page, scroll to it
                if (targetLink.getAttribute('href').startsWith('#')) {
                    const targetId = targetLink.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        event.preventDefault(); // Prevent default link behavior if scrolling manually
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Optional: Update URL hash for direct linking/bookmarking
                        window.location.hash = targetId;
                    }
                }
                // For external pages (like .html files), the default link behavior will handle navigation
            }
        });
    }

    // Close search results with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && searchResultsOverlay) {
            searchResultsOverlay.style.display = 'none';
            searchResultsOverlay.removeAttribute('aria-live'); // Remove aria-live when hidden
        }
    });

    // Ensure initial state of search results is hidden if script loads after page content
    if (searchResultsOverlay) { // Null check for safety
        searchResultsOverlay.style.display = 'none';
        searchResultsOverlay.removeAttribute('aria-live'); // Ensure it's not live when hidden initially
    }

    // === FAQ Accordion Logic (Moved from index.html) ===
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            question.classList.toggle('active');
            answer.classList.toggle('active');
        });
    });

}); // Final closing tag for document.addEventListener('DOMContentLoaded')
