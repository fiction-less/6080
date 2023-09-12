import { apiCall, triggerErrorPopup } from "./main.js";
import { clearFeed, populateFeed } from './feed.js';
import { fileToDataUrl } from './helpers.js';

let jobBlock = new bootstrap.Modal(document.getElementById('post-job-popup'), {
    keyboard: false
});
let jobForm = document.forms.post_job_form;

document.getElementById("post-job-btn").addEventListener('click', () => {
    document.getElementById('title-input').classList.remove("is-invalid");
    document.getElementById('description-input').classList.remove("is-invalid");
    document.getElementById('start-date').classList.remove("is-invalid");
    document.getElementById('job-image-error').classList.add('hide');

	jobBlock.show();
});


document.getElementById('title-input').addEventListener('click', () => {
    document.getElementById('title-input').classList.remove("is-invalid");
    document.getElementById('job-image-error').classList.add('hide');
    $('#title-input').tooltip('disable');
})

document.getElementById('description-input').addEventListener('click', () => {
    document.getElementById('description-input').classList.remove("is-invalid");
    document.getElementById('job-image-error').classList.add('hide');
    $('#description-input').tooltip('disable');
})
document.getElementById('start-date').addEventListener('click', () => {
    document.getElementById('start-date').classList.remove("is-invalid");
    document.getElementById('job-image-error').classList.add('hide');
    $('#start-date').tooltip('disable');
});

document.getElementById('job-image-file').addEventListener('click', () => {
    document.getElementById('job-image-error').classList.add('hide');
})


// checks start date is valid
export function checkDateValid(startDate) {

    const pattern = /(^0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4}$)/;
    if (!pattern.test(startDate)) {
        return false;
    } else {
        const now = new Date();
        // Date reads it in MM/DD/YYYY so rearrange
        var datearray = startDate.split("/");
        const newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
        const date = new Date(newdate);

        var temp = datearray[2];
        if (datearray[2] < 50 ) temp = +datearray[2] + +2000;
        else if (datearray[2] < 100) temp = +datearray[2] + +1900;

        var further_checks = false;
        if (date.getFullYear() == temp &&
            date.getMonth() == (datearray[1] - 1) &&
            date.getDate() == datearray[0]) further_checks = true;

        if (datearray[2] >= 23 && datearray[2] < 50) return (!isNaN(date.getTime()) && further_checks) ?  false :  true;
        else return (!isNaN(date.getTime()) && (date <= now) && further_checks) ? false : true;
    }
}

document.getElementById("job-save-btn").addEventListener('click', () => {
    if (document.getElementById('title-input').value === "") {
        let inputbox = document.getElementById('title-input');
        inputbox.classList.add('is-invalid');
        $('#title-input').tooltip('enable');
    } else if (document.getElementById('description-input').value === "") {
        let inputbox = document.getElementById('description-input');
        inputbox.classList.add('is-invalid');
        $('#description-input').tooltip('enable');
    } else if (!checkDateValid(jobForm.start.value)) {
        let inputbox = document.getElementById('start-date');
        inputbox.classList.add('is-invalid');
        $('#start-date').tooltip('enable');
        // startDiv.append(errorMsg);

    } else if (document.getElementById('job-image-file').value === "") {
        document.getElementById('job-image-error').classList.remove("hide");

    }  else {

        const body = {
            title: jobForm.title.value,
            start: jobForm.start.value,
            description: jobForm.description.value
        };

        const options = {
            method: "POST",
            path: "/job",
            body: body
        };



        try {
            fileToDataUrl(document.getElementById('job-image-file').files[0])
            .then((imgData) => {
                body.image = imgData;
            })
            .then(() => {
                apiCall(options, successPost);
            })
        }
        catch(err) {
            jobBlock.hide();
            triggerErrorPopup(err);
        }
    }
});

function successPost(data) {
    jobBlock.hide();
    jobForm.reset();

    // clearFeed();
    // populateFeed(0);
}


