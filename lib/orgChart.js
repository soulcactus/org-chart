export default class OrgChart {
    constructor(container) {
        if (!container) {
            return console.error(
                "[OrgChart] Error: 'container' property is null. 'container' property of the OrgChart option must be set.",
            );
        } else {
            this.container = document.querySelector(container);
            this.defaultZoom = 1;
        }
    }

    _checkNodeOn(el) {
        const className = `input[name*=${Object.keys(this.profile)[0]}]`;
        const form = document.querySelectorAll(className);
        const id = el ? el.parentElement.getAttribute('id') : null;
        const modify = el
            ? el.nextElementSibling.getAttribute('modified')
            : null;
        let focusItem;

        const checkNode = Array.from(form).some((item) => {
            const itemStyle = item.getAttribute('style');

            if (itemStyle) {
                focusItem = item;
            }

            return itemStyle;
        });

        if (checkNode) {
            if (Number(id) === this.id || modify) {
                return false;
            } else {
                focusItem.focus();

                return true;
            }
        } else {
            return false;
        }
    }

    _addNode(e) {
        console.time('addNode');
        const container = this.container;
        const profile = this.profile;
        const data = this.data;
        const parent = e.target.parentElement;
        const parentId = parent.getAttribute('id');
        const nextSibling = parent.parentElement.nextElementSibling;
        const obj = {};

        const siblings = nextSibling
            ? nextSibling.nextElementSibling.querySelectorAll('.member')
            : null;

        const sequenceId = siblings
            ? Number(siblings[siblings.length - 1].getAttribute('sequenceId')) +
              1
            : 0;

        let tree = this.tree;
        let id = this.id;

        if (this._checkNodeOn()) {
            return;
        } else {
            id = ++this.id;
        }

        obj['id'] = id;
        obj['parentId'] = Number(parentId);
        obj['sequenceId'] = sequenceId;

        for (const [key, value] of Object.entries(profile)) {
            obj[key] = value;
        }

        container.innerHTML = '';
        data.push(obj);
        tree = this._treeModel(data);
        this.tree = tree;
        this._printTree(tree, container, true);
        this._addEvent();
        console.timeEnd('addNode');
    }

    _removeNode(e) {
        console.time('removeNode');
        const container = this.container;
        const parentNode = e.target.parentElement;
        const id = Number(parentNode.getAttribute('id'));
        const sequenceId = Number(parentNode.getAttribute('sequenceId'));
        const input = parentNode.querySelector('input').getAttribute('style');
        const remove = this.remove;
        const removeList = [];
        const removeObj = [];
        const changeObj = [];
        let data = this.data;
        let tree = this.tree;
        let newParentId;
        let newsequenceId;

        const removeTop = (arr, id) => {
            arr.forEach((item) => {
                const itemId = item['id'];
                const children = item['children'];
                let parentId = item['parentId'];

                if ((parentId !== null && itemId === id) || parentId === id) {
                    removeList.push(itemId);
                    removeObj.push(item);

                    if (parentId === id && children) {
                        removeTop(children, item['id']);
                    }
                }

                if (children) {
                    removeTop(children, id);
                }
            });
        };

        if (this._checkNodeOn(e.target)) {
            return;
        }

        (function callee(arr, id, parent = null, child = null) {
            arr.forEach((item) => {
                const itemId = item['id'];
                const parentId = item['parentId'];
                const itemSequenceId = item['sequenceId'];
                const children = item['children'];

                if (parentId !== null && !parent) {
                    if (itemId === id) {
                        newParentId = parent || parentId;
                        newsequenceId = child || id + Number(itemSequenceId);

                        data.forEach((value, idx) => {
                            const valueId = value['id'];

                            if (valueId === itemId) {
                                data.splice(idx, 1);
                                removeObj.push(item);
                            }
                        });
                    } else if (parentId === id) {
                        data.forEach((value) => {
                            const valueId = value['id'];

                            if (valueId === itemId) {
                                newsequenceId =
                                    sequenceId + Number(itemSequenceId);
                                value['parentId'] = newParentId;
                                value['sequenceId'] = newsequenceId;
                                changeObj.push(value);
                            }
                        });
                    } else if (newParentId === parentId) {
                        data.forEach((value) => {
                            const valueId = value['id'];

                            if (valueId === itemId) {
                                value['sequenceId'] = ++newsequenceId;
                                changeObj.push(value);
                            }
                        });
                    }

                    if (parentId === id && children) {
                        callee(children, itemId, itemId, itemSequenceId);
                    }
                } else if (itemId === id) {
                    return removeTop(tree, id);
                }

                if (children && !parent) {
                    callee(children, id);
                }
            });
        })(tree, id);

        if (removeList.length) {
            data = data.filter((item) => !removeList.includes(item['id']));
        }

        tree = this._treeModel(data);
        container.innerHTML = '';
        this.data = data;
        this.tree = tree;
        this._printTree(tree, container);
        this._addEvent();

        if (remove) {
            if (input) {
                --this.id;

                return;
            }

            changeObj.length
                ? remove([{ ...removeObj }, { ...changeObj }])
                : remove({ ...removeObj });
        }

        console.timeEnd('removeNode');
    }

    _moveNode(e, dragged = null) {
        console.time('moveNode');
        const container = this.container;
        const data = this.data;
        const profile = this.profile;
        const draggedParentId = dragged
            ? dragged.getAttribute('parentId')
            : null;
        const draggedId = dragged ? Number(dragged.getAttribute('id')) : null;
        const move = this.move;
        const changeObj = [];
        let tree = this.tree;
        let target = e.target;
        let id;
        let parentId;
        let checkParent;

        (function callee(el) {
            if (el) {
                return el.className !== 'member'
                    ? callee(el.parentElement)
                    : (target = el);
            }
        })(target);

        id = target.getAttribute('id');
        parentId = target.getAttribute('parentId');

        checkParent = (function callee(parent) {
            return data.some((item) => {
                const parentId = item['parentId'];

                if (
                    (draggedParentId === 'null' &&
                        dragged.parentElement.parentElement.querySelector(
                            `input[name=${Object.keys(profile)[0]}${id}]`,
                        )) ||
                    (parent === item['id'] && parent === draggedId)
                ) {
                    return true;
                } else if (parent === item['id'] && parentId) {
                    return callee(parentId);
                }
            });
        })(Number(parentId));

        if (this._checkNodeOn()) {
            return (target.style.background = '');
        }

        if (
            !target ||
            id === draggedId ||
            parentId === draggedId ||
            checkParent ||
            (target !== container && target.className !== 'member')
        ) {
            return (target.style.background = '');
        }

        data.forEach((item) => {
            const sequenceId = data.filter(
                (value) => value['parentId'] === Number(id),
            ).length;

            if (item['id'] === Number(id) || item['parentId'] === Number(id)) {
                return;
            }

            if (item['id'] === Number(draggedId)) {
                item['parentId'] = Number(id);
                item['sequenceId'] = sequenceId;
                changeObj.push(item);

                data.filter(
                    (value) => value['parentId'] === Number(draggedParentId),
                )
                    .sort((a, b) => a['sequenceId'] - b['sequenceId'])
                    .forEach((value, idx) => {
                        if (value['sequenceId'] !== idx) {
                            changeObj.push(value);
                            value['sequenceId'] = idx;
                        }
                    });
            }
        });

        if (changeObj.length) {
            move({ ...changeObj });
        }

        tree = this._treeModel(data);
        container.innerHTML = '';
        this.tree = tree;
        this._printTree(tree, container);
        this._addEvent();
        console.timeEnd('moveNode');
    }

    _addEvent() {
        const addBtns = document.querySelectorAll('.add-btn');
        const removeBtns = document.querySelectorAll('.remove-btn');
        const form = document.querySelectorAll(
            `input[name*=${Object.keys(this.profile)[0]}]`,
        );

        form.forEach((item) => {
            if (item.getAttribute('style')) {
                item.focus();
            }
        });

        addBtns.forEach((item) =>
            item.addEventListener('click', this._addNode.bind(this)),
        );

        removeBtns.forEach((item) =>
            item.addEventListener('click', this._removeNode.bind(this)),
        );

        this._saveEvent();
        this._modifyEvent();
    }

    _saveEvent() {
        const saveBtns = document.querySelectorAll('.save-btn');
        const profile = this.profile;
        const data = this.data;

        saveBtns.forEach((item) => {
            const forms = item.parentElement.querySelectorAll('input');

            item.addEventListener(
                'click',
                function () {
                    const add = this.add;
                    const modify = this.modify;
                    const id = Number(item.parentElement.getAttribute('id'));

                    forms.forEach((value) => {
                        const span = value.previousElementSibling;
                        const form = value.name.replace(/[0-9]/g, '');

                        span.textContent = value.value || profile[form];
                        span.removeAttribute('style');
                        value.removeAttribute('style');
                    });

                    item.style.display = 'none';

                    data.forEach((value) => {
                        if (value['id'] === id) {
                            forms.forEach((val) => {
                                const form = val.name.replace(/[0-9]/g, '');

                                value[form] = val.value || profile[form];
                            });

                            if (item.getAttribute('modified') && modify) {
                                modify(value);
                            } else if (add) {
                                add(value);
                            }
                        }
                    });

                    item.removeAttribute('modified');
                }.bind(this),
            );
        });
    }

    _modifyEvent() {
        const span = document.querySelectorAll('.profile span');

        if (!this.editable) {
            return;
        }

        span.forEach((item) => {
            const parent = item.parentElement.parentElement;
            const saveBtn = parent.parentElement.parentElement.querySelector(
                '.save-btn',
            );

            item.addEventListener(
                'click',
                function (e) {
                    const spans = parent.querySelectorAll('span');
                    const forms = parent.querySelectorAll('input');

                    if (this._checkNodeOn(e.target)) {
                        return;
                    }

                    spans.forEach((value) => (value.style.display = 'none'));

                    forms.forEach((value) => {
                        value.style.display = 'block';
                        value.value = value.previousElementSibling.textContent;
                    });

                    item.nextElementSibling.focus();
                    saveBtn.style.display = 'block';
                    saveBtn.setAttribute('modified', true);
                }.bind(this),
            );
        });
    }

    _moveEvent() {
        const that = this;
        const moveNode = this._moveNode.bind(this);
        let dragged;

        if (!this.editable) {
            return;
        }

        container.addEventListener(
            'dragstart',
            function (e) {
                if (container.style.cursor === 'move') {
                    return;
                }

                dragged = e.target;
                e.target.style.border = '1px solid red';
            }.bind(that),
        );

        container.addEventListener('dragend', function (e) {
            if (container.style.cursor === 'move') {
                return;
            }

            e.target.style.border = '';
        });

        container.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        container.addEventListener('dragenter', function (e) {
            const self = this;

            if (container.style.cursor === 'move') {
                return;
            }

            (function callee(el) {
                if (el) {
                    if (el.className !== 'member') {
                        if (el === self) {
                            el.style.background = 'red';
                        } else {
                            callee(el.parentElement);
                            self.removeAttribute('style');
                        }
                    } else {
                        el.style.background = 'red';
                    }
                }
            })(e.target);
        });

        container.addEventListener('dragleave', function (e) {
            if (container.style.cursor === 'move') {
                return;
            }

            if (e.target.className === 'member' || e.target === this) {
                e.target.removeAttribute('style');
            }
        });

        container.addEventListener('drop', function (e) {
            if (container.style.cursor === 'move') {
                return;
            }

            if (e.target.className === 'member' || e.target === this) {
                e.target.removeAttribute('style');
            }

            moveNode(e, dragged);
            container.style.cursor = 'default';
        });
    }

    _zoomEvent() {
        if (this.useZoom) {
            const containerWrap = document.querySelector('.container-wrap');

            this.container.style.overflow = 'scroll';
            containerWrap.style.transition = 'zoom 0.2s ease';
            containerWrap.style.zoom = this.defaultZoom;

            container.addEventListener(
                'mousewheel',
                function (delta) {
                    if (delta.deltaY === 100 && this.defaultZoom > 0.6) {
                        this.defaultZoom -= 0.05;
                    } else if (
                        delta.deltaY === -100 &&
                        this.defaultZoom < this.zoom
                    ) {
                        this.defaultZoom += 0.05;
                    }

                    containerWrap.style.zoom = this.defaultZoom;
                }.bind(this),
            );
        }
    }

    _treeModel(data) {
        const arr = JSON.parse(JSON.stringify(data));
        const treeNodes = [];

        const traverse = (nodes, item, index) => {
            const itemParentId = item['parentId'];

            if (nodes instanceof Array) {
                return nodes.some((node) => {
                    const nodeId = node['id'];
                    let nodeChildren;

                    if (nodeId === itemParentId) {
                        node['children'] = node['children'] || [];
                        nodeChildren = node['children'];
                        nodeChildren.push(arr.splice(index, 1)[0]);

                        return nodeChildren.sort(
                            (a, b) => a['sequenceId'] - b['sequenceId'],
                        );
                    }

                    return traverse(node['children'], item, index);
                });
            }
        };

        while (arr.length > 0) {
            arr.some((item, index) => {
                if (item['parentId'] === null) {
                    return treeNodes.push(arr.splice(index, 1)[0]);
                }

                return traverse(treeNodes, item, index);
            });
        }

        return treeNodes;
    }

    _printTree(arr, parentNode, added = false) {
        if (parentNode === container) {
            const containerWrap = document.createElement('div');

            containerWrap.className = 'container-wrap';
            parentNode.appendChild(containerWrap);
            parentNode = containerWrap;
        }

        arr.forEach((item, index) => {
            const parent = item['parentId'];
            const children = item['children'];
            const groupColumn = document.createElement('div');
            const lineBox = document.createElement('div');
            const lineLeft = document.createElement('div');
            const lineRight = document.createElement('div');
            const memberBox = document.createElement('div');
            const member = document.createElement('div');
            const profileBox = document.createElement('div');
            const profile = document.createElement('ul');
            const addBtn = document.createElement('button');
            const removeBtn = document.createElement('button');
            const saveBtn = document.createElement('button');
            const id = item['id'];

            groupColumn.className = 'group-column';
            lineBox.className = 'line-box';
            lineLeft.className = 'line';
            lineLeft.classList.add('border-right');
            lineRight.className = 'line';

            if (arr.length !== 1) {
                if (index === 0) {
                    lineRight.classList.add('border-top');
                } else if (index === arr.length - 1) {
                    lineLeft.classList.add('border-top');
                } else {
                    lineLeft.classList.add('border-top');
                    lineRight.classList.add('border-top');
                }
            }

            memberBox.className = 'member-box';
            member.className = 'member';
            member.setAttribute('id', item['id']);
            member.setAttribute('parentId', item['parentId']);
            member.setAttribute('sequenceId', item['sequenceId']);
            profileBox.className = 'profile-box';
            profile.className = 'profile';

            if (this.editable) {
                member.draggable = true;
                addBtn.className = 'add-btn';
                addBtn.innerHTML = '&#43;';
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '&#45;';
                saveBtn.className = 'save-btn';
                saveBtn.innerHTML = '&#10003;';
                saveBtn.style.display = 'none';
            }

            for (const [key, value] of Object.entries(this.profile)) {
                const list = document.createElement('li');
                const form = document.createElement('input');
                const span = document.createElement('span');

                if (this.usePhoto === true && key === 'photo') {
                    const photo = document.createElement('div');
                    const img = document.createElement('img');

                    img.src = item[key] || value;
                    img.draggable = false;
                    photo.appendChild(img);
                    profileBox.appendChild(photo);
                } else {
                    form.type = 'text';
                    form.name = `${key}${id}`;
                    form.placeholder = key;
                    span.textContent = item[key] || value;

                    if (added && id === this.id) {
                        span.style.display = 'none';
                        form.style.display = 'block';
                    }

                    list.appendChild(span);
                    list.appendChild(form);
                    profile.appendChild(list);
                }
            }

            profileBox.appendChild(profile);
            member.appendChild(profileBox);

            if (this.editable) {
                member.appendChild(addBtn);
                member.appendChild(removeBtn);
                member.appendChild(saveBtn);
            }

            memberBox.appendChild(member);
            lineBox.appendChild(lineLeft);
            lineBox.appendChild(lineRight);

            if (added && id === this.id) {
                saveBtn.style.display = 'block';
            }

            if (parent !== null) {
                groupColumn.appendChild(lineBox);
            }

            groupColumn.appendChild(memberBox);

            if (children) {
                const lineBox = document.createElement('div');
                const lineLeft = document.createElement('div');
                const lineRight = document.createElement('div');

                lineBox.className = 'line-box';
                lineLeft.className = 'line';
                lineLeft.classList.add('border-right');
                lineRight.className = 'line';
                lineBox.appendChild(lineLeft);
                lineBox.appendChild(lineRight);
                groupColumn.appendChild(lineBox);
            }

            if (arr.length === 1) {
                parentNode.appendChild(groupColumn);
                parentNode = groupColumn;

                if (children) {
                    this._printTree(children, parentNode, added);
                }
            } else {
                if (index === 0) {
                    const groupRow = document.createElement('div');

                    groupRow.className = 'group-row';
                    groupRow.appendChild(groupColumn);
                    parentNode.appendChild(groupRow);
                    parentNode = groupRow;
                } else {
                    parentNode.appendChild(groupColumn);
                }

                if (children) {
                    this._printTree(children, groupColumn, added);
                }
            }
        });

        this._zoomEvent();
    }

    draw(data, options) {
        const initialData = {
            id: 0,
            name: 'name',
            parentId: null,
            sequenceId: 0,
        };

        const initialProfile = {
            name: 'name',
        };

        const excludedData = [];
        const opts = JSON.parse(JSON.stringify(options));
        let treeData = JSON.parse(JSON.stringify(data));
        let tree;

        if (!treeData) {
            treeData = [initialData];
        } else {
            const arr = [];

            treeData = treeData.sort((a, b) => a['id'] - b['id']);

            treeData.forEach((item, index) => {
                const id = item['id'];
                const parentId = item['parentId'];
                const sequenceId = item['sequenceId'];
                const parentExist = data.some((val) => parentId === val['id']);

                if (
                    !item.hasOwnProperty('id') ||
                    !item.hasOwnProperty('parentId') ||
                    !item.hasOwnProperty('sequenceId') ||
                    typeof id !== 'number' ||
                    (parentId !== null && typeof parentId !== 'number') ||
                    typeof sequenceId !== 'number' ||
                    Number.isNaN(id) ||
                    Number.isNaN(parentId) ||
                    Number.isNaN(sequenceId) ||
                    id === parentId ||
                    (index !== data.length - 1 &&
                        data[index]['id'] === data[++index]['id']) ||
                    (parentId !== null && !parentExist)
                ) {
                    excludedData.push(item);
                } else {
                    arr.push(item);
                }
            });

            treeData = arr;

            if (!treeData.length) {
                treeData = [initialData];
            }
        }

        if (data && treeData.length !== data.length) {
            console.warn(
                "[OrgChart] Warning: Some data items have invalid values or do not have required properties. They were excluded. You'd better check the data.",
            );
        }

        this.usePhoto = opts['usePhoto'];
        this.profile = opts['profile'] || initialProfile;
        this.useZoom = opts['useZoom'] || false;
        this.zoom = opts['zoom'] || opts['zoom'] > 3 ? 3 : opts['zoom'];
        this.editable = opts['editable'] || false;
        this.data = treeData;
        tree = this._treeModel(treeData);
        this.tree = tree;
        this._printTree(tree, container);
        this.id = treeData[treeData.length - 1]['id'];
        this.excludedData = excludedData;
        this._addEvent();
        this._moveEvent();
    }

    add(func) {
        this.add = func;
    }

    remove(func) {
        this.remove = func;
    }

    modify(func) {
        this.modify = func;
    }

    move(func) {
        this.move = func;
    }

    getExcludedData() {
        return this.excludedData;
    }
}
