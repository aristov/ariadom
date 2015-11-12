function ARIARadioGroup(element) {
    element.ariaradiogroup = this;

    this.element = element;
    this.checked = null;
    this.input = element.querySelector('input');

    this.initialize();
}

ARIARadioGroup.prototype.forEach = Array.prototype.forEach;
ARIARadioGroup.prototype.push = Array.prototype.push;

ARIARadioGroup.prototype.initialize = function() {
    var first, checked, focusable;

    this.forEach.call(
        this.element.querySelectorAll('[role=radio]'),
        function(element, i) {
            var radio = ARIARadio.getRadio(element);

            if(radio.isChecked()) this.checked = checked = radio;

            if(!focusable && !radio.isDisabled()) focusable = radio;

            this.push(i?
                ((radio.prev = this[i - 1]).next = radio) :
                (first = radio));
        }, this);

    (first.prev = this[this.length - 1]).next = first;

    if(!checked || checked.isDisabled()) {
        focusable && focusable.setFocusable(true);
    }
}

ARIARadioGroup.prototype.setDisabled = function(value) {
    value?
        this.element.setAttribute('aria-disabled', 'true') :
        this.element.removeAttribute('aria-disabled');
}

ARIARadioGroup.prototype.setChecked = function(radio) {
    var checked = this.checked;

    checked?
        checked.setChecked('false') :
        this.forEach(function(radio) { // may be optimized
            radio.setFocusable(false);
        });

    (this.checked = radio).setChecked('true');
    this.input && (this.input.value = radio.getValue());
}

ARIARadioGroup.prototype.focus = function() {
    var focusable = this.element.querySelector('[tabindex="0"]');
    focusable && focusable.focus();
}

ARIARadioGroup.prototype.getValue = function() {
    return this.input?
        this.input.value :
        (this.checked? this.checked.getValue() : '');
}

ARIARadioGroup.prototype.setValue = function(value) {
    var first = this[0],
        radio = first;

    do {
        if(radio.getValue() === value) {
            this.setChecked(radio);
            break;
        }
    } while((radio = radio.next) !== first);
}

ARIARadioGroup.getGroup = function(element) {
    return element.ariaradiogroup || new ARIARadioGroup(element);
}

////////////////////////////////////////////////////////////////

function ARIARadio(element) {
    element.ariaradio = this;

    this.element = element;
    this.setFocusable(this.isChecked() && !this.isDisabled());
    this.group = this.getGroup();

    element.addEventListener('keydown', this.onKeydown.bind(this));
}

ARIARadio.prototype.onKeydown = function(e) {
    var keyCode = e.keyCode;

    if(keyCode >= 37 && keyCode <=40) {
        var direction = keyCode < 39? 'prev' : 'next',
            target = this[direction];

        e.preventDefault();

        do {
            if(!target.isDisabled()) {
                this.group.setChecked(target);
                break;
            }
        } while((target = target[direction]) !== this);
    }
}

ARIARadio.prototype.isDisabled = function() {
    return this.element.disabled;
}

ARIARadio.prototype.getValue = function() {
    return this.element.value;
}

ARIARadio.prototype.getGroup = function() {
    return ARIARadioGroup.getGroup(this.element.closest('[role=radiogroup]'));
}

ARIARadio.prototype.check = function() {
    this.isChecked() || this.group.setChecked(this);
}

ARIARadio.prototype.setFocusable = function(value) {
    this.element.tabIndex = value? 0 : -1;
}

ARIARadio.prototype.setChecked = function(value) {
    var element = this.element;

    if(value === 'true') {
        this.setFocusable(true);
        element.setAttribute('aria-checked', 'true');
        element.focus();
    } else {
        this.setFocusable(false);
        element.removeAttribute('aria-checked');
    }
}

ARIARadio.prototype.isChecked = function() {
    return this.element.getAttribute('aria-checked') === 'true';
}

ARIARadio.isRadio = function(element) {
    return Boolean(element.ariaradio) ||
        (typeof element.getAttribute === 'function' &&
            element.getAttribute('role') === 'radio');
}

ARIARadio.getRadio = function(element) {
    return element.ariaradio || new ARIARadio(element);
}

ARIARadio.onFocus = function(e, element) {
    var radio = this.getRadio(element);
    radio.isChecked() || radio.group.focus();
}

ARIARadio.onClick = function(e, element) {
    e.preventDefault();
    this.getRadio(element).check();
}

ARIARadio.attachToDocument = function() {
    var _this = this;

    document.addEventListener('focus', function(e) {
        if(_this.isRadio(e.target)) _this.onFocus(e, e.target);
    }, true);
    document.addEventListener('click', function(e) {
        if(_this.isRadio(e.target)) _this.onClick(e, e.target);
    }, true);
}

ARIARadio.attachToDocument();
