function detectLinks(inElement: HTMLElement) {
    var urlRegex = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
        text      = inElement.innerHTML;

    inElement.innerHTML = text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });

    return inElement;
}