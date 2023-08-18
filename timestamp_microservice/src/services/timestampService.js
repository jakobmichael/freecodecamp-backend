module.exports = {

    convertToUnixAndUtc: function convertToUnixAndUtc(requestParameter) {
        let date = requestParameter;
        let dateObj = new Date(date);
        let unix = dateObj.getTime();
        let utc = dateObj.toUTCString();

        if (date == undefined) {
            let dateObj = new Date();
            let unix = dateObj.getTime();
            let utc = dateObj.toUTCString();
            return ({ unix: unix, utc: utc });
        } else if (checkTimestampValitidy(date)) {
            let dateObj = new Date(parseInt(date));
            let unix = dateObj.getTime();
            let utc = dateObj.toUTCString();
            return ({ unix: unix, utc: utc });
        } else if (dateObj == "Invalid Date") {
            return ({ error: "Invalid Date" });
        } else {
            return ({ unix: unix, utc: utc });
        }
    },



}

function checkTimestampValitidy(value) {
    return (value >= -8.64e12 && value <= +8.64e12);
}
