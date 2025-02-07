window.onload = (event) => {
    setTitle();
    getInfo();
}

async function getInfo() {
    const notams = await getNOTAMS();
    displayNotams(notams)
}

function setTitle() {
    const date = new Date()
    const utcYear = date.getUTCFullYear().toString().slice(2, 4);
    const monthNo = date.getUTCMonth() + 1
    const utcMonth = monthNo < 10 ? "0" + monthNo.toString() : monthNo.toString();
    const dateIndex = date.getUTCDate()
    const utcDate = (dateIndex - 1) < 10 ? "0" + dateIndex.toString() : dateIndex.toString();
    const utcDateStamp = utcYear + utcMonth + utcDate

    const timeH = date.getUTCHours();
    const utcTimeStamp = timeH + "00z";

    const title = `NOTAMS at ${utcTimeStamp} on ${utcDateStamp}`;
    document.title = title
}
