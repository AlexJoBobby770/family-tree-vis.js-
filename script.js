const familygraph = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};

const container = document.getElementById('family-tree');
const data = {
    nodes: familygraph.nodes,
    edges: familygraph.edges
};

const options = {
    nodes: {
        shape: 'box',
        font: { size: 14 },
        borderWidth: 2,
        shadow: true,
        margin: 10,
        widthConstraint: { maximum: 150 }
    },
    edges: {
        width: 2,
        smooth: {
            enabled: true,
            type: 'straight',
            roundness: 0.2
        },
        arrows: { to: { enabled: false } }
    },
    physics: {
        stabilization: {
            enabled: true,
            iterations: 1000
        },
        hierarchicalRepulsion: {
            nodeDistance: 150,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.01,
            damping: 0.09
        }
    },
    layout: {
        hierarchical: {
            direction: "UD",
            sortMethod: "directed",
            nodeSpacing: 200,
            levelSeparation: 150,
            shakeTowards: "leaves",
            parentCentralization: false
        }
    }
};
function addRelationship(fromId, toId, type) {
    const exists = familygraph.edges.get({
        filter: edge =>
            (edge.from === fromId && edge.to === toId) ||
            (edge.from === toId && edge.to === fromId)
    }).length > 0;

    if (!exists) {
        familygraph.edges.add({
            from: fromId,
            to: toId,
            type: type,
            color: type === 'spouse' ? '#ff6b6b' : '#495057',
            dashes: type === 'spouse',
            width: type === 'spouse' ? 3 : 2
        });

        if (type === 'spouse') {
            const fromNode = familygraph.nodes.get(fromId);
            const toNode = familygraph.nodes.get(toId);
            const level = fromNode.level !== undefined ? fromNode.level : 0;
            familygraph.nodes.update([
                { id: fromId, level: level },
                { id: toId, level: level }
            ]);
        }
    }
}
const network = new vis.Network(container, data, options);

network.once("stabilized", () => {
    network.setOptions({ physics: { enabled: false } });
});

if (familygraph.nodes.length === 0) {
    addPerson("First Person", "male");
}

document.getElementById('add-person-btn').addEventListener('click', function () {
    const name = document.getElementById('name-input').value.trim();
    const gender = document.getElementById('gender-select').value;
    const relation = document.getElementById('relation-select').value;
    const relatedName = document.getElementById('parent-name-input').value.trim();

    if (!name) {
        alert("Please enter a name");
        return;
    }
    if (!relatedName && relation !== 'root') {
        alert(`Please enter the ${relation === 'child' ? "parent's" : "spouse's"} name`);
        return;
    }

    const relatedNode = relatedName ? findNodeByName(relatedName) : null;
    if (relatedName && !relatedNode) {
        alert("Related person not found!");
        return;
    }

    const newPersonId = addPerson(name, gender);

    if (relation === 'child' && relatedNode) {
        const parentLevel = relatedNode.level !== undefined ? relatedNode.level : 0;
        familygraph.nodes.update({ id: newPersonId, level: parentLevel + 1 });
        addRelationship(relatedNode.id, newPersonId, 'child');
        const spouseEdge = familygraph.edges.get({
            filter: edge =>
                (edge.from === relatedNode.id || edge.to === relatedNode.id) &&
                edge.type === 'spouse'
        })[0];

        if (spouseEdge) {
            const spouseId = spouseEdge.from === relatedNode.id ? spouseEdge.to : spouseEdge.from;
            addRelationship(spouseId, newPersonId, 'child');
        }
    }
    else if (relation === 'spouse' && relatedNode) {
        addRelationship(relatedNode.id, newPersonId, 'spouse');
    }
    document.getElementById('name-input').value = '';
    document.getElementById('parent-name-input').value = '';
    network.fit();
});
function addPerson(name, gender) {
    const newId = Date.now();
    familygraph.nodes.add({
        id: newId,
        label: name,
        gender: gender,
        level: 0, 
        color: gender === 'male' ? {
            background: '#d0ebff',
            border: '#2B7CE9'
        } : {
            background: '#f8e0f3',
            border: '#E92B7C'
        }
    });
    return newId;
}
function findNodeByName(name) {
    const matches = familygraph.nodes.get({
        filter: node => node.label === name
    });
    return matches[0];
}

network.on("doubleClick", function (params) {
    if (params.nodes.length === 1) {
        const node = familygraph.nodes.get(params.nodes[0]);
        const newName = prompt("Edit name:", node.label);
        if (newName) {
            familygraph.nodes.update({
                id: node.id,
                label: newName.trim()
            });
        }
    }
});
let selectedNodeId = null;
network.on("selectNode", function (params) {
    selectedNodeId = params.nodes[0];
});
document.getElementById('delete-btn').addEventListener('click', function () {
    if (!selectedNodeId) {
        alert("Please click on a person first");
        return;
    }
    if (confirm("Delete this person and their relationships?")) {
        familygraph.nodes.remove(selectedNodeId);
        const edgesToRemove = familygraph.edges.get({
            filter: edge => edge.from === selectedNodeId || edge.to === selectedNodeId
        });
        familygraph.edges.remove(edgesToRemove.map(e => e.id));
        selectedNodeId = null;
    }
});
