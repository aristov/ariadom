function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

ARIAGrid.role = 'grid';

ARIAGrid.getGrid = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGrid.attachToDocument = function() {
    ARIAGridCell.attachToDocument();
}

////////////////////////////////////////////////////////////////

function ARIAGridCell(element) {
    element.aria = this;
    this.element = element;

    element.dataset.mode = 'navigation';

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
    this.box = element.querySelector('.box');
    this.value = element.querySelector('.value');
    this.input = document.createElement('input');
    this.input.classList.add('box');
    this.input.setAttribute('role', 'presentation');
    this.input.addEventListener('blur', this.onInputBlur.bind(this));

    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

Object.defineProperty(ARIAGridCell.prototype, 'mode', {
    enumerable : true,
    get : function() {
        return this.element.dataset.mode;
    },
    set : function(value) {
        if(value !== this.mode) {
            this.element.dataset.mode = value;
            if(value === 'navigation') this.setNavigationMode();
            else if(value === 'actionable') this.setActionableMode();
        }
    }
});

ARIAGridCell.prototype.setActionableMode = function(event) {
    this.element.replaceChild(this.input, this.box);
    this.input.focus();
}

ARIAGridCell.prototype.setNavigationMode = function(event) {
    this.value.textContent = this.input.value;
    this.element.replaceChild(this.box, this.input);
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

ARIAGridCell.prototype.onInputBlur = function(event) {
    this.mode = 'navigation';
}

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var cell = this.element,
        row = cell.parentElement,
        currentIndex = Array.from(row.children).indexOf(cell),
        newCell,
        newRow;
    if(event.keyCode === 37) newCell = cell.previousElementSibling;
    if(event.keyCode === 39) newCell = cell.nextElementSibling;
    if(event.keyCode === 38) {
        newRow = row.previousElementSibling;
        if(newRow) newCell = newRow.children[currentIndex];
    }
    if(event.keyCode === 40) {
        newRow = row.nextElementSibling;
        if(newRow) newCell = newRow.children[currentIndex];
    }
    if(newCell) newCell.focus();
}

ARIAGridCell.role = 'gridcell';

ARIAGridCell.getGridCell = function(element) {
    return element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGridCell.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        this.getGridCell(event.target);
    }.bind(this), true);
}
