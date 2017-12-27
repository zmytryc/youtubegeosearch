// Google Map
var map;

// markers for map
var markers = [];

// Center marker for map
var markerC = null;

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "on"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "on"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        // center: {lat: 37.4236, lng: -122.1619}, // Stanford, California
        // center: {lat: 42.3770, lng: -71.1256}, //Cambridge, MA
        center: {lat: 41.3184, lng: -72.9318}, // New Haven
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 18,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true,
        disableDoubleClickZoom: true
    };


    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});


/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
     for (var i = 0, n = place['items'].length; i < n; i++)
    {
        var myLatlng = new google.maps.LatLng(place['items'][i]['recordingDetails']['location'].latitude, +
                                                place['items'][i]['recordingDetails']['location'].longitude);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            draggable:false,
            title: place['items'][i]['snippet'].channelTitle,
            icon: {
            labelOrigin: new google.maps.Point(10, 40),
            url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32)
            anchor: new google.maps.Point(0, 32)
            },
            infowindow: new google.maps.InfoWindow({
                        maxWidth: 400,
                        content: "<div id='info'><h3>" + place['items'][i]['snippet'].title +
                            "</h3><a target='_blank' href='https://www.youtube.com/watch?v=" +
                            place['items'][i].id + "'>" +
                            "<img src=" + place['items'][i]['snippet']['thumbnails']['default'].url + "></a>" +
                            "<p><a target='_blank' href='https://www.youtube.com/watch?v=" +
                            place['items'][i].id + "'>" + place['items'][i]['snippet'].description + "</a></p>" +
                            "<p>Published at:" +
                            place['items'][i]['snippet'].publishedAt +
                            "</p></div>"
            })
        });

        google.maps.event.addListener(marker, 'click', function() {
            hideAllInfoWindows(map);
            this['infowindow'].open(map, this);
        });

    // save markers
    markers.push(marker);
    }
}

/**
 * To Hide InfoWindow.
 */
function hideAllInfoWindows(map) {
    markers.forEach(function(marker) {
     marker.infowindow.close(map, marker);
    });
}

/**
 * Add a marker to the map and push to the array.
 */
function addMarkerCenter(location) {
    if (markerC == null)
    {
        var marker = new google.maps.Marker({
        position: location,
        map: map,
        });
    markerC = marker;
    }
}

/**
 * Configures application.
 */
function configure()
{
    // get coordinate of a new center from doubleclick events
    google.maps.event.addListener(map, "dblclick", function (event) {
        var myLatlng = event.latLng;
        addMarkerCenter(myLatlng);
        position(markerC);
    });

    // delete new center coordinate marker from map
    google.maps.event.addListener(map, "click", function (event) {
        if (markerC != null) {
            removeMarkersC();
            removeMarkers();
        }
    });

    // listen update form + enter if it happens
    $('#form').keypress(function (e) {
        if (e.which == 13 || event.keyCode == 13)
        {
            if (markerC !== null)
            {
                update();
                position(markerC);
            }
        }
    });
}

/**
 * Remove old markers
 */
function update()
{
    removeMarkers();
}

/**
 * Removes center marker from map.
 */
function removeMarkersC()
{
    markerC.setMap(null);
    markerC = null;
}

/**
 * Removes markers from map.
 */
function removeMarkers()
{

 for (var i = 0; i < markers.length; i++)
    {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

/**
 * To check incorrect input
 */
function isNumber(n)
{
    return !isNaN(n);
}

/**
 * Set up new request for markers
 */
function position(event)
{
    var myLatlng = event.getPosition();
    var lat = myLatlng.lat();
    var lng = myLatlng.lng();
    map.setCenter(myLatlng);
    addMarkerCenter(myLatlng);
    if ($('#q').val() =="")
    {
        query = "Google"
    }
    else
    {
        query = $('#q').val()
    }
    if ($('#Radius').val() == "" || $('#Radius').val() < 0 || !isNumber($('#Radius').val()))
    {
        radius = 500
    }
    else if ($('#Radius').val() > 1000 && $('#distance').val() == "km")
    {
         radius = 1000
    }
    else if ($('#Radius').val() > 621 && $('#distance').val() == "mi")
    {
        radius = 621
    }
    else
    {
        radius = $('#Radius').val()
    }

    if ($('#Amount').val() == "" || !isNumber($('#Amount').val()) || $('#Amount').val() < 0 || $('#Amount').val() > 50)
    {
        amount = 10
    }
    else
    {
        amount = $('#Amoun0').val()
    }
    $.getJSON(Flask.url_for("geo"),  {
        'q': query,
        'location' : lat +','+ lng,
        'locationRadius' : radius + $('#distance').val(),
        'maxResults' : amount
        })
        .done(function(youtubegeo) {
		    if ($.isEmptyObject(youtubegeo))
			{
			    console.log("Didn't find videos");
			}
			else
			{
                addMarker(youtubegeo);
			}
        })
        .fail(function() {
            console.log( "error get videos" );
        })
}