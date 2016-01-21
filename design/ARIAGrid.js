function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

ARIAGrid.role = 'grid';

ARIAGrid.prototype.selection = null;

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

Object.defineProperty(ARIAGrid.prototype, 'active', {
    enumerable : true,
    get : function() {
        var element = this.element.querySelector('[role=gridcell][tabindex="0"]');
        return ARIAGridCell.getGridCell(element);
    },
    set : function(cell) {
        this.active.active = false;
        cell.active = true;
    }
});

ARIAGrid.prototype.unselect = function() {
    this.cells.forEach(function(cell) {
        cell.selected = 'false';
    });
    this.selection = null;
}

ARIAGrid.prototype.merge = function(cells) {
    var first = cells[0],
        last = cells[cells.length - 1];
    first.merged = [];
    cells.forEach(function(cell, i) {
        cell.selected = 'false';
        if(cell !== first) {
            first.merged.push(cell);
            cell.span = first;
            cell.value = '';
            cell.hidden = 'true';
        }
    });
    first.element.colSpan = last.index - first.index + 1;
    first.element.rowSpan = last.row.index - first.row.index + 1;
    first.mode = 'edit';
}

ARIAGrid.prototype.selectAll = function() {
    var rows = this.rows,
        firstRowCells = rows[0].cells,
        lastRowCells = rows[rows.length - 1].cells,
        topLeftCell = firstRowCells[0],
        topRightCell = firstRowCells[firstRowCells.length - 1],
        bottomLeftCell = lastRowCells[0],
        bottomRightCell = lastRowCells[lastRowCells.length - 1],
        active = this.active,
        selection;
    this.cells.forEach(function(cell) { cell.selected = 'true' });
    switch(active) {
        case topLeftCell : selection = bottomRightCell; break;
        case topRightCell : selection = bottomLeftCell; break;
        case bottomLeftCell : selection = topRightCell; break;
        case bottomRightCell : selection = topLeftCell; break;
        default : selection = active;
    }
    this.selection = selection;
}

ARIAGrid.prototype.updateSelection = function(target) {
    var active = this.active;
    this.unselect();
    if(active && target !== active) {
        var rowStart = Math.min(active.row.index, target.row.index),
            rowEnd = Math.max(active.row.index, target.row.index),
            colStart = Math.min(active.index, target.index),
            colEnd = Math.max(active.index, target.index),
            rows = this.rows,
            merged = false,
            cells, cell, i, j;
        for(i = rowStart; i <= rowEnd; i++) {
            cells = rows[i].cells;
            for(j = colStart; j <= colEnd; j++) {
                cell = cells[j];
                if(cell.span || cell.merged.length) {
                    merged = true;
                    break;
                } else cell.selected = 'true';
            }
            if(merged) break;
        }
        if(merged) this.selectAll();
        else this.selection = target;
    }
}

ARIAGrid.getGrid = function(element) {
    return element && element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGrid.attachToDocument = function() {
    ARIAGridCell.attachToDocument();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////

function ARIAGridCell(element) {
    element.aria = this;
    this.element = element;

    element.dataset.mode = 'navigation';

    this.grid = ARIAGrid.getGrid(element.closest('[role=grid]'));
    this.row = ARIARow.getRow(element.closest('[role=row]'));
    this.text = element.querySelector('.text');
    this.input = this.getInput();
    this.merged = this.getMerged();

    element.addEventListener('blur', this.onBlur.bind(this));
    element.addEventListener('click', this.onClick.bind(this));
    element.addEventListener('dblclick', this.onDoubleClick.bind(this));
    element.addEventListener('keydown', this.onKeyDown.bind(this));
}

ARIAGridCell.role = 'gridcell';

ARIAGridCell.prototype.span = null;

Object.defineProperty(ARIAGridCell.prototype, 'mode', {
    enumerable : true,
    get : function() {
        return this.element.dataset.mode;
    },
    set : function(mode) {
        if(mode !== this.mode && this.readonly !== 'true') {
            var element = this.element,
                input = this.input,
                text = this.text;
            if(mode === 'edit') {
                text.hidden = true;
                input.hidden = false;
                input.focus();
                element.classList.add('focus');
            } else {
                text.textContent = input.value;
                input.hidden = true;
                text.hidden = false;
                element.classList.remove('focus');
            }
            element.dataset.mode = mode;
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

Object.defineProperty(ARIAGridCell.prototype, 'value', {
    enumerable : true,
    get : function() {
        return this.input.value;
    },
    set : function(value) {
        this.input.value = this.text.textContent = value;
    }
});

Object.defineProperty(ARIAGridCell.prototype, 'active', {
    enumerable : true,
    get : function() {
        return this.element.tabIndex === 0;
    },
    set : function(active) {
        this.element.tabIndex = active? 0 : -1;
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

ARIAGridCell.prototype.getMerged = function() {
    var rowSpan = this.element.rowSpan,
        colSpan = this.element.colSpan,
        merged = [];
    if(rowSpan > 1 || colSpan > 1) {
        var grid = this.grid,
            rows = grid.rows,
            index = this.index,
            rowIndex = this.row.index,
            cells, cell, i, j;
        for(i = rowIndex; i < rowIndex + rowSpan; i++) {
            cells = rows[i].cells;
            for(j = index; j < index + colSpan; j++) {
                cell = cells[j];
                if(cell !== this) {
                    cell.span = this;
                    merged.push(cell);
                }
            }
        }
    }
    return merged;
}

ARIAGridCell.prototype.getInput = function() {
    var element = this.element,
        input = element.querySelector('input');
    if(!input) {
        input = document.createElement('input');
        input.setAttribute('role', 'presentation');
        input.hidden = true;
        element.appendChild(input);
    }
    input.addEventListener('blur', this.onInputBlur.bind(this));
    return input;
}

ARIAGridCell.prototype.onInputBlur = function(event) {
    this.mode = 'navigation';
}

ARIAGridCell.prototype.focus = function() {
    this.span? this.span.focus() : this.element.focus();
}

ARIAGridCell.prototype.onClick = function(event) {
    if(this.mode === 'navigation') {
        var grid = this.grid;
        if(grid.selected.length) grid.unselect();
    }
}

ARIAGridCell.prototype.onFocus = function(event) {
    this.grid.active = this;
}

ARIAGridCell.prototype.onBlur = function(event) {
    this.grid.unselect();
}

ARIAGridCell.prototype.onMouseEnter = function(event) {
    var grid = this.grid;
    if(event.buttons === 1 && grid.multiselectable === 'true') {
        grid.updateSelection(this);
    }
}

ARIAGridCell.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;
    if(keyCode === 13) this.onEnterKeyDown(event);
    else if(keyCode === 27) this.onEscapeKeyDown(event);
    else if(keyCode >= 37 && keyCode <= 40) {
        if(this.mode === 'navigation') {
            event.preventDefault(); // prevent page scrolling
            this.onArrowKeyDown(event);
        }
    }
    else if(keyCode === 8) this.onBackspaceKeyDown(event);
    else if(keyCode === 65 && (event.metaKey || event.ctrlKey)) {
        if(this.mode === 'navigation') {
            event.preventDefault();
            this.grid.selectAll();
        }
    }
    else if((keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 65 && keyCode <= 90) &&
        !event.metaKey && !event.ctrlKey) {
            this.onCharacterKeyDown(event);
    }
}

ARIAGridCell.prototype.onCharacterKeyDown = function(event) {
    this.mode = 'edit';
}

ARIAGridCell.prototype.onBackspaceKeyDown = function(event) {
    if(this.mode === 'navigation') {
        var selected = this.grid.selected;
        event.preventDefault(); // prevent browser navigation
        if(selected.length) {
            selected.forEach(function(cell) {
                cell.value = '';
            });
        } else this.value = '';
    }
}

ARIAGridCell.prototype.onEnterKeyDown = function(event) {
    if(this.mode === 'navigation') {
        var grid = this.grid,
            selected = grid.selected;
        if(event.ctrlKey) {
            if(selected.length) {
                var merged = selected.filter(function(cell) {
                    return Boolean(cell.merged.length);
                });
                grid.unselect();
                if(merged.length) {
                    merged.forEach(function(cell) {
                        cell.unmerge();
                    });
                } else grid.merge(selected);
            } else this.unmerge();
        } else {
            if(selected.length) grid.unselect();
            this.mode = 'edit';
        }
    } else {
        this.mode = 'navigation';
        this.element.focus();
    }
}

ARIAGridCell.prototype.unmerge = function() {
    var merged = this.merged;
    if(merged.length) {
        var element = this.element,
            cell;
        while(cell = merged.pop()) {
            cell.span = null;
            cell.hidden = 'false';
        }
        this.element.rowSpan = 1;
        this.element.colSpan = 1;
    }
}

ARIAGridCell.prototype.onEscapeKeyDown = function(event) {
    if(this.mode === 'edit') {
        this.mode = 'navigation';
        this.element.focus();
    } else {
        var grid = this.grid;
        if(grid.selected.length) grid.unselect();
    }
}

ARIAGridCell.prototype.onDoubleClick = function(event) {
    this.mode = 'edit';
}

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var grid = this.grid,
        current = event.shiftKey? grid.selection || this : this,
        target;
    switch(event.keyCode) {
        case 37: target = current.leftSibling; break;
        case 38: target = current.topSibling; break;
        case 39: target = current.rightSibling; break;
        case 40: target = current.bottomSibling; break;
    }
    if(target) {
        if(grid.multiselectable === 'true') {
            if(event.shiftKey) grid.updateSelection(target);
            else {
                if(grid.selected.length) grid.unselect();
                target.focus();
            }
        } else target.focus();
    }
}

ARIAGridCell.getGridCell = function(element) {
    return element && element.role === this.role?
        element.aria || new this(element) :
        null;
}

ARIAGridCell.attachToDocument = function() {
    document.addEventListener('focus', function(event) {
        var gridCell = this.getGridCell(event.target);
        if(gridCell) gridCell.onFocus(event);
    }.bind(this), true);
    document.addEventListener('mouseenter', function(event) {
        var gridCell = this.getGridCell(event.target);
        if(gridCell) gridCell.onMouseEnter(event);
    }.bind(this), true);
}
