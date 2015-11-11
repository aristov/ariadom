function ARIARadioGroup(element) {
    this.element = element;
    element.radioGroup = this;
}

ARIARadioGroup.prototype.getGroup = function() {
    return this.group || (this.group = this.element.querySelectorAll('button[role=radio]'));
}

ARIARadioGroup.prototype.getChecked = function() {
    return this.element.querySelector('button[role=radio][aria-checked=true]');
}

ARIARadioGroup.prototype.getInput = function() {
    return this.input || (this.input = this.element.querySelector('input[type=hidden]'));
}

ARIARadioGroup.prototype.uncheck = function() {
    var checked = this.getChecked();
    if(checked) {
        checked.removeAttribute('aria-checked');
        checked.setAttribute('tabindex', '-1');
    }
}

ARIARadioGroup.prototype.indexOf = function(button) {
    return Array.prototype.indexOf.call(this.getGroup(), button);
}

ARIARadioGroup.prototype.setChecked = function(button) {
    button.setAttribute('aria-checked', 'true');
    button.removeAttribute('tabindex');
}

ARIARadioGroup.prototype.updateValue = function(value) {
    var input = this.getInput();
    input? input.value = value : (this.value = value);
}

ARIARadioGroup.prototype.nextOf = function(button) {
    var group = this.getGroup(),
        index = this.indexOf(button) + 1;
    return index >= group.length? group[0] : group[index];
}

ARIARadioGroup.prototype.previousOf = function(button) {
    var group = this.getGroup(),
        index = this.indexOf(button) - 1;
    return index < 0? group[group.length - 1] : group[index];
}

ARIARadioGroup.prototype.switch = function(button) {
    if(button.getAttribute('aria-checked') !== 'true') {
        this.uncheck();
        this.setChecked(button);
        this.updateValue(button.value);
    }
    button.focus();
}

ARIARadioGroup.getOrNewByButton = function(button) {
    if(button.radioGroup) return button.radioGroup;
    return button.radioGroup = new ARIARadioGroup(this.getElementByButton(button));
}

ARIARadioGroup.getElementByButton = function(element) {
    do element = element.parentElement;
    while(element.getAttribute('role') !== 'radiogroup');
    return element;
}

ARIARadioGroup.onButtonClick = function(e, button) {
    this.getOrNewByButton(button).switch(button);
}

ARIARadioGroup.onButtonKeydown = function(e, button) {
    if(e.keyCode >= 37 && e.keyCode <=40) {
        var radioGroup = this.getOrNewByButton(button),
            target = e.keyCode >= 39?
                radioGroup.nextOf(button) :
                radioGroup.previousOf(button);
        if(!target.disabled) e.ctrlKey? target.focus() : radioGroup.switch(target);
    }
}

ARIARadioGroup.isRadioButton = function(target) {
    return !!target.radioGroup || target.getAttribute('role') === 'radio';
}

ARIARadioGroup.attachToDocument = function(root) {
    var _this = this;
    root.addEventListener('click', function(e) {
        if(_this.isRadioButton(e.target)) _this.onButtonClick(e, e.target);
    });
    root.addEventListener('keydown', function(e) {
        if(_this.isRadioButton(e.target)) _this.onButtonKeydown(e, e.target);
    });
}

ARIARadioGroup.attachToDocument(window.document);
