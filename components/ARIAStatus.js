function ARIAStatus(element) {
    element.aria = this;
    this.element = element;
}

Object.defineProperty(ARIAStatus.prototype, 'text', {
    enumerable : true,
    get : function() {
        return this.element.textContent;
    },
    set : function(value) {
        var element = this.element;

        element.textContent = value;
        element.hidden = !value;
    }
});

ARIAStatus.isStatus = function(element) {
    return Boolean(element.aria) || element.role === 'status';
}

ARIAStatus.getStatus = function(element) {
    return element.aria || new ARIAStatus(element);
}
