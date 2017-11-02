var GitHubHandler = function () {

    this.octo = null;

    this.callback = function (err, val) {
        console.log(val);
    };

    this.authenticate = function (username, password) {

        this.octo = new Octokat({
            username: username,
            password: password
        });
        console.log(this.octo);

        this.octo.zen.read(function (err, val) {
            console.log(err);
            console.log(val);
        });
    };
};