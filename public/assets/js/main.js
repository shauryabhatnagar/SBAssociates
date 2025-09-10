// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navToggle) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    }
});

// Enhanced navbar scroll effect with debouncing
const debouncedScrollHandler = debounce(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Handling (only if form exists)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Keep preventDefault to handle via JavaScript
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        
        // Convert FormData to object for validation
        for (let [key, value] of formData.entries()) {
            if (key !== '_gotcha' && key !== '_subject' && key !== '_autoresponse' && key !== '_template') {
                formObject[key] = value;
            }
        }
        
        // Basic form validation
        const requiredFields = ['name', 'email', 'practice-area', 'message'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!formObject[field] || formObject[field].trim() === '') {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formObject.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Check honeypot field for spam protection
        if (formData.get('_gotcha')) {
            return; // Silent fail for spam bots
        }
        
        // Show loading state
        const submitButton = this.querySelector('.form-submit');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Submit to Formspree
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                showNotification('Thank you for your consultation request! We will contact you within 24 hours. You will also receive a confirmation email shortly.', 'success');
                this.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwnProperty.call(data, 'errors')) {
                        showNotification('There was a problem with your submission: ' + data.errors.map(error => error.message).join(', '), 'error');
                    } else {
                        showNotification('There was a problem submitting your form. Please try again or call us directly.', 'error');
                    }
                });
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showNotification('There was a problem submitting your form. Please try again or call us directly at +91 98111 01476.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    // Add animation keyframes if not already present
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loading');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Property Services specific initialization
function initializePropertyServices() {
    const propertyServiceCards = document.querySelectorAll('.property-services .service-area-card');
    
    propertyServiceCards.forEach(card => {
        // Ensure cards are visible
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = 'block';
        card.style.visibility = 'visible';
        
        // Add loading class for consistency
        card.classList.add('loading');
    });
    
    // Ensure grid is properly displayed
    const propertyServicesGrid = document.querySelector('.property-services .services-grid');
    if (propertyServicesGrid) {
        propertyServicesGrid.style.display = 'grid';
        propertyServicesGrid.style.visibility = 'visible';
    }
}

// Initialize animations and page features on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize property services if on property-banking page
    if (window.location.pathname.includes('property-banking')) {
        initializePropertyServices();
    }
    
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(`
        .service-card, .practice-card, .team-content, 
        .milestone, .step, .consultation-info, .service-area-card
    `);
    
    // Set initial state for animated elements - but skip service-area-cards on property-banking page
    animatedElements.forEach(el => {
        // Skip animation setup for service-area-cards on property-banking page
        if (el.classList.contains('service-area-card') && window.location.pathname.includes('property-banking')) {
            return;
        }
        
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Ensure all service area cards are visible (backup)
    const allServiceAreaCards = document.querySelectorAll('.service-area-card');
    allServiceAreaCards.forEach(card => {
        if (!card.style.opacity || card.style.opacity === '0') {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.visibility = 'visible';
        }
    });
    
    // Set active navigation link based on current page
    setActiveNavLink();
    
    // Initialize scroll to top functionality
    initializeScrollToTop();
});

// Set active navigation link
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        // Match current page with nav links
        if (href === currentPath || 
           (currentPath === '/' && href === '/') ||
           (currentPath.includes('about') && href.includes('about')) ||
           (currentPath.includes('practice-areas') && href === '/practice-areas/') ||
           (currentPath.includes('clients') && href.includes('clients')) ||
           (currentPath.includes('contact') && href.includes('contact'))) {
            link.classList.add('active');
        }
    });
}

// Scroll to top functionality
function initializeScrollToTop() {
    let scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.id = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '↑';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        document.body.appendChild(scrollToTopBtn);
    }
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Track external links for analytics (when implemented)
document.addEventListener('click', (e) => {
    if (e.target.href && 
        (e.target.href.includes('linkedin.com') || 
         e.target.href.includes('instagram.com') || 
         e.target.href.includes('maps.') || 
         e.target.href.includes('wa.me'))) {
        
        // Analytics tracking can be added here when GA is implemented
    }
});

// Track brochure downloads
document.addEventListener('click', (e) => {
    if (e.target.href && e.target.href.includes('brochure')) {
        // Analytics tracking can be added here when GA is implemented
    }
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Safe element operation helper
function safeElementOperation(selector, operation) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        elements.forEach(operation);
    }
}

// Practice Areas Dropdown Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create dropdown functionality for Practice Areas
    initializePracticeAreasDropdown();
});

function initializePracticeAreasDropdown() {
    const practiceAreasLink = document.querySelector('.nav-link[href*="practice-areas"]');
    
    if (practiceAreasLink) {
        // Create dropdown structure
        const dropdownHTML = `
            <div class="nav-dropdown">
                <a href="/practice-areas/" class="nav-link dropdown-trigger">
                    Practice Areas
                    <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </a>
                <div class="dropdown-menu">
                    <a href="/practice-areas/" class="dropdown-item main-link">All Practice Areas</a>
                    <div class="dropdown-divider"></div>
                    <a href="/practice-areas/arbitration" class="dropdown-item">Arbitration & ADR</a>               
                    <a href="/practice-areas/litigation" class="dropdown-item">Civil & Criminal Litigation</a>
                    <a href="/practice-areas/corporate-law" class="dropdown-item">Corporate & Commercial Law</a>
                    <a href="/practice-areas/family-consumer" class="dropdown-item">Family & Consumer Law</a>
                    <a href="/practice-areas/property-banking" class="dropdown-item">Property & Banking Law</a>
                </div>
            </div>
        `;
        
        // Replace the existing practice areas link with dropdown
        const parentLi = practiceAreasLink.parentElement;
        parentLi.innerHTML = dropdownHTML;
        
        // Add dropdown event listeners
        const dropdown = parentLi.querySelector('.nav-dropdown');
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Show dropdown on hover
        dropdown.addEventListener('mouseenter', () => {
            menu.classList.add('show');
            trigger.classList.add('active');
        });
        
        // Hide dropdown on mouse leave
        dropdown.addEventListener('mouseleave', () => {
            menu.classList.remove('show');
            trigger.classList.remove('active');
        });
        
        // Handle mobile touch events
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                menu.classList.toggle('show');
                trigger.classList.toggle('active');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                menu.classList.remove('show');
                trigger.classList.remove('active');
            }
        });
    }
}

// Update mobile menu close functionality to handle dropdowns
const originalCloseMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
        // Also close any open dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
            trigger.classList.remove('active');
        });
    }
};

// Update existing nav link click handlers
document.querySelectorAll('.dropdown-item').forEach(link => {
    link.addEventListener('click', originalCloseMenu);
});

// Enhanced Intersection Observer for Corporate Page Elements
document.addEventListener('DOMContentLoaded', () => {
    initializeEnhancedAnimations();
    initializePracticeCardInteractions();
    initializeServiceHighlights();
    initializeScrollProgress();
});

// Enhanced animations for practice area pages
function initializeEnhancedAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    };

    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations for better visual effect
                setTimeout(() => {
                    entry.target.classList.add('loading');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    // Enhanced selector for corporate page elements
    const animatedElements = document.querySelectorAll(`
        .practice-card, 
        .process-step, 
        .advantage-item, 
        .client-category,
        .practice-specialties,
        .overview-content
    `);
    
    // Set initial state and observe
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        enhancedObserver.observe(el);
    });
}

// Interactive practice card enhancements
function initializePracticeCardInteractions() {
    const practiceCards = document.querySelectorAll('.practice-card');
    
    practiceCards.forEach(card => {
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            
            // Highlight related services
            const relatedCards = document.querySelectorAll('.practice-card');
            relatedCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px)';
            
            // Reset all cards
            const relatedCards = document.querySelectorAll('.practice-card');
            relatedCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
            });
        });
        
        // Click tracking for analytics (when implemented)
        card.addEventListener('click', function(e) {
            const cardTitle = this.querySelector('.practice-title')?.textContent;
            if (cardTitle) {
                // Analytics tracking placeholder
                
                // Smooth scroll to top of clicked card if it's a detailed view
                if (e.target.closest('.practice-link')) {
                    e.preventDefault();
                    const targetHref = e.target.getAttribute('href');
                    if (targetHref && !targetHref.startsWith('http')) {
                        window.location.href = targetHref;
                    }
                }
            }
        });
    });
}

// Service highlights functionality
function initializeServiceHighlights() {
    const specialtyLists = document.querySelectorAll('.practice-specialties ul li');
    
    specialtyLists.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'var(--gray-100)';
            this.style.borderLeftColor = 'var(--primary)';
            this.style.borderLeftWidth = '4px';
            this.style.paddingLeft = '1.25rem';
            this.style.transition = 'all 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.borderLeftColor = 'transparent';
            this.style.borderLeftWidth = '0';
            this.style.paddingLeft = '1.5rem';
        });
    });
}

// Scroll progress indicator for long pages
function initializeScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--accent), var(--primary));
        z-index: 9999;
        transition: width 0.1s ease;
        opacity: 0;
    `;
    document.body.appendChild(progressBar);
    
    // Show progress bar on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
        
        // Show progress bar
        if (scrollTop > 200) {
            progressBar.style.opacity = '1';
        } else {
            progressBar.style.opacity = '0';
        }
        
        // Hide after scroll stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.pageYOffset > 200) {
                progressBar.style.opacity = '0.3';
            }
        }, 1000);
    });
}

// Enhanced contact form handling for practice area pages
function initializePracticeAreaForms() {
    const practiceAreaForms = document.querySelectorAll('.practice-contact-form');
    
    practiceAreaForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const practiceArea = document.querySelector('.page-title')?.textContent || 'Unknown';
            
            // Add practice area context to form data
            formData.append('practice-area-context', practiceArea);
            formData.append('page-url', window.location.href);
            
            // Enhanced form validation
            const requiredFields = ['name', 'email', 'message'];
            const missingFields = [];
            
            requiredFields.forEach(field => {
                const value = formData.get(field);
                if (!value || value.trim() === '') {
                    missingFields.push(field);
                }
            });
            
            if (missingFields.length > 0) {
                showNotification(
                    `Please fill in the following required fields: ${missingFields.join(', ')}`, 
                    'error'
                );
                return;
            }
            
            // Submit form (replace with actual endpoint)
            submitPracticeAreaForm(formData);
        });
    });
}

// Practice area specific form submission
function submitPracticeAreaForm(formData) {
    const submitButton = document.querySelector('.practice-contact-form .btn-primary');
    const originalText = submitButton?.textContent || 'Submit';
    
    if (submitButton) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
    }
    
    // Simulate API call (replace with actual implementation)
    setTimeout(() => {
        showNotification(
            'Thank you for your inquiry about our corporate law services. We will contact you within 24 hours to discuss your specific requirements.',
            'success'
        );
        
        document.querySelector('.practice-contact-form')?.reset();
        
        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
        
        // Track successful form submission
    }, 1500);
}

// Enhanced navigation highlighting for practice area pages
function highlightCurrentPracticeArea() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('active');
            
            // Also highlight parent Practice Areas link
            const practiceAreasLink = document.querySelector('.nav-link[href*="practice-areas"]');
            if (practiceAreasLink && !practiceAreasLink.classList.contains('dropdown-trigger')) {
                practiceAreasLink.classList.add('active');
            }
        }
    });
}

// Call enhanced navigation highlighting
document.addEventListener('DOMContentLoaded', highlightCurrentPracticeArea);

// Related services suggestion functionality
function initializeRelatedServices() {
    const currentPage = window.location.pathname;
    const relatedServicesMap = {
        'corporate-law': ['arbitration', 'bankruptcy'],
        'arbitration': ['corporate-law', 'litigation'],
        'sarfaesi': ['bankruptcy', 'litigation'],
        'bankruptcy': ['sarfaesi', 'corporate-law']
    };
    
    // Find current service
    let currentService = null;
    Object.keys(relatedServicesMap).forEach(service => {
        if (currentPage.includes(service)) {
            currentService = service;
        }
    });
    
    if (currentService && relatedServicesMap[currentService]) {
        displayRelatedServices(relatedServicesMap[currentService]);
    }
}

// Display related services (optional enhancement)
function displayRelatedServices(relatedServices) {
    const relatedSection = document.querySelector('.related-services');
    if (!relatedSection) return;
    
    const serviceNames = {
        'corporate-law': 'Corporate & Commercial Law',
        'arbitration': 'Arbitration & ADR',
        'sarfaesi': 'SARFAESI & Debt Recovery',
        'bankruptcy': 'Bankruptcy & Insolvency',
        'litigation': 'Civil & Criminal Litigation'
    };
    
    let relatedHTML = '<h3>Related Services</h3><div class="related-services-grid">';
    
    relatedServices.forEach(service => {
        relatedHTML += `
            <div class="related-service-card">
                <h4>${serviceNames[service] || service}</h4>
                <a href="${service}.html" class="related-service-link">Learn More</a>
            </div>
        `;
    });
    
    relatedHTML += '</div>';
    relatedSection.innerHTML = relatedHTML;
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    initializePracticeAreaForms();
    initializeRelatedServices();
});

// Keyboard accessibility enhancements
document.addEventListener('keydown', (e) => {
    // Skip to main content with keyboard shortcut
    if (e.altKey && e.key === 'm') {
        const mainContent = document.querySelector('main') || document.querySelector('.practice-overview');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Navigate between practice cards with arrow keys
    if (e.target.classList.contains('practice-card')) {
        const practiceCards = Array.from(document.querySelectorAll('.practice-card'));
        const currentIndex = practiceCards.indexOf(e.target);
        
        let nextIndex = currentIndex;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % practiceCards.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + practiceCards.length) % practiceCards.length;
        }
        
        if (nextIndex !== currentIndex) {
            practiceCards[nextIndex].focus();
            practiceCards[nextIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
});

// Performance optimization: Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate any viewport-dependent elements
        const practiceCards = document.querySelectorAll('.practice-card');
        practiceCards.forEach(card => {
            // Reset any inline styles that might break responsive design
            card.style.transform = '';
        });
    }, 250);
});

// ADR Page Specific JavaScript - Add to main.js

// Initialize ADR-specific features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('adr')) {
        initializeADRFeatures();
    }
});

// ADR page specific functionality
function initializeADRFeatures() {
    initializeCredentialHighlights();
    initializeADRAdvantagesAnimation();
    initializeCourtProgramsInteraction();
    initializeADRComparison();
}

// Enhanced credential item interactions
function initializeCredentialHighlights() {
    const credentialItems = document.querySelectorAll('.credential-item');
    
    credentialItems.forEach((item, index) => {
        // Stagger the initial animation
        item.style.animationDelay = `${index * 0.2}s`;
        
        item.addEventListener('mouseenter', function() {
            // Highlight the credential with enhanced effects
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.zIndex = '10';
            
            // Add glow effect
            this.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.2), 0 0 20px rgba(212, 175, 55, 0.1)';
            
            // Animate the icon
            const icon = this.querySelector('.advantage-icon');
            if (icon) {
                icon.style.transform = 'rotate(5deg) scale(1.1)';
                icon.style.background = 'linear-gradient(135deg, var(--primary), var(--accent))';
            }
            
            // Dim other credential items
            credentialItems.forEach(otherItem => {
                if (otherItem !== this) {
                    otherItem.style.opacity = '0.7';
                    otherItem.style.filter = 'blur(1px)';
                }
            });
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
            this.style.zIndex = '1';
            this.style.boxShadow = 'var(--shadow-lg)';
            
            const icon = this.querySelector('.advantage-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg) scale(1)';
                icon.style.background = 'linear-gradient(135deg, var(--accent), #b8941f)';
            }
            
            // Restore all items
            credentialItems.forEach(otherItem => {
                otherItem.style.opacity = '1';
                otherItem.style.filter = 'none';
            });
        });
        
        // Add click tracking for credentials
        item.addEventListener('click', function() {
            const credentialType = this.querySelector('h3')?.textContent;
            
            // Optional: Show detailed credential information
            showCredentialDetails(credentialType);
        });
    });
}

// Enhanced ADR advantages with progressive reveal
function initializeADRAdvantagesAnimation() {
    const advantageSteps = document.querySelectorAll('.advantage-step');
    
    // Create intersection observer for progressive animation
    const advantageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('advantage-revealed');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    
                    // Animate the step number
                    const stepNumber = entry.target.querySelector('.step-number');
                    if (stepNumber) {
                        stepNumber.style.animation = 'pulse 1s ease-in-out';
                    }
                }, index * 200);
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px' 
    });
    
    advantageSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(50px) scale(0.9)';
        step.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        advantageObserver.observe(step);
        
        // Add hover interaction
        step.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, var(--accent), var(--primary))';
            this.style.color = 'var(--white)';
            
            const stepNumber = this.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.style.background = 'var(--white)';
                stepNumber.style.color = 'var(--primary)';
                stepNumber.style.transform = 'scale(1.2)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%)';
            this.style.color = 'var(--text)';
            
            const stepNumber = this.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.style.background = 'var(--white)';
                stepNumber.style.color = 'var(--primary)';
                stepNumber.style.transform = 'scale(1)';
            }
        });
    });
}

// Court programs interaction enhancement
function initializeCourtProgramsInteraction() {
    const programCategories = document.querySelectorAll('.adr-programs .client-category');
    
    programCategories.forEach(category => {
        const listItems = category.querySelectorAll('.client-list li');
        
        category.addEventListener('mouseenter', function() {
            // Highlight the entire category
            this.style.background = 'linear-gradient(135deg, var(--white), var(--gray-50))';
            this.style.borderLeftWidth = '6px';
            
            // Animate list items
            listItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transform = 'translateX(10px)';
                    item.style.background = 'var(--gray-50)';
                }, index * 100);
            });
        });
        
        category.addEventListener('mouseleave', function() {
            this.style.background = 'var(--white)';
            this.style.borderLeftWidth = '4px';
            
            listItems.forEach(item => {
                item.style.transform = 'translateX(0)';
                item.style.background = 'transparent';
            });
        });
        
        // Track program category interactions
        category.addEventListener('click', function() {
            const programType = this.querySelector('.client-category-title')?.textContent;
        });
    });
}

// ADR vs Litigation comparison feature
function initializeADRComparison() {
    // Create a floating comparison tooltip
    const comparisonData = {
        'Time Efficiency': {
            adr: '6-12 months average',
            litigation: '3-5 years average',
            savings: '70% time reduction'
        },
        'Cost Effective': {
            adr: '₹2-5 lakhs typical',
            litigation: '₹10-25 lakhs typical',
            savings: '60-80% cost reduction'
        },
        'Confidentiality': {
            adr: 'Completely private',
            litigation: 'Public court records',
            savings: '100% confidentiality'
        }
    };
    
    const advantageSteps = document.querySelectorAll('.advantage-step');
    
    advantageSteps.forEach(step => {
        const title = step.querySelector('h3')?.textContent;
        if (comparisonData[title]) {
            step.addEventListener('click', function(e) {
                e.preventDefault();
                showADRComparison(title, comparisonData[title]);
            });
            
            // Add cursor pointer to indicate clickability
            step.style.cursor = 'pointer';
            step.setAttribute('title', 'Click to see detailed comparison');
        }
    });
}

// Show detailed credential information
function showCredentialDetails(credentialType) {
    const credentialDetails = {
        'DIAC Appointed Arbitrator': {
            description: 'Delhi International Arbitration Centre appointed arbitrator with expertise in commercial disputes',
            qualifications: ['Delhi High Court appointment', 'Commercial arbitration expertise', 'Institutional arbitration experience'],
            cases: 'Handled 50+ arbitration cases'
        },
        'Delhi High Court Certified': {
            description: 'Certified mediator trained in Delhi High Court mediation center',
            qualifications: ['40-hour mediation training', 'Court-connected mediation', 'Family and commercial mediation'],
            cases: 'Successfully mediated 100+ disputes'
        },
        'International Recognition': {
            description: 'Recognized expertise in international arbitration and cross-border disputes',
            qualifications: ['International arbitration rules', 'Cross-border enforcement', 'Multi-jurisdictional disputes'],
            cases: 'International arbitration experience'
        }
    };
    
    const details = credentialDetails[credentialType];
    if (details) {
        showNotification(
            `${credentialType}: ${details.description}. ${details.cases}.`,
            'info'
        );
    }
}

// Show ADR vs Litigation comparison
function showADRComparison(advantage, data) {
    const comparisonHTML = `
        <div class="comparison-popup">
            <h4>${advantage} Comparison</h4>
            <div class="comparison-grid">
                <div class="comparison-item adr-item">
                    <strong>ADR Process</strong>
                    <p>${data.adr}</p>
                </div>
                <div class="comparison-item litigation-item">
                    <strong>Traditional Litigation</strong>
                    <p>${data.litigation}</p>
                </div>
                <div class="comparison-savings">
                    <strong>Your Benefit</strong>
                    <p>${data.savings}</p>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal (simplified version)
    const modal = document.createElement('div');
    modal.className = 'adr-comparison-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--white);
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        margin: 2rem;
        position: relative;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    content.innerHTML = comparisonHTML + `
        <button class="close-comparison" style="
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-light);
        ">&times;</button>
        <style>
            .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
            .comparison-savings { grid-column: 1/-1; text-align: center; background: var(--accent); color: var(--white); padding: 1rem; border-radius: 8px; }
            .comparison-item { padding: 1rem; border-radius: 8px; }
            .adr-item { background: rgba(30, 58, 95, 0.1); }
            .litigation-item { background: rgba(239, 68, 68, 0.1); }
        </style>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        content.style.transform = 'scale(1)';
    }, 10);
    
    // Close functionality
    const closeBtn = content.querySelector('.close-comparison');
    const closeModal = () => {
        modal.style.opacity = '0';
        content.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Enhanced scroll progress for ADR page sections
function initializeADRScrollProgress() {
    const sections = [
        { element: '.practice-overview', name: 'Overview' },
        { element: '.adr-credentials', name: 'Credentials' },
        { element: '.practice-areas-grid', name: 'Services' },
        { element: '.adr-advantages', name: 'Advantages' },
        { element: '.adr-programs', name: 'Court Programs' }
    ];
    
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'adr-progress-indicator';
    progressIndicator.style.cssText = `
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        background: var(--white);
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        padding: 10px 5px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--gray-300);
            margin: 8px 0;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        `;
        dot.title = section.name;
        dot.addEventListener('click', () => {
            const targetElement = document.querySelector(section.element);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        progressIndicator.appendChild(dot);
    });
    
    document.body.appendChild(progressIndicator);
    
    // Show progress indicator on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            progressIndicator.style.opacity = '1';
        } else {
            progressIndicator.style.opacity = '0';
        }
        
        // Update active section
        const dots = progressIndicator.querySelectorAll('.progress-dot');
        sections.forEach((section, index) => {
            const element = document.querySelector(section.element);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    dots[index].style.background = 'var(--accent)';
                    dots[index].style.transform = 'scale(1.5)';
                } else {
                    dots[index].style.background = 'var(--gray-300)';
                    dots[index].style.transform = 'scale(1)';
                }
            }
        });
    });
}

// Initialize ADR scroll progress
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('adr')) {
        initializeADRScrollProgress();
    }
});

// ADR form enhancement for consultation requests
function enhanceADRConsultationForm() {
    const consultationForms = document.querySelectorAll('.cta-section form, .contact-form');
    
    consultationForms.forEach(form => {
        // Add ADR-specific form fields dynamically
        const adrFields = document.createElement('div');
        adrFields.innerHTML = `
            <div class="form-row adr-specific-fields" style="margin-top: 1rem;">
                <div class="form-group">
                    <label for="dispute-type">Type of Dispute</label>
                    <select id="dispute-type" name="dispute-type">
                        <option value="">Select Dispute Type</option>
                        <option value="commercial">Commercial Dispute</option>
                        <option value="construction">Construction Dispute</option>
                        <option value="employment">Employment Dispute</option>
                        <option value="family">Family/Matrimonial</option>
                        <option value="property">Property Dispute</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="preferred-adr">Preferred ADR Method</label>
                    <select id="preferred-adr" name="preferred-adr">
                        <option value="">Select Method</option>
                        <option value="arbitration">Arbitration</option>
                        <option value="mediation">Mediation</option>
                        <option value="conciliation">Conciliation</option>
                        <option value="expert-determination">Expert Determination</option>
                        <option value="consultation">Need Consultation</option>
                    </select>
                </div>
            </div>
        `;
        
        // Insert before submit button
        const submitButton = form.querySelector('.btn-primary, .form-submit');
        if (submitButton && !form.querySelector('.adr-specific-fields')) {
            submitButton.parentNode.insertBefore(adrFields, submitButton);
        }
    });
}

// Call ADR form enhancement
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('adr')) {
        setTimeout(enhanceADRConsultationForm, 1000); // Delay to ensure form is loaded
    }
});

// Keyboard shortcuts for ADR page navigation
document.addEventListener('keydown', (e) => {
    if (!window.location.pathname.includes('adr')) return;
    
    if (e.altKey) {
        switch(e.key) {
            case '1':
                document.querySelector('.adr-credentials')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case '2':
                document.querySelector('.practice-areas-grid')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case '3':
                document.querySelector('.adr-advantages')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case '4':
                document.querySelector('.adr-programs')?.scrollIntoView({ behavior: 'smooth' });
                break;
        }
    }
});

// Performance monitoring for ADR page animations
function monitorADRPerformance() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'measure' && entry.name.includes('adr')) {
                }
            });
        });
        observer.observe({ entryTypes: ['measure'] });
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('adr')) {
        monitorADRPerformance();
    }
});

// Family & Consumer Law Page Specific JavaScript - Add to main.js

// Initialize Family & Consumer specific features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('family-consumer')) {
        initializeFamilyConsumerFeatures();
    }
});

// Family & Consumer page specific functionality
function initializeFamilyConsumerFeatures() {
    initializeFamilyServiceInteractions();
    initializeTimelineAnimations();
    initializeConsumerHighlights();
    initializeEmergencySupport();
    initializeSensitiveContentHandling();
}

// Enhanced service card interactions for family law sensitivity
function initializeFamilyServiceInteractions() {
    const serviceCards = document.querySelectorAll('.service-area-card');
    
    serviceCards.forEach(card => {
        // Gentle hover effects for sensitive content
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            
            // Subtle highlighting for related services
            const cardType = this.className.includes('matrimonial') ? 'family' : 
                           this.className.includes('custody') ? 'family' :
                           this.className.includes('financial') ? 'family' :
                           this.className.includes('protection') ? 'urgent' : 'general';
            
            if (cardType === 'urgent') {
                this.style.boxShadow = '0 15px 35px rgba(255, 152, 0, 0.2)';
            } else if (cardType === 'family') {
                this.style.boxShadow = '0 15px 35px rgba(30, 58, 95, 0.15)';
            }
            
            // Animate service features
            const features = this.querySelectorAll('.service-features ul li');
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.color = 'var(--primary)';
                    feature.style.paddingLeft = '2rem';
                }, index * 100);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px) scale(1)';
            this.style.boxShadow = 'var(--shadow-lg)';
            
            // Reset service features
            const features = this.querySelectorAll('.service-features ul li');
            features.forEach(feature => {
                feature.style.color = 'var(--text-light)';
                feature.style.paddingLeft = '1.5rem';
            });
        });
        
        // Track service interest for analytics
        card.addEventListener('click', function() {
            const serviceType = this.querySelector('.service-title')?.textContent;
            
            // Special handling for protection services (urgent)
            if (this.classList.contains('protection-focus')) {
                showUrgentSupportInfo();
            }
        });
    });
}

// Timeline animation with sensitivity to emotional content
function initializeTimelineAnimations() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    // Create intersection observer for gentle progressive revelation
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('timeline-revealed');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    
                    // Gentle pulsing animation for step marker
                    const stepMarker = entry.target.querySelector('.step-marker');
                    if (stepMarker) {
                        stepMarker.style.animation = 'gentlePulse 2s ease-in-out';
                    }
                }, index * 300); // Slower reveal for sensitive content
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px' 
    });
    
    timelineSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Alternate slide directions
        if (index % 2 === 0) {
            step.style.transform = 'translateX(-50px)';
        } else {
            step.style.transform = 'translateX(50px)';
        }
        
        timelineObserver.observe(step);
        
        // Add interactive click for more information
        step.addEventListener('click', function() {
            const stepTitle = this.querySelector('h3')?.textContent;
            showProcessDetails(stepTitle);
        });
    });
}

// Consumer service highlighting with Supreme Court case emphasis
function initializeConsumerHighlights() {
    const highlightAchievement = document.querySelector('.highlight-achievement');
    const consumerCards = document.querySelectorAll('.consumer-service-card');
    
    if (highlightAchievement) {
        // Add click interaction for Supreme Court case details
        highlightAchievement.addEventListener('click', function() {
            showSupremeCourtCaseDetails();
        });
        
        // Enhance visual appeal with floating animation
        highlightAchievement.style.cursor = 'pointer';
        highlightAchievement.setAttribute('title', 'Click to learn more about our Supreme Court victory');
    }
    
    // Consumer service card interactions
    consumerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            
            // Special highlighting for reputation protection
            if (this.classList.contains('reputation-focus')) {
                this.style.background = 'linear-gradient(135deg, var(--white), rgba(212, 175, 55, 0.1))';
                this.style.borderLeftColor = 'var(--primary)';
                this.style.borderLeftWidth = '6px';
            }
            
            // Animate forum badges
            const badges = this.querySelectorAll('.forum-badge');
            badges.forEach((badge, index) => {
                setTimeout(() => {
                    badge.style.transform = 'scale(1.1)';
                    badge.style.boxShadow = '0 2px 8px rgba(30, 58, 95, 0.3)';
                }, index * 100);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.background = 'var(--white)';
            this.style.borderLeftWidth = '4px';
            
            // Reset badges
            const badges = this.querySelectorAll('.forum-badge');
            badges.forEach(badge => {
                badge.style.transform = 'scale(1)';
                badge.style.boxShadow = 'none';
            });
        });
        
        // Track consumer service clicks
        card.addEventListener('click', function() {
            const serviceType = this.querySelector('.service-title')?.textContent;
        });
    });
}

// Emergency support features for urgent family matters
function initializeEmergencySupport() {
    // Create emergency support indicator
    const emergencySupport = document.createElement('div');
    emergencySupport.className = 'emergency-support-indicator';
    emergencySupport.innerHTML = `
        <div class="emergency-content">
            <div class="emergency-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
            </div>
            <div class="emergency-text">
                <strong>Emergency Support Available</strong>
                <p>Urgent family protection matters</p>
            </div>
        </div>
    `;
    
    emergencySupport.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
        z-index: 1000;
        cursor: pointer;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 250px;
        font-size: 0.9rem;
    `;
    
    emergencySupport.querySelector('.emergency-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    emergencySupport.querySelector('.emergency-icon').style.cssText = `
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    emergencySupport.querySelector('.emergency-text strong').style.cssText = `
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
    `;
    
    emergencySupport.querySelector('.emergency-text p').style.cssText = `
        margin: 0;
        opacity: 0.9;
        font-size: 0.8rem;
    `;
    
    document.body.appendChild(emergencySupport);
    
    // Show emergency support after user spends time on protection-related content
    let emergencyTimer;
    const protectionCards = document.querySelectorAll('.protection-focus, .service-area-card');
    
    protectionCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            emergencyTimer = setTimeout(() => {
                emergencySupport.style.opacity = '1';
                emergencySupport.style.transform = 'translateX(0)';
            }, 3000);
        });
        
        card.addEventListener('mouseleave', () => {
            clearTimeout(emergencyTimer);
        });
    });
    
    // Emergency support click handler
    emergencySupport.addEventListener('click', () => {
        window.location.href = 'tel:+919811101476';
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (emergencySupport.style.opacity === '1') {
            emergencySupport.style.opacity = '0';
            emergencySupport.style.transform = 'translateX(100%)';
        }
    }, 15000);
}

// Sensitive content handling with appropriate messaging
function initializeSensitiveContentHandling() {
    // Add gentle animations for sensitive family content
    const familyCards = document.querySelectorAll('.matrimonial-focus, .custody-focus');
    
    familyCards.forEach(card => {
        // Add compassionate messaging overlay on hover
        const overlay = document.createElement('div');
        overlay.className = 'compassion-overlay';
        overlay.innerHTML = `
            <div class="compassion-message">
                <p>We understand this is a difficult time. Our approach prioritizes your wellbeing and dignity.</p>
            </div>
        `;
        
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(30, 58, 95, 0.95);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
        `;
        
        overlay.querySelector('.compassion-message p').style.cssText = `
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
            font-style: italic;
        `;
        
        card.appendChild(overlay);
        card.style.position = 'relative';
        
        let hoverTimeout;
        card.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                overlay.style.opacity = '1';
            }, 2000); // Show compassionate message after 2 seconds
        });
        
        card.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            overlay.style.opacity = '0';
        });
    });
}

// Show process step details
function showProcessDetails(stepTitle) {
    const processDetails = {
        'Confidential Consultation': {
            description: 'Your privacy is our priority. All discussions are protected by attorney-client privilege.',
            duration: '60-90 minutes',
            includes: ['Complete case assessment', 'Legal options review', 'Fee structure discussion', 'Next steps planning']
        },
        'Strategic Assessment': {
            description: 'Comprehensive evaluation of your legal position and potential outcomes.',
            duration: '1-2 weeks',
            includes: ['Document review', 'Case strength analysis', 'Timeline estimation', 'Strategy development']
        },
        'Mediation First Approach': {
            description: 'Whenever possible, we pursue amicable resolution to minimize emotional and financial costs.',
            duration: 'Variable',
            includes: ['Mediation arrangement', 'Settlement negotiations', 'Agreement drafting', 'Court approval if needed']
        },
        'Strategic Representation': {
            description: 'When court proceedings are necessary, we provide strong advocacy while maintaining sensitivity.',
            duration: 'Variable',
            includes: ['Court filings', 'Evidence preparation', 'Hearing representation', 'Regular case updates']
        },
        'Ongoing Support': {
            description: 'Continued guidance through implementation and any post-resolution matters.',
            duration: 'As needed',
            includes: ['Order implementation', 'Compliance monitoring', 'Modification assistance', 'Future legal support']
        }
    };
    
    const details = processDetails[stepTitle];
    if (details) {
        showNotification(
            `${stepTitle}: ${details.description} Duration: ${details.duration}. Includes: ${details.includes.join(', ')}.`,
            'info'
        );
    }
}

// Show Supreme Court case details
function showSupremeCourtCaseDetails() {
    const caseInfo = `
        <div class="case-details-popup">
            <h3>Hyundai Motors India Limited vs. Shailendra Bhatnagar</h3>
            <div class="case-summary">
                <p><strong>Court:</strong> Supreme Court of India</p>
                <p><strong>Result:</strong> Decided in favor of Mr. Shailendra Bhatnagar</p>
                <p><strong>Significance:</strong> Landmark judgment establishing important precedent in consumer protection law, demonstrating our expertise in successfully challenging large corporations when consumer rights are violated.</p>
                <p><strong>Impact:</strong> This victory showcases our commitment to protecting individual consumers against corporate entities, regardless of their size or influence.</p>
            </div>
        </div>
    `;
    
    showDetailedModal('Supreme Court Victory', caseInfo);
}

// Show urgent support information
function showUrgentSupportInfo() {
    const urgentInfo = `
        <div class="urgent-support-info">
            <h3>Immediate Protection Available</h3>
            <div class="urgent-details">
                <p><strong>Emergency Services:</strong></p>
                <ul>
                    <li>24/7 consultation for urgent matters</li>
                    <li>Emergency protection order applications</li>
                    <li>Immediate safety planning</li>
                    <li>Court interventions for domestic violence</li>
                </ul>
                <div class="contact-options">
                    <p><strong>Contact immediately:</strong></p>
                    <p>📞 +91 98111 01476</p>
                    <p>✉️ shailendra@sbassociates.in</p>
                </div>
                <div class="safety-note">
                    <p><em>Your safety is our immediate priority. We understand the urgency of family protection matters and are equipped to provide immediate legal intervention.</em></p>
                </div>
            </div>
        </div>
    `;
    
    showDetailedModal('Emergency Support', urgentInfo, 'urgent');
}

// Enhanced modal system for detailed information
function showDetailedModal(title, content, type = 'info') {
    const modal = document.createElement('div');
    modal.className = 'detailed-modal';
    
    const bgColor = type === 'urgent' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(30, 58, 95, 0.1)';
    const borderColor = type === 'urgent' ? '#dc2626' : 'var(--primary)';
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 2rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--white);
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.8);
        transition: transform 0.3s ease;
        border-top: 4px solid ${borderColor};
    `;
    
    modalContent.innerHTML = `
        <button class="close-modal" style="
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: var(--text-light);
            line-height: 1;
        ">&times;</button>
        <div class="modal-body">
            ${content}
        </div>
        <style>
            .case-details-popup h3,
            .urgent-support-info h3 {
                color: ${borderColor};
                margin-bottom: 1.5rem;
                font-size: 1.5rem;
            }
            .case-summary p,
            .urgent-details p {
                margin-bottom: 0.75rem;
                line-height: 1.6;
            }
            .urgent-details ul {
                margin: 1rem 0;
                padding-left: 1.5rem;
            }
            .urgent-details li {
                margin-bottom: 0.5rem;
            }
            .contact-options {
                background: ${bgColor};
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                border-left: 3px solid ${borderColor};
            }
            .safety-note {
                font-style: italic;
                color: var(--text-light);
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
            }
        </style>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Close functionality
    const closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
    
    modalContent.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Enhanced form handling for family & consumer matters
function initializeFamilyConsumerForms() {
    const forms = document.querySelectorAll('.contact-form, .cta-section form');
    
    forms.forEach(form => {
        // Add family/consumer specific fields
        const familyConsumerFields = document.createElement('div');
        familyConsumerFields.innerHTML = `
            <div class="form-row family-consumer-fields" style="margin-top: 1rem;">
                <div class="form-group">
                    <label for="matter-type">Type of Matter</label>
                    <select id="matter-type" name="matter-type">
                        <option value="">Select Matter Type</option>
                        <optgroup label="Family Law">
                            <option value="divorce">Divorce/Separation</option>
                            <option value="custody">Child Custody</option>
                            <option value="maintenance">Maintenance/Alimony</option>
                            <option value="domestic-violence">Domestic Violence</option>
                            <option value="property-settlement">Property Settlement</option>
                        </optgroup>
                        <optgroup label="Consumer Law">
                            <option value="service-deficiency">Service Deficiency</option>
                            <option value="product-liability">Product Liability</option>
                            <option value="banking-dispute">Banking Dispute</option>
                            <option value="insurance-claim">Insurance Claim</option>
                            <option value="other-consumer">Other Consumer Issue</option>
                        </optgroup>
                    </select>
                </div>
                <div class="form-group">
                    <label for="urgency-level">Urgency Level</label>
                    <select id="urgency-level" name="urgency-level">
                        <option value="">Select Urgency</option>
                        <option value="emergency">Emergency (Immediate attention needed)</option>
                        <option value="urgent">Urgent (Within 2-3 days)</option>
                        <option value="standard">Standard (Within a week)</option>
                        <option value="consultation">Consultation Only</option>
                    </select>
                </div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>
                    <input type="checkbox" name="confidentiality-acknowledged" required>
                    I understand that all information shared will be kept strictly confidential under attorney-client privilege
                </label>
            </div>
        `;
        
        // Insert before submit button
        const submitButton = form.querySelector('.btn-primary, .form-submit');
        if (submitButton && !form.querySelector('.family-consumer-fields')) {
            submitButton.parentNode.insertBefore(familyConsumerFields, submitButton);
        }
        
        // Enhanced form submission with sensitivity
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const matterType = formData.get('matter-type');
            const urgencyLevel = formData.get('urgency-level');
            
            // Special handling for emergency matters
            if (urgencyLevel === 'emergency') {
                showUrgentResponseMessage();
            } else {
                showStandardResponseMessage(matterType);
            }
            
            // Track form submission
        });
    });
}

// Response messages for different types of submissions
function showUrgentResponseMessage() {
    showNotification(
        'Thank you for reaching out regarding an urgent matter. We understand the sensitivity of your situation and will contact you within 2 hours. For immediate assistance, please call +91 98111 01476.',
        'urgent'
    );
}

function showStandardResponseMessage(matterType) {
    const isFamilyMatter = ['divorce', 'custody', 'maintenance', 'domestic-violence', 'property-settlement'].includes(matterType);
    
    const message = isFamilyMatter 
        ? 'Thank you for trusting us with your family matter. We understand this is a sensitive time, and we will handle your inquiry with complete confidentiality and care. We will contact you within 24 hours to schedule a private consultation.'
        : 'Thank you for your consumer law inquiry. We will review your case details and contact you within 24 hours with our initial assessment and next steps.';
    
    showNotification(message, 'success');
}

// Enhanced notification system with custom styling for urgent matters
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let bgColor, icon;
    switch(type) {
        case 'urgent':
            bgColor = '#dc2626';
            icon = '🚨';
            break;
        case 'success':
            bgColor = '#10b981';
            icon = '✓';
            break;
        case 'error':
            bgColor = '#ef4444';
            icon = '⚠';
            break;
        default:
            bgColor = '#3b82f6';
            icon = 'ℹ';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 450px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', sans-serif;
        line-height: 1.5;
    `;
    
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    `;
    
    const notificationIcon = notification.querySelector('.notification-icon');
    notificationIcon.style.cssText = `
        flex-shrink: 0;
        font-size: 1.2rem;
        margin-top: 0.1rem;
    `;
    
    const notificationMessage = notification.querySelector('.notification-message');
    notificationMessage.style.cssText = `
        flex: 1;
        font-size: 0.95rem;
    `;
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.3s ease;
        margin-left: 0.5rem;
    `;
    
    closeButton.addEventListener('mouseenter', () => closeButton.style.opacity = '1');
    closeButton.addEventListener('mouseleave', () => closeButton.style.opacity = '0.8');
    
    // Add animation keyframes
    if (!document.querySelector('#family-consumer-notifications')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'family-consumer-notifications';
        styleSheet.textContent = `
            @keyframes slideInRight {
                from { 
                    transform: translateX(100%) translateY(-20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0) translateY(0); 
                    opacity: 1; 
                }
            }
            @keyframes gentlePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove (longer for urgent messages)
    const autoRemoveTime = type === 'urgent' ? 10000 : 6000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.4s reverse';
            setTimeout(() => notification.remove(), 400);
        }
    }, autoRemoveTime);
}

// Initialize all family & consumer features
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('family-consumer')) {
        setTimeout(initializeFamilyConsumerForms, 500);
    }
});

// Performance monitoring for animations
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.entryType === 'measure' && entry.name.includes('family-consumer')) {
            }
        });
    });
    observer.observe({ entryTypes: ['measure'] });
}

// Contact Form Handling with Formspree Integration
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check honeypot field for spam protection
            const honeypot = this.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                showNotification('Form submission blocked due to spam detection.', 'error');
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            
            // Basic form validation
            const name = formData.get('name');
            const email = formData.get('email');
            const practiceArea = formData.get('practice-area');
            const message = formData.get('message');
            
            if (!name || !email || !practiceArea || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Get submit button and show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Submit to Formspree
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showNotification(
                        'Thank you for your consultation request! We have received your message and will respond within 24 hours. For urgent matters, please call +91 98111 01476.',
                        'success'
                    );
                    this.reset();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Form submission failed');
                    });
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                showNotification(
                    'There was an error sending your message. Please try again or contact us directly at shailendra@sbassociates.in',
                    'error'
                );
            })
            .finally(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
});