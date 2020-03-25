var login, token = undefined

var loginRequest = function() {
    m.request({
        method: "GET",
        url: "http://localhost:8008/api/session/login",
		body: {
			login: document.getElementById("login-username").value,
			password: document.getElementById("login-password").value
		},
        withCredentials: true,
    })
    .then(function(data) {
        console.log(data)
    })
}

var Login = {
	view: function () {
		return m("div", { "class": "container mt-5" },
			m("div", { "id": "formContent" },
				m("form",
					[
						m("div", { "class": "form-group" },
							[
								m("label", { "class": "col-form-label", "for": "inputDefault" },
									"Username"
								),
								m("input", { "class": "form-control", "type": "text", "placeholder": "Username...", "id": "login-username" })
							]
						),
						m("div", { "class": "form-group" },
							[
								m("label", { "class": "col-form-label", "for": "inputDefault" },
									"Password"
								),
								m("input", { "class": "form-control", "type": "password", "placeholder": "Password...", "id": "login-password" })
							]
						),
						m("button", { "class": "btn btn-secondary", "type": "submit" },
							"Log In"
						)
					]
				)
			)
		)
	}
}

var Logout = {
	oninit: function() {
		console.log("init")
	},
	view: function () {
		return m("div", { "class": "container mt-5" }, "Déconnecté")
	}
}

m.route(document.getElementById("view"), "/login", {
	"/login": Login, // defines `https://localhost/#!/home`
	"/logout": Logout
})

// get path window.location.search.replace("?", "")