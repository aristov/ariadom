Object.defineProperty(Element.prototype, 'role', {
    enumerable : true,
    get : function() {
        return this.getAttribute('role') || '';
    }
});

function ARIALink(element) {
    element.aria = this;
    this.element = element;

    element.addEventListener('keydown', this.onKeyDown.bind(this));
    element.addEventListener('blur', this.onBlur.bind(this));
    element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
}

Object.defineProperty(ARIALink, 'hrefElement', {
    get : function() {
        var hrefElement = document.getElementById('href');
        if(!hrefElement) {
            hrefElement = document.createElement('div');
            hrefElement.id = 'href';
            hrefElement.hidden = true;
            hrefElement.setAttribute('role', 'presentation');
            document.body.appendChild(hrefElement);
        }
        return hrefElement;
    }
});

Object.defineProperty(ARIALink, 'href', {
    set : function(href) {
        var hrefElement = this.hrefElement;
        if(href) {
            hrefElement.textContent = href.replace(/^\w*\:?\/\//, '');
            hrefElement.hidden = false;
        } else {
            hrefElement.textContent = href;
            hrefElement.hidden = true;
        }
    }
});

Object.defineProperty(ARIALink.prototype, 'href', {
    enumerable : true,
    get : function() {
        return this.element.dataset.href || '';
    },
    set : function(value) {
        this.element.dataset.href = value;
    }
});

ARIALink.prototype.activate = function() {
    window.location.href = this.href;
}

ARIALink.prototype.onClick = function(e) {
    this.activate();
}

ARIALink.prototype.onFocus = function(e) {
    this.constructor.href = this.href;
}

ARIALink.prototype.onBlur = function(e) {
    this.constructor.href = '';
}

ARIALink.prototype.onMouseEnter = function(e) {
    this.constructor.href = this.href;
}

ARIALink.prototype.onMouseLeave = function(e) {
    this.constructor.href = '';
}

ARIALink.prototype.onKeyDown = function(e) {
    if(e.keyCode === 13) this.activate();
}

ARIALink.isLink = function(element) {
    return Boolean(element.aria) || element.role === 'link';
}

ARIALink.getLink = function(element) {
    return element.aria || new ARIALink(element);
}

ARIALink.attachToDocument = function() {
    var _this = this;

    document.addEventListener('focus', function(e) {
        if(_this.isLink(e.target)) _this.getLink(e.target).onFocus(e);
    }, true);
    document.addEventListener('mouseenter', function(e) {
        if(_this.isLink(e.target)) _this.getLink(e.target).onMouseEnter(e);
    }, true);
    document.addEventListener('click', function(e) {
        if(_this.isLink(e.target)) _this.getLink(e.target).onClick(e);
    }, true);
}

ARIALink.attachToDocument();
