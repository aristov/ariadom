function DOMTransform() {}

DOMTransform.nodeTypes = {};

DOMTransform.prototype.apply = function(context) {
    var template;

    if(context instanceof Node) {
        template = DOMTransform.nodeTypes[context.nodeType];
    } else if(context instanceof NodeList) {
        template = DOMTransform.nodeList;
    }

    return template? template.process(context) : null;
}

function DOMNodeListTransform() {
    this.constructor = DOMNodeListTransform;
}

DOMNodeListTransform.prototype = new DOMTransform();

DOMNodeListTransform.prototype.process = function(nodeList) {
    var result = [];
    if(nodeList.length) {
        var node = nodeList[0];
        do result.push(this.apply(node));
        while(node = node.nextSibling);
    }
    return result;
}

DOMTransform.nodeList = new DOMNodeListTransform();

function DOMTextTransform() {
    this.constructor = DOMTextTransform;
}

DOMTextTransform.prototype.process = function(node) {
    return this.transform(node);
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
    return template.transform(template.source = source);
}

DOMElementTransform.prototype.transform = function(source) {
    this.target = this.createTarget();
    this.processAttributes(source.attributes);
    this.processChildNodes(source.childNodes);
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

DOMElementTransform.prototype.processAttributes = function(attributes) {
    var attrs = this.reduceAttributes(attributes),
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

DOMElementTransform.prototype.processChildNodes = function(nodeList) {
    var target = this.target,
        result = this.apply(nodeList);

    this.target = target;
    if(result) this.applyContent(this.content(result));
}

DOMElementTransform.prototype.content = function(content) {
    return content;
}

DOMElementTransform.prototype.applyContent = function(content) {
    if(content instanceof Node) {
        this.target.appendChild(content);
    } else if(content instanceof Array && content.length) {
        this.appendNodeList(content);
    }
}

DOMElementTransform.prototype.appendNodeList = function(nodes, target) {
    var i = 0, node;
    if(!target) target = this.target;
    while(node = nodes[i++]) target.appendChild(node);
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
