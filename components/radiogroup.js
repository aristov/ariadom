(function() {
    var indexOf = Array.prototype.indexOf;

    function switchRadio(target) {
        var current = getRadioGroup(target).querySelector('button[aria-checked=true]');
        if(current){
            current.removeAttribute('aria-checked');
            current.setAttribute('tabindex', '-1');
        }
        target.setAttribute('aria-checked', 'true');
        target.removeAttribute('tabindex');

        updateValue(target);
    }

    function updateValue(current) {
        var input = getRadioGroup(current).querySelector('input[type=hidden]');
        input && (input.value = current.value);
    }

    function getNextButton(element) {
        var buttons = getRadioGroup(element).querySelectorAll('button[role=radio]'),
            index = indexOf.call(buttons, element) + 1;
        return index >= buttons.length? buttons[0] : buttons[index];
    }

    function getPreviousButton(element) {
        var buttons = getRadioGroup(element).querySelectorAll('button[role=radio]'),
            index = indexOf.call(buttons, element) - 1;
        return index < 0? buttons[buttons.length - 1] : buttons[index];
    }

    function getRadioGroup(element) {
        do element = element.parentElement;
        while(element.getAttribute('role') !== 'radiogroup');
        return element;
    }

    document.addEventListener('click', function(e) {
        var target = e.target;
        if(target.getAttribute('role') === 'radio') {
            if(target.getAttribute('aria-checked') !== 'true') {
                switchRadio(target);
            }
            target.focus();
        }
    });

    document.addEventListener('keydown', function(e) {
        var current = e.target;
        if(e.keyCode >= 37 && e.keyCode <=40 && current.getAttribute('role') === 'radio') {
            var target = e.keyCode >= 39? getNextButton(current) : getPreviousButton(current);
            e.ctrlKey || switchRadio(target);
            target.focus();
        }
    });
})();
