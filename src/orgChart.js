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
            name: 'sibling',
            parentId: 0
        },
        {
            id: 2,
            name: 'sibling',
            parentId: 0
        },
        {
            id: 3,
            name: 'child',
            parentId: 2
        }
    ]
});

orgChart.print();
