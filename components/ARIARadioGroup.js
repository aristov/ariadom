function ARIARadioGroup(element) {
    this.element = element;
    element.radioGroup = this;
}

ARIARadioGroup.prototype.getGroup = function(check) {
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
    input? input.value = value : (this.dataset.value = value);
}

ARIARadioGroup.prototype.nextOf = function(element) {
    var group = this.getGroup(),
        index = this.indexOf(element) + 1;
    return index >= group.length? group[0] : group[index];
}

ARIARadioGroup.prototype.previousOf = function(element) {
    var group = this.getGroup(),
        index = this.indexOf(element) - 1;
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
        e.ctrlKey? target.focus() : radioGroup.switch(target);
    }
}

ARIARadioGroup.isRadioButton = function(target) {
    return !!target.radioGroup || target.getAttribute('role') === 'radio';
}

document.addEventListener('click', function(e) {
    if(ARIARadioGroup.isRadioButton(e.target)) ARIARadioGroup.onButtonClick(e, e.target);
});

document.addEventListener('keydown', function(e) {
    if(ARIARadioGroup.isRadioButton(e.target)) ARIARadioGroup.onButtonKeydown(e, e.target);
});
