const storageMode = sessionStorage
var path = window.location.search.replace("?", "") != "" ? window.location.search.replace("?", "") : "/" // path provided after ? in url if != "", else root ("/")

function getLogin() {
	return storageMode.getItem("login")
}

function getToken() {
	return storageMode.getItem("token")
}

function setLogin(login) {
	storageMode.setItem("login", login)
}

function setToken(token) {
	storageMode.setItem("token", token)
}

function unsetLogin() {
	storageMode.removeItem("login")
}

function unsetToken() {
	storageMode.removeItem("token")
}

function isLoggedIn() {
	if (getLogin() != null && getToken() != null) {
		return true // to fix
	}
	return false
}

var testLoginRequest = function () {
	m.request({
        method: "GET",
        url: "./api/session/test",
		params: {
			login: getLogin(),
			token: getToken()
		}
    })
    .then(function(data) {
        if (data.status == "success") {
			return true
		} else {
			return false
		}
	})
}

var loginRequest = function(_login, _password) {
    m.request({
        method: "GET",
        url: "./api/session/login",
		params: {
			login: _login,
			password: _password
		}
    })
    .then(function(data) {
        if (data.status == "success") {
			setLogin(data.login)
			setToken(data.token)
			return true
		} else {
			return false
		}
	})
}

var logoutRequest = function() {
	m.request({
        method: "GET",
        url: "./api/session/logout",
		params: {
			login: getLogin(),
			token: getToken()
		}
    })
    .then(function(data) {
		unsetLogin()
		unsetToken()
    })
}

var lsRequest = function(_path) {
	m.request({
        method: "GET",
        url: "./api/files/ls",
		params: {
			login: getLogin(),
			token: getToken(),
			path: _path
		}
    })
    .then(function(data) {
		if (data.status == "success") {
			return data.directory
		} else {
			return null
		}
    })
}

var Login = {
	oninit: function() {
		if (isLoggedIn()) {
			m.route.set("/app?" + path)
		}
	},
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
						m("button", { "class": "btn btn-secondary", "type": "submit", onclick: function() {
							if (loginRequest(document.getElementById("login-username").value, document.getElementById("login-password").value)) {
								m.route.set("/app?"+path)
							} else {
								windows.alert("Connexion erronée")
							}
						} },
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
		logoutRequest()
	},
	view: function () {
		return m("div", { "class": "container mt-5" }, [
			m("p", "Déconnecté"),
			m("button", {"class": "btn btn-secondary", onclick: function() {
				m.route.set("/login?"+path)
			}}, "Log In")
		])
	}
}

var App = {
	init: function() {
	},
	view: function() {
		return m("table", {"class":"table table-hover"}, 
		m("tbody", 
		)
	  )
	}
}

m.route(document.getElementById("view"), "/login", {
	"/login": Login, // defines `https://localhost/#!/home`
	"/logout": Logout,
	"/app": App
})

// get path window.location.search.replace("?", "")