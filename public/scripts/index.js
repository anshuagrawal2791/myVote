
var home = $('#nav-home');
var signup = $('#nav-signup');
var signup2 = $('#signuptoday');
var login = $('#nav-login');
var index_jumbotron = $('#index-jumbotron');
var login_container = $('#login-container');
var signup_container = $('#signup-container');
var login_form = $('#login-form');
var signup_form = $('#signup-form');

var baseURI = 'http://localhost:8080'; //TODO update baseURI

var newPollContainer = $('#new-poll-container');
var user = {};

// if logged In
if (sessionStorage.getItem('token')) {
    $.ajax({
        type: "GET",
        url: '/',
        dataType: 'html',
        beforeSend: function (xhr) {   //Include the bearer token in header
            xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.token);
        }
    }).done(function (response) {
        $('html').prop('innerHTML', response);
        getUserDetails();

    }).fail(function (err) {
        //Error during request
        console.log(err);
    });
}

// Authenticated User
var getUserDetails = function () {

    var helloMessage = $('#nav-hello');

    var logout = $('#nav-logout');



    // add functionality to logout button
    logout.on('click', () => {
        sessionStorage.clear();
        location.reload();

    });

    // Get details of signed in user
    $.ajax({
        type: "GET",
        url: '/auth/user_details',
        dataType: 'html',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.token);
        }
    }).done(function (response) {
        console.log(response);
        user = response;
        helloMessage.html('Hello ' + JSON.parse(response).name);
        setUpNewPollContainer();
    }).fail(function (err) {
        console.log(err);
    });

    //  enabling and disabling submit button


}
function setUpNewPollContainer() {
    var name = $('#name');
    var option_group = $('.option-group');
    var more_options = $('#more-options');
    var submit = $('#submit');
    var new_poll_form = $('#new-poll-form');

    submit.prop('disabled', true);
    $(new_poll_form).keyup(function () {

        if (checkIfFilledOptions())
            submit.prop('disabled', false);
        else
            submit.prop('disabled', true);
    });

    more_options.on('click', function () {
        option_group.append('<input type="text" class="form-control option" placeholder="Option " \>')
        if (checkIfFilledOptions())
            submit.prop('disabled', false);
        else
            submit.prop('disabled', true);
    });

    new_poll_form.submit((e) => {
        e.preventDefault();

        var name_ = $('#name').val();
        var optionss = [];
        $(".option").each(function () {
            console.log($(this).val());
            optionss.push($(this).val());
        });
        console.log(optionss);
        var data = {};
        data.name = name_;
        data.options = optionss;
        var s = JSON.stringify(data);
        var t = JSON.parse(s);

        console.log(s);
        console.log(t);


        if (optionss.length == $(".option").length) {
            makeAjaxCall('/auth/new_poll', 'POST', { name: name_, options: JSON.stringify(optionss) }, (err, response) => {
                if (err)
                    alert("error");
                else {
                    alert("Poll posted successfully at " + baseURI + '/get_poll/?id=' + response.poll['_id']);
                    name.val('');
                    $('.option').each(function(){
                        $(this).val('');
                    })
                }
            })
        } else {
            alert('Fill all options');
        }
    });
}






$(document).ready(function () {

    login_container.hide();
    signup_container.hide();

    $(".nav-link").on("click", function () {
        $(".nav-link").removeClass("active");
        $(this).addClass("active");
    });


    login.on('click', () => {
        index_jumbotron.hide();
        login_container.show();
        signup_container.hide();


    });

    signup.on('click', () => {
        index_jumbotron.hide();
        login_container.hide();
        signup_container.show();
    });

    signup2.on('click', () => {
        index_jumbotron.hide();
        login_container.hide();
        signup_container.show();
    });

    home.on('click', () => {
        index_jumbotron.show();
        login_container.hide();
        signup_container.hide();
    });

    $.ajaxPrefilter(function (options) {
        if (options.beforeSend) {
            options.beforeSend = function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('token'));
            }
        }
    });

    login_form.submit((e) => {
        e.preventDefault();

        $.post('/login', login_form.serialize(), (data) => {
            console.log(data);
            sessionStorage.setItem('token', data.token);
            location.reload();
        })
    });
    signup_form.submit((e) => {
        e.preventDefault();

        $.post('/signup', signup_form.serialize(), (data) => {
            console.log(data);
            sessionStorage.clear();
            sessionStorage.setItem('token', data.token);
            console.log(data.token);
            location.reload();
        })
    });




})
var setSelected = (e) => {
    console.log('setSelected called');
    this.childNodes[0].html('<span class="sr-only">(current)');

}

var makeAjaxCall = (url, method, data2, callback) => {
    // console.log('data2');
    // console.log(typeof data2);
    $.ajax({
        type: method,
        url: url,
        data: data2,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.token);
        }
    }).done(function (response) {
        callback(null, response);
    }).fail(function (err) {
        callback(err);
    });
}
var checkIfFilledOptions = function () {
    var filled = true;
    $(".option").each(function () {

        if ($(this).val() == '')
            filled = false;
    });
    return (filled && ('#name').valueOf());

}


