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

        data.forEach((item, index) => {
            const children = item['children'];
            const container = document.querySelector(options['container']);
            const member = document.createElement('div');
            const name = document.createElement('p');
            const createChild = document.createElement('button');
            const removeNode = document.createElement('button');
            let groupColumn;

            member.className = 'member';
            name.textContent = item['name'];
            createChild.type = 'button';
            createChild.textContent = '추가';
            createChild.className = 'create-btn';
            removeNode.type = 'button';
            removeNode.textContent = '삭제';
            removeNode.className = 'remove-btn';
            member.appendChild(name);
            member.appendChild(createChild);
            member.appendChild(removeNode);
            groupColumn = document.createElement(`div`);
            groupColumn.className = 'group-column';
            groupColumn.appendChild(member);
            container.appendChild(groupColumn);
        });
    }

    print() {
        console.log(this.data);
    }
}

const orgChart = new OrgChart({
    container: '#container',
    data: [
        {
            name: 'administrator',
            children: [
                {
                    name: 'sibling'
                },
                {
                    name: 'sibling',
                    children: {
                        name: 'child'
                    }
                }
            ]
        }
    ]
});

orgChart.print();
