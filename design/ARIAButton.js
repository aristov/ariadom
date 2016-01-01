function ARIAButton(element) {
    element.aria = this;
    this.element = element;

    element.addEventListener('click', this.onClick.bind(this));
    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('keyup', this.onKeyUp.bind(this));
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

Object.defineProperty(ARIAButton.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        this.element.setAttribute('aria-disabled', String(value));
    }
});

ARIAButton.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;

    if(keyCode === 13)
        this.element.dispatchEvent(new Event('click'));

    if(keyCode === 32 && !event.repeat) {
        event.preventDefault();
        this.element.classList.add('active');
    }
}

ARIAButton.prototype.onKeyUp = function(event) {
    if(event.keyCode === 32) {
        var element = this.element;

        element.classList.remove('active');
        element.dispatchEvent(new Event('click'));
    }
}

ARIAButton.prototype.onClick = function(event) {
    if(this.disabled === 'true') {
        event.stopImmediatePropagation();
    } else if(this.pressed) {
        this.pressed = this.pressed === 'true'? 'false' : 'true';
        this.element.dispatchEvent(new Event('change'));
    }
}

ARIAButton.role = 'button';

ARIAButton.getButton = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAButton.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getButton(event.target);
    }.bind(this), true);
}

ARIAButton.transform = function(button) {
    var element = document.createElement('span'),
        view;

    element.setAttribute('role', this.role);

    if(button.getAttribute('disabled') !== 'true')
        element.setAttribute('tabindex', '0');

    Array.prototype.forEach.call(button.attributes, function(attribute) {
        var name = attribute.name,
            value = attribute.value;

        if(name === 'disabled')
            element.setAttribute('aria-disabled', value);
        else if(name === 'pressed')
            element.setAttribute('aria-pressed', value);
        else if(name === 'view')
            view = value;
        else if(name === 'label')
            element.textContent = value;
        else
            element.setAttribute(name, value);
    });

    element.classList.add(view || this.role);

    return element;
}
