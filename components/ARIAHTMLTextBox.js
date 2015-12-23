function ARIAHTMLTextBox(element) {
    element.aria = this;
    this.element = element;

    (this.input = element.querySelector('input'))
        .addEventListener('blur', this.onBlur.bind(this));
}

Object.defineProperty(ARIAHTMLTextBox.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return String(this.input.disabled);
    },
    set : function(value) {
        var disabled = String(value);

        (this.input.disabled = disabled === 'true')?
            this.element.classList.add('disabled') :
            this.element.classList.remove('disabled');
    }
});

ARIAHTMLTextBox.prototype.onFocus = function(event) {
    this.element.classList.add('focus');
}

ARIAHTMLTextBox.prototype.onBlur = function(event) {
    this.element.classList.remove('focus');
}

ARIAHTMLTextBox.role = 'textbox';

ARIAHTMLTextBox.getTextBox = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAHTMLTextBox.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        var target = event.target;
        if(target.tagName === 'INPUT') {
            var element = target.closest('[role=textbox]'),
                textBox = element && this.getTextBox(element);
            if(textBox) textBox.onFocus(event);
        }
    }.bind(this), true);
}

ARIAHTMLTextBox.attachToDocument();
