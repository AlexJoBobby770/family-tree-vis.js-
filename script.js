const familygraph={
    nodes:new vis.DataSet([]),
    edges:new vis.DataSet([])
};

const container=document.getElementById('family-tree');
const data={
    nodes:familygraph.nodes,
    edges:familygraph.edges
}

const options={
    nodes:{
        shape:'box',
        font:{size:14},
        borderWidth:2,
        shadow:true,
        margin:10
    },
    edges:{
    width: 2,
    smooth: {type: 'continuous'}
    },
      physics: {
    stabilization: {
      enabled: true,
      iterations: 1000
    }
  }
};

const network=new vis.Network(container,data,options);

const addButton = document.getElementById('add-person-btn');
addButton.addEventListener('click', function() {
  
  const nameInput = document.getElementById('name-input');
  const name = nameInput.value.trim(); 
  
  const genderSelect = document.getElementById('gender-select');
  const gender = genderSelect.value; 
  
  
  if (name === '') {
    alert("Please enter a name!");
    return; 
  }
  
  const newPersonId = addPerson(name, gender);
  

  network.fit();   // something in vis to zoom
});



function addPerson(name,gender)
{
    const newid=familygraph.nodes.length+1;
    person={id:newid,
        label:name,
        gender:gender,
         color: gender === 'male' ? {
            background: '#d0ebff',
            border: '#2B7CE9'
        } : {
            background: '#f8e0f3', 
            border: '#E92B7C'
        }
    }
    familygraph.nodes.add(person);
    return newid;
}
function addrelationships(fromid,toid,type){
    const newrltn={
        from:fromid,
        to:toid,
        type:type,
        color: type === 'spouse' ? 'red' : '#848484',
        dashes: type === 'spouse'
    }
    familygraph.edges.add(newrltn);
}