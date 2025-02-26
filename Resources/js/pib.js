async function getNOTAMS() {
    async function getPibXml() {
        const response = await fetch("https://raw.githubusercontent.com/Jonty/uk-notam-archive/main/data/PIB.xml", {
            method: "GET",
            "access-control-allow-origin": "https://raw.githubusercontent.com"
        });

        if (response.ok) {
            const pibText = await response.text();
            const domParser = new DOMParser();
            const pibXML = domParser.parseFromString(pibText, "application/xml");
            return pibXML;
        }
    };

    const getJsonPib = async (pibXML) => {
        const pib = pibXML.childNodes[1];
        const jsonPib = xmlToJson(pib)
        return jsonPib
    };

    const xml = await getPibXml()
    const jsonPib = await getJsonPib(xml);
    return jsonPib
}

/*function filterNotams(notamArray, filters) {

    let LocalEnrouteNotams = enrouteNotams.filter((notam) => {
        if (filterByDistance(notam) < 46300 && !notam.Coordinates.match(/E/)) {
            return true;
        }
    });

    let LocalWarnings = warnings.filter((notam) => {
        if (filterByDistance(notam) < 46300 && !notam.Coordinates.match(/E/)) {
            return true;
        }
    });

    return [LocalEnrouteNotams, LocalWarnings]
}*/

function displayNotams(pib, filters = undefined) {

    const enrouteNotamArray = pib.FIRSection[0]["En-route"].NotamList.Notam;
    const navigationWarningArray = pib.FIRSection[0].Warnings.NotamList.Notam;

    //const notamArray = filters !== undefined ? filterNotams([enrouteNotams, warnings], filters) : [enrouteNotams, warnings];

    processNotamArray(enrouteNotamArray, "enroute");
    processNotamArray(navigationWarningArray, "navWarn");

    function processNotamArray(notamArray, section) {

        const wrapper = `#${section}-box`;

        notamArray.forEach((notam) => {

            const heights = getHeights();

            const qLineArray = Object.values(notam.QLine);
            qLineArray[1] += qLineArray[2];
            qLineArray.splice(2, 1);
            qLineArray.splice(5, 2);
            qLineArray.push(heights[0], heights[1], notam.Coordinates);
            const notamQline = qLineArray.join("/");

            const notamReference = `${notam.Series}${notam.Number}/${notam.Year}:`;
            const notamItemA = notam.ItemA;
            const notamStart = notam.StartValidity;
            const notamEnd = notam.EndValidity;
            const notamBody = notam.ItemE;

            $(wrapper).append(`<div class="notam new"><div class="notam-heading"><p class="notam-reference">${notamReference}</p><span class="notam-qline">${notamQline}</span><p class="notam-itemA"><strong>A)</strong>${notamItemA}</p></div><div class="notam-validity"><span class="notam-start"><strong>B)</strong>${notamStart}</span><span class="notam-end"><strong>C)</strong>${notamEnd}</span></div><p class="notam-body"><strong>E) </strong>${notamBody}</p></div>`);

            if (Object.hasOwn(notam, 'ItemD')) {
                $('.notam.new .notam-validity').after(`<p class="notam-schedule">${notam.itemD}</p>`)
            }

            if (section === "navWarn") {
                $('.notam.new').append(`<div class="notam-heights"><span><strong>F)</strong>${heights[2]}</span><span><strong>G)</strong>${heights[3]}</span></div>`)
            }

            $('.notam.new').removeClass('new');


            function getHeights() {

                let lower;
                let qLower;

                const lowerStr = notam.QLine.Lower
                const lowerNum = parseInt(lowerStr)

                if (lowerStr == "0") {
                    lower = "SFC";
                    qLower = "000";
                } else {
                    lower = (lowerNum * 100) + "FT AMSL"
                    if (lowerStr.length === 2) {
                        qLower = "0" + lowerStr
                    } else if (lowerStr.length === 1) {
                        qLower = "00" + lowerStr
                    } else {
                        qLower = lowerStr;
                    }
                }

                let upper;
                let qUpper;

                if (typeof notam.QLine.Upper === "string") {
                    let upperStr = notam.QLine.Upper
                    let upperNum = parseInt(upperStr);
                    upper = (upperNum * 100) + "FT AMSL";
                    if (upperStr.length === 2) {
                        qUpper = "0" + upperStr
                    } else if (upperStr.length === 1) {
                        qUpper = "00" + upperStr
                    } else {
                        qUpper = upperStr;
                    }
                }

                const heightsArray = [qLower, qUpper, lower, upper];

                return (heightsArray)
            }
        });
    };
}

function filterByDistance(n) {
    let northDeg = parseInt(n.Coordinates.slice(0, 2));
    let northMin = parseInt(n.Coordinates.slice(2, 4));
    let westDeg = parseInt(n.Coordinates.slice(5, 8));
    let westMin = parseInt(n.Coordinates.slice(8, 10));

    let northDec = northDeg + northMin / 60;
    let westDec = (westDeg + westMin / 60) * -1;

    return haversine(50.815556, -1.206667, northDec, westDec);
}