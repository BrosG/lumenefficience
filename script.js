document.addEventListener('DOMContentLoaded', function() {
    
    // --- Mobile Menu Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('is-open');
        });
    }
    if (closeMenu && mobileMenu) {
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('is-open');
        });
    }

    // --- Countdown Timer ---
    const countdownEls = {
        days: document.getElementById("days"),
        hours: document.getElementById("hours"),
        minutes: document.getElementById("minutes"),
        seconds: document.getElementById("seconds"),
        container: document.querySelector(".countdown-container")
    };
    
    if (countdownEls.container && countdownEls.days) { // Check if countdown elements exist
        const countdownDate = new Date("Jan 1, 2026 00:00:00").getTime();
        const countdownTimer = setInterval(function() {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(countdownTimer);
                countdownEls.container.innerHTML = "<h3>L'opportunité du financement à 100% est terminée.</h3>";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownEls.days.innerHTML = String(days).padStart(2, '0');
            countdownEls.hours.innerHTML = String(hours).padStart(2, '0');
            countdownEls.minutes.innerHTML = String(minutes).padStart(2, '0');
            countdownEls.seconds.innerHTML = String(seconds).padStart(2, '0');
        }, 1000);
    }

    // --- CEE Financing Calculator ---
    const luminairesSliderReplace = document.getElementById('luminairesSliderReplace');
    const luminairesValueInputReplace = document.getElementById('luminairesValueInputReplace');
    const luminairesSliderCreate = document.getElementById('luminairesSliderCreate');
    const luminairesValueInputCreate = document.getElementById('luminairesValueInputCreate');
    const totalBenefitEl = document.getElementById('totalBenefit');

    // Only run calculator code if the elements exist on the page
    if (luminairesSliderReplace && totalBenefitEl) {
        const config = {
            newPower: 250,
            ceeMultiplier: 0.0075,
            avgCeeRate: 70
        };

        function calculateAndDisplay() {
            const numToReplace = parseInt(luminairesValueInputReplace.value, 10) || 0;
            const numToCreate = parseInt(luminairesValueInputCreate.value, 10) || 0;
            const totalLuminaires = numToReplace + numToCreate;
            
            // HEROIC FIX: The division by 1000 was incorrect for this formula's multipliers.
            // This is the original, correct calculation logic.
            const ceeKwhCumac = totalLuminaires * config.newPower * config.avgCeeRate;
            const ceeSubsidyValue = ceeKwhCumac * config.ceeMultiplier;

            animateValue(totalBenefitEl, ceeSubsidyValue, '€');
            if (typeof updateContactLinks === "function") {
                updateContactLinks(); // Update links whenever calculation changes
            }
        }

        function animateValue(element, end, suffix) {
            let start = parseFloat(element.textContent.replace(/[^0-9.-]+/g, "")) || 0;
            if (start === end) return;
            const duration = 800;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * (end - start) + start);
                element.textContent = `${currentValue.toLocaleString('fr-FR')} ${suffix}`;
                if (progress < 1) { 
                    window.requestAnimationFrame(step); 
                }
            };
            window.requestAnimationFrame(step);
        }
        
        function setupInputSync(slider, input) {
            slider.addEventListener('input', () => {
                input.value = slider.value;
                calculateAndDisplay();
            });

            input.addEventListener('input', () => {
                let value = parseInt(input.value, 10);
                const min = parseInt(slider.min, 10);
                const max = parseInt(slider.max, 10);
                if (isNaN(value)) { value = min; }
                if (value < min) { value = min; }
                if (value > max) { value = max; }
                
                input.value = value;
                slider.value = value;
                calculateAndDisplay();
            });
        }

        setupInputSync(luminairesSliderReplace, luminairesValueInputReplace);
        setupInputSync(luminairesSliderCreate, luminairesValueInputCreate);
        
        // Initial calculation on page load
        calculateAndDisplay();
    }

    // --- Dynamic Contact Link Generation ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) { // Only run if the contact form exists
        const formElements = {
            company: document.getElementById('companyName'),
            name: document.getElementById('contactName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            message: document.getElementById('message'), // For contact page
            luminairesReplace: document.getElementById('luminairesValueInputReplace'),
            luminairesCreate: document.getElementById('luminairesValueInputCreate'),
            prime: document.getElementById('totalBenefit'),
            whatsappLink: document.getElementById('whatsapp-link'),
            emailLink: document.getElementById('email-link')
        };
        
        const WHATSAPP_NUMBER = '33612520977';
        const EMAIL_ADDRESS = 'hafid@aitech-france.com';
        
        window.updateContactLinks = function() {
            const company = formElements.company.value || '[Société non précisée]';
            const name = formElements.name.value || '[Nom non précisé]';
            const email = formElements.email.value || '[Email non précisé]';
            const phone = formElements.phone.value || '[Téléphone non précisé]';
            let projectDetails = '';

            // Add calculator details if they exist on the page
            if (formElements.luminairesReplace && formElements.prime) {
                projectDetails = `\n- Points lumineux à remplacer: ${formElements.luminairesReplace.value}\n- Points lumineux à créer: ${formElements.luminairesCreate.value}\n- Prime CEE totale estimée: ${formElements.prime.textContent}`;
            }
            // Add message if it exists
            if (formElements.message && formElements.message.value) {
                projectDetails += `\n- Message: ${formElements.message.value}`;
            }

            const whatsappMessage = `Bonjour,\nJe souhaite valider mon projet d'éclairage à 0€.\nVoici les détails :\n- Société: ${company}\n- Nom: ${name}\n- Email: ${email}\n- Téléphone: ${phone}${projectDetails}\n\nPouvez-vous me recontacter ?\nMerci.`;
            const emailSubject = `Validation projet éclairage 0€ - ${company}`;
            const emailBody = `Bonjour,\nJe souhaite valider mon projet d'éclairage à 0€.\n\nVoici les informations concernant mon projet et mes coordonnées :\n--------------------------------------------------\n- Société: ${company}\n- Nom du contact: ${name}\n- Email: ${email}\n- Téléphone: ${phone}${projectDetails.replace(/-/g, '\n-')}\n--------------------------------------------------\n\nMerci de me contacter.\n\nCordialement,\n${name}`;

            if (formElements.whatsappLink) {
                formElements.whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
            }
            if (formElements.emailLink) {
                formElements.emailLink.href = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            }
        }

        contactForm.addEventListener('input', window.updateContactLinks);
        
        // Initial update on page load
        window.updateContactLinks();
    }
});