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
    console.log(jsonPib);
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

    const enrouteNotams = processNotamArray(enrouteNotamArray);
    const navigationWarnings = processNotamArray(navigationWarningArray);
    document.getElementById('enroute').appendChild(enrouteNotams);
    document.getElementById('navWarn').appendChild(navigationWarnings);

    function processNotamArray(notamArray) {

        const notamsWrapper = document.createElement('div');

        notamArray.forEach((notam) => {

            const notamContainer = document.createElement('div');
            const notamHeading = document.createElement('div');
            const notamValidity = document.createElement('div');
            const notamReference = document.createElement('p');
            const notamItemA = document.createElement('p');
            const notamQLine = document.createElement('span');
            const notamStart = document.createElement('span');
            const notamEnd = document.createElement('span');
            const notamHeights = document.createElement('div');
            const notamBody = document.createElement('p');

            notamContainer.classList.add('notam');
            notamHeading.classList.add('notam-heading');
            notamValidity.classList.add('notam-validity');
            notamReference.classList.add('notam-reference');
            notamItemA.classList.add('notam-item-a');
            notamQLine.classList.add('notam-qline');
            notamStart.classList.add('notam-start');
            notamEnd.classList.add('notam-end');
            notamHeights.classList.add('notam-heights');
            notamBody.classList.add('notam-body');

            notamReference.innerText = `${notam.Series}${notam.Number}/${notam.Year}:`;
            notamItemA.innerHTML = `<strong>A)</strong> ${notam.ItemA}`;
            notamQLine.innerText = `${qCodes.part23[`${notam.QLine.Code23}`]} ${qCodes.part45[`${notam.QLine.Code45}`]}`;
            notamStart.innerHTML = `<strong>B)</strong> ${notam.StartValidity}`;
            notamEnd.innerHTML = `<strong>C)</strong> ${notam.EndValidity}`;
            notamBody.innerHTML = `<strong>E)</strong> ${notam.ItemE}`;
            notamHeading.append(notamReference, notamQLine, notamItemA);
            notamValidity.append(notamStart, notamEnd);

            if (notam.ItemD) {
                const notamSchedule = document.createElement('span');
                notamSchedule.classList.add('notam-schedule');
                notamSchedule.innerText = notam.ItemD;
                notamValidity.append(notamSchedule);
            }

            const getHeights = () => {
                let lower;

                if (notam.QLine.Lower == "0") {
                    lower = "SFC";
                } else {
                    lower = parseInt(notam.QLine.lower);
                    lower < 30 ? lower = (lower * 100) + "FT AMSL" : lower = `FL${lower}`;
                }

                let upper = notam.QLine.Upper;

                if (typeof upper === "string") {
                    upper = parseInt(upper);
                    upper < 30 ? upper = (upper * 100) + "FT AMSL" : upper = `FL${upper}`;
                }

                const itemF = document.createElement('span');
                const itemG = document.createElement('span');

                itemF.innerHTML = `<strong>F)</strong>${lower}`;
                itemG.innerHTML = `<strong>G)</strong>${upper}`;

                return ([itemF, itemG])
            }

            const heights = getHeights();

            notamHeights.append(heights[0], heights[1])
            notamContainer.append(notamHeading, notamValidity, notamBody, notamHeights);
            notamsWrapper.appendChild(notamContainer);
        });

        return notamsWrapper
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