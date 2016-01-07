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
    return /^\s+$/.test(node.textContent)? null : node.textContent;
}

DOMTransform.prototype.applyElement = function(element) {
    var result = { element : element.tagName };
    if(element.hasAttributes()) {
        result.attributes = this.applyAttributes(element.attributes);
    }
    if(element.childNodes.length) {
        var children = this.applyChildren(element.childNodes);
        if(children.length) result.children = children;
    }
    return result;
}

DOMTransform.prototype.applyAttributes = function(attributes) {
    var result = {}, i = 0, attr;
    while(attr = attributes[i++]) {
        result[attr.name] = attr.value;
    }
    return result;
}

DOMTransform.prototype.applyChildren = function(children) {
    var result = [], i = 0, node, child;
    while(node = children[i++]) {
        child = this.apply(node);
        if(child) result.push(child);
    }
    return result;
}

DOMTransform.prototype.create = function(context) {
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
                children.forEach(function(child) {
                    result.appendChild(this.create(child));
                }, this)
            } else {
                result.appendChild(this.create(children));
            }
        }
        return result;
    }
}

DOMTransform.prototype.transform = function(context) {
    return this.create(this.apply(context));
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
