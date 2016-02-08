function ARIARadioGroup(element) {
    element.aria = this;
    this.element = element;

    this.input = element.querySelector('input') || document.createElement('input');
}

Object.defineProperty(ARIARadioGroup.prototype, 'radios', {
    enumerable : true,
    get : function() {
        return Array.prototype.map.call(
            this.element.querySelectorAll('[role=radio]'),
            function(element) {
                return ARIARadio.getRadio(element);
            });
    }
});

Object.defineProperty(ARIARadioGroup.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        var element = this.element,
            disabled = String(value),
            radios = this.radios,
            checked;

        if(disabled === 'true') {
            element.setAttribute('aria-disabled', 'true');
            this.input.disabled = true;
            radios.forEach(function(radio) {
                radio.element.removeAttribute('tabindex');
            });
        } else {
            element.removeAttribute('aria-disabled');
            this.input.disabled = false;
            radios.forEach(function(radio) {
                radio.element.tabIndex = -1;
                if(radio.checked === 'true') checked = radio;
            });
            if(checked) checked.element.tabIndex = 0;
            else radios[0].element.tabIndex = 0;
        }
    }
});

Object.defineProperty(ARIARadioGroup.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.input.value;
    },
    set : function(value) {
        this.input.value = value;
    }
});

ARIARadioGroup.prototype.uncheck = function() {
    this.radios.forEach(function(radio) {
        radio.checked = 'false';
    });
}

ARIARadioGroup.role = 'radiogroup';

ARIARadioGroup.getRadioGroup = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIARadioGroup.attachToDocument = function() {
    ARIARadio.attachToDocument();
}

////////////////////////////////////////////////////////////////

function ARIARadio(element) {
    element.aria = this;
    this.element = element;

    this.group = this.getGroup();

    element.addEventListener('click', this.onClick.bind(this));
    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('keyup', this.onKeyUp.bind(this));
}

Object.defineProperty(ARIARadio.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-checked') || '';
    },
    set : function(value) {
        var element = this.element,
            checked = String(value);

        element.setAttribute('aria-checked', checked);
        element.setAttribute('tabindex', checked === 'true'? '0' : '-1');
        this.group.value = this.value;
    }
});

Object.defineProperty(ARIARadio.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.group.disabled === 'true'?
            'true' :
            this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        var element = this.element,
            disabled = String(value);

        if(disabled === 'true') {
            element.setAttribute('aria-disabled', 'true');
            element.removeAttribute('tabindex');
        } else {
            element.removeAttribute('aria-disabled');
            element.tabIndex = -1;
        }
    }
});

Object.defineProperty(ARIARadio.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.element.dataset.value;
    }
});

ARIARadio.prototype.getGroup = function() {
    var element = this.element,
        group = element.closest('[role=radiogroup]');

    if(group) return ARIARadioGroup.getRadioGroup(group);
    else throw Error('radio requires an ancestor with radiogroup role assigned');
}

ARIARadio.prototype.onClick = function(event) {
    if(this.disabled)
        event.stopImmediatePropagation();
    else {
        this.group.uncheck();
        this.checked = 'true';
    }
}

ARIARadio.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;

    if(keyCode >= 37 && keyCode <= 40) {
        event.preventDefault(); // prevent page scrolling
        this.onArrowKeyDown(event);
    }

    if(event.keyCode === 32 && !event.repeat) {
        event.preventDefault(); // prevent page scrolling
        this.element.classList.add('active');
    }
}

ARIARadio.prototype.onKeyUp = function(event) {
    if(event.keyCode === 32) {
        var element = this.element;

        element.classList.remove('active');
        element.dispatchEvent(new Event('click'));
    }
}

ARIARadio.prototype.onArrowKeyDown = function(event) {
    var direction = event.keyCode < 39? -1 : 1,
        group = this.group,
        radios = group.radios,
        index = radios.indexOf(this) + direction;

    if(index === radios.length) index = 0;
    if(index < 0) index = radios.length - 1;

    group.uncheck();
    radios[index].checked = true;
    radios[index].element.focus();
}

ARIARadio.role = 'radio';

ARIARadio.getRadio = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIARadio.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getRadio(event.target);
    }.bind(this), true);
}
