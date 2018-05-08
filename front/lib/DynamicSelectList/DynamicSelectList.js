import './DynamicSelectList.scss';

export default class DynamicSelectList {
  constructor({
                wrapper,
                items,
                addNewForm,
                addNewFormPosition,
                addNewAtTop,
                onSelect,
                onUnselect,
                onBeforeAddNew,
                clearBeforeCreate,
                labels,
                noItemsInfo
              }) {

    if (clearBeforeCreate) {
      wrapper.innerHTML = '';
    }

    this.labels = labels || {
      add: 'Add',
      name: 'Name',
      noItems: 'No items to show'
    };

    this.wrapper = wrapper;
    this.wrapper.classList.add('dynamic-select-list');

    this.listElement = this.createListElement();
    this.wrapper.appendChild(this.listElement);

    this.addNewFormPosition = addNewFormPosition || 'bottom';
    this.addNewAtTop = addNewAtTop;

    if (addNewForm) {
      this.addNewForm = this.createAddNewForm();
      switch (this.addNewFormPosition) {
        case 'top':
          this.wrapper.insertBefore(this.addNewForm.wrapper, this.wrapper.childNodes[0]);
          break;
        case 'bottom':
          this.wrapper.appendChild(this.addNewForm.wrapper);
          break;
      }
    }

    this.onSelect = onSelect;
    this.onUnselect = onUnselect;
    this.onBeforeAddNew = onBeforeAddNew;

    this.list = [];
    this.lastSelected = null;
    this.noItemsInfoElement = null;
    this.noItemsInfo = noItemsInfo;

    if (items) {
      this.addItems(items)
    }

    if (this.list.length < 1 && this.noItemsInfo) {
      this.addNoItemsInfo();
    }
  }

  addItems(items) {
    for (let item of items) {
      this.addItem(item);
    }
  }

  addItem(item, top) {
    item.element = this.createItemElement(item);
    item.element.addEventListener('click', (e) => {
      if (!item.selected) {
        this.selectItem(item.id)
      }
    });

    item.id = this.list.length;
    this.list.push(item);
    if (top) {
      this.listElement.insertBefore(item.element, this.listElement.childNodes[0]);
    }
    else {
      this.listElement.appendChild(item.element);
    }

    if (this.noItemsInfo && this.noItemsInfoElement) {
      this.removeNoItemsInfo();
    }
  }

  selectItem(id) {
    this.unselectLast();

    const item = this.list[id];
    this.lastSelected = item;
    item.selected = true;
    item.element.classList.add('selected');

    if (typeof this.onSelect === 'function') {
      this.onSelect(item);
    }
  }

  unselectItem(id) {
    const item = this.list[id];
    item.element.classList.remove('selected');
    item.selected = false;

    if (typeof this.onUnselect === 'function') {
      this.onUnselect(item);
    }
  }

  unselectLast() {
    if (this.lastSelected) {
      this.unselectItem(this.lastSelected.id);
    }
  }

  removeItem(id) {
    this.listElement.removeChild(this.list[id].element);
    this.list.splice(id, 1);

    if (this.list.length < 1 && this.noItemsInfo) {
      this.addNoItemsInfo();
    }
  }

  clear() {
    if (this.list.length < 1) {
      return;
    }

    this.list = [];
    this.noItemsInfoElement = null;
    this.listElement.innerHTML = '';

    if (this.noItemsInfo) {
      this.addNoItemsInfo();
    }
  }

  createListElement() {
    const el = document.createElement('ul');
    el.classList.add('dynamic-select-list__list');

    return el;
  }

  createItemElement(item) {
    const el = document.createElement('li');
    el.className = item.classes || '';
    el.classList.add('dynamic-select-list__item');
    el.innerHTML = item.content || '';
    if (item.attributes) {
      for (let attr of item.attributes) {
        el.setAttribute(attr.name, attr.value);
      }
    }

    return el;
  }

  addNoItemsInfo() {
    if (this.noItemsInfoElement) {
      return;
    }

    const el = document.createElement('span');
    el.className = 'dynamic-select-list__no-items-info';
    el.innerHTML = this.labels.noItems;
    this.noItemsInfoElement = el;
    this.listElement.appendChild(el);
  }

  removeNoItemsInfo() {
    if (this.noItemsInfoElement) {
      this.listElement.removeChild(this.noItemsInfoElement);
      this.noItemsInfoElement = null;
    }
  }

  createAddNewForm() {
    const wrapper = document.createElement('div');
    wrapper.className = 'add-new-form';

    const input = document.createElement('input');
    input.className = 'add-new-form__input';
    input.placeholder = this.labels.name;

    const submitBttn = document.createElement('button');
    submitBttn.className = 'add-new-form__submit';
    submitBttn.innerHTML = this.labels.add;

    const addNew = async (e) => {
      if (!input.value.trim()) {
        return;
      }

      const item = {
        content: input.value,
        data: {
          name: input.value
        }
      };

      if (typeof this.onBeforeAddNew === 'function') {
        const r = await this.onBeforeAddNew(item);
        if (r === false) {
          return;
        }
      }

      input.value = '';

      this.addItem(item, this.addNewAtTop);
    };

    submitBttn.addEventListener('click', addNew);
    input.addEventListener('keyup', (e) => {
      if (e.key === "Enter") {
        addNew(e);
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(submitBttn);

    return {
      wrapper,
      input,
      submitBttn
    }
  }
}
