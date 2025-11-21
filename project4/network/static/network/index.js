
document.addEventListener('DOMContentLoaded', function(){
    get_posts('all-posts');
    const prof = document.querySelector('#parent')
    prof.style.display = 'none';
    document.querySelector('#all-posts').addEventListener('click', function(event){
        event.preventDefault();
        get_posts('all-posts');
    });
    document.querySelector('#followings').addEventListener('click', function(event){
        event.preventDefault();
        get_posts('following');
    });
    document.querySelector('#profile').addEventListener('click', function(event){
        event.preventDefault();
        get_posts('profile');
    })
    document.querySelector("#post-form").onsubmit = () => {
        submitpost();
    }

    document.querySelector('#post').addEventListener('click', function(event){
        if(event.target.className === 'profile-link'){
            const username = event.target.dataset.username;
            get_posts('profile', username);
        }
    })
});



let postID = null;
function submitpost(){
    const content = document.querySelector('#form-content').value;
    if (!content.trim()) return;
    console.log(content)

    if (postID){
        console.log("Sending PUT request with content:", content);
        fetch(`/edit/${postID}`,{
             method: 'PUT',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify ({content : content})
        })
        .then(response => response.json())
        .then(() =>{
            console.log("Editing post:", postID, "Content:", content);
            postID = null;
            document.querySelector('#form-content').value = '';
            get_posts('all-posts');
            
        })
        .catch(error => {
            console.log(error)
        });
    } else{
        fetch('/posts', {
            method: 'POST',
            body: JSON.stringify({
                content: document.querySelector('#form-content').value,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            console.log('success')
            if (result.error){
                alert(`error: ${result.error}`);
            } else{
                get_posts('all-posts');
            }
            });
    }
    return false;
}



function get_posts(feed, username = null, page = 1){
    const prof = document.querySelector('#parent');
    prof.style.display = 'none';
    const doc = document.querySelector('#post');
    doc.innerHTML = '';
    const title = document.querySelector('#viewname');
    title.innerHTML = 'All Posts';
    title.className = 'title';
    const postForm = document.querySelector('#post-form')
    const follow = document.querySelector('.button-wrap');
    follow.style.display = 'none';
    const profileElemet = document.querySelector('#profile');
    const user = profileElemet? profileElemet.textContent : null;
    const followers = document.querySelector('#followers');
    const following = document.querySelector('#following');
    const followBtn = document.querySelector('#follow_btn');

   
   
    if (postForm){
        if(`${feed}` === 'all-posts'){
            postForm.style.display = 'block';
            prof.style.display = 'none';
            title.innerHTML = 'All Posts';
        } else{
            prof.style.display = 'none';
            postForm.style.display = 'none';
            if(`${feed}` === 'profile' && username == null){
                title.innerHTML = user;
                prof.style.display = 'block';
                fetch(`/profile/${user}`)
                .then(response => response.json())
                .then(profile => {
                    console.log(profile);
                    console.log('profile and null'); 
                    console.log(`${profile.following}`)
                    followers.textContent = `${profile.followers_count}`;
                    following.textContent = `${profile.followings_count}`;
                })
            }if (`${feed}` === 'profile' && username){
                title.innerHTML = username;
                prof.style.display = 'block';
                follow.style.display = 'flex';
                fetch(`/profile/${username}`)
                .then(response => response.json())
                .then(profile => {
                    if (profile.username == user){
                        follow.style.display = 'none';
                    }
                    console.log(profile);
                    console.log(`profile and ${username}`);
                    console.log(`${profile.followers}`)
                    followers.textContent = `${profile.followers_count}`;
                    following.textContent = `${profile.followings_count}`;
                    if(profile.followers.includes(user)){
                        followBtn.textContent = '  Unfollow';
                        followBtn.className = 'btn btn-sm btn-danger bi bi-person-fill-dash';
                    } else {
                        followBtn.textContent = '  Follow';
                        followBtn.className = 'btn btn-sm btn-primary bi bi-person-fill-add'
                    }
                    followBtn.addEventListener('click', () => {
                        console.log('follow button clicked');
                        fetch(`/follow/${username}`,{
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json'},
                            body: JSON.stringify({})
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if(data.following){
                                followBtn.textContent = '  Unfollow';
                                followBtn.className = 'btn btn-sm btn-danger bi bi-person-fill-dash';
                            }else{
                                followBtn.textContent = '  Follow';
                                followBtn.className = 'btn btn-sm btn-primary bi bi-person-fill-add'
                            }
                            followers.textContent = data.followers_count;
                        })
                    })
                })
            } if(`${feed}` === 'following'){
                title.innerHTML = 'Following';
            }
        }
    }
    

    let url = `/posts/${feed}`;
    if (feed === 'profile' && username){
        url = `/posts/profile/${username}`;
    }
    url += `?page=${page}`;

    fetch (url)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        console.log(data.page)
        const posts = data.posts; 
        posts.forEach((post) => {
            const element = document.createElement('div');
            element.className = 'postbox'
            element.innerHTML = `<strong class="profile-link" data-username="${post.author}"> ${post.author} </strong>`;

            const edit = document.createElement('button');
            edit.className = 'btn btn-link'
            edit.textContent = 'Edit';
            edit.style.padding = '0';
            edit.style.fontSize = '0.9em';
            edit.style.marginTop = '14px';
            edit.style.marginBottom = '0';
            const formatContent = post.content.replace(/\n/g, '<br>');

            const contents = document.createElement('div');
            contents.style.padding = '0';
            contents.innerHTML = `<strong>${formatContent}</strong><br><span class='date'>${post.timestamp}</span>`;

            const likeContainer = document.createElement('div');
            likeContainer.className = 'likediv';
            likeContainer.style.display = 'flex';

            const like = document.createElement('div');
            like.id = 'like';
            like.className = 'bi bi-heart-fill';
            like.style.fontSize = '18px';
            like.style.cursor = 'pointer';

            const counter = document.createElement('div')
            counter.style.marginLeft = '5px';

            fetch(`/like/status/${post.id}`)
            .then(response => response.json())
            .then(data => {
                like.style.color = data.liked? 'red':'#DCDCDC';
                counter.innerHTML = data.likecount;
                console.log(data)
            })
            likeContainer.appendChild(like);
            likeContainer.appendChild(counter);

            like.addEventListener('click', () =>{
                fetch(`/like/${post.id}`,{
                    method:  'POST',
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({})
                })
                .then(res => res.json())
                .then(data => {
                    like.style.color = data.liked? 'red':'#DCDCDC';
                    counter.innerHTML = data.likecount;
                    console.log(data)

                })
            })

            if (`${post.author}` === user){
                element.appendChild(edit);
                element.appendChild(contents);
                element.appendChild(likeContainer);
            } else{
                element.appendChild(contents);
                element.appendChild(likeContainer)
            }
            doc.appendChild(element);
            edit.addEventListener('click', function() {
                document.querySelector("#post-form").style.display = 'block';
                document.querySelector("#post").style.display = 'none';
                document.querySelector('#form-content').value = post.content; 
                postID = post.id;
            })
        });
        const pagination = document.querySelector('#pagination');
        pagination.innerHTML = '';
        pagination.className = 'pagination justify-content-center';

        if(data.has_previous){
            const prvBtn = document.createElement('button');
            prvBtn.textContent = 'Previous';
            prvBtn.className = 'page-link';
            prvBtn.onclick = () => get_posts(feed, username, data.page - 1);
            pagination.appendChild(prvBtn);
        }

        if(data.has_next){
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.className = 'page-link';
            nextBtn.onclick = () => get_posts(feed, username, data.page + 1);
            pagination.appendChild(nextBtn);
        }
    });

    return false;
}