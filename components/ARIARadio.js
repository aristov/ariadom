function ARIARadioGroup(element) {
    element.ariaradiogroup = this;
    this.element = element;
    this.checked = null;
    this.create();
}

ARIARadioGroup.prototype.forEach = Array.prototype.forEach;
ARIARadioGroup.prototype.push = Array.prototype.push;

ARIARadioGroup.prototype.create = function() {
    var first;
    this.forEach.call(
        this.element.querySelectorAll('[role=radio]'),
        function(element, i) {
            var radio = ARIARadio.getRadio(element);
            if(radio.isChecked()) this.checked = radio;
            this.push(i? ((radio.prev = this[i - 1]).next = radio) : (first = radio));
        }, this);
    (first.prev = this[this.length - 1]).next = first;
    this.checked || first.setFocusable(true);
}

ARIARadioGroup.prototype.setChecked = function(radio) {
    var checked = this.checked;
    checked? checked.setChecked('false') : this[0].setFocusable(false);
    (this.checked = radio).setChecked('true');
}

ARIARadioGroup.prototype.focus = function() {
    (this.checked || this[0]).element.focus();
}

ARIARadioGroup.getGroup = function(element) {
    return element.ariaradiogroup || new ARIARadioGroup(element);
}

////////////////////////////////////////////////////////////////

function ARIARadio(element) {
    element.ariaradio = this;
    this.element = element;
    this.setFocusable(this.isChecked());
    this.group = this.getGroup();
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
