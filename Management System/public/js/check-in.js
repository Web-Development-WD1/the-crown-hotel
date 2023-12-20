

// check in button

function editData(button) { 
            
    // Get the parent row of the clicked button 
    let row = button.parentNode.parentNode; 
    
    // Get the cells within the row 
    let nameCell = row.cells[0]; 
    let emailCell = row.cells[1]; 
    let mobileCell = row.cells[2]; 
    let addressCell = row.cells[3]; 
    
    // Prompt the user to enter updated values 
    let nameInput = 
        prompt("Enter the updated name:", 
            nameCell.innerHTML); 
    let emailInput = 
        prompt("Enter the updated email:", 
            emailCell.innerHTML); 
    let numberInput = 
        prompt("Enter the updated mobile details:", 
            mobileCell.innerHTML 
        ); 
    let addressInput = 
        prompt("Enter the updated address:", 
            addressCell.innerHTML 
        ); 
    
    // Update the cell contents with the new values 
    nameCell.innerHTML = nameInput; 
    emailCell.innerHTML = emailInput; 
    mobileCell.innerHTML = numberInput; 
    addressCell.innerHTML = addressInput; 
} 