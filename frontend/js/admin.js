document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-template-form');
    const messageArea = document.getElementById('message-area');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageArea.textContent = ''; // Clear previous messages
        messageArea.className = ''; // Clear previous classes

        const formData = new FormData(form);

        // Optional: Log FormData entries for debugging
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}:`, value);
        // }

        try {
            const response = await fetch('http://localhost:3000/api/templates', {
                method: 'POST',
                body: formData, // FormData will set Content-Type to multipart/form-data automatically
            });

            const result = await response.json();

            if (response.ok) {
                messageArea.textContent = 'Template uploaded successfully! ID: ' + (result.id || '');
                messageArea.className = 'success';
                form.reset(); // Clear the form
            } else {
                messageArea.textContent = 'Error: ' + (result.error || 'Unknown error');
                messageArea.className = 'error';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageArea.textContent = 'Network error or server is unreachable. Check console for details.';
            messageArea.className = 'error';
        }
    });
});
