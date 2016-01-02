var nodeType = {},
    elements = {

    };

nodeType[Node.TEXT_NODE] = function(node) {
    return document.createTextNode(node.nodeValue);
}

nodeType[Node.ELEMENT_NODE] = function(node) {
    var fn = elements[node.nodeName];
    return fn? fn(node) :
}

function transform(node) {
    var fn = nodeType[node.nodeType];
    return fn? fn(node) : null;
}

var roles = {
        alert : true,
        alertdialog : true,
        application : true,
        article : true,
        banner : true,
        button : true,
        cell : true,
        checkbox : true,
        columnheader : true,
        combobox : true,
        command : true,
        complementary : true,
        composite : true,
        contentinfo : true,
        definition : true,
        dialog : true,
        directory : true,
        document : true,
        feed : true,
        figure : true,
        form : true,
        grid : true,
        gridcell : true,
        group : true,
        heading : true,
        img : true,
        input : true,
        landmark : true,
        link : true,
        list : true,
        listbox : true,
        listitem : true,
        log : true,
        main : true,
        marquee : true,
        math : true,
        menu : true,
        menubar : true,
        menuitem : true,
        menuitemcheckbox : true,
        menuitemradio : true,
        navigation : true,
        none : true,
        note : true,
        option : true,
        presentation : true,
        progressbar : true,
        radio : true,
        radiogroup : true,
        range : true,
        region : true,
        roletype : true,
        row : true,
        rowgroup : true,
        rowheader : true,
        search : true,
        searchbox : true,
        section : true,
        sectionhead : true,
        select : true,
        separator : true,
        scrollbar : true,
        slider : true,
        spinbutton : true,
        status : true,
        structure : true,
        'switch' : true,
        tab : true,
        table : true,
        tablist : true,
        tabpanel : true,
        term : true,
        text : true,
        textbox : true,
        timer : true,
        toolbar : true,
        tooltip : true,
        tree : true,
        treegrid : true,
        treeitem : true,
        widget : true,
        window : true
    },
    ariaAttrs = {
        activedescendant : true,
        atomic : true,
        autocomplete : true,
        busy : true,
        checked : true,
        colcount : true,
        colindex : true,
        colspan : true,
        controls : true,
        current : true,
        describedat : true,
        describedby : true,
        disabled : true,
        dropeffect : true,
        errormessage : true,
        expanded : true,
        flowto : true,
        grabbed : true,
        haspopup : true,
        hidden : true,
        invalid : true,
        kbdshortcuts : true,
        label : true,
        labelledby : true,
        level : true,
        live : true,
        modal : true,
        multiline : true,
        multiselectable : true,
        orientation : true,
        owns : true,
        placeholder : true,
        posinset : true,
        pressed : true,
        readonly : true,
        relevant : true,
        required : true,
        roledescription : true,
        rowcount : true,
        rowindex : true,
        rowspan : true,
        selected : true,
        setsize : true,
        sort : true,
        valuemax : true,
        valuemin : true,
        valuenow : true,
        valuetext : true
    },
    dataAttrs : {
        name : true,
        value : true
    };

var transform = {
    _node : function(node) {
        var transform = this._nodeTypes[node.nodeType];

        return transform? transform.call(this, node) : null;
    },
    _nodeTypes : {
        1 : transform._element,
        3 : transform._text
    },
    _text : function(node) {
        return document.createTextNode(node.nodeValue);
    },
    _element : function(element) {
        var transform = this._elements[element.nodeName];
            result;

        if(transform) {
            return transform(element);
        }
        if(element.hasAttributes()) this._attributes(element, result);
        if(element.childNodes.length) this._childNodes(element, result);

        return result;
    },
    _nodeName : function(element) {
        return element.nodeName;
    },
    _attributes : function(element, result) {
        Array.prototype.forEach.call(
            element.attributes,
            function(attribute) {
                this._attribute(attribute, result);
            }, this);
    },
    _attribute : function(attribute, result) {
        var name = attribute.name,
            transform = this[name];

        transform?
            transform.call(this, attribute, result) :
            result.setAttribute(name, attribute.value);
    },
    _childNodes : function(element, result) {
        Array.prototype.forEach.call(
            element.childNodes,
            function(child) {
                this._childNode(child, result);
            }, this);
    },
    _childNode : function(child, result) {
        var node = this._node(child);
        if(node) result.appendChild(node);
    }
};
