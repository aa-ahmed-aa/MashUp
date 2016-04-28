/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

// Google Map
var map;

// markers for map
var markers = [];

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
                {visibility: "off"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 42.3770, lng: -71.1256}, // Cambridge, Massachusetts
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
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
    // set the Lat/Lng of the place
    var placees = new google.maps.LatLng(parseFloat(place.latitude), parseFloat(place.longitude));

    // add the marker to the map
    var marker = new MarkerWithLabel({
        position: placees,
        map: map,
        animation: google.maps.Animation.DROP,
        labelContent: place.place_name + ", " + place.admin_code1,
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: "label",
        labelStyle: {opacity: 1.00}
    });
    
    // set a listener for the info window
    google.maps.event.addListener(marker, "click", function() { articles(marker , place.place_name + "," + place.admin_code1); });
    
    //set the bounces animation
    google.maps.event.addListener(marker, 'click', 
        //check the bounce of the markers
        function toggleBounce() {
            if (marker.getAnimation() != null) 
            {
                marker.setAnimation(null);
            }
            else
            {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
     });
     
    // add marker to markers[]
    markers.push(marker);
}

/**
 * Configures application.
 */
function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {
        update();
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // remove markers whilst dragging
    google.maps.event.addListener(map, "dragstart", function() {
        removeMarkers();
    });

    // configure typeahead
    // https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
    $("#q").typeahead({
        autoselect: true,
        highlight: true,
        minLength: 1
    },
    {
        source: search,
        templates: {
            empty: "no places found yet",
            suggestion: _.template("<p><%- place_name %>, <%- admin_name1 %>,   <%- postal_code %></p>")
        }
    });

    // update text field value with changed cursor value
    $("#q").on("typeahead:cursorchanged", function(eventObject, suggestion, name) {
        $('#q').val(suggestion.place_name + ', ' + suggestion.admin_name1 + ', ' + suggestion.postal_code) ;
    });

    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        hideInfo();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

    // give focus to text box
    $("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo()
{
    info.close();
}


/**
 * Removes markers from map.
 */
function removeMarkers()
{
    // iterate through markers[] and remove each
    for (var i = 0; i < markers.length; i++) {    
        markers[i].setMap(null);
        markers[i] = null;
    }
    
    // empty array
    markers = [];    
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb)
{
    // get places matching query (asynchronously)
    var parameters = {
        geo: query
    };
    $.getJSON("search.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // call typeahead's callback with search results (i.e., places)
        cb(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
}

/**
 * gets JSON of news articles
 */
function articles(marker, query)
{
    // get articles for query
    var parameters = { geo: query };

    $.getJSON("articles.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // build HTML list of articles for query
        var articleList = "";

        if (data.length > 0) {
            articleList = "<ul>";

            for (var i = 0; i < data.length; i++) {
                articleList += "<li><a href='" + data[i].link + "' target=_blank>" + data[i].title + "</a></li>";
            }

            articleList += "</ul>";
        } else {
            articleList = "No news available";
        }

        showInfo(marker, articleList);
     })
     .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
};

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 */
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON("update.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // remove old markers from map
        removeMarkers();

        // add new markers to map
        for (var i = 0; i < data.length; i++)
        {
            addMarker(data[i]);
        }
     })
     .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
};
