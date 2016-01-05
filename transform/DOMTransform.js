function DOMTransform() {}

DOMTransform.nodeTypes = {};

DOMTransform.prototype.apply = function(node) {
    var template = DOMTransform.nodeTypes[node.nodeType];
    return template? template.process(node) : null;
}

function DOMTextTransform() {
    this.constructor = DOMTextTransform;
}

DOMTextTransform.prototype = new DOMTransform();

DOMTextTransform.prototype.process = function(node) {
    return this.transform(node);
}

DOMTextTransform.prototype.transform = function(node) {
    return document.createTextNode(node.nodeValue);
}

DOMTransform.nodeTypes[Node.TEXT_NODE] = new DOMTextTransform();

function DOMElementTransform() {
    this.constructor = DOMElementTransform;
}

DOMElementTransform.prototype = new DOMTransform();

DOMElementTransform.prototype.source = null;
DOMElementTransform.prototype.target = null;

DOMElementTransform.prototype.elements = {};
DOMElementTransform.prototype.attributes = {};

DOMElementTransform.prototype.params = {};

DOMElementTransform.prototype.process = function(source) {
    var template = this.elements[source.tagName] || this;
    template.source = source;
    return template.transform();
}

DOMElementTransform.prototype.transform = function() {
    this.target = this.createTarget();

    this.processAttributes();
    this.applyChildNodes();

    if(this.postProcess) this.postProcess();

    return this.target;
}

DOMElementTransform.prototype.createTarget = function() {
    return this.createElement(this.tagName || this.source.tagName);
}

DOMElementTransform.prototype.createElement = function(tag, attrs) {
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

DOMElementTransform.prototype.processAttributes = function() {
    var attrs = this.reduceAttributes(this.source.attributes),
        name;
    for(name in this.attributes) attrs[name] = this.attributes[name];
    this.applyAttributes(attrs);
}

DOMElementTransform.prototype.reduceAttributes = function(attributes) {
    var result = {}, i = 0, attr;
    while(attr = attributes[i++]) result[attr.name] = attr.value;
    return result;
}

DOMElementTransform.prototype.applyAttributes = function(attributes) {
    for(name in attributes) {
        this.applyAttribute(name, attributes[name]);
    }
}

DOMElementTransform.prototype.applyAttribute = function(name, value) {
    if(typeof value === 'function') {
        value = value.call(this, name, this.source.getAttribute(name));
    }
    if(typeof value !== 'undefined') {
        this.target.setAttribute(name, value);
    }
}

DOMElementTransform.prototype.applyChildNodes = function() {
    var target = this.target;

    Array.prototype.forEach.call(this.source.childNodes, function(childNode) {
        this.processChildNode(childNode);
        this.target = target;
    }, this);
}

DOMElementTransform.prototype.processChildNode = function(childNode) {
    var target = this.target,
        child = this.apply(childNode);

    this.target = target;
    if(child) target.appendChild(child);
}

DOMTransform.nodeTypes[Node.ELEMENT_NODE] = new DOMElementTransform();

DOMTransform.prototype.element = function(name, template) {
    var element = new DOMElementTransform(),
        prop;

    for(prop in template) {
        element[prop] = template[prop];
    }
    DOMElementTransform.prototype.elements[name] = element;
}
