function ARIAHTMLTextBox(element) {
    element.aria = this;
    this.element = element;

    (this.input = element.querySelector('input,textarea'))
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

Object.defineProperty(ARIAHTMLTextBox.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.input.value;
    },
    set : function(value) {
        this.input.value = value;
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
        var target = event.target,
            tagName = target.tagName;
        if(tagName === 'INPUT' || tagName === 'TEXTAREA') {
            var element = target.closest('[role=textbox]'),
                textBox = element && this.getTextBox(element);
            if(textBox) textBox.onFocus(event);
        }
    }.bind(this), true);
}
