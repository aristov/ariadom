Object.defineProperty(Element.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});
