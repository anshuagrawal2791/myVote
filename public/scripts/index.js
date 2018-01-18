
var home = $('#nav-home');
var signup = $('#nav-signup');
var signup2 = $('#signuptoday');
var login = $('#nav-login');
var index_jumbotron = $('#index-jumbotron');
var login_container = $('#login-container');
var signup_container = $('#signup-container');
var login_form = $('#login-form');
var signup_form = $('#signup-form');

var baseURI = 'http://localhost:8080'; //TODO update this


// user logged in containers
var newPollContainer;
var voteContainer;
var changePassowrdContainer;
var myPollsContainer;
var user = {};
var chartContainer;

// user logged in elements

var newPollButton;
var myPollsButton;
var changePasswordButton;
var logoutButton;








// if logged In
if (localStorage.getItem('token')) {
    $.ajax({
        type: "GET",
        url: '/',
        dataType: 'html',
        beforeSend: function (xhr) {   //Include the bearer token in header
            xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.token);
        }
    }).done(function (response, textStatus, jqXHR) {
        console.log('done background');
        console.log(textStatus);
        console.log(jqXHR.getAllResponseHeaders());
        $('html').prop('innerHTML', response);
        getUserDetails();

    }).fail(function (err) {
        //Error during request
        console.log(err);
        alert(err);
    });
}

// Authenticated User
var getUserDetails = function () {

    

    var helloMessage = $('#nav-hello');
    newPollContainer = $('#new-poll-container');
    voteContainer = $('#vote-container');
    changePassowrdContainer = $('#change-password-container');
    myPollsContainer = $('#my-polls-container');
    chartContainer = $('#chart-container');

    newPollButton = $('#new-poll');
    myPollsButton = $('#my-polls');
    changePasswordButton = $('#nav-settings');
    logoutButton = $('#nav-logout');



    // add functionality to logout button
    logoutButton.unbind().on('click', () => {
        localStorage.clear();
        window.location.href = baseURI;

    });

    newPollButton.unbind().on('click', () => {
        setUpNewPollContainer();
    });

    myPollsButton.unbind().on('click', () => {

        setUpMyPollContainer();
    })

    changePasswordButton.unbind().on('click', () => {
        setUpChangePasswordContainer();
    })



    // Get details of signed in user
    $.ajax({
        type: "GET",
        url: '/auth/user_details',
        dataType: 'html',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.token);
        }
    }).done(function (response) {
        console.log(response);
        user = response;
        helloMessage.html('Hello ' + JSON.parse(response).name);

        if (window.location.href.indexOf('?vote=') == -1) {

            setUpNewPollContainer();
        }
        else {
            var url = window.location.href;
            setUpVotingContainer(url.split('=')[1].replace('#', ''));
        }
    }).fail(function (err) {
        console.log(err);
    });




}


function setUpChangePasswordContainer() {
    hideAllContainers();
    changePassowrdContainer.show();
    var changePasswordForm = $('#change-password-form');
    var currentPassword = $('#current-password');
    var newPassword = $('#new-password');
    var saveChanges = $('#save-changes');

    var filled = true;
    changePasswordForm.off('submit');
    changePasswordForm.on('submit', (e) => {
        e.preventDefault();
        if (newPassword.val() == '' || currentPassword.val() == '')
            alert('Fill all the fields');
        else {
            makeAjaxCall('/auth/user/change_password', 'post', {current_password:currentPassword.val(),new_password:newPassword.val()},(err,resp)=>{
                if(err)
                alert(err.textStatus);
                else{
                    alert(resp);
                    window.location.href = baseURI;
                    setUpNewPollContainer();
                }
            })
        }
    })



}

function setUpMyPollContainer() {
    hideAllContainers();
    myPollsContainer.show();


    var myPollList = $('#my-polls-list');
    myPollList.html('');
    makeAjaxCall('/auth/user/polls', 'get', {}, (err, resp) => {
        if (err) {
            alert(err.statusText);
        } else {
            for (var i = 0; i < resp.length; i++) {
                myPollList.append('<a href="#" class="list-group-item my-polls id="'+resp[i]._id+'"><h4 class="list-group-item-heading">' + resp[i].name + '</h4><p class="list-group-item-text">' + baseURI + '/?vote=' + resp[i]._id + '</p></a>')
            }

            var myPolls = $('.my-polls');
            myPolls.off('click');
            myPolls.on('click',function(e){
                e.preventDefault();
                setUpChartContainer(resp[myPolls.index(this)]._id);
            })


        }
    });


}
function setUpChartContainer(pollId){
    hideAllContainers();
    chartContainer.show();
    makeAjaxCall('/poll', 'post', { poll_id: pollId }, (err, resp)=>{
        if (err) {
            alert(err.statusText);
        } else {
            chartContainer.html('');
            chartContainer.append('<h3>'+resp.name+'</h3><br>')
            chartContainer.append('<canvas id="chart" width="400" height="400"></canvas>');
            plot(resp.options,$('#chart'));
        }
    });

    // real time results through socket connection
    var socket = io.connect(baseURI);
    socket.on('vote',function(resp){
            chartContainer.html('');
            chartContainer.append('<h3>'+resp.name+'</h3><br>')
            chartContainer.append('<canvas id="chart" width="400" height="400"></canvas>');
            plot(resp.options,$('#chart'));
    });
    
}

function plot(data,chart){

    var plotData = {};
    var labels=[];
    var dataPoints=[];
    var backgroundColors=[];
    var borderColors=[];
    for(var i=0;i<data.length;i++){
        var cur = data[i];
        labels.push(cur.option);
        dataPoints.push(cur.score);
        var color = generateRandomColor();
        backgroundColors.push('rgba('+color+',0.2)');
        borderColors.push('rgba('+color+',1)');
    }
    plotData.labels=labels;
    plotData.datasets=[];
    var dataSet = {};
    dataSet.label='# of Votes';
    dataSet.data=dataPoints;
    dataSet.backgroundColor=backgroundColors;
    dataSet.borderColor=borderColors;
    dataSet.borderWidth=1;
    plotData.datasets.push(dataSet);
    var myChart = new Chart($('#chart'), {
        type: 'bar',
        data: plotData,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

function setUpVotingContainer(pollId) {
    hideAllContainers();
    voteContainer.show();
    var voteForm = $('#vote-form');
    var voteQuestion = $('#vote-question');
    var voteOptions = $('#vote-options');
    makeAjaxCall('/poll', 'post', { poll_id: pollId }, (err, resp) => {
        if (err) {
            alert(err.statusText);
        } else {
            voteQuestion.html(resp.name);
            for (var i = 0; i < resp.options.length; i++) {
                var opt = resp.options[i];
                if (i != 0)
                    voteOptions.append('<div type="radio"\><label\><input type="radio" name="optradio" value="' + i + '">' + '   ' + opt.option + '</label></div>');
                else {
                    voteOptions.append('<div type="radio"\><label\><input type="radio" name="optradio" checked="true" value="' + i + '">' + '   ' + '   ' + opt.option + '</label></div>');

                }
            }

            voteForm.submit((e) => {
                e.preventDefault();
                var radioValue = $("#vote-options input[name='optradio']:checked").val();
                makeAjaxCall('/auth/vote', 'post', { poll_id: pollId, option: radioValue }, (err, response) => {
                    if (err) {
                        alert(err.responseText);
                        setUpChartContainer(pollId)
                    }
                    else {
                        alert('Voted!');
                        setUpChartContainer(pollId);
                    }
                })

            });
        }
    })


}


function hideAllContainers() {
    newPollContainer.hide();
    voteContainer.hide();
    changePassowrdContainer.hide();
    myPollsContainer.hide();
    chartContainer.hide();


}
function setUpNewPollContainer() {
    hideAllContainers();
    newPollContainer.show();
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

    more_options.off('click');
    more_options.on('click', function () {
        option_group.append('<input type="text" class="form-control option" placeholder="Option " \>')
        if (checkIfFilledOptions())
            submit.prop('disabled', false);
        else
            submit.prop('disabled', true);
    });

    new_poll_form.off('submit');
    new_poll_form.on('submit',function(e){
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
                    alert("Poll posted successfully at " + baseURI + '/?vote=' + response.poll['_id']);
                    name.val('');
                    $('.option').each(function () {
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
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
            }
        }
    });

    login_form.submit((e) => {
        e.preventDefault();

        $.post('/login', login_form.serialize(), (data) => {
            console.log(data);
            localStorage.setItem('token', data.token);
            window.location.href = baseURI;
        })
    });
    signup_form.submit((e) => {
        e.preventDefault();

        $.post('/signup', signup_form.serialize(), (data) => {
            console.log(data);
            localStorage.clear();
            localStorage.setItem('token', data.token);
            console.log(data.token);
            window.location.href = baseURI;
        })
    });




})
var setSelected = (e) => {
    this.childNodes[0].html('<span class="sr-only">(current)');

}

var makeAjaxCall = (url, method, data2, callback) => {

    $.ajax({
        type: method,
        url: url,
        data: data2,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.token);
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
var generateRandomColor = function(){
    return  (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256));
}



