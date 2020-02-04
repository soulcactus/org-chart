class OrgChart {
    constructor(options) {
        const initialData = {
            id: 0,
            name: 'name',
            parentId: null,
        };

        const initialProfile = {
            name: 'name',
        };

        let opts;
        let container;
        let data;
        let tree;

        opts = JSON.parse(JSON.stringify(options));

        if (!opts['data']) {
            data = [initialData];
        } else {
            data = opts['data'].sort((a, b) => a['id'] - b['id']);

            data.forEach((item, index) => {
                if (
                    !item.hasOwnProperty('id') ||
                    !item.hasOwnProperty('parentId') ||
                    typeof item['id'] !== 'number' ||
                    typeof item['parentId'] !== 'number' ||
                    Number.isNaN(item['id']) ||
                    Number.isNaN(item['parentId'])
                ) {
                    data.splice(index, 1);
                }

                if (
                    index !== data.length - 1 &&
                    data[index]['id'] === data[index + 1]['id']
                ) {
                    data.splice(index, 1);
                }

                if (
                    item['parentId'] !== null &&
                    !data.some((val) => item['parentId'] === val['id'])
                ) {
                    data.splice(index, 1);
                }
            });

            if (!data.length) {
                data = [initialData];
            }
        }

        container = document.querySelector(opts['container']);

        if (!container) {
            return console.error(
                "[OrgChart] Error: 'container' property is null. 'container' property of the OrgChart option must be set.",
            );
        }

        if (data.length !== options['data'].length) {
            console.warn(
                "[OrgChart] Warning: Some data items have invalid values or do not have required properties. They were excluded. You'd better check the data.",
            );
        }

        tree = this._treeModel(data);
        this.usePhoto = opts['usePhoto'];
        this.profile = opts['profile'] || initialProfile;
        this._printTree(tree, container);
        this.container = container;
        this.data = data;
        this.tree = tree;
        this.id = data[data.length - 1]['id'];
        this._addEvent();
    }

    _addNode(e) {
        console.time('addNode');
        const container = this.container;
        const data = this.data;
        const id = ++this.id;
        const parentId = Number(e.target.parentNode.getAttribute('data-value'));
        let tree = this.tree;
        let obj = {};

        obj['id'] = id;
        obj['parentId'] = parentId;

        for (const [key, value] of Object.entries(this.profile)) {
            obj[key] = value;
        }

        data.push(obj);
        tree = this._treeModel(data);
        container.innerHTML = '';
        this.tree = tree;
        this._printTree(tree, container);
        this._addEvent();
        console.timeEnd('addNode');
    }

    _removeNode(e) {
        console.time('removeNode');
        const container = this.container;
        const id = Number(e.target.parentNode.getAttribute('data-value'));
        let data = this.data;
        let tree = this.tree;
        let list = [];

        const searchTree = (arr, id) => {
            arr.forEach((item) => {
                if (
                    (item['parentId'] !== null && item['id'] === id) ||
                    item['parentId'] === id
                ) {
                    list.push(item['id']);

                    if (item['parentId'] === id && item['children']) {
                        searchTree(item['children'], item['id']);
                    }
                }

                if (item['children']) {
                    searchTree(item['children'], id);
                }
            });

            return list;
        };

        list = searchTree(tree, id);
        data = data.filter((item) => !list.includes(item['id']));
        tree = this._treeModel(data);
        container.innerHTML = '';
        this.data = data;
        this.tree = tree;
        this._printTree(tree, container);
        this._addEvent();
        console.timeEnd('removeNode');
    }

    _addEvent() {
        const addBtns = document.querySelectorAll('.add-btn');
        const removeBtns = document.querySelectorAll('.remove-btn');

        addBtns.forEach((item) =>
            item.addEventListener('click', this._addNode.bind(this)),
        );

        removeBtns.forEach((item) =>
            item.addEventListener('click', this._removeNode.bind(this)),
        );
    }

    _treeModel(data) {
        const arr = JSON.parse(JSON.stringify(data));
        const treeNodes = [];

        const traverse = (nodes, item, index) => {
            if (nodes instanceof Array) {
                return nodes.some((node) => {
                    if (node['id'] === item['parentId']) {
                        node['children'] = node['children'] || [];

                        return node['children'].push(arr.splice(index, 1)[0]);
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

    _printTree(arr, parentNode) {
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
            member.setAttribute('data-value', item['id']);
            profileBox.className = 'profile-box';
            profile.className = 'profile';
            addBtn.className = 'add-btn';
            addBtn.innerHTML = '&#43;';
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&#45;';

            for (const [key, value] of Object.entries(this.profile)) {
                const list = document.createElement('li');

                if (this.usePhoto === true && key === 'photo') {
                    const photo = document.createElement('div');
                    const img = document.createElement('img');

                    img.src = item[key] || value;
                    photo.appendChild(img);
                    profileBox.appendChild(photo);
                } else {
                    list.contentEditable = true;
                    list.textContent = item[key] || value;
                    profile.appendChild(list);
                }
            }

            profileBox.appendChild(profile);
            member.appendChild(profileBox);
            member.appendChild(addBtn);
            member.appendChild(removeBtn);
            memberBox.appendChild(member);
            lineBox.appendChild(lineLeft);
            lineBox.appendChild(lineRight);

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
                    this._printTree(children, parentNode);
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
                    this._printTree(children, groupColumn);
                }
            }
        });
    }

    print() {
        console.log(this.data);
        console.log(this.tree);
    }
}

const orgChart = new OrgChart({
    container: '#container',
    usePhoto: true,
    profile: {
        name: 'name',
        tel: '000-0000-0000',
        title: 'none',
        photo: './images/profile.png',
    },
    data: [
        {
            id: 0,
            name: 'administrator2',
            parentId: null,
        },
        {
            id: 0,
            name: 'administrator1',
            tel: '010-1234-5678',
            title: 'CEO',
            parentId: null,
        },
        {
            id: 1,
            name: 'sibling1',
            parentId: 0,
        },
        {
            id: 2,
            name: 'sibling2',
            parentId: 0,
        },
        {
            id: 3,
            name: 'sibling3',
            parentId: 0,
        },
        {
            id: 4,
            name: 'child1',
            parentId: 1,
        },
        {
            id: 5,
            name: 'child2',
            parentId: 1,
        },
        {
            id: 6,
            name: 'child3',
        },
        {
            id: 7,
            name: 'child5',
            parentId: 30,
        },
        {
            id: 8,
            name: 'child6',
            parentId: 3,
        },
        {
            id: 9,
            // name: 'child4',
            parentId: 1,
        },
        {
            id: 10,
            name: 'child7',
            parentId: 9,
        },
        {
            id: 11,
            name: 'child8',
            parentId: 9,
        },
    ],
});

orgChart.print();

console.log('??');
