function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

Object.defineProperty(ARIAGrid.prototype, 'rows', {
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
        return this.cells.filter(function(cell) {
            return cell.selected === 'true';
        });
    }
});

ARIAGrid.prototype.unselect = function() {
    this.selected.forEach(function(cell) {
        cell.selected = 'false';
    });
}

ARIAGrid.prototype.merge = function(cells) {
    var first = cells[0],
        last = cells[cells.length - 1];
    first.spanned = [];
    cells.forEach(function(cell, i) {
        cell.selected = 'false';
        if(cell !== first) {
            first.spanned.push(cell);
            cell.span = first;
            cell.hidden = 'true';
        }
    });
    first.element.colSpan = last.index - first.index + 1;
    first.element.rowSpan = last.row.index - first.row.index + 1;
    first.mode = 'actionable';
}

ARIAGrid.prototype.slice = function(first, last) {
    return this
        .rows
        .slice(first.row.index, last.row.index + 1)
        .reduce(function(res, row) {
            return res.concat(row.cells.slice(first.index, last.index + 1));
        }, []);
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

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
}

ARIARow.role = 'row';

Object.defineProperty(ARIARow.prototype, 'cells', {
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
        return this.grid.rows[this.index + 1];
    }
});

Object.defineProperty(ARIARow.prototype, 'prev', {
    enumerable : true,
    get : function() {
        return this.grid.rows[this.index - 1];
    }
});

Object.defineProperty(ARIARow.prototype, 'index', {
    enumerable : true,
    get : function() {
        return this.grid.rows.indexOf(this);
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

    this.spanned = this.getSpanned();

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

Object.defineProperty(ARIAGridCell.prototype, 'hidden', {
    enumerable : true,
    get : function() {
        return String(this.element.hidden) || 'false';
    },
    set : function(value) {
        this.element.hidden = String(value) === 'true';
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
        var cell = this.row.cells[this.index - 1];
        return cell? cell.span || cell : null;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'rightSibling', {
    enumerable : true,
    get : function() {
        return this.row.cells[this.index + this.element.colSpan] || null;
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
        return this.row.cells.indexOf(this);
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

ARIAGridCell.prototype.span = null;

ARIAGridCell.prototype.getSpanned = function() {
    var rowSpan = this.element.rowSpan,
        colSpan = this.element.colSpan,
        spanned;
    if(rowSpan > 1 || colSpan > 1) {
        var grid = this.grid,
            cells = grid.cells,
            index = this.index,
            rowIndex = this.row.index;
        spanned = cells.filter(function(cell) {
            if(cell.index >= index &&
                cell.index < index + colSpan &&
                cell.row.index >= rowIndex &&
                cell.row.index < rowIndex + rowSpan) {
                    if(cell !== this) cell.span = this;
                    return true;
                } else return false;
        }, this);
    }
    return spanned || [];
}

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
    this.span? this.span.focus() : this.element.focus();
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
        var grid = this.grid,
            selected = grid.selected;
        if(event.ctrlKey) {
            selected.length? grid.merge(selected) : this.unmerge();
        } else {
            if(selected.length) grid.unselect();
            this.mode = 'actionable';
        }
    } else {
        this.mode = 'navigation';
        this.element.focus();
    }
}

ARIAGridCell.prototype.unmerge = function() {
    var spanned = this.spanned;
    if(spanned.length) {
        var element = this.element,
            cell;
        while(cell = spanned.pop()) {
            cell.span = null;
            cell.hidden = 'false';
        }
        this.element.rowSpan = 1;
        this.element.colSpan = 1;
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
