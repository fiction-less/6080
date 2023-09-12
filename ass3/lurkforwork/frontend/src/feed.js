
import { hide } from './helpers.js';
import { apiCall } from './main.js';
import { currUserId } from './register_login.js';
import { turnOnpushNotifications, turnOnliveUpdates, updatesIntervalId, intervalId} from './polling.js';
import { updateProfile, getProfileUser } from './profile.js';
import { show } from "./helpers.js";


export var feedsFirstPostID;
const maxPostsPerScroll = 5; // as per the SWAGGER
var reachedEndOfFeed = false;
var startIndex = 0;
var displayPostId = 0; // used to track and id posts
var turnOnLikeButton = []; // tracks accroding to swagger. false = alrdy liked
var postId = [];
var activatedPush = false;
var hasSpinner = false;
var userIds = [];
let numComms = [];
let numLikes = [];
let tempCommentVariable = [];   // used exlucsively for adding comments
                                // and stores an array of variables to use
                                // in make comments
                                // [id, comment]
let addUseCommentELadded = [];
let commentBlock = new bootstrap.Modal(document.getElementById('comment-popup'), {
    keyboard: false
});

export function makeComment(id, comment, userId) {
    // create a comm
    let comm = document.createElement('div')
    comm.classList.add("comments-bg");
    comm.innerText = comment;
    // get the conatiner its in and append it.
    // create new contained
    let userContainer = document.createElement('div');
    populateUserContainer(userContainer, userId);
    let parent = document.getElementById(`newPost${id}`);

    parent.appendChild(userContainer);
    parent.appendChild(comm);

    // removes trigger if it was 0 comms before
    if ((numComms[id] === 0))  {
        if ( document.getElementById(`commentsTrigger${id}`) != null)
             document.getElementById(`commentsTrigger${id}`).remove()
    }
}


const addComment = () => {

     // dont update pass the 5 feed mark bc those self update.

    let id = tempCommentVariable[0];
    console.log(id);
    if (id >= 5) {
    makeComment(tempCommentVariable[0], tempCommentVariable[1], currUserId);

    numComms[id] += 1;
    (numComms[id] === 1) ?
    document.getElementById(`commCounter${id}`).innerText = `${numComms[id]} comment`:
    document.getElementById(`commCounter${id}`).innerText = `${numComms[id]} comments`
    }
    document.getElementById("commment-contents").value = ""

    tempCommentVariable = [];
}

// is triggered when you press the "1 comment" stat and "Be the first to comment" line
const addUserComment = (jobId, id) => {
    if (addUseCommentELadded[id] != true) {
        addUseCommentELadded[id] = true;
        document.getElementById('comment-post-btn').addEventListener('click', () => {
            if (document.getElementById("commment-contents").value == "") return;
            const options = {
                method: "POST",
                path: "/job/comment",
                body: {
                    id: jobId,
                    comment: document.getElementById("commment-contents").value
                }
            };
            tempCommentVariable[0] = id;
            tempCommentVariable[1] = document.getElementById("commment-contents").value

            apiCall(options, addComment);
            commentBlock.hide();

        });
 }

    commentBlock.show();
}

//trigger when
// 1. pressing a notification
// 2. pressing the post handle
// 3. pressing from the likes handle
// 4. pressing from the comments section
export function takeToUserProfile(userId) {
    $("#exampleModalScrollable").modal("hide");
    updateProfile(userId);
    getProfileUser(userId);
    hide("display-feed");
    show("profile-page");
}

export function displayPost(allFeed) {


    console.log(allFeed);

    if (allFeed.length === 0 && startIndex === 0) {
        const noFeed = document.createElement('div');
        noFeed.innerText = "Nothing to see . . . "
        document.getElementById('feed').appendChild(noFeed);
        noFeed.classList.add('text-make-grey');
    }

    for (const feedItem of allFeed) {


        if (displayPostId === 0) feedsFirstPostID = feedItem.id;
        // create new post
        const newPost = document.createElement('div');
        newPost.classList.add("post-border");
        newPost.classList.add("post-padding");

        // name + pfp display

        const posterImageName = document.createElement('div')
        const postOP = document.createElement('div');
        const postUserImg = document.createElement('img');
        posterImageName.appendChild(postUserImg);
        posterImageName.appendChild(postOP);
        posterImageName.classList.add('user-PFP-and-user-flex');
        posterImageName.classList.add('hover-underline');
        posterImageName.setAttribute('id', `postImgName${displayPostId}`);

        // get user name and user image
        postId[displayPostId] = feedItem.id;
        setUserNameFromId(feedItem.creatorId, postOP, postUserImg);

        userIds[displayPostId] = feedItem.creatorId;
        postUserImg.classList.add('user-PFP-size');
        postOP.classList.add('username-size-pos-settings');
        postOP.classList.add('bold');

        //postcreated
        const postCreated = document.createElement('div');
        postCreated.innerText = getTime(feedItem.createdAt);
        postCreated.classList.add('time-text-settings');

        // job title
        const postTitle = document.createElement('div');
        postTitle.innerText = feedItem.title;
        postTitle.classList.add("post-title-text-settings")

        // jobs start time
        const jobStartTime = document.createElement('div');
        jobStartTime.innerText = "START DATE  |  " + (feedItem.start.slice(0, 10));

        // job details
        const postDes = document.createElement('div');
        postDes.innerText = feedItem.description;

        // the number of like on the post and heart icon
        const postLikes = document.createElement('div');
        postLikes.classList.add("likes-icon-and-stat-settings");

        const postLikesChild_Num = document.createElement('span')
        const postLikesChild_Image = document.createElement('img');
        postLikesChild_Image.src = "http://artsadd-design-image.oss-accelerate.aliyuncs.com/B07849722E846C15469EEA6B817E2E58.jpg?x-oss-process=image/resize,w_500,h_500";
        postLikesChild_Image.classList.add("heart-icon-size");
        postLikesChild_Image.setAttribute("id", `hasUserHearted${displayPostId}`);
        postLikesChild_Num.setAttribute("id", `likesCounter${displayPostId}`);

        // number of comments
        var temp;
        const commentsStat = document.createElement('div');
        let numComments = feedItem.comments.length;
        (numComments === 1) ? temp = "comment" : temp = "comments"
        commentsStat.innerText = numComments + " " + temp;
        commentsStat.classList.add("num-of-likes");
        commentsStat.classList.add('hover-underline');
        commentsStat.classList.add('text-make-grey');
        commentsStat.setAttribute("id", `commCounter${displayPostId}`)


        // post likes
        const likesStat = document.createElement('div');
        likesStat.appendChild(postLikesChild_Image);
        likesStat.appendChild(postLikesChild_Num);
        likesStat.classList.add("num-of-likes");
        likesStat.classList.add('hover-underline');
        likesStat.classList.add('text-make-grey')
        likesStat.setAttribute("id", `showLikesCounter${displayPostId}`);


        postLikes.appendChild(likesStat);
        postLikes.appendChild(commentsStat);
        (feedItem.likes.length <= 0) ?
            postLikesChild_Num.innerText = "No likes" :
            postLikesChild_Num.innerText = feedItem.likes.length;

        // preserving the num of likes and num of comments
        numComms[displayPostId] = feedItem.comments.length;
        numLikes[displayPostId] = feedItem.likes.length;

        // check is this user has liked the post.
        if (feedItem.likes.length == 0) turnOnLikeButton[displayPostId] = true;
        else {
            var found = false;
            for (var i = 0; i < feedItem.likes.length; i++) {
                if ((feedItem.likes)[i]['userId'] === currUserId) {
                    found = true;
                    postLikesChild_Image.src = "https://png.pngtree.com/png-vector/20190228/ourmid/pngtree-love-heart-icon-design-template-vector-isolated-png-image_707576.jpg";
                    break
                }
            }
            (found) ? turnOnLikeButton[displayPostId] = false : turnOnLikeButton[displayPostId] = true;
        }



        // adding interactive like + comment button
        const commentLikesBox = document.createElement('div');
        commentLikesBox.classList.add("like-comment-flexbox");
        commentLikesBox.classList.add("interactive-button-settings")

        const likeBtn = document.createElement('div');
        likeBtn.setAttribute("id", `addLike${displayPostId}`)
        const likeBtnImg = document.createElement('img');
        likeBtn.appendChild(likeBtnImg);
        likeBtn.classList.add("like-comment-icons-flexbox");
        likeBtn.classList.add("hand-cursor");
        likeBtnImg.classList.add("like-comment-icons");
        likeBtnImg.src = "images/thumbUp.png"
        commentLikesBox.appendChild(likeBtn);

        const commBtn = document.createElement('div');
        commBtn.setAttribute("id", `addComment${displayPostId}`);
        const commBtnImg = document.createElement('img');
        commBtn.appendChild(commBtnImg);
        commBtn.classList.add("like-comment-icons-flexbox");
        commBtn.classList.add("hand-cursor");
        commBtnImg.classList.add("like-comment-icons");
        commBtnImg.src = "images/comment.png"
        commentLikesBox.appendChild(commBtn);


        newPost.appendChild(posterImageName);
        newPost.appendChild(postCreated);
        newPost.appendChild(postTitle);
        newPost.appendChild(jobStartTime);
        newPost.appendChild(postDes);

        // if theres an image, also appent it.
        if (feedItem.image) {
            const postImage = document.createElement('img');
            postImage.src = feedItem.image;
            newPost.appendChild(postImage);
            postImage.classList.add('job-image-size');
        }
        newPost.appendChild(postLikes);
        newPost.appendChild(commentLikesBox);
        newPost.setAttribute("id", `newPost${displayPostId}`);


        // deletes loading spinner when loaded
        if (hasSpinner) {
            document.getElementById('feed-spinner').remove();
            hasSpinner = false;
        }

        document.getElementById('feed').appendChild(newPost);

        // displays comments + advnet listernes
        createCommentsCollapse(displayPostId, feedItem.comments, newPost);
        addEventLisForUserImgName(displayPostId);
        addEventLisForNumComms(displayPostId);
        addEventLisForLikeCommentBtns(displayPostId);
        addEventLisForLikeNumLikes(displayPostId);

        displayPostId++;

    }
    // gotta wait for the feed to load first
    console.log("start index" + startIndex)
    if (startIndex === 0) turnOnliveUpdates();

    // is the feedlenggh is less than 5(provided value), then weve reached the end.
    // we shoudl also destroy the even tlistener that attempts to keep loading
    // bc there will be non left
    //
    if (allFeed.length < maxPostsPerScroll && startIndex!== 0 && reachedEndOfFeed != true) {

        document.getElementById('feed-spinner').remove();
        reachedEndOfFeed = true;
        const endOfFeed = document.createElement('div');
        endOfFeed.classList.add("text-make-grey");
        endOfFeed.classList.add("centred-text");
        endOfFeed.classList.add("extra-bottom-padding");
        endOfFeed.innerText = 'No more posts to show'
        document.getElementById('feed').appendChild(endOfFeed);
    }
}


const addEventLisForUserImgName = (id) => {
    document.getElementById(`postImgName${displayPostId}`).addEventListener('click', () => {
        takeToUserProfile(userIds[id]);
    })
}

const addEventLisForNumComms = (id) => {
    const commentBox = document.getElementById(`commCounter${displayPostId}`);
    commentBox.addEventListener('click', () => {
        addUserComment(postId[id], id);
    })
}

const addEventLisForLikeNumLikes = (id) => {
    document.getElementById(`showLikesCounter${id}`).addEventListener('click', () => {
        showUsersWhoLiked(postId[id], id);
    })
}

const addEventLisForLikeCommentBtns = (id) => {
    document.getElementById(`addLike${id}`).addEventListener('click', () => {

        const body = {
            "id": postId[id],
            "turnon": turnOnLikeButton[id],
        }

        // if user hastn liked yet, change heart colour and incr like else vice versa
        if (turnOnLikeButton[id]) {
            document.getElementById(`hasUserHearted${id}`).src =
                "https://png.pngtree.com/png-vector/20190228/ourmid/pngtree-love-heart-icon-design-template-vector-isolated-png-image_707576.jpg";
            turnOnLikeButton[id] = false;
            if (id >= 5) {
                numLikes[id] += 1;
                document.getElementById(`likesCounter${id}`).innerText = numLikes[id];
            }
        } else {
            document.getElementById(`hasUserHearted${id}`).src =
                "http://artsadd-design-image.oss-accelerate.aliyuncs.com/B07849722E846C15469EEA6B817E2E58.jpg?x-oss-process=image/resize,w_500,h_500";
            turnOnLikeButton[id] = true;
            if (id >= 5) {
                numLikes[id] -= 1;
                document.getElementById(`likesCounter${id}`).innerText = numLikes[id];
            }
        }


        const options = {
            method: 'PUT',
            body: body,
            path: '/job/like'

        }
        apiCall(options, () => { });
    })
    const commentBox = document.getElementById(`addComment${id}`);
    commentBox.addEventListener('click', () => {
        addUserComment(postId[id], id);
    })

}

window.addEventListener('scroll', () => {
    // note that entire scrollable length = scrollY + innerHeight
    if (((window.scrollY + window.innerHeight + 5 >= document.documentElement.scrollHeight) &&
        !reachedEndOfFeed)) {

        // loading spinner
        if (!hasSpinner) {
            let flexscontainer = document.createElement('div');
            flexscontainer.classList.add("d-flex");
            flexscontainer.classList.add("justify-content-center");
            flexscontainer.setAttribute('id', 'feed-spinner');
            let spinner = document.createElement('div');
            flexscontainer.appendChild(spinner);
            spinner.classList.add('spinner-border')
            spinner.classList.add('text-secondary')
            let spinnerChild = document.createElement('span');
            spinnerChild.classList.add('visually-hidden');
            spinnerChild.innerText = 'Loading...';
            spinner.appendChild(spinnerChild);
            document.getElementById('feed').appendChild(flexscontainer);
            hasSpinner = true;
        }
        // adding feed

        startIndex = startIndex + 5;
        populateFeed(startIndex);
    }
})


// sets the username and user image, bust be a elemnt and image node
export function setUserNameFromId(userId, variable, image) {
    // get user name given user id
    const options = {
        method: "GET",
        path: `/user?userId=${userId}`
    }

    apiCall(options, (data) => {
        variable.innerText = data.name;
        if (image.src) {
            image.src = data.image;
        } else {
            image.src = "images/noPFP.png";
        }
    })

}

const showUsersWhoLiked = (postId, id) => {
    let startIndex = id;
    const options = {
        method: "GET",
        path: `/job/feed?start=${startIndex}`
    }
    apiCall(options, (allFeed) => {
        var usersWholikedName = [];
        var usersWholikedID = [];
        for (const feedItem of allFeed) {
            if (feedItem.id === postId) {

                for (var i = 0; i < feedItem.likes.length; i++) {
                    usersWholikedName.push((feedItem.likes)[i]['userName']);
                    usersWholikedID.push((feedItem.likes)[i]['userId']);
                }
                break;
            }
        }
        if (usersWholikedID.length > 0) {
            $("#exampleModalScrollable").modal("show");
        }

        let modalBody = document.getElementById('likes-modal-body');
        // dont duplicate things
        while (modalBody.firstChild) {
            modalBody.removeChild(modalBody.lastChild);
        }

        // add them to the modal, and also, add event listerners
        // duplicated will be fine since dupe enet listerners are discarded
        for (var i = 0; i < usersWholikedName.length; i++) {
            let userImgAndName = document.createElement('div');
            let name = document.createElement('div');
            let pfp = document.createElement('img');
            pfp.classList.add("user-PFP-size");
            name.innerText = usersWholikedName[i];
            let userId = (usersWholikedID[i]);
            setUserNameFromId(usersWholikedID[i], name, pfp);
            userImgAndName.appendChild(pfp);
            userImgAndName.appendChild(name);
            userImgAndName.classList.add('get-bottom-border');
            userImgAndName.classList.add('user-PFP-and-user-flex');
            userImgAndName.classList.add('username-size-pos-settings');
            userImgAndName.classList.add('hover-underline');
            userImgAndName.addEventListener('click', () => {
                takeToUserProfile(userId);
            })
            // let userImgAndName = commentsAndImageTrigger(usersWholikedID[i]);
            modalBody.appendChild(userImgAndName);
        }
    });

}



//  id = identifier for making elemnt ids.
const createCommentsCollapse = (id, arr, parent) => {

    // create the "kload more comments"
    let collapseTrigger = document.createElement('div');
    collapseTrigger.setAttribute('id', `commentsTrigger${id}`);
    collapseTrigger.setAttribute('data-bs-toggle', 'collapse');
    collapseTrigger.setAttribute('data-bs-target', `#commentsContainer${id}`);

    collapseTrigger.classList.add('text-make-grey');
    collapseTrigger.classList.add('centred-text');
    collapseTrigger.classList.add('hand-cursor');
    if (arr.length > 0) {
        collapseTrigger.innerText = "Load comments";
        collapseTrigger.addEventListener('click', () => {
            (collapseTrigger.innerText === "Load comments") ?
                collapseTrigger.innerText = "Hide comments" :
                collapseTrigger.innerText = "Load comments";
        })
    } else {
        collapseTrigger.innerText = "Be the first to comment";
        collapseTrigger.addEventListener('click', () => {
            addUserComment(postId[id], id);
        })
    }

    // return is no comms
    if (arr.length === 0) {
        parent.appendChild(collapseTrigger);
        return;
    }

    // create the atual commsents that load
    let commentsContainer = document.createElement('div');
    commentsContainer.setAttribute('id', `commentsContainer${id}`);
    commentsContainer.setAttribute('aria-expanded', 'false');
    commentsContainer.setAttribute('class', 'collapse');

    for (let i = 0; i < arr.length; i++) {

        // didsplay the first comm
        if (i === 1 && arr.length !== 1) parent.appendChild(collapseTrigger);

        let userContainer = document.createElement('div');
        let userId = arr[i].userId;
        populateUserContainer(userContainer, userId);

        let comm = document.createElement('div')
        comm.classList.add("comments-bg");
        comm.innerText = arr[i].comment;
        if (i > 0) {
            commentsContainer.appendChild(userContainer);
            commentsContainer.appendChild(comm);
        } else {

            //creating that first comment should be shown and not in the cooalps
            parent.appendChild(userContainer);
            parent.appendChild(comm);
        }
    }
    parent.appendChild(commentsContainer);
}

export function populateUserContainer(userContainer, userId) {
    let userPFP = document.createElement('img');
    userPFP.classList.add('user-PFP-size');
    let username = document.createElement('div');
    userContainer.appendChild(userPFP);
    userContainer.appendChild(username);
    setUserNameFromId(userId, username, userPFP);

    userContainer.classList.add('get-bottom-border');
    userContainer.classList.add('user-PFP-and-user-flex');
    userContainer.classList.add('username-size-pos-settings');
    userContainer.classList.add('hover-underline');
    userContainer.addEventListener('click', () => {
        takeToUserProfile(userId);
    })

}

export function getTime(input) {
    const now = new Date().getTime();
    const newInput = new Date(input).getTime() + (1 * 24 * 60 * 60 * 1000);

    var ret;
    var hrStr;
    var minStr;
    // means not yet past 1 day mark
    if (now < newInput) {
        ret = new Date(now - newInput).toISOString().slice(11, 19);
        let hr = Number(ret.slice(0, 2));
        let min = Number(ret.slice(3, 5));
        if (hr === 0 && min === 0) {
            ret = "Created less than a minute ago";
        } else {
            (hr > 1) ? hrStr = "hours" : hrStr = "hour";
            (min > 1) ? minStr = "minutes" : minStr = "minute";
            if (hr !== 0 && min !== 0) ret = `Created: ${hr}  ${hrStr}, ${min} ${minStr} ago`;
            else if (hr === 0 && min !== 0) ret = `Created: ${min} ${minStr} ago`;
            else if (hr !== 0 && min === 0) ret = `Created: ${hr}  ${hrStr} ago`;
        }

    } else {
        let day = input.substring(8, 10);
        let month = input.substring(5, 7);
        let yr = input.substring(0, 4);
        ret = `Created on: ${day}/${month}/${yr}`;

    }
    return ret;

}

export function clearFeed() {
    reachedEndOfFeed = false;
    startIndex = 0;
    displayPostId = 0; // used to track and id posts
    turnOnLikeButton = []; // tracks accroding to swagger. false = alrdy liked
    postId = [];
    activatedPush = false;
    hasSpinner = false;
    userIds = [];
    numComms = [];
    numLikes = [];
    tempCommentVariable = [];   // used exlucsively for adding comments
                                    // and stores an array of variables to use
                                    // in make comments
                                    // [id, comment]
    addUseCommentELadded = [];
    var temp = document.getElementById('feed');
    while (temp.firstChild) {
        temp.removeChild(temp.lastChild);
    }
    clearInterval(intervalId); // stops the polling
    clearInterval(updatesIntervalId)
}

export function populateFeed(startIndex) {
    if (Notification.permission === "granted" && !activatedPush) turnOnpushNotifications();

    activatedPush = true;
    const options = {
        method: "GET",
        path: `/job/feed?start=${startIndex}`
    }
    apiCall(options, displayPost);


}
