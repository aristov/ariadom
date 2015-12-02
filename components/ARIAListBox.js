function ARIAListBox(element) {
    element.aria = this;
    this.element = element;
    this.createList();
}

ARIAListBox.prototype.createList = function() {
    Array.prototype.forEach.call(
        this.element.querySelectorAll('[role=option]'),
        function(element, i) {
            Array.prototype.push.call(this, ARIAOption.getOption(element));
        }, this);
}

ARIAListBox.prototype.unselect = function() {
    Array.prototype.forEach.call(this, function(option) {
        option.selected = 'false';
    });
}

ARIAListBox.getListBox = function(element) {
    return element.aria || new ARIAListBox(element);
}

////////////////////////////////////////////////////////////////

function ARIAOption(element) {
    element.aria = this;
    this.element = element;
}

Object.defineProperty(ARIAOption.prototype, 'selected', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-selected') || '';
    },
    set : function(value) {
        value = String(value);
        this.element.setAttribute('aria-selected', value);
    }
});

ARIAOption.prototype.getListBox = function() {
    return ARIAListBox.getListBox(this.element.closest('[role=listbox]'));
}

ARIAOption.prototype.onMouseDown = function(e) {
    this.getListBox().unselect();
    this.selected = 'true';
    this.element.dispatchEvent(new Event('change'));
}

ARIAOption.isOption = function(element) {
    return Boolean(element.aria) ||
        (typeof element.getAttribute === 'function' &&
            element.getAttribute('role') === 'option');
}

ARIAOption.getOption = function(element) {
    return element.aria || new ARIAOption(element);
}

ARIAOption.attachToDocument = function() {
    var _this = this;

    document.addEventListener('mousedown', function(e) {
        if(_this.isOption(e.target)) _this.getOption(e.target).onMouseDown(e);
    }, true);
}

ARIAOption.attachToDocument();
