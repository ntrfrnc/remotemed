import './DynamicSelectList.scss';

export default class DynamicSelectList {
  constructor({wrapper, items, onSelect, onUnselect, onAddNew}) {
    this.wrapper = wrapper;
    this.wrapper.classList.add('dynamic-select-list');

    this.listElement = this.createListElement();
    this.addNewForm = this.createAddNewForm();

    this.wrapper.appendChild(this.listElement);
    this.wrapper.appendChild(this.addNewForm.wrapper);

    this.onSelect = onSelect;
    this.onUnselect = onUnselect;
    this.onAddNew = onAddNew;

    this.list = [];
    this.lastSelected = null;

    if (items) {
      this.addItems(items)
    }
  }

  addItems(items) {
    for (let item of items) {
      this.addItem(item);
    }
  }

  addItem(item) {
    item.element = this.createItemElement(item);
    item.element.addEventListener('click', (e) => {
      if (item.selected) {
        this.unselectItem(item.id);
      } else {
        this.selectItem(item.id)
      }
    });

    item.id = this.list.length;
    this.list.push(item);
    this.listElement.appendChild(item.element);
  }

  selectItem(id) {
    if (this.lastSelected) {
      this.unselectItem(this.lastSelected.id);
    }

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

  removeItem(id) {
    this.listElement.removeChild(this.list[id].element);
    this.list.splice(id, 1);
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

  createAddNewForm() {
    const wrapper = document.createElement('div');
    wrapper.className = 'add-new-form';

    const input = document.createElement('input');
    input.className = 'add-new-form__input';
    input.placeholder = 'Name';

    const submitBttn = document.createElement('button');
    submitBttn.className = 'add-new-form__submit';
    submitBttn.innerHTML = 'Add';

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

      input.value = '';

      if (typeof this.onAddNew === 'function') {
        await this.onAddNew(item);
      }

      this.addItem(item);
    };

    submitBttn.addEventListener('click', addNew);
    input.addEventListener('keyup', (e) => {
      if(e.key === "Enter") {
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
