
var helloMessage = $('#nav-hello');
console.log('using user.js');
// console.log($.session.get('email'));
console.log(sessionStorage.getItem('token'));
var user={};
var logout = $('#nav-logout');

$(document).ready(()=>{

    $.ajaxPrefilter(function( options ) {
        if (options.beforeSend) { 
           options.beforeSend = function (xhr) { 
               xhr.setRequestHeader('Authorization', 'Bearer '+sessionStorage.getItem('token'));
           }
       }
       });


    logout.on('click',()=>{
        sessionStorage.clear();
        
    })

    $.ajax({
        type: "GET", //GET, POST, PUT
        url: '/auth/user_details', //the url to call     //Data sent to server
        dataType: 'html',
        beforeSend: function (xhr) {   //Include the bearer token in header
            xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.token);
        }
    }).done(function (response) {
        //Response ok. process reuslt
        console.log(response);
        helloMessage.html('Hello '+JSON.parse(response).name);
    }).fail(function (err) {
        //Error during request
        console.log(err);
    });

})