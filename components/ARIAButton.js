function ARIAButton(element) {
    if(element.role) return element;

    Object.defineProperty(element, 'role', {
        enumerable : true,
        get : function() {
            return this.getAttribute('role') || '';
        }
    });

    Object.defineProperty(element, 'ariaPressed', {
        enumerable : true,
        get : function() {
            return this.getAttribute('aria-pressed') || '';
        },
        set : function(value) {
            this.setAttribute('aria-pressed', String(value));
        }
    });

    return element;
}
