var treeWalker = document.createNodeIterator(
        document.documentElement,
        NodeFilter.SHOW_TEXT,
        { acceptNode: function(node) {
            if(node.parentNode.tagName === 'STYLE') return NodeFilter.FILTER_SKIP;
            if(/^\s*$/.test(node.data)) return NodeFilter.FILTER_SKIP;
            return NodeFilter.FILTER_ACCEPT;
        }}),
    currentNode;

while(currentNode = treeWalker.nextNode()) currentNode.textContent = 'Поле ввода';


