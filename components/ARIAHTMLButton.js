function ARIAHTMLButton(element) {
    element.aria = this;
    this.element = element;
}

Object.defineProperty(ARIAHTMLButton.prototype, 'pressed', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-pressed') || '';
    },
    set : function(value) {
        this.element.setAttribute('aria-pressed', String(value));
    }
});

ARIAHTMLButton.prototype.onClick = function(e) {
    if(this.pressed) {
        this.pressed = this.pressed === 'true'? 'false' : 'true';
        this.element.dispatchEvent(new Event('change'));
    };
}

ARIAHTMLButton.isButton = function(element) {
    return element.tagName === 'BUTTON';
}

ARIAHTMLButton.getButton = function(element) {
    return element.aria || new ARIAHTMLButton(element);
}

ARIAHTMLButton.attachToDocument = function() {
    document.addEventListener('click', function(e) {
        if(this.isButton(e.target)) this.getButton(e.target).onClick(e);
    }.bind(this), true);
}

ARIAHTMLButton.attachToDocument();
