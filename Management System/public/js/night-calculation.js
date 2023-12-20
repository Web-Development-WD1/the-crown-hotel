function noOfNight() {
    var checkinDate = document.getElementById("checkinDate").value;
    var checkoutDate = document.getElementById("checkoutDate").value;

    if (!checkinDate || !checkoutDate) {
        return "";
    }

    checkinDate = new Date(checkinDate);
    checkoutDate = new Date(checkoutDate);

    return parseInt((checkoutDate - checkinDate) / (24 * 3600 * 1000));
}

function cal() {
    if(document.getElementById("checkinDate")) {
        document.getElementById("night").value=noOfNight();
    }
}