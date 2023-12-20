document.getElementById('addBtn').addEventListener('click', addItem);

async function addItem() {
    const r_no = getRNoFromURL();
    const b_ref = document.getElementById('bookRef').value;
    const input = document.getElementById("itemForm");
    const inputData = new FormData(input);

    const items = [];
    inputData.forEach((value, name) => {
        const itemName = name;
        const itemQty = parseInt(value);
        if (itemQty > 0) {
            items.push({ itemName, itemQty, b_ref });
        }
    });

    console.log('Items to be sent:', items);

    if (items.length === 0) {
        alert("Please select item quantity.");
        return;
    }

    try {
        const response = await fetch(`/room-details/${r_no}/add-item/${b_ref}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }), // Fix: Pass the items array directly
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            alert('Items added successfully');
            location.reload();
        } else {
            console.error('Error:', data.message);
            // Handle error, e.g., show an error message
        }
    } catch (error) {
        console.error('Error:', error.message);
        // Handle unexpected errors
    }
}

function getRNoFromURL() {
    const urlParts = window.location.href.split('/');
    return urlParts[4];
}

document.getElementById('deleteBtn').addEventListener('click', deleterow);

function deleterow () {
        const itemIndex = this.getAttribute('data-itemindex');
        const itemName = document.querySelectorAll('.tableOfItem td')[itemIndex].innerText;

        // Assuming 'r_no' is available in your JavaScript, replace it accordingly
        const r_no = getRNoFromURL();
        const b_ref = document.getElementById('bookRef').value;

        fetch(`/room-details/${r_no}/delete-item/${b_ref}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemName }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.message)
            document.querySelectorAll('.tableOfItem tr')[itemIndex].remove();
            location.reload();
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      };
