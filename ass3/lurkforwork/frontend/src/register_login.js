import { hide } from './helpers.js';
import { show } from './helpers.js';
import { apiCall } from './main.js';
import { triggerErrorPopup } from './main.js';
import { populateFeed } from './feed.js';
export var currUserId;
import { getCurrUser } from './profile.js';

let regForm = document.forms.register_form;
let loginForm = document.forms.login_form;
/*
Registration form/page:
    User enters valid name, email and password to submit form
    - Names must be between 1 and 30 characters
    - Emails must match the regex format eg. name@domain.com
    - Password must be greater than 0 characters
    - Both passwords must match
    Only then will the submit button be enabled
*/

const isValidName = (name) => {
    return (name.length >= 1 && name.length <= 30);
}

const isValidEmail = (email) => {
    if (email.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) === null) {
        return false;
    }
    return true;
}

const isValidPassword = (password) => {
    return (password.length > 0);
}

const doPasswordsMatch = (password2) => {
    return (regForm.password.value === password2 && password2.length > 0);
}

function checkAllValid() {
    let formInputs = document.getElementsByClassName("reg-form-input");
    for (let i = 0; i < formInputs.length; i++) {
        if (formInputs[i].classList.contains("is-invalid")) {
            e.preventDefault();
            return;
        }
    }

    // doesn't include different passwords input, popup error if mismatched
    enableSubmitButton();
};

function disableSubmitButton() {
    regForm.submit_btn.disabled = true;
}

function enableSubmitButton() {
    regForm.submit_btn.disabled = false;
}

function checkValid(isValid, target) {
    if (isValid(target.value)) {
        target.classList.remove("is-invalid");
        target.classList.add("is-valid");
        checkAllValid();
    } else {
        target.classList.remove("is-valid");
        target.classList.add("is-invalid");
        disableSubmitButton();
    }
}

// updates to validation in real time
regForm.email.addEventListener('keyup', (e) => {
    checkValid(isValidEmail, e.target);
});

regForm.name.addEventListener('keyup', (e) => {
    checkValid(isValidName, e.target);
});

regForm.password.addEventListener('keyup', (e) => {
    checkValid(isValidPassword, e.target);
});

const loggedIn = (data) => {
    currUserId = data.userId;
    localStorage.setItem(`token${currUserId}`, data.token);
    console.log(localStorage);
    console.log(localStorage.getItem(`token${currUserId}`))
    if (localStorage.getItem(data.userId) === null) {
        localStorage.setItem(data.userId, "");
    }
    hide("logged-out");
    show("logged-in");
    populateFeed(0);
    getCurrUser(data.userId);
    hide('logged-out-nav');
    show('logged-in-nav');
    show('display-feed');
}

document.getElementById('reg-submit-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if(!doPasswordsMatch(regForm.confirm_password.value)) {
        e.preventDefault();
        triggerErrorPopup("Error: Passwords do not match!");
        return;
    }
    const userInfo = {
        "email": regForm.email.value,
        "password": regForm.password.value,
        "name": regForm.name.value
    }

    const options = {
        method: 'POST',
        body: userInfo,
        path: '/auth/register'
    }

    apiCall(options, loggedIn, 2);
});

document.getElementById('login-submit-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const userInfo = {
        "email": loginForm.email.value,
        "password": loginForm.password.value
    }

    const options = {
        method: 'POST',
        body: userInfo,
        path: '/auth/login'
    }

    apiCall(options, loggedIn, 2);
});