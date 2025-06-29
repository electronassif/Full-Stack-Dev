// ========================================
// FitTrack Pro - Exercise Manager
// Author: Fakhoury Elias Nassif
// Lebanese University - Faculty of Engineering
// Full Stack Development Project
// ========================================

'use strict';

/**
 * Workout Page Manager Class
 * Handles all workout-related functionality
 */
class WorkoutPage {
    constructor() {
        this.workouts = this.loadWorkouts();
        this.currentFilter = 'all';
        this.customWorkouts = this.loadCustomWorkouts() || [];
        this.exerciseApiKey = 'vHyjXdu0UE/aPutIOQZA6w==Sc6jhkID8Fu5YmAe'; // Replace with actual API key
        this.init();
    }

    /**
     * Initialize workout page
     */
    async init() {
        try {
            this.displayWorkouts();
            this.setupEventListeners();
            await this.loadExerciseDatabase();
        } catch (error) {
            console.error('Failed to initialize workout page:', error);
            app.showNotification('Failed to load workouts', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter button click handling with accessibility
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const muscle = e.currentTarget.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (muscle) {
                    this.updateFilterButtons(e.currentTarget);
                    this.filterByMuscle(muscle);
                }
            });
            
            // Keyboard accessibility
            btn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Workouts tab click handler
        const workoutsTab = document.getElementById('workouts-tab');
        if (workoutsTab) {
            workoutsTab.addEventListener('click', () => {
                // Ensure workouts are displayed when tab is clicked
                setTimeout(() => this.displayWorkouts(), 100);
            });
        }
    }

    /**
     * Update filter button states
     * @param {HTMLElement} activeBtn - The clicked button
     */
    updateFilterButtons(activeBtn) {
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
    }

    /**
     * Load exercise database from API
     */
    async loadExerciseDatabase() {
        const cacheKey = 'exerciseDatabase';
        const cachedData = this.getCachedData(cacheKey, 86400000); // 24 hour cache
        
        if (cachedData) {
            return cachedData;
        }
        
        try {
            // Using API Ninjas Exercise API
            const response = await fetch('https://api.api-ninjas.com/v1/exercises?limit=50', {
                headers: {
                    'X-Api-Key': this.exerciseApiKey
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const exercises = await response.json();
            this.setCachedData(cacheKey, exercises);
            
            // Merge with existing workouts
            this.mergeApiExercises(exercises);
        } catch (error) {
            console.error('Failed to load exercise database:', error);
            // Continue with local data
        }
    }

    /**
     * Merge API exercises with local workouts
     * @param {Array} apiExercises - Exercises from API
     */
    mergeApiExercises(apiExercises) {
        // Implementation to merge API data with local workouts
        // This would enhance the existing workout database
    }

    /**
     * Load workouts from storage and defaults
     * @returns {Array} Array of workout objects
     */
    loadWorkouts() {
        // Default workout programs
        const defaultWorkouts = [
            {
                id: 1,
                name: 'Chest Day - Hypertrophy',
                muscle: 'chest',
                difficulty: 'intermediate',
                duration: '60 min',
                exercises: [
                    { name: 'Barbell Bench Press', sets: '4', reps: '8-10', rest: '90s', tips: 'Keep shoulder blades retracted' },
                    { name: 'Incline Dumbbell Press', sets: '4', reps: '10-12', rest: '75s', tips: '30-45 degree incline' },
                    { name: 'Cable Flyes', sets: '3', reps: '12-15', rest: '60s', tips: 'Focus on the stretch' },
                    { name: 'Dips', sets: '3', reps: 'To Failure', rest: '90s', tips: 'Lean forward for chest emphasis' },
                    { name: 'Push-ups', sets: '3', reps: 'To Failure', rest: '60s', tips: 'Maintain straight body line' }
                ]
            },
            {
                id: 2,
                name: 'Back & Biceps Power',
                muscle: 'back',
                difficulty: 'intermediate',
                duration: '75 min',
                exercises: [
                    { name: 'Deadlifts', sets: '4', reps: '6-8', rest: '120s', tips: 'Keep back straight, chest up' },
                    { name: 'Pull-ups', sets: '4', reps: '8-12', rest: '90s', tips: 'Full range of motion' },
                    { name: 'Barbell Rows', sets: '4', reps: '10-12', rest: '75s', tips: 'Pull to lower chest' },
                    { name: 'Cable Rows', sets: '3', reps: '12-15', rest: '60s', tips: 'Squeeze shoulder blades' },
                    { name: 'Barbell Curls', sets: '3', reps: '10-12', rest: '60s', tips: 'Control the negative' },
                    { name: 'Hammer Curls', sets: '3', reps: '12-15', rest: '45s', tips: 'Keep elbows stationary' }
                ]
            },
            {
                id: 3,
                name: 'Leg Day - Strength',
                muscle: 'legs',
                difficulty: 'advanced',
                duration: '90 min',
                exercises: [
                    { name: 'Back Squats', sets: '5', reps: '5', rest: '180s', tips: 'Hip crease below knees' },
                    { name: 'Romanian Deadlifts', sets: '4', reps: '8-10', rest: '90s', tips: 'Feel hamstring stretch' },
                    { name: 'Leg Press', sets: '4', reps: '12-15', rest: '75s', tips: 'Full depth, knees tracking toes' },
                    { name: 'Leg Curls', sets: '3', reps: '12-15', rest: '60s', tips: 'Pause at peak contraction' },
                    { name: 'Calf Raises', sets: '4', reps: '15-20', rest: '45s', tips: 'Full range, pause at top' },
                    { name: 'Walking Lunges', sets: '3', reps: '20 steps', rest: '90s', tips: 'Keep torso upright' }
                ]
            },
            {
                id: 4,
                name: 'Shoulder Sculpting',
                muscle: 'shoulders',
                difficulty: 'intermediate',
                duration: '60 min',
                exercises: [
                    { name: 'Military Press', sets: '4', reps: '8-10', rest: '90s', tips: 'Core tight, no back arch' },
                    { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10-12', rest: '75s', tips: 'Natural arc movement' },
                    { name: 'Lateral Raises', sets: '4', reps: '12-15', rest: '45s', tips: 'Lead with elbows' },
                    { name: 'Face Pulls', sets: '3', reps: '15-20', rest: '45s', tips: 'Pull to eye level' },
                    { name: 'Rear Delt Flyes', sets: '3', reps: '15', rest: '45s', tips: 'Slight bend in elbows' },
                    { name: 'Upright Rows', sets: '3', reps: '12-15', rest: '60s', tips: 'Wide grip for safety' }
                ]
            },
            {
                id: 5,
                name: 'Arms Blast',
                muscle: 'arms',
                difficulty: 'beginner',
                duration: '45 min',
                exercises: [
                    { name: 'Close-Grip Bench Press', sets: '4', reps: '10', rest: '75s', tips: 'Hands shoulder-width' },
                    { name: 'Preacher Curls', sets: '4', reps: '10-12', rest: '60s', tips: 'Full extension at bottom' },
                    { name: 'Tricep Dips', sets: '3', reps: '12-15', rest: '60s', tips: 'Keep elbows close' },
                    { name: 'Cable Curls', sets: '3', reps: '15', rest: '45s', tips: 'Constant tension' },
                    { name: 'Overhead Tricep Extension', sets: '3', reps: '12-15', rest: '60s', tips: 'Keep elbows in' },
                    { name: '21s Bicep Curls', sets: '3', reps: '21', rest: '75s', tips: '7 bottom, 7 top, 7 full' }
                ]
            },
            {
                id: 6,
                name: 'Core Crusher',
                muscle: 'core',
                difficulty: 'intermediate',
                duration: '30 min',
                exercises: [
                    { name: 'Plank', sets: '3', reps: '60 seconds', rest: '30s', tips: 'Straight line from head to heels' },
                    { name: 'Russian Twists', sets: '4', reps: '20', rest: '45s', tips: 'Keep chest up' },
                    { name: 'Leg Raises', sets: '3', reps: '15', rest: '45s', tips: 'Control the descent' },
                    { name: 'Ab Wheel', sets: '3', reps: '10-12', rest: '60s', tips: 'Keep core tight throughout' },
                    { name: 'Mountain Climbers', sets: '3', reps: '30 seconds', rest: '30s', tips: 'Fast pace, hips low' },
                    { name: 'Dead Bug', sets: '3', reps: '10 per side', rest: '45s', tips: 'Lower back pressed to floor' }
                ]
            },
            {
                id: 7,
                name: 'Full Body HIIT',
                muscle: 'all',
                difficulty: 'advanced',
                duration: '45 min',
                exercises: [
                    { name: 'Burpees', sets: '4', reps: '10', rest: '45s', tips: 'Explosive jump at top' },
                    { name: 'Box Jumps', sets: '4', reps: '12', rest: '60s', tips: 'Land softly, step down' },
                    { name: 'Battle Ropes', sets: '3', reps: '30 seconds', rest: '45s', tips: 'Maintain rhythm' },
                    { name: 'Kettlebell Swings', sets: '4', reps: '15', rest: '45s', tips: 'Hip hinge, not squat' },
                    { name: 'Medicine Ball Slams', sets: '3', reps: '15', rest: '45s', tips: 'Full body engagement' },
                    { name: 'Sled Push/Pull', sets: '3', reps: '40 yards', rest: '90s', tips: 'Low body position' }
                ]
            },
            {
                id: 8,
                name: 'Push Day - Volume',
                muscle: 'chest',
                difficulty: 'intermediate',
                duration: '70 min',
                exercises: [
                    { name: 'Flat Bench Press', sets: '5', reps: '10', rest: '90s', tips: 'Touch chest, full lockout' },
                    { name: 'Overhead Press', sets: '4', reps: '8-10', rest: '90s', tips: 'Start from front rack' },
                    { name: 'Incline Dumbbell Press', sets: '4', reps: '12', rest: '75s', tips: 'Feel chest stretch' },
                    { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s', tips: 'Control the weight' },
                    { name: 'Tricep Pushdowns', sets: '4', reps: '15', rest: '45s', tips: 'Lock out at bottom' }
                ]
            }
        ];

        // Merge with custom workouts from storage
        const saved = localStorage.getItem('customWorkouts');
        if (saved) {
            try {
                const customWorkouts = JSON.parse(saved);
                return [...defaultWorkouts, ...customWorkouts];
            } catch (error) {
                console.error('Error loading custom workouts:', error);
            }
        }
        
        return defaultWorkouts;
    }

    /**
     * Load custom workouts from storage
     * @returns {Array|null} Saved custom workouts or null
     */
    loadCustomWorkouts() {
        const saved = localStorage.getItem('customWorkouts');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading custom workouts:', error);
            return [];
        }
    }

    /**
     * Save custom workouts to storage
     */
    saveCustomWorkouts() {
        try {
            localStorage.setItem('customWorkouts', JSON.stringify(this.customWorkouts));
        } catch (error) {
            console.error('Error saving custom workouts:', error);
            app.showNotification('Failed to save workout', 'error');
        }
    }

    /**
     * Filter workouts by muscle group
     * @param {string} muscle - Muscle group to filter by
     */
    filterByMuscle(muscle) {
        this.currentFilter = muscle;
        this.displayWorkouts();
        
        // Track filter usage
        this.trackEvent('workout_filter', { muscle });
    }

    /**
     * Display filtered workouts
     */
    displayWorkouts() {
        const container = document.getElementById('workoutsList');
        if (!container) return;

        const filteredWorkouts = this.currentFilter === 'all' 
            ? this.workouts 
            : this.workouts.filter(w => w.muscle === this.currentFilter);

        if (filteredWorkouts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No workouts found for this muscle group.</p>
                    <button class="btn btn-primary mt-3" onclick="workoutPage.createCustomWorkout()">
                        <i class="fas fa-plus"></i> Create One
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredWorkouts.map(workout => 
            this.createWorkoutCard(workout)
        ).join('');

        // Add animation
        this.animateWorkoutCards();
    }

    /**
     * Animate workout cards on display
     */
    animateWorkoutCards() {
        const cards = document.querySelectorAll('.workout-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Create workout card HTML
     * @param {Object} workout - Workout object
     * @returns {string} HTML string
     */
    createWorkoutCard(workout) {
        const difficultyClass = `difficulty-${workout.difficulty}`;
        const difficultyIcon = {
            beginner: 'fa-battery-quarter',
            intermediate: 'fa-battery-half',
            advanced: 'fa-battery-full'
        }[workout.difficulty];

        const exercises = workout.exercises.map(ex => `
            <div class="exercise-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${this.escapeHtml(ex.name)}</strong>
                        <small class="text-muted d-block">Rest: ${ex.rest}</small>
                        ${ex.tips ? `<small class="text-info d-block"><i class="fas fa-info-circle"></i> ${this.escapeHtml(ex.tips)}</small>` : ''}
                    </div>
                    <span class="sets-reps">${ex.sets} x ${ex.reps}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="col-lg-6 mb-4">
                <article class="workout-card" role="article">
                    <span class="difficulty-badge ${difficultyClass}">
                        <i class="fas ${difficultyIcon}"></i> ${workout.difficulty}
                    </span>
                    <h3><i class="fas fa-dumbbell"></i> ${this.escapeHtml(workout.name)}</h3>
                    <p class="text-muted mb-1">Target: ${workout.muscle}</p>
                    <p class="text-muted mb-3"><i class="fas fa-clock"></i> Duration: ${workout.duration}</p>
                    <div class="exercise-list mb-3" role="list">
                        ${exercises}
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-primary" onclick="workoutPage.startWorkout(${workout.id})" aria-label="Start ${this.escapeHtml(workout.name)} workout">
                            <i class="fas fa-play"></i> Start Workout
                        </button>
                        <button class="btn btn-outline-secondary" onclick="workoutPage.editWorkout(${workout.id})" aria-label="Edit ${this.escapeHtml(workout.name)} workout">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${workout.custom ? `
                            <button class="btn btn-outline-danger" onclick="workoutPage.deleteWorkout(${workout.id})" aria-label="Delete ${this.escapeHtml(workout.name)} workout">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </article>
            </div>
        `;
    }

    /**
     * Start workout session
     * @param {number} workoutId - ID of workout to start
     */
    startWorkout(workoutId) {
        const workout = this.workouts.find(w => w.id === workoutId);
        if (!workout) {
            app.showNotification('Workout not found', 'error');
            return;
        }

        // Initialize workout session
        const session = new WorkoutSession(workout);
        session.start();
        
        // Track workout start
        this.trackEvent('workout_started', { 
            workout: workout.name, 
            muscle: workout.muscle,
            difficulty: workout.difficulty 
        });
    }

    /**
     * Edit workout
     * @param {number} workoutId - ID of workout to edit
     */
    editWorkout(workoutId) {
        const workout = this.workouts.find(w => w.id === workoutId);
        if (!workout) {
            app.showNotification('Workout not found', 'error');
            return;
        }

        // For now, show notification
        app.showNotification(`Editing ${workout.name} - Feature coming soon!`);
    }

    /**
     * Delete custom workout
     * @param {number} workoutId - ID of workout to delete
     */
    deleteWorkout(workoutId) {
        const workout = this.workouts.find(w => w.id === workoutId);
        if (!workout || !workout.custom) {
            app.showNotification('Cannot delete default workouts', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete "${workout.name}"?`)) {
            // Remove from arrays
            this.workouts = this.workouts.filter(w => w.id !== workoutId);
            this.customWorkouts = this.customWorkouts.filter(w => w.id !== workoutId);
            
            // Save and refresh
            this.saveCustomWorkouts();
            this.displayWorkouts();
            
            app.showNotification('Workout deleted successfully');
        }
    }

    /**
     * Create custom workout modal
     */
    createCustomWorkout() {
        // Create modal for custom workout
        const modalHtml = `
            <div class="modal fade" id="customWorkoutModal" tabindex="-1" aria-labelledby="customWorkoutModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="customWorkoutModalLabel">Create Custom Workout</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="customWorkoutForm" novalidate>
                                <div class="mb-3">
                                    <label for="workoutName" class="form-label">Workout Name</label>
                                    <input type="text" class="form-control" id="workoutName" required>
                                    <div class="invalid-feedback">Please enter a workout name</div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="targetMuscle" class="form-label">Target Muscle</label>
                                        <select class="form-select" id="targetMuscle" required>
                                            <option value="chest">Chest</option>
                                            <option value="back">Back</option>
                                            <option value="legs">Legs</option>
                                            <option value="shoulders">Shoulders</option>
                                            <option value="arms">Arms</option>
                                            <option value="core">Core</option>
                                            <option value="all">Full Body</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="workoutDifficulty" class="form-label">Difficulty</label>
                                        <select class="form-select" id="workoutDifficulty" required>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate" selected>Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="workoutDuration" class="form-label">Duration</label>
                                        <input type="text" class="form-control" id="workoutDuration" placeholder="e.g., 60 min" required>
                                        <div class="invalid-feedback">Please enter duration</div>
                                    </div>
                                </div>
                                <div id="exercisesList">
                                    <h6>Exercises <small class="text-muted">(Add at least one)</small></h6>
                                    <div class="exercise-input-group mb-3">
                                        <div class="row">
                                            <div class="col-md-3">
                                                <input type="text" class="form-control exercise-name" placeholder="Exercise name" required>
                                            </div>
                                            <div class="col-md-2">
                                                <input type="text" class="form-control exercise-sets" placeholder="Sets" required>
                                            </div>
                                            <div class="col-md-2">
                                                <input type="text" class="form-control exercise-reps" placeholder="Reps" required>
                                            </div>
                                            <div class="col-md-2">
                                                <input type="text" class="form-control exercise-rest" placeholder="Rest" required>
                                            </div>
                                            <div class="col-md-2">
                                                <input type="text" class="form-control exercise-tips" placeholder="Tips (optional)">
                                            </div>
                                            <div class="col-md-1 d-flex align-items-center">
                                                <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.exercise-input-group').remove()" aria-label="Remove exercise">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="workoutPage.addExerciseInput()">
                                    <i class="fas fa-plus"></i> Add Exercise
                                </button>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="workoutPage.saveCustomWorkout()">
                                Save Workout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('customWorkoutModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('customWorkoutModal'));
        modal.show();
    }

    /**
     * Add exercise input row
     */
    addExerciseInput() {
        const exercisesList = document.getElementById('exercisesList');
        const newExercise = document.createElement('div');
        newExercise.className = 'exercise-input-group mb-3';
        newExercise.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <input type="text" class="form-control exercise-name" placeholder="Exercise name" required>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control exercise-sets" placeholder="Sets" required>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control exercise-reps" placeholder="Reps" required>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control exercise-rest" placeholder="Rest" required>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control exercise-tips" placeholder="Tips (optional)">
                </div>
                <div class="col-md-1 d-flex align-items-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.exercise-input-group').remove()" aria-label="Remove exercise">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        exercisesList.appendChild(newExercise);
    }

    /**
     * Save custom workout
     */
    saveCustomWorkout() {
        const form = document.getElementById('customWorkoutForm');
        
        // Basic validation
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            app.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const name = document.getElementById('workoutName').value.trim();
        const muscle = document.getElementById('targetMuscle').value;
        const difficulty = document.getElementById('workoutDifficulty').value;
        const duration = document.getElementById('workoutDuration').value.trim();

        // Collect exercises
        const exercises = [];
        document.querySelectorAll('.exercise-input-group').forEach(group => {
            const exerciseName = group.querySelector('.exercise-name').value.trim();
            const sets = group.querySelector('.exercise-sets').value.trim();
            const reps = group.querySelector('.exercise-reps').value.trim();
            const rest = group.querySelector('.exercise-rest').value.trim();
            const tips = group.querySelector('.exercise-tips').value.trim();
            
            if (exerciseName && sets && reps && rest) {
                exercises.push({
                    name: exerciseName,
                    sets: sets,
                    reps: reps,
                    rest: rest,
                    tips: tips || null
                });
            }
        });

        if (exercises.length === 0) {
            app.showNotification('Please add at least one exercise', 'error');
            return;
        }

        // Create new workout
        const newWorkout = {
            id: Date.now(),
            name,
            muscle,
            difficulty,
            duration: duration || '60 min',
            exercises,
            custom: true,
            createdAt: new Date().toISOString()
        };

        // Add to workouts
        this.workouts.push(newWorkout);
        this.customWorkouts.push(newWorkout);
        this.saveCustomWorkouts();

        // Close modal and refresh display
        const modal = bootstrap.Modal.getInstance(document.getElementById('customWorkoutModal'));
        modal.hide();
        
        // Apply current filter to show the new workout if applicable
        this.displayWorkouts();
        
        app.showNotification('Custom workout created successfully!');
        
        // Track creation
        this.trackEvent('custom_workout_created', { 
            muscle, 
            difficulty, 
            exerciseCount: exercises.length 
        });
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {any} Cached data or null
     */
    getCachedData(key, maxAge) {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;
        
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp > maxAge) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }
            return data.value;
        } catch (error) {
            return null;
        }
    }

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} value - Data to cache
     */
    setCachedData(key, value) {
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    /**
     * Track analytics event
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data = {}) {
        // Implement analytics tracking
        console.log(`Event tracked: ${eventName}`, data);
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
 * Workout Session Class
 * Manages active workout sessions
 */
class WorkoutSession {
    constructor(workout) {
        this.workout = workout;
        this.currentExerciseIndex = 0;
        this.currentSet = 1;
        this.startTime = null;
        this.timer = null;
        this.restTimer = null;
        this.completedExercises = [];
        this.sessionId = Date.now();
    }

    /**
     * Start workout session
     */
    start() {
        this.startTime = Date.now();
        this.showWorkoutModal();
        
        // Save session to track progress
        this.saveSessionState();
    }

    /**
     * Show workout session modal
     */
    showWorkoutModal() {
        const modalHtml = `
            <div class="modal fade" id="workoutSessionModal" tabindex="-1" data-bs-backdrop="static" aria-labelledby="workoutSessionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="workoutSessionModalLabel">${this.escapeHtml(this.workout.name)}</h5>
                            <button type="button" class="btn-close" onclick="workoutSession.pauseWorkout()" aria-label="Pause workout"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <h2 id="sessionTimer" class="display-5">00:00</h2>
                                <p class="text-muted">Total Time</p>
                            </div>
                            <div id="currentExercise" class="text-center" aria-live="polite">
                                <!-- Current exercise will be displayed here -->
                            </div>
                            <div class="progress mt-4" role="progressbar" aria-label="Workout progress">
                                <div id="workoutProgress" class="progress-bar" style="width: 0%"></div>
                            </div>
                            <div id="exerciseTips" class="alert alert-info mt-3" style="display: none;">
                                <i class="fas fa-info-circle"></i> <span id="tipsContent"></span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="workoutSession.previousExercise()" aria-label="Previous exercise">
                                <i class="fas fa-backward"></i> Previous
                            </button>
                            <button type="button" class="btn btn-success" onclick="workoutSession.logSet()" id="logSetBtn" aria-label="Log completed set">
                                <i class="fas fa-check"></i> Complete Set
                            </button>
                            <button type="button" class="btn btn-primary" onclick="workoutSession.nextSet()" aria-label="Next set">
                                <i class="fas fa-forward"></i> Next Set
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('workoutSessionModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Store session globally for button access
        window.workoutSession = this;

        // Show modal and start timer
        const modal = new bootstrap.Modal(document.getElementById('workoutSessionModal'));
        modal.show();

        this.startTimer();
        this.displayCurrentExercise();
    }

    /**
     * Start session timer
     */
    startTimer() {
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            const timerElement = document.getElementById('sessionTimer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    /**
     * Display current exercise information
     */
    displayCurrentExercise() {
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        const container = document.getElementById('currentExercise');
        
        if (!container || !exercise) return;
        
        container.innerHTML = `
            <h3>${this.escapeHtml(exercise.name)}</h3>
            <div class="d-flex justify-content-center gap-4 my-3">
                <div class="text-center">
                    <h4 class="display-6">${this.currentSet}/${exercise.sets}</h4>
                    <p class="text-muted">Set</p>
                </div>
                <div class="text-center">
                    <h4 class="display-6">${exercise.reps}</h4>
                    <p class="text-muted">Reps</p>
                </div>
                <div class="text-center">
                    <h4 class="display-6">${exercise.rest}</h4>
                    <p class="text-muted">Rest</p>
                </div>
            </div>
        `;

        // Show tips if available
        if (exercise.tips) {
            const tipsSection = document.getElementById('exerciseTips');
            const tipsContent = document.getElementById('tipsContent');
            if (tipsSection && tipsContent) {
                tipsContent.textContent = exercise.tips;
                tipsSection.style.display = 'block';
            }
        } else {
            const tipsSection = document.getElementById('exerciseTips');
            if (tipsSection) {
                tipsSection.style.display = 'none';
            }
        }

        // Update progress
        this.updateProgress();
    }

    /**
     * Update workout progress bar
     */
    updateProgress() {
        const totalExercises = this.workout.exercises.length;
        const completedExercises = this.completedExercises.length;
        const currentProgress = this.currentSet / parseInt(this.workout.exercises[this.currentExerciseIndex].sets);
        
        const overallProgress = ((completedExercises + currentProgress) / totalExercises) * 100;
        
        const progressBar = document.getElementById('workoutProgress');
        if (progressBar) {
            progressBar.style.width = `${overallProgress}%`;
            progressBar.textContent = `${Math.round(overallProgress)}%`;
        }
    }

    /**
     * Log completed set
     */
    logSet() {
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        
        // Log the set
        const setLog = {
            exercise: exercise.name,
            set: this.currentSet,
            timestamp: Date.now()
        };
        
        // Save to session
        this.saveSetLog(setLog);
        
        // Visual feedback
        app.showNotification(`Set ${this.currentSet} completed!`);
        
        // Automatically move to next set
        this.nextSet();
    }

    /**
     * Move to next set
     */
    nextSet() {
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        
        if (this.currentSet < parseInt(exercise.sets)) {
            this.currentSet++;
            this.startRestTimer(exercise.rest);
        } else {
            this.nextExercise();
        }
        
        this.displayCurrentExercise();
    }

    /**
     * Move to next exercise
     */
    nextExercise() {
        if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
            this.completedExercises.push(this.workout.exercises[this.currentExerciseIndex]);
            this.currentExerciseIndex++;
            this.currentSet = 1;
            this.displayCurrentExercise();
            
            app.showNotification('Great job! Moving to next exercise');
        } else {
            this.completeWorkout();
        }
    }

    /**
     * Move to previous exercise
     */
    previousExercise() {
        if (this.currentExerciseIndex > 0) {
            this.currentExerciseIndex--;
            this.currentSet = 1;
            this.displayCurrentExercise();
        }
    }

    /**
     * Start rest timer
     * @param {string} restTime - Rest duration
     */
    startRestTimer(restTime) {
        // Clear any existing rest timer
        if (this.restTimer) {
            clearInterval(this.restTimer);
        }
        
        // Parse rest time (e.g., "90s" -> 90)
        const seconds = parseInt(restTime);
        let remaining = seconds;

        const container = document.getElementById('currentExercise');
        const restDisplay = document.createElement('div');
        restDisplay.className = 'alert alert-warning mt-3';
        restDisplay.id = 'restTimerDisplay';
        restDisplay.innerHTML = `
            <h5><i class="fas fa-clock"></i> Rest Time: <span id="restCountdown">${remaining}</span>s</h5>
            <div class="progress mt-2">
                <div id="restProgress" class="progress-bar bg-warning" style="width: 100%"></div>
            </div>
        `;
        
        // Remove existing rest timer display
        const existingDisplay = document.getElementById('restTimerDisplay');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        container.appendChild(restDisplay);

        // Play sound notification
        this.playRestStartSound();

        this.restTimer = setInterval(() => {
            remaining--;
            const progressPercent = (remaining / seconds) * 100;
            
            document.getElementById('restCountdown').textContent = remaining;
            document.getElementById('restProgress').style.width = `${progressPercent}%`;
            
            if (remaining <= 3 && remaining > 0) {
                // Warning beeps for last 3 seconds
                this.playWarningSound();
            }
            
            if (remaining <= 0) {
                clearInterval(this.restTimer);
                restDisplay.remove();
                app.showNotification('Rest complete! Start next set');
                this.playRestEndSound();
            }
        }, 1000);
    }

    /**
     * Pause workout
     */
    pauseWorkout() {
        if (confirm('Are you sure you want to pause this workout?')) {
            clearInterval(this.timer);
            clearInterval(this.restTimer);
            
            // Save current state
            this.saveSessionState();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('workoutSessionModal'));
            modal.hide();
            
            app.showNotification('Workout paused. You can resume later.');
        }
    }

    /**
     * Complete workout
     */
    completeWorkout() {
        clearInterval(this.timer);
        clearInterval(this.restTimer);
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        
        // Save workout history
        const history = {
            id: this.sessionId,
            workout: this.workout.name,
            muscle: this.workout.muscle,
            date: new Date().toISOString(),
            duration: minutes,
            completed: true,
            exercises: this.completedExercises.length + 1,
            totalExercises: this.workout.exercises.length
        };
        
        this.saveWorkoutHistory(history);
        
        // Show completion modal
        this.showCompletionModal(minutes);
        
        // Close workout modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('workoutSessionModal'));
        modal.hide();
    }

    /**
     * Show workout completion modal
     * @param {number} minutes - Workout duration in minutes
     */
    showCompletionModal(minutes) {
        const modalHtml = `
            <div class="modal fade" id="completionModal" tabindex="-1" aria-labelledby="completionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="completionModalLabel">Workout Complete! 🎉</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <i class="fas fa-trophy fa-5x text-warning mb-3"></i>
                            <h3>Great Job!</h3>
                            <p>You completed <strong>${this.escapeHtml(this.workout.name)}</strong> in ${minutes} minutes!</p>
                            <div class="row mt-4">
                                <div class="col-6">
                                    <h5>${this.workout.exercises.length}</h5>
                                    <p class="text-muted">Exercises</p>
                                </div>
                                <div class="col-6">
                                    <h5>${this.calculateTotalSets()}</h5>
                                    <p class="text-muted">Total Sets</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.location.href='progress.html'">
                                View Progress
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('completionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add and show modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('completionModal'));
        modal.show();
    }

    /**
     * Calculate total sets completed
     * @returns {number} Total sets
     */
    calculateTotalSets() {
        let total = 0;
        this.workout.exercises.forEach(exercise => {
            total += parseInt(exercise.sets);
        });
        return total;
    }

    /**
     * Save workout history
     * @param {Object} history - Workout history object
     */
    saveWorkoutHistory(history) {
        try {
            let workoutHistory = localStorage.getItem('workoutHistory');
            workoutHistory = workoutHistory ? JSON.parse(workoutHistory) : [];
            workoutHistory.push(history);
            
            // Keep only last 100 workouts
            if (workoutHistory.length > 100) {
                workoutHistory = workoutHistory.slice(-100);
            }
            
            localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        } catch (error) {
            console.error('Failed to save workout history:', error);
        }
    }

    /**
     * Save session state for resuming
     */
    saveSessionState() {
        const state = {
            sessionId: this.sessionId,
            workout: this.workout,
            currentExerciseIndex: this.currentExerciseIndex,
            currentSet: this.currentSet,
            completedExercises: this.completedExercises,
            startTime: this.startTime
        };
        
        try {
            localStorage.setItem('activeWorkoutSession', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save session state:', error);
        }
    }

    /**
     * Save set log
     * @param {Object} setLog - Set log data
     */
    saveSetLog(setLog) {
        try {
            let logs = localStorage.getItem(`workout_logs_${this.sessionId}`);
            logs = logs ? JSON.parse(logs) : [];
            logs.push(setLog);
            localStorage.setItem(`workout_logs_${this.sessionId}`, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save set log:', error);
        }
    }

    /**
     * Play rest start sound
     */
    playRestStartSound() {
        // Simple audio feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.frequency.value = 440; // A4
            oscillator.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio not supported
        }
    }

    /**
     * Play warning sound
     */
    playWarningSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.frequency.value = 880; // A5
            oscillator.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (error) {
            // Silently fail
        }
    }

    /**
     * Play rest end sound
     */
    playRestEndSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.frequency.value = 523.25; // C5
            oscillator.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Silently fail
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
 * Exercise Database Class
 * Manages exercise information and search
 */
class ExerciseDatabase {
    constructor() {
        this.exercises = this.loadExerciseDatabase();
        this.init();
    }

    /**
     * Initialize database
     */
    init() {
        // Setup search functionality if needed
    }

    /**
     * Load exercise database
     * @returns {Object} Exercise database organized by muscle group
     */
    loadExerciseDatabase() {
        // Comprehensive exercise database
        return {
            chest: [
                'Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Bench Press',
                'Decline Bench Press', 'Cable Flyes', 'Pec Deck', 'Push-ups',
                'Dips', 'Cable Crossover', 'Chest Press Machine', 'Dumbbell Flyes',
                'Incline Dumbbell Press', 'Decline Dumbbell Press', 'Wide-Grip Push-ups',
                'Diamond Push-ups', 'Chest Dips', 'Landmine Press', 'Svend Press'
            ],
            back: [
                'Deadlifts', 'Pull-ups', 'Chin-ups', 'Barbell Rows', 'Dumbbell Rows',
                'T-Bar Rows', 'Cable Rows', 'Lat Pulldowns', 'Face Pulls', 'Shrugs',
                'Rack Pulls', 'Good Mornings', 'Hyperextensions', 'Reverse Flyes',
                'Straight-Arm Pulldowns', 'Pendlay Rows', 'Kroc Rows', 'Meadows Rows'
            ],
            legs: [
                'Back Squats', 'Front Squats', 'Leg Press', 'Romanian Deadlifts',
                'Leg Curls', 'Leg Extensions', 'Calf Raises', 'Walking Lunges',
                'Bulgarian Split Squats', 'Hack Squats', 'Goblet Squats', 'Box Squats',
                'Stiff-Leg Deadlifts', 'Glute Ham Raises', 'Step-ups', 'Pistol Squats',
                'Nordic Curls', 'Leg Press Calf Raises'
            ],
            shoulders: [
                'Military Press', 'Dumbbell Shoulder Press', 'Arnold Press',
                'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Upright Rows',
                'Face Pulls', 'Cable Lateral Raises', 'Shoulder Shrugs', 'Behind-Neck Press',
                'Bradford Press', 'Bus Drivers', 'Plate Raises', 'Band Pull-Aparts',
                'High Pulls', 'Cuban Press', 'Y-Raises'
            ],
            arms: [
                'Barbell Curls', 'Dumbbell Curls', 'Hammer Curls', 'Preacher Curls',
                'Cable Curls', 'Close-Grip Bench Press', 'Tricep Dips', 'Overhead Extension',
                'Tricep Pushdowns', 'Diamond Push-ups', 'Concentration Curls', '21s',
                'Spider Curls', 'Drag Curls', 'Skull Crushers', 'Kickbacks', 'French Press',
                'Cable Hammer Curls'
            ],
            core: [
                'Plank', 'Side Plank', 'Russian Twists', 'Leg Raises', 'Bicycle Crunches',
                'Ab Wheel', 'Mountain Climbers', 'Dead Bug', 'Bird Dog', 'Pallof Press',
                'Hanging Leg Raises', 'L-Sits', 'Dragon Flags', 'Hollow Body Hold',
                'V-Ups', 'Cable Crunches', 'Wood Chops', 'Farmers Walk'
            ]
        };
    }

    /**
     * Search exercises by name
     * @param {string} query - Search query
     * @returns {Array} Matching exercises
     */
    searchExercises(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        Object.entries(this.exercises).forEach(([muscle, exercises]) => {
            exercises.forEach(exercise => {
                if (exercise.toLowerCase().includes(searchTerm)) {
                    results.push({ 
                        name: exercise, 
                        muscle,
                        matchScore: this.calculateMatchScore(exercise, searchTerm)
                    });
                }
            });
        });
        
        // Sort by match score
        return results.sort((a, b) => b.matchScore - a.matchScore);
    }

    /**
     * Calculate match score for search results
     * @param {string} exercise - Exercise name
     * @param {string} searchTerm - Search term
     * @returns {number} Match score
     */
    calculateMatchScore(exercise, searchTerm) {
        const lowerExercise = exercise.toLowerCase();
        
        // Exact match
        if (lowerExercise === searchTerm) return 100;
        
        // Starts with
        if (lowerExercise.startsWith(searchTerm)) return 90;
        
        // Word starts with
        const words = lowerExercise.split(' ');
        if (words.some(word => word.startsWith(searchTerm))) return 80;
        
        // Contains
        return 70;
    }

    /**
     * Get exercises by muscle group
     * @param {string} muscle - Muscle group
     * @returns {Array} Exercises for the muscle group
     */
    getExercisesByMuscle(muscle) {
        return this.exercises[muscle] || [];
    }

    /**
     * Get random exercises
     * @param {string} muscle - Muscle group
     * @param {number} count - Number of exercises
     * @returns {Array} Random exercises
     */
    getRandomExercises(muscle, count = 5) {
        const exercises = this.getExercisesByMuscle(muscle);
        const shuffled = [...exercises].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

/**
 * Workout Progress Tracker Class
 * Tracks personal records and workout history
 */
class WorkoutProgressTracker {
    constructor() {
        this.personalRecords = this.loadPersonalRecords() || {};
        this.workoutHistory = this.loadWorkoutHistory() || [];
        this.init();
    }

    /**
     * Initialize tracker
     */
    init() {
        this.cleanupOldData();
    }

    /**
     * Load personal records
     * @returns {Object|null} Personal records or null
     */
    loadPersonalRecords() {
        const saved = localStorage.getItem('personalRecords');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading personal records:', error);
            return null;
        }
    }

    /**
     * Load workout history
     * @returns {Array|null} Workout history or null
     */
    loadWorkoutHistory() {
        const saved = localStorage.getItem('workoutHistory');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading workout history:', error);
            return null;
        }
    }

    /**
     * Add personal record
     * @param {string} exercise - Exercise name
     * @param {number} weight - Weight lifted
     * @param {number} reps - Repetitions performed
     */
    addPersonalRecord(exercise, weight, reps) {
        if (!this.personalRecords[exercise]) {
            this.personalRecords[exercise] = [];
        }
        
        const oneRepMax = this.calculateOneRepMax(weight, reps);
        const previousPR = this.getCurrentPR(exercise);
        
        const record = {
            weight,
            reps,
            date: new Date().toISOString(),
            oneRepMax
        };
        
        this.personalRecords[exercise].push(record);
        this.savePersonalRecords();
        
        // Check if it's a new PR
        if (!previousPR || oneRepMax > previousPR.oneRepMax) {
            app.showNotification(`New PR for ${exercise}! ${weight}kg x ${reps} reps 🎉`);
            this.celebrateNewPR();
        }
    }

    /**
     * Get current PR for an exercise
     * @param {string} exercise - Exercise name
     * @returns {Object|null} Current PR or null
     */
    getCurrentPR(exercise) {
        const records = this.personalRecords[exercise];
        if (!records || records.length === 0) return null;
        
        return records.reduce((best, current) => 
            current.oneRepMax > best.oneRepMax ? current : best
        );
    }

    /**
     * Calculate one rep max using Epley Formula
     * @param {number} weight - Weight lifted
     * @param {number} reps - Repetitions performed
     * @returns {number} Estimated one rep max
     */
    calculateOneRepMax(weight, reps) {
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    }

    /**
     * Save personal records
     */
    savePersonalRecords() {
        try {
            localStorage.setItem('personalRecords', JSON.stringify(this.personalRecords));
        } catch (error) {
            console.error('Failed to save personal records:', error);
        }
    }

    /**
     * Get workout statistics
     * @returns {Object} Workout statistics
     */
    getStats() {
        const totalWorkouts = this.workoutHistory.length;
        const thisWeek = this.getWorkoutsThisWeek();
        const thisMonth = this.getWorkoutsThisMonth();
        const streak = this.calculateStreak();
        const favoriteExercise = this.getFavoriteExercise();
        
        return {
            totalWorkouts,
            thisWeek: thisWeek.length,
            thisMonth: thisMonth.length,
            streak,
            favoriteExercise,
            totalVolume: this.calculateTotalVolume(),
            averageDuration: this.calculateAverageDuration()
        };
    }

    /**
     * Get workouts from this week
     * @returns {Array} This week's workouts
     */
    getWorkoutsThisWeek() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.workoutHistory.filter(w => 
            new Date(w.date) > weekAgo
        );
    }

    /**
     * Get workouts from this month
     * @returns {Array} This month's workouts
     */
    getWorkoutsThisMonth() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        return this.workoutHistory.filter(w => 
            new Date(w.date) > monthAgo
        );
    }

    /**
     * Calculate workout streak
     * @returns {number} Current streak in days
     */
    calculateStreak() {
        if (this.workoutHistory.length === 0) return 0;
        
        // Sort workouts by date
        const sortedWorkouts = [...this.workoutHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedWorkouts.length; i++) {
            const workoutDate = new Date(sortedWorkouts[i].date);
            workoutDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - streak);
            
            if (workoutDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else if (workoutDate < expectedDate) {
                break;
            }
        }
        
        return streak;
    }

    /**
     * Get favorite exercise based on frequency
     * @returns {string|null} Most performed exercise
     */
    getFavoriteExercise() {
        const exerciseCount = {};
        
        // Count all exercises from PR records
        Object.keys(this.personalRecords).forEach(exercise => {
            exerciseCount[exercise] = this.personalRecords[exercise].length;
        });
        
        // Find most frequent
        let favorite = null;
        let maxCount = 0;
        
        Object.entries(exerciseCount).forEach(([exercise, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favorite = exercise;
            }
        });
        
        return favorite;
    }

    /**
     * Calculate total volume lifted
     * @returns {number} Total volume in kg
     */
    calculateTotalVolume() {
        let totalVolume = 0;
        
        Object.values(this.personalRecords).forEach(records => {
            records.forEach(record => {
                totalVolume += record.weight * record.reps;
            });
        });
        
        return totalVolume;
    }

    /**
     * Calculate average workout duration
     * @returns {number} Average duration in minutes
     */
    calculateAverageDuration() {
        if (this.workoutHistory.length === 0) return 0;
        
        const totalDuration = this.workoutHistory.reduce((sum, workout) => 
            sum + (workout.duration || 0), 0
        );
        
        return Math.round(totalDuration / this.workoutHistory.length);
    }

    /**
     * Celebrate new PR with visual effect
     */
    celebrateNewPR() {
        // Create confetti effect
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall 3s ease-out forwards;
                z-index: 9999;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    /**
     * Clean up old data to manage storage
     */
    cleanupOldData() {
        // Keep only last 6 months of data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // Clean workout history
        this.workoutHistory = this.workoutHistory.filter(w => 
            new Date(w.date) > sixMonthsAgo
        );
        
        // Clean personal records (keep only best and recent)
        Object.keys(this.personalRecords).forEach(exercise => {
            const records = this.personalRecords[exercise];
            const bestRecord = this.getCurrentPR(exercise);
            const recentRecords = records.filter(r => 
                new Date(r.date) > sixMonthsAgo
            );
            
            // Keep best record and recent records
            this.personalRecords[exercise] = [
                bestRecord,
                ...recentRecords.filter(r => r !== bestRecord)
            ].filter(Boolean);
        });
        
        // Save cleaned data
        this.savePersonalRecords();
        localStorage.setItem('workoutHistory', JSON.stringify(this.workoutHistory));
    }
}

// Add confetti animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the progress page
    if (document.getElementById('workoutsList')) {
        // Initialize workout page
        window.workoutPage = new WorkoutPage();
        
        // Initialize exercise database
        window.exerciseDB = new ExerciseDatabase();
        
        // Initialize progress tracker
        window.progressTracker = new WorkoutProgressTracker();
        
        // Check for resumed workout session
        const savedSession = localStorage.getItem('activeWorkoutSession');
        if (savedSession) {
            try {
                const sessionData = JSON.parse(savedSession);
                if (confirm('You have an unfinished workout. Would you like to resume?')) {
                    const session = new WorkoutSession(sessionData.workout);
                    Object.assign(session, sessionData);
                    session.showWorkoutModal();
                    session.displayCurrentExercise();
                } else {
                    localStorage.removeItem('activeWorkoutSession');
                }
            } catch (error) {
                console.error('Failed to resume workout session:', error);
                localStorage.removeItem('activeWorkoutSession');
            }
        }
    }
});

// Also initialize when window is fully loaded to ensure all scripts are ready
window.addEventListener('load', () => {
    // Re-initialize workout page if it exists but hasn't been initialized
    if (document.getElementById('workoutsList') && !window.workoutPage) {
        window.workoutPage = new WorkoutPage();
    }
    
    if (document.getElementById('workoutsList') && !window.exerciseDB) {
        window.exerciseDB = new ExerciseDatabase();
    }
    
    if (document.getElementById('workoutsList') && !window.progressTracker) {
        window.progressTracker = new WorkoutProgressTracker();
    }
});