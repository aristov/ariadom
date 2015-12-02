function ARIAListBox(element) {
    element.aria = this;
    this.element = element;
    this.createList();
    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

ARIAListBox.prototype = new Array();

Object.defineProperty(ARIAListBox.prototype, 'selected', {
    enumerable : true,
    get : function() {
        return this.filter(function(option) {
            return option.selected === 'true';
        });
    }
});

ARIAListBox.prototype.createList = function() {
    this.forEach.call(
        this.element.querySelectorAll('[role=option]'),
        function(element, i) {
            this.push(ARIAOption.getOption(element));
        }, this);
}

ARIAListBox.prototype.unselect = function() {
    this.selected.forEach(function(option) {
        option.selected = 'false';
    });
}

ARIAListBox.prototype.onKeyDown = function(e) {
    var keyCode = e.keyCode;

    if(keyCode >= 37 && keyCode <= 40) {
        e.preventDefault(); // prevent page scrolling
        var direction = keyCode < 39? -1 : 1,
            selected = this.selected[0],
            next = this.indexOf(selected) + direction;
        if(next === this.length) next = 0;
        if(next < 0) next = this.length - 1;
        this.unselect();
        this[next].selected = true;
    }
}

ARIAListBox.isListBox = function(element) {
    return Boolean(element.aria) ||
        (typeof element.getAttribute === 'function' &&
            element.getAttribute('role') === 'listbox');
}

ARIAListBox.getListBox = function(element) {
    return element.aria || new ARIAListBox(element);
}

ARIAListBox.attachToDocument = function() {
    var _this = this;
    document.addEventListener('focus', function(e) {
        if(_this.isListBox(e.target)) _this.getListBox(e.target);
    }, true);
}

ARIAListBox.attachToDocument();

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

Object.defineProperty(ARIAOption.prototype, 'listBox', {
    enumerable : true,
    get : function() {
        return ARIAListBox.getListBox(this.element.closest('[role=listbox]'));
    }
});

ARIAOption.prototype.onMouseDown = function(e) {
    this.listBox.unselect();
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
