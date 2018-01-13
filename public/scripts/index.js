// import { setServers } from "dns";

// console.log('home.js is active');

var home = $('#nav-home');
var signup = $('#nav-signup');
var signup2 = $('#signuptoday');
var login = $('#nav-login');
var index_jumbotron = $('#index-jumbotron');
var login_container = $('#login-container');
var signup_container = $('#signup-container');

$(document).ready(function(){
    // home.click(setSelected)
    // signup.click(setSelected)
    // login.click(setSelected)
    login_container.hide();
    signup_container.hide();

    $(".nav-link").on("click", function() {
        $(".nav-link").removeClass("active");
        $(this).addClass("active");
      });

  
    login.on('click',()=>{
        index_jumbotron.hide();
        login_container.show();
        signup_container.hide();
    });

    signup.on('click',()=>{
        index_jumbotron.hide();
        login_container.hide();
        signup_container.show();
    });

    signup2.on('click',()=>{
        index_jumbotron.hide();
        login_container.hide();
        signup_container.show();
    });

    home.on('click',()=>{
        index_jumbotron.show();
        login_container.hide();
        signup_container.hide();
    });
    
})
var setSelected = (e)=>{
    console.log('setSelected called');
    this.childNodes[0].html('<span class="sr-only">(current)');

}