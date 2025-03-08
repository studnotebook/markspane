'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Underline = exports.Highlight = exports.Mark = exports.Pane = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _svg = require('./svg');

var _svg2 = _interopRequireDefault(_svg);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pane = exports.Pane = function () {
    function Pane(target) {
        var container = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;

        _classCallCheck(this, Pane);

        this.target = target;
        this.element = _svg2.default.createElement('svg');
        this.marks = [];

        // Match the coordinates of the target element
        this.element.style.position = 'absolute';
        // Disable pointer events
        this.element.setAttribute('pointer-events', 'none');

        // Set up mouse event proxying between the target element and the marks
        _events2.default.proxyMouse(this.target, this.marks);

        this.container = container;
        this.container.appendChild(this.element);

        this.render();
    }

    _createClass(Pane, [{
        key: 'addMark',
        value: function addMark(mark) {
            var g = _svg2.default.createElement('g');
            this.element.appendChild(g);
            mark.bind(g, this.container);

            this.marks.push(mark);

            mark.render();
            return mark;
        }
    }, {
        key: 'removeMark',
        value: function removeMark(mark) {
            var idx = this.marks.indexOf(mark);
            if (idx === -1) {
                return;
            }
            var el = mark.unbind();
            this.element.removeChild(el);
            this.marks.splice(idx, 1);
        }
    }, {
        key: 'render',
        value: function render() {
            setCoords(this.element, coords(this.target, this.container));
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.marks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var m = _step.value;

                    m.render();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return Pane;
}();

var Mark = exports.Mark = function () {
    function Mark() {
        _classCallCheck(this, Mark);

        this.element = null;
    }

    _createClass(Mark, [{
        key: 'bind',
        value: function bind(element, container) {
            this.element = element;
            this.container = container;
        }
    }, {
        key: 'unbind',
        value: function unbind() {
            var el = this.element;
            this.element = null;
            return el;
        }
    }, {
        key: 'render',
        value: function render() {}
    }, {
        key: 'dispatchEvent',
        value: function dispatchEvent(e) {
            if (!this.element) return;
            this.element.dispatchEvent(e);
        }
    }, {
        key: 'getBoundingClientRect',
        value: function getBoundingClientRect() {
            return this.element.getBoundingClientRect();
        }
    }, {
        key: 'getClientRects',
        value: function getClientRects() {
            var rects = [];
            var el = this.element.firstChild;
            while (el) {
                rects.push(el.getBoundingClientRect());
                el = el.nextSibling;
            }
            return rects;
        }
    }, {
        key: 'filteredRanges',
        value: function filteredRanges() {
            if (!this.range) {
                return [];
            }

            // De-duplicate the boxes
            var rects = Array.from(this.range.getClientRects());
            var stringRects = rects.map(function (r) {
                return JSON.stringify(r);
            });
            var setRects = new Set(stringRects);
            return Array.from(setRects).map(function (sr) {
                return JSON.parse(sr);
            });
        }
    }]);

    return Mark;
}();

var Highlight = exports.Highlight = function (_Mark) {
    _inherits(Highlight, _Mark);

    function Highlight(range, className, data, attributes, attachment) {
        _classCallCheck(this, Highlight);

        var _this = _possibleConstructorReturn(this, (Highlight.__proto__ || Object.getPrototypeOf(Highlight)).call(this));

        _this.range = range;
        _this.className = className;
        _this.data = data || {};
        _this.attributes = attributes || {};
        _this.attachment = attachment || {};
        return _this;
    }

    _createClass(Highlight, [{
        key: 'bind',
        value: function bind(element, container) {
            _get(Highlight.prototype.__proto__ || Object.getPrototypeOf(Highlight.prototype), 'bind', this).call(this, element, container);

            for (var attr in this.data) {
                if (this.data.hasOwnProperty(attr)) {
                    this.element.dataset[attr] = this.data[attr];
                }
            }

            for (var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    this.element.setAttribute(attr, this.attributes[attr]);
                }
            }

            if (this.className) {
                this.element.classList.add(this.className);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            // Empty element
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();

            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];
                var el = _svg2.default.createElement('rect');
                el.setAttribute('x', r.left - offset.left + container.left);
                el.setAttribute('y', r.top - offset.top + container.top);
                el.setAttribute('height', r.height);
                el.setAttribute('width', r.width);
                // for added svg in exising Highlight
                var svgNS = "http://www.w3.org/2000/svg";
                var innerSvg = document.createElementNS(svgNS, "svg");
                innerSvg.setAttribute("width", "20");
                innerSvg.setAttribute("height", "20");
                innerSvg.setAttribute("x", r.left - offset.left + container.left - 10);
                innerSvg.setAttribute("y", r.top - offset.top + container.top - 10);
                innerSvg.setAttribute("viewBox", "0 0 451.39 451.39");
                innerSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                innerSvg.setAttribute("fill", "#000000");
                innerSvg.setAttribute("fill-opacity", "1");
                innerSvg.innerHTML = '\n              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>\n  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"\n    stroke-width="9.027800000000001">\n    <g>\n      <g id="XMLID_28_">\n        <g>\n          <path style="fill:#FFFFFF;"\n            d="M437.029,439.43c0,0.79-0.31,1.54-0.87,2.1c-1.12,1.11-3.08,1.12-4.2,0l-11.91-11.92l4.2-4.19 l11.91,11.91C436.719,437.89,437.029,438.64,437.029,439.43z">\n          </path>\n          <path\n            d="M18.269,68.58l9.13,9.13l44.94-44.94l-9.13-9.13c-2.51-2.51-5.86-3.9-9.41-3.9c-3.56,0-6.9,1.39-9.41,3.9l-26.12,26.12 c-2.51,2.51-3.9,5.85-3.9,9.41C14.369,62.72,15.759,66.06,18.269,68.58z M280.849,353.05c11.07,11.07,23.02,21.04,35.74,29.88 l60.97-60.97c-8.85-12.72-18.82-24.66-29.89-35.73L105.479,44.04l-66.82,66.82L280.849,353.05z M324.209,388.04 c11.5,7.4,23.59,13.92,36.23,19.49l47.86,21.11l14.96-14.97l-21.1-47.85c-5.57-12.64-12.09-24.74-19.5-36.23L324.209,388.04z M431.959,441.53c1.12,1.12,3.08,1.11,4.2,0c0.56-0.56,0.87-1.31,0.87-2.1c0-0.79-0.31-1.54-0.87-2.1l-11.91-11.91l-4.2,4.19 L431.959,441.53z M442.519,430.97c4.67,4.66,4.67,12.25,0,16.92c-2.33,2.33-5.4,3.5-8.46,3.5s-6.13-1.17-8.46-3.5l-11.91-11.91 l-3.38,3.38l-53.5-23.59c-30.81-13.59-58.51-32.55-82.32-56.36l-255.81-255.8c-2.29-2.3-3.55-5.35-3.55-8.6 c0-3.24,1.26-6.29,3.55-8.59l2.36-2.35l-9.13-9.13c-4.22-4.21-6.54-9.81-6.54-15.77s2.32-11.56,6.54-15.78l26.12-26.11 c4.21-4.22,9.81-6.54,15.77-6.54s11.56,2.32,15.77,6.54l9.13,9.12l2.35-2.34c4.73-4.74,12.44-4.74,17.18,0l26.87,26.87 l10.78-10.78l-33.79-33.79l6.37-6.36l173.59,173.6c10.05,10.04,24.41,14.56,38.4,12.07l1.57,8.86c-3.05,0.54-6.13,0.81-9.18,0.81 c-13.81,0-27.22-5.45-37.15-15.38L142.239,46.51l-10.78,10.78l222.58,222.57c23.81,23.82,42.77,51.51,56.36,82.32l23.58,53.5 l-3.37,3.37L442.519,430.97z M32.299,104.49l66.82-66.82l-7.25-7.25c-0.62-0.61-1.42-0.92-2.23-0.92c-0.81,0-1.61,0.31-2.23,0.92 l-62.36,62.37c-0.6,0.59-0.92,1.38-0.92,2.22c0,0.85,0.32,1.64,0.92,2.23L32.299,104.49z">\n          </path>\n          <path style="fill:#A7B6C4;"\n            d="M382.659,329.59c7.41,11.49,13.93,23.59,19.5,36.23l21.1,47.85l-14.96,14.97l-47.86-21.11 c-12.64-5.57-24.73-12.09-36.23-19.49L382.659,329.59z">\n          </path>\n          <path style="fill:#4489D3;"\n            d="M347.669,286.23c11.07,11.07,21.04,23.01,29.89,35.73l-60.97,60.97 c-12.72-8.84-24.67-18.81-35.74-29.88L38.659,110.86l66.82-66.82L347.669,286.23z">\n          </path>\n          <path style="fill:#A7B6C4;"\n            d="M89.639,29.5c0.81,0,1.61,0.31,2.23,0.92l7.25,7.25l-66.82,66.82l-7.25-7.25 c-0.6-0.59-0.92-1.38-0.92-2.23c0-0.84,0.32-1.63,0.92-2.22l62.36-62.37C88.029,29.81,88.829,29.5,89.639,29.5z">\n          </path>\n          <path style="fill:#4489D3;"\n            d="M44.389,23.64c2.51-2.51,5.85-3.9,9.41-3.9c3.55,0,6.9,1.39,9.41,3.9l9.13,9.13l-44.94,44.94 l-9.13-9.13c-2.51-2.52-3.9-5.86-3.9-9.41c0-3.56,1.39-6.9,3.9-9.41L44.389,23.64z">\n          </path>\n        </g>\n      </g>\n    </g>\n  </g>\n  <g id="SVGRepo_iconCarrier">\n    <g>\n      <g id="XMLID_28_">\n        <g>\n          <path style="fill:#FFFFFF;"\n            d="M437.029,439.43c0,0.79-0.31,1.54-0.87,2.1c-1.12,1.11-3.08,1.12-4.2,0l-11.91-11.92l4.2-4.19 l11.91,11.91C436.719,437.89,437.029,438.64,437.029,439.43z">\n          </path>\n          <path\n            d="M18.269,68.58l9.13,9.13l44.94-44.94l-9.13-9.13c-2.51-2.51-5.86-3.9-9.41-3.9c-3.56,0-6.9,1.39-9.41,3.9l-26.12,26.12 c-2.51,2.51-3.9,5.85-3.9,9.41C14.369,62.72,15.759,66.06,18.269,68.58z M280.849,353.05c11.07,11.07,23.02,21.04,35.74,29.88 l60.97-60.97c-8.85-12.72-18.82-24.66-29.89-35.73L105.479,44.04l-66.82,66.82L280.849,353.05z M324.209,388.04 c11.5,7.4,23.59,13.92,36.23,19.49l47.86,21.11l14.96-14.97l-21.1-47.85c-5.57-12.64-12.09-24.74-19.5-36.23L324.209,388.04z M431.959,441.53c1.12,1.12,3.08,1.11,4.2,0c0.56-0.56,0.87-1.31,0.87-2.1c0-0.79-0.31-1.54-0.87-2.1l-11.91-11.91l-4.2,4.19 L431.959,441.53z M442.519,430.97c4.67,4.66,4.67,12.25,0,16.92c-2.33,2.33-5.4,3.5-8.46,3.5s-6.13-1.17-8.46-3.5l-11.91-11.91 l-3.38,3.38l-53.5-23.59c-30.81-13.59-58.51-32.55-82.32-56.36l-255.81-255.8c-2.29-2.3-3.55-5.35-3.55-8.6 c0-3.24,1.26-6.29,3.55-8.59l2.36-2.35l-9.13-9.13c-4.22-4.21-6.54-9.81-6.54-15.77s2.32-11.56,6.54-15.78l26.12-26.11 c4.21-4.22,9.81-6.54,15.77-6.54s11.56,2.32,15.77,6.54l9.13,9.12l2.35-2.34c4.73-4.74,12.44-4.74,17.18,0l26.87,26.87 l10.78-10.78l-33.79-33.79l6.37-6.36l173.59,173.6c10.05,10.04,24.41,14.56,38.4,12.07l1.57,8.86c-3.05,0.54-6.13,0.81-9.18,0.81 c-13.81,0-27.22-5.45-37.15-15.38L142.239,46.51l-10.78,10.78l222.58,222.57c23.81,23.82,42.77,51.51,56.36,82.32l23.58,53.5 l-3.37,3.37L442.519,430.97z M32.299,104.49l66.82-66.82l-7.25-7.25c-0.62-0.61-1.42-0.92-2.23-0.92c-0.81,0-1.61,0.31-2.23,0.92 l-62.36,62.37c-0.6,0.59-0.92,1.38-0.92,2.22c0,0.85,0.32,1.64,0.92,2.23L32.299,104.49z">\n          </path>\n          <path style="fill:#A7B6C4;"\n            d="M382.659,329.59c7.41,11.49,13.93,23.59,19.5,36.23l21.1,47.85l-14.96,14.97l-47.86-21.11 c-12.64-5.57-24.73-12.09-36.23-19.49L382.659,329.59z">\n          </path>\n          <path style="fill:#4489D3;"\n            d="M347.669,286.23c11.07,11.07,21.04,23.01,29.89,35.73l-60.97,60.97 c-12.72-8.84-24.67-18.81-35.74-29.88L38.659,110.86l66.82-66.82L347.669,286.23z">\n          </path>\n          <path style="fill:#A7B6C4;"\n            d="M89.639,29.5c0.81,0,1.61,0.31,2.23,0.92l7.25,7.25l-66.82,66.82l-7.25-7.25 c-0.6-0.59-0.92-1.38-0.92-2.23c0-0.84,0.32-1.63,0.92-2.22l62.36-62.37C88.029,29.81,88.829,29.5,89.639,29.5z">\n          </path>\n          <path style="fill:#4489D3;"\n            d="M44.389,23.64c2.51-2.51,5.85-3.9,9.41-3.9c3.55,0,6.9,1.39,9.41,3.9l9.13,9.13l-44.94,44.94 l-9.13-9.13c-2.51-2.52-3.9-5.86-3.9-9.41c0-3.56,1.39-6.9,3.9-9.41L44.389,23.64z">\n          </path>\n        </g>\n      </g>\n    </g>\n  </g>\n            ';
                docFrag.appendChild(el);
                docFrag.appendChild(innerSvg);
            }

            this.element.appendChild(docFrag);
        }
    }]);

    return Highlight;
}(Mark);

var Underline = exports.Underline = function (_Highlight) {
    _inherits(Underline, _Highlight);

    function Underline(range, className, data, attributes) {
        _classCallCheck(this, Underline);

        return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).call(this, range, className, data, attributes));
    }

    _createClass(Underline, [{
        key: 'render',
        value: function render() {
            // Empty element
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();

            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];

                var rect = _svg2.default.createElement('rect');
                rect.setAttribute('x', r.left - offset.left + container.left);
                rect.setAttribute('y', r.top - offset.top + container.top);
                rect.setAttribute('height', r.height);
                rect.setAttribute('width', r.width);
                rect.setAttribute('fill', 'none');

                var line = _svg2.default.createElement('line');
                line.setAttribute('x1', r.left - offset.left + container.left);
                line.setAttribute('x2', r.left - offset.left + container.left + r.width);
                line.setAttribute('y1', r.top - offset.top + container.top + r.height - 1);
                line.setAttribute('y2', r.top - offset.top + container.top + r.height - 1);

                line.setAttribute('stroke-width', 1);
                line.setAttribute('stroke', 'black'); //TODO: match text color?
                line.setAttribute('stroke-linecap', 'square');

                docFrag.appendChild(rect);

                docFrag.appendChild(line);
            }

            this.element.appendChild(docFrag);
        }
    }]);

    return Underline;
}(Highlight);

function coords(el, container) {
    var offset = container.getBoundingClientRect();
    var rect = el.getBoundingClientRect();

    return {
        top: rect.top - offset.top,
        left: rect.left - offset.left,
        height: el.scrollHeight,
        width: el.scrollWidth
    };
}

function setCoords(el, coords) {
    el.style.setProperty('top', coords.top + 'px', 'important');
    el.style.setProperty('left', coords.left + 'px', 'important');
    el.style.setProperty('height', coords.height + 'px', 'important');
    el.style.setProperty('width', coords.width + 'px', 'important');
}

function contains(rect1, rect2) {
    return rect2.right <= rect1.right && rect2.left >= rect1.left && rect2.top >= rect1.top && rect2.bottom <= rect1.bottom;
}
