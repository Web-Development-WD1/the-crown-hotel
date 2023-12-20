async function getAvailableRooms() {
    const checkin = document.getElementById('checkinDate').value;
    const checkout = document.getElementById('checkoutDate').value;
    const rtype = document.getElementById('rtype').value;

    try {
        const response = await fetch('/get-available-rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checkin, checkout, rtype }),
        });

        const data = await response.json();

        const rnoSelect = document.getElementById('rno');
        rnoSelect.innerHTML = '<option value="Select-room-no" disabled selected>Select room no.</option>';

        if (data?.availableRooms && Array.isArray(data.availableRooms)) {
            data.availableRooms.forEach(({ r_no }) => {
                const option = document.createElement('option');
                option.value = r_no;
                option.textContent = r_no;
                rnoSelect.appendChild(option);
            });
        } else {
            console.error('Error: Unexpected data format or availableRooms is not an array');
        }

        calTotalPrice();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function calTotalPrice() {
    const night = document.getElementById('night').value;
    const rtype = document.getElementById('rtype').value;
    const checkinDate = document.getElementById('checkinDate').value;
    const checkoutDate = document.getElementById('checkoutDate').value;

    if (night && rtype && checkinDate && checkoutDate) {
        fetch('/calculate-total-price', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ night, rtype }),
        })
        .then(response => response.json())
        .then(({ totalPrice }) => {
            const totalPriceInput = document.getElementById('totalPrice');
            totalPriceInput.value = totalPrice !== undefined ? totalPrice : "";
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
    }
}

function handleFinishBooking() {
    const formData = {
      fname: document.getElementById("fname").value,
      lname: document.getElementById("lname").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      note: document.getElementById("note").value,
      cardno: document.getElementById("cardno").value,
      cardexp: document.getElementById("cardexp").value,
      cvc: document.getElementById("cvc").value,
      checkinDate: document.getElementById("checkinDate").value,
      checkoutDate: document.getElementById("checkoutDate").value,
      totalPrice: document.getElementById("totalPrice").value,
      rno: document.getElementById("rno").value,
    };

    console.log("Form Data:", formData);
    fetch("/submit-form", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    })
    .then((response) => {
    return response.json();
    })
    .then((data) => {
    console.log("Form submission response:", data);
    if (data.success) {
        alert("New reservation has been created successfully!");
        window.location.href = "/customer-reservation";
    } else {
        console.error("Failed to submit form:", data.error);
    }
    })
    .catch((error) => {
    console.error("Error submitting form:", error);
    });
}

function backtodetails() {
    alert("New reservation has been created successfully!");
    window.location.href = "/customer-reservation";
}