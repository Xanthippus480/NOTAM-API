const Utilities = {
    capitalize: function (phrase) {
        const words = phrase.split(" ");
        let result;

        words.forEach((word, i, arr) => {
            const first = word[0].toUpperCase();
            const body = word.slice(1);
            const newWord = first + body;

            arr[i] = newWord;
        });

        return words.join(" ");
    },
    specificText: function (element) {
        return $(element).contents().filter(function () {
            return this.nodeType == Node.TEXT_NODE;
        })[0].nodeValue
    },
    listAll: function () {
        return Object.keys(this)
    }
}


