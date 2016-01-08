function DOMTransform() {
    this.elements = { '*' : this };
}

void function(prototype) {

prototype.apply = function(context) {
    var method = methods[context.constructor.name];
    if(method) return method.call(this, context);
    else throw Error('unexpected context');
}

prototype.applyText = function(node) {
    return /^\s+$/.test(node.textContent)? null : node.textContent;
}

prototype.applyElement = function(element) {
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

prototype.applyAttributes = function(attributes) {
    var result = {}, i = 0, attr;
    while(attr = attributes[i++]) {
        result[attr.name] = attr.value;
    }
    return result;
}

prototype.applyChildren = function(children) {
    var result = [], i = 0, node, child;
    while(node = children[i++]) {
        child = this.apply(node);
        if(child) result.push(child);
    }
    return result;
}


var methods = {
    Element : function(context) {
        var elements = this.elements,
            element = elements[context.tagName] || elements['*'];
        return element.applyElement(context);
    },
    Text : prototype.applyText,
    NamedNodeMap : prototype.applyAttributes,
    NodeList : prototype.applyChildren,
    HTMLCollection : prototype.applyChildren
};

prototype.create = function(context) {
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

prototype.transform = function(context) {
    return this.create(this.apply(context));
}

prototype.element = function(name, apply) {
    var elements = this.elements,
        element = Object.create(prototype);
    element.applyElement = apply;
    element.elements = elements;
    return elements[name] = element;
}

}(DOMTransform.prototype);
