var ARIAButtonElement = HTMLButtonElement;

Object.defineProperty(ARIAButtonElement.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});

Object.defineProperty(ARIAButtonElement.prototype, 'ariaPressed', {
    enumerable : true,
    get : function() {
        return this.getAttribute('aria-pressed') || '';
    },
    set : function(value) {
        this.setAttribute('aria-pressed', String(value));
    }
});

document.addEventListener('click', function(e) {
    var target = e.target;
    if(target.tagName === 'BUTTON') {

    }
}, true);
