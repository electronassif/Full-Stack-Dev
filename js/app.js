// ========================================
// FitTrack Pro - Main Application
// Author: Fakhoury Elias Nassif
// Lebanese University - Faculty of Engineering
// Full Stack Development Project
// ========================================

'use strict';

/**
 * Main Application Class
 * Manages the core functionality of FitTrack Pro
 */
class FitnessTrackerApp {
    constructor() {
        // Application state
        this.currentMode = localStorage.getItem('fitnessMode') || 'maintenance';
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.exercises = [];
        this.nutrition = [];
        this.quotes = [];
        this.apiCache = new Map(); // Cache API responses
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading(true);
            this.setupEventListeners();
            this.loadUserPreferences();
            this.updateLastUpdated();
            this.setupKeyboardNavigation();
            
            // Load data concurrently
            await Promise.all([
                this.loadDailyQuote(),
                this.loadExerciseData(),
                this.animateCounters()
            ]);
            
            // Initialize page-specific features
            if (document.getElementById('macroForm')) {
                this.initNutritionPage();
            }
            if (document.getElementById('progressTimeline')) {
                this.initProgressPage();
            }
            
            // Setup charts after DOM is ready
            this.setupCharts();
            this.observeAnimations();
            
            this.showLoading(false);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
            this.showLoading(false);
        }
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // Macro calculator form
        const macroForm = document.getElementById('macroForm');
        if (macroForm) {
            macroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateMacros();
            });
        }
        
        // Chart tab click handler
        const chartsTab = document.getElementById('charts-tab');
        if (chartsTab) {
            chartsTab.addEventListener('click', () => {
                // Initialize charts when tab is clicked
                setTimeout(() => this.setupCharts(), 100);
            });
        }
        
        // Timeline tab click handler
        const timelineTab = document.getElementById('timeline-tab');
        if (timelineTab) {
            timelineTab.addEventListener('click', () => {
                // Initialize timeline when tab is clicked
                setTimeout(() => {
                    if (typeof timelineManager !== 'undefined') {
                        timelineManager.renderTimeline();
                    }
                }, 100);
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Mode cards keyboard accessibility
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
        
        // Active nav link
        this.updateActiveNavLink();
        
        // Handle network status
        window.addEventListener('online', () => this.showNotification('Connection restored'));
        window.addEventListener('offline', () => this.showNotification('No internet connection', 'warning'));
    }
    
    /**
     * Setup keyboard navigation for accessibility
     */
    setupKeyboardNavigation() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
    }
    
    /**
     * Update active navigation link based on current page
     */
    updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        console.log('Dark mode toggle clicked'); // Debug log
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.darkMode);
        
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = this.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Update theme color meta tag
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = this.darkMode ? '#1a1b2e' : '#FF6B6B';
        }
        
        this.showNotification(this.darkMode ? 'Dark mode enabled' : 'Light mode enabled');
    }
    
    /**
     * Alternative dark mode toggle method for direct onclick
     */
    static toggleDarkModeStatic() {
        if (window.app) {
            window.app.toggleDarkMode();
        } else {
            // Fallback if app instance is not available
            const isDark = document.body.classList.contains('dark-mode');
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', !isDark);
            
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) {
                icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        // Apply dark mode if enabled
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
        
        // Load saved fitness mode
        if (this.currentMode && this.currentMode !== 'maintenance') {
            this.showNotification(`${this.capitalizeFirst(this.currentMode)} mode active`);
        }
    }
    
    /**
     * Select fitness mode
     * @param {string} mode - The selected mode (bulking, maintenance, cutting)
     */
    selectMode(mode) {
        if (!['bulking', 'maintenance', 'cutting'].includes(mode)) {
            console.error('Invalid mode selected');
            return;
        }
        
        this.currentMode = mode;
        localStorage.setItem('fitnessMode', mode);
        this.showNotification(`${this.capitalizeFirst(mode)} mode selected!`);
        
        // Update UI to reflect mode change
        this.updateModeUI(mode);
        
        // Track mode selection (analytics)
        this.trackEvent('mode_selected', { mode });
    }
    
    /**
     * Update UI based on selected mode
     * @param {string} mode - The current mode
     */
    updateModeUI(mode) {
        const modeColors = {
            bulking: { primary: '#FF6B6B', secondary: '#FFE66D' },
            cutting: { primary: '#4ECDC4', secondary: '#95E1D3' },
            maintenance: { primary: '#FF6B6B', secondary: '#4ECDC4' }
        };
        
        // Add visual indicator for active mode
        document.querySelectorAll('.mode-card').forEach(card => {
            const cardMode = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (cardMode === mode) {
                card.classList.add('active-mode');
            } else {
                card.classList.remove('active-mode');
            }
        });
    }
    
    /**
     * Load daily motivational quote from API
     */
    async loadDailyQuote() {
        const cacheKey = 'dailyQuote';
        const cachedQuote = this.getCachedData(cacheKey, 3600000); // Cache for 1 hour
        
        if (cachedQuote) {
            this.displayQuote(cachedQuote);
            return;
        }
        
        try {
            const response = await fetch('https://api.quotable.io/quotes/random?tags=motivational|inspirational', {
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (!response.ok) throw new Error('Failed to fetch quote');
            
            const data = await response.json();
            const quote = data[0] || data; // Handle array or single object response
            
            this.setCachedData(cacheKey, quote);
            this.displayQuote(quote);
        } catch (error) {
            console.error('Error loading quote:', error);
            this.displayFallbackQuote();
        }
    }
    
    /**
     * Display quote in UI
     * @param {Object} quote - Quote object with content and author
     */
    displayQuote(quote) {
        const quoteElement = document.getElementById('dailyQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = quote.content;
            authorElement.textContent = quote.author;
            
            // Add fade-in animation
            quoteElement.parentElement.classList.add('quote-loaded');
        }
    }
    
    /**
     * Display fallback quote when API fails
     */
    displayFallbackQuote() {
        const fallbackQuotes = [
            { content: "The only bad workout is the one that didn't happen.", author: "Unknown" },
            { content: "Success isn't given. It's earned.", author: "Unknown" },
            { content: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        this.displayQuote(randomQuote);
    }
    
    /**
     * Load exercise data from API
     */
    async loadExerciseData() {
        const cacheKey = 'exerciseData';
        const cachedData = this.getCachedData(cacheKey, 86400000); // Cache for 24 hours
        
        if (cachedData) {
            this.exercises = cachedData;
            return;
        }
        
        try {
            // Using API Ninjas Exercise API as an example
            const muscle = 'chest'; // Example muscle group
            const response = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`, {
                headers: {
                    'X-Api-Key': 'vHyjXdu0UE/aPutIOQZA6w==Sc6jhkID8Fu5YmAe' // Replace with actual API key
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Failed to fetch exercises');
            
            const data = await response.json();
            this.exercises = data;
            this.setCachedData(cacheKey, data);
        } catch (error) {
            console.error('Error loading exercises:', error);
            // Use fallback data
            this.exercises = this.getFallbackExercises();
        }
    }
    
    /**
     * Get fallback exercise data
     * @returns {Array} Array of exercise objects
     */
    getFallbackExercises() {
        return [
            { name: 'Bench Press', muscle: 'chest', type: 'strength', difficulty: 'intermediate' },
            { name: 'Push-ups', muscle: 'chest', type: 'strength', difficulty: 'beginner' },
            { name: 'Dumbbell Flyes', muscle: 'chest', type: 'strength', difficulty: 'intermediate' }
        ];
    }
    
    /**
     * Calculate macros based on user input
     */
    calculateMacros() {
        try {
            // Get form values with validation
            const weight = this.validateNumber(document.getElementById('weight').value, 30, 300);
            const height = this.validateNumber(document.getElementById('height').value, 100, 250);
            const age = this.validateNumber(document.getElementById('age').value, 10, 100);
            const gender = document.getElementById('gender').value;
            const activity = document.getElementById('activity').value;
            const goal = document.getElementById('goal').value;
            
            if (!weight || !height || !age) {
                this.showNotification('Please enter valid values', 'error');
                return;
            }
            
            // Calculate BMR using Mifflin-St Jeor Equation
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }
            
            // Calculate TDEE
            const activityMultipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                veryActive: 1.9
            };
            
            const tdee = Math.round(bmr * activityMultipliers[activity]);
            
            // Calculate macros based on goal
            const macros = this.calculateMacroBreakdown(tdee, weight, goal);
            
            // Update UI
            this.displayMacroResults(macros);
            
            // Save to localStorage
            const userData = { weight, height, age, gender, activity, goal, macros };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            this.showNotification('Macros calculated successfully!');
            
            // Track calculation
            this.trackEvent('macros_calculated', { goal });
        } catch (error) {
            console.error('Error calculating macros:', error);
            this.showNotification('Failed to calculate macros', 'error');
        }
    }
    
    /**
     * Calculate macro breakdown based on TDEE and goal
     * @param {number} tdee - Total Daily Energy Expenditure
     * @param {number} weight - Body weight in kg
     * @param {string} goal - Fitness goal
     * @returns {Object} Macro breakdown
     */
    calculateMacroBreakdown(tdee, weight, goal) {
        let calories, protein, carbs, fat;
        
        switch(goal) {
            case 'bulking':
                calories = Math.round(tdee + 500);
                protein = Math.round(weight * 2.2);
                fat = Math.round(calories * 0.25 / 9);
                carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
                break;
            case 'cutting':
                calories = Math.round(tdee - 500);
                protein = Math.round(weight * 2.5);
                fat = Math.round(calories * 0.20 / 9);
                carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
                break;
            default: // maintenance
                calories = Math.round(tdee);
                protein = Math.round(weight * 2);
                fat = Math.round(calories * 0.25 / 9);
                carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
        }
        
        return { calories, protein, carbs, fat, tdee };
    }
    
    /**
     * Display macro results in UI
     * @param {Object} macros - Calculated macros
     */
    displayMacroResults(macros) {
        document.getElementById('calories').textContent = macros.calories;
        document.getElementById('protein').textContent = macros.protein;
        document.getElementById('carbs').textContent = macros.carbs;
        document.getElementById('fat').textContent = macros.fat;
        document.getElementById('macroResults').style.display = 'block';
        
        // Create macro chart
        this.createMacroChart(macros.protein, macros.carbs, macros.fat);
        
        // Animate results
        document.getElementById('macroResults').classList.add('fade-in', 'active');
    }
    
    /**
     * Create macro distribution chart
     * @param {number} protein - Protein in grams
     * @param {number} carbs - Carbs in grams
     * @param {number} fat - Fat in grams
     */
    createMacroChart(protein, carbs, fat) {
        const ctx = document.getElementById('macroChart');
        if (!ctx) return;
        
        // Destroy existing chart if any
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [protein * 4, carbs * 4, fat * 9], // Convert to calories
                    backgroundColor: [
                        '#FF6B6B',
                        '#4ECDC4',
                        '#FFE66D'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} cal (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    /**
     * Setup charts for the application
     */
    setupCharts() {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        // Progress Chart
        const progressCtx = document.getElementById('progressChart');
        if (progressCtx) {
            try {
                this.createProgressChart(progressCtx);
            } catch (error) {
                console.error('Failed to create progress chart:', error);
            }
        }
        
        // Body Composition Chart
        const bodyCompCtx = document.getElementById('bodyCompChart');
        if (bodyCompCtx) {
            try {
                this.createBodyCompChart(bodyCompCtx);
            } catch (error) {
                console.error('Failed to create body composition chart:', error);
            }
        }
        
        // Strength Chart
        const strengthCtx = document.getElementById('strengthChart');
        if (strengthCtx) {
            try {
                this.createStrengthChart(strengthCtx);
            } catch (error) {
                console.error('Failed to create strength chart:', error);
            }
        }

        // Macro Chart (for nutrition page)
        const macroCtx = document.getElementById('macroChart');
        if (macroCtx) {
            try {
                this.createMacroChart(0, 0, 0); // Will be updated when macros are calculated
            } catch (error) {
                console.error('Failed to create macro chart:', error);
            }
        }
    }
    
    /**
     * Create progress tracking chart
     * @param {HTMLCanvasElement} ctx - Canvas context
     */
    createProgressChart(ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [75, 75.5, 76, 76.3, 77, 77.8, 78.5, 79],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Body Fat %',
                    data: [18, 17.8, 17.5, 17.2, 16.8, 16.5, 16.2, 16],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Your Progress Over Time',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Body Fat %'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create body composition chart
     * @param {HTMLCanvasElement} ctx - Canvas context
     */
    createBodyCompChart(ctx) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Muscle Mass', 'Body Fat', 'Other'],
                datasets: [{
                    data: [45, 16, 39],
                    backgroundColor: [
                        '#FF6B6B',
                        '#FFE66D',
                        '#4ECDC4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    /**
     * Create strength progress chart
     * @param {HTMLCanvasElement} ctx - Canvas context
     */
    createStrengthChart(ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Bench Press', 'Squat', 'Deadlift', 'OHP'],
                datasets: [{
                    label: 'Current (kg)',
                    data: [100, 140, 180, 60],
                    backgroundColor: '#FF6B6B'
                }, {
                    label: 'Goal (kg)',
                    data: [120, 160, 200, 70],
                    backgroundColor: '#4ECDC4'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Observe elements for animations
     */
    observeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Start counter animation if it's a counter element
                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .counter').forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Animate counter elements
     */
    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            counter.innerText = '0';
        });
    }
    
    /**
     * Animate a single counter
     * @param {HTMLElement} counter - Counter element
     */
    animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const speed = 200;
        const increment = target / speed;
        
        const updateCounter = () => {
            const count = +counter.innerText;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        
        updateCounter();
    }
    
    /**
     * Show/hide loading spinner
     * @param {boolean} show - Whether to show the spinner
     */
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
            spinner.setAttribute('aria-hidden', !show);
        }
    }
    
    /**
     * Show notification toast
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning)
     */
    showNotification(message, type = 'success') {
        const toastEl = document.getElementById('liveToast');
        if (!toastEl) return;
        
        const toastBody = toastEl.querySelector('.toast-body');
        toastBody.textContent = message;
        
        // Update toast styling based on type
        const toastHeader = toastEl.querySelector('.toast-header');
        toastHeader.className = `toast-header bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} text-white`;
        
        const toast = new bootstrap.Toast(toastEl, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        toast.show();
    }
    
    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            };
            element.textContent = now.toLocaleDateString('en-US', options);
        }
    }
    
    /**
     * Initialize nutrition page specific features
     */
    initNutritionPage() {
        // Initialize nutrition page if it exists
        if (typeof nutritionPage !== 'undefined') {
            nutritionPage.init();
        }
        
        // Load initial meal plan
        if (typeof nutritionPage !== 'undefined' && nutritionPage.loadMealPlan) {
            nutritionPage.loadMealPlan();
        }
        
        // Load recipes
        if (typeof nutritionPage !== 'undefined' && nutritionPage.loadRecipes) {
            nutritionPage.loadRecipes();
        }
    }
    
    /**
     * Initialize progress page
     */
    initProgressPage() {
        // Initialize timeline if it exists
        if (typeof timelineManager !== 'undefined') {
            timelineManager.init();
        }
        
        // Initialize workout page if it exists
        if (typeof workoutPage !== 'undefined') {
            workoutPage.init();
        }
        
        // Animate timeline items
        this.animateTimeline();
    }
    
    /**
     * Animate timeline elements
     */
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('active');
            }, index * 200);
        });
    }
    
    /**
     * Validate numeric input
     * @param {string} value - Input value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number|null} Validated number or null
     */
    validateNumber(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) {
            return null;
        }
        return num;
    }
    
    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    /**
     * Get cached data
     * @param {string} key - Cache key
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {any} Cached data or null
     */
    getCachedData(key, maxAge) {
        const cached = this.apiCache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > maxAge) {
            this.apiCache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    setCachedData(key, data) {
        this.apiCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    /**
     * Track analytics event
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data = {}) {
        // Implement analytics tracking here
        console.log(`Event tracked: ${eventName}`, data);
    }
}

/**
 * Nutrition Page Manager Class
 * Handles all nutrition-related functionality
 */
class NutritionPage {
    constructor() {
        this.currentDay = 'Monday';
        this.foods = [];
        this.mealPlan = this.loadMealPlan() || this.initializeMealPlan();
        this.nutritionApiKey = 'vHyjXdu0UE/aPutIOQZA6w==Sc6jhkID8Fu5YmAe'; // Replace with actual API key
        this.init();
    }

    /**
     * Initialize nutrition page
     */
    async init() {
        this.loadMealPlanForDay();
        this.loadRecipes();
        this.setupEventListeners();
        this.updateCalorieTracker();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const searchInput = document.getElementById('foodSearchInput');
        if (searchInput) {
            // Debounce search input
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length >= 3) {
                        this.searchFood();
                    }
                }, 500);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchFood();
                }
            });
        }
    }

    /**
     * Initialize empty meal plan
     * @returns {Object} Empty meal plan structure
     */
    initializeMealPlan() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const plan = {};
        
        days.forEach(day => {
            plan[day] = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
        });
        
        return plan;
    }

    /**
     * Load saved meal plan
     * @returns {Object|null} Saved meal plan or null
     */
    loadMealPlan() {
        const saved = localStorage.getItem('mealPlan');
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Save meal plan to localStorage
     */
    saveMealPlan() {
        try {
            localStorage.setItem('mealPlan', JSON.stringify(this.mealPlan));
            app.showNotification('Meal plan saved successfully!');
        } catch (error) {
            console.error('Error saving meal plan:', error);
            app.showNotification('Failed to save meal plan', 'error');
        }
    }

    /**
     * Search for food using API
     */
    async searchFood() {
        const query = document.getElementById('foodSearchInput').value.trim();
        if (!query || query.length < 3) {
            app.showNotification('Please enter at least 3 characters', 'warning');
            return;
        }

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            // Using API Ninjas Nutrition API
            const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
                headers: {
                    'X-Api-Key': this.nutritionApiKey
                },
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) throw new Error('API request failed');
            
            const foods = await response.json();
            
            if (foods.length === 0) {
                // Use fallback data if API returns no results
                const fallbackFoods = this.getFallbackFoods(query);
                this.displaySearchResults(fallbackFoods);
            } else {
                // Format API response
                const formattedFoods = foods.map(food => ({
                    name: food.name,
                    calories: Math.round(food.calories),
                    protein: Math.round(food.protein_g),
                    carbs: Math.round(food.carbohydrates_total_g),
                    fat: Math.round(food.fat_total_g),
                    serving: food.serving_size_g ? `${food.serving_size_g}g` : '100g'
                }));
                this.displaySearchResults(formattedFoods);
            }
        } catch (error) {
            console.error('Error searching foods:', error);
            // Use fallback data on error
            const fallbackFoods = this.getFallbackFoods(query);
            this.displaySearchResults(fallbackFoods);
        }
    }

    /**
     * Get fallback food data
     * @param {string} query - Search query
     * @returns {Array} Fallback food items
     */
    getFallbackFoods(query) {
        const allFoods = [
            {
                name: 'Grilled Chicken Breast',
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                serving: '100g'
            },
            {
                name: 'Brown Rice',
                calories: 216,
                protein: 5,
                carbs: 45,
                fat: 1.8,
                serving: '1 cup'
            },
            {
                name: 'Broccoli',
                calories: 55,
                protein: 4,
                carbs: 11,
                fat: 0.6,
                serving: '1 cup'
            },
            {
                name: 'Greek Yogurt',
                calories: 150,
                protein: 20,
                carbs: 15,
                fat: 0,
                serving: '200g'
            },
            {
                name: 'Almonds',
                calories: 164,
                protein: 6,
                carbs: 6,
                fat: 14,
                serving: '1 oz'
            },
            {
                name: 'Eggs',
                calories: 155,
                protein: 13,
                carbs: 1.1,
                fat: 11,
                serving: '2 large'
            },
            {
                name: 'Salmon',
                calories: 208,
                protein: 20,
                carbs: 0,
                fat: 13,
                serving: '100g'
            },
            {
                name: 'Oatmeal',
                calories: 166,
                protein: 6,
                carbs: 28,
                fat: 3.6,
                serving: '1 cup'
            }
        ];
        
        return allFoods.filter(food => 
            food.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Display search results
     * @param {Array} foods - Array of food items
     */
    displaySearchResults(foods) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';

        if (foods.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted">No foods found. Try a different search.</p>';
            return;
        }

        foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.setAttribute('role', 'button');
            foodItem.setAttribute('tabindex', '0');
            foodItem.setAttribute('aria-label', `Add ${food.name} to meal`);
            
            foodItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${this.escapeHtml(food.name)}</h6>
                        <small class="text-muted">${this.escapeHtml(food.serving)}</small>
                    </div>
                    <div class="text-end">
                        <div><strong>${food.calories}</strong> cal</div>
                        <small>P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</small>
                    </div>
                </div>
            `;
            
            // Add click and keyboard handlers
            foodItem.addEventListener('click', () => this.addFoodToMeal(food));
            foodItem.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.addFoodToMeal(food);
                }
            });
            
            resultsContainer.appendChild(foodItem);
        });
    }

    /**
     * Add food to meal plan
     * @param {Object} food - Food item to add
     */
    addFoodToMeal(food) {
        // Create modal for meal selection
        const modalHtml = `
            <div class="modal fade" id="mealSelectModal" tabindex="-1" aria-labelledby="mealSelectModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mealSelectModalLabel">Add to Meal</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Add <strong>${this.escapeHtml(food.name)}</strong> to which meal?</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" onclick="nutritionPage.confirmAddFood('breakfast')">
                                    <i class="fas fa-sun"></i> Breakfast
                                </button>
                                <button class="btn btn-outline-primary" onclick="nutritionPage.confirmAddFood('lunch')">
                                    <i class="fas fa-cloud-sun"></i> Lunch
                                </button>
                                <button class="btn btn-outline-primary" onclick="nutritionPage.confirmAddFood('dinner')">
                                    <i class="fas fa-moon"></i> Dinner
                                </button>
                                <button class="btn btn-outline-primary" onclick="nutritionPage.confirmAddFood('snacks')">
                                    <i class="fas fa-cookie-bite"></i> Snacks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('mealSelectModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Store food temporarily
        this.tempFood = food;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('mealSelectModal'));
        modal.show();
    }

    /**
     * Confirm adding food to specific meal
     * @param {string} meal - Meal type
     */
    confirmAddFood(meal) {
        if (this.tempFood && meal) {
            this.mealPlan[this.currentDay][meal].push(this.tempFood);
            this.loadMealPlanForDay();
            app.showNotification(`${this.tempFood.name} added to ${meal}`);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('mealSelectModal'));
            modal.hide();
            
            // Clean up
            delete this.tempFood;
        }
    }

    /**
     * Select day for meal planning
     * @param {string} day - Day of the week
     */
    selectDay(day) {
        this.currentDay = day;
        
        // Update button states
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === day.substring(0, 3)) {
                btn.classList.add('active');
            }
        });
        
        this.loadMealPlanForDay();
    }

    /**
     * Load meal plan for selected day
     */
    loadMealPlanForDay() {
        const mealPlanContainer = document.getElementById('mealPlan');
        if (!mealPlanContainer) return;

        const dayMeals = this.mealPlan[this.currentDay] || {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        // Add some default meals if empty
        if (dayMeals.breakfast.length === 0 && dayMeals.lunch.length === 0 && 
            dayMeals.dinner.length === 0 && dayMeals.snacks.length === 0) {
            
            // Add sample meals for demonstration
            dayMeals.breakfast = [
                { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 20, fat: 5, type: 'food' },
                { name: 'Oatmeal with Banana', calories: 220, protein: 8, carbs: 40, fat: 4, type: 'food' }
            ];
            dayMeals.lunch = [
                { name: 'Grilled Chicken Salad', calories: 320, protein: 35, carbs: 15, fat: 12, type: 'food' }
            ];
            dayMeals.dinner = [
                { name: 'Salmon with Vegetables', calories: 450, protein: 38, carbs: 25, fat: 22, type: 'food' }
            ];
            dayMeals.snacks = [
                { name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14, type: 'food' }
            ];
        }

        const mealCards = [
            this.createMealCard('breakfast', dayMeals.breakfast, 'fas fa-sun'),
            this.createMealCard('lunch', dayMeals.lunch, 'fas fa-cloud-sun'),
            this.createMealCard('dinner', dayMeals.dinner, 'fas fa-moon'),
            this.createMealCard('snacks', dayMeals.snacks, 'fas fa-star')
        ];

        mealPlanContainer.innerHTML = `
            <div class="row">
                ${mealCards.join('')}
            </div>
        `;

        // Update calorie tracker
        this.updateCalorieTracker();
    }

    /**
     * Create meal card HTML
     * @param {string} mealTime - Meal time (breakfast, lunch, dinner, snacks)
     * @param {Array} foods - Array of food items
     * @param {string} icon - Font Awesome icon class
     * @returns {string} HTML string
     */
    createMealCard(mealTime, foods, icon) {
        const mealTimeDisplay = mealTime.charAt(0).toUpperCase() + mealTime.slice(1);
        const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
        const totalProtein = foods.reduce((sum, food) => sum + (food.protein || 0), 0);
        const totalCarbs = foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
        const totalFat = foods.reduce((sum, food) => sum + (food.fat || 0), 0);

        const foodItems = foods.map(food => `
            <div class="food-item d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${this.escapeHtml(food.name)}</strong>
                    <small class="text-muted d-block">${food.calories || 0} cal</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">${food.protein || 0}g protein</small>
                </div>
            </div>
        `).join('');

        return `
            <div class="col-md-6 col-lg-3 mb-4">
                <article class="meal-card h-100">
                    <div class="meal-time">
                        <i class="${icon}" aria-hidden="true"></i>
                        <h5>${mealTimeDisplay}</h5>
                    </div>
                    <div class="meal-content">
                        ${foods.length > 0 ? `
                            <div class="macro-display mb-3">
                                <div class="macro-item">
                                    <span class="macro-value">${totalCalories}</span>
                                    <span class="macro-label">cal</span>
                                </div>
                                <div class="macro-item">
                                    <span class="macro-value">${totalProtein}g</span>
                                    <span class="macro-label">protein</span>
                                </div>
                                <div class="macro-item">
                                    <span class="macro-value">${totalCarbs}g</span>
                                    <span class="macro-label">carbs</span>
                                </div>
                                <div class="macro-item">
                                    <span class="macro-value">${totalFat}g</span>
                                    <span class="macro-label">fat</span>
                                </div>
                            </div>
                            <div class="food-list">
                                ${foodItems}
                            </div>
                        ` : `
                            <p class="text-muted text-center">No foods added yet</p>
                        `}
                        <button class="btn btn-outline-primary btn-sm w-100 mt-3" onclick="nutritionPage.addFoodToMeal('${mealTime}')">
                            <i class="fas fa-plus" aria-hidden="true"></i> Add Food
                        </button>
                    </div>
                </article>
            </div>
        `;
    }

    /**
     * Load high-protein recipes
     */
    loadRecipes() {
        const recipes = [
            {
                name: 'Protein Power Bowl',
                calories: 450,
                protein: 35,
                carbs: 45,
                fat: 12,
                prepTime: '15 min',
                difficulty: 'Easy',
                ingredients: [
                    '200g grilled chicken breast',
                    '1 cup quinoa',
                    '1 cup mixed vegetables',
                    '2 tbsp olive oil',
                    '1 tbsp lemon juice',
                    'Salt and pepper to taste'
                ],
                instructions: [
                    'Cook quinoa according to package instructions',
                    'Grill chicken breast until cooked through',
                    'Steam or sauté vegetables',
                    'Combine all ingredients in a bowl',
                    'Drizzle with olive oil and lemon juice',
                    'Season with salt and pepper'
                ],
                image: '🥗'
            },
            {
                name: 'Greek Yogurt Parfait',
                calories: 320,
                protein: 25,
                carbs: 30,
                fat: 8,
                prepTime: '5 min',
                difficulty: 'Easy',
                ingredients: [
                    '200g Greek yogurt',
                    '1/4 cup granola',
                    '1/2 cup mixed berries',
                    '1 tbsp honey',
                    '1 tbsp chopped almonds'
                ],
                instructions: [
                    'Layer Greek yogurt in a glass',
                    'Add granola layer',
                    'Top with berries',
                    'Drizzle with honey',
                    'Sprinkle with almonds'
                ],
                image: '🍓'
            },
            {
                name: 'Salmon with Sweet Potato',
                calories: 520,
                protein: 38,
                carbs: 35,
                fat: 22,
                prepTime: '25 min',
                difficulty: 'Medium',
                ingredients: [
                    '150g salmon fillet',
                    '1 medium sweet potato',
                    '1 cup broccoli',
                    '2 tbsp olive oil',
                    '1 lemon',
                    'Herbs and spices'
                ],
                instructions: [
                    'Preheat oven to 400°F (200°C)',
                    'Cut sweet potato into wedges',
                    'Season salmon with herbs and lemon',
                    'Bake salmon and sweet potato for 20-25 minutes',
                    'Steam broccoli for 5 minutes',
                    'Serve together with lemon wedges'
                ],
                image: '🐟'
            },
            {
                name: 'Protein Smoothie Bowl',
                calories: 380,
                protein: 28,
                carbs: 40,
                fat: 10,
                prepTime: '10 min',
                difficulty: 'Easy',
                ingredients: [
                    '1 scoop protein powder',
                    '1 frozen banana',
                    '1/2 cup frozen berries',
                    '1/2 cup almond milk',
                    '1 tbsp chia seeds',
                    'Toppings: granola, nuts, fresh fruit'
                ],
                instructions: [
                    'Blend protein powder, banana, berries, and almond milk',
                    'Pour into a bowl',
                    'Top with chia seeds, granola, nuts, and fresh fruit',
                    'Serve immediately'
                ],
                image: '🥤'
            },
            {
                name: 'Turkey and Quinoa Stuffed Peppers',
                calories: 410,
                protein: 32,
                carbs: 38,
                fat: 14,
                prepTime: '35 min',
                difficulty: 'Medium',
                ingredients: [
                    '4 bell peppers',
                    '200g ground turkey',
                    '1 cup cooked quinoa',
                    '1/2 cup black beans',
                    '1/2 cup corn',
                    '1 cup tomato sauce',
                    'Cheese for topping'
                ],
                instructions: [
                    'Preheat oven to 375°F (190°C)',
                    'Cut tops off peppers and remove seeds',
                    'Brown turkey in a pan',
                    'Mix turkey with quinoa, beans, corn, and sauce',
                    'Stuff peppers with mixture',
                    'Top with cheese and bake for 25-30 minutes'
                ],
                image: '🫑'
            },
            {
                name: 'Cottage Cheese Protein Pancakes',
                calories: 290,
                protein: 24,
                carbs: 25,
                fat: 8,
                prepTime: '20 min',
                difficulty: 'Easy',
                ingredients: [
                    '1 cup cottage cheese',
                    '2 eggs',
                    '1/2 cup oats',
                    '1 tbsp honey',
                    '1 tsp vanilla extract',
                    '1/2 tsp baking powder'
                ],
                instructions: [
                    'Blend all ingredients until smooth',
                    'Heat a non-stick pan over medium heat',
                    'Pour small amounts of batter',
                    'Cook until bubbles form, then flip',
                    'Serve with fresh fruit and honey'
                ],
                image: '🥞'
            }
        ];

        const recipeSection = document.getElementById('recipeSection');
        if (recipeSection) {
            recipeSection.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
        }
    }

    /**
     * Create recipe card HTML
     * @param {Object} recipe - Recipe data
     * @returns {string} HTML string
     */
    createRecipeCard(recipe) {
        const difficultyClass = recipe.difficulty === 'Easy' ? 'success' : 
                              recipe.difficulty === 'Medium' ? 'warning' : 'danger';
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <article class="recipe-card h-100">
                    <div class="recipe-image">
                        <div class="recipe-emoji">${recipe.image}</div>
                    </div>
                    <div class="recipe-content">
                        <h5>${this.escapeHtml(recipe.name)}</h5>
                        <p class="text-muted mb-2">
                            <i class="fas fa-clock" aria-hidden="true"></i> ${recipe.prepTime} | 
                            <span class="badge bg-${difficultyClass}">${recipe.difficulty}</span>
                        </p>
                        <div class="macro-display mb-3">
                            <div class="macro-item">
                                <span class="macro-value">${recipe.calories}</span>
                                <span class="macro-label">cal</span>
                            </div>
                            <div class="macro-item">
                                <span class="macro-value">${recipe.protein}g</span>
                                <span class="macro-label">protein</span>
                            </div>
                            <div class="macro-item">
                                <span class="macro-value">${recipe.carbs}g</span>
                                <span class="macro-label">carbs</span>
                            </div>
                            <div class="macro-item">
                                <span class="macro-value">${recipe.fat}g</span>
                                <span class="macro-label">fat</span>
                            </div>
                        </div>
                        <div class="ingredient-list mb-3">
                            <strong>Ingredients:</strong>
                            <ul>
                                ${recipe.ingredients.slice(0, 4).map(ingredient => 
                                    `<li>${this.escapeHtml(ingredient)}</li>`
                                ).join('')}
                                ${recipe.ingredients.length > 4 ? '<li><em>... and more</em></li>' : ''}
                            </ul>
                        </div>
                        <button class="btn btn-primary btn-sm w-100" onclick="nutritionPage.viewRecipe('${this.escapeHtml(recipe.name)}')">
                            <i class="fas fa-eye" aria-hidden="true"></i> View Recipe
                        </button>
                    </div>
                </article>
            </div>
        `;
    }

    /**
     * View recipe details
     * @param {string} recipeName - Name of the recipe to view
     */
    viewRecipe(recipeName) {
        // Find the recipe data
        const recipes = [
            {
                name: 'Protein Power Bowl',
                calories: 450,
                protein: 35,
                carbs: 45,
                fat: 12,
                prepTime: '15 min',
                difficulty: 'Easy',
                ingredients: [
                    '200g grilled chicken breast',
                    '1 cup quinoa',
                    '1 cup mixed vegetables',
                    '2 tbsp olive oil',
                    '1 tbsp lemon juice',
                    'Salt and pepper to taste'
                ],
                instructions: [
                    'Cook quinoa according to package instructions',
                    'Grill chicken breast until cooked through',
                    'Steam or sauté vegetables',
                    'Combine all ingredients in a bowl',
                    'Drizzle with olive oil and lemon juice',
                    'Season with salt and pepper'
                ],
                image: '🥗'
            },
            {
                name: 'Greek Yogurt Parfait',
                calories: 320,
                protein: 25,
                carbs: 30,
                fat: 8,
                prepTime: '5 min',
                difficulty: 'Easy',
                ingredients: [
                    '200g Greek yogurt',
                    '1/4 cup granola',
                    '1/2 cup mixed berries',
                    '1 tbsp honey',
                    '1 tbsp chopped almonds'
                ],
                instructions: [
                    'Layer Greek yogurt in a glass',
                    'Add granola layer',
                    'Top with berries',
                    'Drizzle with honey',
                    'Sprinkle with almonds'
                ],
                image: '🍓'
            },
            {
                name: 'Salmon with Sweet Potato',
                calories: 520,
                protein: 38,
                carbs: 35,
                fat: 22,
                prepTime: '25 min',
                difficulty: 'Medium',
                ingredients: [
                    '150g salmon fillet',
                    '1 medium sweet potato',
                    '1 cup broccoli',
                    '2 tbsp olive oil',
                    '1 lemon',
                    'Herbs and spices'
                ],
                instructions: [
                    'Preheat oven to 400°F (200°C)',
                    'Cut sweet potato into wedges',
                    'Season salmon with herbs and lemon',
                    'Bake salmon and sweet potato for 20-25 minutes',
                    'Steam broccoli for 5 minutes',
                    'Serve together with lemon wedges'
                ],
                image: '🐟'
            },
            {
                name: 'Protein Smoothie Bowl',
                calories: 380,
                protein: 28,
                carbs: 40,
                fat: 10,
                prepTime: '10 min',
                difficulty: 'Easy',
                ingredients: [
                    '1 scoop protein powder',
                    '1 frozen banana',
                    '1/2 cup frozen berries',
                    '1/2 cup almond milk',
                    '1 tbsp chia seeds',
                    'Toppings: granola, nuts, fresh fruit'
                ],
                instructions: [
                    'Blend protein powder, banana, berries, and almond milk',
                    'Pour into a bowl',
                    'Top with chia seeds, granola, nuts, and fresh fruit',
                    'Serve immediately'
                ],
                image: '🥤'
            },
            {
                name: 'Turkey and Quinoa Stuffed Peppers',
                calories: 410,
                protein: 32,
                carbs: 38,
                fat: 14,
                prepTime: '35 min',
                difficulty: 'Medium',
                ingredients: [
                    '4 bell peppers',
                    '200g ground turkey',
                    '1 cup cooked quinoa',
                    '1/2 cup black beans',
                    '1/2 cup corn',
                    '1 cup tomato sauce',
                    'Cheese for topping'
                ],
                instructions: [
                    'Preheat oven to 375°F (190°C)',
                    'Cut tops off peppers and remove seeds',
                    'Brown turkey in a pan',
                    'Mix turkey with quinoa, beans, corn, and sauce',
                    'Stuff peppers with mixture',
                    'Top with cheese and bake for 25-30 minutes'
                ],
                image: '🫑'
            },
            {
                name: 'Cottage Cheese Protein Pancakes',
                calories: 290,
                protein: 24,
                carbs: 25,
                fat: 8,
                prepTime: '20 min',
                difficulty: 'Easy',
                ingredients: [
                    '1 cup cottage cheese',
                    '2 eggs',
                    '1/2 cup oats',
                    '1 tbsp honey',
                    '1 tsp vanilla extract',
                    '1/2 tsp baking powder'
                ],
                instructions: [
                    'Blend all ingredients until smooth',
                    'Heat a non-stick pan over medium heat',
                    'Pour small amounts of batter',
                    'Cook until bubbles form, then flip',
                    'Serve with fresh fruit and honey'
                ],
                image: '🥞'
            }
        ];

        const recipe = recipes.find(r => r.name === recipeName);
        if (!recipe) {
            app.showNotification('Recipe not found', 'error');
            return;
        }

        const difficultyClass = recipe.difficulty === 'Easy' ? 'success' : 
                              recipe.difficulty === 'Medium' ? 'warning' : 'danger';

        const modalHtml = `
            <div class="modal fade" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="recipeModalLabel">
                                <span style="font-size: 1.5rem; margin-right: 0.5rem;">${recipe.image}</span>
                                ${this.escapeHtml(recipe.name)}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6><i class="fas fa-info-circle" aria-hidden="true"></i> Recipe Info</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Prep Time:</strong> ${recipe.prepTime}</li>
                                        <li><strong>Difficulty:</strong> <span class="badge bg-${difficultyClass}">${recipe.difficulty}</span></li>
                                        <li><strong>Calories:</strong> ${recipe.calories} cal</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-chart-pie" aria-hidden="true"></i> Macros</h6>
                                    <div class="macro-display">
                                        <div class="macro-item">
                                            <span class="macro-value">${recipe.protein}g</span>
                                            <span class="macro-label">Protein</span>
                                        </div>
                                        <div class="macro-item">
                                            <span class="macro-value">${recipe.carbs}g</span>
                                            <span class="macro-label">Carbs</span>
                                        </div>
                                        <div class="macro-item">
                                            <span class="macro-value">${recipe.fat}g</span>
                                            <span class="macro-label">Fat</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h6><i class="fas fa-list" aria-hidden="true"></i> Ingredients</h6>
                                    <ul class="ingredient-list">
                                        ${recipe.ingredients.map(ingredient => 
                                            `<li>${this.escapeHtml(ingredient)}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-utensils" aria-hidden="true"></i> Instructions</h6>
                                    <ol class="ingredient-list">
                                        ${recipe.instructions.map(instruction => 
                                            `<li>${this.escapeHtml(instruction)}</li>`
                                        ).join('')}
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="nutritionPage.addRecipeToMealPlan('${this.escapeHtml(recipe.name)}')">
                                <i class="fas fa-plus" aria-hidden="true"></i> Add to Meal Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('recipeModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
        modal.show();
    }

    /**
     * Add recipe to meal plan
     * @param {string} recipeName - Name of the recipe to add
     */
    addRecipeToMealPlan(recipeName) {
        // Find the recipe and add it to the current day's meal plan
        // This is a simplified version - you could enhance this to let users choose which meal
        const recipe = {
            name: recipeName,
            type: 'recipe',
            calories: 400, // Default calories for recipes
            protein: 30,
            carbs: 35,
            fat: 12
        };

        // Add to lunch by default
        if (!this.mealPlan[this.currentDay].lunch) {
            this.mealPlan[this.currentDay].lunch = [];
        }
        this.mealPlan[this.currentDay].lunch.push(recipe);

        // Save and reload
        this.saveMealPlan();
        this.loadMealPlanForDay();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('recipeModal'));
        modal.hide();

        app.showNotification(`${recipeName} added to meal plan!`);
    }

    /**
     * Update calorie tracker
     */
    updateCalorieTracker() {
        // Calculate total calories for the day
        const dayPlan = this.mealPlan[this.currentDay];
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        
        Object.values(dayPlan).forEach(meals => {
            meals.forEach(food => {
                totalCalories += food.calories || 0;
                totalProtein += food.protein || 0;
                totalCarbs += food.carbs || 0;
                totalFat += food.fat || 0;
            });
        });
        
        // Get user's calorie goal
        const userData = localStorage.getItem('userData');
        const calorieGoal = userData ? JSON.parse(userData).macros?.calories || 3000 : 3000;
        
        // Update calorie bar
        const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);
        const bar = document.getElementById('calorieBar');
        if (bar) {
            bar.style.width = `${percentage}%`;
            bar.textContent = `${totalCalories} / ${calorieGoal} kcal`;
        }
        
        // Update macro stats
        const macroStats = document.querySelectorAll('.calorie-tracker .macro-stat');
        if (macroStats.length >= 3) {
            macroStats[0].querySelector('h5').textContent = `${Math.round(totalProtein)}g`;
            macroStats[1].querySelector('h5').textContent = `${Math.round(totalCarbs)}g`;
            macroStats[2].querySelector('h5').textContent = `${Math.round(totalFat)}g`;
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Timeline Manager Class
 * Manages the timeline section (Flexbox/Grid requirement)
 */
class TimelineManager {
    constructor() {
        this.milestones = this.loadMilestones() || this.getDefaultMilestones();
        this.init();
    }
    
    /**
     * Initialize timeline
     */
    init() {
        this.renderTimeline();
    }
    
    /**
     * Get default milestones
     * @returns {Array} Default milestone data
     */
    getDefaultMilestones() {
        return [
            {
                title: 'Started Fitness Journey',
                description: 'Began with basic calisthenics and bodyweight exercises',
                date: 'Week 1',
                progress: 100,
                icon: 'flag',
                status: 'completed'
            },
            {
                title: 'First Gym Session',
                description: 'Introduced to compound movements and proper form',
                date: 'Week 4',
                progress: 100,
                icon: 'trophy',
                status: 'completed'
            },
            {
                title: 'Nutrition Plan Started',
                description: 'Customized meal plan with macro tracking',
                date: 'Week 8',
                progress: 75,
                icon: 'utensils',
                status: 'in-progress'
            },
            {
                title: 'Advanced Training Phase',
                description: 'Progressive overload and periodization implemented',
                date: 'Current',
                progress: 50,
                icon: 'fire',
                status: 'in-progress'
            },
            {
                title: 'Competition Prep',
                description: 'Preparing for first bodybuilding competition',
                date: 'Upcoming',
                progress: 0,
                icon: 'medal',
                status: 'upcoming'
            }
        ];
    }
    
    /**
     * Load saved milestones
     * @returns {Array|null} Saved milestones or null
     */
    loadMilestones() {
        const saved = localStorage.getItem('milestones');
        return saved ? JSON.parse(saved) : null;
    }
    
    /**
     * Save milestones
     */
    saveMilestones() {
        localStorage.setItem('milestones', JSON.stringify(this.milestones));
    }
    
    /**
     * Add custom milestone
     */
    addCustomMilestone() {
        // Create modal for milestone input
        const modalHtml = `
            <div class="modal fade" id="milestoneModal" tabindex="-1" aria-labelledby="milestoneModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="milestoneModalLabel">Add New Milestone</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="milestoneForm">
                                <div class="mb-3">
                                    <label for="milestoneTitle" class="form-label">Title</label>
                                    <input type="text" class="form-control" id="milestoneTitle" required>
                                </div>
                                <div class="mb-3">
                                    <label for="milestoneDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="milestoneDescription" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="milestoneProgress" class="form-label">Progress (%)</label>
                                    <input type="range" class="form-range" id="milestoneProgress" min="0" max="100" value="0">
                                    <div class="text-center" id="progressValue">0%</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="timelineManager.saveNewMilestone()">Add Milestone</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('milestoneModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup progress slider
        const progressSlider = document.getElementById('milestoneProgress');
        const progressValue = document.getElementById('progressValue');
        progressSlider.addEventListener('input', (e) => {
            progressValue.textContent = `${e.target.value}%`;
        });
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('milestoneModal'));
        modal.show();
    }
    
    /**
     * Save new milestone
     */
    saveNewMilestone() {
        const title = document.getElementById('milestoneTitle').value.trim();
        const description = document.getElementById('milestoneDescription').value.trim();
        const progress = parseInt(document.getElementById('milestoneProgress').value);
        
        if (!title || !description) {
            app.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const milestone = {
            title,
            description,
            date: 'Today',
            progress,
            icon: 'star',
            status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'upcoming'
        };
        
        this.milestones.push(milestone);
        this.saveMilestones();
        this.renderTimeline();
        app.showNotification('Milestone added successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('milestoneModal'));
        modal.hide();
    }
    
    /**
     * Render timeline using Flexbox
     */
    renderTimeline() {
        const timelineContainer = document.getElementById('progressTimeline');
        if (!timelineContainer) return;
        
        timelineContainer.innerHTML = this.milestones.map((milestone, index) => 
            this.createTimelineItem(milestone, index)
        ).join('');
        
        // Re-apply animations
        app.animateTimeline();
    }
    
    /**
     * Create timeline item HTML
     * @param {Object} milestone - Milestone data
     * @param {number} index - Milestone index
     * @returns {string} HTML string
     */
    createTimelineItem(milestone, index) {
        const progressClass = milestone.progress === 100 ? 'bg-success' : 
                            milestone.progress >= 50 ? 'bg-warning' : '';
        const progressText = milestone.progress === 100 ? 'Complete' : 
                           milestone.progress > 0 ? `${milestone.progress}% Progress` : 'Upcoming';
        
        const statusClass = milestone.status === 'completed' ? 'completed' : 
                          milestone.status === 'in-progress' ? 'in-progress' : 'upcoming';
        
        return `
            <article class="timeline-item fade-in ${statusClass}" data-index="${index}">
                <div class="timeline-content">
                    <h4><i class="fas fa-${milestone.icon}" aria-hidden="true"></i> ${this.escapeHtml(milestone.title)}</h4>
                    <p>${this.escapeHtml(milestone.description)}</p>
                    <div class="progress mt-3" role="progressbar" aria-label="Milestone progress" aria-valuenow="${milestone.progress}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar ${progressClass}" style="width: ${milestone.progress}%">
                            ${progressText}
                        </div>
                    </div>
                </div>
                <div class="timeline-icon">
                    <i class="fas fa-${milestone.icon}" aria-hidden="true"></i>
                </div>
                <div class="timeline-date">${this.escapeHtml(milestone.date)}</div>
            </article>
        `;
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
let app, nutritionPage, timelineManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    app = new FitnessTrackerApp();
    
    // Make app globally accessible for onclick handlers
    window.app = app;
    
    // Initialize page-specific managers after a short delay to ensure DOM is ready
    setTimeout(() => {
        // Initialize nutrition page if on nutrition page
        if (document.getElementById('mealPlan') || document.getElementById('macroForm')) {
            nutritionPage = new NutritionPage();
            window.nutritionPage = nutritionPage;
        }
        
        // Initialize timeline manager if on progress page
        if (document.getElementById('progressTimeline')) {
            timelineManager = new TimelineManager();
            window.timelineManager = timelineManager;
        }
        
        // Re-initialize app to setup page-specific features
        if (app && app.init) {
            app.init();
        }
    }, 100);
    
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('Service Worker registered:', registration);
        }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    }
});