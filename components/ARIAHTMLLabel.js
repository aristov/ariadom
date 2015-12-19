document.addEventListener('click', function(event) {
    var element = event.target;
    if(element.classList.contains('label')) {
        var widget = element.querySelector('[tabindex="0"]');
        if(widget) {
            widget.focus();
            widget.dispatchEvent(new Event('click'));
        }
    }
}, true);
