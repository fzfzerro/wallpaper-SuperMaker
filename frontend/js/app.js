document.addEventListener('DOMContentLoaded', () => {
    const mockupDisplayArea = document.getElementById('mockup-display-area');
    const templateSelectionArea = document.getElementById('template-selection-area');
    const mockupWallpaperImage = document.getElementById('mockup-wallpaper-image');

    function positionWallpaper(imgElement, screenData) {
        if (!imgElement || !screenData) return;

        imgElement.style.position = 'absolute';
        imgElement.style.top = (screenData.y || 0) + 'px';
        imgElement.style.left = (screenData.x || 0) + 'px';
        imgElement.style.width = (screenData.width || '100%') + 'px';
        imgElement.style.height = (screenData.height || '100%') + 'px';
        imgElement.style.objectFit = 'cover'; // Or 'contain'
        imgElement.style.display = 'block';
    }

    function switchTemplate(templateIdentifier, frameImageUrl, screenX, screenY, screenWidth, screenHeight) {
        // Remove any existing template classes from display area
        const classesToRemove = [];
        for (let i = 0; i < mockupDisplayArea.classList.length; i++) {
            if (mockupDisplayArea.classList[i].startsWith('active-template-')) {
                classesToRemove.push(mockupDisplayArea.classList[i]);
            }
        }
        classesToRemove.forEach(cls => mockupDisplayArea.classList.remove(cls));

        // Add the new template class
        if (templateIdentifier) {
            mockupDisplayArea.classList.add(`active-template-${templateIdentifier}`);
        }

        // Update mockup display area with the device frame image
        // This part will be enhanced in later tasks to position the user's wallpaper correctly.
        // For now, we can set the background of the mockup area to the frame image or create an img element for it.
        // Let's try setting a background image for now, and store screen coordinates for later.
        if (frameImageUrl) {
            mockupDisplayArea.style.backgroundImage = `url('${frameImageUrl}')`;
            // CSS will handle background size, position, repeat for the frame

            // Store screen coordinates on the mockupDisplayArea's dataset
            mockupDisplayArea.dataset.screenX = screenX || 0;
            mockupDisplayArea.dataset.screenY = screenY || 0;
            mockupDisplayArea.dataset.screenWidth = screenWidth || 'auto'; // Use 'auto' or '100%' if no specific value
            mockupDisplayArea.dataset.screenHeight = screenHeight || 'auto';

            // If a wallpaper is already loaded, re-position it
            if (mockupWallpaperImage.src && mockupWallpaperImage.src !== '#' && mockupWallpaperImage.style.display !== 'none') {
                positionWallpaper(mockupWallpaperImage, {
                    x: mockupDisplayArea.dataset.screenX,
                    y: mockupDisplayArea.dataset.screenY,
                    width: mockupDisplayArea.dataset.screenWidth,
                    height: mockupDisplayArea.dataset.screenHeight
                });
            }

        } else {
            mockupDisplayArea.style.backgroundImage = 'none';
            // Optionally hide or reset wallpaper image if no template is selected
            // mockupWallpaperImage.style.display = 'none';
        }
    }

    async function fetchAndDisplayTemplates() {
        try {
            const response = await fetch('http://localhost:3000/api/templates');
            if (!response.ok) {
                console.error('Failed to fetch templates:', response.status, await response.text());
                templateSelectionArea.innerHTML = '<p>Error loading templates. Is the backend running and DB populated?</p>';
                return;
            }
            const templates = await response.json();

            templateSelectionArea.innerHTML = ''; // Clear placeholder buttons

            if (templates.length === 0) {
                templateSelectionArea.innerHTML = '<p>No templates found. Add some via the backend API.</p>';
                // Apply a default state to mockupDisplayArea if no templates
                switchTemplate('default', null); // 'default' or some other indicator
                 mockupDisplayArea.innerHTML = '<p>No templates loaded. Upload an image and select a template.</p>';
            } else {
                 mockupDisplayArea.innerHTML = ''; // Clear any previous message
            }


            templates.forEach(template => {
                const button = document.createElement('button');
                button.textContent = template.name;
                // Use template.css_class for visual distinction if available, otherwise template.id
                const templateIdentifier = template.css_class || `template-${template.id}`;
                button.dataset.template = templateIdentifier;

                // Store all necessary data for rendering the mockup
                button.dataset.frameImageUrl = template.image_url; // URL of the device frame image
                button.dataset.screenX = template.screen_x;
                button.dataset.screenY = template.screen_y;
                button.dataset.screenWidth = template.screen_width;
                button.dataset.screenHeight = template.screen_height;
                button.dataset.cssClass = template.css_class; // Store original css_class if needed

                button.addEventListener('click', () => {
                    switchTemplate(
                        templateIdentifier,
                        template.image_url,
                        template.screen_x,
                        template.screen_y,
                        template.screen_width,
                        template.screen_height
                    );
                });
                templateSelectionArea.appendChild(button);
            });

            // Automatically select the first template if templates are loaded
            if (templates.length > 0) {
                const firstTemplate = templates[0];
                const firstTemplateIdentifier = firstTemplate.css_class || `template-${firstTemplate.id}`;
                switchTemplate(
                    firstTemplateIdentifier,
                    firstTemplate.image_url,
                    firstTemplate.screen_x,
                    firstTemplate.screen_y,
                    firstTemplate.screen_width,
                    firstTemplate.screen_height
                );
            }

        } catch (error) {
            console.error('Error fetching or displaying templates:', error);
            templateSelectionArea.innerHTML = '<p>Could not connect to backend. Is it running?</p>';
        }
    }

    // Color picker functionality
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            const colorId = event.target.id; // e.g., "color1"
            const colorValue = event.target.value;
            const cssVarName = `--${colorId}`; // e.g., "--color1"
            document.documentElement.style.setProperty(cssVarName, colorValue);
        });
    });

    // Image upload functionality
    const wallpaperUploadInput = document.getElementById('wallpaper-upload');
    // mockupWallpaperImage is already declared at the top

    wallpaperUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mockupWallpaperImage.src = e.target.result;
                // Retrieve screen data from the mockupDisplayArea's dataset
                const screenData = {
                    x: mockupDisplayArea.dataset.screenX,
                    y: mockupDisplayArea.dataset.screenY,
                    width: mockupDisplayArea.dataset.screenWidth,
                    height: mockupDisplayArea.dataset.screenHeight
                };
                positionWallpaper(mockupWallpaperImage, screenData);
            };
            reader.readAsDataURL(file);
        } else {
            mockupWallpaperImage.src = '#';
            mockupWallpaperImage.style.display = 'none';
        }
    });

    // Initial load
    fetchAndDisplayTemplates();
});
