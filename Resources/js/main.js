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
    const utcDateStamp = date.getUTCFullYear() + date.getUTCMonth() + date.getUTCDate()
    const timeH = date.getUTCHours();
    const utcTimeStamp = timeH + "00z";

    const title = `NOTAMS at ${utcTimeStamp} on ${utcDateStamp}`;
    document.title = title
}
