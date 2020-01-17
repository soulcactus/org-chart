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

        let data;

        this.data = options;
        data = this.data;

        !options || !options['data'] || !Object.keys(options).length
            ? (data = defaultOptions['data'])
            : (data = options['data']);

        this.tree = this._treeModel(data);
        document
            .querySelector(options['container'])
            .appendChild(this._printTree(this.tree));
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

    _printTree(arr) {
        let column;
        let row;

        const print = (arr, elements) => {
            console.log(arr);

            if (arr.length === 1) {
                const groupColumn = document.createElement('div');
                const member = document.createElement('div');
                const add = document.createElement('button');

                groupColumn.className = 'group-column';
                member.className = 'member';
                member.textContent = arr[0]['name'];
                add.className = 'add';
                add.textContent = '추가';
                member.appendChild(add);
                groupColumn.appendChild(member);

                if (!elements) {
                    elements = groupColumn;
                } else {
                    column.appendChild(groupColumn);
                }

                if (arr[0]['children']) {
                    return print(arr[0]['children'], groupColumn);
                }
            } else {
                arr.some((item, index) => {
                    const groupColumn = document.createElement('div');
                    const member = document.createElement('div');
                    const add = document.createElement('button');

                    if (index === 0) {
                        const groupRow = document.createElement('div');

                        groupRow.className = 'group-row';
                        groupColumn.className = 'group-column';
                        member.className = 'member';
                        member.textContent = item['name'];
                        add.className = 'add';
                        add.textContent = '추가';
                        member.appendChild(add);
                        groupColumn.appendChild(member);
                        groupRow.appendChild(groupColumn);

                        if (!elements) {
                            elements = groupRow;
                        } else {
                            elements.appendChild(groupRow);
                        }

                        row = groupRow;
                        column = groupColumn;
                    } else {
                        groupColumn.className = 'group-column';
                        member.className = 'member';
                        member.textContent = item['name'];
                        add.className = 'add';
                        add.textContent = '추가';
                        member.appendChild(add);
                        groupColumn.appendChild(member);

                        if (!elements) {
                            elements.appendChild(groupColumn);
                        } else {
                            column.appendChild(groupColumn);
                        }
                    }

                    if (item['children']) {
                        return print(item['children'], row);
                    }
                });
            }

            return elements;
        };

        return print(arr);
    }

    print() {
        console.log(this._printTree(this.tree));
        console.log(this.tree);
    }
}

const orgChart = new OrgChart({
    container: '#container',
    data: [
        {
            id: 0,
            name: 'administrator',
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
            name: 'child1',
            parentId: 2
        },
        {
            id: 4,
            name: 'child2',
            parentId: 2
        }
    ]
});

orgChart.print();
