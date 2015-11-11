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
}

ARIARadioGroup.prototype.setChecked = function(radio) {
    var checked = this.checked;
    if(checked) checked.setChecked('false');
    (this.checked = radio).setChecked('true');
}

ARIARadioGroup.getGroup = function(element) {
    return element.ariaradiogroup || new ARIARadioGroup(element);
}

////////////////////////////////

function ARIARadio(element) {
    element.ariaradio = this;
    this.element = element;
    this.group = this.getGroup();
}

ARIARadio.prototype.getGroup = function() {
    return ARIARadioGroup.getGroup(this.element.closest('[role=radiogroup]'));
}

ARIARadio.prototype.check = function() {
    if(!this.isChecked()) this.group.setChecked(this);
}

ARIARadio.prototype.setChecked = function(value) {
    value === 'true'?
        this.element.setAttribute('aria-checked', value) :
        this.element.removeAttribute('aria-checked');
}

ARIARadio.prototype.isChecked = function() {
    return this.element.getAttribute('aria-checked') === 'true';
}

ARIARadio.isRadio = function(element) {
    return Boolean(element.ariaradio) || element.getAttribute('role') === 'radio';
}

ARIARadio.getRadio = function(element) {
    return element.ariaradio || new ARIARadio(element);
}

ARIARadio.onClick = function(e, element) {
    this.getRadio(element).check();
}

ARIARadio.attachToDocument = function() {
    var _this = this;
    document.addEventListener('click', function(e) {
        if(_this.isRadio(e.target)) _this.onClick(e, e.target);
    });
}

ARIARadio.attachToDocument();
