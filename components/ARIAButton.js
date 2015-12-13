function ARIAButton(element) {
    element.aria = this;
    this.element = element;
}

Object.defineProperty(ARIAButton.prototype, 'pressed', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-pressed') || '';
    },
    set : function(value) {
        this.element.setAttribute('aria-pressed', String(value));
    }
});

ARIAButton.prototype.onClick = function(e) {
    if(this.pressed) {
        this.pressed = this.pressed === 'true'? 'false' : 'true';
        this.element.dispatchEvent(new Event('change'));
    };
}

ARIAButton.isButton = function(element) {
    return element.tagName === 'BUTTON';
}

ARIAButton.getButton = function(element) {
    return element.aria || new ARIAButton(element);
}

ARIAButton.attachToDocument = function() {
    document.addEventListener('click', function(e) {
        if(this.isButton(e.target)) this.getButton(e.target).onClick(e);
    }.bind(this), true);
}

ARIAButton.attachToDocument();
