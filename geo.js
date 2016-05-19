var CoordinatesCheck = {
    id: null,
    address: null,
    lat: null,
    lng: null,
    geoUrl: 'https://maps.googleapis.com/maps/api/geocode/json?address=',
    saveUrl: '/ajax/ds/',

    init: function(el) {
        var idNode = el.querySelectorAll('td[data-info="id"]'),
            addressNode = el.querySelectorAll('td[data-info="address"]'),
            latNode = el.querySelectorAll('td[data-info="lat"]'),
            lngNode = el.querySelectorAll('td[data-info="lng"]'),
            tempId = Number(idNode[0].innerText),
            tempAddress = addressNode[0].innerText,
            self = this;

        if (latNode[0].innerText == "" || lngNode[0].innerText == "") {
            queriesCount++;
            if (queriesCount < 501) {
                setTimeout(function (obj) {
                    CoordinatesCheck.geocoding(tempId, tempAddress);
                }, 250 * queriesCount);
            }
        } else {
            self.sayCongrats('Total queries: ' + queriesCount + ', Saved to DB: ' + successCount);
        }
    },
    parseAddress: function(address) {
        return address.split(/[ ,]+/).join('+');
    },
    geocoding: function(id, address) {
        var parsedAddress = CoordinatesCheck.parseAddress(address),
            geoUrl = CoordinatesCheck.geoUrl;

        $.ajax({
            method: 'POST',
            url: geoUrl + parsedAddress,
            id2: id, 
            success: function (data, status) {
                if (status == 'success') {
                    var recievedData = data.results[0],
                        lat = recievedData.geometry.location.lat,
                        lng = recievedData.geometry.location.lng;
                    CoordinatesCheck.saveCoordinates(this.id2, lat, lng);
                }
            },
            error: function(xhr, status, errorThrown) {
                console.log("Geo Error: ", xhr.status, status, errorThrown + ". ID = " + this.id2);
            },
            complete: function () {
            	CoordinatesCheck.sayCongrats('Total queries: ' + queriesCount + ', Saved to DB: ' + successCount);
            }
        });
    },
    saveCoordinates: function(id, lat, lng) {
        if (id !== undefined && lat !== undefined && lng !== undefined) {

            $.ajax({
                method: 'POST',
                url: window.location.origin + this.saveUrl + id + '/set_coord?' + 'lat=' + lat + '&lng=' + lng,
                id3: id,
                lat3: lat,
                lng3: lng,
                success: function(data, xhr, res) {
                    successCount++;
                    CoordinatesCheck.setCoordinates(this.id3, this.lat3, this.lng3);
                },
                error: function(xhr, status, errorThrown) {
                    console.log("Save Error: ", xhr.status, status, errorThrown + ". ID = " + this.id3);
                },
                complete: function () {
                    CoordinatesCheck.sayCongrats('Total queries: ' + queriesCount + ', Saved to DB: ' + successCount);
                }
            });

        }
    },
    setCoordinates: function(id, lat, lng) {
        var currentTr = document.querySelector('tr[data-id="' + id + '"]'),
            currentTdLat = currentTr.querySelector('td[data-info="lat"]'),
            currentTdLng = currentTr.querySelector('td[data-info="lng"]'),
            message = 'Coordinates was changed!';

        currentTdLat.innerHTML = lat;
        currentTdLng.innerHTML = lng;

        CoordinatesCheck.sayCongrats(message);
    },
    sayCongrats: function(message) {
        var popupContainer = document.getElementById('container_popup'),
            popupWindow = document.querySelector('.popup-window'),
            popupMessage = popupWindow.children[1];

        popupContainer.style.display = 'block';
        popupWindow.style.display = 'block';
        popupMessage.innerHTML = message;
    }
};