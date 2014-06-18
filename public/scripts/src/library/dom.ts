//ref: https://github.com/bndr/fasterDOM.js/blob/master/fasterDOM.js

//Add new functions to object prototype
interface Object {

    //DOM Events
    bind: (eventName: string, callback: (ev: any) => any) => any
    on: (pattern: string, eventName: string, callback: (ev: any) => any) => void

    //DOM Manipulation
    attr: (name: string, value?: string) => any
    css: (...obj: any[]) => any
    removeClass: (className: string) => any
    addClass: (className: string) => any
    insertAfter: (node: HTMLElement) => any
    append: (node: any) => any
    prepend: (node: any) => any
    remove: () => void
    empty: () => any
    nodeText: (text?: string) => any

}

//Create basic $('pattern') finder
function $(selector: string): NodeListOf<HTMLElement> {
    return <NodeListOf<HTMLElement>>document.querySelectorAll(selector);
}

function _new(tag: string): HTMLElement {
    return document.createElement(tag);
}

module _dom {

    //#region Helpers

    ///Check if node matches pattern
    function _findUp(parent: HTMLElement, list: NodeListOf<HTMLElement>, item: HTMLElement): HTMLElement {
        for (var i = 0, ii = list.length; i < ii; ++i) {
            if (list[i] === item)
                return item;
        }

        var immediate = item.parentElement;

        if (immediate === parent)
            return null;
        if (immediate !== null)
            return _findUp(parent, list, immediate);

        return null;
    }

    //#endregion

    //#region DOM Events

    ///Bind event to element
    Object.prototype.bind = function (eventName: string, callback: (ev: any) => any) {
        if (this.length !== undefined) {
            for (var i = 0, ii = this.length; i < ii; ++i) {
                this[i].addEventListener(eventName, function (e: any) {
                    e["eventTarget"] = this;
                    callback.call(this, e);
                });
            }
        }
        else {
            this.addEventListener(eventName, function (e: any) {
                e["eventTarget"] = this;
                callback.call(this, e);
            });
        }

        return this;
    };

    ///Bind event to element's children
    Object.prototype.on = function (pattern: string, eventName: string, callback: (ev: any) => any) {
        for (var i = 0, ii = this.length; i < ii; ++i) {
            var element = <HTMLElement>this[i];

            element.addEventListener(eventName, function (e: any) {
                //Check if this element matches pattern
                var matched = _findUp(element, $(pattern), <HTMLElement>e.srcElement);

                if (matched !== null) {
                    e["eventTarget"] = matched;
                    callback.call(matched, e);
                }
            });
        }
    };

    //#endregion

    //#region DOM Manipulation

    ///Get or set attribute on object
    Object.prototype.attr = function (name: string, value?: string): any {
        if (this.length === undefined) {
            //Single object
            if (value === undefined) //Get value
                return this.getAttribute(name);
            else { //Set value
                if (value === null) this.removeAttribute(name);
                else                this.setAttribute(name, value);
            }
        }
        else {
            //Array of objects
            for (var i = 0, ii = this.length; i < ii; ++i) {
                if (value === undefined) //Get first value
                    return this[i].getAttribute(name);
                else { //Set value
                    if (value === null) this[i].removeAttribute(name);
                    else                this[i].setAttribute(name, value);
                }
            }
        }

        return this;
    };

    ///Get or set css on object
    Object.prototype.css = function (...obj: any[]): any {
        for (var i = 0, ii = this.length; i < ii; ++i) {
            var element = this[i];

            if (obj.length > 1)
                element.style[obj[0]] = obj[1];

            else if (typeof obj[0] === "string")
                return element.style[obj[0]];

            else {
                for (var key in obj[0])
                    element.style[key] = obj[0][key];
            }
        }

        return this;
    };

    ///Remove class from elements
    Object.prototype.removeClass = function (className: string) {
        for (var i = 0, ii = this.length; i < ii; ++i)
            this[i].classList.remove(className);
        return this;
    };

    ///Add class to elements
    Object.prototype.addClass = function (className: string) {
        for (var i = 0, ii = this.length; i < ii; ++i)
            this[i].classList.add(className);
        return this;
    };

    ///Insert element(s) after node
    Object.prototype.insertAfter = function (node: HTMLElement) {
        if (this.length !== undefined)
            for (var i = 0, ii = this.length; i < ii; ++i)
                node.parentElement.insertBefore(this[i], node.nextSibling);
        else
            node.parentElement.insertBefore(this, node.nextSibling);
    };

    ///Append element(s) to bottom of node
    Object.prototype.append = function (node: any) {
        if (node.length !== undefined)
            for (var i = 0, ii = node.length; i < ii; ++i)
                this.appendChild(node[i]);
        else
            this.appendChild(node);

        return this;
    };

    ///Prepend element(s) to top of node
    Object.prototype.prepend = function (node: any) {
        if (node.item !== undefined) {
            while (node.length)
                this.insertBefore(node[0], this.firstChild);
        }
        else if (node.length !== undefined)
            for (var i = 0, ii = node.length; i < ii; ++i)
                this.insertBefore(node[i], this.firstChild);
        else
            this.insertBefore(node, this.firstChild);

        return this;
    };

    ///Remove element(s)
    Object.prototype.remove = function () {
        if (this.length !== undefined)
            for (var i = 0, ii = this.length; i < ii; ++i)
                this[i].parentNode.removeChild(this[i]);
        else
            this.parentNode.removeChild(this);
    };

    ///Get node inner text
    Object.prototype.nodeText = function (text?: string) {
        if (text === undefined)
            return this.innerText;

        this.innerText = text;
        return this;
    };

    Object.prototype.empty = function () {
        if (this.length !== undefined) {
            for (var i = 0, ii = this.length; i < ii; ++i)
                this[i].innerHTML = "";
        }
        else
            this.innerHTML = "";

        return this;
    };

    //#endregion

}