function clearFilter() {
    var clear, roomFilter, roomTypeFilter, roomStatusFilter;
    clear = document.getElementById("clear");
    roomFilter = document.getElementById("r-ref");
    roomTypeFilter = document.getElementById("room-type");
    roomStatusFilter = document.getElementById("status");

    roomFilter.value = "";
    roomTypeFilter.value = "Select Room Type";
    roomStatusFilter.value = "Select Status";
    filterRoomNo()
}

function clearFilter1() {
    var clear, roomFilter, roomTypeFilter, roomStatusFilter;
    clear = document.getElementById("clear1");
    bookFilter = document.getElementById("b-ref");
    bookTypeFilter = document.getElementById("checkinDate");
    bookStatusFilter = document.getElementById("b_status");

    bookFilter.value = "";
    bookTypeFilter.value = "";
    bookStatusFilter.value = "";
    filterBookNo()
}

function filterBookNo(){
    var input1, filter, table, tr, td, i, txtValue;
    input1 = document.getElementById("b-ref");
    filter = input1.value;
    table = document.getElementById("guestTable");
    tr = table.getElementsByTagName("tr");
    
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

function filterRoomNo() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("r-ref");
    filter = input.value;
    table = document.getElementById("roomTable");
    tr = table.getElementsByTagName("tr");
    
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

function filterRoomType() {
    var input, filter, table, tr, td, i, txtValue;
    select = document.getElementById("room-type") 
    filter = select.value;
    table = document.getElementById("roomTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1]; // Use index 1 for the second column (Room Type)
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function filterStatus() {
    var input, filter, table, tr, td, i, txtValue;
    select = document.getElementById("status") 
    filter = select.value;
    table = document.getElementById("roomTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase() === filter.toUpperCase()) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function filterCheckin(){
    var select, filter, table, tr, td, i, txtValue;
    select = document.getElementById("checkinDate") 
    filter = select.value;
    table = document.getElementById("guestTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[3];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function filterBStatus() {
    var select, filter, table, tr, td, i, txtValue;
    select = document.getElementById("b_status") 
    filter = select.value;
    table = document.getElementById("guestTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[4];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
