function ARIAListBox(element) {
    element.aria = this;
    this.element = element;

    this.forEach.call(
        element.querySelectorAll('[role=option]'),
        function(element) {
            this.push(ARIAOption.getOption(element));
        }, this);

    this.input = element.querySelector('input') || document.createElement('input');

    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('keyup', this.onKeyUp.bind(this));
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

ARIAListBox.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;

    if(keyCode >= 37 && keyCode <= 40) {
        event.preventDefault(); // prevent page scrolling
        this.onArrowKeyDown(event);
    }

    if(keyCode === 32) {
        event.preventDefault(); // prevent page scrolling
        this.onSpaceKeyDown(event);
    }
}

ARIAListBox.prototype.onArrowKeyDown = function(event) {
    var direction = event.keyCode < 39? -1 : 1,
        selected = this.selected[0],
        next = this.indexOf(selected) + direction;

    if(next === this.length) next = 0;
    if(next < 0) next = this.length - 1;

    this.unselect();
    this[next].selected = true;
}

ARIAListBox.prototype.onSpaceKeyDown = function(event) {
    if(!event.repeat) {
        this.selected.forEach(function(option) {
            option.element.classList.add('active');
        });
    }
}

ARIAListBox.prototype.onKeyUp = function(event) {
    if(event.keyCode === 32) {
        this.checked = this.selected;
        this.selected.forEach(function(option) {
            option.element.classList.remove('active');
        });
    }
}

ARIAListBox.prototype.onFocus = function(event) {
    if(!this.selected.length) this[0].selected = 'true';
}

ARIAListBox.role = 'listbox';

ARIAListBox.getListBox = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAListBox.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        var listBox = this.getListBox(event.target);
        if(listBox) listBox.onFocus(event);
    }.bind(this), true);

    ARIAOption.attachToDocument();
}

////////////////////////////////////////////////////////////////

function ARIAOption(element) {
    element.aria = this;
    this.element = element;

    this.listBox = ARIAListBox.getListBox(element.closest('[role=listbox]'));

    element.addEventListener('click', this.onClick.bind(this));
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

ARIAOption.prototype.onClick = function(event) {
    if(this.disabled === 'true') event.stopImmediatePropagation();
    else this.listBox.checked = [this];
}

ARIAOption.prototype.onMouseEnter = function(event) {
    if(this.disabled !== 'true') {
        this.listBox.unselect();
        this.selected = 'true';
    }
}

ARIAOption.role = 'option';

ARIAOption.getOption = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAOption.attachToDocument = function() {
    document.addEventListener('mouseenter', function(event) {
        var option = this.getOption(event.target);
        if(option) option.onMouseEnter(event);
    }.bind(this), true);
}
