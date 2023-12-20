let selectedRoom;

function showRoomData(r_no, r_class) {
    sessionStorage.setItem('selectedRoom', r_no + ' ' + r_class);
}

function getRoomDescription(r_class) {
    const classMapping = {
        'sup_d': 'Superior Double Room',
        'std_d': 'Standard Double Room',
        'sup_t': 'Superior Twin Room',
        'std_t': 'Standard Twin Room'
    };

    return classMapping[r_class] || r_class;
}

document.addEventListener('DOMContentLoaded', function () {
    const roomNoElement = document.getElementById('roomno');
    const roomDescElement = document.getElementById('roomdesc');

    const selectedRoom = sessionStorage.getItem('selectedRoom');

    if (selectedRoom) {
        // Split the selectedRoom string into room number and room class
        const [r_no, r_class] = selectedRoom.split(' ');

        // Get the user-friendly room description
        const roomDescription = getRoomDescription(r_class);

        // Update the HTML elements with the room number and room description
        roomNoElement.textContent = r_no;
        roomDescElement.textContent = roomDescription;
    } else {
        console.log('no room number reference');
    }
});