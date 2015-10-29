if(!Node.prototype.addEventListener && Node.prototype.attachEvent) {
    Node.prototype.addEventListener = function(eType, cb) {
        this.attachEvent('on' + eType, function(e) {
            e.currentTarget = this;
            e.target = e.srcElement;
            cb.apply(this, arguments);
        })
    };
}