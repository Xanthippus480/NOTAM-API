import { xmlToJson } from "./xmltojson.js";
import { haversine } from "./haversine.js";
import qCodes from "./qCodes.json" with { type: "json" }
//import pib from "./pib.json" with {type: "json"}

const getXmlPib = async () => {
    const url =
        "https://raw.githubusercontent.com/Jonty/uk-notam-archive/main/data/PIB.xml";
    const response = await fetch(url, {
        method: "GET",
        "access-control-allow-origin": "https://raw.githubusercontent.com"
    });
    const pibText = await response.text();
    const domParser = new DOMParser();
    const pibXML = domParser.parseFromString(pibText, "application/xml");
    //console.log(pibXML)
    return pibXML;
};

const getJsonPib = async () => {
    const pibXML = await getXmlPib();
    const pib = pibXML.childNodes[1];
    return xmlToJson(pib);
};

getJsonPib().then((result) => filterPib(result));

//filterPib(pib)

function filterPib(pib) {
    const enrouteNotams = pib.FIRSection[0]["En-route"].NotamList.Notam;
    const warnings = pib.FIRSection[0].Warnings.NotamList.Notam;

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

    displayNotams([LocalEnrouteNotams, LocalWarnings]);
}

function displayNotams(notamArray) {
    notamArray.forEach((array, i) => {
        const notamsContainer = document.getElementById("notams");
        const h2 = document.createElement("h2");
        h2.innerText = i === 0 ? "Enroute" : "Warnings";
        notamsContainer.appendChild(h2);

        array.forEach((notam) => {
            const details = [];
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
            notamsContainer.appendChild(notamContainer);

        });
    });
}

/*jQuery(function displayNotamsJQ() {
    const $notamDiv = 
})*/

function filterByDistance(n) {
    let northDeg = parseInt(n.Coordinates.slice(0, 2));
    let northMin = parseInt(n.Coordinates.slice(2, 4));
    let westDeg = parseInt(n.Coordinates.slice(5, 8));
    let westMin = parseInt(n.Coordinates.slice(8, 10));

    //console.log('5049N10055W'.match(/\d{2}(?=\d{2}[N])|\d{2}(?=[N])|\d{3}(?=\d{2}[W])|\d{2}(?=\d{2}[W])/g));

    let northDec = northDeg + northMin / 60;
    let westDec = (westDeg + westMin / 60) * -1;

    return haversine(50.815556, -1.206667, northDec, westDec);
}
