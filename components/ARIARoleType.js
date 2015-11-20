function ARIARoleType() {};

Object.defineProperty(Element.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});

Object.defineProperty(Element.prototype, 'ariaDisabled', {
    enumerable : true,
    get : function() {
        return this.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        this.setAttribute('aria-disabled', String(value));
        this.onAriaDisabled();
    }
});



