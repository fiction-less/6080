import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { hide, show } from './helpers.js';
import { clearProfile } from './profile.js';
import { clearFeed } from './feed.js';
import { currUserId } from './register_login.js';
import { clearNotifs, clearPoll } from './polling.js';

let errorBlock = new bootstrap.Modal(document.getElementById('error-popup'), {
    keyboard: false
  });

// provides access to backend via api call
// takes in options dict and function called on success
export const apiCall = (options, success) => {

    const params = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (options.method !== "GET") {
        params.body = JSON.stringify(options.body);
      }

      if (localStorage.getItem(`token${currUserId}`)) {
        params.headers.Authorization = `Bearer ${localStorage.getItem(`token${currUserId}`)}`;
      }

      fetch(`http://localhost:${BACKEND_PORT}` + options.path, params)
        .then(res => res.json())
        .then((data) => {
            if (data.error) {
                triggerErrorPopup(data.error);
            } else {
              if (success) success(data);
            }
        })
}

export const triggerErrorPopup = (errorMsg) => {
    // error popup
    document.getElementById("modal-body").innerText = `${errorMsg}!`;
    errorBlock.show();
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
    errorBlock.hide();
});

document.getElementById("nav-register").addEventListener("click", () => {
    show('register-page');
    hide('login-page');
});

document.getElementById("nav-login").addEventListener("click", () => {
    show('login-page');
    hide('register-page');

});

document.getElementById("nav-logout").addEventListener("click", () => {
  show('logged-out');
  show('logged-out-nav')
  hide('logged-in');
  hide('logged-in-nav');
  hide('profile-page')
  clearProfile();
  clearFeed();
  clearNotifs();
  clearPoll();
  localStorage.removeItem(`token${currUserId}`);

});

document.getElementById("nav-feed").addEventListener('click', () => {
  show("display-feed");
  hide("profile-page");
});


document.getElementById('scroll-up-button').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})


