var DOMTransform = function() {

function DOMTransform() {
    this.templates = {
        '*' : this.baseElement,
        '#text' : this.baseText
    };
    this.baseElement.templates = this.templates;
}

var prototype = DOMTransform.prototype;

prototype.template = function(name, template) {
    var templates = this.templates,
        base = templates[name] || templates['*'],
        element = Object.create(base);
    element.base = base;
    element.templates = templates;
    Object.keys(template).forEach(function(prop) {
        var value = template[prop];
        element[prop] = typeof value === 'function'?
            template[prop] :
            function() { return value };
    });
    return templates[name] = element;
}

prototype.apply = function(context) {
    return this.templates['*'].apply(context);
}

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
                }, this);
            } else {
                result.appendChild(this.build(children));
            }
        }
        return result;
    }
}

prototype.transform = function(node) {
    return this.build(this.apply(node));
}

////////////////////////////////////////////////////////////////

prototype.baseElement = {
    apply : function(element) {
        var templates = this.templates,
            template = templates[element.nodeName] || templates['*'];
        return template.transform(element);
    },
    transform : function(element) {
        var result = { element : this.element(element.tagName, element) },
            attrs = this.attrs = this.getAttrs(element.attributes, element),
            attributes = this.attributes(attrs, element),
            children = this.children(element.childNodes, element);
        if(attributes) result.attributes = attributes;
        if(children) result.children = children;
        return result;
    },
    element : function(name, element) {
        return name;
    },
    getAttrs : function(attributes, element) {
        var attrs = {}, i = 0, attr;
        while(attr = attributes[i++]) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    },
    attributes : function(attributes, element) {
        return attributes;
    },
    collection : function(collection, element) {
        var result = [], i = 0, node, child;
        while(node = collection[i++]) {
            child = this.apply(node);
            if(child) result.push(child);
        }
        return result;
    },
    children : function(children, element) {
        return this.collection(children, element);
    }
};

prototype.baseText = {
    transform : function(node) {
        return /^\s+$/.test(node.textContent)? null : node.textContent;
    }
}

return DOMTransform;

}();
