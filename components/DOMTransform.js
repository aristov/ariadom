function JSTNode() {}

JSTNode.prototype.transform = function(node) {
    var nodeType = node.nodeType,
        result;

    if(nodeType === 1) {
        result = (new JSTElement()).transform(node);
    } else if(nodeType === 3) {
        result = document.createTextNode(node.nodeValue);
    }
    return result;
}

function JSTElement() {}

JSTElement.prototype = new JSTNode();

JSTElement.prototype.transform = function(element) {
    var result = document.createElement(element.nodeName);

    forEach.call(element.attributes, function(attribute) {
        result.setAttribute(attribute.name, attribute.value);
    });
    forEach.call(element.childNodes, function(child) {
        result.appendChild(transform(child));
    });

    return result;
}
