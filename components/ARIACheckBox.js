function ARIACheckBox(element) {
    element.aria = this;
    this.element = element;

    var input = element.querySelector('input');
    if(!input) {
        input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.name = element.dataset.name;
        input.value = element.dataset.value;
    }
    element.appendChild(this.input = input);

    element.addEventListener('click', this.onClick.bind(this));
    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('keyup', this.onKeyUp.bind(this));
}

Object.defineProperty(ARIACheckBox.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-checked') || '';
    },
    set : function(value) {
        var element = this.element,
            checked = String(value);

        element.setAttribute('aria-checked', checked);
        checked === 'true'?
            element.appendChild(this.input) :
            element.removeChild(this.input);
    }
});

Object.defineProperty(ARIACheckBox.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        var element = this.element,
            disabled = String(value);

        element.setAttribute('aria-disabled', disabled);
        if(this.input.disabled = disabled === 'true')
            element.removeAttribute('tabindex');
        else
            element.setAttribute('tabindex', '0');
    }
});

Object.defineProperty(ARIACheckBox.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.input.value;
    },
    set : function(value) {
        this.input.value = value;
    }
});

ARIACheckBox.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;

    if(keyCode === 32 && !event.repeat) this.element.classList.add('active');
}

ARIACheckBox.prototype.onKeyUp = function(event) {
    if(event.keyCode === 32) {
        var element = this.element;

        element.classList.remove('active');
        element.dispatchEvent(new Event('click'));
    }
}

ARIACheckBox.prototype.onClick = function(event) {
    if(this.disabled === 'true') {
        event.stopImmediatePropagation();
    } else {
        this.checked = this.checked === 'true'? 'false' : 'true';
        this.element.dispatchEvent(new Event('change'));
    }
}

ARIACheckBox.getCheckBox = function(element) {
    return element.role === 'checkbox'?
        element.aria || new ARIACheckBox(element) :
        null;
}

ARIACheckBox.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getCheckBox(event.target);
    }.bind(this), true);
}

ARIACheckBox.attachToDocument();
