
import { apiCall } from './main.js';
import { takeToUserProfile, feedsFirstPostID, makeComment} from "./feed.js";



/**
 *
 *  LIVE UPDATES
 *
 */

let numCommsMap = new Map();    // ( post ID, num comments) ASSUMES U CANT DELETE COMMS
let firstPostIndex = 0;         // since feed doesnt live update.
export var updatesIntervalId;   // probably better to make an arr of ids to clear


export function turnOnliveUpdates () {
     // sets va firstpostIndex to the correct post.
    const options = {
        method: "GET",
        path: `/job/feed?start=${0}`
    }
    updatesIntervalId = setInterval(setUsersFirstPost, 1000, options, 0, false);
}


// if a user if logged in and 10 new posts are made, those 10 new posts arent
// gonna show for them, so we have to update the ones we can currently see.

const setUsersFirstPost = (options, startIndex, found) => {


    apiCall(options, (first5postsdata) => {
        for (const post of first5postsdata) {

            // weve found the post!! and id
            // console.log(post.id);
            // console.log(first5postsdata);
            if (post.id === feedsFirstPostID) {
                console.log("our first post!!" + firstPostIndex);
                firstPostIndex = startIndex;
                found = true;
                break;
            }
            startIndex +=1;
        }
        // console.log(startIndex)
        // console.log(found)
        if (found === false) {
            const second = {
                method: "GET",
                path: `/job/feed?start=${startIndex}`
            }

            setUsersFirstPost(second, startIndex, found);
        } else {
            updateUpdates();
        }

       return;

    });


}



// check commnets, and add to collapse bar child
// check num of likes and simply updare it- note that
// our own like is auromatic wjile other likes are polled
// have to check using time created bc commnets can be deleted.
// and we dont just want to rebuild the while thing, we want to append the new comment.

const updateUpdates = () => {
    console.log(firstPostIndex);
    const options = {
        method: "GET",
        path: `/job/feed?start=${firstPostIndex}`
    }
    apiCall(options, updateAll);
}

const updateAll = (feed) => {
    updateLikes(feed);
    updateComments(feed);
}

const updateLikes = (allFeed) => {
    let i = 0; // bc feed is static, only update the first 5 from OUT static version
    for (const post of allFeed) {

        let numLikes = (post.likes.length);

        (numLikes === 0) ?
            document.getElementById(`likesCounter${i}`).innerText = "No likes" :
            document.getElementById(`likesCounter${i}`).innerText = numLikes;
        i++;
    }
}


const updateComments = (allFeed) => {
    var i = 0; // bc feed is static, only update the first 5 from OUT static version
    for (const post of allFeed) {

        let newNumComments = (post.comments.length);

        // if cant find then its the beginning of our polling session
        if (numCommsMap.has(post.id)) {
            let prevNumComms = numCommsMap.get(post.id);
            while(prevNumComms < newNumComments ) {
                makeComment(i,
                        JSON.stringify(post.comments[prevNumComms].comment).slice(1, -1),
                        post.comments[prevNumComms].userId);
                prevNumComms ++;
            }

            // CHANGE THe trigger text
            prevNumComms =  numCommsMap.get(post.id);
            if ((prevNumComms === 0) && (prevNumComms < newNumComments)) {
                // means we added a comment so we have to remove this div now
                if (document.getElementById(`commentsTrigger${i}`) != null)
                    document.getElementById(`commentsTrigger${i}`).remove();

            }

            // change num of comments
            (newNumComments === 1) ?
            document.getElementById(`commCounter${i}`).innerText = `${newNumComments} comment`:
            document.getElementById(`commCounter${i}`).innerText = `${newNumComments} comments`;
        }

        numCommsMap.set(post.id, newNumComments);
        i++;
    }
}

/**
 *
 *  PUSH NOTIFS
 *
 */


// for notifs
         // the index we have to go back to to update the new posts.
let numNofifs = 0;
let prevPost = ""

export var intervalId;

export function turnOnpushNotifications()  {
    let arr = [];
    const options = {
        method: "GET",
        path: `/job/feed?start=${0}`
    }
    intervalId =  setInterval(recurseThroughFeed, 1000, 0, options, false, arr, 0); // need to call this everyinterval just incase
    console.log("THIS IS THE INTERVAL ID...FOR NOTIVES  " + intervalId)
}


const recurseThroughFeed = (postStartIndex, options, found, arrayIds, id)  => {

    //console.log(prevPost);


    // if (found) return;
    apiCall(options, (first5postsdata) => {



        if (prevPost == "") prevPost = feedsFirstPostID;
        for (const post of first5postsdata) {
            if (postStartIndex === 0) id = post.id
            if (post.id === prevPost) {
                console.log("found!! ")
                found = true;
                break;
            }
            arrayIds.push(post.creatorId);
            postStartIndex +=1;

        }
        if (found === false) {
            const second = {
                method: "GET",
                path: `/job/feed?start=${postStartIndex}`
            }
            recurseThroughFeed(postStartIndex, second, true, arrayIds, id);
            console.log("back from recursion?" + prevPost)
        } else {
            prevPost = id;
            if(arrayIds.length > 0) populateNotifs(arrayIds);
            arrayIds = [];
        }
        return;
    });
}

// makes a notification out array in reverse order
// array is: " id name time and type"
const populateNotifs = (arr) => {

    const userId = arr[arr.length - 1];
    const options = {
        method: "GET",
        path: `/user?userId=${userId}`,
    }
    apiCall(options, (userData) => {
        // console.log(userId + " " + userData['name']  +  " " +new Date().toISOString())
        new Notification( `${ userData['name']} just posted a new Job!`);
        createNotification(userData['id'], userData['name'], new Date().toISOString(), 'regular');
        arr.pop();
        // console.log(arr.length);
        if (arr.length > 0) populateNotifs(arr);
    })


}


// request the user for permission + starts the polling
const notif = document.getElementById('nav-notifs');
notif.addEventListener('click', () => {
    // only request permission if not already given.
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(data => {
            if (data === "granted") {
                alert("Please ensure youre device + browser settings allow for notifications!\n" +
                        "They do not persist and are only active while YOU are")
                createNotification("","", new Date().toISOString(),'welcome')
                new Notification("Welcome to LurkForWork 🔖 ", {
                    body: "You will now be notified of new posts"
                });
                turnOnpushNotifications();
            }
        } )
    }
})

// iso dates apparently able to sort lexigraphically
const sortISOdates =  (arr) => {
    arr.sort((a, b) => {
        return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
    });
}



// types: welcome + regular
const createNotification = (userId, name, time, type) => {

    numNofifs ++;
    document.getElementById('num-notifs').innerText = numNofifs;
    document.getElementById('nav-notifs').addEventListener('click', () => {
        numNofifs = 0;
        document.getElementById('num-notifs').innerText = " ";
    })

    let notifbox = document.getElementById('add-notifications');
    let noNotifs = document.getElementById('no-notifs');
    noNotifs.classList.add('hide');
    let notif = document.createElement('div');
    let creationTime = document.createElement('div');
    creationTime.innerText = 'From ' + time.slice(0, 10) + ", " + time.slice(11, 19);
    creationTime.classList.add('time-text-settings');
    creationTime.classList.add('small-text-size');
    // removes the empty notifications box state
    if (type === 'regular') notif.innerText = `${name} just posted a new Job!`
    if (type === 'welcome') notif.innerText = ' Welcome to LurkForWork! Congrats on your first big step to getting HIRED! 🎉'
    notif.append(creationTime)
    notif.classList.add('notifs');
    notif.classList.add('highlight-notif');
    notifbox.insertBefore(notif, notifbox.firstChild);

    // takes us to user profile
    notif.addEventListener('click', () => {
        numNofifs = 0;
        document.getElementById('num-notifs').innerText = " ";
        takeToUserProfile(userId);
    })
}

document.getElementById('clear-notifs').addEventListener('click', () => {
    let notifbox = document.getElementById('add-notifications');
    //remove all notifs
    while (notifbox.firstChild) {
        notifbox.removeChild(notifbox.lastChild);
    }
    // unhide the empty notif box placeholder
    let noNotifs = document.getElementById('no-notifs');
    noNotifs.classList.remove('hide');
    document.getElementById('num-notifs').innerText = " ";
    numNofifs = 0;
})


export function clearNotifs() {
    let notifbox = document.getElementById('add-notifications');
    while (notifbox.firstChild) {
        notifbox.removeChild(notifbox.firstChild);
    }
    document.getElementById('num-notifs').innerText = " ";
    document.getElementById('no-notifs').classList.remove('hide');
    numNofifs = 0;

}
