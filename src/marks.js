import svg from './svg';
import events from './events';

export class Pane {
    constructor(target, container = document.body) {
        this.target = target;
        this.element = svg.createElement('svg');
        this.marks = [];

        // Match the coordinates of the target element
        this.element.style.position = 'absolute';
        // Disable pointer events
        this.element.setAttribute('pointer-events', 'none');

        // Set up mouse event proxying between the target element and the marks
        events.proxyMouse(this.target, this.marks);

        this.container = container;
        this.container.appendChild(this.element);

        this.render();
    }

    addMark(mark) {
        var g = svg.createElement('g');
        this.element.appendChild(g);
        mark.bind(g, this.container);

        this.marks.push(mark);

        mark.render();
        return mark;
    }

    removeMark(mark) {
        var idx = this.marks.indexOf(mark);
        if (idx === -1) {
            return;
        }
        var el = mark.unbind();
        this.element.removeChild(el);
        this.marks.splice(idx, 1);
    }

    render() {
        setCoords(this.element, coords(this.target, this.container));
        for (var m of this.marks) {
            m.render();
        }
    }
}


export class Mark {
    constructor() {
        this.element = null;
    }

    bind(element, container) {
        this.element = element;
        this.container = container;
    }

    unbind() {
        var el = this.element;
        this.element = null;
        return el;
    }

    render() {}

    dispatchEvent(e) {
        if (!this.element) return;
        this.element.dispatchEvent(e);
    }

    getBoundingClientRect() {
        return this.element.getBoundingClientRect();
    }

    getClientRects() {
        var rects = [];
        var el = this.element.firstChild;
        while (el) {
            rects.push(el.getBoundingClientRect());
            el = el.nextSibling;
        }
        return rects;
    }

    filteredRanges() {
        if (!this.range) {
            return [];
        }

        // De-duplicate the boxes
        const rects = Array.from(this.range.getClientRects());
        const stringRects = rects.map((r) => JSON.stringify(r));
        const setRects = new Set(stringRects);
        return Array.from(setRects).map((sr) => JSON.parse(sr));
    }

}

export class Highlight extends Mark {
    constructor(range, className, data, attributes, attachment) {
        super();
        this.range = range;
        this.className = className;
        this.data = data || {};
        this.attributes = attributes || {};
        this.attachment = attachment|| {}
    }

    bind(element, container) {
        super.bind(element, container);

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

    render() {
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
            var el = svg.createElement('rect');
            el.setAttribute('x', r.left - offset.left + container.left);
            el.setAttribute('y', r.top - offset.top + container.top);
            el.setAttribute('height', r.height);
            el.setAttribute('width', r.width);
            // for added svg in exising Highlight
            var svgNS = "http://www.w3.org/2000/svg";
            var innerSvg = document.createElementNS(svgNS, "svg");
            innerSvg.setAttribute("width", "14");
            innerSvg.setAttribute("height", "14");
            innerSvg.setAttribute("x", r.left - offset.left + container.left - 10);
            innerSvg.setAttribute("y", r.top - offset.top + container.top - 10);
            innerSvg.setAttribute("viewBox", "0 0 451.39 451.39");
            innerSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            innerSvg.setAttribute("fill", "#000000");
            innerSvg.setAttribute("fill-opacity", "1");
            innerSvg.innerHTML = `
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"
    stroke-width="9.027800000000001">
    <g>
      <g id="XMLID_28_">
        <g>
          <path style="fill:#FFFFFF;"
            d="M437.029,439.43c0,0.79-0.31,1.54-0.87,2.1c-1.12,1.11-3.08,1.12-4.2,0l-11.91-11.92l4.2-4.19 l11.91,11.91C436.719,437.89,437.029,438.64,437.029,439.43z">
          </path>
          <path
            d="M18.269,68.58l9.13,9.13l44.94-44.94l-9.13-9.13c-2.51-2.51-5.86-3.9-9.41-3.9c-3.56,0-6.9,1.39-9.41,3.9l-26.12,26.12 c-2.51,2.51-3.9,5.85-3.9,9.41C14.369,62.72,15.759,66.06,18.269,68.58z M280.849,353.05c11.07,11.07,23.02,21.04,35.74,29.88 l60.97-60.97c-8.85-12.72-18.82-24.66-29.89-35.73L105.479,44.04l-66.82,66.82L280.849,353.05z M324.209,388.04 c11.5,7.4,23.59,13.92,36.23,19.49l47.86,21.11l14.96-14.97l-21.1-47.85c-5.57-12.64-12.09-24.74-19.5-36.23L324.209,388.04z M431.959,441.53c1.12,1.12,3.08,1.11,4.2,0c0.56-0.56,0.87-1.31,0.87-2.1c0-0.79-0.31-1.54-0.87-2.1l-11.91-11.91l-4.2,4.19 L431.959,441.53z M442.519,430.97c4.67,4.66,4.67,12.25,0,16.92c-2.33,2.33-5.4,3.5-8.46,3.5s-6.13-1.17-8.46-3.5l-11.91-11.91 l-3.38,3.38l-53.5-23.59c-30.81-13.59-58.51-32.55-82.32-56.36l-255.81-255.8c-2.29-2.3-3.55-5.35-3.55-8.6 c0-3.24,1.26-6.29,3.55-8.59l2.36-2.35l-9.13-9.13c-4.22-4.21-6.54-9.81-6.54-15.77s2.32-11.56,6.54-15.78l26.12-26.11 c4.21-4.22,9.81-6.54,15.77-6.54s11.56,2.32,15.77,6.54l9.13,9.12l2.35-2.34c4.73-4.74,12.44-4.74,17.18,0l26.87,26.87 l10.78-10.78l-33.79-33.79l6.37-6.36l173.59,173.6c10.05,10.04,24.41,14.56,38.4,12.07l1.57,8.86c-3.05,0.54-6.13,0.81-9.18,0.81 c-13.81,0-27.22-5.45-37.15-15.38L142.239,46.51l-10.78,10.78l222.58,222.57c23.81,23.82,42.77,51.51,56.36,82.32l23.58,53.5 l-3.37,3.37L442.519,430.97z M32.299,104.49l66.82-66.82l-7.25-7.25c-0.62-0.61-1.42-0.92-2.23-0.92c-0.81,0-1.61,0.31-2.23,0.92 l-62.36,62.37c-0.6,0.59-0.92,1.38-0.92,2.22c0,0.85,0.32,1.64,0.92,2.23L32.299,104.49z">
          </path>
          <path style="fill:#A7B6C4;"
            d="M382.659,329.59c7.41,11.49,13.93,23.59,19.5,36.23l21.1,47.85l-14.96,14.97l-47.86-21.11 c-12.64-5.57-24.73-12.09-36.23-19.49L382.659,329.59z">
          </path>
          <path style="fill:#4489D3;"
            d="M347.669,286.23c11.07,11.07,21.04,23.01,29.89,35.73l-60.97,60.97 c-12.72-8.84-24.67-18.81-35.74-29.88L38.659,110.86l66.82-66.82L347.669,286.23z">
          </path>
          <path style="fill:#A7B6C4;"
            d="M89.639,29.5c0.81,0,1.61,0.31,2.23,0.92l7.25,7.25l-66.82,66.82l-7.25-7.25 c-0.6-0.59-0.92-1.38-0.92-2.23c0-0.84,0.32-1.63,0.92-2.22l62.36-62.37C88.029,29.81,88.829,29.5,89.639,29.5z">
          </path>
          <path style="fill:#4489D3;"
            d="M44.389,23.64c2.51-2.51,5.85-3.9,9.41-3.9c3.55,0,6.9,1.39,9.41,3.9l9.13,9.13l-44.94,44.94 l-9.13-9.13c-2.51-2.52-3.9-5.86-3.9-9.41c0-3.56,1.39-6.9,3.9-9.41L44.389,23.64z">
          </path>
        </g>
      </g>
    </g>
  </g>
  <g id="SVGRepo_iconCarrier">
    <g>
      <g id="XMLID_28_">
        <g>
          <path style="fill:#FFFFFF;"
            d="M437.029,439.43c0,0.79-0.31,1.54-0.87,2.1c-1.12,1.11-3.08,1.12-4.2,0l-11.91-11.92l4.2-4.19 l11.91,11.91C436.719,437.89,437.029,438.64,437.029,439.43z">
          </path>
          <path
            d="M18.269,68.58l9.13,9.13l44.94-44.94l-9.13-9.13c-2.51-2.51-5.86-3.9-9.41-3.9c-3.56,0-6.9,1.39-9.41,3.9l-26.12,26.12 c-2.51,2.51-3.9,5.85-3.9,9.41C14.369,62.72,15.759,66.06,18.269,68.58z M280.849,353.05c11.07,11.07,23.02,21.04,35.74,29.88 l60.97-60.97c-8.85-12.72-18.82-24.66-29.89-35.73L105.479,44.04l-66.82,66.82L280.849,353.05z M324.209,388.04 c11.5,7.4,23.59,13.92,36.23,19.49l47.86,21.11l14.96-14.97l-21.1-47.85c-5.57-12.64-12.09-24.74-19.5-36.23L324.209,388.04z M431.959,441.53c1.12,1.12,3.08,1.11,4.2,0c0.56-0.56,0.87-1.31,0.87-2.1c0-0.79-0.31-1.54-0.87-2.1l-11.91-11.91l-4.2,4.19 L431.959,441.53z M442.519,430.97c4.67,4.66,4.67,12.25,0,16.92c-2.33,2.33-5.4,3.5-8.46,3.5s-6.13-1.17-8.46-3.5l-11.91-11.91 l-3.38,3.38l-53.5-23.59c-30.81-13.59-58.51-32.55-82.32-56.36l-255.81-255.8c-2.29-2.3-3.55-5.35-3.55-8.6 c0-3.24,1.26-6.29,3.55-8.59l2.36-2.35l-9.13-9.13c-4.22-4.21-6.54-9.81-6.54-15.77s2.32-11.56,6.54-15.78l26.12-26.11 c4.21-4.22,9.81-6.54,15.77-6.54s11.56,2.32,15.77,6.54l9.13,9.12l2.35-2.34c4.73-4.74,12.44-4.74,17.18,0l26.87,26.87 l10.78-10.78l-33.79-33.79l6.37-6.36l173.59,173.6c10.05,10.04,24.41,14.56,38.4,12.07l1.57,8.86c-3.05,0.54-6.13,0.81-9.18,0.81 c-13.81,0-27.22-5.45-37.15-15.38L142.239,46.51l-10.78,10.78l222.58,222.57c23.81,23.82,42.77,51.51,56.36,82.32l23.58,53.5 l-3.37,3.37L442.519,430.97z M32.299,104.49l66.82-66.82l-7.25-7.25c-0.62-0.61-1.42-0.92-2.23-0.92c-0.81,0-1.61,0.31-2.23,0.92 l-62.36,62.37c-0.6,0.59-0.92,1.38-0.92,2.22c0,0.85,0.32,1.64,0.92,2.23L32.299,104.49z">
          </path>
          <path style="fill:#A7B6C4;"
            d="M382.659,329.59c7.41,11.49,13.93,23.59,19.5,36.23l21.1,47.85l-14.96,14.97l-47.86-21.11 c-12.64-5.57-24.73-12.09-36.23-19.49L382.659,329.59z">
          </path>
          <path style="fill:#4489D3;"
            d="M347.669,286.23c11.07,11.07,21.04,23.01,29.89,35.73l-60.97,60.97 c-12.72-8.84-24.67-18.81-35.74-29.88L38.659,110.86l66.82-66.82L347.669,286.23z">
          </path>
          <path style="fill:#A7B6C4;"
            d="M89.639,29.5c0.81,0,1.61,0.31,2.23,0.92l7.25,7.25l-66.82,66.82l-7.25-7.25 c-0.6-0.59-0.92-1.38-0.92-2.23c0-0.84,0.32-1.63,0.92-2.22l62.36-62.37C88.029,29.81,88.829,29.5,89.639,29.5z">
          </path>
          <path style="fill:#4489D3;"
            d="M44.389,23.64c2.51-2.51,5.85-3.9,9.41-3.9c3.55,0,6.9,1.39,9.41,3.9l9.13,9.13l-44.94,44.94 l-9.13-9.13c-2.51-2.52-3.9-5.86-3.9-9.41c0-3.56,1.39-6.9,3.9-9.41L44.389,23.64z">
          </path>
        </g>
      </g>
    </g>
  </g>
            `;
            docFrag.appendChild(el);
            docFrag.appendChild(innerSvg);
        }

        this.element.appendChild(docFrag);

    }
}

export class Underline extends Highlight {
    constructor(range, className, data, attributes) {
        super(range, className, data,  attributes);
    }

    render() {
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

            var rect = svg.createElement('rect');
            rect.setAttribute('x', r.left - offset.left + container.left);
            rect.setAttribute('y', r.top - offset.top + container.top);
            rect.setAttribute('height', r.height);
            rect.setAttribute('width', r.width);
            rect.setAttribute('fill', 'none');


            var line = svg.createElement('line');
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
}


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
    el.style.setProperty('top', `${coords.top}px`, 'important');
    el.style.setProperty('left', `${coords.left}px`, 'important');
    el.style.setProperty('height', `${coords.height}px`, 'important');
    el.style.setProperty('width', `${coords.width}px`, 'important');
}

function contains(rect1, rect2) {
  return (
    (rect2.right <= rect1.right) &&
    (rect2.left >= rect1.left) &&
    (rect2.top >= rect1.top) &&
    (rect2.bottom <= rect1.bottom)
  );
}
