function DOMTransform() {
    this.elements = { '*' : this };
}

DOMTransform.prototype.apply = function(context) {
    var transform;
    if(context instanceof Element) {
        var elements = this.elements,
            name = context.tagName,
            element = elements[name] || elements['*'];
        return element.applyElement(context);
    } else if(context instanceof Text) {
        return this.applyText(context);
    } else if(context instanceof NamedNodeMap) {
        return this.applyAttributes(context);
    } else if(context instanceof NodeList || context instanceof HTMLCollection) {
        return this.applyChildren(context);
    } else {
        throw Error('unexpected context');
    }
}

DOMTransform.prototype.applyText = function(node) {
    return /^\s+$/.test(node.textContent)?
        null :
        document.createTextNode(node.textContent);
}

DOMTransform.prototype.applyElement = function(element) {
    var result = { element : element.tagName };
    if(element.hasAttributes()) {
        result.attributes = this.apply(element.attributes);
    }
    if(element.childNodes.length) {
        var children = this.apply(element.childNodes);
        if(children.length) result.children = children;
    }
    return result;
}

DOMTransform.prototype.applyAttributes = function(attributes) {
    return Array
        .from(attributes)
        .reduce(function(res, attr) {
            res[attr.name] = attr.value;
            return res;
        }, {});
}

DOMTransform.prototype.applyChildren = function(children) {
    return Array.from(children).map(function(node) {
        return this.apply(node);
    }, this)
    .filter(function(node) {
        return Boolean(node);
    });
}

DOMTransform.prototype.transform = function(context) {
    if(typeof context === 'string') {
        return document.createTextNode(context);
    } else {
        var result = document.createElement(context.element),
            attributes = context.attributes,
            children = context.children;

        if(attributes) {
            for(var name in attributes) {
                var value = attributes[name];
                if(typeof value !== 'undefined') {
                    result.setAttribute(name, value);
                }
            }
        }
        if(children) {
            if(Array.isArray(children)) {
                for(var i in children) {
                    var child = children[i];
                    if(child) result.appendChild(this.transform(child));
                }
            } else {
                result.appendChild(this.transform(children));
            }
        }
        return result;
    }
}

DOMTransform.Element = function(template) {
    this.applyElement = template;
}

DOMTransform.Element.prototype = DOMTransform.prototype;

DOMTransform.prototype.element = function(name, transform) {
    var elements = this.elements,
        element = new DOMTransform.Element(transform);
    element.elements = elements;
    elements[name] = element;
    return element;
}
