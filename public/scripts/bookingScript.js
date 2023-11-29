
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Booking Script loaded');

    // Fetch and display available rooms
    await fetchAndDisplayAvailableRooms();

    // Define the function to fetch and display available rooms
    async function fetchAndDisplayAvailableRooms() {
        const checkInDate = new URLSearchParams(window.location.search).get('checkInDate');
        const checkOutDate = new URLSearchParams(window.location.search).get('checkOutDate');

        console.log('Fetching available rooms...');

        try {
            const response = await fetch('/available-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ checkInDate, checkOutDate }),
            });

            console.log('Fetch completed.');

            if (!response.ok) {
                throw new Error(`Failed to fetch available rooms. Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data received:', data);

            // Display available rooms dynamically
            displayAvailableRooms(data);
        } catch (error) {
            console.error('Error fetching available rooms:', error.message);
        }
    }

    // Display available rooms function
    function displayAvailableRooms(rooms) {
        const infoFound = document.querySelector('.info-found');
        const reservationContainer = document.querySelector('.reservation');

        if (infoFound && reservationContainer) {
            // Update the number of available rooms
            infoFound.innerHTML = `<h2>${rooms.length} room(s) found:</h2>`;

            // Get the first room (assuming only one room is returned)
            const room = rooms[0];

            // Find the room info elements
            const roomImage = reservationContainer.querySelector('.room-info img');
            const roomDescription = reservationContainer.querySelector('.room-info .text-description');

            // Update room image and description
            if (roomImage && roomDescription) {
                roomImage.src = `../assets/${room.r_class}.jpg`;  // Update the image source
                roomImage.alt = `Room ${room.r_no}`;
                roomDescription.innerHTML = `
                    <h2>${room.r_class}</h2>
                    <p><strong></p>
                    <h3>Price: ${room.price_per_night}</h3>
                    <label for="numRooms">No. of Rooms:</label>
                    <input type="number" id="numRooms" name="numRooms" value="1" min="1">
                `;
            } else {
                console.error("Room info elements not found.");
            }

        } else {
            console.error("Elements with classes .info-found or .reservation not found.");
        }
    }
});
