const street = document.getElementById("street");
const suburb = document.getElementById("suburb");
const postcode = document.getElementById("postcode");
const dob = document.getElementById("dob");
const select = document.getElementById("select");
const check = document.getElementsByName('check');
const reset = document.getElementById("reset");
const textbox = document.getElementById("textbox");
const dropdown = document.getElementById("dropdown");
const features = document.getElementById("features");

let street_b = false;
let sub_b = false;
let post_b = false;
let dob_b = false;
let selected = false;

 // check is all 4 boxes selected / unselected
const check_checked = () => {

      num_checks = 0;
      for (var i = 0; i < check.length; i++) {

          if (check[i].checked) num_checks++;
        }
      if(num_checks < 4) {
          selected = false;
          select.innerText = "Select All"
      } else if (num_checks === 4) {
          selected = true;
          select.innerText = "Deselect All"
      }
}

const checkAllInputValid = () => {
    // check for text input areas
    if (street_b === false) {
        textbox.value = "Please input a valid street name";
    } else if (sub_b === false) {
        textbox.value = "Please input a valid suburb";
    } else if (post_b === false) {
        textbox.value = "Please input a valid postcode";
    } else if (dob_b === false) {
        textbox.value = "Please enter a valid date of birth";
    } else if (street_b && suburb && post_b && dob_b) {

        var features_arr = [];

        var vowels = ("aeiouAEIOU");

        var street = age = post = sub = building = pre_build = feature =  "";
        var ele = document.getElementsByTagName("input");

        for (var i = 0; i < ele.length; i++) {
            if (ele[i].id == 'street') {
                street = ele[i].value
            } else if (ele[i].id == 'suburb') {
                sub = ele[i].value;
            } else if (ele[i].id == 'postcode') {
                post = ele[i].value;
            }  else if (ele[i].id == 'dob') {

                const now = new Date();
                nowyear = now.getFullYear();

                var datearray = ele[i].value.split("/");
                const newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
                const inputdate = new Date(newdate);
                const inputyear = inputdate.getFullYear();

                // for years under 100, date parses wrong.  e.g. year 99 = 1999
                //... so hahave to add 1000 to age. month also needs to be checked.
                age = nowyear - inputyear;

                ///e.g.now = 4/3/2023 ,
                //           4/3/2022 = 1 year
                //           5/3/2022 = 0 years
                //           x/>3 /2022 = 0 years (age - 1)

                if (now.getMonth() === inputdate.getMonth()) {
                    if (inputdate.getDate() > now.getDate()) age--;
                } else if (inputdate.getMonth() > now.getMonth()) age--;
                if (datearray[2] < 100) age = age + 1900;

            }
            else if (ele[i].name == 'check' && ele[i].checked) {
                features_arr.push(ele[i].value);
            }

        }

        // assigning strings to variables for the dropdown string
        for (var i = 0; i <  dropdown.options.length; i++) {
            if (dropdown.options[i].selected) {
                building = dropdown.options[i].value;
                (vowels.indexOf(building[0]) !== -1) ? pre_build = "an" : pre_build = 'a';
                break;
            }
        }

        // creating features string
        var num_feat = features_arr.length;
        if (num_feat < 1) {
            feature = "no features";
        } else {
            for (var i = 0; i < num_feat; i++) {

                if ((i + 1) === num_feat) {
                    feature = feature + features_arr[i];
                } else if ((i + 2) === num_feat) {
                    feature = feature + features_arr[i] + " and ";
                } else {
                    feature = feature + features_arr[i] + ", ";
                }
            }
        }
        textbox.value =

        "Your are " + age + " years old, and your address is " +
        street + " St, " + sub + ", " + post + ", Australia. Your building is " +
        pre_build + " " + building + ", and it has " + feature
    }
        value = false;
}


//  Checking for individual vailidty

street.addEventListener("blur", (event) => {

    (street.value.length >= 3 && street.value.length <= 50 &&
     /^[a-zA-Z]+$/.test(street.value)) ? street_b = true : street_b = false;
    checkAllInputValid();

})

// not counting " " as characters
suburb.addEventListener("blur", (event) => {

    (suburb.value.length >= 3 && suburb.value.length <= 50 &&
    /^[a-zA-Z]+$/.test(suburb.value)) ? sub_b = true : sub_b = false;

    checkAllInputValid();
})


postcode.addEventListener("blur", (event) => {
    (postcode.value.length == 4 && /^\d+$/.test(postcode.value)) ? post_b = true : post_b = false;
    checkAllInputValid();
})


dob.addEventListener("blur", (event) => {

    // note that 1/1/1 needs to be written as 01/01/0001
    const pattern = /(^0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4}$)/;
    if (!pattern.test(dob.value)) {
        dob_b = false;
    } else {
        const now = new Date();

        // Date reads it in MM/DD/YYYY so rearrange

        // NTS: date.getimte() doesnt validate date input, only the date object!!
        // all days are 31 days, so 31/feb will oveflow to May... as such, check
        // if output = input.
        var datearray = dob.value.split("/");
        const newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
        const date = new Date(newdate);

        //month is 0-based + use getDATE not getday bc getDAY corresponds to the day of the week
        // and years < 100 is parsed differently . add 1900.
        // < 50 also parsed differently???? bruh moment add 2000
        var temp = datearray[2];
        if (datearray[2] < 50 ) temp = +datearray[2] + +2000;
        else if (datearray[2] < 100) temp = +datearray[2] + +1900;




        var further_checks = false;
        if (date.getFullYear() == temp &&
            date.getMonth() == (datearray[1] - 1) &&
            date.getDate() == datearray[0]) further_checks = true;


        // since < 50 also parsed differently, then date <= now doesnt work
        // for years between 0023 - 0049. ignore that for such cases.
        if (datearray[2] >= 23 && datearray[2] < 50) (!isNaN(date.getTime()) && further_checks) ? dob_b = true : dob_b = false;
        else (!isNaN(date.getTime()) && (date <= now) && further_checks) ? dob_b = true : dob_b = false;


    }
    checkAllInputValid();

})


dropdown.addEventListener("change", (event) => { checkAllInputValid();})

check.forEach(function(check) {
    check.addEventListener("change", (event) => { check_checked(); checkAllInputValid();})
});

select.addEventListener("click", (event) => {

    if (selected) {
        for (var i = 0; i < check.length; i++) {
        check[i].checked = false;
        }
        selected = false;
        select.innerText = "Select All"
    } else {
        for (var i = 0; i < check.length; i++) {
            check[i].checked = true;
        }
        selected = true;
        select.innerText = "Deselect All"
    }
    checkAllInputValid();

});

reset.addEventListener("click", (event) => {
    // reset all inputs
    var ele = document.getElementsByTagName("input");
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].type == 'text') {
            ele[i].value = "";
        } else if (ele[i].type == 'checkbox') {
            ele[i].checked = false;
        }
    }

    textbox.value = "";
    // resert building type
    dropdown.options[0].selected = true;
    // resert select back to unselected
    selected = false;
    street_b = false;
    sub_b = false;
    post_b = false;
    dob_b = false;
    select.innerText = "Select All"

});



