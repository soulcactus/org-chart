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

    _lineCount(arr) {}

    _printTree(arr, parentNode) {
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
            parentNode.appendChild(groupColumn);
            parentNode = groupColumn;

            if (arr[0]['children']) {
                this._printTree(arr[0]['children'], parentNode);
            }
        } else {
            arr.forEach((item, index) => {
                if (index === 0) {
                    const groupRow = document.createElement('div');
                    const groupColumn = document.createElement('div');
                    const member = document.createElement('div');
                    const add = document.createElement('button');

                    groupRow.className = 'group-row';
                    groupColumn.className = 'group-column';
                    member.className = 'member';
                    member.textContent = item['name'];
                    add.className = 'add';
                    add.textContent = '추가';
                    member.appendChild(add);
                    groupColumn.appendChild(member);
                    groupRow.appendChild(groupColumn);
                    parentNode.appendChild(groupRow);
                    parentNode = groupRow;

                    if (item['children']) {
                        this._printTree(item['children'], groupColumn);
                    }
                } else {
                    const groupColumn = document.createElement('div');
                    const member = document.createElement('div');
                    const add = document.createElement('button');

                    groupColumn.className = 'group-column';
                    member.className = 'member';
                    member.textContent = item['name'];
                    add.className = 'add';
                    add.textContent = '추가';
                    member.appendChild(add);
                    groupColumn.appendChild(member);
                    console.log(parentNode);
                    parentNode.appendChild(groupColumn);

                    if (item['children']) {
                        this._printTree(item['children'], groupColumn);
                    }
                }
            });
        }
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
            name: 'sibling3',
            parentId: 0
        },
        {
            id: 4,
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
