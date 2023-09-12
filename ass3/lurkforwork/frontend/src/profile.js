import { apiCall, triggerErrorPopup } from "./main.js";
import { show, hide, fileToDataUrl } from "./helpers.js";
import { checkDateValid } from "./job.js";

let isUserWatching = false;
let jobPostEL = false;
let userData = {};
let currProfileUserData = {};
const profileForm = document.forms.edit_profile_form;
const editJobForm = document.forms.edit_job_form;
let editProfileBlock = new bootstrap.Modal(document.getElementById('edit-profile-popup'), {
    keyboard: false
  });
let watchBlock = new bootstrap.Modal(document.getElementById('watch-popup'), {
    keyboard: false
});
let editJobBlock = new bootstrap.Modal(document.getElementById('edit-job-popup'), {
    keyboard: false
  });

document.getElementById('edit-start').addEventListener('click', () => {
    document.getElementById('edit-start').classList.remove("is-invalid");
    $('#edit-start').tooltip('disable');
});


// called in loggedIn function to set profile button to display current user's profile
export function getCurrUser(userId) {
    const options = {
        method: "GET",
        path: `/user?userId=${userId}`
    }
    apiCall(options, setCurrUser);
}

export function setCurrUser(data) {
    userData = data;
}

// gets and sets profile that user is currently on
export function getProfileUser(userId) {
    const options = {
        method: "GET",
        path: `/user?userId=${userId}`
    }
    apiCall(options, setProfileUserData);

}

// gets user info from backend and populates profile
export function updateProfile(userId) {
    const options = {
        method: "GET",
        path: `/user?userId=${userId}`
    }
    apiCall(options, populateProfile);
}

export function setProfileUserData(data) {
    currProfileUserData = data;
}

// takes user to their profile via navbar
document.getElementById("nav-profile").addEventListener('click', () => {
    updateProfile(userData.id);
    hide('display-feed');
    show('profile-page')

});

// creates display of watchee item on profile page
const createWatcheeItem = (data) => {
    const feedDom = document.createElement('div');
    feedDom.classList.add("col-sm-3");
    feedDom.classList.add("clickable");

    feedDom.addEventListener('click', () => {
        getProfileUser(data.id);
        updateProfile(data.id);
    });

    const textDom = document.createElement('p');
    feedDom.appendChild(textDom);
    textDom.classList.add("mb-0");
    textDom.innerText = data.name;
    const linebreak = document.createElement("hr");
    const watchers = document.getElementById('profile-watchers');
    watchers.appendChild(feedDom);
    watchers.appendChild(linebreak);
}

// called after edit save button
const editJob = (jobData) => {
    let options = {
        method: "PUT",
        path: "/job"
    };
    let updatedInfo = {};
    updatedInfo.id = jobData.id;
    if (editJobForm.title.value !== "") {
        const newTitle = editJobForm.title.value;
        updatedInfo.title = newTitle;
    }
    if (editJobForm.description.value !== "") {
        const newDesc = editJobForm.description.value;
        updatedInfo.description = newDesc;
    }
    if (editJobForm.start.value !== "") {
        if(!checkDateValid(editJobForm.start.value)) {
            let inputbox = document.getElementById('edit-start');
            inputbox.classList.add('is-invalid');
            $('#edit-start').tooltip('enable');
            return;
        } else {
            const newStart = editJobForm.start.value;
            updatedInfo.start = newStart;
        }
    }


    if (editJobForm.image.value !== "") {
        fileToDataUrl(document.getElementById('new-job-image-file').files[0])
        .then((imgData) => {
            updatedInfo.image = imgData;
        })
        .then(() => {
            options.body = updatedInfo;
            apiCall(options, successUpdateProfile);
            editJobForm.reset();
            editJobBlock.hide();
        })
    } else {
        options.body = updatedInfo;
        apiCall(options, successUpdateProfile);
        editJobForm.reset();
        editJobBlock.hide();
    }
}

// creates job item to display on profile
const createJobItem = (data) => {
    const feedDom = document.createElement('div');
    feedDom.classList.add("row");
    const col = document.createElement('div');
    col.classList.add("col-sm-3");
    col.classList.add("gen-content");
    col.classList.add("d-flex");

    const content = document.createElement('div');
    content.classList.add("job-content");

    const titleDom = document.createElement('p');
    titleDom.classList.add("mb-0");
    titleDom.innerText = data.title;

    const description = document.createElement('p');
    description.classList.add("text-muted");
    description.innerText = data.description;

    const image = document.createElement('img');
    image.src = data.image;
    image.classList.add("job-img");

    const date = document.createElement('p');
    date.innerText = `Job created at: ${data.createdAt}`;

    const start = document.createElement('p');
    start.innerText = `Start date: ${data.start}`;

    const numComments = document.createElement('p');
    numComments.innerText = `Number of comments: ${data.comments.length}`;

    const numLikes = document.createElement('p');
    numLikes.innerText = `Number of likes: ${data.likes.length}`;

    content.appendChild(titleDom);
    content.appendChild(description);
    content.appendChild(date);
    content.appendChild(start);
    content.appendChild(numComments);
    content.appendChild(numLikes);

    // viewing own profile allows editing/deleting of created jobs
    if (data.creatorId === userData.id) {
        const buttonBox = document.createElement('div');
        buttonBox.classList.add("flex-btns");
        content.appendChild(buttonBox);

        const editJobBtn = document.createElement('button');
        editJobBtn.type = "button";
        editJobBtn.classList.add("btn");
        editJobBtn.classList.add("btn-secondary");
        editJobBtn.innerText = "Edit";
        content.appendChild(editJobBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = "button";
        deleteBtn.classList.add("btn");
        deleteBtn.classList.add("btn-danger");
        deleteBtn.innerText = "Delete";
        content.appendChild(deleteBtn);

        buttonBox.appendChild(editJobBtn);
        buttonBox.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', () => {
            const options = {
                method: "DELETE",
                path: "/job",
                body : {
                    id: data.id
                }
            }

            apiCall(options, successUpdateProfile);
        });

        const postJobBtn = document.getElementById("job-edit-save-btn");

        // event listeners for click on edit job btn
        // triggers creation of listener for the post job btn linked to specific job
        editJobBtn.addEventListener('click', () => {
            editJobBlock.show();
            jobPostEL = true;
            // Taken from https://stackoverflow.com/a/51228632
            document.getElementById('edit-start').classList.remove('is-invalid');
            postJobBtn.addEventListener('click', postJobBtn.fn=function subJob() {
                editJob(data);
            }, false);
        }, false);
    }

    const linebreak = document.createElement("hr");

    col.appendChild(image);
    col.appendChild(content);
    feedDom.appendChild(col);

    const jobs = document.getElementById('profile-jobs');
    jobs.appendChild(feedDom);
    jobs.appendChild(linebreak);
}

// populates profile page with user info
const populateProfile = (data) => {
    // start at top of profile
    clearProfile();
    hide('update-profile-btn');
    // add edit button only if user is looking at own profile
    if (data.id === userData.id) {
        show('update-profile-btn');
    } else {
        // show watch button if user visiting another user's profile
        updateWatch(data);
    }
    document.getElementById('profile-id').textContent = `User id: ${data.id}`;
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-email').textContent = data.email;
    document.getElementById('profile-watchers-count').textContent = data.watcheeUserIds.length;
    document.getElementById('profile-jobs-count').textContent = data.jobs.length;

    // image key is in data JSON
    if (data.hasOwnProperty('image')) {
        document.getElementById('profile-image').src = data.image;
    }

    for (const watcheeId of data.watcheeUserIds) {
        const options = {
            method: "GET",
            path: `/user?userId=${watcheeId}`
        }
        apiCall(options, createWatcheeItem);

    }

    for (const jobItem of data.jobs) {
        createJobItem(jobItem);
    }
}

document.getElementById("update-profile-btn").addEventListener('click', () => {
    editProfileBlock.show();
});

// saving updates to profile
document.getElementById("profile-save-btn").addEventListener('click', () => {
    let options = {
        method: "PUT",
        path: "/user"
    };

    let updatedInfo = {};

    if (profileForm.name.value !== "") {
        const newName = profileForm.name.value;
        updatedInfo.name = newName;
        userData.name = newName;
    }
    if (profileForm.email.value !== "") {
        const newEmail = profileForm.email.value;
        updatedInfo.email = newEmail;
        userData.email = newEmail;
    }
    if (profileForm.password.value !== "") {
        const newPass = profileForm.password.value;
        updatedInfo.password = newPass;
        userData.password = newPass;
    }
    if (profileForm.image.value !== "") {
        try {
            fileToDataUrl(document.getElementById('profile-image-file').files[0])
            .then((imgData) => {
                updatedInfo.image = imgData;
            })
            .then(() => {
                options.body = updatedInfo;
                apiCall(options, successUpdateProfile);
                profileForm.reset();
                editProfileBlock.hide();
            })
        }
        catch(err) {
            editProfileBlock.hide();
            triggerErrorPopup(err);
        }
    } else {
        options.body = updatedInfo;
        profileForm.reset();
        apiCall(options, successUpdateProfile);
        editProfileBlock.hide();
    }
});

function successUpdateProfile(data) {
    updateProfile(userData.id);
}

// reset profile before populating
export function clearProfile() {
    // remove event listener from job post button if it exists
    // code taken from https://stackoverflow.com/a/51228632
    if (jobPostEL) {
        const postJobBtn = document.getElementById("job-edit-save-btn");
        postJobBtn.removeEventListener('click', postJobBtn.fn, false);
    }

    document.getElementById("profile-jobs").textContent = "";
    document.getElementById("profile-watchers").textContent = "";
    document.getElementById("profile-watch-box").textContent = "";
    document.getElementById("profile-name").textContent = "Loading name...";
    document.getElementById("profile-email").textContent = "Loading email...";
    document.getElementById("profile-id").textContent = "Loading id...";
    document.getElementById("profile-watchers-count").textContent = "Loading count...";
    document.getElementById("profile-jobs-count").textContent = "Loading count...";
    document.getElementById("profile-image").src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

const addWatcher = (watcherId, watcheeEmail) => {
    // adds watcher if watcher is not already in string array
    if (localStorage.getItem(watcherId).split(" ").indexOf(watcheeEmail) < 0) {
        localStorage.setItem(watcherId, localStorage.getItem(watcherId) + `${watcheeEmail} `);
    }
}

const removeWatcher = (watcherId, watcheeEmail) => {
    localStorage.setItem(watcherId, localStorage.getItem(watcherId).replace(`${watcheeEmail} `, ""));
}

function successWatch(data) {
    // reset watch email after submit
    document.getElementById("watch-email").value = "";
}

function updateWatch(watcherData) {
    const watchBtn = document.createElement('button');
    watchBtn.id = "watch-btn";
    watchBtn.type = "button";
    watchBtn.classList.add("btn");
    watchBtn.classList.add("btn-primary");

    if (watcherData.watcheeUserIds.includes(userData.id)) {
        // user already watches other user
        watchBtn.innerText = "Unwatch this user";
        watchBtn.addEventListener('click', () => {
            watchUnwatchUser(watcherData, false);
        });

    } else {
        // user does not watch other user
        watchBtn.innerText = "Watch this user";
        watchBtn.addEventListener('click', () => {
            watchUnwatchUser(watcherData, true);
        });
    }
    document.getElementById("profile-watch-box").appendChild(watchBtn);
    isUserWatching = !isUserWatching;
}

document.getElementById("watch-email-btn").addEventListener('click', () => {
    watchBlock.show();
});

const successUpdateOtherProfile = (data) => {
    updateProfile(currProfileUserData.id);
}

const watchUnwatchUser = (watcheeData, turnon) => {
    const options = {
        method: "PUT",
        path: "/user/watch",
        body: {
            email: watcheeData.email,
            turnon: turnon
        }
    }
    apiCall(options, successUpdateOtherProfile);
    if (turnon) {
        addWatcher(userData.id, watcheeData.email);
    } else {
        removeWatcher(userData.id, watcheeData.email);
    }
    watchBlock.hide();
}

// api call for watching via email
document.getElementById("watch-submit-btn").addEventListener('click', () => {
    const watcheeEmail = document.getElementById('watch-email').value;
    const options = {
        method: "PUT",
        path: "/user/watch",
        body: {
            email: watcheeEmail,
            turnon: true
        }
    }
    watchBlock.hide();
    apiCall(options, successWatch);
    addWatcher(userData.id, watcheeData.email);
});


