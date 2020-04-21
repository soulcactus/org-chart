import OrgChart from '../lib/orgChart.js';

const data = [
    {
        id: 0,
        name: 'administrator1',
        tel: '010-1234-5678',
        title: 'CEO',
        parentId: null,
        sequenceId: 0,
    },
    {
        id: 1,
        name: 'sibling1',
        parentId: 0,
        sequenceId: 0,
    },
    {
        id: '2',
        name: 'sibling2',
        parentId: 0,
        sequenceId: 1,
    },
    {
        id: 3,
        name: 'sibling3',
        parentId: 0,
        sequenceId: 1,
    },
    {
        id: 4,
        name: 'child1',
        parentId: 1,
        sequenceId: 0,
    },
    {
        id: 5,
        name: 'child2',
        parentId: 1,
        sequenceId: 2,
    },
    {
        id: 6,
        name: 'child3',
        sequenceId: 0,
    },
    {
        id: 7,
        name: 'child5',
        parentId: 30,
        sequenceId: 0,
    },
    {
        id: 8,
        name: 'child6',
        parentId: 3,
        sequenceId: '0',
    },
    {
        id: 9,
        name: 'child4',
        parentId: 1,
        sequenceId: 1,
    },
    {
        id: 10,
        name: 'child7',
        parentId: 9,
        sequenceId: 0,
    },
    {
        id: 11,
        name: 'child8',
        parentId: 9,
        sequenceId: 1,
    },
    {
        id: 12,
        name: 'child9',
        parentId: 12,
        sequenceId: 0,
    },
];

const orgChart = new OrgChart('#container');

orgChart.draw(data, {
    width: 1600,
    height: 700,
    usePhoto: true,
    profile: {
        name: 'name',
        tel: '000-0000-0000',
        title: 'none',
        photo: './images/profile.png',
    },
    useZoom: true,
    zoom: 10,
    editable: true,
});

orgChart.add((node) => {
    console.log(node);
});

orgChart.remove((node) => {
    console.log(node);
});

orgChart.modify((node) => {
    console.log(node);
});

orgChart.move((node) => {
    console.log(node);
});

console.log(orgChart.getExcludedData());
