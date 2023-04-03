class ContentTools {

    // Remove all child elements of an element
    static removeChildren(elementId) {
        let element = document.getElementById(elementId);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    
    // Hides or show an element from the nav bar
    static hideOrShowNavBar(element, id) {

        if (element.classList.contains("selectedDD")) {
            this.hideOrShow(id);
            element.classList.toggle("selectedDD");
            window.sessionStorage.setItem(element.id.replace("DropDownB", ""), false);
        } else {
            if (element.nextElementSibling.classList.contains("hiddenFeature")) {
                this.hideOrShow(id);
            } 
            element.classList.toggle("selectedDD");
            window.sessionStorage.setItem(element.id.replace("DropDownB", ""), true);
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

    // Toggle the element as selected
    static toggleSelected(element, selectedString = "selected") {
        let elements = document.getElementsByClassName(selectedString);
        let removed = false;
        for (let i = 0; i < elements.length; i++) {
            if (element == elements[i]) {
                removed = true;
            }
            elements[i].classList.remove(selectedString);
        }
        if (!removed) {
            element.classList.add(selectedString);
        }
    }

    // Get the map of webpages on the website (held in siteMap.js)
    static getWebPagesMap() {
        return siteMap;
    }


    // Create the web page nav bar that's used on each page
    static createMainNavBar() {
        const placeArea = document.getElementById("pageContainer");
        document.body.insertBefore(this.createBurgerMenu(), document.body.firstChild);

        let menu = document.createElement("nav");
        menu.id = "sideBar";
        menu.className = "hiddenFeatureMob";

        menu.appendChild(this.createCloseButton());
        menu.appendChild(this.creatNavBarFromLayout(this.getWebPagesMap()));
        placeArea.insertBefore(menu, placeArea.firstChild);
    }

    // Create the nav bar from the given web page layout
    static creatNavBarFromLayout(webLayout) {
        let menuHolder = document.createElement("ul");
        menuHolder.id = "mainNavBar";
        this.createNavBarButtons(webLayout, menuHolder);
        return menuHolder;
    }

    // Creates the nav bar buttons and adds them to the elementParent
    static createNavBarButtons(webLayoutArray, elementParent) {
        let isExpand = false;

        for (let i = 0; i < webLayoutArray.length; i++) {
            const pageObject = webLayoutArray[i];
            let menuButton = document.createElement("li");
            
            if (pageObject.children == undefined) {
                let buttonContent = document.createElement("div");
                buttonContent.appendChild(this.createDivForIcon());
                buttonContent.appendChild(this.createLinkText(pageObject.name, pageObject.page));
                menuButton.appendChild(buttonContent);
                isExpand = this.setElementSelectedNav(menuButton, pageObject);
            } else {
                isExpand = this.createParentNavButton(menuButton, pageObject);
            }
            elementParent.appendChild(menuButton);
        }
        return isExpand;
    }

    // Deals with the nav bar button that will contain child links
    static createParentNavButton(menuButton, pageObject) {
        let buttonDropdown = document.createElement("div");
        buttonDropdown.className = "dropDownButton";
        buttonDropdown.id = pageObject.name + 'DropDownB';
        buttonDropdown.appendChild(this.createDivForIcon());
        buttonDropdown.appendChild(this.createLinkText(pageObject.name, pageObject.page));
        buttonDropdown.onclick = function() {ContentTools.hideOrShowNavBar(this, (pageObject.name + 'DropDown'));};
        menuButton.appendChild(buttonDropdown);
        let isExpand = this.setElementSelectedNav(buttonDropdown, pageObject);

        let dropDownContent = document.createElement("ul");
        dropDownContent.className = "dropDownContent";
        dropDownContent.id = pageObject.name + 'DropDown';
        this.createNavBarButtons(pageObject.children, dropDownContent);
        if (!isExpand) {
            dropDownContent.classList.add("hiddenFeature");
        } else {
            buttonDropdown.classList.add("selectedDD");
        }
        menuButton.appendChild(dropDownContent);
        return isExpand;
    }

    // Sets the nav bar button as selected
    static setElementSelectedNav(element, pageObject) {
        if (window.location.pathname == pageObject.page) {
            this.toggleSelected(element);
            return true;
        }  else if (window.sessionStorage.getItem(pageObject.name) == "true") {
            return true;
        }
        return false;
    }

    // Creates a link with the given text
    static createLinkText(linkText, link) {
        let linkTag = document.createElement('a');
        if (link.length !== 0) {
            linkTag.href = link;
        }
        linkTag.textContent = linkText;
        // If the link is clicked don't call any parent events unless menu is opened
        linkTag.onclick = function(e) {
            if (window.sessionStorage.getItem(linkText) == "true") {
                e.stopPropagation();
            }
        };
        return linkTag;
    }

    //Create an empty span for placing an icon
    static createDivForIcon() {
        let dropDownIcon = document.createElement('div');
        dropDownIcon.className = 'dropDownIcon';
        return dropDownIcon;
    }

    // Creates the close button used on the mobile menu
    static createCloseButton() {
        let closeButton = document.createElement("div");
        closeButton.id = "closeContainer";
        closeButton.className = "hiddenFeatureBig";
        closeButton.onclick = function(){ContentTools.hideOrShow('sideBar', true);};
        closeButton.innerHTML = "&times;";
        return closeButton;
    }

    // Creates the burger menu when used on mobile
    static createBurgerMenu() {
        let burgerMenu = document.createElement("div");
        burgerMenu.id = "burgerHug";

        let burgerLineHolder = document.createElement("div");
        burgerLineHolder.id = "b_menu";
        burgerLineHolder.className = "hiddenFeatureBig";
        burgerLineHolder.onclick = function(){ContentTools.hideOrShow('sideBar', true);};

        for (let i = 0; i < 3; i++) {
            let burgerLine = document.createElement("div");
            burgerLine.className = "b_men";
            burgerLineHolder.appendChild(burgerLine);
        }

        burgerMenu.appendChild(burgerLineHolder);
        return burgerMenu;
    }

}