function ARIATransform() {}

ARIATransform.prototype = {
    '*' : function(element, name, value) {
        var isAria = this.constructor.aria[name];

        isAria?
            element.setAttribute('aria-' + name, value) :
            this.__base(element, name, value);
    },
    disabled : function(disabled) {
        this.element.setAttribute('aria-disabled', disabled);
    },
    pressed : function(pressed) {
        this.element.setAttribute('aria-pressed', pressed);
    },
    view : function(view) {
        this.view = view;
    },
    label : function(label) {
        this.element.textContent = label;
    }
}