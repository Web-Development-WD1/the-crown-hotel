document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search').addEventListener('click', function () {
        const searchTerm = document.getElementById('r-ref').value;
        const selectedStatus = document.getElementById('status').value;
        const selectedType = document.getElementById('room-type').value;
 
        console.log(searchTerm, selectedStatus, selectedType);
 
        filterRoomsByRoomNo(searchTerm);
        filterRoomsByStatus(selectedStatus);
        filterRoomsByType(selectedType);
    });
});
 
 
function filterRoomsByType(selectedType) {
    var roomTypes = document.querySelectorAll('.room-type');
 
    roomTypes.forEach(function (roomType) {
      if (roomType.textContent === selectedType || selectedType === 'Select room type') {
        roomType.style.display = 'grid';
        var roomBoxes = roomType.nextElementSibling;
        roomBoxes.style.display = 'grid';
      } else {
        roomType.style.display = 'none';
        var roomBoxes = roomType.nextElementSibling;
        roomBoxes.style.display = 'none';
      }
    });
  }


 
function filterRoomsByStatus(selectedStatus) {
    const roomBoxes = document.querySelectorAll('.room-box, .report-room');
 
    roomBoxes.forEach(roomBox => {
        const roomStatus = roomBox.classList.contains('report-room') ? 'unavailable' : 'checked-out';
 
        const shouldShow = selectedStatus === 'Select Status' || roomStatus === selectedStatus;
 
        roomBox.style.display = shouldShow ? 'flex' : 'none';
    });
}
 
 
function filterRoomsByRoomNo(searchTerm) {
const roomBoxes = document.querySelectorAll('.room-box, .report-room');
 
roomBoxes.forEach(roomBox => {
    const roomBigElement = roomBox.querySelector('.roomBig');
 
    if (roomBigElement && roomBigElement.textContent) {
        const roomNo = roomBigElement.textContent;
        if (roomNo.includes(searchTerm)) {
            roomBox.style.display = 'flex';  
        } else {
            roomBox.style.display = 'none';
        }
    }
});
}

function clearFilter() {
    var clear, roomFilter, roomTypeFilter, roomStatusFilter;
    clear = document.getElementById("clear");
    roomFilter = document.getElementById("r-ref");
    roomTypeFilter = document.getElementById("room-type");
    roomStatusFilter = document.getElementById("status");

    roomFilter.value = "";
    roomTypeFilter.value = "Select room type";
    roomStatusFilter.value = "Select Status";
    filterRoomNo()
}
