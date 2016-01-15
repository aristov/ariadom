function ARIAGrid(element) {
    element.aria = this;
    this.element = element;

    this.forEach.call(
        element.querySelectorAll('[role=row]'),
        function(element) {
            this.push(ARIARow.getRow(element));
        }, this);
}

ARIAGrid.prototype = new Array();
ARIAGrid.prototype.constructor = ARIAGrid;

ARIAGrid.role = 'grid';

ARIAGrid.getGrid = function(element) {
    return element && element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGrid.attachToDocument = function() {
    ARIAGridCell.attachToDocument();
}

////////////////////////////////////////////////////////////////

function ARIARow(element) {
    element.aria = this;
    this.element = element;

    this.forEach.call(
        element.querySelectorAll('[role=gridcell]'),
        function(element) {
            this.push(ARIAGridCell.getGridCell(element));
        }, this);

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
}

ARIARow.prototype = new Array();
ARIARow.prototype.constructor = ARIARow;

ARIARow.role = 'row';

Object.defineProperty(ARIARow.prototype, 'next', {
    enumerable : true,
    get : function() {
        return this.constructor.getRow(this.element.nextElementSibling);
    }
});

Object.defineProperty(ARIARow.prototype, 'prev', {
    enumerable : true,
    get : function() {
        return this.constructor.getRow(this.element.previousElementSibling);
    }
});

ARIARow.getRow = function(element) {
    return element && element.role === this.role?
        element.aria || new this(element) :
        null;
}

////////////////////////////////////////////////////////////////

function ARIAGridCell(element) {
    element.aria = this;
    this.element = element;

    element.dataset.mode = 'navigation';

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
    this.row = ARIARow.getRow(element.closest('[role=row]'));

    this.box = element.querySelector('.box');
    this.text = element.querySelector('.text');
    this.input = this.createInput();

    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('dblclick', this.onDoubleClick.bind(this));
    this.input.addEventListener('blur', this.onInputBlur.bind(this));
}

Object.defineProperty(ARIAGridCell.prototype, 'mode', {
    enumerable : true,
    get : function() {
        return this.element.dataset.mode;
    },
    set : function(value) {
        if(value !== this.mode) {
            if(value === 'navigation') {
                this.element.dataset.mode = value;
                this.setNavigationMode();
            }
            else if(value === 'actionable' && this.readonly === 'false') {
                this.element.dataset.mode = value;
                this.setActionableMode();
            }
        }
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'readonly', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-readonly') || 'false';
    },
    set : function(value) {
        this.element.setAttribute('aria-readonly', String(value));
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'next', {
    enumerable : true,
    get : function() {
        return this.constructor.getGridCell(this.element.nextElementSibling);
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'prev', {
    enumerable : true,
    get : function() {
        return this.constructor.getGridCell(this.element.previousElementSibling);
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'index', {
    enumerable : true,
    get : function() {
        return this.row.indexOf(this);
    }
});

ARIAGridCell.prototype.createInput = function() {
    var input = document.createElement('input');
    input.classList.add('box');
    input.setAttribute('role', 'presentation');
    return input;
}

ARIAGridCell.prototype.setActionableMode = function(event) {
    this.input.value = this.text.textContent;
    this.element.replaceChild(this.input, this.box);
    this.input.focus();
}

ARIAGridCell.prototype.setNavigationMode = function(event) {
    this.text.textContent = this.input.value;
    this.element.replaceChild(this.box, this.input);
}

ARIAGridCell.prototype.focus = function() {
    this.element.focus();
}

ARIAGridCell.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;

    if(keyCode === 13) this.onEnterKeyDown(event);
    if(keyCode === 27) this.onEscapeKeyDown(event);
    if(keyCode >= 37 && keyCode <= 40) {
        if(this.mode === 'navigation') {
            event.preventDefault(); // prevent page scrolling
            this.onArrowKeyDown(event);
        }
    }
}

ARIAGridCell.prototype.onEnterKeyDown = function(event) {
    if(this.mode === 'navigation') {
        this.mode = 'actionable';
    } else {
        this.mode = 'navigation';
        this.element.focus();
    }
}

ARIAGridCell.prototype.onEscapeKeyDown = function(event) {
    this.mode = 'navigation';
    this.element.focus();
}

ARIAGridCell.prototype.onDoubleClick = function(event) {
    this.mode = 'actionable';
}

ARIAGridCell.prototype.onInputBlur = function(event) {
    this.mode = 'navigation';
}

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var keyCode = event.keyCode,
        direction = keyCode < 39? 'prev' : 'next',
        cell;
    if(keyCode % 2) {
        cell = this[direction];
    } else {
        var row = this.row[direction];
        cell = row && row[this.index];
    }
    if(cell) cell.focus();
}

ARIAGridCell.role = 'gridcell';

ARIAGridCell.getGridCell = function(element) {
    return element && element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGridCell.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getGridCell(event.target);
    }.bind(this), true);
}
