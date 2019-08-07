
/*
   Based on the Browser Based Chasemapper of  Mark Jessop <vk5qi@rfhead.net>
   Released under GNU GPL v3 or later
*/

function degrees(angle) {
   return angle * (180 / Math.PI);
}

function radians(angle) {
   return angle * ( Math.PI / 180);
}

function position_info(listener, balloon) {
 /*
    Calculate and return information from 2 (lat, lon, alt) tuples

    Copyright 2012 (C) Daniel Richman; GNU GPL 3

    Returns a dict with:

     - angle at centre
     - great circle distance
     - distance in a straight line
     - bearing (azimuth or initial course)
     - elevation (altitude)

    Input and output latitudes, longitudes, angles, bearings and elevations are
    in degrees, and input altitudes and output distances are in meters.
    */
    var radius, lat1, lon1, alt1, lat2, lon2, alt2;

    // Earth:
    radius = 6364860.0 // Optimized for The Netherlands :-)

    lat1 = listener[0];
    lon1 = listener[1];
    alt1 = listener[2];
    lat2 = balloon[0];
    lon2 = balloon[1];
    alt2 = balloon[2];    

    lat1 = radians(lat1);
    lat2 = radians(lat2);
    lon1 = radians(lon1);
    lon2 = radians(lon2);


    // Calculate the bearing, the angle at the centre, and the great circle
    // distance using Vincenty's_formulae with f = 0 (a sphere). See
    // http://en.wikipedia.org/wiki/Great_circle_distance#Formulas and
    // http://en.wikipedia.org/wiki/Great-circle_navigation and
    // http://en.wikipedia.org/wiki/Vincenty%27s_formulae
    d_lon = lon2 - lon1;
    sa = Math.cos(lat2) * Math.sin(d_lon);
    sb = (Math.cos(lat1) * Math.sin(lat2)) - (Math.sin(lat1) * Math.cos(lat2) * Math.cos(d_lon));
    bearing = Math.atan2(sa, sb);
    aa = Math.sqrt((sa ** 2) + (sb ** 2));
    ab = (Math.sin(lat1) * Math.sin(lat2)) + (Math.cos(lat1) * Math.cos(lat2) * Math.cos(d_lon));
    angle_at_centre = Math.atan2(aa, ab);
    great_circle_distance = angle_at_centre * radius;

    // Armed with the angle at the centre, calculating the remaining items
    // is a simple 2D triangley circley problem:

    // Use the triangle with sides (r + alt1), (r + alt2), distance in a
    // straight line. The angle between (r + alt1) and (r + alt2) is the
    // angle at the centre. The angle between distance in a straight line and
    // (r + alt1) is the elevation plus pi/2.

    // Use sum of angle in a triangle to express the third angle in terms
    // of the other two. Use sine rule on sides (r + alt1) and (r + alt2),
    // expand with compound angle formulae and solve for tan elevation by
    // dividing both sides by cos elevation
    ta = radius + alt1;
    tb = radius + alt2;
    ea = (Math.cos(angle_at_centre) * tb) - ta;
    eb = Math.sin(angle_at_centre) * tb;
    elevation = Math.atan2(ea, eb);

    // Use cosine rule to find unknown side.
    distance = Math.sqrt((ta ** 2) + (tb ** 2) - 2 * tb * ta * Math.cos(angle_at_centre));

    // Give a bearing in range 0 <= b < 2pi
    if (bearing < 0) {
        bearing += 2 * Math.PI;
    }

    return {
        "listener": listener, "balloon": balloon,
        "listener_radians": (lat1, lon1, alt1),
        "balloon_radians": (lat2, lon2, alt2),
        "angle_at_centre": degrees(angle_at_centre),
        "angle_at_centre_radians": angle_at_centre,
        "bearing": degrees(bearing),
        "bearing_cardinal": bearing_to_cardinal(degrees(bearing)),
        "bearing_radians": bearing,
        "great_circle_distance": great_circle_distance,
        "straight_distance": distance,
        "elevation": degrees(elevation),
        "elevation_radians": elevation
    }
}

/*
    Convert a bearing in degrees to a 16-point cardinal direction 
*/
function bearing_to_cardinal(bearing) {
    bearing = bearing % 360.0

    if (bearing < 11.25) {
        return "N";
    }
	
    if (bearing < 33.75) {
	    return "NNE";
    }

    if (bearing < 56.25) {
        return "NE";
    }
    
    if (bearing < 78.75) {
        return "ENE";
    }

    if (bearing < 101.25) {
        return "E";
    }
    if  (bearing < 123.75) {
        return "ESE";
    }
    if (bearing < 146.25) {
        return "SE";
    }
    if (bearing < 168.75) {
        return "SSE";
    }
    if (bearing < 191.25) {
        return "S";
    }
    if (bearing < 213.75) {
        return "SSW";
    }
    if (bearing < 236.25) {
        return "SW";
    }
    if (bearing < 258.75) {
        return "WSW";
    }
    if (bearing < 281.25) {
        return "W";
    }
    if (bearing < 303.75) {
        return "WNW";
    }
    if (bearing < 326.25) {
        return "NW";
    }
    if (bearing < 348.75) {
        return "NNW";
    }
    if (bearing >= 348.75) {
        return "N";
    }

    return "?";
}
