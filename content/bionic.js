/**
 * Bionic Reading content script - applies or reverts fixation-style formatting.
 * Expects window.__BR_MODE__ to be 'apply' or 'revert' (set by popup before injection).
 */
(function () {
  const BOLD_RATIO = 0.5;
  const MIN_WORD_LENGTH = 2;
  const WRAPPER_ATTR = 'data-focused-reader-original';

  function shouldSkipElement(el) {
    if (!el) return true;
    const tag = el.tagName?.toLowerCase();
    const skipTags = ['script', 'style', 'code', 'pre', 'kbd', 'samp', 'noscript', 'svg', 'canvas', 'input', 'textarea'];
    if (skipTags.includes(tag)) return true;
    if (el.closest?.('script, style, code, pre, kbd, samp, noscript')) return true;
    if (el.closest?.('strong, b')) return true;
    if (el.closest?.('[contenteditable="true"]')) return true;
    return false;
  }

  function getBoldLength(word) {
    if (word.length < MIN_WORD_LENGTH) return 0;
    return Math.ceil(word.length * BOLD_RATIO);
  }

  function processToken(tokenValue) {
    const fragment = document.createDocumentFragment();
    const wordPattern = /[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu;
    let lastIndex = 0;
    let wordMatch = wordPattern.exec(tokenValue);

    if (!wordMatch) {
      fragment.appendChild(document.createTextNode(tokenValue));
      return fragment;
    }

    while (wordMatch) {
      const wordValue = wordMatch[0];
      const matchStart = wordMatch.index;

      if (matchStart > lastIndex) {
        fragment.appendChild(document.createTextNode(tokenValue.slice(lastIndex, matchStart)));
      }

      const boldLength = getBoldLength(wordValue);
      if (boldLength === 0) {
        fragment.appendChild(document.createTextNode(wordValue));
      } else {
        const strong = document.createElement('strong');
        strong.textContent = wordValue.slice(0, boldLength);
        fragment.appendChild(strong);
        if (boldLength < wordValue.length) {
          fragment.appendChild(document.createTextNode(wordValue.slice(boldLength)));
        }
      }

      lastIndex = matchStart + wordValue.length;
      wordMatch = wordPattern.exec(tokenValue);
    }

    if (lastIndex < tokenValue.length) {
      fragment.appendChild(document.createTextNode(tokenValue.slice(lastIndex)));
    }

    return fragment;
  }

  function createBionicFragment(textContent) {
    const fragment = document.createDocumentFragment();
    const tokenPattern = /(\s+|[^\s]+)/g;
    const tokenList = textContent.match(tokenPattern) || [];

    for (const tokenValue of tokenList) {
      if (/^\s+$/.test(tokenValue)) {
        fragment.appendChild(document.createTextNode(tokenValue));
      } else {
        fragment.appendChild(processToken(tokenValue));
      }
    }

    return fragment;
  }

  function collectTextNodes(rootElement) {
    const nodes = [];
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(`[${WRAPPER_ATTR}]`)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function applyBionic() {
    if (!document.body) return;
    const textNodes = collectTextNodes(document.body);
    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue || '';
      if (!text.trim()) return;

      const wrapper = document.createElement('span');
      wrapper.setAttribute(WRAPPER_ATTR, text);
      wrapper.appendChild(createBionicFragment(text));
      textNode.parentNode.replaceChild(wrapper, textNode);
    });
  }

  function revertBionic() {
    const wrappers = document.querySelectorAll(`[${WRAPPER_ATTR}]`);
    wrappers.forEach((wrapper) => {
      const original = wrapper.getAttribute(WRAPPER_ATTR) || '';
      const textNode = document.createTextNode(original);
      wrapper.parentNode.replaceChild(textNode, wrapper);
    });
  }

  const mode = window.__BR_MODE__ || 'apply';
  if (mode === 'revert') {
    revertBionic();
  } else {
    applyBionic();
  }
})();
