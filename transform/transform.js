var transform = {
    _node : function(node) {
        var nodeType = node.nodeType;

        return nodeType === 1?
            this._element(node) :
            nodeType === 3? this._text(node) : null;
    },
    _text : function(node) {
        return document.createTextNode(node.nodeValue);
    },
    _element : function(element) {
        var result = document.createElement(node.nodeName);

        Array.prototype.forEach.call(
            element.attributes,
            function(attribute) {
                this._attribute(attribute, result);
            }, this);

        Array.prototype.forEach.call(
            element.childNodes,
            function(child) {
                this._child(child, result);
            }, this);

        return result;
    },
    _attribute : function(attribute, result) {
        var name = attribute.name,
            transform = this.attributes[name];

        transform?
            transform.call(this, attribute, result) :
            result.setAttribute(name, attribute.value);
    },
    _child : function(child, result) {
        result.appendChild(this._node(child));
    }
};
