'use strict';

const frm = document.querySelector('#mediaform');
const img = document.querySelector('#image');
const aud = document.querySelector('#aud');
const vid = document.querySelector('#vid');

const sendForm = (evt) => {
  evt.preventDefault();
  const fd = new FormData(frm);
  const settings = {
    method: 'post',
    mode : 'no-cors',
    body: fd,
  };

  fetch('/upload', settings)
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    console.log(json);
    showImages(json);
    /*if (json.mimeType.includes('image')) {
      img.src = json.url;
    } else if (json.mimeType.includes('audio')) {
      aud.src = json.url;
    } else {
      vid.src = json.url;
    }*/
  })
};

const allmediaBtn = document.getElementById("getallmedia");

const getAllMedia = (event) =>{
  event.preventDefault();
  fetch('/media')
  .then((response) => {
    //console.log('Sending : '+ response);
    return response.json();
  })
  .then((json) => {
    console.log(json);
    showImages(json);
    /*if (json.mimeType.includes('image')) {
      img.src = json.url;
    } else if (json.mimeType.includes('audio')) {
      aud.src = json.url;
    } else {
      vid.src = json.url;
    }*/
  })
};

allmediaBtn.addEventListener('click', getAllMedia);

frm.addEventListener('submit', sendForm);

const createNode = (element) => {
  return document.createElement(element); // Create the type of element you pass in the parameters
};

const append = (parentElement, childElement) => {
  return parentElement.appendChild(childElement); // Append the second parameter(element) to the first one
};

const showImages = (jsonObj) => {
  const ul = document.querySelector('#imagelist');

  jsonObj.map( (image) => {
    let li          = createNode('li'),
        figure      = createNode('figure'),
        a           = createNode('a'),
        img         = createNode('img'),
        figcaption  = createNode('figcaption'),
        h3          = createNode('h3'),
        h2category  = createNode('h2'),
        h2detail    = createNode('h2'),
        outerdiv    = createNode('div'),
        updatebutton = createNode('button'),
        dropdowndiv  = createNode('div'),
        category    = createNode('a'),
        title       = createNode('a'),
        deletpost   = createNode('a'),
        inputfield  = createNode('input'),
        details     = createNode('a');

    updatebutton.innerText = `Update`;
    updatebutton.classList.add('dropbtn');
    outerdiv.classList.add('dropdown');
    updatebutton.onclick = togglemenu;
    var mID = 'mID';
    updatebutton.id = `button${image[mID]}`;//"button +${image.mid.toString()}; //`${image.title}`
    inputfield.id = `inputfield${image[mID]}`;
    inputfield.setAttribute('name',"updatetext");
    category.className = `${image[mID]}`;
    title.className = `${image[mID]}`;
    details.className = `${image[mID]}`;
    deletpost.className = `${image[mID]}`;

    dropdowndiv.id ='myDropdown';
    dropdowndiv.classList.add('dropdown-content');
    deletpost.onclick = deletepost;
    category.onclick = update;
    title.onclick = update;
    details.onclick = update;

    deletpost.innerText = `Delete Post`;
    category.innerText = `Change Category`;
    title.innerText = `Change Title`;
    details.innerText = `Change Details`;
    img.src = "thumbs/"+ image.thumbnail;
    a.href = "uploads/"+ image.original;
    h3.innerText = `${image.title}`;
    h2category.innerText = `${image.category}`;
    h2detail.innerText = `${image.details}`;
    append(figcaption, h2detail);
    append(figcaption, h2category);
    append(figcaption, h3);
    append(a , img);
    append(figure, a);
    append(figure, figcaption);
    append(li, figure);
    append(dropdowndiv, category);
    append(dropdowndiv, title);
    append(dropdowndiv, details);
    append(dropdowndiv, deletpost);
    append(outerdiv, inputfield);

    append(outerdiv, updatebutton);
    append(outerdiv, dropdowndiv);

    append(li, outerdiv);
    append(li, updatebutton);
    append(ul, li);
  })
};

window.onclick = (event) => {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

const togglemenu = (evt) => {
  //console.log(evt);
  //console.log(evt.target.parentElement.querySelector('.dropdown .dropdown-content'));
  const dd = evt.target.parentElement.querySelector('.dropdown .dropdown-content');
  dd.classList.toggle("show");
};

const update = (event) => {
  //console.log(event.srcElement.className);
  let mID = event.srcElement.className;
  let textToUpdate = event.target.parentElement.parentElement.querySelector('input[name="updatetext"]').value;
  let data = null;
  let column = null;
  if (event.srcElement.innerText === "Change Category")
  {
    //console.log("Change the Category column");
    column = 'category';
  } else if (event.srcElement.innerText === "Change Title")
  {
    //console.log("Change the Title column");
    column = 'title';
  }
  else
  {
    //console.log("Change the Details column");
    column = 'details';

  }

  data = JSON.stringify([
    column,
    textToUpdate,
    mID
  ]);
  console.log(data);

  let request = new Request('/media/update', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json; charset=utf-8' },
    body: data
  } );

  fetch(request)
  .then( (responce) => {
    return responce.json();
  })
  .then( (json) => {
    console.log(json);
  });
};

const deletepost = (event) => {
  let mID = event.srcElement.className;
  let data = null;
  data = JSON.stringify({mid: mID});
  console.log(data);

  fetch('/media', {
    method: 'delete',
    headers: {'Content-Type': 'application/json'},
    body: data

  });

};