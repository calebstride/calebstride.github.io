// Contains the simple methods for helping display the nav menu
class ContentTools {
    
    // Hides or show an element from the nav bar
    static hideOrShowNavBar(element, id) {
        if (element.classList.contains("selectedDD")) {
            this.hideOrShow(id);
            element.classList.toggle("selectedDD");
            window.sessionStorage.setItem(element.id.replace("DropDownB", ""), 'false');
        } else {
            if (element.nextElementSibling.classList.contains("hiddenFeature")) {
                this.hideOrShow(id);
            } 
            element.classList.toggle("selectedDD");
            window.sessionStorage.setItem(element.id.replace("DropDownB", ""), 'true');
        }

    }

    // Hides or show an element
    static hideOrShow(id, mobile) {
        let element = document.getElementById(id);
        let classString;

        if (mobile === true) {
            classString = "hiddenFeatureMob";
        } else if (mobile === false) {
            classString = "hiddenFeatureBig";
        } else {
            classString = "hiddenFeature";
        }

        if (element.classList.contains(classString)) {
            element.classList.remove(classString);
        } else {
            element.classList.add(classString);
        }
    }

    static findAndSetSelectedFromStorage() {
        const allDropDowns = document.querySelectorAll('.dropDownButton');
        allDropDowns.forEach(element => {
            this.setElementSelectedNav(element, element.id.substring(0, element.id.indexOf('DropDownB')));
        });
    }

    // Sets the nav bar button as selected
    static setElementSelectedNav(element, pageName) {
        if (window.sessionStorage.getItem(pageName) === 'true') {
            element.classList.add('selectedDD');
            element.nextElementSibling.classList.remove('hiddenFeature');
        } else {
            element.classList.remove('selectedDD');
            element.nextElementSibling.classList.add('hiddenFeature');
        }
    }
}