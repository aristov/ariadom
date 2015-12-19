/*Object.defineProperty(Element.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});*/

function ARIAListBox(element) {
    element.aria = this;
    this.element = element;

    this.forEach.call(
        this.element.querySelectorAll('[role=option]'),
        function(element, i) {
            this.push(ARIAOption.getOption(element));
        }, this);

    this.input = element.querySelector('input') || document.createElement('input');

    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

ARIAListBox.prototype = new Array();

Object.defineProperty(ARIAListBox.prototype, 'hidden', {
    enumerable : true,
    get : function() {
        return String(this.element.hidden);
    },
    set : function(value) {
        value = String(value);
        this.element.hidden = value === 'true';
    }
});

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
    },
    set : function(options) {
        var value = this.value;
        this.uncheck();
        options.forEach(function(option) {
            option.checked = 'true';
        });
        this.value === value || this.element.dispatchEvent(new Event('change'));
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

Object.defineProperty(ARIAListBox.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        var element = this.element;

        if(String(value) === 'true') {
            element.setAttribute('aria-disabled', 'true');
            element.removeAttribute('tabindex');
            this.input.disabled = true;
        } else {
            element.removeAttribute('aria-disabled');
            element.setAttribute('tabindex', '0');
            this.input.disabled = false;
        }
    }
});

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

    if(keyCode === 13 || keyCode === 32) {
        e.preventDefault(); // prevent page scrolling
        this.handleKeyboardCheck();
    }
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
    this.checked = this.selected;
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

    element.addEventListener('mousedown', this.onMouseDown.bind(this));
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

Object.defineProperty(ARIAOption.prototype, 'disabled', {
    enumerable : true,
    get : function() {
        return this.listBox.disabled || this.element.getAttribute('aria-disabled') || '';
    },
    set : function(value) {
        value = String(value);
        this.element.setAttribute('aria-disabled', value);
    }
});

Object.defineProperty(ARIAOption.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.element.dataset.value;
    }
});

ARIAOption.prototype.onMouseDown = function(e) {
    if(this.disabled !== 'true') this.listBox.checked = [this];
}

ARIAOption.prototype.onMouseEnter = function(e) {
    if(this.disabled !== 'true') {
        this.listBox.unselect();
        this.selected = 'true';
    }
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
