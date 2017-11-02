var GitHubHandler = function () {

    this.GitHub = require('github-api');

    this.authenticate = function (username, password) {

        var gh = new GitHub({
            username: username,
            password: password
        });

        var me = gh.getUser();

        console.log(me);
    };
};