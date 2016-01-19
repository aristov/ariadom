function ARIAGrid(element) {
    element.aria = this;
    this.element = element;
}

ARIAGrid.prototype.active = null;
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

ARIAGrid.prototype.unselect = function() {
    this.selected.forEach(function(cell) {
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

    this.merged = this.getMerged();

    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('dblclick', this.onDoubleClick.bind(this));
    element.addEventListener('blur', this.onBlur.bind(this));
}

ARIAGridCell.prototype.span = null;

Object.defineProperty(ARIAGridCell.prototype, 'mode', {
    enumerable : true,
    get : function() {
        return this.element.dataset.mode;
    },
    set : function(mode) {
        if(mode !== this.mode && this.readonly === 'false') {
            var element = this.element;
            if(mode === 'navigation') {
                this.text.textContent = this.input.value;
                this.box.replaceChild(this.text, this.input);
                element.classList.remove('focus');
                element.dataset.mode = mode;
            }
            else if(mode === 'actionable') {
                var input = this.input;
                input.value = this.text.textContent;
                this.box.replaceChild(this.input, this.text);
                input.focus();
                element.classList.add('focus');
                element.dataset.mode = mode;
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

ARIAGridCell.prototype.createInput = function() {
    var input = document.createElement('input');
    input.setAttribute('role', 'presentation');
    input.addEventListener('blur', this.onInputBlur.bind(this));
    return input;
}

ARIAGridCell.prototype.onInputBlur = function(event) {
    this.mode = 'navigation';
}

ARIAGridCell.prototype.focus = function() {
    this.span? this.span.focus() : this.element.focus();
}

ARIAGridCell.prototype.onFocus = function(event) {
    this.grid.active = this;
}

ARIAGridCell.prototype.onBlur = function(event) {
    this.grid.active = null;
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
}

ARIAGridCell.prototype.onBackspaceKeyDown = function(event) {
    if(this.mode === 'navigation') {
        event.preventDefault(); // prevent browser navigation
        this.text.textContent = '';
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
                    merged.forEach((cell) => cell.unmerge());
                } else grid.merge(selected);
            } else this.unmerge();
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
    this.mode = 'navigation';
    this.element.focus();
}

ARIAGridCell.prototype.onDoubleClick = function(event) {
    this.mode = 'actionable';
}

ARIAGridCell.prototype.onArrowKeyDown = function(event) {
    var grid = this.grid;
    if(grid.multiselectable === 'true') {
        if(event.shiftKey) this.updateSelection(event);
        else {
            if(grid.selected.length) grid.unselect();
            this.moveFocus(event);
        }
    } else this.moveFocus(event);
}

ARIAGridCell.prototype.updateSelection = function(event) {
    var grid = this.grid,
        selection = grid.selection || this,
        target;
    switch(event.keyCode) {
        case 37: target = selection.leftSibling; break;
        case 38: target = selection.topSibling; break;
        case 39: target = selection.rightSibling; break;
        case 40: target = selection.bottomSibling; break;
    }
    if(target) {
        grid.unselect();
        if(target !== this) {
            var active = grid.active,
                activeIndex = active.index,
                activeRowIndex = active.row.index,
                selectionIndex = target.index,
                selectionRowIndex = target.row.index,
                merged = false;
            grid.rows
                .slice(
                    Math.min(activeRowIndex, selectionRowIndex),
                    Math.max(activeRowIndex, selectionRowIndex) + 1)
                .forEach(function(row) {
                    row.cells.slice(
                        Math.min(activeIndex, selectionIndex),
                        Math.max(activeIndex, selectionIndex) + 1)
                            .forEach(function(cell) {
                                if(cell.span || cell.merged.length) {
                                    merged = true;
                                }
                                cell.selected = 'true';
                            });
                });
            if(merged) {
                var cells = grid.cells;
                cells.forEach(function(cell) {
                    cell.selected = 'true';
                });
                grid.selection = cells[cells.length - 1];
            } else grid.selection = target;
        }
    }
}

ARIAGridCell.prototype.moveFocus = function(event) {
    var cell;
    switch(event.keyCode) {
        case 37: cell = this.leftSibling; break;
        case 38: cell = this.topSibling; break;
        case 39: cell = this.rightSibling; break;
        case 40: cell = this.bottomSibling; break;
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
        var gridCell = this.getGridCell(event.target);
        if(gridCell) gridCell.onFocus(event);
    }.bind(this), true);
}
