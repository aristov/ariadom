<h1>ARIADOM</h1>

<a href="http://www.w3.org/TR/wai-aria-1.1">WAI-ARIA</a> framework implementation in <a href="http://www.w3.org/TR/dom/">DOM</a>.

<em>Work in progress.</em>

<h2>Usage</h2>

```html
<!-- add scripts -->
<script src="ariadom/design/role.js"></script>
<script src="ariadom/design/ARIAButton.js"></script>

<!-- add styles -->
<link rel=stylesheet href="ariadom/style/yandex.css">

<!-- attach widget -->
<script>ARIAButton.attachToDocument();</script>

<!-- write murkup -->
<span role=button tabindex=0 aria-pressed=true class=button>Toggle button</span>
```
And it works!

More examples: look the <a href="style/yandex.html">source code</a> of the <a rel=external href=//yandex.com>Yandex</a> style <a href="http://aristov.github.io/ariadom/style/yandex.html">example page</a>.
