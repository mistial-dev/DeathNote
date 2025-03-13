/**
 * Death Note: Killer Within - Enhanced Recommendations UI Module
 * Handles displaying game recommendations based on current settings
 */

(function() {
    'use strict';

    // Create or extend the DeathNote namespace
    window.DeathNote = window.DeathNote || {};
    window.DeathNote.ui = window.DeathNote.ui || {};

    /**
     * Recommendations UI Module
     */
    const RecommendationsUI = {
        // DOM element references
        elements: {
            recommendationsContainer: null
        },

        // Icons for recommendation categories
        categoryIcons: {
            "gameplay": "fas fa-gamepad",
            "balance": "fas fa-balance-scale",
            "player_experience": "fas fa-user",
            "roles": "fas fa-users",
            "timing": "fas fa-clock",
            "difficulty": "fas fa-mountain",
            "communication": "fas fa-comments",
            "mechanics": "fas fa-cogs",
            "player_count": "fas fa-user-friends",
            "region": "fas fa-globe-americas"
        },

        // Track initialization state
        initialized: false,

        /**
         * Initialize the Recommendations UI module
         */
        initialize: function() {
            if (this.initialized) {
                console.log('Recommendations UI already initialized');
                return;
            }

            console.log('Initializing Enhanced Recommendations UI');

            // Use deferred initialization to ensure DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this._completeInitialization();
                });
            } else {
                this._completeInitialization();
            }
        },

        /**
         * Complete initialization once DOM is ready
         * @private
         */
        _completeInitialization: function() {
            this._initializeElements();

            if (!this._validateElements()) {
                console.error('Required DOM elements not found for Recommendations UI. Retrying in 500ms...');

                // Retry after a short delay
                setTimeout(() => {
                    this._initializeElements();
                    if (this._validateElements()) {
                        console.log('Recommendations UI elements found on retry');
                        this._setupEventListeners();
                        this.updateRecommendations();
                        this.initialized = true;
                    } else {
                        console.error('Failed to initialize Recommendations UI after retry');
                    }
                }, 500);
                return;
            }

            this._setupEventListeners();

            // Initial update
            this.updateRecommendations();

            this.initialized = true;
            console.log('Recommendations UI initialization completed successfully');
        },

        /**
         * Update the recommendations in the UI
         */
        updateRecommendations: function() {
            console.log('Updating recommendations display');

            if (!this._validateElements()) {
                console.error('Cannot update recommendations - container not found');
                return;
            }

            // Try to get the recommendations module
            let recommendationsModule = null;

            // First check in DeathNote directly
            if (window.DeathNote && window.DeathNote.recommendations) {
                recommendationsModule = window.DeathNote.recommendations;
                console.log('Found recommendations in DeathNote.recommendations');
            }
            // Then check in registered modules
            else if (window.DeathNote && window.DeathNote.getModule) {
                recommendationsModule = window.DeathNote.getModule('recommendations');
                console.log('Found recommendations in registered modules');
            }

            if (!recommendationsModule) {
                console.error('Recommendations module not available');
                this.elements.recommendationsContainer.innerHTML = '<p class="text-muted">Recommendations not available. Please refresh the page.</p>';
                return;
            }

            try {
                // Ensure the recommendations module is initialized
                if (!recommendationsModule.initialized && typeof recommendationsModule.initialize === 'function') {
                    console.log('Initializing recommendations module first');
                    recommendationsModule.initialize();
                }

                // Get active recommendations
                if (typeof recommendationsModule.getActiveRecommendations !== 'function') {
                    console.error('getActiveRecommendations method not found');
                    this.elements.recommendationsContainer.innerHTML = '<p class="text-muted">Recommendations functionality is not available.</p>';
                    return;
                }

                const activeRecommendations = recommendationsModule.getActiveRecommendations();
                console.log(`Got ${activeRecommendations.length} active recommendations`);

                // Clear previous recommendations
                this.elements.recommendationsContainer.innerHTML = '';

                if (activeRecommendations.length === 0) {
                    this.elements.recommendationsContainer.innerHTML = '<p class="text-muted">No recommendations at this time. Your settings look good!</p>';
                    return;
                }

                // Sort recommendations by priority (highest first) for display
                activeRecommendations.sort((a, b) => b.priority - a.priority);

                // Group recommendations by category for better organization
                const categorizedRecommendations = this._categorizeRecommendations(activeRecommendations);

                // Create the recommendations list
                const recommendationsList = document.createElement('div');
                recommendationsList.className = 'recommendations-list';

                // Add each recommendation
                activeRecommendations.forEach(recommendation => {
                    const recommendationElement = this._createRecommendationElement(recommendation);
                    recommendationsList.appendChild(recommendationElement);
                });

                this.elements.recommendationsContainer.appendChild(recommendationsList);
            } catch (error) {
                console.error('Error updating recommendations:', error);
                this.elements.recommendationsContainer.innerHTML = '<p class="text-danger">Error generating recommendations. Please check the console for details.</p>';
            }
        },

        /**
         * Categorize recommendations by category
         * @private
         * @param {Array} recommendations - List of recommendations
         * @returns {Object} Recommendations organized by category
         */
        _categorizeRecommendations: function(recommendations) {
            const categorized = {};

            recommendations.forEach(rec => {
                const category = rec.category || 'other';
                if (!categorized[category]) {
                    categorized[category] = [];
                }
                categorized[category].push(rec);
            });

            return categorized;
        },

        /**
         * Create a styled recommendation element
         * @private
         * @param {Object} recommendation - Recommendation object
         * @returns {HTMLElement} Styled recommendation element
         */
        _createRecommendationElement: function(recommendation) {
            const recommendationElement = document.createElement('div');
            recommendationElement.className = 'recommendation-item';

            // Add priority class
            if (recommendation.priority >= 9) {
                recommendationElement.classList.add('recommendation-high-priority');
            } else if (recommendation.priority >= 7) {
                recommendationElement.classList.add('recommendation-medium-priority');
            } else {
                recommendationElement.classList.add('recommendation-low-priority');
            }

            // Add category icon if available
            const categoryIcon = this.categoryIcons[recommendation.category] || 'fas fa-info-circle';

            // Create icon element
            const iconElement = document.createElement('div');
            iconElement.className = 'recommendation-icon';
            iconElement.innerHTML = `<i class="${categoryIcon}"></i>`;

            // Create content element
            const contentElement = document.createElement('div');
            contentElement.className = 'recommendation-content';
            contentElement.innerHTML = recommendation.message;

            // Add elements to recommendation item
            recommendationElement.appendChild(iconElement);
            recommendationElement.appendChild(contentElement);

            // Add data attributes for debugging/reference
            recommendationElement.dataset.id = recommendation.id;
            if (recommendation.group) recommendationElement.dataset.group = recommendation.group;
            if (recommendation.category) recommendationElement.dataset.category = recommendation.category;
            if (recommendation.priority) recommendationElement.dataset.priority = recommendation.priority;

            return recommendationElement;
        },

        // Private methods

        /**
         * Initialize DOM element references
         * @private
         */
        _initializeElements: function() {
            this.elements.recommendationsContainer = document.getElementById('recommendations-container');

            // Log element status
            console.log('Recommendations container found:', !!this.elements.recommendationsContainer);
        },

        /**
         * Validate that required elements exist
         * @private
         * @returns {boolean} True if all required elements exist
         */
        _validateElements: function() {
            return this.elements.recommendationsContainer !== null;
        },

        /**
         * Set up event listeners for UI interactions
         * @private
         */
        _setupEventListeners: function() {
            // Listen for settings changes to update recommendations
            document.addEventListener('deathNote:settings:changed', () => {
                console.log('Settings changed event detected, updating recommendations');
                this.updateRecommendations();
            });

            // Listen for recommendations update event
            document.addEventListener('deathNote:recommendations:updated', () => {
                console.log('Recommendations updated event detected');
                this.updateRecommendations();
            });

            // Listen for direct update request
            document.addEventListener('deathNote:recommendations:update', () => {
                console.log('Recommendations update requested');
                this.updateRecommendations();
            });

            // Force an update request after a delay
            setTimeout(() => {
                console.log('Sending delayed recommendations update request');
                document.dispatchEvent(new CustomEvent('deathNote:recommendations:update'));
            }, 1000);
        }
    };

    // Assign to DeathNote namespace
    window.DeathNote.ui.recommendations = RecommendationsUI;

    // Module registration for DeathNote
    const recommendationsUiModule = {
        initialize: function() {
            console.log('Enhanced Recommendations UI module initializing via module registration');
            RecommendationsUI.initialize();
        },
        recommendations: RecommendationsUI
    };

    // Register this module when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Enhanced Recommendations UI module loaded");

        // Initialize the module
        RecommendationsUI.initialize();

        // Try to register with DeathNote
        if (window.DeathNote && window.DeathNote.registerModule) {
            if (window.DeathNote.ui) {
                window.DeathNote.ui.recommendations = RecommendationsUI;
                window.DeathNote.registerModule('ui', window.DeathNote.ui);
            } else {
                window.DeathNote.registerModule('ui', recommendationsUiModule);
            }
            console.log('Registered enhanced recommendations UI with DeathNote');
        } else {
            console.warn('Unable to register recommendations UI module');
        }

        // Dispatch event for module loaded
        document.dispatchEvent(new CustomEvent('deathNote:module:ui:recommendations:registered'));
    });
})();