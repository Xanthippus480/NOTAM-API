window.onload = (event) => {
    setTitle();
    getInfo();

    $('.tab-button').on('click', openTab)
    $('.filter-form-tab.active :is(input,textarea,radio,checkbox)').prop('required', true)
    $('#add-ad').on('click', addAerodrome)
    $('.caret').on('click', collapseNOTAMS)
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

function openTab(event) {
    if ($(event.target).hasClass('active')) {
        return
    }
    $('.tab-button.active').removeClass('active');
    $(event.target).addClass('active');
    const tabRef = $(event.target).attr("data-tab");
    $('.filter-form-tab.active').removeClass('active').find(':is(input,textarea,radio,checkbox)').removeAttr('required');
    $(`.filter-form-tab[data-tab="${tabRef}"]`).addClass('active').find(':is(input,textarea,radio,checkbox)').prop('required', true);
}

function addAerodrome(event) {
    event.preventDefault();
    const adInput = $('#aerodrome-field').val().split(",");
    const newAerodromes = getAerodromes(adInput);

    $('#aerodrome-field').val("").attr("value", newAerodromes) //Clear textarea & set list of aerdromes as value attribute for use upon form submission

    newAerodromes.forEach(aerodrome => {
        $('#selected-aerodromes').append(`<p class="aerodrome">${aerodrome}<span class="close-button new">x</span></p>`);
    })

    $('.aerodrome .close-button.new').on('click', removeAerodrome).removeClass('new');

    function getAerodromes(inputArray) {
        const icaos = []
        aerodromes.forEach(obj => {
            const vals = Object.values(obj);
            inputArray.forEach(ad => {
                if (vals.includes(ad.trim().toLowerCase())) {
                    icaos.push((obj.icao).toUpperCase());
                    return
                }
            });
        })

        function removeDuplicates(array) {
            const currentList = []
            $('#selected-aerodromes .aerodrome').each(function (i, el) {
                const txt = Utilities.specificText(el)
                currentList.push(txt);
            });
            if (currentList.length == 0) { return array }

            const output = array.filter(el => {
                return !currentList.includes(el);
            })

            return output
        }

        return removeDuplicates(icaos)
    }
}

function removeAerodrome(event) {
    $(event.target).parent().remove()
    if ($('#selected-aerodromes').children().length === 0) {
        $('#selected-aerodromes').empty();
    }
}

function collapseNOTAMS() {
    $(this).toggleClass('closed').closest('li').find('.notam-box').toggle();
}