var DOMTransform = function() {

function DOMTransform() {
    elementProto.apply = this.apply.bind(this);
    this.elements = { '*' : elementProto };
}

var prototype = DOMTransform.prototype;

prototype.apply = function(context) {
    var method = methods[context.constructor.name];
    if(method) return method.call(this, context);
    else throw Error('unexpected context');
}

prototype.applyText = function(node) {
    return /^\s+$/.test(node.textContent)? null : node.textContent;
}

prototype.applyElement = function(context) {
    var elements = this.elements,
        element = elements[context.tagName] || elements['*'];
    return element.transform(context);
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
    Element : prototype.applyElement,
    Text : prototype.applyText,
    NamedNodeMap : prototype.applyAttributes,
    NodeList : prototype.applyChildren,
    HTMLCollection : prototype.applyChildren
};

prototype.build = function(context) {
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
                    result.appendChild(this.build(child));
                }, this)
            } else {
                result.appendChild(this.build(children));
            }
        }
        return result;
    }
}

prototype.transform = function(context) {
    return this.build(this.apply(context));
}

var elementProto = {
    transform : function(element) {
        var result = { element : this.element(element.tagName, element) },
            attrs = this.attrs = this.apply(element.attributes),
            attributes = this.attributes(attrs, element),
            children = this.children(element.childNodes, element);
        if(attributes) result.attributes = attributes;
        if(children) result.children = children;
        return result;
    },
    element : function(name, element) {
        return name;
    },
    attributes : function(attrs, element) {
        return attrs;
    },
    children : function(children, element) {
        return this.apply(children);
    }
};

prototype.element = function(name, transform) {
    var elements = this.elements,
        element = Object.create(elementProto);

    element.base = elementProto;
    element.elements = elements;
    element.apply = this.apply.bind(this);
    Object.keys(transform).forEach(function(prop) {
        var value = transform[prop];
        element[prop] = typeof value === 'function'?
            transform[prop] :
            function() { return value };
    });

    return elements[name] = element;
}

return DOMTransform;

}();

