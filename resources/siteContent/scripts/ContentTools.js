// Contains the simple methods for helping display the nav menu
class ContentTools {
    
    // Hides or show an element from the nav bar
    static hideOrShowNavBar(element, id) {
        if (element.classList.contains("selected-drop-down")) {
            this.hideOrShow(id);
            element.classList.toggle("selected-drop-down");
            window.sessionStorage.setItem(element.id.replace("drop-down-b", ""), 'false');
        } else {
            if (element.nextElementSibling.classList.contains("hidden-feature")) {
                this.hideOrShow(id);
            } 
            element.classList.toggle("selected-drop-down");
            window.sessionStorage.setItem(element.id.replace("drop-down-b", ""), 'true');
        }

    }

    // Hides or show an element
    static hideOrShow(id, mobile) {
        let element = document.getElementById(id);
        let classString;

        if (mobile === true) {
            classString = "hidden-feature-mob";
        } else if (mobile === false) {
            classString = "hidden-feature-big";
        } else {
            classString = "hidden-feature";
        }

        if (element.classList.contains(classString)) {
            element.classList.remove(classString);
        } else {
            element.classList.add(classString);
        }
    }

    static findAndSetSelectedFromStorage() {
        const allDropDowns = document.querySelectorAll('.drop-down-button');
        allDropDowns.forEach(element => {
            this.setElementSelectedNav(element, element.id.substring(0, element.id.indexOf('drop-down-b')));
        });
    }

    // Sets the nav bar button as selected
    static setElementSelectedNav(element, pageName) {
        if (window.sessionStorage.getItem(pageName) === 'true') {
            element.classList.add('selected-drop-down');
            element.nextElementSibling.classList.remove('hidden-feature');
        } else {
            element.classList.remove('selected-drop-down');
            element.nextElementSibling.classList.add('hidden-feature');
        }
    }
}