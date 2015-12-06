function ARIAComboBox(element) {
    element.aria = this;
    this.element = element;

    var listBoxElement = element.querySelector('[role=listbox]');
    this.listBox = ARIAListBox.getListBox(listBoxElement);
    listBoxElement.addEventListener('change', this.onListBoxChange.bind(this));
    //element.parentNode.insertBefore(listBoxElement, element.nextSibling);
}

ARIAComboBox.prototype.onListBoxChange = function(e) {
    var element = this.element,
        listBox = e.target.aria,
        text = listBox.checked[0].element.textContent;
    element.replaceChild(document.createTextNode(text), element.firstChild);
    setTimeout(function() {
        listBox.hidden = 'true';
    }, 0);
}

ARIAComboBox.prototype.onClick = function(e) {
    var listBox = this.listBox;
    listBox.hidden = listBox.hidden === 'false';
}

ARIAComboBox.isComboBox = function(element) {
    return element.role === 'combobox';
}

ARIAComboBox.getComboBox = function(element) {
    return element.aria || new ARIAComboBox(element);
}

ARIAComboBox.attachToDocument = function() {
    var _this = this;
    document.addEventListener('click', function(e) {
        if(_this.isComboBox(e.target)) _this.getComboBox(e.target).onClick(e);
    }, true);
}

ARIAComboBox.attachToDocument();
