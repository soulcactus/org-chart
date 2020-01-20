class OrgChart {
    constructor(options) {
        const defaultOptions = {
            data: [
                {
                    id: 0,
                    name: 'administrator',
                    level: 0,
                    parent: null
                }
            ]
        };

        const container = document.querySelector(options['container']);
        let data;
        let tree;

        this.data = options;
        data = this.data;

        !options || !options['data'] || !Object.keys(options).length
            ? (data = defaultOptions['data'])
            : (data = options['data']);

        this.tree = this._treeModel(data);
        tree = this.tree;
        this._printTree(tree, container);
    }

    _treeModel(arr) {
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
            const member = document.createElement('div');
            const add = document.createElement('button');

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

            member.className = 'member';
            member.textContent = item['name'];
            add.className = 'add';
            add.textContent = '추가';
            member.appendChild(add);
            lineBox.appendChild(lineLeft);
            lineBox.appendChild(lineRight);

            if (parent !== null) {
                groupColumn.appendChild(lineBox);
            }

            groupColumn.appendChild(member);

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
        console.log(this.tree);
    }
}

const orgChart = new OrgChart({
    container: '#container',
    data: [
        {
            id: 0,
            name: 'administrator1',
            parentId: null
        },
        {
            id: 1,
            name: 'sibling1',
            parentId: 0
        },
        {
            id: 2,
            name: 'sibling2',
            parentId: 0
        },
        {
            id: 3,
            name: 'sibling3',
            parentId: 0
        },
        {
            id: 4,
            name: 'child1',
            parentId: 1
        },
        {
            id: 5,
            name: 'child2',
            parentId: 1
        },
        {
            id: 6,
            name: 'child3',
            parentId: 1
        },
        {
            id: 7,
            name: 'child5',
            parentId: 3
        },
        {
            id: 8,
            name: 'child6',
            parentId: 3
        },
        {
            id: 9,
            name: 'child4',
            parentId: 1
        },
        {
            id: 10,
            name: 'child7',
            parentId: 9
        },
        {
            id: 11,
            name: 'child8',
            parentId: 9
        }
    ]
});

orgChart.print();
