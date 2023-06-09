import { Observable } from 'lib0/observable';
import { sendGlobalMessage } from '../util';
import {
  constructUpdate,
  dataPathToArray,
  dataPathToStringArray,
} from './util';
import { SidePanel } from './SidePanel';

export class ContentProvider extends Observable {
  constructor(doc, dataAttribute = 'data-yjs') {
    super();

    this.doc = doc;
    this.dataAttribute = dataAttribute;
    this.sidePanel = new SidePanel();

    this.render();

    this.on('doc-update', (newDoc) => {
      console.log('Content.js: doc-update: ', newDoc);
      this.doc = newDoc;
      this.render();
    });
  }

  render() {
    for (const element of this.dataElements) {
      this.renderElement(element);
      this.removeInputListener(element);
      this.addInputListener(element);
      this.addClickListener(element);
    }
  }

  renderElement(element) {
    element.setAttribute('contentEditable', 'true');
    const dataPath = element.getAttribute(this.dataAttribute);
    element.textContent = this.valueFor(dataPath) || '[empty]';
  }

  addInputListener(element) {
    const boundHandleInputChange = this.handleInputChange.bind(this);
    element.addEventListener('input', boundHandleInputChange, false);
  }

  removeInputListener(element) {
    const boundHandleInputChange = this.handleInputChange.bind(this);
    element.removeEventListener('input', boundHandleInputChange, false);
  }

  handleInputChange(event) {
    const updatedValue = event.target.textContent;
    const dataPath = event.target.getAttribute(this.dataAttribute);
    this.applyUpdate(constructUpdate(dataPath, updatedValue));
  }

  addClickListener(element) {
    const boundHandleClick = this.handleClick.bind(this);
    element.addEventListener('click', boundHandleClick, false);
  }

  handleClick(event) {
    const element = event.target;
    const path = this.dataPathFor(element);

    this.sidePanel.open();
    this.sidePanel.emit('update', [path]);
  }

  applyUpdate(update) {
    sendGlobalMessage('UPDATE', { update });
  }

  valueFor(dataAttribute) {
    const storagePath = dataPathToArray(dataAttribute);
    let currentObj = this.doc;
    for (let i = 0; i < storagePath.length; i++) {
      currentObj = currentObj[storagePath[i]];
    }
    return currentObj;
  }

  isDataElement(element) {
    return element.hasAttribute(this.dataAttribute);
  }

  dataPathFor(element) {
    return dataPathToArray(element.getAttribute(this.dataAttribute));
  }

  dataTargetAndPropFor(element) {
    const dataPath = this.dataPathFor(element);
    return this.doc.getTargetAndProp(dataPath, '-');
  }

  get dataElements() {
    return document.querySelectorAll(`[${this.dataAttribute}]`);
  }
}
