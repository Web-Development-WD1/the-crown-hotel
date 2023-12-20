document.getElementById('changeToAvailableBtn').addEventListener('click', async () => {
    try {
        // fetch request to update the room status
        const response = await fetch(`/change-room-to-available/<%= r_no %>`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Change the button text after the status is successfully updated
            document.getElementById('changeToAvailableBtn').textContent = 'Room is now available';
        } else {
            console.error('Failed to update room status');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
});

// Display a notification if successful, and then take the user to the previous page
document.getElementById('changeToAvailableBtn').addEventListener('click', async function () {

    try {
        const response = await fetch(`/change-room-to-available/<%= r_no %>`, {
            method: 'POST',
        });

        if (response.ok) {
            const result = await response.json();

            // Display push notification
            alert(result.message);

            // Redirect to the previous page
            window.history.back();
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
});