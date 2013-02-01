jquery-addresspicker for Bootstrap
==================================

I forked this project from sgruhier[https://github.com/sgruhier/jquery-addresspicker] who has built a simple address picker on top of JQuery UI Autocomplete.
Since I don't want the overhead of JQUI and am stuck with Bootstrap I chose to rewrite his plugin.

Demo
----
Seeing is believing. [Hosted on AWS S3](http://mngscl-10.s3-website-us-east-1.amazonaws.com/jquery-addresspicker-bootstrap/demos/index.html), if it's broken and you need it, drop me a line. 
Otherwise: just clone the repo and open demos/index.html on your local machine...

Simple Addresspicker
--------------------
The addresspicker is a plain JQuery plugin and follows mostly concepts known to Bootstrap users. I'm using Bootstrap typeahead filled by anonymous google map geocoder suggestions.
Try to enter an address like Berlin Kreuzberg, Manhattan Central Park or London Soho and you'll see suggests

    var addresspicker = $( "#addresspicker" ).addresspicker();

Addresspicker with Map
----------------------
![Addresspicker with Map](https://github.com/elmariachi111/jquery-addresspicker/blob/master/demos/images/addresspicker.jpg?raw=true)

You can drag and drop the marker to the correct location. The input field address is then updated again according to a reverse Geocoding result. 
Note that I'm using JQuery events to notify you on address and marker position changes

    var addresspickerMap = $( "#addresspicker_map" ).addresspicker(
        {
            regionBias: "de",
            map:      "#map_canvas",
            typeaheaddelay: 1000,
            mapOptions: {
                zoom:16,
                center: new google.maps.LatLng(52.5122, 13.4194)
            }
        });

        addresspickerMap.on("addressChanged", function(evt, address) {
           console.dir(address); //do something with the address. It's a Google Geocoder result
        });

        //markerPosition is a LatLng that I augmented with an getAddress function for convenience
        //getAddress triggers a reverse geocode request.

        addresspickerMap.on("positionChanged", function(evt, markerPosition) {
            markerPosition.getAddress( function(address) {
                if (address) { //address is a Google Geocoder result
                    $( "#addresspicker_map").val(address.formatted_address);
                }
            })
        });
    });

Features to notice
------------------
The Bootstrap 2.2 Typeahead plugin doesn't know anything about timeouts, delays or complex return objects. 
I've modified the Bootstrap Typeahead code therefore. ( [pull request is pending](https://github.com/elmariachi111/bootstrap/blob/2.2.2-wip/js/bootstrap-typeahead.js) ).
It passes all the tests currently. I copied its code and a minified version of it in this repo's lib folder, too. 
On the demo page my fork of Typeahead is already included, it contains two new features:

* **Complex objects** The results of the Google Geocoding request are stored when an item is selected (obvious for JQUI users, not so in Bootstrap)
* **Delayed remote source** requests Usually Bootstrap Typeahead queries a remote source on keydown. I added a delay proxy so we're not overloading the Google Geocoder with Autocompletion requests. You can adjust the addresspicker request delay by modifying the typeaheaddelay parameter.

Usage / Download
----------------
Make sure, you have included the Google Maps Javascript API: 
`<script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>` The only dependency is Bootstrap.css and the modified Bootstrap Typeahead JQuery plugin (lib)
You can get the addresspicker js plugin from github: [Original](https://raw.github.com/elmariachi111/jquery-addresspicker/master/src/jquery.addresspicker.js) / [Minified](https://raw.github.com/elmariachi111/jquery-addresspicker/master/src/jquery.addresspicker.min.js)
Your usual Bootstrap won't work here since I overrode Typeahead. I think it's safe to patch it with the Typeahead file in the lib folder (untested, nothing else changed).

Open
----
What I actually wanted to create is a popover like the incredible [Bootstrap Datepicker](http://www.eyecon.ro/bootstrap-datepicker/). The state I've reached is sufficient for me but if you want, go ahead and fork me.

Closed (FAQ)
------------
Q: When the Addresspicker is loaded inside an invisible container the map view is broken / displays strangely after the container is shown.

A: After unhiding a Google map container you have to trigger a *resize event* to force the map to redraw (see: http://stackoverflow.com/questions/4340975/google-maps-loading-strangely )
In our case it's sufficient to call the `reloadPosition` function on the plugin:

`$addressPicker.addresspicker('reloadPosition')`


Credits
-------
- Stefan Adolf - @stadolf[http://twitter.com/stadolf]
- Sébastien Gruhier - @sgruhier[http://twitter.com/sgruhier] - (http://xilinus.com - maptimize.com[http://v2.maptimize.com])
 
Demos from the JQuery UI Plugin (go to upstream base on Github)
http://xilinus.com/jquery-addresspicker/demos/images/screenshot.png
