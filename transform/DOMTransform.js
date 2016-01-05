function DOMTransform() {
    this.elements = { _ : this };
    this.attributes = {};
}

DOMTransform.prototype.nodeTypeTransform = {};

DOMTransform.prototype.source = null;
DOMTransform.prototype.target = null;

DOMTransform.prototype.tagName = null;

DOMTransform.prototype.apply = function(source) {
    var result;
    if(source instanceof Node) {
        result = this.transformNode(source);
    } else if(source instanceof NodeList || Array.isArray(source)) {
        result = this.transformNodeList(source);
    }
    return result || null;
}

DOMTransform.prototype.transformNode = function(node) {
    var method = this.nodeTypeTransform[node.nodeType];
    if(method) {
        return this[method](node);
    } else {
        throw Error('Unexpected node type');
        return null;
    }
}

DOMTransform.prototype.transformNodeList = function(nodeList) {
    var result = [];
    if(nodeList.length) {
        var node = nodeList[0];
        do result.push(this.apply(node));
        while(node = node.nextSibling);
    }
    return result;
}

DOMTransform.prototype.nodeTypeTransform[Node.TEXT_NODE] = 'transformTextNode';

DOMTransform.prototype.transformTextNode = function(textNode) {
    return document.createTextNode(textNode.nodeValue);
}

DOMTransform.prototype.nodeTypeTransform[Node.ELEMENT_NODE] = 'transformElement';

DOMTransform.prototype.transformElement = function(element) {
    var elements = this.elements,
        transform = elements[element.tagName] || elements._;
    return transform.processElement(element);
}

DOMTransform.prototype.processElement = function(element) {
    this.source = element;
    this.target = this.createTarget();
    this.processAttributes(element.attributes);
    this.processChildNodes(element.childNodes);
    return this.target;
}

DOMTransform.prototype.createTarget = function() {
    return this.createElement(this.tagName || this.source.tagName);
}

DOMTransform.prototype.createElement = function(tag, attrs) {
    var element = document.createElement(tag);
    if(attrs) {
        var name, value;
        for(name in attrs) {
            value = attrs[name];
            if(typeof value !== 'string') {
                if(value) element.setAttribute(name, '');
            } else {
                element.setAttribute(name, value);
            }
        }
    }
    return element;
}

DOMTransform.prototype.processAttributes = function(attributes) {
    var attrs = this.reduceAttributes(attributes),
        name;
    for(name in this.attributes) attrs[name] = this.attributes[name];
    this.applyAttributes(attrs);
}

DOMTransform.prototype.reduceAttributes = function(attributes) {
    var result = {}, i = 0, attr;
    while(attr = attributes[i++]) result[attr.name] = attr.value;
    return result;
}

DOMTransform.prototype.applyAttributes = function(attributes) {
    for(name in attributes) {
        this.applyAttribute(name, attributes[name]);
    }
}

DOMTransform.prototype.applyAttribute = function(name, value) {
    if(typeof value === 'function') {
        value = value.call(this, name, this.source.getAttribute(name));
    }
    if(typeof value !== 'undefined') {
        this.target.setAttribute(name, value);
    }
}

DOMTransform.prototype.processChildNodes = function(nodeList) {
    var source = this.source,
        target = this.target,
        result = this.apply(nodeList);
    this.source = source;
    this.target = target;
    if(result) this.applyContent(this.content(result));
}

DOMTransform.prototype.applyContent = function(content) {
    if(content instanceof Node) {
        this.target.appendChild(content);
    } else if(content instanceof Array && content.length) {
        this.appendNodeList(content);
    }
}

DOMTransform.prototype.content = function(content) {
    return content;
}

DOMTransform.prototype.appendNodeList = function(nodeList, target) {
    var i = 0, node;
    if(!target) target = this.target;
    while(node = nodeList[i++]) target.appendChild(node);
}

DOMTransform.Element = function(template, base) {
    if(!this.attributes) {
        this.attributes = base? Object.assign({}, base.attributes) : {};
    }
    for(var prop in template) {
        if(prop === 'attributes') {
            Object.assign(this.attributes, template.attributes);
        } else {
            this[prop] = template[prop];
        }
    }
}

DOMTransform.Element.prototype = DOMTransform.prototype;

DOMTransform.prototype.element = function(name, template) {
    var elements = this.elements,
        element = elements[name],
        constructor = DOMTransform.Element;
    if(element) {
        constructor.call(element, template);
    } else {
        element = new constructor(template, elements._);
        element.elements = elements;
        elements[name] = element;
    }
    return element;
}
