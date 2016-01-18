function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

/*ARIAGrid.prototype = new Array();
ARIAGrid.prototype.constructor = ARIAGrid;*/

Object.defineProperty(ARIAGrid.prototype, 'collection', {
    enumerable : true,
    get : function() {
        return Array.prototype.map.call(
            this.element.querySelectorAll('[role=row]'),
            function(element) {
                return ARIARow.getRow(element);
            });
    }
});

Object.defineProperty(ARIAGrid.prototype, 'cells', {
    enumerable : true,
    get : function() {
        return Array.prototype.map.call(
            this.element.querySelectorAll('[role=gridcell]'),
            function(element) {
                return ARIAGridCell.getGridCell(element);
            });
    }
});

Object.defineProperty(ARIAGrid.prototype, 'multiselectable', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-multiselectable') || 'false';
    },
    set : function(value) {
        this.element.setAttribute('aria-multiselectable', String(value));
    }
});

Object.defineProperty(ARIAGrid.prototype, 'selected', {
    enumerable : true,
    get : function() {
        return this.collection.reduce(function(res, row) {
            row.collection.forEach(function(cell) {
                if(cell.selected === 'true') res.push(cell);
            });
            return res;
        }, []);
    }
});

ARIAGrid.prototype.slice = function(first, last) {
    return this
        .collection
        .slice(first.row.index, last.row.index)
        .reduce(function(res, row) {
            return res.concat(row.collection.slice(first.index, last.index));
        }, []);
}

ARIAGrid.prototype.unselect = function() {
    this.collection.forEach(function(row) {
        row.unselect();
    });
}

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

    /*this.forEach.call(
        element.querySelectorAll('[role=gridcell]'),
        function(element) {
            this.push(ARIAGridCell.getGridCell(element));
        }, this);*/

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
}

/*ARIARow.prototype = new Array();
ARIARow.prototype.constructor = ARIARow;*/

ARIARow.role = 'row';

Object.defineProperty(ARIARow.prototype, 'collection', {
    enumerable : true,
    get : function() {
        return Array.prototype.map.call(
            this.element.querySelectorAll('[role=gridcell]'),
            function(element) {
                return ARIAGridCell.getGridCell(element);
            });
    }
});

Object.defineProperty(ARIARow.prototype, 'next', {
    enumerable : true,
    get : function() {
        return this.grid.collection[this.index + 1];
    }
});

Object.defineProperty(ARIARow.prototype, 'prev', {
    enumerable : true,
    get : function() {
        return this.grid.collection[this.index - 1];
    }
});

Object.defineProperty(ARIARow.prototype, 'index', {
    enumerable : true,
    get : function() {
        return this.grid.collection.indexOf(this);
    }
});

ARIARow.prototype.unselect = function() {
    this.collection.forEach(function(cell) {
        cell.selected = false;
    });
}

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

Object.defineProperty(ARIAGridCell.prototype, 'selected', {
    enumerable : true,
    get : function() {
        return this.element.getAttribute('aria-selected') || '';
    },
    set : function(value) {
        this.element.setAttribute('aria-selected', String(value));
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'leftSibling', {
    enumerable : true,
    get : function() {
        var cell = this.row.collection[this.index - 1];
        return cell? cell.span || cell : null;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'rightSibling', {
    enumerable : true,
    get : function() {
        return this.row.collection[this.index + this.element.colSpan] || null;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'topSibling', {
    enumerable : true,
    get : function() {
        var cell = this.column[this.row.index - 1];
        return cell? cell.span || cell : null;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'bottomSibling', {
    enumerable : true,
    get : function() {
        return this.column[this.row.index + this.element.rowSpan] || null;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'index', {
    enumerable : true,
    get : function() {
        /*var cells = this.row.collection,
            i = 0,
            index = -1,
            cell;
        do index += cell.element.colSpan;
        while(cell = cells[i++] && cell !== this);
        return index;*/
        /*return this.row.collection.reduce(function(res, cell) {
            res += cell.element.colSpan;
            return res;
        }, -1);*/
        return this.row.collection.indexOf(this);
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'column', {
    enumerable : true,
    get : function() {
        return this.grid.cells.filter(function(cell) {
            return cell.index === this.index;
        }, this);
    }
});

ARIAGridCell.prototype.createInput = function() {
    var input = document.createElement('input');
    input.setAttribute('role', 'presentation');
    input.addEventListener('blur', this.onInputBlur.bind(this));
    return input;
}

ARIAGridCell.prototype.onInputBlur = function(event) {
    this.mode = 'navigation';
}

ARIAGridCell.prototype.setActionableMode = function(event) {
    this.input.value = this.text.textContent;
    this.box.replaceChild(this.input, this.text);
    this.input.focus();
    this.element.classList.add('focus');
}

ARIAGridCell.prototype.setNavigationMode = function(event) {
    this.text.textContent = this.input.value;
    this.box.replaceChild(this.text, this.input);
    this.element.classList.remove('focus');
}

ARIAGridCell.prototype.focus = function() {
    this.element.hidden && this.span?
        this.span.element.focus() :
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
        var selected = this.grid.selected,
            length = selected.length;
        if(length) {
            var first = selected[0],
                last = selected[selected.length - 1];
            /*this.grid.slice(first, last).forEach(function(cell) {
                cell.selected = 'false';
                cell.span = first;
                if(cell !== first) cell.element.hidden = true;
            });*/
            selected.forEach(function(cell, i) {
                cell.selected = 'false';
                cell.span = first;
                if(cell !== first) cell.element.hidden = true;
            });
            first.element.colSpan = last.index - first.index + 1;
            first.element.rowSpan = last.row.index - first.row.index + 1;
            first.mode = 'actionable';
        } else {
            this.mode = 'actionable';
        }
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

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var cell;
    switch(event.keyCode) {
        case 37: cell = this.leftSibling; break;
        case 38: cell = this.topSibling; break;
        case 39: cell = this.rightSibling; break;
        case 40: cell = this.bottomSibling; break;
    }
    if(cell) {
        var grid = this.grid;
        if(grid.multiselectable === 'true') {
            if(event.shiftKey) this.selected = cell.selected = true;
            else if(grid.selected.length) grid.unselect();
        }
        cell.focus();
    }
}

/*ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var keyCode = event.keyCode,
        direction = keyCode < 39? 'prev' : 'next',
        cell;
    if(keyCode % 2) {
        cell = this[direction];
    } else {
        var row = this.row[direction];
        cell = row && row.collection[this.index];
    }
    if(cell) {
        if(this.grid.multiselectable === 'true') {
            if(event.shiftKey) this.selected = cell.selected = true;
            else this.grid.unselect();
        }
        cell.focus();
    }
}*/

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
