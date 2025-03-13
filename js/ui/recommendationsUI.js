/**
 * Death Note: Killer Within - Recommendations UI Module
 * Handles displaying game recommendations based on current settings
 */

(function() {
    'use strict';

    // Recommendations UI Module
    const RecommendationsUI = {
        // DOM element references
        elements: {
            recommendationsContainer: null
        },

        /**
         * Initialize the Recommendations UI module
         */
        initialize: function() {
            this._initializeElements();
            this._setupEventListeners();
            this.updateRecommendations();

            console.log('Recommendations UI initialized');
        },

        /**
         * Update the recommendations in the UI
         */
        updateRecommendations: function() {
            const recommendations = DeathNote.getModule('recommendations');
            if (!recommendations) {
                console.error('Recommendations module not available');
                return;
            }

            if (!this.elements.recommendationsContainer) {
                console.error('Recommendations container not found');
                return;
            }

            // Get active recommendations
            const activeRecommendations = recommendations.getActiveRecommendations();

            // Clear previous recommendations
            this.elements.recommendationsContainer.innerHTML = '';

            if (activeRecommendations.length === 0) {
                this.elements.recommendationsContainer.innerHTML = '<p class="text-muted">No recommendations at this time. Your settings look good!</p>';
                return;
            }

            // Add each recommendation to the container
            activeRecommendations.forEach(recommendation => {
                const recommendationElement = document.createElement('div');
                recommendationElement.className = 'recommendation-item';
                recommendationElement.innerHTML = recommendation.message;
                this.elements.recommendationsContainer.appendChild(recommendationElement);
            });
        },

        // Private methods

        /**
         * Initialize DOM element references
         * @private
         */
        _initializeElements: function() {
            this.elements.recommendationsContainer = document.getElementById('recommendations-container');

            if (!this.elements.recommendationsContainer) {
                console.error('Recommendations container element not found');
            }
        },

        /**
         * Set up event listeners for UI interactions
         * @private
         */
        _setupEventListeners: function() {
            // Listen for settings changes to update recommendations
            document.addEventListener('settings:changed', () => {
                this.updateRecommendations();
            });
        }
    };

    // Register with the UI namespace
    DeathNote.ui.recommendations = RecommendationsUI;
})();