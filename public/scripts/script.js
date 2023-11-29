
document.addEventListener('DOMContentLoaded', function () {
    console.log('Homepage Script loaded');

    const bookNowButton = document.getElementById('bookNowButton');
    if (bookNowButton) {
        bookNowButton.addEventListener('click', async function () {
            console.log('Button clicked');
            await redirectToBookingPage();
        });
    } else {
        console.error('Button not found');
    }

    // Redirect to the booking page
    async function redirectToBookingPage() {
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;

        const bookingPageUrl = `/html/booking.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        console.log(`Redirecting to booking page: ${bookingPageUrl}`);
        window.location.href = bookingPageUrl;
    }
});

