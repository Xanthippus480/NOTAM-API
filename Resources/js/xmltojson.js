function xmlToJson(xml) {
    "use strict";
    // Create the return object
    var obj = {},
        i,
        j,
        attribute,
        item,
        nodeName,
        old;

    if (xml.nodeType === 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (j = 0; j < xml.attributes.length; j = j + 1) {
                attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        // text
        if (xml.nodeValue !== "") obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        if (xml.childNodes.length > 1) {
            for (i = 0; i < xml.childNodes.length; i = i + 1) {
                item = xml.childNodes.item(i);
                if (item.nodeType === 3) {
                    continue;
                }
                nodeName = item.nodeName;
                if (obj[nodeName] === undefined) {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (obj[nodeName].push === undefined) {
                        old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        } else {
            obj = xml.textContent.replace(/\n/, "");
        }
    }
    return obj;
}