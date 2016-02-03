var DON = {

    /**
     * Converts DOM-tree to DON-tree
     * @param {Node} node root DOM-node
     * @returns {Object} Document object notaion
     */
    fromDOM : function(node) {
        var result, childNodes, i;
        switch(node.nodeType) {
            case Node.ELEMENT_NODE :
                result = { element : node.tagName.toLowerCase() };
                if(node.hasAttributes()) {
                    var attributes = node.attributes,
                        attrs = {},
                        i = 0, attr;
                    while(attr = attributes[i++]) {
                        attrs[attr.name] = attr.value;
                    }
                    result.attributes = attrs;
                }
                childNodes = node.childNodes;
                if(childNodes.length) {
                    var content = [], child;
                    i = 0;
                    while(child = childNodes[i++]) {
                        content.push(this.fromDOM(child));
                    }
                    result.content = content;
                }
                break;
            case Node.TEXT_NODE :
                result = {
                    node : 'text',
                    content : node.textContent
                };
                break;
            case Node.COMMENT_NODE :
                result = {
                    node : 'comment',
                    content : node.textContent
                };
                break;
            case Node.DOCUMENT_NODE :
                result = { node : 'document' };
                childNodes = node.childNodes;
                if(childNodes.length) {
                    var content = [], child;
                    i = 0;
                    while(child = childNodes[i++]) {
                        content.push(this.fromDOM(child));
                    }
                    result.content = content;
                }
                break;
            case Node.DOCUMENT_TYPE_NODE :
                result = {
                    node : 'doctype',
                    name : node.name
                };
                break;
            default : throw Error('unsupported node');
        }
        return result;
    },

    /**
     * Converts DON-tree to DOM-tree
     * @param don
     * @returns {Node}
     */
    toDOM : function(don) {
        if(typeof don === 'string') {
            return document.createTextNode(don);
        } else {
            var result = document.createElement(don.element),
                attributes = don.attributes,
                content = don.content;
            if(attributes) {
                for(var name in attributes) {
                    var value = attributes[name];
                    if(typeof value !== 'undefined') {
                        result.setAttribute(name, value);
                    }
                }
            }
            if(content) {
                if(Array.isArray(content)) {
                    content.forEach(function(child) {
                        result.appendChild(this.toDOM(child));
                    }, this);
                } else {
                    result.appendChild(this.toDOM(content));
                }
            }
            return result;
        }
    }
};
