function ARIACheckBox(element) {
    element.aria = this;
    this.element = element;
    this.input = element.querySelector('input') || document.createElement('input');
}

Object.defineProperty(ARIACheckBox.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-checked') || '';
    },
    set : function(value) {
        value = String(value);
        this.input.disabled = value === 'false';
        this.element.setAttribute('aria-checked', value);
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

ARIACheckBox.prototype.onClick = function(e) {
    this.checked = this.checked === 'true'? 'false' : 'true';
    this.element.dispatchEvent(new Event('change'));
}

ARIACheckBox.isCheckBox = function(element) {
    return Boolean(element.aria) ||
        (typeof element.getAttribute === 'function' &&
            element.getAttribute('role') === 'checkbox');
}

ARIACheckBox.getCheckBox = function(element) {
    return element.aria || new ARIACheckBox(element);
}

ARIACheckBox.attachToDocument = function() {
    var _this = this;

    document.addEventListener('click', function(e) {
        if(_this.isCheckBox(e.target)) _this.getCheckBox(e.target).onClick(e);
    }, true);
}

ARIACheckBox.attachToDocument();
