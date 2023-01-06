/*
    Created by Simone Scionti
*/

export class ISValidator {
    private static obj: ISValidator = null;

    private constructor() { }

    public static getUniqueInstance() {
        if (!ISValidator.obj) ISValidator.obj = new ISValidator();
        return this.obj;
    }

    public isValidEmail(mail: string): string {
        //let regExpMail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/;
        //^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$
        //^[^\W][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+[^\.]@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$
        let regExpMail = /^[^\W][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[^\.]@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/
        var localPart: string = mail.split('@')[0];
        var domainPart: string = mail.substr(localPart.length + 1);
        
        if(localPart.length < 2 || localPart.length > 64) {
            return "The minimum length of local-part of the email address must be 2 and maximum 64 characters.";
        }

        if(domainPart.length > 63) {
            return "The maximum length of domain-part of the email address must be 63 characters.";
        }
        
        if(!mail.match(regExpMail)) {
            return "You have entered an invalid email address."
        }

        return "";
    }


    public isValidSocialNumber(socialNumber: string): boolean {
        try {
            var CodiceFiscale = require("codice-fiscale-js"); //with import CodiceFiscate from "codice-fiscale-js" not works
            return new CodiceFiscale(socialNumber);
        } catch (error) {
            return false;
        }
    }


    //This source code of  vat number validator is avaible on: http://www.icosaedro.it/cf-pi/
    //With Free License and Public domain.
    //Reworked according to our needs.

    private normalizeVATNumber(str: string): string {
        return str.replace(/\s/g, "");
    }

    public isValidVATNumber(vatNumber: string): any {
        vatNumber = this.normalizeVATNumber(vatNumber);

        if (vatNumber.length > 11) {
            vatNumber = vatNumber.substring(0, 11);
        }
        if (vatNumber.length > 0) { //Empty is OK
            if (vatNumber.length !== 11) {
                return { Error: "This VAT Number has an invalid length.", VATNumber: "" };
            }
            if (! /^[0-9]{11}$/.test(vatNumber)) {
                return { Error: "This VAT Number has an invalid characters.", VATNumber: "" };
            }

            var s = 0;
            for (var i = 0; i < 11; i++) {
                var n = vatNumber.charCodeAt(i) - "0".charCodeAt(0);
                if ((i & 1) === 1) {
                    n *= 2;
                    if (n > 9) {
                        n -= 9;
                    }
                }
                s += n;
            }
            if (s % 10 !== 0) {
                return { Error: "This VAT Number has an invalid checksum.", VATNumber: "" };
            }
        }

        return { Error: "", VATNumber: vatNumber };
    }
}