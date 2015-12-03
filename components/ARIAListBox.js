Object.defineProperty(Element.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});

function ARIAListBox(element) {
    element.aria = this;
    this.element = element;

    this.createList();
    this.input = element.querySelector('input') || document.createElement('input');

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

Object.defineProperty(ARIAListBox.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.filter(function(option) {
            return option.checked === 'true';
        });
    }
});

Object.defineProperty(ARIAListBox.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.input.value;
    },
    set : function(value) {
        this.input.value = value;
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

ARIAListBox.prototype.uncheck = function() {
    this.checked.forEach(function(option) {
        option.checked = 'false';
    });
}

ARIAListBox.prototype.onKeyDown = function(e) {
    var keyCode = e.keyCode;

    if(keyCode >= 37 && keyCode <= 40) {
        e.preventDefault(); // prevent page scrolling
        this.handleKeyboardSelect(keyCode);
    }

    if(keyCode === 13 || keyCode === 32) this.handleKeyboardCheck();
}

ARIAListBox.prototype.handleKeyboardSelect = function(keyCode) {
    var direction = keyCode < 39? -1 : 1,
        selected = this.selected[0],
        next = this.indexOf(selected) + direction;

    if(next === this.length) next = 0;
    if(next < 0) next = this.length - 1;

    this.unselect();
    this[next].selected = true;
}

ARIAListBox.prototype.handleKeyboardCheck = function() {
    this.uncheck();
    this.selected.forEach(function(option) {
        option.checked = 'true';
    });
}

ARIAListBox.prototype.onFocus = function(e) {
    if(!this.selected.length) this[0].selected = 'true';
}

ARIAListBox.isListBox = function(element) {
    return element.role === 'listbox';
}

ARIAListBox.getListBox = function(element) {
    return element.aria || new ARIAListBox(element);
}

ARIAListBox.attachToDocument = function() {
    var _this = this;
    document.addEventListener('focus', function(e) {
        if(_this.isListBox(e.target)) _this.getListBox(e.target).onFocus(e);
    }, true);
}

ARIAListBox.attachToDocument();

////////////////////////////////////////////////////////////////

function ARIAOption(element) {
    element.aria = this;
    this.element = element;

    this.listBox = ARIAListBox.getListBox(element.closest('[role=listbox]'));

    this.addEventListener('mouseleave', this.onMouseLeave);
    this.addEventListener('mousedown', this.onMouseDown);
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

Object.defineProperty(ARIAOption.prototype, 'checked', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-checked') || '';
    },
    set : function(value) {
        value = String(value);
        this.element.setAttribute('aria-checked', value);
        this.listBox.value = this.value;
    }
});

Object.defineProperty(ARIAOption.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.element.dataset.value;
    }
});

ARIAOption.prototype.addEventListener = function(type, listener, useCapture) {
    this.element.addEventListener(type, listener.bind(this), useCapture);
}

ARIAOption.prototype.onMouseDown = function(e) {
    this.listBox.uncheck();
    this.checked = 'true';
}

ARIAOption.prototype.onMouseLeave = function(e) {
    this.selected = 'false';
}

ARIAOption.prototype.onMouseEnter = function(e) {
    this.listBox.unselect();
    this.selected = 'true';
    this.element.dispatchEvent(new Event('change'));
}

ARIAOption.isOption = function(element) {
    return element.role === 'option';
}

ARIAOption.getOption = function(element) {
    return element.aria || new ARIAOption(element);
}

ARIAOption.attachToDocument = function() {
    var _this = this;
    document.addEventListener('mouseenter', function(e) {
        if(_this.isOption(e.target)) _this.getOption(e.target).onMouseEnter(e);
    }, true);
}

ARIAOption.attachToDocument();
