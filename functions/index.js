'use strict';

// Require all the things
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const functions = require('firebase-functions');
const parseString = require('xml2js').parseString;
const http = require('http');

// URL that returns TfL line status data in XML format
// There is a JSON one but it's slower, marginally less reliable
const TFL_LINESTATUS_URL = 'http://cloud.tfl.gov.uk/TrackerNet/LineStatus';

exports.tubeStatus = functions.https.onRequest((request, response) => {
    const app = new ActionsSdkApp({
        request,
        response
    });

    function mainIntent(app) {
        // If this fails with something like:
        // Error: getaddrinfo ENOTFOUND cloud.tfl.gov.uk cloud.tfl.gov.uk:80
        // it's because you're on the Firebase Spark plan. Enter your billing
        // details and upgrade to the Blaze plan to access external networks
        let req = http.get(TFL_LINESTATUS_URL, function(xml_response) {
            let xml = '';

            xml_response.on('data', function(chunk) {
                xml += chunk;
            });

            xml_response.on('end', function() {
                // Parse XML as an object using xml2js
                parseString(xml, function(err, response) {
                    tellLineStatus(response.ArrayOfLineStatus.LineStatus);
                });
            });
        });
    }

    function tellLineStatus(LineStatuses) {
        let nonGoodServiceLines = [];

        // Go through each Line. If it is not running a good service (GS),
        // add it to the array of nonGoodServiceLines
        LineStatuses.forEach(function(LineStatus) {
            if (LineStatus.Status[0]["$"].ID != 'GS') {
                nonGoodServiceLines.push({
                    name: LineStatus.Line[0]["$"].Name,
                    description: LineStatus.Status[0]["$"].Description,
                    details: LineStatus["$"].StatusDetails
                });
            };
        })

        let nonGoodServiceLinesString = '';

        nonGoodServiceLines.forEach(function(line) {
            // Make string begin with lowercase, only have the first sentence
            // usually cuts out the "GOOD SERVICE on the rest of the line" o.e.
            let lineDetailsString = (line.details.charAt(0).toLowerCase() + line.details.slice(1)).split('.')[0] + '. ';

            if (line.name == "Overground" || line.name == "Tfl Rail" || line.name == "DLR" || line.name == "Trams") {
                nonGoodServiceLinesString += 'The ' + line.name + ' has ' +
                    lineDetailsString;
            } else {
                nonGoodServiceLinesString += 'The ' + line.name + ' line has ' +
                    lineDetailsString;
            }

        })

        if (nonGoodServiceLinesString == '') {
            app.tell('There is a good service operating on all London Underground lines.');
        } else {
            app.tell(nonGoodServiceLinesString + 'There is a good service operating on all other London Underground lines.');
        }
    }

    let actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, mainIntent);
    app.handleRequest(actionMap);
});
