import {VALUE, VALID, EDITABLE, LABEL} from "../kolibri/presentationModel.js";

export { personListItemProjector, personFormProjector }

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    // todo: the label property should be shown as a pop-over on the text element.

    textAttr.getObs(LABEL).onChange(
        label => inputElement.setAttribute("title", label)
    );

};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);

    // todo create the input fields and bind to the attribute props
    const firstnameInputElement = personTextProjector(person.firstname);    
    const lastnameInputElement  = personTextProjector(person.lastname);

    // todo: when a line in the master view is clicked, we have to set the selection

    deleteButton.onclick = _ => masterController.removePerson(person);
    firstnameInputElement.onclick = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onclick = _ => selectionController.setSelectedPerson(person);


    

    selectionController.onPersonSelected(
        selected => selected === person
          ? deleteButton.classList.add("selected")
          : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);

        if (selectionController.getSelectedPerson() === person) {
            selectionController.clearSelection();
        }


        removeMe();
    });
    

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    // todo: what to do with selection when person was added?

    masterController.onPersonAdd((addedPerson, addMe) => {


        selectionController.setSelectedPerson(addedPerson);

        addMe();
    });



};

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    // todo: bind text values

    const firstnameInputElement = divElement.querySelector("#firstname");
    bindTextInput(person.firstname, firstnameInputElement);

    const lastnameInputElement = divElement.querySelector("#lastname");
    bindTextInput(person.lastname, lastnameInputElement);

    // todo: bind label values

    const firstnameLabelElement = divElement.querySelector("label[for=firstname]");
    person.firstname.getObs(LABEL).onChange(label => firstnameLabelElement.innerText = label);

    const lastnameLabelElement = divElement.querySelector("label[for=lastname]");
    person.lastname.getObs(LABEL).onChange(label => lastnameLabelElement.innerText = label);


    rootElement.firstChild.replaceWith(divElement); // react - style ;-)
};
