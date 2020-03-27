const storageMode = sessionStorage
var path = ""

function redirect(_route, _path) {
	if (_path != undefined) {
		SimpleEfficientRouter.setURL(_route + "!" + _path)
	} else {
		SimpleEfficientRouter.setURL(_route)
	}
}

/**
 * Evaluate path and set it in the `path` var
 */
function evaluatePath() {
	split = window.location.hash.split("!")
	path = split.length > 2 ? split.slice(2).join("!") : "/"
}

// use it to evaluate the error and display a message
function errorApp() {
	if (isLoggedInFast()) {
		if (isLoggedIn()) {
			window.alert("Error, probably path")
			path = "/"
			redirect("/app", path)
		} else {
			window.alert("Error, session expired")
			redirect("/logout")
		}
	} else {
		window.alert("Error, you aren't logged in")
		redirect("/login")
	}
}

/**
 * Get the login in internal storage
 */
function getLogin() {
	return storageMode.getItem("login")
}

/**
 * Get the token in internal storage
 */
function getToken() {
	return storageMode.getItem("token")
}

/**
 * Set the login in internal storage
 * @param {string} login 
 */
function setLogin(login) {
	storageMode.setItem("login", login)
}

/**
 * Set the token in internal storage
 * @param {string} token 
 */
function setToken(token) {
	storageMode.setItem("token", token)
}

/**
 * Remove the login in internal storage
 */
function unsetLogin() {
	storageMode.removeItem("login")
}

/**
 * Remove the token in internal storage
 */
function unsetToken() {
	storageMode.removeItem("token")
}

/**
 * Check if the user is well authenticated, using api
 */
function isLoggedIn() {
	if (getLogin() != null && getToken() != null) {
		return true
	}
	return false
}

/**
 * Check if the user is well authenticated, NOT using api
 */
function isLoggedInFast() {
	if (getLogin() != null && getToken() != null) {
		return true // to fix
	}
	return false
}

var testLoginRequest = function () {
	resp = false
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
			resp = true
		}
	})
	return resp
}

/**
 * make a request to api to login, getting the token and (already known) login.
 * @param {string} _login 
 * @param {string} _password 
 */
var loginRequest = function(_login, _password) {
    return m.request({
        method: "GET",
        url: "./api/session/login",
		params: {
			login: document.getElementById("login-username").value,
			password: document.getElementById("login-password").value
		}
    })
    .then(function(data) {
        if (data.status == "success") {
			setLogin(data.login)
			setToken(data.token)
			redirect("/app", path)
		} else {
			window.alert(data.message)
		}
	})
}

/**
 * make a request to api to logout. unset login and token so logout succeed every time
 */
var logoutRequest = function() {
	m.request({
		method: "GET",
        url: "./api/session/logout",
		params: {
			login: getLogin(),
			token: getToken()
		}
    })
	unsetLogin()
	unsetToken()
}


// mithril data
var Data = {
	app: {
		directory: [],
		lsRequest: function() {
			m.request({
				method: "GET",
				url: "./api/files/ls",
				params: {
					login: getLogin(),
					token: getToken(),
					path: path
				}
			})
			.then(function(data) {
				if (data.status == "success") {
					Data.app.directory = data.directory
				} else {
					errorApp()
				}
			})
		}
	}
}

// mithril object for /login route
var Login = {
	oninit: function() {
		if (isLoggedIn()) {
			redirect("/app", path)
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
						m("button", { "class": "btn btn-secondary", "type": "submit", onclick: loginRequest},
							"Log In"
						)
					]
				)
			)
		)
	}
}

// mithril object for /logout route
var Logout = {
	oninit: function() {
		logoutRequest()
	},
	view: function () {
		return m("div", { "class": "container mt-5" }, [
			m("p", "Déconnecté"),
			m("button", {"class": "btn btn-secondary", onclick: function() {
				redirect("/login")
			}}, "Log In")
		])
	}
}

// mithril object for /app route
var App = {
	oninit: function() {
		if (isLoggedInFast()) {
			Data.app.lsRequest()
		} else {
			errorApp()
		}
	},
	view: function() {
		tabRender = []
		Data.app.directory.forEach(function (el) {
			if (el.isDir) {
				tabRender.push(m("tr", {"class": "directory"}, [
					m("th", {"scope": "row"}, el.name),
					m("th", ""),
					m("th", "Actions")
				]))
			}
		});

		Data.app.directory.forEach(function (el) {
			if (!el.isDir) {
				tabRender.push(m("tr", {"class": "file"}, [
					m("th", {"scope": "row"}, el.name),
					m("th", el.size),
					m("th", "Actions")
				]))
			}
		});
		return m("div", {"class": "container"},
			m("table", {"class":"table table-hover"}, 
				m("tbody", tabRender)
			)
		)
	}
}

SimpleEfficientRouter = {
	view: document.getElementById("view"),
	symbol: "#!",
	defaultRoute: "/login",
	routes: {
		"/login": Login,
		"/logout": Logout,
		"/app": App,
	},
	setURL: function(route, path) {
		window.location.hash = SimpleEfficientRouter.symbol + route
	},
	setRoute: function(route) {
		m.mount(view, SimpleEfficientRouter.routes[route])
	},
	match: function(route) {
		var found = false
		Object.keys(SimpleEfficientRouter.routes).forEach(function(val) {
			routeRegexp = new RegExp("(^\\" + val + "$|^\\" + val + "!)")
			if (routeRegexp.test(route)) {
				SimpleEfficientRouter.setRoute(val)
				found = true
				return
			}
		})
		if (!found) {
			if (SimpleEfficientRouter.routes[route] != undefined) {
				SimpleEfficientRouter.setRoute(SimpleEfficientRouter.defaultRoute)
			}
			return false
		}
		return true
	},
	onroutechange: function() {},
	listener: function(e) {
		pathRegexp = new RegExp("^" + SimpleEfficientRouter.symbol)
		if (pathRegexp.test(window.location.hash)) {
			route = window.location.hash.replace(SimpleEfficientRouter.symbol, "")
			SimpleEfficientRouter.onroutechange()
			SimpleEfficientRouter.match(route)
		} else {
			SimpleEfficientRouter.setRoute(SimpleEfficientRouter.defaultRoute)
		}
	},
	init: function() {
		window.addEventListener("hashchange", SimpleEfficientRouter.listener)
		SimpleEfficientRouter.listener()
	}
}

SimpleEfficientRouter.onroutechange = function() {
	evaluatePath()
}
SimpleEfficientRouter.init()