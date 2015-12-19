function ARIARadioGroup(element) {
    element.aria = this;
    this.element = element;

    this.forEach.call(
        element.querySelectorAll('[role=radio]'),
        function(element) {
            this.push(ARIARadio.getRadio(element));
        }, this);

    this.input = element.querySelector('input') || document.createElement('input');
}

ARIARadioGroup.prototype = new Array();

Object.defineProperty(ARIARadioGroup.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        var element = this.element,
            disabled = String(value),
            checked;

        if(disabled === 'true') {
            element.setAttribute('aria-disabled', 'true');
            this.input.disabled = true;
            this.forEach(function(radio) {
                radio.element.removeAttribute('tabindex');
            });
        } else {
            element.removeAttribute('aria-disabled');
            this.input.disabled = false;
            this.forEach(function(radio, i) {
                radio.element.tabIndex = -1;
                if(radio.checked === 'true') checked = radio;
            });
            if(checked) checked.element.tabIndex = 0;
            else this[0].element.tabIndex = 0;
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
    this.forEach(function(radio) {
        radio.checked = 'false';
    });
}

ARIARadioGroup.getRadioGroup = function(element) {
    return element.role === 'radiogroup'?
        element.aria || new ARIARadioGroup(element) :
        null;
}

////////////////////////////////////////////////////////////////

function ARIARadio(element) {
    element.aria = this;
    this.element = element;

    this.group = this.getGroup();

    element.addEventListener('click', this.onClick.bind(this));
    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

Object.defineProperty(ARIARadio.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-checked') || '';
    },
    set : function(value) {
        var element = this.element,
            checked = String(value);

        element.setAttribute('tabindex', checked === 'true'? '0' : '-1');
        element.setAttribute('aria-checked', checked);
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

    if(keyCode === 32) {
        event.preventDefault(); // prevent page scrolling
        this.onSpaceKeyDown(event);
    }
}

ARIARadio.prototype.onArrowKeyDown = function(event) {
    var direction = event.keyCode < 39? -1 : 1,
        group = this.group,
        index = group.indexOf(this) + direction;

    if(index === group.length) index = 0;
    if(index < 0) index = group.length - 1;

    group.uncheck();
    group[index].checked = true;
    group[index].element.focus();
}

ARIARadio.prototype.onSpaceKeyDown = function(event) {
    this.element.dispatchEvent(new Event('click'));
}

ARIARadio.getRadio = function(element) {
    return element.role === 'radio'?
        element.aria || new ARIARadio(element) :
        null;
}

ARIARadio.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getRadio(event.target);
    }.bind(this), true);
}

ARIARadio.attachToDocument();
