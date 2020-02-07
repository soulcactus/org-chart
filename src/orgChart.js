class OrgChart {
    constructor(options) {
        const initialData = {
            id: 0,
            name: 'name',
            parentId: null,
            sequenceId: 0
        };

        const initialProfile = {
            name: 'name'
        };

        const excludedData = [];
        let opts;
        let container;
        let data;
        let tree;

        opts = JSON.parse(JSON.stringify(options));

        if (!opts['data']) {
            data = [initialData];
        } else {
            const arr = [];

            data = opts['data'].sort((a, b) => a['id'] - b['id']);

            data.forEach((item, index) => {
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
                        data[index]['id'] === data[index + 1]['id']) ||
                    (parentId !== null && !parentExist)
                ) {
                    excludedData.push(item);
                } else {
                    arr.push(item);
                }
            });

            data = arr;

            if (!data.length) {
                data = [initialData];
            }
        }

        container = document.querySelector(opts['container']);

        if (data.length !== options['data'].length) {
            console.warn(
                "[OrgChart] Warning: Some data items have invalid values or do not have required properties. They were excluded. You'd better check the data."
            );
        }

        if (!container) {
            return console.error(
                "[OrgChart] Error: 'container' property is null. 'container' property of the OrgChart option must be set."
            );
        }

        this.container = container;
        this.usePhoto = opts['usePhoto'];
        this.profile = opts['profile'] || initialProfile;
        this.data = data;
        this.onAddNode = options['onAddNode'];
        this.onRemoveNode = options['onRemoveNode'];
        this.onModifyNode = options['onModifyNode'];
        tree = this._treeModel(data);
        this.tree = tree;
        this._printTree(tree, container);
        this.id = data[data.length - 1]['id'];
        this.excludedData = excludedData;
        this._addEvent();
        this._moveEvent();
    }

    _checkNode(btn) {
        const className = `input[name*=${Object.keys(this.profile)[0]}]`;
        const form = document.querySelectorAll(className);

        const checkNode = Array.from(form).some((item) => {
            if (!item.getAttribute('style')) {
                item.focus();
            }

            return !item.getAttribute('style');
        });

        return btn &&
            !btn.parentNode.querySelector(className).getAttribute('style')
            ? false
            : checkNode;
    }

    _addNode(e) {
        console.time('addNode');
        const container = this.container;
        const data = this.data;
        const id = ++this.id;
        const parentId = Number(e.target.parentNode.getAttribute('id'));
        let tree = this.tree;
        let obj = {};

        if (this._checkNode()) {
            return;
        }

        obj['id'] = id;
        obj['parentId'] = parentId;
        obj['sequenceId'] = id;

        for (const [key, value] of Object.entries(this.profile)) {
            obj[key] = value;
        }

        data.push(obj);

        tree = this._treeModel(data);
        container.innerHTML = '';
        this.tree = tree;
        this._printTree(tree, container, true);
        this._addEvent();
        console.timeEnd('addNode');
    }

    _removeNode(e) {
        console.time('removeNode');
        const container = this.container;
        const id = Number(e.target.parentNode.getAttribute('id'));
        const onRemoveNode = this.onRemoveNode;
        let data = this.data;
        let tree = this.tree;
        let removeList = [];
        let newParentId;
        let newsequenceId;
        let removeObj = [];
        let changeObj = [];

        if (this._checkNode(e.target)) {
            return;
        }

        const removeTop = (arr, id) => {
            arr.forEach((item) => {
                if (
                    (item['parentId'] !== null && item['id'] === id) ||
                    item['parentId'] === id
                ) {
                    removeList.push(item['id']);
                    removeObj.push(item);

                    if (item['parentId'] === id && item['children']) {
                        removeTop(item['children'], item['id']);
                    }
                }

                if (item['children']) {
                    removeTop(item['children'], id);
                }
            });
        };

        const remove = (arr, id, parent = null, child = null) => {
            arr.forEach((item) => {
                if (item['parentId'] !== null && !parent) {
                    if (item['id'] === id) {
                        newParentId = parent || item['parentId'];
                        newsequenceId = child || item['sequenceId'];

                        data.forEach((value, idx) => {
                            if (value['id'] === item['id']) {
                                data.splice(idx, 1);
                                removeObj.push(item);
                            }
                        });
                    } else if (item['parentId'] === id) {
                        data.forEach((value) => {
                            if (value['id'] === item['id']) {
                                value['parentId'] = newParentId;
                                value['sequenceId'] = newsequenceId;
                                changeObj.push(value);
                            }
                        });
                    }

                    if (item['parentId'] === id && item['children']) {
                        remove(
                            item['children'],
                            item['id'],
                            item['id'],
                            item['sequenceId']
                        );
                    }
                } else if (item['id'] === id) {
                    return removeTop(tree, id);
                }

                if (item['children'] && !parent) {
                    remove(item['children'], id);
                }
            });
        };

        remove(tree, id);

        if (removeList.length) {
            data = data.filter((item) => !removeList.includes(item['id']));
        }

        tree = this._treeModel(data);
        container.innerHTML = '';
        this.data = data;
        this.tree = tree;
        this._printTree(tree, container);
        this._addEvent();

        if (onRemoveNode) {
            console.log('삭제');

            changeObj.length
                ? onRemoveNode([{ ...removeObj }, { ...changeObj }])
                : onRemoveNode([...removeObj]);
        }

        console.timeEnd('removeNode');
    }

    _moveNode(e, dragged = null) {
        console.time('moveNode');
        const container = this.container;
        const data = this.data;
        const profile = this.profile;
        let tree = this.tree;
        let sequenceId;
        let target = e.target;

        const findTarget = (el) => {
            if (el) {
                return el.className !== 'member'
                    ? findTarget(el.parentNode)
                    : (target = el);
            }
        };

        findTarget(target);

        if (this._checkNode()) {
            return (target.style.background = '');
        }

        const checkParent = (function callee(parent) {
            const draggedId = Number(dragged.getAttribute('id'));

            return data.some((item) => {
                const parentId = item['parentId'];

                if (
                    (dragged.getAttribute('parentId') === 'null' &&
                        dragged.parentNode.parentNode.querySelector(
                            `input[name=${
                                Object.keys(profile)[0]
                            }${target.getAttribute('id')}]`
                        )) ||
                    (parent === item['id'] && parent === draggedId)
                ) {
                    return true;
                } else if (parent === item['id'] && parentId) {
                    return callee(parentId);
                }
            });
        })(Number(target.getAttribute('parentId')));

        if (
            !target ||
            target.getAttribute('id') === dragged.getAttribute('id') ||
            target.getAttribute('parentId') === dragged.getAttribute('id') ||
            checkParent
        ) {
            return (target.style.background = '');
        }

        data.forEach((item) => {
            if (item['parentId'] === Number(target.getAttribute('id'))) {
                sequenceId = item['sequenceId'];
            }
        });

        data.forEach((item) => {
            if (item['id'] === Number(dragged.getAttribute('id'))) {
                item['parentId'] = Number(target.getAttribute('id'));
                item['sequenceId'] = sequenceId + 1;
            }
        });

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
            `input[name*=${Object.keys(this.profile)[0]}]`
        );

        form.forEach((item) => {
            if (!item.getAttribute('style')) {
                item.focus();
            }
        });

        addBtns.forEach((item) =>
            item.addEventListener('click', this._addNode.bind(this))
        );

        removeBtns.forEach((item) =>
            item.addEventListener('click', this._removeNode.bind(this))
        );

        this._saveEvent();
        this._modifyEvent();
    }

    _saveEvent() {
        const saveBtns = document.querySelectorAll('.save-btn');
        const profile = this.profile;
        const data = this.data;
        const onAddNode = this.onAddNode;
        const onModifyNode = this.onModifyNode;

        saveBtns.forEach((item) => {
            const forms = item.parentNode.querySelectorAll('input');

            item.addEventListener('click', function() {
                const id = Number(item.parentNode.getAttribute('id'));

                forms.forEach((value) => {
                    const span = value.previousElementSibling;
                    const form = value.name.replace(/[0-9]/g, '');

                    span.textContent = value.value || profile[form];
                    span.style.display = 'block';
                    value.style.display = 'none';
                });

                item.style.display = 'none';

                if (item.getAttribute('modified') && onModifyNode) {
                    console.log('수정', id);
                    data.forEach((value) => {
                        if (value['id'] === id) {
                            onModifyNode(value);
                        }
                    });
                } else if (onAddNode) {
                    console.log('추가');
                    data.forEach((value) => {
                        if (value['id'] === id) {
                            onAddNode(value);
                        }
                    });
                }

                item.removeAttribute('modified');
            });
        });
    }

    _modifyEvent() {
        const span = document.querySelectorAll('.profile span');

        span.forEach((item) => {
            const parent = item.parentNode.parentNode;
            const saveBtn = parent.parentNode.parentNode.querySelector(
                '.save-btn'
            );

            item.addEventListener('click', function() {
                const spans = parent.querySelectorAll('span');
                const forms = parent.querySelectorAll('input');

                spans.forEach((value) => (value.style.display = 'none'));

                forms.forEach((value) => {
                    value.style.display = 'block';
                    value.value = value.previousElementSibling.textContent;
                });

                item.nextElementSibling.focus();
                saveBtn.style.display = 'block';
                saveBtn.setAttribute('modified', true);
            });
        });
    }

    _moveEvent() {
        const that = this;
        const moveNode = this._moveNode.bind(this);
        let dragged;

        container.addEventListener(
            'dragstart',
            function(e) {
                dragged = e.target;
                e.target.style.border = '1px solid red';
            }.bind(that)
        );

        container.addEventListener('dragend', function(e) {
            e.target.style.border = '';
        });

        container.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        container.addEventListener('dragenter', function(e) {
            const bgColor = (el) => {
                if (el) {
                    return el.className !== 'member'
                        ? bgColor(el.parentNode)
                        : (el.style.background = 'red');
                }
            };

            bgColor(e.target);
        });

        container.addEventListener('dragleave', function(e) {
            if (e.target.className === 'member') {
                e.target.style.background = '';
            }
        });

        container.addEventListener('drop', function(e) {
            moveNode(e, dragged);
        });
    }

    _treeModel(data) {
        const arr = JSON.parse(JSON.stringify(data));
        const treeNodes = [];

        const traverse = (nodes, item, index) => {
            if (nodes instanceof Array) {
                return nodes.some((node) => {
                    if (node['id'] === item['parentId']) {
                        node['children'] = node['children'] || [];
                        node['children'].push(arr.splice(index, 1)[0]);

                        return node['children'].sort(
                            (a, b) => a['sequenceId'] - b['sequenceId']
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
            member.draggable = true;
            member.setAttribute('id', item['id']);
            member.setAttribute('parentId', item['parentId']);
            member.setAttribute('sequenceId', item['sequenceId']);
            profileBox.className = 'profile-box';
            profile.className = 'profile';
            addBtn.className = 'add-btn';
            addBtn.innerHTML = '&#43;';
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&#45;';
            saveBtn.className = 'save-btn';
            saveBtn.innerHTML = '&#10003;';
            saveBtn.style.display = 'none';

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
                    form.name = `${key}${item['id']}`;
                    form.placeholder = key;
                    span.textContent = item[key] || value;
                    added && item['id'] === this.id
                        ? (span.style.display = 'none')
                        : (form.style.display = 'none');
                    list.appendChild(span);
                    list.appendChild(form);
                    profile.appendChild(list);
                }
            }

            profileBox.appendChild(profile);
            member.appendChild(profileBox);
            member.appendChild(addBtn);
            member.appendChild(removeBtn);
            member.appendChild(saveBtn);
            memberBox.appendChild(member);
            lineBox.appendChild(lineLeft);
            lineBox.appendChild(lineRight);

            if (added && item['id'] === this.id) {
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
    }

    printData() {
        console.log(this.data);
    }

    printTree() {
        console.log(this.tree);
    }

    printExcludedData() {
        console.log(this.excludedData);
    }
}

const orgChart = new OrgChart({
    container: '#container',
    usePhoto: true,
    profile: {
        name: 'name',
        tel: '000-0000-0000',
        title: 'none',
        photo: './images/profile.png'
    },
    data: [
        {
            id: 0,
            name: 'administrator1',
            tel: '010-1234-5678',
            title: 'CEO',
            parentId: null,
            sequenceId: 0
        },
        {
            id: 1,
            name: 'sibling1',
            parentId: 0,
            sequenceId: 0
        },
        {
            id: '2',
            name: 'sibling2',
            parentId: 0,
            sequenceId: 1
        },
        {
            id: 3,
            name: 'sibling3',
            parentId: 0,
            sequenceId: 2
        },
        {
            id: 4,
            name: 'child1',
            parentId: 1,
            sequenceId: 0
        },
        {
            id: 5,
            name: 'child2',
            parentId: 1,
            sequenceId: 1
        },
        {
            id: 6,
            name: 'child3',
            sequenceId: 0
        },
        {
            id: 7,
            name: 'child5',
            parentId: 30,
            sequenceId: 0
        },
        {
            id: 8,
            name: 'child6',
            parentId: 3,
            sequenceId: '0'
        },
        {
            id: 9,
            name: 'child4',
            parentId: 1,
            sequenceId: 0
        },
        {
            id: 10,
            name: 'child7',
            parentId: 9,
            sequenceId: 1
        },
        {
            id: 11,
            name: 'child8',
            parentId: 9,
            sequenceId: 2
        },
        {
            id: 12,
            name: 'child9',
            parentId: 12,
            sequenceId: 0
        }
    ],
    onAddNode: function(node) {
        console.log(node);
    },
    onRemoveNode: function(node) {
        console.log(node);
    },
    onModifyNode: function(node) {
        console.log(node);
    }
});

orgChart.printData();
