function styleInject(css, ref) {
	if ( ref === void 0 ) ref = {};
	var insertAt = ref.insertAt;
  
	if (!css || typeof document === 'undefined') { return; }
  
	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.type = 'text/css';
  
	if (insertAt === 'top') {
	  if (head.firstChild) {
		head.insertBefore(style, head.firstChild);
	  } else {
		head.appendChild(style);
	  }
	} else {
	  head.appendChild(style);
	}
  
	if (style.styleSheet) {
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));
	}
  }
  
  var css = ":root {\n  --drop-border-color: #EBEBF3;\n  --drop-border-color-hover: #68caf3;\n}\n.drop-files {\n  border: 2px dashed var(--drop-border-color);\n  border-radius: 3px;\n  position: relative;\n  transition: border .3s;\n  padding: 10px 5px;\n}\n\n.drop-files.is-hovered {\n  border-color: var(--drop-border-color-hover);\n}\n\n.drop-files__explanations {\n  padding: 40px 0;\n  text-align: center;\n}\n\n.drop-files__fake {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n}\n\n.drop-files.is-hovered input:last-child {\n  z-index: 3;\n}\n\n.drop-files__files {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.drop-files__file {\n  position: relative;\n  max-width: 100px;\n  width: 100%;\n  flex: none;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  margin: 5px;\n  z-index: 2;\n}\n\n.drop-files__file em {\n  opacity: .75;\n  font-size: .9em;\n}\n\n.drop-files__file svg {\n  width: 50px;\n  height: 50px;\n}\n\n.drop-files__file img {\n  width: 100%;\n  height: 50px;\n  object-fit: cover;\n}\n\n.drop-files__fileinfo {\n  margin-top: .5rem;\n  display: flex;\n  align-items: flex-end;\n  width: 100%;\n}\n\n.drop-files__fileinfo span {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.drop-files__fileinfo em {\n  flex: none;\n  margin-left: auto;\n  transition: opacity .3s;\n}\n\n.drop-files__file:hover .drop-files__fileinfo em {\n  opacity: 0;\n}\n\n.drop-files__explanations strong {\n  display: block;\n  font-weight: 500;\n  font-size: 1.2rem;\n}\n\n.drop-files__explanations em {\n  display: block;\n  margin-top: 5px;\n  opacity: .75;\n  font-weight: 400;\n  font-size: .9rem;\n  font-style: normal;\n}\n\n.drop-files__explanations em:empty {\n  display: none;\n}\n\n.drop-files.has-files .drop-files__explanations {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  background-color: rgba(255, 255, 255, 0.8);\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  pointer-events: none;\n  transition: .3s;\n}\n\n.drop-files.has-files.is-hovered .drop-files__explanations {\n  opacity: 1;\n  z-index: 3;\n}\n\n.drop-files__delete {\n  box-sizing: border-box;\n  color: #E94962;\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  padding-left: 5px;\n  padding-top: 5px;\n  width: 25px !important;\n  height: 25px !important;\n  transition: opacity .3s;\n  opacity: 0;\n  cursor: pointer;\n}\n\n.drop-files__file:hover .drop-files__delete {\n  opacity: 1;\n}\n\n";
  styleInject(css);
  
  function arrayToFileList(files) {
	  const data = new ClipboardEvent('').clipboardData || new DataTransfer();
	  files.forEach(file => data.items.add(file));
	  return data.files;
  }
  function mergeFiles(files1, files2) {
	  const files = [...files1];
	  files2.forEach(file => {
		  if (files.find(f => f.size === file.size && f.name === file.name) === undefined) {
			  files.push(file);
		  }
	  });
	  return files;
  }
  function mergeFileLists(files1, files2) {
	  return arrayToFileList(mergeFiles(Array.from(files1), Array.from(files2)));
  }
  function diffFiles(oldFiles, newFiles) {
	  if (oldFiles === null) {
		  return [Array.from(newFiles), []];
	  }
	  const added = Array.from(newFiles).filter(f => !Array.from(oldFiles).includes(f));
	  const removed = Array.from(oldFiles).filter(f => !Array.from(newFiles).includes(f));
	  return [added, removed];
  }
  function removeFile(fileList, file) {
	  return arrayToFileList(Array.from(fileList).filter(f => f !== file));
  }
  
  function strToDom(str) {
	  return document.createRange().createContextualFragment(str);
  }
  
  function humanSize(size, precision = 2) {
	  const i = Math.floor(Math.log(size) / Math.log(1024));
	  return (size / Math.pow(1024, i)).toFixed(precision).toString() + ['o', 'ko', 'Mo', 'Go', 'To'][i];
  }
  
  var pdf = `<svg viewBox="0 0 32 32">
	  <path d="M26.7062 9.02188C26.8937 9.20938 27 9.4625 27 9.72812V29C27 29.5531 26.5531 30 26 30H6C5.44687 30 5 29.5531 5 29V3C5 2.44687 5.44687 2 6 2H19.2719C19.5375 2 19.7938 2.10625 19.9813 2.29375L26.7062 9.02188V9.02188ZM24.6938 10.1875L18.8125 4.30625V10.1875H24.6938ZM19.7881 19.9144C19.3137 19.8988 18.8094 19.9353 18.2366 20.0069C17.4772 19.5384 16.9659 18.895 16.6028 17.9497L16.6362 17.8128L16.675 17.6509C16.8094 17.0844 16.8816 16.6709 16.9031 16.2541C16.9194 15.9394 16.9019 15.6491 16.8459 15.38C16.7428 14.7991 16.3319 14.4594 15.8141 14.4384C15.3312 14.4187 14.8875 14.6884 14.7741 15.1062C14.5894 15.7819 14.6975 16.6709 15.0891 18.1872C14.5903 19.3762 13.9312 20.7703 13.4891 21.5478C12.8987 21.8522 12.4391 22.1291 12.0528 22.4359C11.5434 22.8413 11.2253 23.2578 11.1378 23.6953C11.0953 23.8981 11.1594 24.1631 11.3053 24.3803C11.4709 24.6266 11.7203 24.7866 12.0194 24.8097C12.7741 24.8681 13.7016 24.09 14.7256 22.3328C14.8284 22.2984 14.9372 22.2622 15.07 22.2172L15.4419 22.0916C15.6772 22.0122 15.8478 21.9553 16.0166 21.9006C16.7478 21.6625 17.3009 21.5122 17.8041 21.4266C18.6784 21.8947 19.6891 22.2016 20.3697 22.2016C20.9316 22.2016 21.3112 21.9103 21.4484 21.4519C21.5687 21.0494 21.4734 20.5825 21.2147 20.3244C20.9472 20.0616 20.4553 19.9359 19.7881 19.9144V19.9144ZM12.0384 23.9275V23.9163L12.0425 23.9056C12.0882 23.7874 12.1469 23.6746 12.2175 23.5694C12.3512 23.3637 12.5353 23.1475 12.7634 22.9172C12.8859 22.7937 13.0134 22.6734 13.1631 22.5384C13.1966 22.5084 13.4103 22.3181 13.4503 22.2806L13.7994 21.9556L13.5456 22.3597C13.1606 22.9734 12.8125 23.4153 12.5144 23.7034C12.4047 23.8097 12.3081 23.8878 12.23 23.9381C12.2042 23.9554 12.1769 23.9702 12.1484 23.9825C12.1356 23.9878 12.1244 23.9909 12.1131 23.9919C12.1012 23.9934 12.0892 23.9918 12.0781 23.9872C12.0664 23.9823 12.0563 23.974 12.0493 23.9633C12.0422 23.9527 12.0384 23.9403 12.0384 23.9275V23.9275ZM15.9741 17.1063L15.9034 17.2313L15.8597 17.0944C15.7628 16.7872 15.6916 16.3244 15.6719 15.9069C15.6494 15.4319 15.6872 15.1469 15.8372 15.1469C16.0478 15.1469 16.1444 15.4844 16.1519 15.9922C16.1587 16.4384 16.0884 16.9028 15.9738 17.1063H15.9741ZM15.7925 18.9331L15.8403 18.8066L15.9056 18.9253C16.2709 19.5891 16.745 20.1428 17.2663 20.5287L17.3787 20.6119L17.2416 20.64C16.7312 20.7456 16.2559 20.9044 15.6059 21.1666C15.6738 21.1391 14.9303 21.4434 14.7422 21.5156L14.5781 21.5784L14.6656 21.4259C15.0516 20.7541 15.4081 19.9472 15.7922 18.9331H15.7925ZM20.7181 21.3162C20.4725 21.4131 19.9437 21.3266 19.0128 20.9291L18.7766 20.8284L19.0328 20.8097C19.7609 20.7556 20.2766 20.7956 20.5772 20.9056C20.7053 20.9525 20.7906 21.0116 20.8284 21.0791C20.8483 21.111 20.855 21.1495 20.8471 21.1863C20.8392 21.2231 20.8172 21.2553 20.7859 21.2763C20.7661 21.2938 20.7431 21.3073 20.7181 21.3162V21.3162Z" fill="#E94962"/>
  </svg>`;
  
  var doc = `<svg viewBox="0 0 16 16">
	  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0308 0.0310059V3.96901H13.9018L10.0308 0.0310059Z" fill="#0078d7"/>
	  <path fill-rule="evenodd" clip-rule="evenodd" d="M4 9H4.965V10.989H4V9Z" fill="#0078d7"/>
	  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 9H8.953V10.953H8V9Z" fill="#0078d7"/>
	  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.93799 5.09209V0.0690918H2.04199V15.9381H13.938V5.09209H8.93799ZM5.03299 11.0311V12.0401H2.98199V7.97309L5.04599 7.98309V8.95409H6.02999L6.04599 11.0321H5.03299V11.0311V11.0311ZM10.012 11.0471H9.01599V12.0311H7.96899V11.0471H6.97499V8.98509H7.96899V7.96909H9.01599V8.98509H10.012V11.0471ZM13.016 9.01609H12.016V10.9851H13.016V12.0001H11.954V11.0241H10.97V8.95709H11.954V7.97109H13.016V9.01609V9.01609Z" fill="#0078d7"/>
  </svg>`;
  
  const icons = {
	  doc: doc,
	  docx: doc,
	  pdf: pdf,
  };
  /*
  Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ doc: string; docx: string; pdf: string; }'.
	No index signature with a parameter of type 'string' was found on type '{ doc: string; docx: string; pdf: string; }'.
  
   */
  function renderExtension(file) {
	  const ext = file.name
		  .split('.')
		  .slice(-1)[0]
		  .toLowerCase();
	  if (icons[ext] !== undefined) {
		  return strToDom(icons[ext]).firstChild;
	  }
	  const img = strToDom(`<img src=""/>`).firstChild;
	  const reader = new FileReader();
	  reader.addEventListener('load', () => {
		  img.setAttribute('src', reader.result.toString());
	  }, false);
	  reader.readAsDataURL(file);
	  return img;
  }
  
  function FileComponent({ file, onDelete }) {
	  const icon = renderExtension(file);
	  const dom = strToDom(`<div class="drop-files__file">
	  <div class="drop-files__fileinfo">
		<span>${file.name}</span>
		<em>${humanSize(file.size, 0)}</em>
	  </div>
	  <svg width="24" height="24" viewBox="0 0 24 24" class="drop-files__delete">
		<path
		  d="M4 5H7V4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2H15C15.5304 2 16.0391 2.21071 16.4142 2.58579C16.7893 2.96086 17 3.46957 17 4V5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6C21 6.26522 20.8946 6.51957 20.7071 6.70711C20.5196 6.89464 20.2652 7 20 7H19V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V7H4C3.73478 7 3.48043 6.89464 3.29289 6.70711C3.10536 6.51957 3 6.26522 3 6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5V5ZM7 7V20H17V7H7ZM9 5H15V4H9V5ZM9 9H11V18H9V9ZM13 9H15V18H13V9Z"
		fill="currentColor"/>
		</svg>
	  </div>`).firstChild;
	  dom.insertBefore(icon, dom.firstChild);
	  dom.querySelector('.drop-files__delete').addEventListener('click', e => {
		  e.preventDefault();
		  onDelete(file);
	  });
	  return dom;
  }
  
  /**
   * Flip animation
   */
  class Flip {
	  constructor() {
		  this.timingFunction = 'cubic-bezier(0.5, 0, 0, 0.5)';
		  this.duration = 450;
		  this.positions = new Map();
	  }
	  /**
	   * Mémorise la position de nos éléments
	   */
	  read(elements) {
		  elements.forEach(element => {
			  this.positions.set(element, element.getBoundingClientRect());
		  });
	  }
	  /**
	   * Anime les éléments vers leur nouvelle position
	   */
	  play(elements) {
		  elements.forEach((element, k) => {
			  const newPosition = element.getBoundingClientRect();
			  const oldPosition = this.positions.get(element);
			  if (oldPosition === undefined) {
				  element.animate([
					  {
						  transform: `translate(0, 10px)`,
						  opacity: 0,
					  },
					  {
						  transform: 'none',
						  opacity: 1,
					  },
				  ], {
					  duration: this.duration,
					  easing: this.timingFunction,
					  fill: 'both',
					  delay: 50 * k,
				  });
				  return;
			  }
			  const deltaX = oldPosition.x - newPosition.x;
			  const deltaY = oldPosition.y - newPosition.y;
			  const deltaW = oldPosition.width / newPosition.width;
			  const deltaH = oldPosition.height / newPosition.height;
			  if (deltaX === 0 && deltaY === 0 && deltaH === 0 && deltaW === 0)
				  return;
			  element.animate([
				  {
					  transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`,
				  },
				  {
					  transform: 'none',
				  },
			  ], {
				  duration: this.duration,
				  easing: this.timingFunction,
				  fill: 'both',
			  });
		  });
	  }
	  /**
	   * Supprime les éléments avec une animation
	   *
	   * @param {Element[]} elements
	   */
	  remove(elements) {
		  // We move the elements to remove at the end
		  elements.forEach(element => element.parentNode.appendChild(element));
		  // We animate the removal of the element
		  elements.forEach(element => {
			  const newPosition = element.getBoundingClientRect();
			  const oldPosition = this.positions.get(element);
			  const deltaX = oldPosition.x - newPosition.x;
			  const deltaY = oldPosition.y - newPosition.y;
			  element.animate([
				  {
					  transform: `translate(${deltaX}px, ${deltaY}px)`,
					  opacity: 1,
				  },
				  {
					  transform: `translate(${deltaX}px, ${deltaY - 10}px)`,
					  opacity: 0,
				  },
			  ], {
				  duration: this.duration,
				  easing: this.timingFunction,
				  fill: 'both',
			  });
			  window.setTimeout(function () {
				  element.parentNode.removeChild(element);
			  }, this.duration);
		  });
	  }
  }
  
  /**
   * This component handle the view for the file listing
   */
  class FileListComponent {
	  constructor() {
		  this.oldFiles = null;
	  }
	  render({ onDelete }) {
		  this.flip = new Flip();
		  this.onDelete = onDelete;
		  this.fileElements = new Map();
		  this.container = strToDom(`<div class="drop-files__files"></div>`).firstChild;
		  return this.container;
	  }
	  /**
	   * Update the DOM
	   */
	  update(fileList) {
		  const [added, removed] = diffFiles(this.oldFiles, fileList);
		  this.flip.read(Array.from(this.fileElements.values()));
		  added.forEach(file => {
			  const fileComponent = FileComponent({ file, onDelete: this.onDelete });
			  this.fileElements.set(file, fileComponent);
			  this.container.appendChild(fileComponent);
		  });
		  if (removed.length > 0) {
			  const removeElements = removed.map(file => {
				  const element = this.fileElements.get(file);
				  this.fileElements.delete(file);
				  return element;
			  });
			  this.flip.remove(removeElements);
		  }
		  this.flip.play(Array.from(this.fileElements.values()));
		  this.oldFiles = arrayToFileList(Array.from(fileList)); // Creates a clone instead of a reference, fix #2
	  }
  }
  
  /**
   * @element drop-files
   * @attr {String} label - The label used as a bold text for the drop area
   * @attr {String} help - Help text used as a secondary text for the drop area
   * @cssprop --drop-border-color
   * @cssprop --drop-border-color-hover
   */
  class DropFilesElement extends HTMLInputElement {
	  constructor() {
		  super(...arguments);
		  this.ignoreCallbacks = false;
		  this.allowMultiple = false;
	  }
	  static get observedAttributes() {
		  return ['label', 'help', 'multiple'];
	  }
	  connectedCallback() {
		  if (this.ignoreCallbacks)
			  return;
		  this.ignoreCallbacks = true;
		  const div = this.render();
		  this.fileList = new FileListComponent();
		  this.insertAdjacentElement('afterend', div);
		  this.style.display = 'none';
		  div.appendChild(this);
		  div.appendChild(this.fileList.render({ onDelete: this.deleteFile.bind(this) }));
		  // Listeners
		  div.addEventListener('dragover', () => div.classList.add('is-hovered'));
		  div.addEventListener('dragleave', () => div.classList.remove('is-hovered'));
		  div.addEventListener('drop', () => div.classList.remove('is-hovered'));
		  this.container = div;
		  // Safari need this timer
		  window.requestAnimationFrame(() => {
			  this.ignoreCallbacks = false;
		  });
		  if (this.files.length > 0) {
			  this.onFilesUpdate();
		  }
	  }
	  disconnectedCallback() {
		  if (this.ignoreCallbacks)
			  return;
		  this.container.remove();
	  }
	  attributeChangedCallback(name, oldValue, newValue) {
		  if (name === 'label' && this.container) {
			  this.container.querySelector('.drop-files__explanations strong').innerHTML = newValue;
		  }
		  if (name === 'help' && this.container) {
			  this.container.querySelector('.drop-files__explanations em').innerHTML = newValue;
		  }
		  if (name === 'multiple') {
			  this.allowMultiple = newValue !== null;
			  if (!this.allowMultiple && this.files.length > 1) {
				  this.files = arrayToFileList([this.files[0]]);
				  this.onFilesUpdate();
			  }
		  }
	  }
	  getAttributes() {
		  return {
			  label: this.getAttribute('label') || 'Drop files here or click to upload.',
			  help: this.getAttribute('help') || '',
		  };
	  }
	  /**
	   * Render the base structure for the component
	   */
	  render() {
		  const { label, help } = this.getAttributes();
		  const dom = strToDom(`<div class="drop-files">
		<div class="drop-files__explanations">
			  <strong>${label}</strong>
			  <em>${help}</em>
		</div>
		<input type="file" multiple class="drop-files__fake"/>
	  </div>`).firstElementChild;
		  dom.querySelector('.drop-files__fake').addEventListener('change', this.onNewFiles.bind(this));
		  return dom;
	  }
	  /**
	   * Remove a file from the FileList
	   */
	  deleteFile(file) {
		  this.files = removeFile(this.files, file);
		  this.onFilesUpdate();
	  }
	  /**
	   * Event triggered when new files are selected
	   */
	  onNewFiles(e) {
		  if (this.allowMultiple) {
			  this.files = mergeFileLists(this.files, e.currentTarget.files);
		  }
		  else {
			  this.files = arrayToFileList([e.currentTarget.files[0]]);
		  }
		  e.currentTarget.files = arrayToFileList([]);
		  this.onFilesUpdate();
	  }
	  /**
	   * Event triggered when files changes
	   */
	  onFilesUpdate() {
		  this.dispatchEvent(new Event('change'));
		  if (this.files.length > 0) {
			  this.container.classList.add('has-files');
		  }
		  else {
			  this.container.classList.remove('has-files');
		  }
		  this.fileList.update(this.files);
	  }
  }
  try {
	  customElements.define('drop-files', DropFilesElement, { extends: 'input' });
  }
  catch (e) {
	  if (e instanceof DOMException) {
		  console.error('DOMException : ' + e.message);
	  }
	  else {
		  throw e;
	  }
  }
  
  export default DropFilesElement;