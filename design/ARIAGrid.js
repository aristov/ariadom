function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

ARIAGrid.attachToDocument = function() {
    ARIAGridCell.attachToDocument();
}

function ARIAGridCell(element) {
    element.aria = this;
    this.element = element;

    this.box = element.firstElementChild;
    this.input = document.createElement('input');

    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

ARIAGridCell.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;
    console.log(keyCode);

    if(keyCode === 13) {
        this.onEnterKeyDown(event);
    }
    if(keyCode === 27) {
        this.onEscapeKeyDown(event);
    }
    if(keyCode >= 37 && keyCode <= 40) {
        event.preventDefault(); // prevent page scrolling
        this.onArrowKeyDown(event);
    }
}

ARIAGridCell.prototype.onEnterKeyDown = function(event) {
    this.box.appendChild(this.input);
    this.input.focus();
}

ARIAGridCell.prototype.onEscapeKeyDown = function(event) {
    this.box.removeChild(this.input);
    this.element.focus();
}

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var currentCell = this.element,
        currentRow = currentCell.parentElement,
        currentIndex = Array.from(currentRow.children).indexOf(currentCell),
        newRow,
        newCell;
    if(event.keyCode === 37) newCell = currentCell.previousElementSibling;
    if(event.keyCode === 39) newCell = currentCell.nextElementSibling;
    if(event.keyCode === 38) {
        newRow = currentRow.previousElementSibling;
        if(newRow) newCell = newRow.children[currentIndex];
    }
    if(event.keyCode === 40) {
        newRow = currentRow.nextElementSibling;
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
