class PageSummary {

    // Create the nav menu for the given page
    static createNavMenuForPage(idMenuArea = "docMenuArea") {
        const appendArea = document.getElementById(idMenuArea);
        if (appendArea == null) {
            return;
        }
        let useNumbering = appendArea.classList.contains("numbered"); // Add numbering for headers and menu
        let useNumberingMenu = appendArea.classList.contains("numberedMenu"); // Add numbering for menu only

        const pageHeaderTypes = ["H2", "H3", "H4", "H5"];
        const pageHeaders = document.querySelectorAll("h2, h3, h4, h5");
        let numbering = [0, 0, 0, 0];
        let menu = document.createElement("div");
        let lastIndexUpdated = 0;
        let indexToUpdate = 0;

        for (let i = 0; i < pageHeaders.length; i++) {
            indexToUpdate = pageHeaderTypes.indexOf(pageHeaders[i].tagName);
            if (indexToUpdate < lastIndexUpdated) {
                numbering[lastIndexUpdated] = 0;
            }
            numbering[indexToUpdate]++;
            lastIndexUpdated = indexToUpdate;
            
            let numbersWithoutZero = this.removeZerosFromNumbers(numbering);
            menu.appendChild(this.createLinkForHeader(pageHeaders[i], numbersWithoutZero, (useNumberingMenu || useNumbering)));
            pageHeaders[i].textContent = this.createNumberedHeader(pageHeaders[i].textContent, numbersWithoutZero, useNumbering);
        }

        appendArea.appendChild(menu);
    } 

    // Create a link for the header
    static createLinkForHeader(header, numbers, useNumbering) {
        let row = document.createElement("a");
        row.textContent = this.createNumberedHeader(header.textContent, numbers, useNumbering);
        row.classList.add("headerRow" + header.nodeName, "docMenuLink");

        if (header.id == false) {
            header.id = header.textContent.replaceAll(" ", "");
        }
        row.href = "#" + header.id;
        return row;
    }

    // Create a title from the text header and numbered header
    static createNumberedHeader(pageHeader, numbersWithoutZero, useNumbering) {
        return useNumbering ? numbersWithoutZero.join(".") + "." + "\xa0\xa0\xa0" + pageHeader : pageHeader;
    }

    // Remove zero values from the array
    static removeZerosFromNumbers(numbers) {
        return numbers.filter(function(x){return x !== 0;});
    }
}