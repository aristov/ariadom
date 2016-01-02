var button = new Template('span', {
    pressed : function(pressed) {
        this.attr('aria-pressed', pressed);
    }
});