function JSTransform() {
    this.objects = {};
}

JSTransform.prototype.object = function(name, transform) {
    this.objects[name] = Object.create(this, {
        transform : {
            enumerable : true,
            value : transform
        },
        objects : {
            enumerable : true,
            value : objects
        },
        base : {
            enumerable : true,
            value : this
        }
    });
}

JSTransform.prototype.apply = function(object) {
    this.object = object;
    var transform = this.objects[object.constructor.name];
    transform?
        transform.apply(object) :
        throw Error('unexpected object');
}

//================================================================

var domTransform = new JSTransform();

domTransform.object('Element', function(element) {
    return {
        element : element.tagName,
        attributes : this.apply(element.attributes),
        children : this.apply(element.children)
    };
});

domTransform.object('Text', function(node) {
    return node.textContent;
});

domTransform.object('NamedNodeMap', function(attributes) {
    var result = {}, i = 0, attr;
    while(attr = attributes[i++]) {
        result[attr.name] = attr.value;
    }
    return result;
});

domTransform.object('NodeList', function(nodeList) {
    var result = [], i = 0, node, child;
    while(node = nodeList[i++]) {
        child = this.apply(node);
        if(child) result.push(child);
    }
    return result;
});
