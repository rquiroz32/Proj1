$(document).ready(function () {
    var apiKEY = "AIzaSyBNh5KfG7ZYFdl2CMuBiP47FmjmFQvs-aE";
    var covidTestAddress = "";
    var testSiteArray = [];
    var sampleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + covidTestAddress + "&key=" + apiKEY;
    var typeEstablishmentArray = [];
    var oldSearchArray = [];
    var rating = "";
    var ratingArray = [];
    var phoneNumber = "";
    var phoneNumberArray = [];

    //API key for hereAPI
    var hereApiKey = 'SWTXu3KMyXT1DwXvXayGN6j8dP4H9ZlmmqPfFWe89kQ'
    var zipLat;
    var zipLong;

    // Returns Geo Positionging of the location, currently hardcoded to 07005
    var zipCode;


    // on click event to search by zip code and return covid test sites
    $("#search-button").on("click", function (event) {
        event.preventDefault();

        zipCode = $("#search-box").val().trim();

        oldSearchArray.push(zipCode);

        localStorage.setItem("past_zipcodes", oldSearchArray);

        geoPosition_and_TestingSites();
    })//closes zip code search on click event


    //Creates an array of the type of establishment
    function getInfoFromGoogle(testSiteArray) {
        ratingArray = [];
        phoneNumberArray = [];
        for (var i = 0; i < testSiteArray.length; i++) {
            //Getting the address and using it to update sampleURL
            covidTestAddress = testSiteArray[i].address;
            sampleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + covidTestAddress + "&key=" + apiKEY;

            //Making ajax call for each one
            $.ajax({
                url: sampleURL,
                method: "GET"
            }).then(function (response) {

                //Getting Google rankings and phone numbers
                var placeId = response.results[0].place_id;
                placeDetailsURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=" + placeId + "&fields=name,rating,formatted_phone_number&key=" + apiKEY;

                $.ajax({
                    url: placeDetailsURL,
                    method: "GET"
                }).then(function (response) {
                    rating = JSON.stringify(response.result.rating);
                    phoneNumber = JSON.stringify(response.result.formatted_phone_number);

                    if (rating == undefined) {
                        rating = "none available";
                    }
                    if (phoneNumber == undefined) {
                        phoneNumber = "none available";
                    }
                    ratingArray.push(rating);
                    phoneNumberArray.push(phoneNumber);

                    //In local storage we now have ratings and rakings for the last thing that was searched
                    localStorage.setItem("lastratingsarray",ratingArray);
                    localStorage.setItem("lastphonenumber",phoneNumberArray);

                });//Closing fxn after ajax call for google places


                //Getting the type of establishment
                var typeEstablishment = response.results[0].types;
                typeEstablishment = JSON.stringify(typeEstablishment);
                var newEstablishmentString = "";

                //We only want to display for certain types of establishment
                var convenienceStore = typeEstablishment.includes("convenience_store");
                var drugStore = typeEstablishment.includes("drugstore");
                var doctor = typeEstablishment.includes("doctor");
                var hospital = typeEstablishment.includes("hospital");

                if (convenienceStore) {
                    newEstablishmentString = newEstablishmentString + "convenience store";
                }
                if (drugStore) {
                    newEstablishmentString = newEstablishmentString + "drugstore";
                }
                if (doctor) {
                    newEstablishmentString = newEstablishmentString + "doctor's office";
                }
                if (hospital) {
                    newEstablishmentString = newEstablishmentString + "hospital";
                }
                //Creates an indexed array of info on the locations, so we will only alert for convenience stores, drugstores, doctor's offices, and hospitals
                typeEstablishmentArray.push(newEstablishmentString);

                //The zip code as well as the type of establishments for the ten sites within range are stored in local storage
                localStorage.setItem(zipCode, typeEstablishmentArray);

            });
        }// End of for loop

    }

    function geoPosition_and_TestingSites() {
        //build out query for zip code 
        var geoCodeQuery = 'https://geocode.search.hereapi.com/v1/geocode?apikey=' + hereApiKey + '&q=' + zipCode + ';country=USA'

        $.ajax({
            url: geoCodeQuery,
            method: "GET"

        }).then(function (response) {


            zipLat = response.items[0].position.lat
            zipLong = response.items[0].position.lng


            // build out query for test site locations
            var discoverQueryURL = 'https://discover.search.hereapi.com/v1/discover?apikey=' + hereApiKey + '&q=Covid&at=' + zipLat + ',' + zipLong + '&limit=10'

            $.ajax({
                url: discoverQueryURL,
                method: "GET"

            }).then(function (response) {

                for (i = 0; i < response.items.length; i++) {

                    var testSiteObject = {
                        address: response.items[i].address.label.slice(23),
                        phone: response.items[i].contacts[0].phone[0].value,
                        website: response.items[i].contacts[0].www[0].value,
                        lat: response.items[i].access[0].lat,
                        long: response.items[i].access[0].lng,

                    }


                    testSiteArray.push(testSiteObject);

                }
                //Feeding this information into a function to get more information
                getInfoFromGoogle(testSiteArray);

            });// closes nested Ajax


        });// closes Ajax

    }


})// closes doc.ready function